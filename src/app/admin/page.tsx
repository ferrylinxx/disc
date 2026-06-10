import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { adminOverview, adminUsers } from "@/lib/data/dashboard";
import { getActiveInstrument } from "@/lib/instruments";
import { isMailConfigured } from "@/lib/email/mailer";
import { CreateOrgForm } from "@/components/dashboard/Forms";
import { SmtpCheckButton } from "@/components/dashboard/SmtpCheckButton";
import { AdminTabs } from "@/components/dashboard/AdminTabs";
import { UserManager } from "@/components/dashboard/UserManager";
import { CatalogView } from "@/components/dashboard/CatalogView";
import {
  Avatar,
  ProgressRing,
  StatTile,
} from "@/components/dashboard/AdminWidgets";

export const metadata = { title: "Admin GESEM · Panel" };

const dateFmt = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short",
});

const dayFmt = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const heroPill =
  "rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25";

/** Iconos de trazo (20px) usados en KPIs y pestañas. */
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
const IconChart = () => (
  <svg viewBox="0 0 24 24" className={ic} {...svg}>
    <path d="M3 3v18h18M8 16v-4M13 16V9M18 16v-7" />
  </svg>
);
const IconServer = () => (
  <svg viewBox="0 0 24 24" className={ic} {...svg}>
    <rect x="3" y="4" width="18" height="7" rx="2" />
    <rect x="3" y="13" width="18" height="7" rx="2" />
    <path d="M7 7.5h.01M7 16.5h.01" />
  </svg>
);
const IconBook = () => (
  <svg viewBox="0 0 24 24" className={ic} {...svg}>
    <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM19 17H6a2 2 0 0 0-2 2" />
  </svg>
);

export default async function AdminPage() {
  const session = await requireRole("SUPERADMIN");
  const [
    {
      orgCount,
      userCount,
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
    { users, organizations: orgOptions },
  ] = await Promise.all([adminOverview(), adminUsers()]);

  const def = getActiveInstrument();
  const mailReady = isMailConfigured();
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  const distByCode = new Map(profileDistribution.map((d) => [d.code, d.count]));
  const maxDist = Math.max(1, ...profileDistribution.map((d) => d.count));

  const greetName = (session.name ?? session.email).split(" ")[0];
  const today = dayFmt.format(new Date());

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      <section className="bg-brand animate-fade-up relative overflow-hidden rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20">
        <div
          className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="min-w-[260px]">
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
              Admin GESEM
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Hola, {greetName}
            </h1>
            <p className="mt-1 text-sm capitalize text-white/70">{today}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/cliente" className={heroPill}>
                Panel cliente
              </Link>
              <Link href="/facilitador" className={heroPill}>
                Facilitador
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-5 rounded-2xl bg-white/95 px-6 py-4 shadow-lg">
            <ProgressRing value={completionRate} label="completado" />
            <div className="text-slate-700">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Evaluaciones
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {participantStatus.completed}
                <span className="text-base font-medium text-slate-400">
                  {" "}
                  / {participantCount}
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {participantStatus.inProgress} en curso ·{" "}
                {participantStatus.invited} invitados
              </div>
            </div>
          </div>
        </div>
      </section>

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

      <AdminTabs
        tabs={[
          {
            id: "resumen",
            label: "Resumen",
            icon: <IconChart />,
            content: (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <StatTile
                    label="Tasa de finalización"
                    value={`${completionRate}%`}
                    accent="#10b981"
                    icon={<IconUserCheck />}
                  />
                  <StatTile
                    label="EQ medio"
                    value={eqAverage || "—"}
                    accent="#0ea5e9"
                    hint="tendencia"
                    icon={<IconChart />}
                  />
                  <StatTile
                    label="Invitaciones enviadas"
                    value={invitationStatus.sent + invitationStatus.opened}
                    accent="#6366f1"
                    icon={<IconReport />}
                  />
                </div>

                <section className="glass animate-fade-up rounded-2xl border border-white/60 p-6">
                  <h2 className="mb-4 text-lg font-semibold text-slate-900">
                    Cumplimentación
                  </h2>
                  <div className="space-y-3">
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
                  <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    Invitaciones · {invitationStatus.pending} pendientes ·{" "}
                    {invitationStatus.sent} enviadas · {invitationStatus.opened} abiertas
                    · {invitationStatus.completed} completadas ·{" "}
                    {invitationStatus.expired} expiradas
                  </div>
                </section>

                <section className="glass animate-fade-up rounded-2xl border border-white/60 p-6">
                  <h2 className="mb-1 text-lg font-semibold text-slate-900">
                    Distribución de perfiles
                  </h2>
                  <p className="mb-4 text-sm text-slate-500">
                    Tendencia primaria de los {resultCount} informes generados (no
                    es un diagnóstico).
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
                                  style={{ width: `${width}%`, backgroundColor: dim.color }}
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
                              <div className="font-semibold text-slate-900">{r.fullName}</div>
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
            ),
          },
          {
            id: "organizaciones",
            label: "Organizaciones",
            badge: organizations.length,
            icon: <IconOrg />,
            content: (
              <>
                <section className="glass animate-fade-up rounded-2xl border border-white/60 p-6">
                  <h2 className="mb-1 text-lg font-semibold text-slate-900">
                    Nueva organización
                  </h2>
                  <p className="mb-4 text-sm text-slate-500">
                    Crea un cliente para empezar a estructurar proyectos y equipos.
                  </p>
                  <CreateOrgForm />
                </section>

                <section className="glass animate-fade-up rounded-2xl border border-white/60 p-6">
                  <h2 className="mb-4 text-lg font-semibold text-slate-900">
                    Organizaciones ({organizations.length})
                  </h2>
                  {organizations.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Aún no hay organizaciones. Crea la primera arriba.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {organizations.map((org) => {
                        const pct =
                          org._count.participants > 0
                            ? Math.round((org.completed / org._count.participants) * 100)
                            : 0;
                        return (
                          <div
                            key={org.id}
                            className="rounded-2xl border border-slate-200 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-indigo-100"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar name={org.name} />
                              <div className="min-w-0">
                                <div className="truncate font-semibold text-slate-900">
                                  {org.name}
                                </div>
                                <div className="truncate text-xs text-slate-400">
                                  /{org.slug}
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500">
                              <span>{org._count.projects} proyectos</span>
                              <span>·</span>
                              <span>{org._count.members} gestores</span>
                              <span>·</span>
                              <span>{org._count.participants} participantes</span>
                            </div>
                            <div className="mt-3">
                              <div className="mb-1 flex items-center justify-between text-xs">
                                <span className="font-medium text-slate-600">
                                  Completados
                                </span>
                                <span className="text-slate-400">
                                  {org.completed} · {pct}%
                                </span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-emerald-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </>
            ),
          },
          {
            id: "usuarios",
            label: "Usuarios",
            badge: users.length,
            icon: <IconUsers />,
            content: (
              <UserManager
                users={users}
                organizations={orgOptions}
                currentUserId={session.userId}
              />
            ),
          },
          {
            id: "catalogo",
            label: "Catálogo",
            icon: <IconBook />,
            content: <CatalogView dimensions={def.dimensions} />,
          },
          {
            id: "sistema",
            label: "Sistema",
            icon: <IconServer />,
            content: (
              <section className="glass animate-fade-up rounded-2xl border border-white/60 p-6">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">
                  Estado del sistema
                </h2>
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      mailReady
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${mailReady ? "bg-emerald-500" : "bg-amber-500"}`}
                    />
                    SMTP {mailReady ? "configurado" : "sin configurar"}
                  </span>
                </div>
                <SmtpCheckButton />
                <dl className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Instrumento activo</dt>
                    <dd className="font-medium text-slate-900">
                      {def.instrumentName} · v{def.version}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Estructura</dt>
                    <dd className="font-medium text-slate-900">
                      {def.dimensions.length} dimensiones · {def.contexts.length}{" "}
                      contextos · {def.items.length} ítems
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">URL de la app</dt>
                    <dd className="truncate font-mono text-xs text-slate-600">
                      {appUrl}
                    </dd>
                  </div>
                </dl>
              </section>
            ),
          },
        ]}
      />
    </main>
  );
}
