import Link from "next/link";
import { getActiveInstrument } from "@/lib/instruments";
import { DIMENSION_NARRATIVES } from "@/lib/narratives/disc-gesem.narratives";
import { styleShort } from "@/lib/narratives/disc-gesem.catalog";

/** Datos del mock de informe del hero (solo presentación). */
const HERO_BARS = [
  { code: "D", percent: 78 },
  { code: "I", percent: 64 },
  { code: "S", percent: 38 },
  { code: "C", percent: 52 },
];

const STEPS = [
  {
    n: "01",
    title: "Invita a tu equipo",
    text: "Crea la organización, añade participantes uno a uno o en bloque y cada persona recibe su enlace personal por email.",
  },
  {
    n: "02",
    title: "Responden en 15 minutos",
    text: "35 situaciones profesionales reales. El progreso se guarda solo: pueden parar y seguir en cualquier dispositivo.",
  },
  {
    n: "03",
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
    text: "Sin jerga: qué te impulsa, qué observar y un experimento concreto para esta semana.",
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

export default function Home() {
  const def = getActiveInstrument();
  const dimColor = new Map(def.dimensions.map((d) => [d.code, d.color]));
  const color = (c: string) => dimColor.get(c) ?? "#6366f1";

  return (
    <main className="w-full overflow-x-clip">
      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="relative">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px]"
          aria-hidden
          style={{
            background:
              "radial-gradient(60rem 32rem at 70% -10%, rgba(99,102,241,0.18), transparent 60%), radial-gradient(50rem 30rem at 10% 0%, rgba(217,70,239,0.12), transparent 55%)",
          }}
        />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pt-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-white/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
              {def.instrumentName} · v{def.version} · basado en el modelo DISC
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl">
              Descubre cómo trabaja
              <br />
              <span className="text-gradient">tu equipo de verdad</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Evaluación de estilos conductuales, informe individual con
              insights y mapa colectivo del equipo. De la invitación al plan de
              acción, en una sola plataforma.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/evaluacion"
                className="bg-brand group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-500/30 transition hover:scale-[1.03] hover:shadow-indigo-500/40"
              >
                Probar la evaluación
                <span className="transition group-hover:translate-x-0.5">→</span>
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-slate-200 bg-white/80 px-7 py-3.5 text-sm font-semibold text-slate-700 backdrop-blur transition hover:border-slate-300 hover:bg-white"
              >
                Acceso para organizaciones
              </Link>
            </div>
            <dl className="mt-12 flex max-w-md gap-8">
              {[
                [String(def.dimensions.length), "dimensiones"],
                [String(def.contexts.length), "contextos"],
                [String(def.items.length), "ítems"],
                ["~15′", "duración"],
              ].map(([n, label]) => (
                <div key={label}>
                  <dt className="text-2xl font-extrabold tracking-tight text-slate-900">
                    {n}
                  </dt>
                  <dd className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Mock visual del informe */}
          <div className="animate-fade-up relative hidden lg:block [animation-delay:150ms]">
            <div
              className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] opacity-60 blur-2xl"
              aria-hidden
              style={{
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(217,70,239,0.18))",
              }}
            />
            <div className="ring-brand animate-float rounded-3xl border border-white/70 bg-white/90 p-6 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Informe individual
                  </div>
                  <div className="mt-0.5 text-lg font-bold text-slate-900">
                    Impulsar y movilizar
                  </div>
                </div>
                <span className="bg-brand rounded-xl px-3 py-1.5 text-sm font-black text-white shadow-lg shadow-indigo-500/30">
                  DI
                </span>
              </div>
              <div className="mt-5 space-y-3">
                {HERO_BARS.map((b) => (
                  <div key={b.code} className="flex items-center gap-3">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white"
                      style={{ backgroundColor: color(b.code) }}
                    >
                      {b.code}
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${b.percent}%`,
                          backgroundColor: color(b.code),
                        }}
                      />
                    </div>
                    <span className="w-9 text-right text-xs font-bold text-slate-600">
                      {b.percent}%
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2.5 text-[11px]">
                <div className="rounded-xl bg-emerald-50 p-3 font-medium leading-snug text-emerald-800">
                  ✦ Decisión y empuje en momentos de avance
                </div>
                <div className="rounded-xl bg-amber-50 p-3 font-medium leading-snug text-amber-800">
                  ⚑ Reservar espacio para escuchar al equipo
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3">
                <span className="text-[11px] font-medium text-slate-300">
                  Tu experimento de esta semana
                </span>
                <span className="text-xs font-bold text-white">→</span>
              </div>
            </div>
            <div className="absolute -bottom-12 -left-12 w-52 rounded-2xl border border-white/70 bg-white/95 p-4 shadow-xl backdrop-blur">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Mapa de equipo
              </div>
              <div className="mt-2 flex items-end gap-1.5">
                {[62, 48, 35, 55].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md"
                    style={{
                      height: `${h * 0.7}px`,
                      backgroundColor: color(["D", "I", "S", "C"][i]),
                    }}
                  />
                ))}
              </div>
              <div className="mt-2 text-[10px] font-medium text-slate-500">
                8 personas · participación 92%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────── CÓMO FUNCIONA ─────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-indigo-500">
          Cómo funciona
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-3xl font-extrabold tracking-tight text-slate-900">
          Del email de invitación al plan de acción
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className="animate-fade-up group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-7 backdrop-blur transition hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-100"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="text-gradient text-5xl font-black opacity-30 transition group-hover:opacity-60">
                {s.n}
              </span>
              <h3 className="mt-3 text-lg font-bold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────── EL MODELO ─────────────────────── */}
      <section id="dimensiones" className="relative scroll-mt-24 py-16">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden
          style={{
            background:
              "radial-gradient(45rem 24rem at 50% 50%, rgba(99,102,241,0.08), transparent 70%)",
          }}
        />
        <div className="mx-auto w-full max-w-6xl px-6">
          <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-indigo-500">
            El modelo
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-3xl font-extrabold tracking-tight text-slate-900">
            Cuatro maneras de aportar al equipo
          </p>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
            Ningún estilo es mejor que otro: cada uno suma algo distinto. El
            cuestionario observa tus tendencias en {def.contexts.length}{" "}
            contextos profesionales.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {def.dimensions.map((d, i) => {
              const n = DIMENSION_NARRATIVES[d.code];
              return (
                <div
                  key={d.code}
                  className="animate-fade-up group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 p-6 backdrop-blur transition hover:-translate-y-1.5 hover:shadow-2xl"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div
                    className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-10 blur-xl transition group-hover:opacity-25"
                    style={{ backgroundColor: d.color }}
                    aria-hidden
                  />
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-black text-white shadow-lg transition group-hover:scale-110"
                    style={{ backgroundColor: d.color }}
                  >
                    {d.code}
                  </span>
                  <h3 className="mt-4 font-bold text-slate-900">{d.name}</h3>
                  <div
                    className="mt-0.5 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: d.color }}
                  >
                    {styleShort(d.code)}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {n?.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────── CARACTERÍSTICAS ─────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-indigo-500">
          La plataforma
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-3xl font-extrabold tracking-tight text-slate-900">
          Todo lo que necesitas para llevarlo a tu organización
        </p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="animate-fade-up rounded-2xl border border-slate-200/80 bg-white/80 p-6 backdrop-blur transition hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/60"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="bg-brand flex h-10 w-10 items-center justify-center rounded-xl text-lg text-white shadow-md shadow-indigo-500/25">
                {f.icon}
              </span>
              <h3 className="mt-4 font-bold text-slate-900">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────── NOTA METODOLÓGICA ─────────────────────── */}
      <section className="mx-auto w-full max-w-4xl px-6 pb-4">
        <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-8 text-center backdrop-blur">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
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

      {/* ─────────────────────── CTA FINAL ─────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="bg-brand relative overflow-hidden rounded-[2.5rem] px-8 py-14 text-center text-white shadow-2xl shadow-indigo-500/30">
          <div
            className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl"
            aria-hidden
          />
          <h2 className="relative mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Empieza hoy: pruébalo tú antes de invitar a tu equipo
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-sm text-white/80">
            La evaluación abierta es anónima y tarda unos 15 minutos. Verás el
            mismo informe que recibirá tu equipo.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/evaluacion"
              className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-indigo-700 shadow-xl transition hover:scale-[1.03]"
            >
              Comenzar evaluación →
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-white/40 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Soy una organización
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────── FOOTER ─────────────────────── */}
      <footer className="border-t border-slate-200/70 bg-white/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500">
          <div className="flex items-center gap-2.5">
            <span className="bg-brand flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black text-white">
              G
            </span>
            <span className="font-bold text-slate-700">
              DISC <span className="text-gradient">GESEM</span>
            </span>
            <span className="text-slate-400">· v{def.version}</span>
          </div>
          <nav className="flex flex-wrap gap-5 text-xs font-medium">
            <Link href="/evaluacion" className="transition hover:text-slate-800">
              Evaluación
            </Link>
            <Link href="/login" className="transition hover:text-slate-800">
              Acceso
            </Link>
            <a href="#dimensiones" className="transition hover:text-slate-800">
              El modelo
            </a>
          </nav>
          <p className="text-xs text-slate-400">
            Los resultados describen tendencias y no constituyen un diagnóstico.
          </p>
        </div>
      </footer>
    </main>
  );
}
