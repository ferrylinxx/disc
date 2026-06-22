"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import type { InstrumentDefinition, ScoringResult } from "@/lib/engine/types";
import type { ProfileNarrative } from "@/lib/narratives/disc-gesem.profiles";
import { evaluate } from "@/app/actions/evaluate";
import { clearDraft, saveDraft } from "@/app/actions/drafts";
import { Report } from "./Report";

type Step = "intro" | "self" | "quiz" | "reflect" | "result";
type Picks = Record<string, { most?: string; least?: string }>;
export type DraftState = {
  step: Step;
  index: number;
  picks: Picks;
  self: string | null;
  reflect: string;
  timeAccum: Record<string, number>;
  changeCounts: Record<string, number>;
  answered: number;
  savedAt: number;
};

export function Questionnaire({
  def,
  invite,
}: {
  def: InstrumentDefinition;
  /** Contexto de invitación: si llega, el resultado se guarda en BD. */
  invite?: {
    token: string;
    participantName?: string;
    /** Borrador persistido en BD (reanudación multi-dispositivo). */
    draft?: DraftState | null;
  };
}) {
  const [step, setStep] = useState<Step>("intro");
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<Picks>({});
  const [self, setSelf] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reflect, setReflect] = useState("");
  const [hasDraft, setHasDraft] = useState(false);
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [narrative, setNarrative] = useState<ProfileNarrative | null>(null);
  const [pending, start] = useTransition();

  // Trazabilidad para validación: ms acumulados y nº de cambios por ítem.
  const timeAccum = useRef<Record<string, number>>({});
  const changeCounts = useRef<Record<string, number>>({});

  // Autoguardado de progreso: clave por invitación (o anónimo).
  const draftKey = invite?.token ? `disc-draft:${invite.token}` : "disc-draft:anon";
  const savedDraft = useRef<DraftState | null>(null);

  const item = def.items[index];
  const current = picks[item?.code] ?? {};
  const answered = useMemo(
    () => def.items.filter((i) => picks[i.code]?.most && picks[i.code]?.least).length,
    [picks, def.items],
  );

  // Fase de la elección dentro del bloque actual: primero "Más", luego "Menos".
  const phase: "most" | "least" | "done" = !current.most
    ? "most"
    : !current.least
      ? "least"
      : "done";

  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function runEvaluate(finalPicks: Picks) {
    const responses = def.items.map((i) => ({
      itemCode: i.code,
      mostOptionCode: finalPicks[i.code]?.most ?? "",
      leastOptionCode: finalPicks[i.code]?.least ?? "",
      timeMs: timeAccum.current[i.code],
      changeCount: changeCounts.current[i.code] ?? 0,
    }));
    start(async () => {
      const res = await evaluate({
        responses,
        token: invite?.token,
        selfPlacement: self ?? undefined,
        reflection: reflect.trim() || undefined,
      });
      if (res.ok) {
        setResult(res.result ?? null);
        setNarrative(res.narrative ?? null);
        setStep("result");
      } else {
        setError(res.error ?? "Error al calcular el resultado.");
      }
    });
  }

  /** Un único gesto por opción: elige Más, luego Menos y avanza solo. */
  function pick(optionCode: string) {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    const c = picks[item.code] ?? {};

    // Sin "Más" todavía, o bloque ya completo → (re)empieza por "Más".
    if (!c.most || (c.most && c.least)) {
      // Rehacer un bloque ya completado cuenta como cambio.
      if (c.most && c.least) bumpChange(item.code);
      setPicks((prev) => ({ ...prev, [item.code]: { most: optionCode } }));
      return;
    }
    // Reelegir la misma que "Más" reinicia el bloque.
    if (optionCode === c.most) {
      bumpChange(item.code);
      setPicks((prev) => ({ ...prev, [item.code]: {} }));
      return;
    }
    // Fija "Menos": bloque completo → avanza (o reflexiona si es el último).
    const updated: Picks = {
      ...picks,
      [item.code]: { most: c.most, least: optionCode },
    };
    setPicks(updated);
    const isLast = index >= def.items.length - 1;
    advanceTimer.current = setTimeout(() => {
      if (isLast) setStep("reflect");
      else setIndex((i) => i + 1);
    }, 420);
  }

  /** Incrementa el contador de cambios de un ítem (señal de ambigüedad). */
  function bumpChange(code: string) {
    changeCounts.current[code] = (changeCounts.current[code] ?? 0) + 1;
  }

  // Limpia cualquier avance pendiente al desmontar.
  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  // Al montar: ofrece el borrador con más progreso entre BD (multi-dispositivo)
  // y localStorage (mismo navegador). Gana el más reciente por `savedAt`.
  useEffect(() => {
    let local: DraftState | null = null;
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) local = JSON.parse(raw) as DraftState;
    } catch {
      // localStorage no disponible o JSON corrupto: se ignora.
    }
    const server = invite?.draft ?? null;
    const candidates = [local, server].filter(
      (d): d is DraftState => !!d && d.answered > 0 && d.step !== "result",
    );
    if (candidates.length === 0) return;
    const best = candidates.reduce((a, b) =>
      (b.savedAt ?? 0) > (a.savedAt ?? 0) ? b : a,
    );
    savedDraft.current = best;
    setHasDraft(true);
  }, [draftKey, invite?.draft]);

  // Guarda el progreso mientras se avanza (no en intro ni en el resultado).
  // localStorage es inmediato; la BD se persiste con debounce (multi-dispositivo).
  useEffect(() => {
    if (step === "intro" || step === "result") return;
    const draft: DraftState = {
      step,
      index,
      picks,
      self,
      reflect,
      timeAccum: timeAccum.current,
      changeCounts: changeCounts.current,
      answered,
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch {
      // Sin persistencia local: el cuestionario sigue funcionando.
    }
    if (!invite?.token) return;
    const token = invite.token;
    const t = setTimeout(() => {
      void saveDraft(token, draft as unknown as Record<string, unknown>);
    }, 1200);
    return () => clearTimeout(t);
  }, [step, index, picks, self, reflect, answered, draftKey, invite?.token]);

  // Al completar, descarta el borrador (local y BD): el resultado ya está persistido.
  useEffect(() => {
    if (step !== "result") return;
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // Ignorado.
    }
    if (invite?.token) void clearDraft(invite.token);
  }, [step, draftKey, invite?.token]);

  /** Restaura el borrador guardado y continúa donde se dejó. */
  function resumeDraft() {
    const d = savedDraft.current;
    if (!d) return;
    setPicks(d.picks ?? {});
    setSelf(d.self ?? null);
    setReflect(d.reflect ?? "");
    setIndex(d.index ?? 0);
    timeAccum.current = d.timeAccum ?? {};
    changeCounts.current = d.changeCounts ?? {};
    setHasDraft(false);
    setStep(d.step === "result" || d.step === "intro" ? "quiz" : d.step);
  }

  /** Descarta el borrador (local y BD) y empieza desde cero. */
  function discardDraft() {
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // Ignorado.
    }
    if (invite?.token) void clearDraft(invite.token);
    savedDraft.current = null;
    setHasDraft(false);
  }

  // Cronometra el tiempo dedicado a cada ítem (acumulado entre visitas).
  useEffect(() => {
    if (step !== "quiz") return;
    const code = def.items[index]?.code;
    const enter = Date.now();
    return () => {
      if (!code) return;
      timeAccum.current[code] =
        (timeAccum.current[code] ?? 0) + (Date.now() - enter);
    };
  }, [index, step, def.items]);

  // Atajos de teclado 1–4 para elegir opción durante el cuestionario.
  useEffect(() => {
    if (step !== "quiz" || !item) return;
    function onKey(e: KeyboardEvent) {
      const n = Number(e.key);
      if (n >= 1 && n <= item.options.length) {
        e.preventDefault();
        pick(item.options[n - 1].code);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (step === "intro") {
    return (
      <Shell
        step="intro"
        title={
          invite?.participantName
            ? `Hola, ${invite.participantName.split(" ")[0]}`
            : "Preparación"
        }
        subtitle="Antes de empezar, dedica un momento a entender cómo funciona."
      >
        {hasDraft && (
          <div className="mb-5 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4">
            <p className="text-sm font-semibold text-indigo-900">
              Tienes un cuestionario a medias
            </p>
            <p className="mt-1 text-sm text-indigo-700/90">
              Guardamos tu progreso ({savedDraft.current?.answered ?? 0}{" "}
              {savedDraft.current?.answered === 1 ? "bloque" : "bloques"}{" "}
              completados). ¿Quieres continuar donde lo dejaste?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={resumeDraft}
                className="bg-brand inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:scale-[1.02]"
              >
                Continuar
              </button>
              <button
                onClick={discardDraft}
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100"
              >
                Empezar de nuevo
              </button>
            </div>
          </div>
        )}
        <div className="relative grid aspect-video w-full place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700">
          <button className="bg-brand flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white shadow-xl transition hover:scale-105">
            ▶
          </button>
          <span className="absolute bottom-3 right-3 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white/90">
            Vídeo de preparación
          </span>
        </div>
        <p className="mt-5 leading-relaxed text-slate-600">
          En cada bloque toca primero la frase que{" "}
          <strong className="text-emerald-700">más</strong> te representa y luego
          la que <strong className="text-rose-700">menos</strong>. El cuestionario{" "}
          <strong className="text-slate-900">avanza solo</strong>; en ordenador
          puedes usar las teclas{" "}
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-600">
            1
          </kbd>
          –
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-600">
            4
          </kbd>
          .
        </p>
        <Primary onClick={() => setStep("self")}>Continuar</Primary>
      </Shell>
    );
  }

  if (step === "self") {
    return (
      <Shell
        step="self"
        title="¿Cómo te ves?"
        subtitle="Elige el estilo con el que más te identificas a priori. Luego lo compararemos con tu resultado real."
      >
        <div className="grid grid-cols-2 gap-3">
          {def.dimensions.map((d) => {
            const active = self === d.code;
            return (
              <button
                key={d.code}
                onClick={() => setSelf(d.code)}
                className={`group flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${active ? "bg-white shadow-md" : "border-slate-200 bg-white/60 hover:border-slate-300"}`}
                style={active ? { borderColor: d.color } : undefined}
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-base font-black text-white shadow-sm transition group-hover:scale-110"
                  style={{ backgroundColor: d.color }}
                >
                  {d.code}
                </span>
                <span className="font-semibold text-slate-800">{d.name}</span>
              </button>
            );
          })}
        </div>
        <Primary disabled={!self} onClick={() => setStep("quiz")}>
          Empezar cuestionario
        </Primary>
      </Shell>
    );
  }

  if (step === "quiz") {
    const pct = Math.round(((index + 1) / def.items.length) * 100);
    return (
      <Shell step="quiz" title="Cuestionario">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>
            Ítem {index + 1} de {def.items.length}
          </span>
          <span>{answered} completados · {pct}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="bg-brand h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div
          className={`mt-5 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${phase === "least" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow-sm">
            {phase === "least" ? "2" : "1"}
          </span>
          {phase === "least"
            ? "Ahora toca la que MENOS te representa"
            : "Toca la frase que MÁS te representa"}
        </div>
        <p className="mt-5 text-lg font-semibold leading-snug text-slate-900">
          {item.prompt}
        </p>
        <div className="mt-5 space-y-2.5">
          {item.options.map((opt, i) => {
            const isMost = current.most === opt.code;
            const isLeast = current.least === opt.code;
            const color =
              def.dimensions.find((d) => d.code === opt.dimensionCode)?.color ??
              "#64748b";
            return (
              <button
                key={opt.code}
                onClick={() => pick(opt.code)}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition hover:scale-[1.01] active:scale-[0.99] ${
                  isMost
                    ? "border-emerald-400 bg-emerald-50 shadow-sm"
                    : isLeast
                      ? "border-rose-400 bg-rose-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition ${
                    isMost
                      ? "bg-emerald-500 text-white"
                      : isLeast
                        ? "bg-rose-500 text-white"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isMost ? "✓" : isLeast ? "✕" : i + 1}
                </span>
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="flex-1 text-sm font-medium text-slate-700">
                  {opt.text}
                </span>
                {isMost && (
                  <span className="shrink-0 text-xs font-bold text-emerald-600">
                    MÁS
                  </span>
                )}
                {isLeast && (
                  <span className="shrink-0 text-xs font-bold text-rose-600">
                    MENOS
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {error && (
          <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        )}
        <div className="mt-7 flex items-center justify-between">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
          >
            ← Atrás
          </button>
          {current.most && (
            <button
              onClick={() => {
                bumpChange(item.code);
                setPicks((prev) => ({ ...prev, [item.code]: {} }));
              }}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100"
            >
              Reiniciar bloque
            </button>
          )}
          {pending && (
            <span className="text-sm font-semibold text-indigo-600">
              Calculando…
            </span>
          )}
        </div>
      </Shell>
    );
  }

  if (step === "reflect") {
    return (
      <Shell
        step="reflect"
        title="Una última reflexión"
        subtitle="Opcional. Tus palabras nos ayudan a interpretar y mejorar el cuestionario."
      >
        <label className="text-sm font-semibold text-slate-700">
          ¿Te has reconocido en lo que has ido respondiendo? ¿Algo te ha
          sorprendido?
        </label>
        <textarea
          value={reflect}
          onChange={(e) => setReflect(e.target.value)}
          rows={5}
          placeholder="Escribe aquí tu reflexión (opcional)…"
          className="mt-3 w-full rounded-2xl border-2 border-slate-200 bg-white p-4 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
        />
        {error && (
          <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        )}
        <div className="mt-7 flex items-center gap-3">
          <Primary disabled={pending} onClick={() => runEvaluate(picks)}>
            {pending ? "Calculando…" : "Ver mi resultado"}
          </Primary>
          {!pending && (
            <button
              onClick={() => {
                setReflect("");
                runEvaluate(picks);
              }}
              className="mt-7 rounded-full px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100"
            >
              Omitir
            </button>
          )}
        </div>
      </Shell>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-14">
      <div className="animate-fade-up mb-6 flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
          ✓
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
          ¡Gracias por completar el cuestionario!
        </h1>
        <p className="mt-2 max-w-md leading-relaxed text-slate-600">
          Este es tu informe. Describe los recursos que sueles utilizar con más
          frecuencia. Puedes leerlo ahora; también lo tendrá tu facilitador.
        </p>
      </div>

      {result ? (
        <div className="print-area">
          <Report result={result} def={def} narrative={narrative ?? undefined} />
        </div>
      ) : (
        <p className="rounded-2xl border border-slate-200 bg-white/80 p-6 text-center text-sm text-slate-600">
          Hemos recibido tus respuestas correctamente. Tu facilitador te hará
          llegar tu informe personalizado.
        </p>
      )}

      <div className="no-print mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => window.print()}
          className="bg-brand rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
        >
          ↓ Descargar informe (PDF)
        </button>
        <Link
          href="/"
          className="rounded-full border border-slate-200 bg-white/80 px-6 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        >
          ← Volver al inicio
        </Link>
      </div>
    </main>
  );
}

const STEPS: { key: Step; label: string }[] = [
  { key: "intro", label: "Preparación" },
  { key: "self", label: "Posición" },
  { key: "quiz", label: "Cuestionario" },
  { key: "reflect", label: "Reflexión" },
  { key: "result", label: "Resultado" },
];

function Shell({
  step,
  title,
  subtitle,
  children,
}: {
  step: Step;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const activeIdx = STEPS.findIndex((s) => s.key === step);
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col px-6 py-10 sm:py-14">
      <div className="animate-fade-up glass rounded-3xl border border-white/70 p-7 shadow-xl sm:p-9">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && <p className="mt-2 leading-relaxed text-slate-600">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}

function Primary({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-brand mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
    >
      {children}
    </button>
  );
}
