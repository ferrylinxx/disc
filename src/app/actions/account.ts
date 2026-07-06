"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/dal";
import { deleteSession } from "@/lib/auth/session";
import {
  consumePasswordSetToken,
  createPasswordSetToken,
  hashPassword,
} from "@/lib/auth/password";
import { absoluteUrl, isMailConfigured, sendMail } from "@/lib/email/mailer";
import { passwordResetEmail } from "@/lib/email/templates";

export interface SetPasswordState {
  error?: string;
}

const Schema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, { error: "La contraseña debe tener al menos 8 caracteres." }),
    confirm: z.string().min(1),
  })
  .refine((d) => d.password === d.confirm, {
    error: "Las contraseñas no coinciden.",
    path: ["confirm"],
  });

/**
 * Establece (o cambia) la contraseña de una cuenta a partir de un token de un
 * solo uso enviado por email. Al terminar redirige a /login para iniciar sesión.
 */
export async function setPassword(
  _state: SetPasswordState,
  formData: FormData,
): Promise<SetPasswordState> {
  const parsed = Schema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Revisa los datos.";
    return { error: first };
  }

  const userId = await consumePasswordSetToken(parsed.data.token);
  if (!userId) {
    return {
      error: "El enlace no es válido o ha caducado. Solicita uno nuevo.",
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  redirect("/login?reset=ok");
}

export interface ChangePasswordState {
  error?: string;
  ok?: boolean;
}

const ChangeSchema = z
  .object({
    password: z
      .string()
      .min(8, { error: "La contraseña debe tener al menos 8 caracteres." }),
    confirm: z.string().min(1),
  })
  .refine((d) => d.password === d.confirm, {
    error: "Las contraseñas no coinciden.",
    path: ["confirm"],
  });

/** Cambia la contraseña del usuario autenticado (desde su panel). */
export async function changeOwnPassword(
  _state: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const session = await requireAuth();
  const parsed = ChangeSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }
  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash },
  });
  return { ok: true };
}

export interface RequestResetState {
  error?: string;
  ok?: boolean;
}

const RequestResetSchema = z.object({
  email: z.email({ error: "Introduce un email válido." }).trim().toLowerCase(),
});

/**
 * Autoservicio: envía un enlace de restablecimiento de contraseña al email si
 * existe una cuenta. Respuesta siempre genérica (no revela si el email existe).
 */
export async function requestPasswordReset(
  _state: RequestResetState,
  formData: FormData,
): Promise<RequestResetState> {
  const parsed = RequestResetSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Email no válido." };
  }
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, name: true },
  });
  if (user && isMailConfigured()) {
    try {
      const token = await createPasswordSetToken(user.id);
      const email = passwordResetEmail({
        name: user.name ?? parsed.data.email,
        resetUrl: absoluteUrl(`/restablecer/${token}`),
      });
      await sendMail({
        to: parsed.data.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
    } catch (e) {
      console.error("[requestPasswordReset] envío fallido:", e);
    }
  }
  return { ok: true };
}

export interface UpdateNameState {
  error?: string;
  ok?: boolean;
}

const NameSchema = z.object({
  name: z.string().min(2, { error: "El nombre es demasiado corto." }).trim(),
});

/** Actualiza el nombre del usuario autenticado (y sus fichas de participante). */
export async function updateOwnName(
  _state: UpdateNameState,
  formData: FormData,
): Promise<UpdateNameState> {
  const session = await requireAuth();
  const parsed = NameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa el nombre." };
  }
  await prisma.user.update({
    where: { id: session.userId },
    data: { name: parsed.data.name },
  });
  await prisma.participant.updateMany({
    where: { userId: session.userId },
    data: { fullName: parsed.data.name },
  });
  revalidatePath("/panel");
  return { ok: true };
}

export interface DeleteAccountState {
  error?: string;
}

/**
 * Borra la cuenta del usuario autenticado y todos sus datos de participante
 * (RGPD: derecho de supresión). Requiere confirmación escrita. Protege las
 * cuentas SUPERADMIN. Al terminar cierra sesión y vuelve al inicio.
 */
export async function deleteOwnAccount(
  _state: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const session = await requireAuth();
  if (session.globalRole === "SUPERADMIN") {
    return { error: "Las cuentas de administrador no se pueden eliminar aquí." };
  }
  const confirm = String(formData.get("confirm") ?? "").trim();
  if (confirm !== "ELIMINAR") {
    return { error: "Escribe ELIMINAR para confirmar." };
  }
  // Borra fichas de participante (cascada: resultados, respuestas, invitaciones)
  // y luego la cuenta (cascada: membresías, cuentas OAuth, sesiones).
  await prisma.participant.deleteMany({ where: { userId: session.userId } });
  await prisma.user.delete({ where: { id: session.userId } }).catch(() => {});
  await deleteSession();
  redirect("/");
}
