import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import {
  adminOrganizationDetail,
  adminParticipants,
  assignableUsers,
  organizationTeamReport,
  teamsForOrganizations,
} from "@/lib/data/dashboard";
import { getActiveInstrument } from "@/lib/instruments";
import {
  CreateProjectForm,
  CreateTeamForm,
  InvitePanel,
} from "@/components/dashboard/Forms";
import {
  AddGestorForm,
  DeleteEntityButton,
  DeleteOrgButton,
  OrgEmailForm,
  RenameOrgForm,
} from "@/components/admin/OrgManage";
import { ParticipantsTable } from "@/components/admin/ParticipantsTable";
import { Tabs } from "@/components/admin/Tabs";
import { TeamMap } from "@/components/dashboard/TeamMap";
import { TeamExport } from "@/components/dashboard/TeamExport";
import { Avatar, ProgressRing } from "@/components/dashboard/AdminWidgets";
import { Card, EmptyState, PageHeader, Progress, StatCard, btn } from "@/components/admin/ui";
import { discGradStops } from "@/lib/disc-gradient";
import { styleShort } from "@/lib/narratives/disc-gesem.catalog";

export const metadata = { title: "Organización · Consola" };

const dateFmt = new Intl.DateTimeFormat("es-ES", { dateStyle: "long" });

const roleLabel: Record<string, string> = {
  ADMIN: "Admin cliente",
  FACILITATOR: "Facilitador",
};

const tabLink = "text-xs font-semibold text-sky-600 transition hover:text-sky-700";

export default async function AdminOrgDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("SUPERADMIN");
  const { id } = await params;

  const [org, participants, teams, teamData, gestorCandidates] = await Promise.all([
    adminOrganizationDetail(id),
    adminParticipants(id),
    teamsForOrganizations([id]),
    organizationTeamReport(id, [id]),
    assignableUsers(id),
  ]);
  if (!org) notFound();

  const def = getActiveInstrument();
  const dims = [...def.dimensions].sort((a, b) => a.order - b.order);
  const teamOptions = teams.map((t) => ({
    id: t.id,
    name: t.name,
    projectName: t.project.name,
  }));
  const teamCount = org.projects.reduce((acc, p) => acc + p.teams.length, 0);
  const total = org._count.participants;
  const completionPct = total > 0 ? Math.round((org.completed / total) * 100) : 0;
  const statusCount = (s: string) => participants.filter((p) => p.status === s).length;
  const hasTeamReport = Boolean(teamData && teamData.totals.completed > 0);

  // Resumen: lo que interesa de un vistazo (progreso y estilos), sin ajustes
  // ni botones de borrado, que pasan a su propia pestaña.
  const resumen = (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Participantes"
          value={total}
          accent="#10b981"
          hint={`${org.completed} completados`}
        />
        <StatCard
          label="Cumplimentación"
          value={`${completionPct}%`}
          accent="#6f7bf7"
          hint={`${statusCount("INVITED")} sin empezar · ${statusCount("IN_PROGRESS")} en curso`}
        />
        <StatCard
          label="Equipos"
          value={teamCount}
          accent="#0ea5e9"
          hint={
            org.projects.length > 0
              ? `${org.projects.length} ${org.projects.length === 1 ? "proyecto" : "proyectos"}`
              : "Sin proyectos creados"
          }
        />
        <StatCard
          label="Gestores"
          value={org.members.length}
          accent="#f59e0b"
          hint={org.members.length === 0 ? "Nadie asignado" : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card
          title="Progreso de la evaluación"
          description="Cuántas personas han terminado el cuestionario"
          action={
            <a href="#participantes" className={tabLink}>
              Ver participantes →
            </a>
          }
        >
          {total === 0 ? (
            <EmptyState
              title="Todavía no hay participantes"
              hint="Invítalos desde la pestaña Participantes."
            />
          ) : (
            <div className="flex flex-wrap items-center gap-6">
              <ProgressRing value={completionPct} label="completado" size={112} />
              <div className="min-w-[200px] flex-1 space-y-3.5">
                {[
                  { label: "Invitados", value: statusCount("INVITED"), color: "#94a3b8" },
                  { label: "En curso", value: statusCount("IN_PROGRESS"), color: "#f59e0b" },
                  { label: "Completados", value: statusCount("COMPLETED"), color: "#10b981" },
                ].map((row) => {
                  const pct = Math.round((row.value / total) * 100);
                  return (
                    <div key={row.label}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600">{row.label}</span>
                        <span className="tabular-nums text-slate-400">
                          <span className="font-semibold text-slate-600">{row.value}</span> · {pct}%
                        </span>
                      </div>
                      <Progress value={pct} color={row.color} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        <Card
          title="Estilos del grupo"
          description="Peso de cada recurso entre las personas que han terminado"
          action={
            hasTeamReport ? (
              <a href="#equipo" className={tabLink}>
                Informe de equipo →
              </a>
            ) : undefined
          }
        >
          {!hasTeamReport || !teamData ? (
            <EmptyState
              title="Aún no hay resultados"
              hint="Aparecerán cuando alguien complete el cuestionario."
            />
          ) : (
            <div className="space-y-3.5">
              {teamData.insights.distribution.map((d) => (
                <div key={d.dimensionCode}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">
                      {d.dimensionCode} · {styleShort(d.dimensionCode)}
                    </span>
                    <span className="font-bold tabular-nums text-slate-600">{Math.round(d.share)}%</span>
                  </div>
                  <Progress value={d.share} color={discGradStops(d.dimensionCode)[0]} />
                </div>
              ))}
              <p className="border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                Describe tendencias del grupo según sus respuestas; no es un diagnóstico.
              </p>
            </div>
          )}
        </Card>
      </div>
    </>
  );

  // Participantes: primero la lista; invitar se despliega con un botón.
  const participantesTab = (
    <Card
      title={`Participantes (${participants.length})`}
      description="El envío del informe por email es siempre manual."
    >
      <div className="mb-5">
        <InvitePanel organizationId={org.id} teams={teamOptions} />
      </div>
      <ParticipantsTable participants={participants} showOrg={false} />
    </Card>
  );

  const correo = (
    <Card
      title="Correo de invitación"
      description="Personaliza el correo de esta organización: programa, taller y fecha límite"
    >
      <OrgEmailForm
        id={org.id}
        programName={org.programName ?? ""}
        emailSubject={org.emailSubject ?? ""}
        emailLang={org.emailLang ?? ""}
        sessionDate={org.sessionDate ?? ""}
        sessionInfo={org.sessionInfo ?? ""}
        deadline={org.deadline ?? ""}
        welcomeIntro={org.welcomeIntro ?? ""}
      />
    </Card>
  );

  const estructura = (
    <Card title="Proyectos y equipos" description="Estructura de evaluación de la organización">
      <div className="space-y-5">
        {org.projects.length === 0 ? (
          <EmptyState title="Sin proyectos todavía" hint="Crea el primero con el formulario de abajo." />
        ) : (
          org.projects.map((project) => (
            <div key={project.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-slate-800">{project.name}</div>
                  {project.description && (
                    <div className="truncate text-xs text-slate-400">{project.description}</div>
                  )}
                </div>
                <DeleteEntityButton kind="project" id={project.id} label={project.name} />
              </div>
              {project.teams.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {project.teams.map((team) => (
                    <li
                      key={team.id}
                      className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-slate-100"
                    >
                      <Link
                        href={`/cliente/equipos/${team.id}`}
                        className="min-w-0 truncate font-medium text-slate-700 transition hover:text-sky-600"
                      >
                        {team.name}
                        <span className="ml-2 text-xs text-slate-400">
                          {team._count.participants} part. · ver mapa →
                        </span>
                      </Link>
                      <DeleteEntityButton kind="team" id={team.id} label={team.name} />
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3">
                <CreateTeamForm projectId={project.id} />
              </div>
            </div>
          ))
        )}
        <div className="border-t border-slate-100 pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Nuevo proyecto
          </p>
          <CreateProjectForm organizationId={org.id} />
        </div>
      </div>
    </Card>
  );

  const equipo =
    hasTeamReport && teamData ? (
      <>
        <TeamExport insights={teamData.insights} dimensions={dims} teamName={org.name} />
        <div className="print-area">
          <TeamMap
            insights={teamData.insights}
            dimensions={dims}
            header={{
              name: org.name,
              organizationName: org.name,
              projectName: "Toda la organización",
              createdAt: teamData.org.createdAt,
              total: teamData.totals.total,
            }}
          />
        </div>
      </>
    ) : (
      <Card title="Informe de equipo">
        <p className="rounded-2xl border border-amber-100 bg-amber-50/60 p-6 text-sm text-amber-800">
          Aún no hay evaluaciones completadas en esta organización. El informe de
          equipo se generará a medida que las personas finalicen.
        </p>
      </Card>
    );

  const gestores = (
    <Card
      title={`Gestores (${org.members.length})`}
      description="Usuarios con rol en esta organización"
      action={
        <Link href="/admin/usuarios" className={tabLink}>
          Gestionar usuarios →
        </Link>
      }
    >
      <div className="space-y-4">
        <AddGestorForm organizationId={org.id} users={gestorCandidates} />
        <div className="border-t border-slate-100 pt-4">
          {org.members.length === 0 ? (
            <EmptyState title="Sin gestores asignados" hint="Añade el primero con el formulario de arriba." />
          ) : (
            <ul className="divide-y divide-slate-50">
              {org.members.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar name={m.user.name ?? m.user.email} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-800">
                        {m.user.name ?? m.user.email}
                      </div>
                      <div className="truncate text-xs text-slate-400">{m.user.email}</div>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-600">
                    {roleLabel[m.role] ?? m.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );

  const ajustes = (
    <Card title="Ajustes" description="Nombre de la organización y zona de borrado">
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Nombre</p>
          <RenameOrgForm id={org.id} name={org.name} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50/50 p-4">
          <p className="text-xs text-rose-600">
            Eliminar borra proyectos, equipos, participantes, invitaciones y
            resultados de forma permanente.
          </p>
          <DeleteOrgButton id={org.id} name={org.name} />
        </div>
      </div>
    </Card>
  );

  return (
    <>
      <PageHeader
        title={org.name}
        description={`/${org.slug} · creada el ${dateFmt.format(org.createdAt)}`}
      >
        <Link href="/admin/organizaciones" className={btn.secondary}>
          ← Organizaciones
        </Link>
      </PageHeader>

      <Tabs
        tabs={[
          { id: "resumen", label: "Resumen", content: resumen },
          { id: "participantes", label: "Participantes", badge: total, content: participantesTab },
          { id: "equipo", label: "Informe de equipo", content: equipo },
          { id: "correo", label: "Correo de invitación", content: correo },
          { id: "estructura", label: "Estructura", badge: teamCount, content: estructura },
          { id: "gestores", label: "Gestores", badge: org.members.length, content: gestores },
          { id: "ajustes", label: "Ajustes", content: ajustes },
        ]}
      />
    </>
  );
}
