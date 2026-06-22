import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { effectiveRoles, adminOrganizationIds } from "@/lib/auth/rbac";
import { allOrganizationIds, teamMap } from "@/lib/data/dashboard";
import { getActiveInstrument } from "@/lib/instruments";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { TeamMap } from "@/components/dashboard/TeamMap";
import { TeamExport } from "@/components/dashboard/TeamExport";

export const metadata = { title: "Mapa de equipo · DISC GESEM" };

const STATUS: Record<string, { label: string; cls: string }> = {
  INVITED: { label: "Invitado", cls: "bg-slate-100 text-slate-600" },
  IN_PROGRESS: { label: "En curso", cls: "bg-amber-100 text-amber-700" },
  COMPLETED: { label: "Completado", cls: "bg-emerald-100 text-emerald-700" },
};

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
  const dimColor = new Map(dims.map((d) => [d.code, d.color]));
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
        <Link
          href="/cliente"
          className="no-print rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
        >
          ← Panel
        </Link>
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

      <section className="glass animate-fade-up rounded-2xl border border-white/60 p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Participantes</h2>
        {data.participants.length === 0 ? (
          <p className="text-sm text-slate-500">
            Este equipo no tiene participantes todavía.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.participants.map((p) => {
              const s = STATUS[p.status] ?? STATUS.INVITED;
              return (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div>
                    <div className="font-semibold text-slate-900">{p.fullName}</div>
                    <div className="text-xs text-slate-400">{p.email}</div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    {p.result ? (
                      <>
                        <span
                          className="rounded-lg px-2.5 py-1 font-bold text-white"
                          style={{
                            backgroundColor: dimColor.get(p.result.primary) ?? "#64748b",
                          }}
                        >
                          {p.result.profileCode}
                        </span>
                        <span className="text-slate-500">EQ {p.result.eq}</span>
                      </>
                    ) : (
                      <span className="text-slate-400">Sin resultado</span>
                    )}
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.cls}`}
                    >
                      {s.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </DashboardShell>
  );
}
