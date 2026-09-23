import { requireRole } from "@/lib/auth/dal";
import { effectiveRoles, memberOrganizationIds } from "@/lib/auth/rbac";
import { allOrganizationIds, facilitatorOverview } from "@/lib/data/dashboard";
import DashboardShell, { StatCard } from "@/components/dashboard/DashboardShell";
import { ParticipantDirectory } from "@/components/dashboard/ParticipantDirectory";

export const metadata = { title: "Seguimiento" };

export default async function FacilitadorPage() {
  const session = await requireRole("SUPERADMIN", "ORG_ADMIN", "FACILITATOR");
  const orgIds = effectiveRoles(session).includes("SUPERADMIN")
    ? await allOrganizationIds()
    : memberOrganizationIds(session);

  const { participants, counts } = await facilitatorOverview(orgIds);
  const progress =
    counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;
  const orgCount = new Set(participants.map((p) => p.organization.id)).size;

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

      <section className="animate-fade-up rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/40">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">Participantes</h2>
          {/* Barra de progreso con su valor: antes era una barra sin etiqueta. */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">{progress}% completado</span>
            <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-100">
              <div className="bg-brand h-full rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {participants.length === 0 ? (
          <p className="text-sm text-slate-500">
            No hay participantes en tus organizaciones todavía.
          </p>
        ) : (
          <ParticipantDirectory
            canManage={false}
            groupByOrg={orgCount > 1}
            rows={participants.map((p) => ({
              id: p.id,
              fullName: p.fullName,
              email: p.email,
              status: p.status,
              teamName: p.team?.name ?? null,
              orgName: p.organization.name,
              result: null,
              inviteToken: p.invitations[0]?.token ?? null,
              inviteSent: Boolean(p.invitations[0]?.sentAt),
            }))}
          />
        )}
      </section>
    </DashboardShell>
  );
}
