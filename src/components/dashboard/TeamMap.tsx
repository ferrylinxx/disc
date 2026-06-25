import type { Dimension } from "@/lib/engine/types";
import type { TeamInsights } from "@/lib/analytics/team";
import { styleShort } from "@/lib/narratives/disc-gesem.catalog";

interface Props {
  insights: TeamInsights;
  dimensions: Dimension[];
  /** Cabecera del equipo (nombre, organización, unidad, fecha, nº participantes). */
  header?: {
    name: string;
    organizationName: string;
    projectName: string;
    createdAt: string;
    total: number;
  };
}

/** Pantallas del mapa de equipo (informe ejecutivo), con su ancla. */
const SCREENS = [
  { id: "vision", label: "Radiografía" },
  { id: "mapa-disc", label: "Mapa DISC" },
  { id: "distribucion", label: "Recursos" },
  { id: "combinaciones", label: "Combinaciones" },
  { id: "contextos", label: "Contextos" },
  { id: "fortalezas", label: "Fortalezas" },
  { id: "riesgos", label: "A observar" },
  { id: "complementariedad", label: "Complementariedad" },
  { id: "vacios", label: "Vacíos" },
  { id: "conversaciones", label: "Conversaciones" },
  { id: "plan", label: "Plan de equipo" },
];

/**
 * Mapa de equipo avanzado: lectura colectiva en 10 pantallas a partir de la
 * analítica del equipo. Redacción en clave de tendencia/hipótesis (AGENTS.md).
 */
export function TeamMap({ insights, dimensions, header }: Props) {
  const color = new Map(dimensions.map((d) => [d.code, d.color]));
  const name = new Map(dimensions.map((d) => [d.code, d.name]));
  const dye = (code: string) => color.get(code) ?? "#64748b";
  const empty = insights.overview.completed === 0;
  const teamDate = header
    ? new Date(header.createdAt).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

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

      <Screen id="vision" n={1} title="Radiografía del equipo">
        {header && (
          <div className="mb-4 grid gap-3 rounded-2xl border border-slate-100 bg-white/60 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <Fact label="Organización" value={header.organizationName} />
            <Fact label="Unidad / proyecto" value={header.projectName} />
            <Fact label="Equipo" value={header.name} />
            <Fact label="Fecha" value={teamDate ?? "—"} />
          </div>
        )}
        {!empty && (
          <p className="mb-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm leading-relaxed text-slate-600">
            {insights.executiveSummary}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="Participantes" value={insights.overview.total} accent="#00a1e0" />
          <Tile label="Completados" value={insights.overview.completed} accent="#10b981" />
          <Tile label="Participación" value={`${insights.overview.participation}%`} accent="#0ea5e9" />
          <Tile label="EQ medio" value={empty ? "—" : insights.overview.eqAverage} accent="#f59e0b" />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Fact label="Combinación predominante" value={insights.overview.predominantProfile?.name ?? "—"} />
          <Fact
            label="Recurso predominante"
            value={
              insights.overview.predominantStyle
                ? styleShort(insights.overview.predominantStyle.code)
                : "—"
            }
          />
          <Fact
            label="Diversidad del equipo"
            value={
              insights.overview.diversity
                ? `${insights.overview.diversity.level} · ${insights.overview.diversity.distinct} ${insights.overview.diversity.distinct === 1 ? "perfil" : "perfiles"}`
                : "—"
            }
          />
        </div>
      </Screen>

      <Screen id="mapa-disc" n={2} title="Mapa DISC del equipo">
        {empty ? (
          <Muted />
        ) : (
          <div className="grid items-center gap-6 lg:grid-cols-[auto_1fr]">
            <TeamDiscGrid points={insights.discPoints} dye={dye} />
            <div>
              <p className="text-sm leading-relaxed text-slate-600">
                Cada punto representa a una persona del equipo, situada según los
                recursos que utiliza con más frecuencia. Las agrupaciones muestran
                dónde se concentra el equipo y qué zonas aparecen menos presentes.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {insights.combinations.map((c) => (
                  <span
                    key={c.code}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                  >
                    <span className="font-bold text-slate-900">{c.code}</span>
                    {c.count}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Screen>

      <Screen id="distribucion" n={3} title="Distribución de recursos predominantes">
        <p className="mb-4 text-sm text-slate-600">{insights.distributionText}</p>
        <div className="grid items-center gap-6 lg:grid-cols-2">
          <Radar
            data={insights.distribution.map((d) => ({
              code: d.dimensionCode,
              label: styleShort(d.dimensionCode),
              value: d.share,
              color: dye(d.dimensionCode),
            }))}
          />
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
        </div>
        {insights.readingKeys.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Claves de lectura
            </p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {insights.readingKeys.map((k) => (
                <li
                  key={k}
                  className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm text-slate-600"
                >
                  {k}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Screen>

      <Screen id="combinaciones" n={4} title="Distribución de combinaciones" detail>
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

      <Screen id="contextos" n={5} title="Mapa de contextos" detail>
        {empty ? (
          <Muted />
        ) : (
          <ContextHeatmap insights={insights} dimensions={dimensions} dye={dye} />
        )}
      </Screen>

      <Screen id="fortalezas" n={6} title="Recursos que caracterizan al equipo">
        <Bullets items={insights.strengths} tone="emerald" />
      </Screen>

      <Screen id="riesgos" n={7} title="Aspectos que merece la pena observar">
        <Bullets items={insights.risks} tone="sky" />
      </Screen>

      <Screen id="complementariedad" n={8} title="Cómo interactúan los recursos predominantes" detail>
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
                  {styleShort(c.dimensionCode)}
                </span>
                <p className="text-sm text-slate-600">{c.text}</p>
              </li>
            ))}
          </ul>
        )}
      </Screen>

      <Screen id="vacios" n={9} title="Vacíos del equipo (estilos poco presentes)">
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
                </div>
                <p className="text-sm text-slate-600">{g.observation}</p>
              </li>
            ))}
          </ul>
        )}
      </Screen>

      <Screen id="conversaciones" n={10} title="Conversaciones recomendadas">
        <Bullets items={insights.conversations} tone="sky" />
      </Screen>

      <Screen id="plan" n={11} title="Conclusiones y plan de equipo">
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
  detail = false,
}: {
  id: string;
  n: number;
  title: string;
  children: React.ReactNode;
  /** Pantalla ampliada (solo PDF facilitador): se oculta en el PDF ejecutivo. */
  detail?: boolean;
}) {
  return (
    <section
      id={id}
      data-detail={detail ? "" : undefined}
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

/**
 * Mapa DISC del equipo: cuadrícula clásica 2×2 con un punto por participante.
 * D arriba-izq, I arriba-der, C abajo-izq, S abajo-der.
 */
function TeamDiscGrid({
  points,
  dye,
}: {
  points: { x: number; y: number; code: string }[];
  dye: (c: string) => string;
}) {
  const quad = (code: string, qx: number, qy: number) => (
    <g key={code}>
      <rect x={qx} y={qy} width={90} height={90} fill={dye(code)} opacity={0.08} />
      <text x={qx + 10} y={qy + 28} fontSize="24" fontWeight="800" fill={dye(code)} opacity={0.4}>
        {code}
      </text>
    </g>
  );
  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 200 200" className="h-64 w-64" role="img" aria-label="Mapa DISC del equipo">
        <rect x="10" y="10" width="180" height="180" rx="14" fill="#ffffff" stroke="#e2e8f0" />
        {quad("D", 10, 10)}
        {quad("I", 100, 10)}
        {quad("C", 10, 100)}
        {quad("S", 100, 100)}
        <line x1="100" y1="12" x2="100" y2="188" stroke="#e2e8f0" strokeWidth="1.5" />
        <line x1="12" y1="100" x2="188" y2="100" stroke="#e2e8f0" strokeWidth="1.5" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="6"
            fill={dye(p.code)}
            fillOpacity="0.75"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        ))}
      </svg>
    </div>
  );
}

/**
 * Radar (SVG) de los recursos colectivos. Polígono de 4 ejes (D/I/S/C) con la
 * intensidad relativa del equipo. Sin dependencias externas.
 */
function Radar({
  data,
}: {
  data: { code: string; label: string; value: number; color: string }[];
}) {
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const r = 88;
  const n = data.length;
  // Eje i en ángulo (empezando arriba, sentido horario).
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, radius: number) => ({
    x: cx + radius * Math.cos(angle(i)),
    y: cy + radius * Math.sin(angle(i)),
  });
  const valuePoints = data
    .map((d, i) => {
      const p = point(i, (Math.min(100, Math.max(0, d.value)) / 100) * r);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(" ");
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <div className="flex justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-56 w-56" role="img" aria-label="Radar de recursos del equipo">
        {rings.map((f) => (
          <polygon
            key={f}
            points={data
              .map((_, i) => {
                const p = point(i, r * f);
                return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
              })
              .join(" ")}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}
        {data.map((_, i) => {
          const p = point(i, r);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="1" />;
        })}
        <polygon points={valuePoints} fill="rgba(0,161,224,0.18)" stroke="#00a1e0" strokeWidth="2" />
        {data.map((d, i) => {
          const p = point(i, (Math.min(100, Math.max(0, d.value)) / 100) * r);
          return <circle key={d.code} cx={p.x} cy={p.y} r="3.5" fill={d.color} />;
        })}
        {data.map((d, i) => {
          const p = point(i, r + 16);
          return (
            <text
              key={d.code}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-600 text-[10px] font-semibold"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/** Barra horizontal con etiqueta (intensidad relativa, sin porcentaje). */
function BarRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700">{label}</span>
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
  indigo: "before:bg-sky-400",
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
