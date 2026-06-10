"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * Persistencia de borradores del cuestionario en BD (multi-dispositivo). El
 * participante se autentica por el token de invitación: no requiere sesión.
 * El borrador es JSON opaco gestionado por el cliente (paso, índice, picks…).
 */

/** Guarda el borrador de progreso asociado a una invitación activa. */
export async function saveDraft(
  token: string,
  draft: Record<string, unknown>,
): Promise<{ ok: boolean }> {
  if (!token) return { ok: false };
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    select: { id: true, status: true },
  });
  if (!invitation || invitation.status === "COMPLETED") return { ok: false };

  await prisma.invitation.update({
    where: { token },
    data: { draft: draft as Prisma.InputJsonValue },
  });
  return { ok: true };
}

/** Descarta el borrador (al completar o al reiniciar desde cero). */
export async function clearDraft(token: string): Promise<{ ok: boolean }> {
  if (!token) return { ok: false };
  await prisma.invitation.updateMany({
    where: { token },
    data: { draft: Prisma.DbNull },
  });
  return { ok: true };
}
