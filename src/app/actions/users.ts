"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
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
});

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

  await prisma.user.create({
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
  });
  revalidatePath("/admin", "layout");
  return { ok: true };
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
