import "server-only";
import { prisma } from "@/lib/db";
import type { ResponseQuality, ScoringResult } from "@/lib/engine/types";
import { classifyIntensity, proportionalShares } from "@/lib/engine/scoring";
import { getActiveInstrument } from "@/lib/instruments";
import { computeTeamInsights } from "@/lib/analytics/team";
import type { TeamParticipantResult } from "@/lib/analytics/team";

/**
 * Consultas de lectura para los paneles por rol. Cada función recibe el
 * conjunto de organizaciones autorizadas (resuelto en el RSC desde la sesión),
 * de modo que el aislamiento multi-tenant se aplica cerca del dato.
 */

/** Todos los IDs de organización (para SUPERADMIN, que no tiene membership). */
export async function allOrganizationIds(): Promise<string[]> {
  const orgs = await prisma.organization.findMany({ select: { id: true } });
  return orgs.map((o) => o.id);
}

/** KPIs globales + actividad + listado de organizaciones (panel SUPERADMIN). */
export async function adminOverview() {
  const [
    orgCount,
    userCount,
    participantCount,
    resultCount,
    organizations,
    participantGroups,
    invitationGroups,
    completedByOrg,
    profileGroups,
    dimensions,
    eqAgg,
    recentResults,
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.participant.count(),
    prisma.result.count(),
    prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        _count: {
          select: { projects: true, participants: true, members: true },
        },
      },
    }),
    prisma.participant.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.invitation.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.participant.groupBy({
      by: ["organizationId"],
      where: { status: "COMPLETED" },
      _count: { _all: true },
    }),
    prisma.result.groupBy({
      by: ["primaryDimensionId"],
      _count: { _all: true },
    }),
    prisma.dimension.findMany({ select: { id: true, code: true } }),
    prisma.result.aggregate({ _avg: { eq: true } }),
    prisma.result.findMany({
      orderBy: { computedAt: "desc" },
      take: 6,
      select: {
        id: true,
        eq: true,
        profileCode: true,
        computedAt: true,
        primaryDimension: { select: { code: true } },
        participant: {
          select: { fullName: true, organization: { select: { name: true } } },
        },
      },
    }),
  ]);

  const statusOf = (s: string) =>
    participantGroups.find((g) => g.status === s)?._count._all ?? 0;
  const participantStatus = {
    invited: statusOf("INVITED"),
    inProgress: statusOf("IN_PROGRESS"),
    completed: statusOf("COMPLETED"),
  };

  const inviteOf = (s: string) =>
    invitationGroups.find((g) => g.status === s)?._count._all ?? 0;
  const invitationStatus = {
    pending: inviteOf("PENDING"),
    sent: inviteOf("SENT"),
    opened: inviteOf("OPENED"),
    completed: inviteOf("COMPLETED"),
    expired: inviteOf("EXPIRED"),
  };

  const completedMap = new Map(
    completedByOrg.map((g) => [g.organizationId, g._count._all]),
  );
  const orgs = organizations.map((o) => ({
    ...o,
    completed: completedMap.get(o.id) ?? 0,
  }));

  const codeById = new Map(dimensions.map((d) => [d.id, d.code]));
  const distMap = new Map<string, number>();
  for (const g of profileGroups) {
    const code = codeById.get(g.primaryDimensionId) ?? "?";
    distMap.set(code, (distMap.get(code) ?? 0) + g._count._all);
  }
  const profileDistribution = [...distMap.entries()].map(([code, count]) => ({
    code,
    count,
  }));

  const recent = recentResults.map((r) => ({
    id: r.id,
    fullName: r.participant.fullName,
    orgName: r.participant.organization.name,
    profileCode: r.profileCode,
    primary: r.primaryDimension.code,
    eq: r.eq,
    computedAt: r.computedAt,
  }));

  const completionRate =
    participantCount > 0
      ? Math.round((participantStatus.completed / participantCount) * 100)
      : 0;

  return {
    orgCount,
    userCount,
    participantCount,
    resultCount,
    organizations: orgs,
    participantStatus,
    invitationStatus,
    profileDistribution,
    eqAverage: Math.round(eqAgg._avg.eq ?? 0),
    completionRate,
    recent,
  };
}

export type AdminOverview = Awaited<ReturnType<typeof adminOverview>>;

/** Lista de usuarios con sus roles, memberships y opciones de organización. */
export async function adminUsers() {
  const [users, organizations] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        globalRole: true,
        createdAt: true,
        _count: { select: { participants: true } },
        memberships: {
          select: {
            id: true,
            role: true,
            organization: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.organization.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return {
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      globalRole: u.globalRole,
      createdAt: u.createdAt,
      participantCount: u._count.participants,
      memberships: u.memberships.map((m) => ({
        id: m.id,
        role: m.role,
        organizationId: m.organization.id,
        organizationName: m.organization.name,
      })),
    })),
    organizations,
  };
}

export type AdminUsers = Awaited<ReturnType<typeof adminUsers>>;
export type AdminUser = AdminUsers["users"][number];

/** Proyectos, equipos y participantes de las organizaciones del cliente. */
export async function clientOverview(organizationIds: string[]) {
  if (organizationIds.length === 0) {
    return { organizations: [], totals: { projects: 0, participants: 0, completed: 0 } };
  }

  const organizations = await prisma.organization.findMany({
    where: { id: { in: organizationIds } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      projects: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          teams: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              name: true,
              _count: { select: { participants: true } },
            },
          },
        },
      },
      _count: { select: { participants: true } },
    },
  });

  const completed = await prisma.participant.count({
    where: { organizationId: { in: organizationIds }, status: "COMPLETED" },
  });
  const participants = organizations.reduce(
    (acc, o) => acc + o._count.participants,
    0,
  );
  const projects = organizations.reduce((acc, o) => acc + o.projects.length, 0);

  return { organizations, totals: { projects, participants, completed } };
}

export type ClientOverview = Awaited<ReturnType<typeof clientOverview>>;

/**
 * Participantes de las organizaciones (panel Cliente): incluye su último
 * resultado (perfil/EQ) y la invitación pendiente si aún no han completado.
 */
export async function orgParticipants(organizationIds: string[]) {
  if (organizationIds.length === 0) return [];
  const rows = await prisma.participant.findMany({
    where: { organizationId: { in: organizationIds } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      fullName: true,
      email: true,
      status: true,
      organizationId: true,
      team: { select: { name: true } },
      results: {
        orderBy: { computedAt: "desc" },
        take: 1,
        select: {
          eq: true,
          profileCode: true,
          primaryDimension: { select: { code: true } },
        },
      },
      invitations: {
        where: { status: { in: ["PENDING", "SENT", "OPENED"] } },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { token: true },
      },
    },
  });
  return rows.map((p) => ({
    id: p.id,
    fullName: p.fullName,
    email: p.email,
    status: p.status,
    organizationId: p.organizationId,
    teamName: p.team?.name ?? null,
    result: p.results[0]
      ? {
          eq: p.results[0].eq,
          profileCode: p.results[0].profileCode,
          primary: p.results[0].primaryDimension.code,
        }
      : null,
    inviteToken: p.invitations[0]?.token ?? null,
  }));
}

export type OrgParticipant = Awaited<ReturnType<typeof orgParticipants>>[number];

/** Seguimiento de cumplimentación por participante (panel FACILITATOR). */
export async function facilitatorOverview(organizationIds: string[]) {
  if (organizationIds.length === 0) {
    return {
      participants: [],
      counts: { invited: 0, inProgress: 0, completed: 0, total: 0 },
    };
  }

  const participants = await prisma.participant.findMany({
    where: { organizationId: { in: organizationIds } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      fullName: true,
      email: true,
      status: true,
      createdAt: true,
      team: { select: { id: true, name: true } },
      organization: { select: { id: true, name: true } },
      invitations: {
        where: { status: { in: ["PENDING", "SENT", "OPENED"] } },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { token: true, expiresAt: true },
      },
    },
  });

  const counts = {
    invited: participants.filter((p) => p.status === "INVITED").length,
    inProgress: participants.filter((p) => p.status === "IN_PROGRESS").length,
    completed: participants.filter((p) => p.status === "COMPLETED").length,
    total: participants.length,
  };

  return { participants, counts };
}

export type FacilitatorOverview = Awaited<ReturnType<typeof facilitatorOverview>>;

/**
 * Mapa de equipo: participantes con su último resultado + agregados del equipo
 * (medias por dimensión, distribución de perfiles, EQ medio). Devuelve null si
 * el equipo no pertenece a las organizaciones autorizadas.
 */
export async function teamMap(teamId: string, organizationIds: string[]) {
  if (organizationIds.length === 0) return null;

  const team = await prisma.team.findFirst({
    where: { id: teamId, project: { organizationId: { in: organizationIds } } },
    select: {
      id: true,
      name: true,
      project: { select: { id: true, name: true } },
      participants: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          fullName: true,
          email: true,
          status: true,
          results: {
            orderBy: { computedAt: "desc" },
            take: 1,
            select: {
              eq: true,
              profileCode: true,
              isPureProfile: true,
              primaryDimension: { select: { code: true } },
              secondaryDimension: { select: { code: true } },
              scores: {
                select: {
                  percent: true,
                  raw: true,
                  dimension: { select: { code: true } },
                  context: { select: { code: true } },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!team) return null;

  const participants = team.participants.map((p) => {
    const r = p.results[0];
    let result: TeamParticipantResult | null = null;
    if (r) {
      const global = r.scores
        .filter((s) => !s.context)
        .map((s) => ({ dimensionCode: s.dimension.code, raw: s.raw, percent: s.percent }));
      const byContext: TeamParticipantResult["byContext"] = {};
      for (const s of r.scores) {
        if (!s.context) continue;
        (byContext[s.context.code] ??= []).push({
          dimensionCode: s.dimension.code,
          percent: s.percent,
        });
      }
      result = {
        eq: r.eq,
        profileCode: r.profileCode,
        isEq: r.profileCode === "EQ",
        primary: r.primaryDimension.code,
        global,
        byContext,
      };
    }
    return {
      id: p.id,
      fullName: p.fullName,
      email: p.email,
      status: p.status,
      hasResult: result !== null,
      result,
    };
  });

  const def = getActiveInstrument();
  const dims = [...def.dimensions].sort((a, b) => a.order - b.order);
  const insights = computeTeamInsights(dims, def.contexts, participants);

  // Medias por dimensión (% ipsativo) para el gráfico de barras del equipo.
  const sums = new Map<string, { sum: number; n: number }>();
  for (const p of participants) {
    if (!p.result) continue;
    for (const s of p.result.global) {
      const acc = sums.get(s.dimensionCode) ?? { sum: 0, n: 0 };
      acc.sum += s.percent;
      acc.n += 1;
      sums.set(s.dimensionCode, acc);
    }
  }
  const averages = dims.map((d) => {
    const acc = sums.get(d.code);
    return {
      dimensionCode: d.code,
      raw: 0,
      percent: acc && acc.n > 0 ? Math.round(acc.sum / acc.n) : 0,
    };
  });

  // Distribución de perfiles por dimensión primaria (compatibilidad).
  const dist = new Map<string, number>();
  for (const p of participants) {
    if (!p.result) continue;
    dist.set(p.result.primary, (dist.get(p.result.primary) ?? 0) + 1);
  }
  const profileDistribution = [...dist.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);

  return {
    team: { id: team.id, name: team.name, projectName: team.project.name },
    totals: { total: participants.length, completed: insights.overview.completed },
    participants,
    averages,
    profileDistribution,
    eqAverage: insights.overview.eqAverage,
    insights,
  };
}

export type TeamMapData = NonNullable<Awaited<ReturnType<typeof teamMap>>>;

export type TeamMap = NonNullable<Awaited<ReturnType<typeof teamMap>>>;

/**
 * Reconstruye el ScoringResult completo del último resultado de un participante
 * desde lo persistido (scores global + por contexto, EQ, perfil, calidad).
 * Devuelve null si el participante no pertenece a las organizaciones
 * autorizadas; `result` es null si aún no ha completado la evaluación.
 */
export async function participantReport(
  participantId: string,
  organizationIds: string[],
) {
  if (organizationIds.length === 0) return null;
  const participant = await prisma.participant.findFirst({
    where: { id: participantId, organizationId: { in: organizationIds } },
    select: {
      id: true,
      fullName: true,
      email: true,
      status: true,
      results: {
        orderBy: { computedAt: "desc" },
        take: 1,
        select: {
          eq: true,
          profileCode: true,
          isPureProfile: true,
          quality: true,
          computedAt: true,
          primaryDimension: { select: { code: true } },
          secondaryDimension: { select: { code: true } },
          scores: {
            select: {
              raw: true,
              percent: true,
              dimension: { select: { code: true } },
              context: { select: { code: true } },
            },
          },
        },
      },
    },
  });
  if (!participant) return null;

  const meta = {
    id: participant.id,
    fullName: participant.fullName,
    email: participant.email,
    status: participant.status,
  };
  const r = participant.results[0];
  if (!r) return { participant: meta, result: null };

  const global = r.scores
    .filter((s) => !s.context)
    .map((s) => ({ dimensionCode: s.dimension.code, raw: s.raw, percent: s.percent }));
  const byContext: ScoringResult["byContext"] = {};
  for (const s of r.scores) {
    if (!s.context) continue;
    (byContext[s.context.code] ??= []).push({
      dimensionCode: s.dimension.code,
      raw: s.raw,
      percent: s.percent,
    });
  }

  // Reconstruye los campos derivados (intensidad, EQ, reparto proporcional) a
  // partir de las puntuaciones crudas persistidas y la config del instrumento.
  const cfg = getActiveInstrument().scoring;
  const isEq = r.profileCode === "EQ";
  const rawOf = (code: string) =>
    global.find((s) => s.dimensionCode === code)?.raw ?? 0;
  const intensity = isEq
    ? null
    : classifyIntensity(
        rawOf(r.primaryDimension.code) - rawOf(r.secondaryDimension.code),
        cfg.intensity,
      );

  const result: ScoringResult = {
    global,
    percentages: proportionalShares(global),
    byContext,
    primaryDimension: r.primaryDimension.code,
    secondaryDimension: r.secondaryDimension.code,
    profileCode: r.profileCode,
    isEq,
    intensity,
    eq: r.eq,
    quality: r.quality as unknown as ResponseQuality,
  };
  return { participant: meta, result };
}

export type ParticipantReport = NonNullable<
  Awaited<ReturnType<typeof participantReport>>
>;

/** Organizaciones del cliente con sus equipos (para selects de formularios). */
export async function teamsForOrganizations(organizationIds: string[]) {
  if (organizationIds.length === 0) return [];
  return prisma.team.findMany({
    where: { project: { organizationId: { in: organizationIds } } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      project: { select: { id: true, name: true, organizationId: true } },
    },
  });
}
