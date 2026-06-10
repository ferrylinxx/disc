import Link from "next/link";
import { getActiveInstrument } from "@/lib/instruments";
import { DIMENSION_NARRATIVES } from "@/lib/narratives/disc-gesem.narratives";

const FLOW = [
  "Invitación",
  "Preparación",
  "Autoposicionamiento",
  "Cuestionario DISC",
  "Resultado",
  "Informe + plan",
];

export default function Home() {
  const def = getActiveInstrument();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-24">
      <section className="animate-fade-up flex flex-col items-center pt-16 text-center sm:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/70 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
          {def.instrumentName} · v{def.version}
        </span>
        <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl">
          Autoconocimiento conductual y{" "}
          <span className="text-gradient">desarrollo de equipos</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
          No es solo un test DISC. Es una plataforma de desarrollo
          organizacional: evaluación, informe individual, mapa de equipo,
          insights y plan de acción.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/evaluacion"
            className="bg-brand group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-500/30 transition hover:scale-[1.03] hover:shadow-indigo-500/40"
          >
            Comenzar evaluación
            <span className="transition group-hover:translate-x-0.5">→</span>
          </Link>
          <a
            href="#dimensiones"
            className="rounded-full border border-slate-200 bg-white/80 px-7 py-3.5 text-sm font-semibold text-slate-700 backdrop-blur transition hover:border-slate-300 hover:bg-white"
          >
            Conocer el modelo
          </a>
        </div>
        <dl className="mt-12 grid w-full max-w-2xl grid-cols-3 gap-4">
          {[
            [def.dimensions.length, "Dimensiones"],
            [def.contexts.length, "Contextos"],
            [def.items.length, "Ítems"],
          ].map(([n, label]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur"
            >
              <dt className="text-3xl font-extrabold text-slate-900">{n}</dt>
              <dd className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                {label}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="animate-fade-up mt-20 [animation-delay:120ms]">
        <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
          Experiencia del participante
        </h2>
        <ol className="mt-6 flex flex-wrap items-center justify-center gap-2.5 text-sm">
          {FLOW.map((step, i) => (
            <li key={step} className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 font-medium text-slate-700 shadow-sm backdrop-blur">
                <span className="bg-brand flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                {step}
              </span>
              {i < FLOW.length - 1 && (
                <span className="text-slate-300">→</span>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section id="dimensiones" className="mt-20 scroll-mt-24">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          El modelo DISC GESEM
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-600">
          Cuatro dimensiones conductuales, medidas a lo largo de{" "}
          {def.contexts.length} contextos profesionales.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {def.dimensions.map((d, i) => {
            const n = DIMENSION_NARRATIVES[d.code];
            return (
              <div
                key={d.code}
                className="animate-fade-up group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-xl"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ backgroundColor: d.color }}
                />
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-black text-white shadow-md transition group-hover:scale-110"
                    style={{ backgroundColor: d.color }}
                  >
                    {d.code}
                  </span>
                  <h3 className="font-bold text-slate-900">{d.name}</h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  {n?.summary}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="mt-20 border-t border-slate-200/70 pt-6 text-center text-sm text-slate-400">
        DISC GESEM V1 · Demo funcional · Motor de evaluaciones configurable
      </footer>
    </main>
  );
}
