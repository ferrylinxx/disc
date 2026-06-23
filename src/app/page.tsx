import Link from "next/link";
import { getActiveInstrument } from "@/lib/instruments";
import { DIMENSION_NARRATIVES } from "@/lib/narratives/disc-gesem.narratives";
import { styleShort } from "@/lib/narratives/disc-gesem.catalog";

/** Degradados de las dimensiones DISC (Diseño DISC GESEM), a 45º. */
const DISC_GRAD: Record<string, [string, string]> = {
  D: ["#D1133A", "#F5C0C5"],
  I: ["#FFAE00", "#F9E866"],
  S: ["#30C67C", "#82F4B1"],
  C: ["#6F7BF7", "#9BF8F4"],
};
const discGrad = (code: string, deg = 45): string => {
  const g = DISC_GRAD[code] ?? ["#00a1e0", "#93e4ed"];
  return `linear-gradient(${deg}deg, ${g[0]}, ${g[1]})`;
};

/** Datos del mock del hero (solo presentación). */
const HERO_BARS = [
  { code: "D", percent: 78 },
  { code: "I", percent: 64 },
  { code: "S", percent: 38 },
  { code: "C", percent: 52 },
];

/** Intensidades del heatmap del mock de equipo (fijas, solo presentación). */
const HEAT = [
  [0.9, 0.5, 0.2, 0.4],
  [0.7, 0.8, 0.3, 0.3],
  [0.3, 0.9, 0.5, 0.2],
  [0.4, 0.4, 0.8, 0.5],
  [0.2, 0.3, 0.5, 0.9],
];

const STEPS = [
  {
    n: "1",
    title: "Invita a tu equipo",
    text: "Añade participantes uno a uno o pegando una lista desde Excel. Cada persona recibe su enlace personal por email.",
  },
  {
    n: "2",
    title: "Responden en 15 minutos",
    text: "35 situaciones profesionales reales. El progreso se guarda solo: pueden parar y seguir en cualquier dispositivo.",
  },
  {
    n: "3",
    title: "Informe y mapa de equipo",
    text: "Cada persona recibe su mapa de tendencias y tú ves el del equipo: estilos, complementariedad, vacíos y plan de acción.",
  },
];

const FEATURES = [
  {
    icon: "✉",
    title: "Invitaciones con un clic",
    text: "Email automático con enlace personal, reenvío y carga masiva desde una lista pegada.",
  },
  {
    icon: "⟳",
    title: "Continúa donde lo dejaste",
    text: "El borrador se guarda en el navegador y en el servidor: cambia de dispositivo sin perder nada.",
  },
  {
    icon: "◫",
    title: "Informe que se entiende",
    text: "Sin jerga: qué recursos utilizas, qué merece la pena observar y preguntas para la reflexión.",
  },
  {
    icon: "⬡",
    title: "Mapa de equipo",
    text: "Distribución de estilos, complementariedad, vacíos y conversaciones recomendadas.",
  },
  {
    icon: "⇩",
    title: "Exporta y comparte",
    text: "Informe individual en PDF, mapa de equipo en CSV/PDF y envío por email al participante.",
  },
  {
    icon: "▦",
    title: "Multi-organización",
    text: "Clientes, proyectos y equipos separados, con roles de administrador y facilitador.",
  },
];

const REPORT_BLOCKS = [
  "Tu tendencia predominante",
  "Recursos predominantes",
  "Aportación habitual",
  "Coordinación y colaboración",
  "Aspectos que merece la pena observar",
  "Preguntas para la reflexión",
];

const TEAM_BLOCKS = [
  "Distribución de estilos del equipo",
  "Combinaciones y complementariedad",
  "Vacíos: lo que falta en la mesa",
  "Conversaciones recomendadas",
  "Plan de acción colectivo",
  "Exportación CSV y PDF",
];

export default function Home() {
  const def = getActiveInstrument();
  const dims = [...def.dimensions].sort((a, b) => a.order - b.order);
  const dimColor = new Map(dims.map((d) => [d.code, d.color]));
  const color = (c: string) => dimColor.get(c) ?? "#00a1e0";
  const contexts = [...def.contexts].sort((a, b) => a.order - b.order);

  return (
    <main className="w-full overflow-x-clip">
      {/* ═══════════════════════════ HERO ═══════════════════════════ */}
      <section className="relative">
        <div className="aurora pointer-events-none absolute inset-x-0 top-0 -z-20 h-[760px]" aria-hidden />
        <div className="bg-dots pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px]" aria-hidden />

        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200/70 bg-white/80 px-4 py-1.5 text-xs font-semibold text-sky-700 shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
              </span>
              {def.instrumentName} · v{def.version} · basado en el modelo DISC
            </span>

            <h1 className="mt-7 text-[2.75rem] font-black leading-[0.98] tracking-tighter text-slate-900 sm:text-7xl">
              Descubre cómo
              <br />
              trabaja{" "}
              <span className="bg-brand-animated bg-clip-text text-transparent">
                tu equipo
              </span>
              <br />
              de verdad
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-600">
              Evaluación de estilos conductuales, informe individual con
              insights y mapa colectivo del equipo.{" "}
              <span className="font-semibold text-slate-800">
                De la invitación al plan de acción
              </span>
              , en una sola plataforma.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/evaluacion"
                className="bg-brand-animated group inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-white shadow-2xl shadow-sky-500/40 transition hover:scale-[1.04] hover:shadow-cyan-500/30"
              >
                Probar la evaluación
                <span className="transition group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-slate-300/80 bg-white/70 px-8 py-4 text-sm font-semibold text-slate-700 backdrop-blur transition hover:border-sky-300 hover:bg-white hover:text-sky-700"
              >
                Acceso para organizaciones
              </Link>
            </div>

            {/* Señal de credibilidad: producto de GESEM + enfoque metodológico */}
            <div className="mt-7 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-slate-500">
              <span>Una herramienta de</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/gesem-logo.svg" alt="GESEM" className="h-5 w-auto" />
              <span className="hidden text-slate-300 sm:inline">·</span>
              <span className="hidden text-slate-400 sm:inline">
                comunicación, coordinación y colaboración
              </span>
            </div>

            <dl className="mt-12 flex max-w-lg divide-x divide-slate-200">
              {[
                [String(dims.length), "dimensiones"],
                [String(contexts.length), "contextos"],
                [String(def.items.length), "ítems"],
                ["~15′", "duración"],
              ].map(([n, label], i) => (
                <div key={label} className={i === 0 ? "pr-7" : "px-7"}>
                  <dt className="text-3xl font-black tracking-tight text-slate-900">
                    {n}
                  </dt>
                  <dd className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Mock del informe con profundidad */}
          <div className="animate-fade-up relative hidden lg:block [animation-delay:150ms]">
            {/* Halo cónico giratorio */}
            <div
              className="animate-spin-slow pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl"
              aria-hidden
              style={{
                background:
                  "conic-gradient(from 0deg, #00a1e0, #93e4ed, #0ea5e9, #10b981, #00a1e0)",
              }}
            />

            <div className="animate-float relative -rotate-1 rounded-[1.75rem] border border-white/80 bg-white/95 p-6 shadow-[0_40px_80px_-24px_rgba(0,161,224,0.45)] backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Informe individual
                  </div>
                  <div className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">
                    Impulsar y movilizar
                  </div>
                  <div className="mt-0.5 text-[11px] font-medium text-slate-400">
                    Tendencia definida · según tus respuestas
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="bg-brand-animated rounded-2xl px-3.5 py-2 text-base font-black text-white shadow-lg shadow-sky-500/40">
                    DI
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3.5">
                {HERO_BARS.map((b, i) => (
                  <div key={b.code} className="flex items-center gap-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black text-white shadow-sm"
                      style={{ backgroundImage: discGrad(b.code) }}
                    >
                      {b.code}
                    </span>
                    <span className="w-20 shrink-0 text-[11px] font-semibold text-slate-500">
                      {styleShort(b.code)}
                    </span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="animate-bar h-full rounded-full"
                        style={{
                          width: `${b.percent}%`,
                          backgroundImage: discGrad(b.code, 90),
                          animationDelay: `${300 + i * 140}ms`,
                        }}
                      />
                    </div>
                    <span className="w-9 text-right text-xs font-bold text-slate-700">
                      {b.percent}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5 text-[11px]">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-3 font-medium leading-snug text-emerald-800">
                  ✦ Decisión y empuje en momentos de avance
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50/80 p-3 font-medium leading-snug text-amber-800">
                  ⚑ Reservar espacio para escuchar al equipo
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-slate-900 px-4 py-3">
                <span className="text-[11px] font-medium text-slate-300">
                  Una pregunta para reflexionar
                </span>
                <span className="bg-brand flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white">
                  →
                </span>
              </div>
            </div>

            {/* Tarjeta flotante: mapa de equipo */}
            <div className="absolute -bottom-14 -left-14 w-56 rotate-2 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-2xl shadow-slate-900/15 backdrop-blur transition hover:rotate-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Mapa de equipo
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                  92% participación
                </span>
              </div>
              <div className="mt-3 flex h-16 items-end gap-2">
                {[62, 48, 35, 55].map((h, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="animate-bar w-full rounded-md"
                      style={{
                        height: `${h}%`,
                        backgroundColor: color(dims[i]?.code ?? "D"),
                        animationDelay: `${600 + i * 120}ms`,
                      }}
                    />
                    <span className="text-[9px] font-bold text-slate-400">
                      {dims[i]?.code}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chip flotante: EQ */}
            <div className="absolute -right-8 -top-8 flex rotate-3 items-center gap-3 rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-xl shadow-sky-500/15 backdrop-blur">
              <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="4.5" />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="url(#eqg)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeDasharray="94.2"
                  strokeDashoffset="33"
                />
                <defs>
                  <linearGradient id="eqg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00a1e0" />
                    <stop offset="100%" stopColor="#93e4ed" />
                  </linearGradient>
                </defs>
              </svg>
              <div>
                <div className="text-base font-black leading-none text-slate-900">65</div>
                <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  Equilibrio
                </div>
              </div>
            </div>
          </div>

          {/* Mock simplificado del informe — visible en móvil/tablet */}
          <div className="animate-fade-up lg:hidden [animation-delay:120ms]">
            <div className="relative mx-auto max-w-md rounded-[1.5rem] border border-slate-200/80 bg-white/95 p-5 shadow-xl shadow-sky-500/15 backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Informe individual
                  </div>
                  <div className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">
                    Impulsar + Conectar
                  </div>
                  <div className="mt-0.5 text-[11px] font-medium text-slate-400">
                    Impulsar y movilizar · según tus respuestas
                  </div>
                </div>
                <span className="bg-brand-animated shrink-0 rounded-xl px-3 py-1.5 text-sm font-black text-white shadow-sm">
                  DI
                </span>
              </div>

              <div className="mt-5 space-y-2.5">
                {HERO_BARS.map((b) => (
                  <div key={b.code} className="flex items-center gap-2.5">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-black text-white"
                      style={{ backgroundImage: discGrad(b.code) }}
                    >
                      {b.code}
                    </span>
                    <span className="w-16 shrink-0 text-[11px] font-semibold text-slate-500">
                      {styleShort(b.code)}
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${b.percent}%`, backgroundImage: discGrad(b.code, 90) }}
                      />
                    </div>
                    <span className="w-8 text-right text-[11px] font-bold text-slate-600">
                      {b.percent}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5 text-[11px]">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-2.5 font-medium leading-snug text-emerald-800">
                  ✦ Decisión y empuje en momentos de avance
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50/80 p-2.5 font-medium leading-snug text-amber-800">
                  ⚑ Reservar espacio para escuchar al equipo
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Marquee de contextos */}
        <div className="relative border-y border-slate-200/70 bg-white/60 py-4 backdrop-blur">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-[#f6f7fb] to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-[#f6f7fb] to-transparent"
            aria-hidden
          />
          <div className="overflow-hidden">
            <div className="animate-marquee flex w-max items-center gap-10">
              {[...contexts, ...contexts].map((c, i) => (
                <span
                  key={`${c.code}-${i}`}
                  className="flex items-center gap-10 text-xs font-bold uppercase tracking-[0.22em] text-slate-400"
                >
                  {c.name}
                  <span className="text-gradient text-base leading-none">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ CÓMO FUNCIONA ═══════════════════════ */}
      <section className="reveal mx-auto w-full max-w-6xl px-6 py-24">
        <h2 className="text-center text-xs font-bold uppercase tracking-[0.3em] text-sky-500">
          Cómo funciona
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-4xl font-black tracking-tight text-slate-900">
          Del email de invitación
          <br />
          <span className="text-gradient">al plan de acción</span>
        </p>

        <div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-6">
          <div
            className="pointer-events-none absolute left-[16%] right-[16%] top-7 hidden border-t-2 border-dashed border-sky-200 md:block"
            aria-hidden
          />
          {STEPS.map((s) => (
            <div key={s.n} className="relative text-center md:px-4">
              <span className="bg-brand-animated relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black text-white shadow-xl shadow-sky-500/30">
                {s.n}
              </span>
              <h3 className="mt-5 text-lg font-extrabold tracking-tight text-slate-900">
                {s.title}
              </h3>
              <p className="mx-auto mt-2.5 max-w-xs text-sm leading-relaxed text-slate-600">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ PRODUCTO (sección oscura) ═══════════════════ */}
      <section className="relative overflow-hidden bg-slate-950 py-24">
        <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[44rem] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
          aria-hidden
          style={{
            background: "linear-gradient(120deg, #00a1e0, #93e4ed)",
          }}
        />
        <div className="relative mx-auto w-full max-w-6xl px-6">
          <h2 className="text-center text-xs font-bold uppercase tracking-[0.3em] text-sky-400">
            El resultado
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-4xl font-black tracking-tight text-white">
            Dos entregables que
            <br />
            <span className="bg-brand-animated bg-clip-text text-transparent">
              abren conversaciones
            </span>
          </p>

          <div className="mt-16 grid gap-6 lg:grid-cols-2">
            {/* Panel: informe individual */}
            <div className="reveal group rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur transition hover:border-sky-400/40 hover:bg-white/[0.06]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold tracking-tight text-white">
                  Informe individual
                </h3>
                <span className="rounded-full border border-sky-400/30 bg-sky-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-300">
                  12 apartados
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Un mapa personal en clave de tendencia: claro, accionable y sin
                etiquetas cerradas.
              </p>
              <div className="mt-6 space-y-2.5">
                {HERO_BARS.map((b) => (
                  <div key={b.code} className="flex items-center gap-3">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black text-white"
                      style={{ backgroundImage: discGrad(b.code) }}
                    >
                      {b.code}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full opacity-90"
                        style={{ width: `${b.percent}%`, backgroundImage: discGrad(b.code, 90) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <ul className="mt-6 grid gap-2 text-[13px] text-slate-300 sm:grid-cols-2">
                {REPORT_BLOCKS.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="text-gradient mt-0.5 text-xs">✦</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Panel: mapa de equipo */}
            <div className="reveal group rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur transition hover:border-cyan-400/40 hover:bg-white/[0.06]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold tracking-tight text-white">
                  Mapa de equipo
                </h3>
                <span className="rounded-full border border-cyan-400/30 bg-cyan-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-300">
                  10 pantallas
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                La foto colectiva: cómo se complementa el equipo por contexto y
                qué le falta en la mesa.
              </p>
              <div className="mt-6">
                <div className="grid grid-cols-[auto_repeat(4,1fr)] items-center gap-1.5">
                  <span />
                  {dims.map((d) => (
                    <span
                      key={d.code}
                      className="text-center text-[10px] font-black"
                      style={{ color: d.color }}
                    >
                      {d.code}
                    </span>
                  ))}
                  {contexts.slice(0, 5).map((c, ri) => (
                    <FragmentRow key={c.code} label={c.name} row={HEAT[ri]} dims={dims} />
                  ))}
                </div>
              </div>
              <ul className="mt-6 grid gap-2 text-[13px] text-slate-300 sm:grid-cols-2">
                {TEAM_BLOCKS.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="text-gradient mt-0.5 text-xs">✦</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
            {[
              "Índice de equilibrio (EQ)",
              "Intensidad del perfil",
              "Insights automáticos",
              "Narrativas en castellano claro",
              "PDF · CSV · Email",
            ].map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-1.5 text-xs font-semibold text-slate-300"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ EL MODELO ═══════════════════════ */}
      <section id="dimensiones" className="reveal relative mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-24">
        <h2 className="text-center text-xs font-bold uppercase tracking-[0.3em] text-sky-500">
          El modelo
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-4xl font-black tracking-tight text-slate-900">
          Cuatro maneras de
          <br />
          <span className="text-gradient">aportar al equipo</span>
        </p>
        <p className="mx-auto mt-4 max-w-xl text-center text-slate-600">
          Ningún estilo es mejor que otro: cada uno suma algo distinto. El
          cuestionario observa tus tendencias en {contexts.length} contextos
          profesionales.
        </p>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {dims.map((d) => {
            const n = DIMENSION_NARRATIVES[d.code];
            return (
              <div
                key={d.code}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 pt-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
                style={{ boxShadow: `0 0 0 0 transparent` }}
              >
                <span
                  className="pointer-events-none absolute inset-x-0 top-0 h-1.5"
                  style={{ background: discGrad(d.code, 90) }}
                  aria-hidden
                />
                <span
                  className="pointer-events-none absolute -right-4 -top-7 select-none text-[7.5rem] font-black leading-none opacity-[0.07] transition duration-300 group-hover:scale-110 group-hover:opacity-[0.13]"
                  style={{ color: d.color }}
                  aria-hidden
                >
                  {d.code}
                </span>
                <span
                  className="relative flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-black text-white shadow-lg transition duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    backgroundImage: discGrad(d.code),
                    boxShadow: `0 12px 24px -8px ${d.color}80`,
                  }}
                >
                  {d.code}
                </span>
                <h3 className="relative mt-4 text-lg font-extrabold tracking-tight text-slate-900">
                  {d.name}
                </h3>
                <div
                  className="relative mt-0.5 text-[11px] font-black uppercase tracking-[0.18em]"
                  style={{ color: d.color }}
                >
                  {styleShort(d.code)}
                </div>
                <p className="relative mt-3 text-sm leading-relaxed text-slate-600">
                  {n?.summary}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════ CARACTERÍSTICAS ═══════════════════════ */}
      <section className="reveal relative">
        <div className="bg-dots pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto w-full max-w-6xl px-6 py-24">
          <h2 className="text-center text-xs font-bold uppercase tracking-[0.3em] text-sky-500">
            La plataforma
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-4xl font-black tracking-tight text-slate-900">
            Todo lo que necesitas para
            <br />
            <span className="text-gradient">llevarlo a tu organización</span>
          </p>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-3xl border border-slate-200/80 bg-white/90 p-7 backdrop-blur transition duration-300 hover:-translate-y-1.5 hover:border-sky-200 hover:shadow-2xl hover:shadow-sky-200/50"
              >
                <span className="bg-brand-animated flex h-11 w-11 items-center justify-center rounded-2xl text-lg text-white shadow-lg shadow-sky-500/30 transition duration-300 group-hover:scale-110 group-hover:rotate-6">
                  {f.icon}
                </span>
                <h3 className="mt-5 font-extrabold tracking-tight text-slate-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ NOTA METODOLÓGICA ═══════════════════ */}
      <section className="reveal mx-auto w-full max-w-4xl px-6 pb-8">
        <div className="relative overflow-hidden rounded-3xl border border-sky-100 bg-white/80 p-9 text-center backdrop-blur">
          <span className="text-gradient mx-auto block text-2xl">❝</span>
          <h2 className="mt-2 text-sm font-black uppercase tracking-[0.2em] text-slate-700">
            Un punto de partida, no una etiqueta
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            DISC GESEM es un cuestionario de estilos conductuales alineado con
            las cuatro dimensiones del modelo DISC. Los resultados describen
            tendencias que pueden variar según el contexto y el momento, y no
            constituyen un diagnóstico: son una hipótesis de trabajo para la
            conversación y el desarrollo personal y de equipo.
          </p>
        </div>
      </section>

      {/* ═══════════════════════ CTA FINAL ═══════════════════════ */}
      <section className="reveal mx-auto w-full max-w-6xl px-6 py-20">
        <div className="bg-brand-animated relative overflow-hidden rounded-[2.75rem] px-8 py-16 text-center text-white shadow-2xl shadow-sky-500/40">
          <div
            className="pointer-events-none absolute -left-16 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-28 -right-12 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl"
            aria-hidden
          />
          <h2 className="relative mx-auto max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">
            Pruébalo tú antes de
            <br />
            invitar a tu equipo
          </h2>
          <p className="relative mx-auto mt-5 max-w-xl text-sm text-white/85">
            La evaluación abierta es anónima y tarda unos 15 minutos. Verás el
            mismo informe que recibirá tu equipo.
          </p>
          <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/evaluacion"
              className="rounded-full bg-white px-9 py-4 text-sm font-black text-sky-700 shadow-2xl transition hover:scale-[1.05]"
            >
              Comenzar evaluación →
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-white/50 bg-white/10 px-9 py-4 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              Soy una organización
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer className="border-t border-slate-200/70 bg-white/70 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-6 py-10">
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="max-w-xs">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/gesem-logo.svg" alt="GESEM" className="h-7 w-auto" />
                <span className="h-5 w-px bg-slate-300" />
                <span className="font-black tracking-tight text-slate-800">DISC</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Plataforma de autoconocimiento conductual y desarrollo de
                equipos. {def.instrumentName} v{def.version}.
              </p>
            </div>
            <nav className="flex gap-14 text-sm">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Producto
                </p>
                <ul className="mt-3 space-y-2 text-[13px] font-medium text-slate-600">
                  <li>
                    <Link href="/evaluacion" className="transition hover:text-sky-600">
                      Evaluación
                    </Link>
                  </li>
                  <li>
                    <a href="#dimensiones" className="transition hover:text-sky-600">
                      El modelo
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Organizaciones
                </p>
                <ul className="mt-3 space-y-2 text-[13px] font-medium text-slate-600">
                  <li>
                    <Link href="/login" className="transition hover:text-sky-600">
                      Acceso
                    </Link>
                  </li>
                  <li>
                    <Link href="/facilitador" className="transition hover:text-sky-600">
                      Facilitadores
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
          <p className="mt-10 border-t border-slate-100 pt-5 text-center text-xs text-slate-400">
            Los resultados describen tendencias conductuales y no constituyen un
            diagnóstico.
          </p>
        </div>
      </footer>
    </main>
  );
}

/** Fila del heatmap del mock de equipo (etiqueta + 4 celdas). */
function FragmentRow({
  label,
  row,
  dims,
}: {
  label: string;
  row: number[];
  dims: { code: string; color: string }[];
}) {
  return (
    <>
      <span className="pr-2 text-right text-[10px] font-semibold text-slate-400">
        {label}
      </span>
      {row.map((v, ci) => (
        <span
          key={ci}
          className="h-7 rounded-md transition hover:scale-105"
          style={{ backgroundColor: dims[ci]?.color, opacity: 0.15 + v * 0.75 }}
        />
      ))}
    </>
  );
}
