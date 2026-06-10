import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { effectiveRoles, adminOrganizationIds } from "@/lib/auth/rbac";
import {
  allOrganizationIds,
  clientOverview,
  orgParticipants,
  teamsForOrganizations,
} from "@/lib/data/dashboard";
import { getActiveInstrument } from "@/lib/instruments";
import DashboardShell, { StatCard } from "@/components/dashboard/DashboardShell";
import { InviteLink } from "@/components/dashboard/InviteLink";
import { ResendInviteButton } from "@/components/dashboard/ResendInviteButton";
import {
  BulkInviteForm,
  CreateProjectForm,
  CreateTeamForm,
  InviteParticipantForm,
} from "@/components/dashboard/Forms";

const STATUS: Record<string, { label: string; cls: string }> = {
  INVITED: { label: "Invitado", cls: "bg-slate-100 text-slate-600" },
  IN_PROGRESS: { label: "En curso", cls: "bg-amber-100 text-amber-700" },
  COMPLETED: { label: "Completado", cls: "bg-emerald-100 text-emerald-700" },
};

export const metadata = { title: "Cliente · Panel" };

export default async function ClientePage() {
  const session = await requireRole("SUPERADMIN", "ORG_ADMIN");
  const orgIds = effectiveRoles(session).includes("SUPERADMIN")
    ? await allOrganizationIds()
    : adminOrganizationIds(session);

  const [{ organizations, totals }, teams, participants] = await Promise.all([
    clientOverview(orgIds),
    teamsForOrganizations(orgIds),
    orgParticipants(orgIds),
  ]);

  const def = getActiveInstrument();
  const dimColor = new Map(def.dimensions.map((d) => [d.code, d.color]));

  return (
    <DashboardShell
      badge="Cliente"
      title="Mis proyectos y equipos"
      subtitle="Organiza proyectos, equipos e invita a participantes."
    >
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Proyectos" value={totals.projects} accent="#6366f1" />
        <StatCard label="Participantes" value={totals.participants} accent="#0ea5e9" />
        <StatCard label="Completados" value={totals.completed} accent="#10b981" />
      </div>

      {organizations.length === 0 && (
        <p className="text-sm text-slate-500">
          No tienes organizaciones asignadas todavía.
        </p>
      )}

      {organizations.map((org) => {
        const orgTeams = teams
          .filter((t) => t.project.organizationId === org.id)
          .map((t) => ({ id: t.id, name: t.name, projectName: t.project.name }));
        const orgPeople = participants.filter(
          (p) => p.organizationId === org.id,
        );
        return (
          <section
            key={org.id}
            className="glass animate-fade-up space-y-5 rounded-2xl border border-white/60 p-6"
          >
            <h2 className="text-lg font-semibold text-slate-900">{org.name}</h2>

            <div className="rounded-xl bg-white/50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">
                Invitar participante
              </h3>
              <InviteParticipantForm organizationId={org.id} teams={orgTeams} />
            </div>

            <div className="rounded-xl bg-white/50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">
                Invitación masiva (CSV / Excel)
              </h3>
              <BulkInviteForm organizationId={org.id} teams={orgTeams} />
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-700">
                Participantes ({orgPeople.length})
              </h3>
              {orgPeople.length === 0 ? (
                <p className="text-sm text-slate-400">
                  Aún no has invitado a nadie en esta organización.
                </p>
              ) : (
                <ul className="space-y-2">
                  {orgPeople.map((p) => {
                    const s = STATUS[p.status] ?? STATUS.INVITED;
                    return (
                      <li
                        key={p.id}
                        className="rounded-xl border border-slate-100 bg-white/60 p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold text-slate-900">
                              {p.fullName}
                            </div>
                            <div className="text-xs text-slate-400">
                              {p.email}
                              {p.teamName ? ` · ${p.teamName}` : " · Sin equipo"}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            {p.result ? (
                              <>
                                <span
                                  className="rounded-lg px-2.5 py-1 font-bold text-white"
                                  style={{
                                    backgroundColor:
                                      dimColor.get(p.result.primary) ?? "#64748b",
                                  }}
                                >
                                  {p.result.profileCode}
                                </span>
                                <span className="text-slate-500">
                                  EQ {p.result.eq}
                                </span>
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
                        </div>
                        {p.result ? (
                          <div className="mt-2 flex justify-end">
                            <Link
                              href={`/cliente/participantes/${p.id}`}
                              className="rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
                            >
                              Ver informe →
                            </Link>
                          </div>
                        ) : (
                          p.inviteToken && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="min-w-0 flex-1">
                                <InviteLink
                                  path={`/evaluacion/${p.inviteToken}`}
                                  compact
                                />
                              </div>
                              <ResendInviteButton participantId={p.id} />
                            </div>
                          )
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">
                Nuevo proyecto
              </h3>
              <CreateProjectForm organizationId={org.id} />
            </div>

            <div className="space-y-4">
              {org.projects.length === 0 && (
                <p className="text-sm text-slate-400">Sin proyectos aún.</p>
              )}
              {org.projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-xl border border-slate-100 bg-white/60 p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-slate-900">
                        {project.name}
                      </div>
                      {project.description && (
                        <div className="text-xs text-slate-400">
                          {project.description}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {project.teams.length} equipos
                    </span>
                  </div>

                  <ul className="mb-3 space-y-1">
                    {project.teams.map((team) => (
                      <li key={team.id}>
                        <Link
                          href={`/cliente/equipos/${team.id}`}
                          className="group flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-indigo-50"
                        >
                          <span className="font-medium group-hover:text-indigo-700">
                            {team.name}
                          </span>
                          <span className="flex items-center gap-2 text-xs text-slate-400">
                            {team._count.participants} participantes
                            <span className="text-indigo-400 opacity-0 transition group-hover:opacity-100">
                              Ver mapa →
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <CreateTeamForm projectId={project.id} />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </DashboardShell>
  );
}
