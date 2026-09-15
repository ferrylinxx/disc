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
import { getLang } from "@/lib/i18n/server";
import { getDict, type Dict } from "@/lib/i18n/dictionaries";

/** Textos de error en el idioma del selector (el participante los ve). */
async function authTexts(): Promise<Dict["auth"]> {
  return getDict(await getLang()).auth;
}

/** Traduce el primer fallo de validación de contraseña a un mensaje legible. */
function passwordIssue(issues: z.core.$ZodIssue[], t: Dict["auth"]): string {
  const first = issues[0];
  if (!first) return t.errCheckData;
  if (first.path[0] === "password") return t.errPasswordMin;
  if (first.path[0] === "confirm") return t.errPasswordsMismatch;
  return t.errCheckData;
}

export interface SetPasswordState {
  error?: string;
}

const Schema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8),
    confirm: z.string().min(1),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"] });

/**
 * Establece (o cambia) la contraseña de una cuenta a partir de un token de un
 * solo uso enviado por email. Al terminar redirige a /login para iniciar sesión.
 */
export async function setPassword(
  _state: SetPasswordState,
  formData: FormData,
): Promise<SetPasswordState> {
  const t = await authTexts();
  const parsed = Schema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: passwordIssue(parsed.error.issues, t) };
  }

  const userId = await consumePasswordSetToken(parsed.data.token);
  if (!userId) {
    return { error: t.errLinkInvalid };
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
    password: z.string().min(8),
    confirm: z.string().min(1),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"] });

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
    return { error: passwordIssue(parsed.error.issues, await authTexts()) };
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
  email: z.email().trim().toLowerCase(),
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
    return { error: (await authTexts()).errInvalidEmail };
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
  name: z.string().trim().min(2),
});

/** Actualiza el nombre del usuario autenticado (y sus fichas de participante). */
export async function updateOwnName(
  _state: UpdateNameState,
  formData: FormData,
): Promise<UpdateNameState> {
  const session = await requireAuth();
  const parsed = NameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: (await authTexts()).errNameShort };
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
    return { error: (await authTexts()).errAdminDelete };
  }
  const confirm = String(formData.get("confirm") ?? "").trim();
  if (confirm !== "ELIMINAR") {
    return { error: (await authTexts()).errConfirmDelete };
  }
  // Borra fichas de participante (cascada: resultados, respuestas, invitaciones)
  // y luego la cuenta (cascada: membresías, cuentas OAuth, sesiones).
  await prisma.participant.deleteMany({ where: { userId: session.userId } });
  await prisma.user.delete({ where: { id: session.userId } }).catch(() => {});
  await deleteSession();
  redirect("/");
}
