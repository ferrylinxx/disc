import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import {
  adminOrganizationDetail,
  adminParticipants,
  organizationTeamReport,
  teamsForOrganizations,
} from "@/lib/data/dashboard";
import { getActiveInstrument } from "@/lib/instruments";
import {
  BulkInviteForm,
  CreateProjectForm,
  CreateTeamForm,
  InviteParticipantForm,
} from "@/components/dashboard/Forms";
import {
  DeleteEntityButton,
  DeleteOrgButton,
  OrgEmailForm,
  RenameOrgForm,
} from "@/components/admin/OrgManage";
import { ParticipantsTable } from "@/components/admin/ParticipantsTable";
import { Tabs } from "@/components/admin/Tabs";
import { TeamMap } from "@/components/dashboard/TeamMap";
import { TeamExport } from "@/components/dashboard/TeamExport";
import { Avatar } from "@/components/dashboard/AdminWidgets";
import { Card, EmptyState, PageHeader, StatCard } from "@/components/admin/ui";

export const metadata = { title: "Organización · Consola GESEM" };

const dateFmt = new Intl.DateTimeFormat("es-ES", { dateStyle: "long" });

const roleLabel: Record<string, string> = {
  ADMIN: "Admin cliente",
  FACILITATOR: "Facilitador",
};

export default async function AdminOrgDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("SUPERADMIN");
  const { id } = await params;

  const [org, participants, teams, teamData] = await Promise.all([
    adminOrganizationDetail(id),
    adminParticipants(id),
    teamsForOrganizations([id]),
    organizationTeamReport(id, [id]),
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

  const resumen = (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Proyectos" value={org.projects.length} accent="#00a1e0" />
        <StatCard label="Equipos" value={teamCount} accent="#0ea5e9" />
        <StatCard
          label="Participantes"
          value={org._count.participants}
          accent="#10b981"
          hint={`${org.completed} completados`}
        />
        <StatCard label="Gestores" value={org.members.length} accent="#f59e0b" />
      </div>
      <Card
        title="Ajustes"
        description="Renombrar la organización o eliminarla con todo su contenido"
      >
        <div className="space-y-4">
          <RenameOrgForm id={org.id} name={org.name} />
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50/50 p-4">
            <p className="text-xs text-rose-600">
              Eliminar borra proyectos, equipos, participantes, invitaciones y
              resultados de forma permanente.
            </p>
            <DeleteOrgButton id={org.id} name={org.name} />
          </div>
        </div>
      </Card>
    </>
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

  const participantesTab = (
    <>
      <Card
        title="Correo de invitación"
        description="Personaliza el correo de esta organización: programa, taller y fecha límite"
      >
        <OrgEmailForm
          id={org.id}
          programName={org.programName ?? ""}
          emailSubject={org.emailSubject ?? ""}
          sessionDate={org.sessionDate ?? ""}
          sessionInfo={org.sessionInfo ?? ""}
          deadline={org.deadline ?? ""}
          welcomeIntro={org.welcomeIntro ?? ""}
        />
      </Card>
      <Card title="Invitar participantes" description="Individual o subiendo/pegando una lista">
        <div className="space-y-5">
          <InviteParticipantForm organizationId={org.id} teams={teamOptions} />
          <div className="border-t border-slate-100 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Invitación masiva
            </p>
            <BulkInviteForm organizationId={org.id} teams={teamOptions} />
          </div>
        </div>
      </Card>
      <Card title={`Participantes (${participants.length})`}>
        <ParticipantsTable participants={participants} showOrg={false} />
      </Card>
    </>
  );

  const equipo =
    teamData && teamData.totals.completed > 0 ? (
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
        <Link
          href="/admin/usuarios"
          className="text-xs font-semibold text-sky-600 transition hover:text-sky-700"
        >
          Gestionar usuarios →
        </Link>
      }
    >
      {org.members.length === 0 ? (
        <EmptyState title="Sin gestores asignados" hint="Asigna roles desde la sección Usuarios." />
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
    </Card>
  );

  return (
    <>
      <PageHeader
        title={org.name}
        description={`/${org.slug} · creada el ${dateFmt.format(org.createdAt)}`}
      >
        <Link
          href="/admin/organizaciones"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
        >
          ← Organizaciones
        </Link>
      </PageHeader>

      <Tabs
        tabs={[
          { id: "resumen", label: "Resumen", content: resumen },
          { id: "estructura", label: "Estructura", badge: teamCount, content: estructura },
          {
            id: "participantes",
            label: "Participantes",
            badge: org._count.participants,
            content: participantesTab,
          },
          { id: "equipo", label: "Informe de equipo", content: equipo },
          { id: "gestores", label: "Gestores", badge: org.members.length, content: gestores },
        ]}
      />
    </>
  );
}
