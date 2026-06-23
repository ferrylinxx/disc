import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { adminOverview } from "@/lib/data/dashboard";
import { getActiveInstrument } from "@/lib/instruments";
import {
  Card,
  PageHeader,
  Progress,
  ProfileChip,
  StatCard,
  EmptyState,
  tableCls,
} from "@/components/admin/ui";
import { Avatar, ProgressRing } from "@/components/dashboard/AdminWidgets";

export const metadata = { title: "Resumen · Consola GESEM" };

const dateFmt = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short",
});

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
const IconUsers = () => (
  <svg viewBox="0 0 24 24" className={ic} {...svg}>
    <path d="M16 19a4 4 0 0 0-8 0M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 19a3 3 0 0 0-4-3M18 9a2.5 2.5 0 0 0 0-4" />
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

/** Resumen global de la plataforma. */
export default async function AdminOverviewPage() {
  await requireRole("SUPERADMIN");
  const {
    orgCount,
    userCount,
    participantCount,
    resultCount,
    participantStatus,
    invitationStatus,
    profileDistribution,
    eqAverage,
    completionRate,
    recent,
  } = await adminOverview();

  const def = getActiveInstrument();
  const distByCode = new Map(profileDistribution.map((d) => [d.code, d.count]));
  const maxDist = Math.max(1, ...profileDistribution.map((d) => d.count));

  return (
    <>
      <PageHeader
        title="Resumen"
        description="Estado global de la plataforma: organizaciones, evaluaciones y actividad."
      >
        <Link
          href="/admin/organizaciones"
          className="bg-brand rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-200 transition hover:opacity-95"
        >
          + Nueva organización
        </Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Organizaciones"
          value={orgCount}
          accent="#00a1e0"
          icon={<IconOrg />}
        />
        <StatCard
          label="Usuarios"
          value={userCount}
          accent="#0ea5e9"
          icon={<IconUsers />}
        />
        <StatCard
          label="Participantes"
          value={participantCount}
          accent="#10b981"
          hint={`${participantStatus.completed} completados`}
          icon={<IconUserCheck />}
        />
        <StatCard
          label="Informes"
          value={resultCount}
          accent="#f59e0b"
          hint={`EQ medio ${eqAverage || "—"}`}
          icon={<IconReport />}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Cumplimentación" description="Estado de los participantes invitados">
          <div className="flex flex-wrap items-center gap-7">
            <ProgressRing value={completionRate} label="completado" size={120} />
            <div className="min-w-[200px] flex-1 space-y-3.5">
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
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600">{row.label}</span>
                      <span className="text-slate-400">
                        {row.value} · {pct}%
                      </span>
                    </div>
                    <Progress value={pct} color={row.color} />
                  </div>
                );
              })}
            </div>
          </div>
          <p className="mt-5 border-t border-slate-100 pt-3 text-xs text-slate-400">
            Invitaciones · {invitationStatus.pending} pendientes ·{" "}
            {invitationStatus.sent} enviadas · {invitationStatus.opened} abiertas ·{" "}
            {invitationStatus.completed} completadas · {invitationStatus.expired}{" "}
            expiradas
          </p>
        </Card>

        <Card
          title="Distribución de perfiles"
          description={`Tendencia primaria de los ${resultCount} informes (no es un diagnóstico)`}
        >
          {resultCount === 0 ? (
            <EmptyState title="Aún no hay informes" hint="Aparecerán al completarse evaluaciones." />
          ) : (
            <div className="space-y-4">
              {[...def.dimensions]
                .sort((a, b) => a.order - b.order)
                .map((dim) => {
                  const count = distByCode.get(dim.code) ?? 0;
                  const width = Math.round((count / maxDist) * 100);
                  return (
                    <div key={dim.code} className="flex items-center gap-3">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white"
                        style={{ backgroundColor: dim.color }}
                      >
                        {dim.code}
                      </span>
                      <span className="w-24 shrink-0 text-xs font-medium text-slate-600">
                        {dim.name}
                      </span>
                      <div className="flex-1">
                        <Progress value={width} color={dim.color} />
                      </div>
                      <span className="w-7 shrink-0 text-right text-sm font-bold text-slate-700">
                        {count}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </Card>
      </div>

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
                        <span className="font-semibold text-slate-800">
                          {r.fullName}
                        </span>
                      </div>
                    </td>
                    <td className={`${tableCls.td} text-slate-500`}>{r.orgName}</td>
                    <td className={tableCls.td}>
                      <ProfileChip code={r.profileCode} />
                    </td>
                    <td className={`${tableCls.td} font-semibold text-slate-700`}>
                      {r.eq}
                    </td>
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
    </>
  );
}
