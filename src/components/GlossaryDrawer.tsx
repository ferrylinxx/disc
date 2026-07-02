"use client";

import { useEffect, useState } from "react";
import { getGlossary, type Glossary as GlossaryData } from "@/lib/glossary";
import { GlossaryView } from "@/components/GlossaryView";
import type { Lang } from "@/lib/i18n/dictionaries";

const chipCls =
  "inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900";

/**
 * Botón que abre el glosario en un panel lateral (drawer). Reutilizable desde el
 * informe, el panel o el cuestionario. `className` permite variar el estilo.
 */
export function GlossaryButton({
  lang,
  label,
  className,
}: {
  lang: Lang;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  // Arranca con el glosario por defecto y lo actualiza con la versión editada
  // (guardada desde admin) al abrir el drawer.
  const [data, setData] = useState<GlossaryData>(() => getGlossary(lang));
  const text = label ?? data.title;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let alive = true;
    fetch(`/api/glosario?lang=${lang}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d && Array.isArray(d.groups)) setData(d as GlossaryData);
      })
      .catch(() => {});

    return () => {
      alive = false;
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, lang]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className ?? chipCls}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M4 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16H6a2 2 0 0 1-2-2zM17 21a2 2 0 0 0 2-2V6M8 7h6M8 11h6" />
        </svg>
        {text}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="animate-fade-up relative ml-auto flex h-full w-full max-w-lg flex-col bg-slate-50 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                {data.title}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="h-5 w-5"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <GlossaryView data={data} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
