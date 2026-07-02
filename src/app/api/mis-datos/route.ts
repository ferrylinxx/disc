import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

/**
 * Exportación de datos personales (RGPD, derecho de acceso). Devuelve en JSON
 * los datos de la cuenta autenticada y sus fichas de participante/resultados.
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return new Response("No autorizado", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      email: true,
      name: true,
      createdAt: true,
      globalRole: true,
      memberships: {
        select: { role: true, organization: { select: { name: true } } },
      },
      participants: {
        select: {
          status: true,
          createdAt: true,
          organization: { select: { name: true } },
          team: { select: { name: true } },
          results: {
            select: {
              profileCode: true,
              eq: true,
              isPureProfile: true,
              computedAt: true,
              primaryDimension: { select: { code: true, name: true } },
              secondaryDimension: { select: { code: true, name: true } },
              scores: {
                select: { dimensionId: true, contextId: true, raw: true, percent: true },
              },
            },
          },
          responseSets: {
            select: {
              startedAt: true,
              submittedAt: true,
              selfPlacement: true,
              reflection: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return new Response("No encontrado", { status: 404 });
  }

  const payload = {
    exportadoEl: new Date().toISOString(),
    aplicacion: "DISC GESEM",
    cuenta: user,
  };
  const json = JSON.stringify(payload, null, 2);

  return new Response(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mis-datos-disc-gesem.json"',
      "Cache-Control": "no-store",
    },
  });
}
