import type { InstrumentDefinition, ScoringResult, DiscGraphs, DimensionShare } from "@/lib/engine/types";
import { resolveEqBand } from "@/lib/narratives/disc-gesem.narratives";
import { intensityLabel, styleShort } from "@/lib/narratives/disc-gesem.catalog";
import {
  buildProfileNarrative,
  contextLeaders,
  REPORT_CONTEXTS,
  type ProfileNarrative,
} from "@/lib/narratives/disc-gesem.profiles";
import { generateInsights } from "@/lib/narratives/disc-gesem.insights";
import { getDict, type Dict, type Lang } from "@/lib/i18n/dictionaries";
import { discGrad, discGradStops } from "@/lib/disc-gradient";
import { ScoreBars } from "./ScoreBars";
import { PositionBars } from "./PositionBars";
import { GlossaryButton } from "./GlossaryDrawer";

interface Props {
  result: ScoringResult;
  def: InstrumentDefinition;
  /** Idioma de la interfaz del informe (el contenido editorial va como esté almacenado). */
  lang?: Lang;
  /** Narrativa precompuesta desde BD; si falta, se compone con valores base. */
  narrative?: ProfileNarrative;
  /**
   * Texto editorial fijo (Biblioteca V1) por apartado: tendencia, recursos,
   * aportacion, valoracion, observar, coordinacion, contextos, ampliacion.
   * Cuando un apartado está presente, el informe muestra esa prosa en lugar de
   * la composición por defecto. Permite servir el contenido validado V1.
   */
  blocks?: Partial<Record<string, string>>;
  /** Tres lecturas DISC (público=Más, privado=Menos). Si llega, se muestran 3 gráficos. */
  graphs?: DiscGraphs;
  /** Datos de portada (nombre, cliente, proyecto, fecha). */
  meta?: {
    participantName?: string | null;
    clientName?: string | null;
    projectName?: string | null;
    date?: string | null;
  };
}

/** Renderiza un texto multipárrafo (separado por líneas en blanco) como prosa. */
function Prose({ text, tone = "slate" }: { text: string; tone?: "slate" | "sky" }) {
  const cls = tone === "sky" ? "text-slate-700" : "text-slate-600";
  return (
    <div className="space-y-3">
      {text
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className={`text-sm leading-relaxed ${cls}`}>
            {p}
          </p>
        ))}
    </div>
  );
}

/**
 * Informe individual GESEM. Estructura definitiva (interpretativa y reflexiva):
 * antes de empezar · tendencia predominante · recursos predominantes ·
 * aportación habitual · lo que otras personas suelen valorar · aspectos a
 * observar · coordinación y colaboración · comunicación · contextos de mejor
 * desempeño · ampliación de repertorio · preguntas para la reflexión · cierre.
 *
 * No incluye retos, experimentos, tareas ni planes de acción individuales. El
 * protagonista es el RECURSO; el código de perfil es solo referencia interna.
 */
export function Report({ result, def, narrative: narrativeProp, blocks, graphs, meta, lang = "es" }: Props) {
  const b = blocks ?? {};
  const t = getDict(lang).report;
  // Color base de cada dimensión = primera parada del degradado DISC oficial,
  // para que toda la paleta del informe sea consistente con los degradados.
  const dimColor = (code: string) => discGradStops(code)[0];
  const eqBand = resolveEqBand(result.eq);
  const narrative = narrativeProp ?? buildProfileNarrative(result);
  const contexts = contextLeaders(result);
  const insights = generateInsights(result);
  const pColor = dimColor(result.primaryDimension);
  const sColor = result.isEq ? pColor : dimColor(result.secondaryDimension);

  // Frase de interpretación en lenguaje claro de las tres lecturas.
  const interpText = (() => {
    if (!graphs) return "";
    const dom = (arr: DimensionShare[]) =>
      arr.reduce((a, b) => (b.share > a.share ? b : a), arr[0])?.dimensionCode ?? "D";
    const pub = dom(graphs.publico);
    const priv = dom(graphs.privado);
    return pub === priv
      ? t.interpSame(styleShort(pub))
      : t.interpDiff(styleShort(pub), styleShort(priv), styleShort(result.primaryDimension));
  })();

  return (
    <div className="space-y-6">
      {/* Página 1 — Portada */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        {/* Ilustración abstracta basada en los 4 colores DISC */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.13]">
          <div className="absolute -left-10 -top-10 h-44 w-44 rounded-full blur-2xl disc-grad-d" />
          <div className="absolute -right-10 -top-8 h-44 w-44 rounded-full blur-2xl disc-grad-i" />
          <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full blur-2xl disc-grad-s" />
          <div className="absolute -bottom-10 -right-10 h-44 w-44 rounded-full blur-2xl disc-grad-c" />
        </div>
        <div className="relative">
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            GESEM · DISC
          </div>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {t.individual}
          </p>
          {meta?.participantName && (
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
              {meta.participantName}
            </h1>
          )}
          {(meta?.clientName || meta?.projectName || meta?.date) && (
            <p className="mt-2 text-sm text-slate-500">
              {[meta?.clientName, meta?.projectName, meta?.date]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-sm font-bold text-white">
            <span>{narrative.resourceHeadline}</span>
            <span className="text-[11px] font-medium text-white/60">
              {narrative.internalCode}
            </span>
          </div>
          <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-relaxed text-slate-600">
            {narrative.synthesis}
          </p>
        </div>
      </section>

      {/* Página 2 — Cómo interpretar este informe */}
      <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {t.howToRead}
          </h3>
          <span className="no-print">
            <GlossaryButton lang={lang} />
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {t.howToReadPre}
          <strong>{t.howToReadResources}</strong>
          {t.howToReadMid}
          <strong>{t.howToReadNo}</strong>
          {t.howToReadPost}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {t.principles.map((p, i) => (
            <div
              key={p}
              className="rounded-xl border border-slate-100 bg-white px-4 py-3"
            >
              <div className="text-xs font-black text-sky-400">{i + 1}</div>
              <p className="mt-1 text-sm font-medium leading-snug text-slate-700">
                {p}
              </p>
            </div>
          ))}
        </div>
        <ReadingIndex title={t.readingIndexTitle} items={t.index} />
      </section>

      {/* Tendencia predominante — protagonista: el recurso */}
      <header
        id="r-tendencia"
        className="animate-scale-in relative scroll-mt-24 overflow-hidden rounded-3xl p-8 text-white shadow-xl"
        style={{ backgroundImage: `linear-gradient(135deg, ${pColor}, ${sColor})` }}
      >
        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
          {t.tendencyPre}
        </p>
        <h2 className="mt-2 text-3xl font-black leading-tight">
          {narrative.resourceHeadline}
        </h2>
        <p className="mt-1 text-base font-semibold text-white/90">{narrative.title}</p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85">
          {narrative.intro}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <span className="opacity-80">{t.intensity}</span>
            <span>{intensityLabel(result.intensity)}</span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/70 backdrop-blur">
            <span className="opacity-70">{t.internalCode}</span>
            <span>{narrative.internalCode}</span>
          </span>
        </div>
      </header>

      {/* Tendencia predominante (texto editorial fijo V1, si existe) */}
      {b.tendencia && (
        <section className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {t.tendencyPre}
          </h3>
          <div className="mt-3">
            <Prose text={b.tendencia} />
          </div>
        </section>
      )}

      {/* Cierre común del bloque "Tendencia predominante" (Entregable 10) */}
      <p className="px-1 text-xs leading-relaxed text-slate-400">{t.tendencyClose}</p>

      {/* Tu posición dentro del modelo DISC (cuadrícula clásica + intensidad) */}
      <section id="r-posicion" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2">
          <Num n="01" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {t.posicion}
          </h3>
        </div>
        {graphs ? (
          <div className="mt-4">
            <PositionBars
              lead={t.graphsLead}
              interp={interpText}
              labels={{ publico: t.graphPublic, privado: t.graphPrivate, percibido: t.graphMirror }}
              readings={{
                publico: graphs.publico,
                privado: graphs.privado,
                percibido: result.percentages,
              }}
              dims={[...def.dimensions]
                .sort((a, c) => a.order - c.order)
                .map((d) => ({ code: d.code, name: styleShort(d.code) }))}
            />
          </div>
        ) : (
          <div className="mt-4 grid items-center gap-6 lg:grid-cols-2">
            <DiscGrid gid="mir" shares={result.percentages} markerCode={result.primaryDimension} />
            <div>
              <p className="mb-3 text-xs font-medium text-slate-400">
                {t.posicionCaption}
              </p>
              <ScoreBars scores={result.global} dimensions={def.dimensions} />
            </div>
          </div>
        )}
        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/60 p-6 sm:p-7">
          <p className="mb-4 text-sm font-semibold text-slate-500">{t.tendencyDef}</p>
          <IntensityScale intensity={result.intensity} t={t} />
        </div>
        <p className="mt-5 text-xs leading-relaxed text-slate-400">{t.posicionNote}</p>
      </section>

      {/* Recursos predominantes */}
      <section id="r-recursos" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2">
          <Num n="02" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {t.recursos}
          </h3>
        </div>
        <p className="mt-2 text-sm text-slate-500">{t.recursosLead}</p>
        {b.recursos ? (
          <div className="mt-4">
            <Prose text={b.recursos} />
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {narrative.resources.map((r) => (
              <div
                key={r.name}
                className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
              >
                <p className="text-sm font-semibold text-slate-800">{r.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {r.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Aportación habitual */}
      <section id="r-aportacion" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2">
          <Num n="03" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {t.aportacion}
          </h3>
        </div>
        <div className="mt-2">
          {b.aportacion ? (
            <Prose text={b.aportacion} />
          ) : (
            <p className="text-sm leading-relaxed text-slate-600">
              {narrative.contribution}
            </p>
          )}
        </div>
      </section>

      {/* Lo que otras personas suelen valorar (tarjetas) */}
      <section id="r-valoracion" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2">
          <Num n="04" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {t.valoracion}
          </h3>
        </div>
        {b.valoracion ? (
          <div className="mt-2">
            <Prose text={b.valoracion} />
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-500">{t.valoracionLead}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {narrative.valuedItems.map((v) => (
                <div
                  key={v}
                  className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-900/80"
                >
                  <span className="text-emerald-500">✦</span> {v}
                </div>
              ))}
            </div>
          </>
        )}
        <p className="mt-3 text-xs text-slate-400">{t.valoracionNote}</p>
      </section>

      {/* Aspectos que merece la pena observar (diseño positivo, sin colores de error) */}
      <section id="r-observar" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2">
          <Num n="05" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {t.observar}
          </h3>
        </div>
        <p className="mt-2 text-sm text-slate-500">{t.observarLead}</p>
        {b.observar ? (
          <div className="mt-4">
            <Prose text={b.observar} />
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {narrative.observe.map((s) => (
              <div
                key={s}
                className="flex items-start gap-2.5 rounded-xl border border-sky-100 bg-sky-50/40 px-4 py-3 text-sm text-slate-600"
              >
                <span className="text-sky-400">◇</span> {s}
              </div>
            ))}
          </div>
        )}
        <p className="mt-3 text-xs leading-relaxed text-slate-400">{t.observarNote}</p>
      </section>

      {/* Coordinación y colaboración (bloque diferencial DISC GESEM: incluye
          qué aportas y qué necesitas de los demás) */}
      <section id="r-coordinacion" className="scroll-mt-24 rounded-2xl border border-sky-100 bg-sky-50/40 p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Num n="06" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-sky-500">
            {t.coordinacion}
          </h3>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.coordinacionBlurb}</p>
        {b.coordinacion ? (
          <div className="mt-4">
            <Prose text={b.coordinacion} tone="sky" />
          </div>
        ) : (
          <>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-sm font-semibold text-slate-900">{t.coordinating}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-slate-600">
                  {narrative.coordination.coordinating}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-slate-900">{t.collaborating}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-slate-600">
                  {narrative.coordination.collaborating}
                </dd>
              </div>
            </dl>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                <h4 className="text-sm font-bold text-emerald-900">{t.contributions}</h4>
                <ul className="mt-2 space-y-1.5 text-sm text-emerald-900/80">
                  {narrative.team.contributions.map((c) => (
                    <li key={c} className="flex gap-2">
                      <span className="text-emerald-500">+</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-sky-100 bg-white/70 p-4">
                <h4 className="text-sm font-bold text-sky-900">{t.needs}</h4>
                <ul className="mt-2 space-y-1.5 text-sm text-sky-900/80">
                  {narrative.team.appreciates.map((a) => (
                    <li key={a} className="flex gap-2">
                      <span className="text-sky-500">◆</span> {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {narrative.team.differences && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-white/70 p-4">
                <h4 className="text-sm font-bold text-slate-800">{t.differences}</h4>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {narrative.team.differences}
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Contextos de mejor desempeño + mapa por contextos */}
      <section id="r-contextos" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2">
          <Num n="07" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {t.contextos}
          </h3>
        </div>
        <div className="mt-2">
          {b.contextos ? (
            <Prose text={b.contextos} />
          ) : (
            <p className="text-sm leading-relaxed text-slate-600">
              {narrative.contexts}
            </p>
          )}
        </div>
        {contexts.length > 0 && (
          <>
            <p className="mt-5 text-xs font-medium text-slate-400">{t.contextosCaption}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {contexts.map((ctx, i) => (
                <div
                  key={ctx.label}
                  className="animate-fade-up flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="text-sm font-medium text-slate-700">{ctx.label}</span>
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                    style={{ backgroundImage: discGrad(ctx.dimensionCode) }}
                  >
                    {ctx.resource}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <p className="mb-2 text-xs font-medium text-slate-400">{t.contextosHeatmap}</p>
              <ContextHeatmap result={result} def={def} dimColor={dimColor} situacion={t.situacion} />
            </div>
          </>
        )}
      </section>

      {/* Ampliación de repertorio */}
      <section id="r-repertorio" className="scroll-mt-24 rounded-2xl border border-sky-100 bg-sky-50/50 p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Num n="08" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-sky-400">
            {t.repertorio}
          </h3>
        </div>
        {b.ampliacion ? (
          <div className="mt-2">
            <Prose text={b.ampliacion} tone="sky" />
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {narrative.repertoire}
            </p>
            {insights.length > 0 && (
              <ul className="mt-4 space-y-3">
                {insights.map((text) => (
                  <li
                    key={text}
                    className="rounded-xl border border-sky-100 bg-white/70 p-4 text-sm leading-relaxed text-slate-700"
                  >
                    {text}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      {/* Equilibrio del perfil (EQ) */}
      <section className="flex flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:flex-row">
        <EqGauge value={result.eq} />
        <div className="text-center sm:text-left">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {t.eq}
          </h3>
          <p className="mt-1 text-lg font-bold text-slate-900">{eqBand.label}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            {eqBand.description}
          </p>
        </div>
      </section>

      {/* Preguntas para la reflexión */}
      <section id="r-reflexion" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-[11px] font-bold tabular-nums text-white">
            09
          </span>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/60">
            {t.reflexion}
          </h3>
        </div>
        <ol className="mt-3 space-y-3">
          {narrative.reflection.map((q, i) => (
            <li key={q} className="flex gap-3 text-base font-medium leading-relaxed">
              <span className="text-white/40">{i + 1}.</span>
              <span>{q}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Cierre */}
      <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 text-center shadow-sm backdrop-blur">
        <p className="text-sm font-medium leading-relaxed text-slate-700">{t.closing}</p>
        <p className="mx-auto mt-4 max-w-2xl text-xs leading-relaxed text-slate-400">
          {t.methodNote}
        </p>
      </section>
    </div>
  );
}

/** Anclas y numeración de los apartados navegables (las etiquetas vienen del idioma). */
const INDEX_ANCHORS: { n: string; href: string }[] = [
  { n: "01", href: "#r-posicion" },
  { n: "02", href: "#r-recursos" },
  { n: "03", href: "#r-aportacion" },
  { n: "04", href: "#r-valoracion" },
  { n: "05", href: "#r-observar" },
  { n: "06", href: "#r-coordinacion" },
  { n: "07", href: "#r-contextos" },
  { n: "08", href: "#r-repertorio" },
  { n: "09", href: "#r-reflexion" },
];

/** Índice de lectura del informe (orientación; oculto en la versión impresa). */
function ReadingIndex({ title, items }: { title: string; items: string[] }) {
  return (
    <nav className="no-print mt-4 border-t border-slate-100 pt-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        {title}
      </p>
      <ol className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
        {INDEX_ANCHORS.map((it, i) => (
          <li key={it.href}>
            <a
              href={it.href}
              className="group flex items-baseline gap-2 py-0.5 text-sm text-slate-600 transition hover:text-sky-600"
            >
              <span className="text-[11px] font-bold tabular-nums text-slate-300 group-hover:text-sky-400">
                {it.n}
              </span>
              <span className="truncate">{items[i] ?? ""}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Chip numerado del apartado (cabecera editorial consistente). */
function Num({ n }: { n: string }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold tabular-nums text-white">
      {n}
    </span>
  );
}

/**
 * Cuadrícula DISC clásica (2×2) con un marcador en la posición indicada por
 * `shares` (reparto 0-100 por dimensión). `gid` da ids de degradado únicos para
 * poder mostrar varias cuadrículas en la misma página. D arriba-izq, I arriba-
 * der, C abajo-izq, S abajo-der.
 */
function DiscGrid({
  shares,
  markerCode,
  gid,
}: {
  shares: DimensionShare[];
  markerCode?: string;
  gid: string;
}) {
  const get = (code: string) =>
    shares.find((p) => p.dimensionCode === code)?.share ?? 0;
  const d = get("D");
  const i = get("I");
  const s = get("S");
  const c = get("C");
  const x = (i + s - (d + c)) / 100; // + derecha (personas)
  const y = (d + i - (s + c)) / 100; // + arriba (activo)
  const cx = Math.max(24, Math.min(176, 100 + x * 76));
  const cy = Math.max(24, Math.min(176, 100 - y * 76));
  const CODES = ["D", "I", "S", "C"];
  const marker =
    markerCode ??
    shares.reduce((a, b) => (b.share > a.share ? b : a), shares[0])?.dimensionCode ??
    "D";

  const quad = (code: string, qx: number, qy: number) => (
    <g key={code}>
      <rect x={qx} y={qy} width={90} height={90} rx={6} fill={`url(#${gid}-${code})`} opacity={0.16} />
      <text x={qx + 12} y={qy + 34} fontSize="32" fontWeight="800" fill={`url(#${gid}-${code})`} opacity={0.6}>
        {code}
      </text>
      <text x={qx + 12} y={qy + 50} fontSize="10.5" fontWeight="700" fill={discGradStops(code)[0]}>
        {styleShort(code)}
      </text>
    </g>
  );

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 200 200" className="h-auto w-full max-w-[210px]" role="img" aria-label="Cuadrícula DISC">
        <defs>
          {CODES.map((code) => {
            const [a, b] = discGradStops(code);
            return (
              <linearGradient key={code} id={`${gid}-${code}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={a} />
                <stop offset="100%" stopColor={b} />
              </linearGradient>
            );
          })}
        </defs>
        <rect x="10" y="10" width="180" height="180" rx="14" fill="#ffffff" stroke="#e2e8f0" />
        {quad("D", 10, 10)}
        {quad("I", 100, 10)}
        {quad("C", 10, 100)}
        {quad("S", 100, 100)}
        <line x1="100" y1="12" x2="100" y2="188" stroke="#e2e8f0" strokeWidth="1.5" />
        <line x1="12" y1="100" x2="188" y2="100" stroke="#e2e8f0" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r="11" fill="#ffffff" />
        <circle cx={cx} cy={cy} r="9" fill={`url(#${gid}-${marker})`} />
        <circle cx={cx} cy={cy} r="9" fill="none" stroke="#ffffff" strokeWidth="2.5" />
      </svg>
    </div>
  );
}

/** Escala de definición de la tendencia (Flexible → Muy definida) con marcador. */
function IntensityScale({
  intensity,
  t,
}: {
  intensity: ScoringResult["intensity"];
  t: Dict["report"];
}) {
  const levels = [
    { key: "FLEXIBLE", label: t.intFlexible },
    { key: "MODERADA", label: t.intModerada },
    { key: "DEFINIDA", label: t.intDefinida },
    { key: "MUY_DEFINIDA", label: t.intMuyDefinida },
  ];
  const idx = levels.findIndex((l) => l.key === intensity);
  return (
    <div>
      <div className="flex gap-2.5">
        {levels.map((l, i) => (
          <div key={l.key} className="flex-1">
            <div
              className="h-3 rounded-full"
              style={{ backgroundColor: i === idx ? "#475569" : "#e8edf3" }}
            />
            <div
              className={`mt-2 text-center text-sm font-bold ${
                i === idx ? "text-slate-700" : "text-slate-400"
              }`}
            >
              {l.label}
            </div>
          </div>
        ))}
      </div>
      {idx < 0 && (
        <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">{t.adaptableNote}</p>
      )}
    </div>
  );
}

/** Mapa de calor: intensidad de cada recurso (D/I/S/C) por situación. */
function ContextHeatmap({
  result,
  def,
  dimColor,
  situacion,
}: {
  result: ScoringResult;
  def: InstrumentDefinition;
  dimColor: (c: string) => string;
  situacion: string;
}) {
  const dims = [...def.dimensions].sort((a, b) => a.order - b.order);
  const rows = REPORT_CONTEXTS.map(({ label, code }) => ({
    label,
    scores: result.byContext[code] ?? [],
  })).filter((r) => r.scores.length > 0);
  if (rows.length === 0) return null;
  const pct = (scores: { dimensionCode: string; percent: number }[], code: string) =>
    scores.find((s) => s.dimensionCode === code)?.percent ?? 0;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="p-1.5 text-left font-semibold text-slate-400">{situacion}</th>
            {dims.map((d) => (
              <th key={d.code} className="p-1.5 text-center font-semibold" style={{ color: dimColor(d.code) }}>
                {styleShort(d.code)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-slate-100">
              <td className="p-1.5 font-medium text-slate-600">{row.label}</td>
              {dims.map((d) => {
                const v = pct(row.scores, d.code);
                return (
                  <td key={d.code} className="p-1 text-center">
                    <div
                      className="mx-auto h-8 w-full max-w-[58px] rounded-lg"
                      style={{
                        backgroundImage: discGrad(d.code, 135),
                        opacity: 0.14 + (Math.min(100, Math.max(0, v)) / 100) * 0.86,
                      }}
                      title={`${row.label} · ${styleShort(d.code)}`}
                    />
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

/** Medidor circular del índice EQ (0-100). */
function EqGauge({ value }: { value: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="url(#eqgrad)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="eqgrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00a1e0" />
            <stop offset="100%" stopColor="#5ac3dd" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-slate-900">{value}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          EQ
        </span>
      </div>
    </div>
  );
}
