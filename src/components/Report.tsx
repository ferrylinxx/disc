import type { InstrumentDefinition, ScoringResult } from "@/lib/engine/types";
import { resolveEqBand } from "@/lib/narratives/disc-gesem.narratives";
import { intensityLabel, styleShort } from "@/lib/narratives/disc-gesem.catalog";
import {
  buildProfileNarrative,
  contextLeaders,
  type ProfileNarrative,
} from "@/lib/narratives/disc-gesem.profiles";
import { generateInsights } from "@/lib/narratives/disc-gesem.insights";
import { ScoreBars } from "./ScoreBars";

interface Props {
  result: ScoringResult;
  def: InstrumentDefinition;
  /** Narrativa precompuesta desde BD; si falta, se compone con valores base. */
  narrative?: ProfileNarrative;
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
export function Report({ result, def, narrative: narrativeProp }: Props) {
  const dimColor = (code: string) =>
    def.dimensions.find((d) => d.code === code)?.color ?? "#0f172a";
  const eqBand = resolveEqBand(result.eq);
  const narrative = narrativeProp ?? buildProfileNarrative(result);
  const contexts = contextLeaders(result);
  const insights = generateInsights(result);
  const shareOf = (code: string) =>
    result.percentages.find((p) => p.dimensionCode === code)?.share ?? 0;
  const pColor = dimColor(result.primaryDimension);
  const sColor = result.isEq ? pColor : dimColor(result.secondaryDimension);

  return (
    <div className="space-y-6">
      {/* Antes de empezar */}
      <section className="rounded-2xl border border-slate-200 bg-white/70 p-5 text-sm leading-relaxed text-slate-600 shadow-sm backdrop-blur">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Antes de empezar
        </h3>
        <p className="mt-2">
          Este informe describe los <strong>recursos</strong> que sueles utilizar con
          más frecuencia y cómo pueden influir en tu forma de comunicarte,
          coordinarte y colaborar. No clasifica ni define quién eres: describe
          tendencias, según tus respuestas, que pueden variar con el contexto y el
          momento.
        </p>
        <ReadingIndex />
      </section>

      {/* Tendencia predominante — protagonista: el recurso */}
      <header
        id="r-tendencia"
        className="animate-scale-in relative scroll-mt-24 overflow-hidden rounded-3xl p-8 text-white shadow-xl"
        style={{ backgroundImage: `linear-gradient(135deg, ${pColor}, ${sColor})` }}
      >
        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
          Tu tendencia predominante
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
            <span className="opacity-80">Intensidad</span>
            <span>{intensityLabel(result.intensity)}</span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/70 backdrop-blur">
            <span className="opacity-70">Código interno</span>
            <span>{narrative.internalCode}</span>
          </span>
        </div>
      </header>

      {/* Recursos predominantes */}
      <section id="r-recursos" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2">
          <Num n="02" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Recursos predominantes
          </h3>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Todas las personas disponen de los cuatro recursos. La diferencia suele
          estar en cuáles utilizamos con más frecuencia y en qué situaciones.
        </p>
        <div className="mt-4">
          <ScoreBars scores={result.global} dimensions={def.dimensions} />
        </div>
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
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {def.dimensions.map((d) => (
            <div
              key={d.code}
              className="rounded-xl border border-slate-100 bg-white px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-sm font-semibold text-slate-800">
                  {styleShort(d.code)}
                </span>
              </div>
              <p className="mt-1 text-xs font-medium tabular-nums text-slate-400">
                {shareOf(d.code)}% del reparto
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Aportación habitual + Lo que otras personas suelen valorar */}
      <section className="grid gap-5 sm:grid-cols-2">
        <div id="r-aportacion" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2">
            <Num n="03" />
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Aportación habitual
            </h3>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {narrative.contribution}
          </p>
        </div>
        <div id="r-valoracion" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2">
            <Num n="04" />
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Lo que otras personas suelen valorar
            </h3>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {narrative.valued}
          </p>
        </div>
      </section>

      {/* Aspectos que merece la pena observar */}
      <section id="r-observar" className="scroll-mt-24 rounded-2xl border border-amber-100 bg-amber-50/50 p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Num n="05" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-amber-500">
            Aspectos que merece la pena observar
          </h3>
        </div>
        <ul className="mt-3 space-y-2 text-sm text-amber-900/80">
          {narrative.observe.map((s) => (
            <li key={s} className="flex gap-2">
              <span className="text-amber-500">•</span> {s}
            </li>
          ))}
        </ul>
      </section>

      {/* Coordinación y colaboración */}
      <section id="r-coordinacion" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2">
          <Num n="06" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Coordinación y colaboración
          </h3>
        </div>
        <dl className="mt-4 space-y-4">
          <div>
            <dt className="text-sm font-semibold text-slate-900">
              Cuando coordinas personas o proyectos
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-slate-600">
              {narrative.coordination.coordinating}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-900">
              Cuando colaboras con otras personas
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-slate-600">
              {narrative.coordination.collaborating}
            </dd>
          </div>
        </dl>
      </section>

      {/* Comunicación */}
      <section id="r-comunicacion" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2">
          <Num n="07" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Comunicación
          </h3>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {narrative.communication}
        </p>
      </section>

      {/* Contextos de mejor desempeño + mapa por contextos */}
      <section id="r-contextos" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2">
          <Num n="08" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Contextos de mejor desempeño
          </h3>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {narrative.contexts}
        </p>
        {contexts.length > 0 && (
          <>
            <p className="mt-5 text-xs font-medium text-slate-400">
              Recurso que sueles activar en cada situación, según tus respuestas:
            </p>
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
                    style={{ backgroundColor: dimColor(ctx.dimensionCode) }}
                  >
                    {ctx.resource}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Ampliación de repertorio */}
      <section id="r-repertorio" className="scroll-mt-24 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Num n="09" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Ampliación de repertorio
          </h3>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {narrative.repertoire}
        </p>
        {insights.length > 0 && (
          <ul className="mt-4 space-y-3">
            {insights.map((text) => (
              <li
                key={text}
                className="rounded-xl border border-indigo-100 bg-white/70 p-4 text-sm leading-relaxed text-slate-700"
              >
                {text}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Equilibrio del perfil (EQ) */}
      <section className="flex flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:flex-row">
        <EqGauge value={result.eq} />
        <div className="text-center sm:text-left">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Equilibrio entre recursos (EQ)
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
            10
          </span>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/60">
            Preguntas para la reflexión
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
        <p className="text-sm font-medium leading-relaxed text-slate-700">
          El autoconocimiento es el punto de partida. La comprensión mutua es el
          puente. La adaptación consciente es la competencia. La colaboración eficaz
          es el resultado.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-xs leading-relaxed text-slate-400">
          Este informe describe tendencias de interacción según tus respuestas y
          puede variar con el contexto y el momento. No constituye un diagnóstico,
          sino un punto de partida para la conversación y el desarrollo.
        </p>
      </section>
    </div>
  );
}

/** Apartados navegables del informe (índice de lectura). */
const INDEX_ITEMS: { n: string; label: string; href: string }[] = [
  { n: "01", label: "Tu tendencia predominante", href: "#r-tendencia" },
  { n: "02", label: "Recursos predominantes", href: "#r-recursos" },
  { n: "03", label: "Aportación habitual", href: "#r-aportacion" },
  { n: "04", label: "Lo que otras personas suelen valorar", href: "#r-valoracion" },
  { n: "05", label: "Aspectos que merece la pena observar", href: "#r-observar" },
  { n: "06", label: "Coordinación y colaboración", href: "#r-coordinacion" },
  { n: "07", label: "Comunicación", href: "#r-comunicacion" },
  { n: "08", label: "Contextos de mejor desempeño", href: "#r-contextos" },
  { n: "09", label: "Ampliación de repertorio", href: "#r-repertorio" },
  { n: "10", label: "Preguntas para la reflexión", href: "#r-reflexion" },
];

/** Índice de lectura del informe (orientación; oculto en la versión impresa). */
function ReadingIndex() {
  return (
    <nav className="no-print mt-4 border-t border-slate-100 pt-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        En este informe · 5-8 min de lectura
      </p>
      <ol className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
        {INDEX_ITEMS.map((it) => (
          <li key={it.href}>
            <a
              href={it.href}
              className="group flex items-baseline gap-2 py-0.5 text-sm text-slate-600 transition hover:text-indigo-600"
            >
              <span className="text-[11px] font-bold tabular-nums text-slate-300 group-hover:text-indigo-400">
                {it.n}
              </span>
              <span className="truncate">{it.label}</span>
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
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
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
