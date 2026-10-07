"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/dal";
import { createSession } from "@/lib/auth/session";
import type { SessionPayload } from "@/lib/auth/jwt";
import { avatarUrl, parseAvatarDataUrl } from "@/lib/avatar";

/**
 * "Mi perfil": cada usuario edita sus propios datos y su foto. Nunca se toca
 * otra cuenta: el id sale siempre de la sesión. Los errores van como códigos y
 * cada pantalla los muestra en su idioma (la consola siempre en castellano).
 */

/** Rehace la cookie con el nombre nuevo, para que la cabecera lo muestre ya. */
async function refreshSessionName(session: SessionPayload, name: string) {
  await createSession({
    userId: session.userId,
    email: session.email,
    name,
    globalRole: session.globalRole,
    memberships: session.memberships ?? [],
  });
}

export interface ProfileValues {
  name: string;
  jobTitle: string;
  phone: string;
}

export interface ProfileState {
  error?: "name" | "jobTitle" | "phone";
  ok?: boolean;
  /** Lo que se envió, para no borrarlo del formulario si hay un error. */
  values?: ProfileValues;
}

const ProfileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  jobTitle: z.string().trim().max(80),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+\d\s().-]*$/),
});

/** Guarda nombre, cargo y teléfono (el nombre también en sus fichas de participante). */
export async function updateOwnProfile(
  _state: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const session = await requireAuth();
  const values: ProfileValues = {
    name: String(formData.get("name") ?? ""),
    jobTitle: String(formData.get("jobTitle") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  };
  const parsed = ProfileSchema.safeParse(values);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return { error: field === "phone" || field === "jobTitle" ? field : "name", values };
  }
  const { name, jobTitle, phone } = parsed.data;
  await prisma.user.update({
    where: { id: session.userId },
    data: { name, jobTitle: jobTitle || null, phone: phone || null },
  });
  await prisma.participant.updateMany({
    where: { userId: session.userId },
    data: { fullName: name },
  });
  if (name !== session.name) await refreshSessionName(session, name);
  revalidatePath("/", "layout");
  return { ok: true };
}

export interface AvatarResult {
  ok: boolean;
  image?: string | null;
  error?: "invalid" | "too-big";
}

/** Sube (o sustituye) la foto de perfil: un data URL ya recortado en el navegador. */
export async function uploadOwnAvatar(dataUrl: string): Promise<AvatarResult> {
  const session = await requireAuth();
  const parsed = parseAvatarDataUrl(dataUrl);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const image = avatarUrl(session.userId);
  await prisma.$transaction([
    prisma.userAvatar.upsert({
      where: { userId: session.userId },
      create: { userId: session.userId, data: parsed.data, mimeType: parsed.mimeType },
      update: { data: parsed.data, mimeType: parsed.mimeType },
    }),
    prisma.user.update({ where: { id: session.userId }, data: { image } }),
  ]);
  revalidatePath("/", "layout");
  return { ok: true, image };
}

/** Quita la foto: vuelven las iniciales. */
export async function removeOwnAvatar(): Promise<AvatarResult> {
  const session = await requireAuth();
  await prisma.$transaction([
    prisma.userAvatar.deleteMany({ where: { userId: session.userId } }),
    prisma.user.update({ where: { id: session.userId }, data: { image: null } }),
  ]);
  revalidatePath("/", "layout");
  return { ok: true, image: null };
}
