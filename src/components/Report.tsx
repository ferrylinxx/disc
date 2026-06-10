import type { InstrumentDefinition, ScoringResult } from "@/lib/engine/types";
import {
  DIMENSION_NARRATIVES,
  resolveEqBand,
} from "@/lib/narratives/disc-gesem.narratives";
import {
  intensityLabel,
  intensityMessage,
  resolveProfile,
} from "@/lib/narratives/disc-gesem.catalog";
import { ScoreBars } from "./ScoreBars";

interface Props {
  result: ScoringResult;
  def: InstrumentDefinition;
}

/** Informe individual (versión web) generado desde el resultado y narrativas. */
export function Report({ result, def }: Props) {
  const dimName = (code: string) =>
    def.dimensions.find((d) => d.code === code)?.name ?? code;
  const dimColor = (code: string) =>
    def.dimensions.find((d) => d.code === code)?.color ?? "#0f172a";
  const eqBand = resolveEqBand(result.eq);
  const profile = resolveProfile(result.profileCode);
  const primary = DIMENSION_NARRATIVES[result.primaryDimension];
  const secondary = result.isEq
    ? null
    : DIMENSION_NARRATIVES[result.secondaryDimension];
  const pColor = dimColor(result.primaryDimension);
  const sColor = result.isEq ? pColor : dimColor(result.secondaryDimension);

  return (
    <div className="space-y-6">
      <header
        className="animate-scale-in relative overflow-hidden rounded-3xl p-8 text-white shadow-xl"
        style={{
          backgroundImage: `linear-gradient(135deg, ${pColor}, ${sColor})`,
        }}
      >
        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
          Tu perfil DISC GESEM
        </p>
        <div className="mt-3 flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl font-black backdrop-blur">
            {result.profileCode}
          </span>
          <div>
            <h2 className="text-2xl font-extrabold leading-tight">{profile.name}</h2>
            <p className="text-sm text-white/85">{profile.summary}</p>
          </div>
        </div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
          <span className="opacity-80">Intensidad</span>
          <span>{intensityLabel(result.intensity)}</span>
        </div>
      </header>

      <section className="animate-fade-up rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
          Lectura de tu resultado
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {intensityMessage(result.intensity)}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          Estos resultados describen tendencias conductuales según tus respuestas y
          pueden variar con el contexto y el momento. No constituyen un diagnóstico.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Perfil global
        </h3>
        <div className="mt-4">
          <ScoreBars scores={result.global} dimensions={def.dimensions} />
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 shadow-sm">
          <h3 className="flex items-center gap-2 font-bold text-emerald-900">
            <span className="text-lg">✦</span> Fortalezas
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-emerald-900/80">
            {primary?.strengths.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="text-emerald-500">+</span> {s}
              </li>
            ))}
            {secondary?.strengths.slice(0, 1).map((s) => (
              <li key={s} className="flex gap-2">
                <span className="text-emerald-500">+</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6 shadow-sm">
          <h3 className="flex items-center gap-2 font-bold text-amber-900">
            <span className="text-lg">⚑</span> Puntos de atención
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-amber-900/80">
            {primary?.watchouts.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="text-amber-500">!</span> {s}
              </li>
            ))}
          </ul>
        </div>
      </section>

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

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Comportamiento por contexto
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {def.contexts.map((ctx, i) => (
            <div
              key={ctx.code}
              className="animate-fade-up rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:shadow-md"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <h4 className="font-semibold text-slate-900">{ctx.name}</h4>
              <div className="mt-3">
                <ScoreBars
                  scores={result.byContext[ctx.code]}
                  dimensions={def.dimensions}
                  compact
                />
              </div>
            </div>
          ))}
        </div>
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
