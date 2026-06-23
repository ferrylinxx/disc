import { requireRole } from "@/lib/auth/dal";
import { effectiveRoles, memberOrganizationIds } from "@/lib/auth/rbac";
import { allOrganizationIds, facilitatorOverview } from "@/lib/data/dashboard";
import DashboardShell, { StatCard } from "@/components/dashboard/DashboardShell";
import { InviteLink } from "@/components/dashboard/InviteLink";

export const metadata = { title: "Facilitador · Seguimiento" };

const STATUS: Record<string, { label: string; cls: string }> = {
  INVITED: { label: "Invitado", cls: "bg-slate-100 text-slate-600" },
  IN_PROGRESS: { label: "En curso", cls: "bg-amber-100 text-amber-700" },
  COMPLETED: { label: "Completado", cls: "bg-emerald-100 text-emerald-700" },
};

export default async function FacilitadorPage() {
  const session = await requireRole("SUPERADMIN", "ORG_ADMIN", "FACILITATOR");
  const orgIds = effectiveRoles(session).includes("SUPERADMIN")
    ? await allOrganizationIds()
    : memberOrganizationIds(session);

  const { participants, counts } = await facilitatorOverview(orgIds);
  const progress =
    counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;

  return (
    <DashboardShell
      badge="Facilitador"
      title="Seguimiento de cumplimentación"
      subtitle={`${progress}% completado · ${counts.total} participantes`}
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total" value={counts.total} accent="#00a1e0" />
        <StatCard label="Invitados" value={counts.invited} accent="#94a3b8" />
        <StatCard label="En curso" value={counts.inProgress} accent="#f59e0b" />
        <StatCard label="Completados" value={counts.completed} accent="#10b981" />
      </div>

      <section className="glass animate-fade-up rounded-2xl border border-white/60 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Participantes</h2>
          <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-100">
            <div
              className="bg-brand h-full rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {participants.length === 0 ? (
          <p className="text-sm text-slate-500">
            No hay participantes en tus organizaciones todavía.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {participants.map((p) => {
              const s = STATUS[p.status] ?? STATUS.INVITED;
              const invite = p.invitations[0];
              return (
                <li key={p.id} className="space-y-2 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">
                        {p.fullName}
                      </div>
                      <div className="text-xs text-slate-400">{p.email}</div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {p.team && <span>{p.team.name}</span>}
                      <span className="text-slate-400">{p.organization.name}</span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.cls}`}
                      >
                        {s.label}
                      </span>
                    </div>
                  </div>
                  {invite && p.status !== "COMPLETED" && (
                    <InviteLink path={`/evaluacion/${invite.token}`} />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </DashboardShell>
  );
}
