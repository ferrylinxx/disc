import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";

/**
 * Ficha de participante del usuario autenticado para su panel. Cacheada durante
 * el render para que el layout y las páginas compartan una sola consulta.
 */
export const panelParticipant = cache(async (userId: string) => {
  return prisma.participant.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      fullName: true,
      email: true,
      status: true,
      organization: { select: { name: true } },
      team: { select: { name: true } },
      invitations: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { token: true },
      },
      results: {
        orderBy: { computedAt: "desc" },
        take: 1,
        select: { computedAt: true },
      },
    },
  });
});
