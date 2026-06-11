import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Ventana mínima entre escrituras de presencia por usuario (evita writes en exceso). */
const THROTTLE_MS = 30_000;

/**
 * Latido de presencia. El cliente lo invoca periódicamente para registrar la
 * última actividad del usuario autenticado (campo `User.lastSeenAt`). Sirve para
 * mostrar el estado en línea/inactivo en el panel admin. No expone datos: solo
 * responde 204. Si no hay sesión, es un no-op silencioso.
 *
 * POST /api/presence
 */
export async function POST(): Promise<Response> {
  const session = await getSession();
  if (!session) return new Response(null, { status: 204 });

  const threshold = new Date(Date.now() - THROTTLE_MS);
  await prisma.user.updateMany({
    where: {
      id: session.userId,
      OR: [{ lastSeenAt: null }, { lastSeenAt: { lt: threshold } }],
    },
    data: { lastSeenAt: new Date() },
  });

  return new Response(null, { status: 204 });
}
