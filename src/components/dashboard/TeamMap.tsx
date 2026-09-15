import type { Dimension } from "@/lib/engine/types";
import type { TeamInsights } from "@/lib/analytics/team";
import { styleShort } from "@/lib/narratives/disc-gesem.catalog";
import { discGrad, discGradStrong, discGradStops } from "@/lib/disc-gradient";
import { ProfileChip } from "@/components/admin/ui";
import { layoutTeamBubbles, QUAD_ORIGIN, TEAM_GRID } from "@/lib/team-bubbles";

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

/**
 * Pantallas del Informe de Equipo, alineadas con la Especificación Funcional
 * V1 (13 secciones oficiales). "Contextos" se conserva como detalle ampliado
 * (solo PDF del facilitador).
 */
const SCREENS = [
  { id: "portada", label: "Resumen" },
  { id: "mapa-disc", label: "Mapa conductual" },
  { id: "lectura-global", label: "Lectura global" },
  { id: "distribucion-perfiles", label: "Distribución por perfiles" },
  { id: "recursos", label: "Recursos colectivos" },
  { id: "observar", label: "A observar" },
  { id: "comunicacion", label: "Comunicación" },
  { id: "decisiones", label: "Toma de decisiones" },
  { id: "coordinacion", label: "Coordinación" },
  { id: "cambio", label: "Gestión del cambio" },
  { id: "complementariedad", label: "Complementariedad" },
  { id: "homogeneidad", label: "Riesgos de homogeneidad" },
  { id: "claves", label: "Claves para potenciar" },
  { id: "contextos", label: "Contextos" },
];

/**
 * Informe de Equipo DISC GESEM: lectura colectiva del sistema según la
 * Especificación Funcional V1 (13 secciones). Redacción en clave de
 * tendencia/hipótesis, nunca diagnóstico (AGENTS.md). Describe el equipo como
 * sistema; nunca evalúa personas individualmente.
 */
export function TeamMap({ insights, dimensions, header }: Props) {
  const name = new Map(dimensions.map((d) => [d.code, d.name]));
  // Color base de cada dimensión = primera parada del degradado DISC oficial.
  const dye = (code: string) => discGradStops(code)[0];
  const empty = insights.overview.completed === 0;
  const completed = insights.overview.completed;
  const pctOf = (count: number) =>
    completed > 0 ? Math.round((count / completed) * 100) : 0;
  const teamDate = header
    ? new Date(header.createdAt).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Índice en una sola fila desplazable, fijo bajo la cabecera de la web. */}
      <nav className="no-print sticky top-20 z-20 flex gap-1 overflow-x-auto rounded-2xl border border-slate-200/70 bg-white/90 p-1.5 shadow-sm backdrop-blur">
        {SCREENS.map((s, i) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-sky-50 hover:text-sky-700"
          >
            <span className="text-slate-400">{i + 1}.</span> {s.label}
          </a>
        ))}
      </nav>

      {empty && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Aún no hay resultados suficientes para generar la lectura del equipo.
          Las secciones se completarán a medida que el equipo finalice sus evaluaciones.
        </p>
      )}

      {/* 1 · Portada (en pantalla, "Resumen del equipo"; en el PDF abre el informe) */}
      <Screen id="portada" n={1} title="Resumen del equipo">
        {header && (
          <div className="mb-4 grid gap-3 rounded-2xl border border-slate-100 bg-white/60 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <Fact label="Organización" value={header.organizationName} />
            <Fact label="Unidad / proyecto" value={header.projectName} />
            <Fact label="Equipo" value={header.name} />
            <Fact label="Fecha" value={teamDate ?? "—"} />
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="Participantes" value={insights.overview.total} accent="#00a1e0" />
          <Tile label="Completados" value={completed} accent="#10b981" />
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

      {/* 2 · Mapa conductual del equipo */}
      <Screen id="mapa-disc" n={2} title="Mapa conductual del equipo">
        {empty ? (
          <Muted />
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <TeamDiscGrid points={insights.discPoints} dye={dye} />
            <div>
              <p className="text-sm leading-relaxed text-slate-600">
                Cada burbuja representa a una persona del equipo, numerada según la
                leyenda y situada según los recursos que utiliza con más frecuencia.
                Las agrupaciones muestran dónde se concentra el equipo.
              </p>
              <ul
                className={`mt-4 grid gap-x-5 gap-y-1.5 ${
                  insights.discPoints.length > 8 ? "sm:grid-cols-2" : ""
                }`}
              >
                {insights.discPoints.map((p) => (
                  <li key={p.n} className="flex min-w-0 items-center gap-2.5 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-white">
                      {p.n}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium text-slate-700">
                      {p.name}
                    </span>
                    <ProfileChip code={p.profile} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Screen>

      {/* 3 · Lectura global del equipo */}
      <Screen id="lectura-global" n={3} title="Lectura global del equipo">
        {empty ? (
          <Muted />
        ) : (
          <p className="text-sm leading-relaxed text-slate-600">
            {insights.executiveSummary}
          </p>
        )}
      </Screen>

      {/* 4 · Distribución por perfiles (tabla con %) */}
      <Screen id="distribucion-perfiles" n={4} title="Distribución por perfiles">
        {insights.combinations.length === 0 ? (
          <Muted />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-3 py-2">Perfil</th>
                    <th className="px-3 py-2 text-right">Participantes</th>
                    <th className="px-3 py-2 text-right">%</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.combinations.map((c) => (
                    <tr key={c.code} className="border-b border-slate-50">
                      <td className="px-3 py-2">
                        <span className="mr-2">
                          <ProfileChip code={c.code} />
                        </span>
                        <span className="text-slate-700">{c.name}</span>
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-700">{c.count}</td>
                      <td className="px-3 py-2 text-right text-slate-500">{pctOf(c.count)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{insights.distributionText}</p>
          </>
        )}
      </Screen>

      {/* 5 · Recursos colectivos */}
      <Screen id="recursos" n={5} title="Recursos colectivos">
        {/* Barras con su peso en el equipo. Sustituyen al radar: con valores entre
            el 10 y el 35 % quedaba un rombo diminuto en el centro, ilegible. */}
        <div className="space-y-3">
          {insights.distribution.map((d) => (
            <BarRow
              key={d.dimensionCode}
              label={`${styleShort(d.dimensionCode)} · ${name.get(d.dimensionCode) ?? d.dimensionCode}`}
              value={d.share}
              code={d.dimensionCode}
            />
          ))}
        </div>
        {insights.strengths.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Recursos que aporta el conjunto del equipo
            </p>
            <div className="mt-2">
              <Bullets items={insights.strengths} tone="emerald" />
            </div>
          </div>
        )}
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

      {/* 6 · Aspectos que conviene observar */}
      <Screen id="observar" n={6} title="Aspectos que conviene observar">
        <Bullets items={insights.risks} tone="sky" />
      </Screen>

      {/* 7 · Comunicación */}
      <Screen id="comunicacion" n={7} title="Comunicación">
        {empty ? <Muted /> : <p className="text-sm leading-relaxed text-slate-600">{insights.communication}</p>}
      </Screen>

      {/* 8 · Toma de decisiones */}
      <Screen id="decisiones" n={8} title="Toma de decisiones">
        {empty ? <Muted /> : <p className="text-sm leading-relaxed text-slate-600">{insights.decisionMaking}</p>}
      </Screen>

      {/* 9 · Coordinación y colaboración */}
      <Screen id="coordinacion" n={9} title="Coordinación y colaboración">
        {empty ? <Muted /> : <p className="text-sm leading-relaxed text-slate-600">{insights.coordination}</p>}
      </Screen>

      {/* 10 · Gestión del cambio */}
      <Screen id="cambio" n={10} title="Gestión del cambio">
        {empty ? <Muted /> : <p className="text-sm leading-relaxed text-slate-600">{insights.changeManagement}</p>}
      </Screen>

      {/* 11 · Complementariedad del equipo */}
      <Screen id="complementariedad" n={11} title="Complementariedad del equipo">
        {insights.complementarity.length === 0 ? (
          <Muted />
        ) : (
          <ul className="space-y-3">
            {insights.complementarity.map((c) => (
              <li key={c.dimensionCode} className="flex items-start gap-3">
                <span
                  className="mt-0.5 shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-white"
                  style={{ backgroundImage: discGrad(c.dimensionCode) }}
                >
                  {styleShort(c.dimensionCode)}
                </span>
                <p className="text-sm text-slate-600">{c.text}</p>
              </li>
            ))}
          </ul>
        )}
      </Screen>

      {/* 12 · Riesgos de homogeneidad */}
      <Screen id="homogeneidad" n={12} title="Riesgos de homogeneidad">
        <p className="mb-3 text-sm leading-relaxed text-slate-600">
          Cuando una orientación concentra buena parte del equipo, algunas
          perspectivas pueden aparecer con menor frecuencia durante el análisis de
          situaciones complejas. No es una carencia: es una tendencia a cuidar.
        </p>
        {insights.gaps.length === 0 ? (
          <p className="text-sm text-slate-500">
            El equipo cubre las cuatro tendencias de forma razonable; no se observa
            una concentración marcada en un único estilo.
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

      {/* 13 · Claves para potenciar el funcionamiento del equipo */}
      <Screen id="claves" n={13} title="Claves para potenciar el funcionamiento del equipo">
        {empty ? (
          <Muted />
        ) : (
          <>
            <p className="mb-3 text-sm text-slate-600">
              Condiciones organizativas que favorecen el mejor funcionamiento
              colectivo. No son recomendaciones individuales.
            </p>
            <ol className="space-y-2.5">
              {insights.leadershipKeys.map((k, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                    {i + 1}
                  </span>
                  <span>{k}</span>
                </li>
              ))}
            </ol>
            {insights.conversations.length > 0 && (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Conversaciones recomendadas
                </p>
                <Bullets items={insights.conversations} tone="sky" />
              </div>
            )}
            <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
              Este informe describe tendencias del equipo como sistema, según las
              respuestas, y no constituye un diagnóstico. Úsalo como punto de partida
              para la conversación y el desarrollo; puede variar según el contexto y el
              momento.
            </p>
          </>
        )}
      </Screen>

      {/* Detalle ampliado · Mapa de contextos (solo PDF facilitador) */}
      <Screen id="contextos" n={14} title="Mapa de contextos" detail>
        <p className="mb-3 text-sm leading-relaxed text-slate-600">
          Cada situación muestra la tendencia del equipo a activar determinados
          recursos. Son valores descriptivos —no niveles de competencia ni
          rendimiento— y sirven para favorecer la reflexión y la conversación.
        </p>
        {empty ? (
          <Muted />
        ) : (
          <ContextHeatmap insights={insights} dimensions={dimensions} dye={dye} />
        )}
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
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
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
 * Mapa conductual del equipo: cuadrantes DISC en el mismo orden que el informe
 * individual: D↖ I↗ / S↙ C↘. Cada burbuja es una persona del equipo, situada
 * por sus recursos predominantes. Los nombres de los recursos van fuera de la
 * rejilla para que ninguna burbuja los tape.
 */
function TeamDiscGrid({
  points,
  dye,
}: {
  points: { x: number; y: number; code: string; n: number }[];
  dye: (c: string) => string;
}) {
  const { bubbles, r } = layoutTeamBubbles(points);
  const { x: GX, y: GY, size } = TEAM_GRID;
  const half = size / 2;
  const QUADS = ["D", "I", "S", "C"];
  const tag = (code: string, ty: number, anchor: "start" | "end") => (
    <text
      key={`tag-${code}`}
      x={anchor === "start" ? GX + 2 : GX + size - 2}
      y={ty}
      textAnchor={anchor}
      fontSize="9.5"
      fontWeight="700"
      fill={dye(code)}
    >
      {`${code} · ${styleShort(code).toUpperCase()}`}
    </text>
  );
  return (
    <div className="flex justify-center">
      <svg
        viewBox="0 0 220 252"
        className="h-auto w-full max-w-[440px]"
        role="img"
        aria-label="Mapa conductual del equipo (cuadrantes DISC)"
      >
        <defs>
          <filter id="tm-shadow" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="1.2" stdDeviation="1.4" floodColor="#0f172a" floodOpacity="0.22" />
          </filter>
          {QUADS.map((code) => {
            const [a, b] = discGradStops(code);
            return (
              <linearGradient key={code} id={`tmg-${code}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={a} />
                <stop offset="100%" stopColor={b} />
              </linearGradient>
            );
          })}
        </defs>

        {tag("D", 17, "start")}
        {tag("I", 17, "end")}

        {/* Cuadrantes con la letra de fondo, muy suave */}
        {QUADS.map((code) => {
          const [qx, qy] = QUAD_ORIGIN[code];
          const x = GX + qx * half;
          const y = GY + qy * half;
          return (
            <g key={code}>
              <rect
                x={x + 1}
                y={y + 1}
                width={half - 2}
                height={half - 2}
                rx={10}
                fill={`url(#tmg-${code})`}
                fillOpacity={0.16}
                stroke={dye(code)}
                strokeOpacity={0.3}
              />
              <text
                x={x + half / 2}
                y={y + half / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="52"
                fontWeight="800"
                fill={`url(#tmg-${code})`}
                fillOpacity={0.25}
              >
                {code}
              </text>
            </g>
          );
        })}

        {/* Personas (numeradas; ver leyenda) */}
        {bubbles.map((p) => (
          <g key={p.n} filter="url(#tm-shadow)">
            <circle cx={p.x} cy={p.y} r={r} fill="#1e293b" stroke="#ffffff" strokeWidth="1.2" />
            <text
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={r > 8 ? 8.5 : 7}
              fontWeight="800"
              fill="#ffffff"
            >
              {p.n}
            </text>
          </g>
        ))}

        {tag("S", 246, "start")}
        {tag("C", 246, "end")}
      </svg>
    </div>
  );
}

/** Barra horizontal con etiqueta y peso del recurso en el equipo (el informe de equipo sí lleva %). */
function BarRow({ label, value, code }: { label: string; value: number; code: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="tabular-nums font-bold text-slate-600">{Math.round(value)}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundImage: discGradStrong(code, 90) }}
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

/** Luminancia relativa (WCAG) de un color #RRGGBB. */
function luminance(hex: string): number {
  const lin = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(1) + 0.7152 * lin(3) + 0.0722 * lin(5);
}

/**
 * Celda del mapa de calor: el color se atenúa por transparencia del FONDO (no
 * de la celda entera, que apagaba también el número) y el texto se elige
 * oscuro o blanco según el tono resultante sobre blanco, para que siempre se lea.
 */
function heatCell(color: string, pct: number): { background: string; text: string } {
  const a = 0.15 + (Math.min(100, Math.max(0, pct)) / 100) * 0.85;
  const mix = (i: number) =>
    Math.round(255 * (1 - a) + parseInt(color.slice(i, i + 2), 16) * a)
      .toString(16)
      .padStart(2, "0");
  const blended = `#${mix(1)}${mix(3)}${mix(5)}`;
  return { background: blended, text: luminance(blended) > 0.18 ? "#1e293b" : "#ffffff" };
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
                const { background, text } = heatCell(dye(d.code), pct);
                return (
                  <td key={d.code} className="p-1 text-center">
                    <div
                      className="mx-auto flex h-9 w-full max-w-[64px] items-center justify-center rounded-lg text-xs font-bold tabular-nums"
                      style={{ backgroundColor: background, color: text }}
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
