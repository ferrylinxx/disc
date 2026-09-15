import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { effectiveRoles, adminOrganizationIds } from "@/lib/auth/rbac";
import { allOrganizationIds, teamMap } from "@/lib/data/dashboard";
import { getActiveInstrument } from "@/lib/instruments";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { TeamMap } from "@/components/dashboard/TeamMap";
import { TeamExport } from "@/components/dashboard/TeamExport";
import { ProfileChip, StatusBadge, btn } from "@/components/admin/ui";
import { BackLink } from "@/components/BackLink";

export const metadata = { title: "Mapa de equipo" };

export default async function TeamMapPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const session = await requireRole("SUPERADMIN", "ORG_ADMIN");
  const orgIds = effectiveRoles(session).includes("SUPERADMIN")
    ? await allOrganizationIds()
    : adminOrganizationIds(session);

  const data = await teamMap(teamId, orgIds);
  if (!data) notFound();

  const def = getActiveInstrument();
  const dims = [...def.dimensions].sort((a, b) => a.order - b.order);
  const progress =
    data.totals.total > 0
      ? Math.round((data.totals.completed / data.totals.total) * 100)
      : 0;

  return (
    <DashboardShell
      badge="Mapa de equipo"
      title={data.team.name}
      subtitle={`${data.team.projectName} · ${progress}% completado`}
      actions={
        <BackLink href="/cliente" className={`${btn.secondary} no-print`}>
          ← Volver
        </BackLink>
      }
    >
      <TeamExport
        insights={data.insights}
        dimensions={dims}
        teamName={data.team.name}
      />
      <div className="print-area">
        <TeamMap
          insights={data.insights}
          dimensions={dims}
          header={{
            name: data.team.name,
            organizationName: data.team.organizationName,
            projectName: data.team.projectName,
            createdAt: data.team.createdAt,
            total: data.totals.total,
          }}
        />
      </div>

      <section className="no-print animate-fade-up rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/40">
        <h2 className="mb-4 text-base font-bold text-slate-900">Participantes</h2>
        {data.participants.length === 0 ? (
          <p className="text-sm text-slate-500">
            Este equipo no tiene participantes todavía.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.participants.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-900">{p.fullName}</div>
                  <div className="truncate text-xs text-slate-400">{p.email}</div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {p.result ? (
                    <>
                      <ProfileChip code={p.result.profileCode} />
                      <span className="text-slate-500">EQ {p.result.eq}</span>
                    </>
                  ) : (
                    <span className="text-slate-400">Sin resultado</span>
                  )}
                  <StatusBadge status={p.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </DashboardShell>
  );
}
