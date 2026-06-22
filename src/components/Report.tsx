import type { InstrumentDefinition, ScoringResult } from "@/lib/engine/types";
import { resolveEqBand } from "@/lib/narratives/disc-gesem.narratives";
import { intensityLabel, styleShort } from "@/lib/narratives/disc-gesem.catalog";
import {
  buildProfileNarrative,
  contextLeaders,
} from "@/lib/narratives/disc-gesem.profiles";
import { generateInsights } from "@/lib/narratives/disc-gesem.insights";
import { ScoreBars } from "./ScoreBars";

interface Props {
  result: ScoringResult;
  def: InstrumentDefinition;
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
export function Report({ result, def }: Props) {
  const dimColor = (code: string) =>
    def.dimensions.find((d) => d.code === code)?.color ?? "#0f172a";
  const eqBand = resolveEqBand(result.eq);
  const narrative = buildProfileNarrative(result);
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
      </section>

      {/* Tendencia predominante — protagonista: el recurso */}
      <header
        className="animate-scale-in relative overflow-hidden rounded-3xl p-8 text-white shadow-xl"
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
      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Recursos predominantes
        </h3>
        <p className="mt-1 text-sm text-slate-500">
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
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Aportación habitual
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {narrative.contribution}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Lo que otras personas suelen valorar
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {narrative.valued}
          </p>
        </div>
      </section>

      {/* Aspectos que merece la pena observar */}
      <section className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6 shadow-sm">
        <h3 className="flex items-center gap-2 font-bold text-amber-900">
          <span className="text-lg">⚑</span> Aspectos que merece la pena observar
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-amber-900/80">
          {narrative.observe.map((s) => (
            <li key={s} className="flex gap-2">
              <span className="text-amber-500">•</span> {s}
            </li>
          ))}
        </ul>
      </section>

      {/* Coordinación y colaboración */}
      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Coordinación y colaboración
        </h3>
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
      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Comunicación
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {narrative.communication}
        </p>
      </section>

      {/* Contextos de mejor desempeño + mapa por contextos */}
      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Contextos de mejor desempeño
        </h3>
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
      <section className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
          Ampliación de repertorio
        </h3>
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
      <section className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-white/60">
          Preguntas para la reflexión
        </h3>
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
