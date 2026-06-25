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
  /** Datos de portada (nombre, cliente, proyecto, fecha). */
  meta?: {
    participantName?: string | null;
    clientName?: string | null;
    projectName?: string | null;
    date?: string | null;
  };
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
export function Report({ result, def, narrative: narrativeProp, meta }: Props) {
  const dimColor = (code: string) =>
    def.dimensions.find((d) => d.code === code)?.color ?? "#0f172a";
  const eqBand = resolveEqBand(result.eq);
  const narrative = narrativeProp ?? buildProfileNarrative(result);
  const contexts = contextLeaders(result);
  const insights = generateInsights(result);
  const pColor = dimColor(result.primaryDimension);
  const sColor = result.isEq ? pColor : dimColor(result.secondaryDimension);

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
            Informe individual
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
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Cómo interpretar este informe
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          DISC GESEM describe los <strong>recursos</strong> que sueles utilizar con
          más frecuencia y cómo pueden influir en tu forma de comunicarte,
          coordinarte y colaborar. <strong>No</strong> es un test de personalidad ni
          un diagnóstico: describe tendencias, según tus respuestas, que pueden
          variar con el contexto y el momento.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Ningún perfil es mejor que otro.",
            "El resultado muestra tendencias predominantes.",
            "Todos los recursos pueden desarrollarse.",
            "El verdadero valor aparece al comprender las diferencias.",
          ].map((p, i) => (
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

      {/* Tu posición dentro del modelo DISC (cuadrícula clásica + intensidad) */}
      <section id="r-posicion" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2">
          <Num n="01" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Tu posición dentro del modelo DISC
          </h3>
        </div>
        <div className="mt-4 grid items-center gap-6 lg:grid-cols-2">
          <DiscGrid result={result} dimColor={dimColor} />
          <div>
            <p className="mb-3 text-xs font-medium text-slate-400">
              Intensidad relativa de cada recurso, según tus respuestas:
            </p>
            <ScoreBars scores={result.global} dimensions={def.dimensions} />
          </div>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-slate-400">
          Los recursos predominantes muestran las tendencias que aparecen con
          mayor frecuencia en tu manera de actuar y relacionarte. No representan
          capacidades fijas ni limitan tu forma de responder en otros contextos.
        </p>
      </section>

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

      {/* Cómo puedes aportar mejor a un equipo (elemento diferencial DISC GESEM) */}
      <section id="r-equipo" className="scroll-mt-24 rounded-2xl border border-sky-100 bg-sky-50/40 p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Num n="06" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-sky-500">
            Cómo puedes aportar mejor a un equipo
          </h3>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Comprender tus recursos resulta especialmente útil cuando los utilizas de
          forma consciente con otras personas. Cada equipo necesita recursos
          diferentes: el valor aparece al reconocer qué aportas y qué necesitas de
          los demás.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
            <h4 className="text-sm font-bold text-emerald-900">
              Lo que probablemente aportas
            </h4>
            <ul className="mt-2 space-y-1.5 text-sm text-emerald-900/80">
              {narrative.team.contributions.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="text-emerald-500">+</span> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-sky-100 bg-white/70 p-4">
            <h4 className="text-sm font-bold text-sky-900">
              Lo que probablemente agradeces de otras personas
            </h4>
            <ul className="mt-2 space-y-1.5 text-sm text-sky-900/80">
              {narrative.team.appreciates.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="text-sky-500">◆</span> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {narrative.team.differences && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white/70 p-4">
            <h4 className="text-sm font-bold text-slate-800">
              Cuando aparecen diferencias
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {narrative.team.differences}
            </p>
          </div>
        )}
      </section>

      {/* Coordinación y colaboración */}
      <section id="r-coordinacion" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2">
          <Num n="07" />
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
          <Num n="08" />
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
          <Num n="09" />
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
      <section id="r-repertorio" className="scroll-mt-24 rounded-2xl border border-sky-100 bg-sky-50/50 p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Num n="10" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-sky-400">
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
                className="rounded-xl border border-sky-100 bg-white/70 p-4 text-sm leading-relaxed text-slate-700"
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
            11
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
  { n: "01", label: "Tu posición dentro del modelo DISC", href: "#r-posicion" },
  { n: "02", label: "Recursos predominantes", href: "#r-recursos" },
  { n: "03", label: "Aportación habitual", href: "#r-aportacion" },
  { n: "04", label: "Lo que otras personas suelen valorar", href: "#r-valoracion" },
  { n: "05", label: "Aspectos que merece la pena observar", href: "#r-observar" },
  { n: "06", label: "Cómo puedes aportar mejor a un equipo", href: "#r-equipo" },
  { n: "07", label: "Coordinación y colaboración", href: "#r-coordinacion" },
  { n: "08", label: "Comunicación", href: "#r-comunicacion" },
  { n: "09", label: "Contextos de mejor desempeño", href: "#r-contextos" },
  { n: "10", label: "Ampliación de repertorio", href: "#r-repertorio" },
  { n: "11", label: "Preguntas para la reflexión", href: "#r-reflexion" },
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
              className="group flex items-baseline gap-2 py-0.5 text-sm text-slate-600 transition hover:text-sky-600"
            >
              <span className="text-[11px] font-bold tabular-nums text-slate-300 group-hover:text-sky-400">
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

/**
 * Cuadrícula DISC clásica (2×2) con un marcador en la posición de la persona.
 * Ejes: horizontal tarea↔personas, vertical activo↔reflexivo. D arriba-izq,
 * I arriba-der, C abajo-izq, S abajo-der.
 */
function DiscGrid({
  result,
  dimColor,
}: {
  result: ScoringResult;
  dimColor: (c: string) => string;
}) {
  const share = (code: string) =>
    result.percentages.find((p) => p.dimensionCode === code)?.share ?? 0;
  const d = share("D");
  const i = share("I");
  const s = share("S");
  const c = share("C");
  const x = (i + s - (d + c)) / 100; // + derecha (personas)
  const y = (d + i - (s + c)) / 100; // + arriba (activo)
  const cx = Math.max(24, Math.min(176, 100 + x * 76));
  const cy = Math.max(24, Math.min(176, 100 - y * 76));

  const quad = (code: string, qx: number, qy: number) => (
    <g key={code}>
      <rect x={qx} y={qy} width={90} height={90} fill={dimColor(code)} opacity={0.1} />
      <text x={qx + 12} y={qy + 34} fontSize="32" fontWeight="800" fill={dimColor(code)} opacity={0.45}>
        {code}
      </text>
      <text x={qx + 12} y={qy + 50} fontSize="10.5" fontWeight="700" fill={dimColor(code)}>
        {styleShort(code)}
      </text>
    </g>
  );

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 200 200" className="h-60 w-60" role="img" aria-label="Tu posición en el modelo DISC">
        <rect x="10" y="10" width="180" height="180" rx="14" fill="#ffffff" stroke="#e2e8f0" />
        {quad("D", 10, 10)}
        {quad("I", 100, 10)}
        {quad("C", 10, 100)}
        {quad("S", 100, 100)}
        <line x1="100" y1="12" x2="100" y2="188" stroke="#e2e8f0" strokeWidth="1.5" />
        <line x1="12" y1="100" x2="188" y2="100" stroke="#e2e8f0" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r="11" fill="#ffffff" />
        <circle cx={cx} cy={cy} r="9" fill={dimColor(result.primaryDimension)} />
        <circle cx={cx} cy={cy} r="9" fill="none" stroke="#ffffff" strokeWidth="2.5" />
      </svg>
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
