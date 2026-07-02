"use client";

import { useActionState } from "react";
import { saveGlossary } from "@/app/actions/narratives";
import type { ActionState } from "@/app/actions/org";

/** Editor de glosario por idioma (JSON), guarda vía acción saveGlossary. */
export function GlossaryEditor({
  locale,
  label,
  initialJson,
}: {
  locale: "ca" | "es";
  label: string;
  initialJson: string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    saveGlossary,
    {},
  );
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="locale" value={locale} />
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-slate-700">{label}</span>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-brand px-4 py-1.5 text-xs font-semibold text-white shadow-sm shadow-sky-500/25 transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
      </div>
      <textarea
        name="content"
        defaultValue={initialJson}
        spellCheck={false}
        className="h-[440px] w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
      />
      {state.error && (
        <p className="text-xs font-medium text-rose-600">{state.error}</p>
      )}
      {state.message && (
        <p className="text-xs font-medium text-emerald-600">{state.message}</p>
      )}
    </form>
  );
}
