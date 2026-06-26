"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ActionState } from "@/app/actions/org";

type Tone = "success" | "error" | "info";

/** Lanza un toast desde cualquier componente cliente. */
export function toast(message: string, tone: Tone = "success") {
  window.dispatchEvent(
    new CustomEvent("gesem:toast", { detail: { message, tone } }),
  );
}

interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
}

/** Contenedor de notificaciones (montar una vez en el layout). */
export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent).detail as { message: string; tone: Tone };
      const id = ++counter.current;
      setItems((prev) => [...prev, { id, ...detail }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };
    window.addEventListener("gesem:toast", onToast);
    return () => window.removeEventListener("gesem:toast", onToast);
  }, []);

  const tones: Record<Tone, string> = {
    success: "border-emerald-200 bg-white text-emerald-700",
    error: "border-rose-200 bg-white text-rose-700",
    info: "border-sky-200 bg-white text-sky-700",
  };
  const icons: Record<Tone, string> = { success: "✓", error: "✕", info: "ℹ" };

  return (
    <div className="fixed bottom-5 right-5 z-[70] flex w-[min(92vw,360px)] flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={`animate-fade-up flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg shadow-slate-900/10 ${tones[t.tone]}`}
        >
          <span className="text-base">{icons[t.tone]}</span>
          <span className="flex-1 text-slate-700">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Botón que abre un modal de confirmación y, al confirmar, ejecuta una server
 * action (sustituye a window.confirm). Lanza un toast con el resultado.
 */
export function ConfirmButton({
  action,
  fields,
  children,
  title,
  body,
  confirmLabel = "Confirmar",
  triggerClass,
  triggerLabel,
  successMessage,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  fields: Record<string, string>;
  children?: ReactNode;
  title: string;
  body: string;
  confirmLabel?: string;
  triggerClass?: string;
  triggerLabel?: ReactNode;
  successMessage?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    {},
  );
  const seen = useRef<ActionState | null>(null);

  useEffect(() => {
    if (state === seen.current) return;
    seen.current = state;
    if (state.error) toast(state.error, "error");
    else if (state.ok) {
      toast(state.message ?? successMessage ?? "Hecho.", "success");
      setOpen(false);
    }
  }, [state, successMessage]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClass}
      >
        {triggerLabel ?? children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[65] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <form
            action={formAction}
            onClick={(e) => e.stopPropagation()}
            className="animate-scale-in w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            {Object.entries(fields).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{body}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {pending ? "…" : confirmLabel}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
