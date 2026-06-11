import { requireRole } from "@/lib/auth/dal";
import { adminOverview } from "@/lib/data/dashboard";
import { getActiveInstrument } from "@/lib/instruments";
import {
  Avatar,
  ProgressRing,
  StatTile,
} from "@/components/dashboard/AdminWidgets";

export const metadata = { title: "Resumen · Consola GESEM" };

const dateFmt = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short",
});

/** Iconos de trazo (20px) usados en los KPIs. */
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

/** Resumen global de la plataforma (KPIs, cumplimentación y actividad). */
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Organizaciones"
          value={orgCount}
          accent="#6366f1"
          icon={<IconOrg />}
        />
        <StatTile
          label="Usuarios"
          value={userCount}
          accent="#0ea5e9"
          icon={<IconUsers />}
        />
        <StatTile
          label="Participantes"
          value={participantCount}
          accent="#10b981"
          icon={<IconUserCheck />}
        />
        <StatTile
          label="Informes"
          value={resultCount}
          accent="#f59e0b"
          hint={`EQ medio ${eqAverage || "—"}`}
          icon={<IconReport />}
        />
      </div>

      <section className="glass animate-fade-up rounded-2xl border border-white/60 p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Cumplimentación
        </h2>
        <div className="flex flex-wrap items-center gap-6">
          <ProgressRing value={completionRate} label="completado" />
          <div className="min-w-[220px] flex-1 space-y-3">
            {[
              {
                label: "Invitados",
                value: participantStatus.invited,
                color: "#94a3b8",
              },
              {
                label: "En curso",
                value: participantStatus.inProgress,
                color: "#f59e0b",
              },
              {
                label: "Completados",
                value: participantStatus.completed,
                color: "#10b981",
              },
            ].map((row) => {
              const pct =
                participantCount > 0
                  ? Math.round((row.value / participantCount) * 100)
                  : 0;
              return (
                <div key={row.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">
                      {row.label}
                    </span>
                    <span className="text-slate-400">
                      {row.value} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: row.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
          Invitaciones · {invitationStatus.pending} pendientes ·{" "}
          {invitationStatus.sent} enviadas · {invitationStatus.opened} abiertas ·{" "}
          {invitationStatus.completed} completadas · {invitationStatus.expired}{" "}
          expiradas
        </div>
      </section>

      <section className="glass animate-fade-up rounded-2xl border border-white/60 p-6">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">
          Distribución de perfiles
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Tendencia primaria de los {resultCount} informes generados (no es un
          diagnóstico).
        </p>
        {resultCount === 0 ? (
          <p className="text-sm text-slate-400">Aún no hay informes.</p>
        ) : (
          <div className="space-y-3">
            {[...def.dimensions]
              .sort((a, b) => a.order - b.order)
              .map((dim) => {
                const count = distByCode.get(dim.code) ?? 0;
                const width = Math.round((count / maxDist) * 100);
                return (
                  <div key={dim.code} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-sm text-slate-600">
                      {dim.code} · {dim.name}
                    </span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${width}%`,
                          backgroundColor: dim.color,
                        }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-sm font-semibold text-slate-700">
                      {count}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      <section className="glass animate-fade-up rounded-2xl border border-white/60 p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Actividad reciente
        </h2>
        {recent.length === 0 ? (
          <p className="text-sm text-slate-500">
            Todavía no se ha completado ninguna evaluación.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={r.fullName} />
                  <div>
                    <div className="font-semibold text-slate-900">
                      {r.fullName}
                    </div>
                    <div className="text-xs text-slate-400">{r.orgName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                    {r.profileCode}
                  </span>
                  <span>EQ {r.eq}</span>
                  <span>{dateFmt.format(r.computedAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
