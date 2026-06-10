import type { Dimension } from "@/lib/engine/types";
import type { TeamInsights } from "@/lib/analytics/team";
import { styleShort } from "@/lib/narratives/disc-gesem.catalog";

interface Props {
  insights: TeamInsights;
  dimensions: Dimension[];
}

/** Las 10 pantallas del mapa de equipo, con su ancla de navegación. */
const SCREENS = [
  { id: "vision", label: "Visión general" },
  { id: "distribucion", label: "Distribución DISC" },
  { id: "combinaciones", label: "Combinaciones" },
  { id: "contextos", label: "Mapa de contextos" },
  { id: "fortalezas", label: "Fortalezas" },
  { id: "riesgos", label: "Riesgos" },
  { id: "complementariedad", label: "Complementariedad" },
  { id: "vacios", label: "Vacíos" },
  { id: "conversaciones", label: "Conversaciones" },
  { id: "plan", label: "Plan de equipo" },
];

/**
 * Mapa de equipo avanzado: lectura colectiva en 10 pantallas a partir de la
 * analítica del equipo. Redacción en clave de tendencia/hipótesis (AGENTS.md).
 */
export function TeamMap({ insights, dimensions }: Props) {
  const color = new Map(dimensions.map((d) => [d.code, d.color]));
  const name = new Map(dimensions.map((d) => [d.code, d.name]));
  const dye = (code: string) => color.get(code) ?? "#64748b";
  const empty = insights.overview.completed === 0;

  return (
    <div className="space-y-6">
      <nav className="glass no-print sticky top-2 z-10 flex flex-wrap gap-1.5 rounded-2xl border border-white/60 p-2">
        {SCREENS.map((s, i) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-brand-soft hover:text-brand"
          >
            <span className="text-slate-400">{i + 1}.</span> {s.label}
          </a>
        ))}
      </nav>

      {empty && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Aún no hay resultados suficientes para generar la lectura del equipo.
          Las pantallas se completarán a medida que el equipo finalice sus evaluaciones.
        </p>
      )}

      <Screen id="vision" n={1} title="Visión general">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="Participantes" value={insights.overview.total} accent="#6366f1" />
          <Tile label="Completados" value={insights.overview.completed} accent="#10b981" />
          <Tile label="Participación" value={`${insights.overview.participation}%`} accent="#0ea5e9" />
          <Tile label="EQ medio" value={empty ? "—" : insights.overview.eqAverage} accent="#f59e0b" />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Fact label="Combinación predominante" value={insights.overview.predominantProfile?.name ?? "—"} />
          <Fact
            label="Estilo predominante"
            value={
              insights.overview.predominantStyle
                ? `${styleShort(insights.overview.predominantStyle.code)} · ${insights.overview.predominantStyle.share}%`
                : "—"
            }
          />
        </div>
      </Screen>

      <Screen id="distribucion" n={2} title="Distribución DISC del equipo">
        <p className="mb-4 text-sm text-slate-600">{insights.distributionText}</p>
        <div className="space-y-2.5">
          {insights.distribution.map((d) => (
            <BarRow
              key={d.dimensionCode}
              label={`${styleShort(d.dimensionCode)} · ${name.get(d.dimensionCode) ?? d.dimensionCode}`}
              value={d.share}
              color={dye(d.dimensionCode)}
            />
          ))}
        </div>
      </Screen>

      <Screen id="combinaciones" n={3} title="Distribución de combinaciones">
        {insights.combinations.length === 0 ? (
          <Muted />
        ) : (
          <ul className="space-y-2.5">
            {insights.combinations.map((c) => (
              <li key={c.code} className="flex items-center gap-3">
                <span className="w-12 shrink-0 rounded-lg bg-slate-900 px-2 py-1 text-center text-xs font-bold text-white">
                  {c.code}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-800">{c.name}</div>
                  <div className="text-xs text-slate-400">
                    {c.count} {c.count === 1 ? "persona" : "personas"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Screen>

      <Screen id="contextos" n={4} title="Mapa de contextos">
        {empty ? (
          <Muted />
        ) : (
          <ContextHeatmap insights={insights} dimensions={dimensions} dye={dye} />
        )}
      </Screen>

      <Screen id="fortalezas" n={5} title="Fortalezas colectivas">
        <Bullets items={insights.strengths} tone="emerald" />
      </Screen>

      <Screen id="riesgos" n={6} title="Riesgos colectivos">
        <Bullets items={insights.risks} tone="amber" />
      </Screen>

      <Screen id="complementariedad" n={7} title="Complementariedad">
        {insights.complementarity.length === 0 ? (
          <Muted />
        ) : (
          <ul className="space-y-3">
            {insights.complementarity.map((c) => (
              <li key={c.dimensionCode} className="flex items-start gap-3">
                <span
                  className="mt-0.5 shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: dye(c.dimensionCode) }}
                >
                  {styleShort(c.dimensionCode)} {c.share}%
                </span>
                <p className="text-sm text-slate-600">{c.text}</p>
              </li>
            ))}
          </ul>
        )}
      </Screen>

      <Screen id="vacios" n={8} title="Vacíos del equipo (estilos poco presentes)">
        {insights.gaps.length === 0 ? (
          <p className="text-sm text-slate-500">
            No se detectan estilos por debajo del umbral: el equipo cubre las
            cuatro tendencias de forma razonable.
          </p>
        ) : (
          <ul className="space-y-3">
            {insights.gaps.map((g) => (
              <li
                key={g.dimensionCode}
                className="rounded-xl border border-slate-100 bg-white/60 p-3"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: dye(g.dimensionCode) }}
                  />
                  <span className="text-sm font-semibold text-slate-800">
                    {styleShort(g.dimensionCode)}
                  </span>
                  <span className="text-xs text-slate-400">{g.share}%</span>
                </div>
                <p className="text-sm text-slate-600">{g.observation}</p>
              </li>
            ))}
          </ul>
        )}
      </Screen>

      <Screen id="conversaciones" n={9} title="Conversaciones recomendadas">
        <Bullets items={insights.conversations} tone="sky" />
      </Screen>

      <Screen id="plan" n={10} title="Plan de acción de equipo">
        <ol className="space-y-2.5">
          {insights.actionPlan.map((p, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
              <span className="bg-brand-soft text-brand mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                {i + 1}
              </span>
              {p}
            </li>
          ))}
        </ol>
        {insights.insights.length > 0 && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Insights</h3>
            <Bullets items={insights.insights} tone="indigo" />
          </div>
        )}
        <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
          Estos resultados describen tendencias del equipo según las respuestas
          y no constituyen un diagnóstico. Úsalos como punto de partida para la
          conversación y el desarrollo; pueden variar según el contexto y el momento.
        </p>
      </Screen>
    </div>
  );
}

/** Recuadro contenedor de cada pantalla, con ancla y numeración. */
function Screen({
  id,
  n,
  title,
  children,
}: {
  id: string;
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="glass animate-fade-up scroll-mt-20 rounded-2xl border border-white/60 p-6"
    >
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
        <span className="bg-brand-soft text-brand flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Tarjeta KPI compacta con acento de color. */
function Tile({ label, value, accent }: { label: string; value: React.ReactNode; accent: string }) {
  return (
    <div
      className="rounded-2xl border border-slate-100 bg-white/70 p-4"
      style={{ borderTopColor: accent, borderTopWidth: 3 }}
    >
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}

/** Dato destacado etiqueta/valor. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/60 p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className="text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}

/** Barra horizontal con etiqueta y porcentaje. */
function BarRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="text-slate-400">{value}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

const TONES: Record<string, string> = {
  emerald: "before:bg-emerald-400",
  amber: "before:bg-amber-400",
  sky: "before:bg-sky-400",
  indigo: "before:bg-indigo-400",
};

/** Lista con viñetas de color (fortalezas, riesgos, conversaciones, insights). */
function Bullets({ items, tone }: { items: string[]; tone: keyof typeof TONES }) {
  if (items.length === 0) return <Muted />;
  return (
    <ul className="space-y-2">
      {items.map((t, i) => (
        <li
          key={i}
          className={`relative pl-5 text-sm text-slate-600 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full ${TONES[tone]}`}
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

/** Texto de respaldo cuando una sección no tiene datos. */
function Muted() {
  return <p className="text-sm text-slate-400">Sin datos suficientes todavía.</p>;
}

/** Mapa de calor contextos × dimensiones (% medio del equipo por contexto). */
function ContextHeatmap({
  insights,
  dimensions,
  dye,
}: {
  insights: TeamInsights;
  dimensions: Dimension[];
  dye: (code: string) => string;
}) {
  const dims = [...dimensions].sort((a, b) => a.order - b.order);
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="p-2 text-left text-xs font-semibold text-slate-500">Contexto</th>
            {dims.map((d) => (
              <th key={d.code} className="p-2 text-center text-xs font-semibold" style={{ color: dye(d.code) }}>
                {styleShort(d.code)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {insights.contexts.map((ctx) => (
            <tr key={ctx.code} className="border-t border-slate-100">
              <td className="p-2 font-medium text-slate-700">{ctx.name}</td>
              {dims.map((d) => {
                const cell = ctx.scores.find((s) => s.dimensionCode === d.code);
                const pct = cell?.percent ?? 0;
                return (
                  <td key={d.code} className="p-1 text-center">
                    <div
                      className="mx-auto flex h-9 w-full max-w-[64px] items-center justify-center rounded-lg text-xs font-semibold"
                      style={{
                        backgroundColor: dye(d.code),
                        opacity: 0.15 + (Math.min(100, pct) / 100) * 0.85,
                        color: pct > 45 ? "#fff" : "#334155",
                      }}
                      title={`${ctx.name} · ${styleShort(d.code)}: ${pct}%`}
                    >
                      {pct}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
