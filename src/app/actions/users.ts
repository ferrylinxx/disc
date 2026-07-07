"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { absoluteUrl, isMailConfigured, sendMail } from "@/lib/email/mailer";
import { invitationEmail } from "@/lib/email/templates";
import { createPasswordSetToken, hashPassword, randomPassword } from "@/lib/auth/password";
import type { Lang } from "@/lib/i18n/dictionaries";
import type { ActionState } from "./org";

/**
 * Gestión de usuarios para SUPERADMIN: edición de datos básicos, rol global,
 * memberships por organización y borrado. Incluye salvaguardas para que el
 * administrador no se bloquee a sí mismo (no auto-degradarse ni auto-borrarse).
 */

const UpdateSchema = z.object({
  userId: z.string().min(1),
  name: z.string().trim().max(120).optional(),
  globalRole: z.enum(["SUPERADMIN", "USER"]),
});

const DeleteSchema = z.object({ userId: z.string().min(1) });

const MembershipSchema = z.object({
  userId: z.string().min(1),
  organizationId: z.string().min(1),
  role: z.enum(["ADMIN", "FACILITATOR"]),
});

const RemoveMembershipSchema = z.object({ membershipId: z.string().min(1) });

const CreateSchema = z.object({
  email: z.email({ error: "Introduce un email válido." }).trim().toLowerCase(),
  name: z.string().trim().max(120).optional(),
  password: z
    .string()
    .min(8, { error: "La contraseña debe tener al menos 8 caracteres." }),
  globalRole: z.enum(["SUPERADMIN", "USER"]),
  organizationId: z.string().min(1).optional(),
  membershipRole: z.enum(["ADMIN", "FACILITATOR"]).optional(),
  lang: z.enum(["ca", "es"]).optional(),
});

/**
 * Envía (best-effort) el correo de credenciales a un usuario recién creado.
 * Usa la plantilla de invitación en modo "cuenta" (sin onboarding de test).
 */
async function sendNewUserEmail(input: {
  to: string;
  name: string | null;
  userId: string;
  password: string;
  lang: Lang;
}): Promise<boolean> {
  if (!isMailConfigured()) return false;
  try {
    const token = await createPasswordSetToken(input.userId);
    const params = new URLSearchParams({ email: input.to, pw: input.password });
    const email = invitationEmail({
      participantName: input.name ?? input.to,
      accountEmail: input.to,
      password: input.password,
      loginUrl: absoluteUrl(`/login?${params.toString()}`),
      setPasswordUrl: absoluteUrl(`/restablecer/${token}`),
      lang: input.lang,
      account: true,
    });
    await sendMail({
      to: input.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    return true;
  } catch (e) {
    console.error("[sendNewUserEmail] envío fallido:", e);
    return false;
  }
}

/** Crea un usuario con credenciales y, opcionalmente, una membership inicial. */
export async function createUser(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("SUPERADMIN");
  const parsed = CreateSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name") || undefined,
    password: formData.get("password"),
    globalRole: formData.get("globalRole"),
    organizationId: formData.get("organizationId") || undefined,
    membershipRole: formData.get("membershipRole") || undefined,
    lang: formData.get("lang") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }

  const { email, name, password, globalRole, organizationId, membershipRole } =
    parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe un usuario con ese email." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name: name ?? null,
      passwordHash,
      globalRole,
      ...(organizationId && membershipRole
        ? {
            memberships: {
              create: { organizationId, role: membershipRole },
            },
          }
        : {}),
    },
    select: { id: true },
  });

  const emailed = await sendNewUserEmail({
    to: email,
    name: name ?? null,
    userId: user.id,
    password,
    lang: parsed.data.lang ?? "ca",
  });

  revalidatePath("/admin", "layout");
  const message = emailed
    ? "Usuario creado. Le hemos enviado sus credenciales por email."
    : "Usuario creado. Configura el SMTP para enviarle las credenciales por email.";
  return { ok: true, message };
}

/** Edita nombre y rol global de un usuario. */
export async function updateUser(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole("SUPERADMIN");
  const parsed = UpdateSchema.safeParse({
    userId: formData.get("userId"),
    name: formData.get("name") || undefined,
    globalRole: formData.get("globalRole"),
  });
  if (!parsed.success) return { error: "Revisa los datos del usuario." };

  if (
    parsed.data.userId === session.userId &&
    parsed.data.globalRole !== "SUPERADMIN"
  ) {
    return { error: "No puedes quitarte a ti mismo el rol de administrador." };
  }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: {
      name: parsed.data.name ?? null,
      globalRole: parsed.data.globalRole,
    },
  });
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/** Elimina un usuario (no se permite la autoeliminación). */
export async function deleteUser(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole("SUPERADMIN");
  const parsed = DeleteSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) return { error: "Usuario no válido." };

  if (parsed.data.userId === session.userId) {
    return { error: "No puedes eliminar tu propia cuenta." };
  }

  await prisma.user.delete({ where: { id: parsed.data.userId } });
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/** Asigna (o actualiza) el rol de un usuario en una organización. */
export async function addMembership(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("SUPERADMIN");
  const parsed = MembershipSchema.safeParse({
    userId: formData.get("userId"),
    organizationId: formData.get("organizationId"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: "Revisa la asignación." };

  await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: parsed.data.userId,
        organizationId: parsed.data.organizationId,
      },
    },
    update: { role: parsed.data.role },
    create: {
      userId: parsed.data.userId,
      organizationId: parsed.data.organizationId,
      role: parsed.data.role,
    },
  });
  revalidatePath("/admin", "layout");
  return { ok: true };
}

const AddGestorSchema = z.object({
  organizationId: z.string().min(1),
  email: z.email({ error: "Introduce un email válido." }).trim().toLowerCase(),
  name: z.string().trim().max(120).optional(),
  role: z.enum(["ADMIN", "FACILITATOR"]),
});

/**
 * Añade un gestor a una organización directamente por email + rol (sin pasar por
 * la sección Usuarios). Si el email no tiene cuenta, la crea con contraseña
 * temporal y le envía las credenciales; si ya existe, solo asigna/actualiza su
 * rol en la organización.
 */
export async function addOrgGestor(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("SUPERADMIN");
  const parsed = AddGestorSchema.safeParse({
    organizationId: formData.get("organizationId"),
    email: formData.get("email"),
    name: formData.get("name") || undefined,
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos del gestor." };
  }
  const { organizationId, email, name, role } = parsed.data;
  const roleName = role === "ADMIN" ? "Admin cliente" : "Facilitador";

  let user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true },
  });
  let created = false;
  let tempPassword: string | undefined;
  if (!user) {
    tempPassword = randomPassword();
    const passwordHash = await hashPassword(tempPassword);
    user = await prisma.user.create({
      data: { email, name: name ?? null, passwordHash, globalRole: "USER" },
      select: { id: true, name: true },
    });
    created = true;
  } else if (name && !user.name) {
    await prisma.user.update({ where: { id: user.id }, data: { name } });
  }

  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId } },
    update: { role },
    create: { userId: user.id, organizationId, role },
  });

  let emailed = false;
  if (created && tempPassword) {
    emailed = await sendNewUserEmail({
      to: email,
      name: name ?? null,
      userId: user.id,
      password: tempPassword,
      lang: "es",
    });
  }

  revalidatePath(`/admin/organizaciones/${organizationId}`);
  revalidatePath("/admin", "layout");

  if (!created) return { ok: true, message: `Gestor asignado como ${roleName}.` };
  const message = emailed
    ? `Gestor añadido como ${roleName}. Le hemos enviado sus credenciales por email.`
    : `Gestor añadido como ${roleName}. Cuenta creada; copia sus credenciales.`;
  return {
    ok: true,
    message,
    credentials: !emailed && tempPassword ? { email, password: tempPassword } : undefined,
  };
}

/** Quita una membership concreta. */
export async function removeMembership(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("SUPERADMIN");
  const parsed = RemoveMembershipSchema.safeParse({
    membershipId: formData.get("membershipId"),
  });
  if (!parsed.success) return { error: "Asignación no válida." };

  await prisma.membership.delete({ where: { id: parsed.data.membershipId } });
  revalidatePath("/admin", "layout");
  return { ok: true };
}
