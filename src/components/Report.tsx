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
 * Informe individual "Mapa de Interacción Profesional" (8 bloques): tendencia
 * predominante, mapa de recursos, mapa por contextos, cuando coordinas personas,
 * fortalezas, a observar, experimento y pregunta poderosa, más insights
 * personalizados y un cierre con la nota de tendencia/no-diagnóstico.
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

  const coord: { label: string; text: string }[] = [
    { label: "Cuando das indicaciones", text: narrative.coordination.instructions },
    { label: "Cuando haces seguimiento", text: narrative.coordination.followup },
    { label: "Cuando coordinas personas diferentes", text: narrative.coordination.coordinating },
    { label: "Cuando aparece un desacuerdo", text: narrative.coordination.conflict },
    { label: "Cuando necesitas generar compromiso", text: narrative.coordination.engagement },
  ];

  return (
    <div className="space-y-6">
      {/* Bloque 1 — Tu tendencia predominante */}
      <header
        className="animate-scale-in relative overflow-hidden rounded-3xl p-8 text-white shadow-xl"
        style={{ backgroundImage: `linear-gradient(135deg, ${pColor}, ${sColor})` }}
      >
        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
          Mapa de Interacción Profesional
        </p>
        <div className="mt-3 flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl font-black backdrop-blur">
            {result.profileCode}
          </span>
          <div>
            <h2 className="text-2xl font-extrabold leading-tight">{narrative.title}</h2>
            <p className="text-sm text-white/85">{narrative.intro}</p>
          </div>
        </div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
          <span className="opacity-80">Intensidad</span>
          <span>{intensityLabel(result.intensity)}</span>
        </div>
      </header>

      {/* Bloque 2 — Tu mapa de recursos */}
      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Tu mapa de recursos
        </h3>
        <div className="mt-4">
          <ScoreBars scores={result.global} dimensions={def.dimensions} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {def.dimensions.map((d) => (
            <div
              key={d.code}
              className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5"
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

      {/* Bloque 3 — Tu mapa por contextos */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Tu mapa por contextos
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Recurso que sueles activar en cada situación, según tus respuestas.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contexts.map((ctx, i) => (
            <div
              key={ctx.label}
              className="animate-fade-up flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur"
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
      </section>

      {/* Bloque 4 — Cuando coordinas personas */}
      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Cuando coordinas personas
        </h3>
        <dl className="mt-4 space-y-4">
          {coord.map((c) => (
            <div key={c.label}>
              <dt className="text-sm font-semibold text-slate-900">{c.label}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-slate-600">{c.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Bloques 5 y 6 — Fortalezas / A observar */}
      <section className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 shadow-sm">
          <h3 className="flex items-center gap-2 font-bold text-emerald-900">
            <span className="text-lg">✦</span> Lo que puede estar funcionando bien
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-emerald-900/80">
            {narrative.strengths.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="text-emerald-500">+</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6 shadow-sm">
          <h3 className="flex items-center gap-2 font-bold text-amber-900">
            <span className="text-lg">⚑</span> Lo que merece la pena observar
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-amber-900/80">
            {narrative.observe.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="text-amber-500">!</span> {s}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-amber-900/70">
            {narrative.complement}
          </p>
        </div>
      </section>

      {/* Insights personalizados */}
      {insights.length > 0 && (
        <section className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Insights personalizados
          </h3>
          <ul className="mt-3 space-y-3">
            {insights.map((text) => (
              <li
                key={text}
                className="rounded-xl border border-indigo-100 bg-white/70 p-4 text-sm leading-relaxed text-slate-700"
              >
                {text}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Equilibrio del perfil (EQ) */}
      <section className="flex flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:flex-row">
        <EqGauge value={result.eq} />
        <div className="text-center sm:text-left">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Equilibrio del perfil (EQ)
          </h3>
          <p className="mt-1 text-lg font-bold text-slate-900">{eqBand.label}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            {eqBand.description}
          </p>
        </div>
      </section>

      {/* Bloque 7 — Tu experimento de esta semana */}
      <section className="rounded-2xl border border-violet-100 bg-violet-50/50 p-6 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-violet-400">
          Tu experimento de esta semana
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {narrative.experiment}
        </p>
      </section>

      {/* Bloque 8 — Una pregunta para ti */}
      <section className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-white/60">
          Una pregunta para ti
        </h3>
        <p className="mt-2 text-lg font-semibold leading-relaxed">
          {narrative.question}
        </p>
      </section>

      {/* Cierre */}
      <p className="px-1 text-xs leading-relaxed text-slate-400">
        Este mapa describe tendencias de interacción según tus respuestas y puede
        variar con el contexto y el momento. No constituye un diagnóstico, sino un
        punto de partida para la conversación y el desarrollo.
      </p>
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
