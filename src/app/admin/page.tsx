import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { adminOverview, adminAttention } from "@/lib/data/dashboard";
import { getActiveInstrument } from "@/lib/instruments";
import {
  Card,
  PageHeader,
  Progress,
  ProfileChip,
  StatCard,
  EmptyState,
  btn,
  tableCls,
} from "@/components/admin/ui";
import { Avatar, ProgressRing } from "@/components/dashboard/AdminWidgets";

export const metadata = { title: "Resumen · Consola GESEM" };

const dateFmt = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short",
});
const dayFmt = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" });

const ic = "h-5 w-5";
const svg = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
const IconOrg = () => (
  <svg viewBox="0 0 24 24" className={ic} {...svg}>
    <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M9 7h2M9 11h2M9 15h2M15 21V11h2a2 2 0 0 1 2 2v8" />
  </svg>
);
const IconUserCheck = () => (
  <svg viewBox="0 0 24 24" className={ic} {...svg}>
    <path d="M14 19a5 5 0 0 0-10 0M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M16 12l2 2 4-4" />
  </svg>
);
const IconReport = () => (
  <svg viewBox="0 0 24 24" className={ic} {...svg}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13l2 2 4-4" />
  </svg>
);
const IconGauge = () => (
  <svg viewBox="0 0 24 24" className={ic} {...svg}>
    <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4M12 12l4-4" />
    <path d="M4 20a8 8 0 1 1 16 0" />
  </svg>
);
const IconArrow = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" {...svg}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

/** Resumen global de la plataforma. */
export default async function AdminOverviewPage() {
  await requireRole("SUPERADMIN");
  const [
    {
      orgCount,
      participantCount,
      resultCount,
      organizations,
      participantStatus,
      invitationStatus,
      profileDistribution,
      eqAverage,
      completionRate,
      recent,
    },
    attention,
  ] = await Promise.all([adminOverview(), adminAttention()]);

  const def = getActiveInstrument();
  const distByCode = new Map(profileDistribution.map((d) => [d.code, d.count]));
  const totalDist = profileDistribution.reduce((s, d) => s + d.count, 0);
  const maxDist = Math.max(1, ...profileDistribution.map((d) => d.count));

  const attentionRows = [
    {
      count: attention.staleInvites,
      label: "Invitaciones sin abrir",
      hint: "Enviadas hace más de 7 días",
      tone: "amber" as const,
    },
    {
      count: attention.inProgress,
      label: "Evaluaciones a medias",
      hint: "Empezadas y sin terminar",
      tone: "amber" as const,
    },
    {
      count: attention.unassigned,
      label: "Sin equipo asignado",
      hint: "Completadas pendientes de asignar",
      tone: "sky" as const,
    },
  ];
  const pendingTotal = attentionRows.reduce((s, r) => s + r.count, 0);
  const allClear = pendingTotal === 0;

  const topOrgs = organizations.slice(0, 6);

  return (
    <>
      <PageHeader
        title="Resumen"
        description="Estado global de la plataforma: organizaciones, evaluaciones y actividad."
      >
        <Link href="/admin/participantes" className={btn.secondary}>
          Participantes
        </Link>
        <Link href="/admin/organizaciones" className={btn.primary}>
          + Nueva organización
        </Link>
      </PageHeader>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Organizaciones"
          value={orgCount}
          accent="#00a1e0"
          hint={`${participantCount} participantes`}
          icon={<IconOrg />}
        />
        <StatCard
          label="Completados"
          value={participantStatus.completed}
          accent="#10b981"
          hint={`${participantStatus.inProgress} en curso · ${participantStatus.invited} invitados`}
          icon={<IconUserCheck />}
        />
        <StatCard
          label="Informes"
          value={resultCount}
          accent="#f59e0b"
          hint={`EQ medio ${eqAverage || "—"}`}
          icon={<IconReport />}
        />
        <StatCard
          label="Cumplimentación"
          value={`${completionRate}%`}
          accent="#6f7bf7"
          hint={`${participantStatus.completed} de ${participantCount}`}
          icon={<IconGauge />}
        />
      </div>

      {/* Analítica: embudo (ancho) + distribución DISC */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card
            title="Embudo de cumplimentación"
            description="Recorrido de los participantes invitados"
          >
            <div className="flex flex-wrap items-center gap-8">
              <ProgressRing value={completionRate} label="completado" size={128} />
              <div className="min-w-[220px] flex-1 space-y-4">
                {[
                  { label: "Invitados", value: participantStatus.invited, color: "#94a3b8" },
                  { label: "En curso", value: participantStatus.inProgress, color: "#f59e0b" },
                  { label: "Completados", value: participantStatus.completed, color: "#10b981" },
                ].map((row) => {
                  const pct =
                    participantCount > 0
                      ? Math.round((row.value / participantCount) * 100)
                      : 0;
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
            <div className="mt-6 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-5">
              {[
                { k: "Pendientes", v: invitationStatus.pending },
                { k: "Enviadas", v: invitationStatus.sent },
                { k: "Abiertas", v: invitationStatus.opened },
                { k: "Completadas", v: invitationStatus.completed },
                { k: "Expiradas", v: invitationStatus.expired },
              ].map((i) => (
                <div key={i.k} className="rounded-xl bg-slate-50 px-3 py-2">
                  <div className="text-lg font-bold tabular-nums text-slate-800">{i.v}</div>
                  <div className="text-[11px] font-medium text-slate-400">{i.k}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card
          title="Distribución de estilos"
          description="Tendencia primaria de los informes"
        >
          {resultCount === 0 ? (
            <EmptyState title="Aún no hay informes" hint="Aparecerán al completarse evaluaciones." />
          ) : (
            <div className="space-y-3.5">
              {[...def.dimensions]
                .sort((a, b) => a.order - b.order)
                .map((dim) => {
                  const count = distByCode.get(dim.code) ?? 0;
                  const width = Math.round((count / maxDist) * 100);
                  const share = totalDist > 0 ? Math.round((count / totalDist) * 100) : 0;
                  return (
                    <div key={dim.code}>
                      <div className="mb-1.5 flex items-center gap-2.5">
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-black text-white"
                          style={{ backgroundColor: dim.color }}
                        >
                          {dim.code}
                        </span>
                        <span className="flex-1 text-xs font-medium text-slate-600">
                          {dim.name}
                        </span>
                        <span className="tabular-nums text-xs text-slate-400">
                          <span className="font-bold text-slate-700">{count}</span> · {share}%
                        </span>
                      </div>
                      <Progress value={width} color={dim.color} />
                    </div>
                  );
                })}
              <p className="border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                DISC GESEM describe tendencias de estilo; no es un diagnóstico.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Actividad reciente (ancha) + Requiere atención (columna) */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card
            title="Actividad reciente"
            description="Últimas evaluaciones completadas"
            action={
              <Link
                href="/admin/participantes"
                className="text-xs font-semibold text-sky-600 transition hover:text-sky-700"
              >
                Ver todos →
              </Link>
            }
          >
            {recent.length === 0 ? (
              <EmptyState
                title="Todavía no se ha completado ninguna evaluación"
                hint="Invita participantes desde una organización."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className={tableCls.table}>
                  <thead className={tableCls.thead}>
                    <tr>
                      <th className={tableCls.th}>Participante</th>
                      <th className={tableCls.th}>Organización</th>
                      <th className={tableCls.th}>Perfil</th>
                      <th className={tableCls.th}>EQ</th>
                      <th className={tableCls.th}>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((r) => (
                      <tr key={r.id} className={tableCls.tr}>
                        <td className={tableCls.td}>
                          <div className="flex items-center gap-2.5">
                            <Avatar name={r.fullName} />
                            <span className="font-semibold text-slate-800">{r.fullName}</span>
                          </div>
                        </td>
                        <td className={`${tableCls.td} text-slate-500`}>{r.orgName}</td>
                        <td className={tableCls.td}>
                          <ProfileChip code={r.profileCode} />
                        </td>
                        <td className={`${tableCls.td} font-semibold text-slate-700`}>{r.eq}</td>
                        <td className={`${tableCls.td} text-xs text-slate-400`}>
                          {dateFmt.format(r.computedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <Card
          title="Requiere atención"
          description={allClear ? "Sin acciones pendientes" : `${pendingTotal} acciones pendientes`}
        >
          {allClear ? (
            <EmptyState icon="✓" title="Todo al día" hint="No hay acciones pendientes por ahora." />
          ) : (
            <div className="space-y-2">
              {attentionRows.map((t) => {
                const muted = t.count === 0;
                const numCls = muted
                  ? "bg-slate-50 text-slate-300"
                  : t.tone === "amber"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-sky-50 text-sky-600";
                return (
                  <Link
                    key={t.label}
                    href="/admin/participantes"
                    className="group flex items-center gap-3 rounded-2xl border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50/70"
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold tabular-nums ${numCls}`}
                    >
                      {t.count}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-700">
                        {t.label}
                      </span>
                      <span className="block truncate text-xs text-slate-400">{t.hint}</span>
                    </span>
                    <span className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-400">
                      <IconArrow />
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Organizaciones */}
      <Card
        title="Organizaciones"
        description="Actividad por organización"
        action={
          <Link
            href="/admin/organizaciones"
            className="text-xs font-semibold text-sky-600 transition hover:text-sky-700"
          >
            Gestionar →
          </Link>
        }
      >
        {topOrgs.length === 0 ? (
          <EmptyState
            title="Aún no hay organizaciones"
            hint="Crea la primera para empezar a invitar participantes."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {topOrgs.map((o) => {
              const total = o._count.participants;
              const pct = total > 0 ? Math.round((o.completed / total) * 100) : 0;
              return (
                <Link
                  key={o.id}
                  href={`/admin/organizaciones/${o.id}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-slate-100 p-4 transition hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-slate-800">{o.name}</div>
                      <div className="text-[11px] text-slate-400">
                        Alta {dayFmt.format(o.createdAt)}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-lg bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-600">
                      {pct}%
                    </span>
                  </div>
                  <Progress value={pct} color="#00a1e0" />
                  <div className="flex flex-wrap gap-1.5 text-[11px] font-medium text-slate-500">
                    <span className="rounded-md bg-slate-50 px-2 py-0.5">
                      {o.completed}/{total} completados
                    </span>
                    <span className="rounded-md bg-slate-50 px-2 py-0.5">
                      {o._count.projects} proyectos
                    </span>
                    <span className="rounded-md bg-slate-50 px-2 py-0.5">
                      {o._count.members} miembros
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}
