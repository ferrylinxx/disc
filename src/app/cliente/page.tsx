import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { effectiveRoles, adminOrganizationIds } from "@/lib/auth/rbac";
import {
  allOrganizationIds,
  clientOverview,
  orgParticipants,
  teamsForOrganizations,
} from "@/lib/data/dashboard";
import DashboardShell, { StatCard } from "@/components/dashboard/DashboardShell";
import { CreateProjectForm, CreateTeamForm, InvitePanel } from "@/components/dashboard/Forms";
import { ParticipantDirectory } from "@/components/dashboard/ParticipantDirectory";

export const metadata = { title: "Panel de cliente" };

/**
 * Panel del admin de cliente. Una organización cada vez (selector arriba si
 * gestiona varias): primero sus participantes, invitar con un botón y la
 * estructura de proyectos plegada al final. Antes cada organización repetía el
 * formulario completo de invitación y la página medía más de 8.000 px.
 */
export default async function ClientePage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const session = await requireRole("SUPERADMIN", "ORG_ADMIN");
  const orgIds = effectiveRoles(session).includes("SUPERADMIN")
    ? await allOrganizationIds()
    : adminOrganizationIds(session);

  const [{ organizations }, teams, participants, { org: orgParam }] = await Promise.all([
    clientOverview(orgIds),
    teamsForOrganizations(orgIds),
    orgParticipants(orgIds),
    searchParams,
  ]);

  // Sin ?org, se abre la primera organización que ya tiene participantes.
  const org =
    organizations.find((o) => o.id === orgParam) ??
    organizations.find((o) => o._count.participants > 0) ??
    organizations[0];

  if (!org) {
    return (
      <DashboardShell badge="Cliente" title="Participantes y equipos">
        <p className="text-sm text-slate-500">No tienes organizaciones asignadas todavía.</p>
      </DashboardShell>
    );
  }

  const orgTeams = teams
    .filter((t) => t.project.organizationId === org.id)
    .map((t) => ({ id: t.id, name: t.name, projectName: t.project.name }));
  const people = participants.filter((p) => p.organizationId === org.id);
  const completed = people.filter((p) => p.status === "COMPLETED").length;
  const pct = people.length > 0 ? Math.round((completed / people.length) * 100) : 0;
  const teamCount = org.projects.reduce((acc, p) => acc + p.teams.length, 0);

  return (
    <DashboardShell
      badge="Cliente"
      title={org.name}
      subtitle="Invita a participantes, sigue su progreso y consulta los informes."
    >
      {organizations.length > 1 && (
        <nav
          aria-label="Organización"
          className="-mt-2 flex gap-1.5 overflow-x-auto rounded-2xl border border-slate-200/70 bg-white/80 p-1.5"
        >
          {organizations.map((o) => {
            const on = o.id === org.id;
            return (
              <Link
                key={o.id}
                href={`/cliente?org=${o.id}`}
                aria-current={on ? "page" : undefined}
                className={`shrink-0 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                  on ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {o.name}
                <span className={`ml-2 text-xs ${on ? "text-white/60" : "text-slate-400"}`}>
                  {o._count.participants}
                </span>
              </Link>
            );
          })}
        </nav>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Participantes" value={people.length} accent="#0ea5e9" />
        <StatCard label="Completados" value={completed} accent="#10b981" />
        <StatCard label="Cumplimentación" value={`${pct}%`} accent="#6f7bf7" />
      </div>

      <section className="animate-fade-up rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/40">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Participantes</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {completed} de {people.length} han completado el cuestionario.
            </p>
          </div>
        </div>
        <div className="mb-5">
          <InvitePanel organizationId={org.id} teams={orgTeams} />
        </div>
        {people.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            Aún no has invitado a nadie en esta organización.
          </p>
        ) : (
          <ParticipantDirectory
            canManage
            rows={people.map((p) => ({
              id: p.id,
              fullName: p.fullName,
              email: p.email,
              status: p.status,
              teamName: p.teamName,
              result: p.result ? { profileCode: p.result.profileCode, eq: p.result.eq } : null,
              inviteToken: p.inviteToken,
            }))}
          />
        )}
      </section>

      {/* Estructura: se usa poco, así que va plegada al final. */}
      <details className="group animate-fade-up rounded-2xl border border-slate-200/70 bg-white shadow-sm shadow-slate-200/40">
        <summary className="flex cursor-pointer items-center justify-between gap-3 px-6 py-4">
          <span>
            <span className="block text-base font-bold text-slate-900">Proyectos y equipos</span>
            <span className="block text-xs text-slate-500">
              {org.projects.length} {org.projects.length === 1 ? "proyecto" : "proyectos"} ·{" "}
              {teamCount} {teamCount === 1 ? "equipo" : "equipos"} · agrupa a los participantes para
              ver el mapa de cada equipo
            </span>
          </span>
          <span className="text-slate-400 transition group-open:rotate-180">▾</span>
        </summary>
        <div className="space-y-4 border-t border-slate-100 px-6 py-5">
          {org.projects.map((project) => (
            <div key={project.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-900">{project.name}</div>
                  {project.description && (
                    <div className="text-xs text-slate-400">{project.description}</div>
                  )}
                </div>
                <span className="text-xs text-slate-400">{project.teams.length} equipos</span>
              </div>
              {project.teams.length > 0 && (
                <ul className="mb-3 space-y-1">
                  {project.teams.map((team) => (
                    <li key={team.id}>
                      <Link
                        href={`/cliente/equipos/${team.id}`}
                        className="group/team flex items-center justify-between rounded-lg bg-white px-3 py-1.5 text-sm text-slate-700 ring-1 ring-slate-100 transition hover:bg-sky-50"
                      >
                        <span className="font-medium group-hover/team:text-sky-700">{team.name}</span>
                        <span className="flex items-center gap-2 text-xs text-slate-400">
                          {team._count.participants} participantes
                          <span className="text-sky-500">Ver mapa →</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <CreateTeamForm projectId={project.id} />
            </div>
          ))}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Nuevo proyecto
            </p>
            <CreateProjectForm organizationId={org.id} />
          </div>
        </div>
      </details>
    </DashboardShell>
  );
}
