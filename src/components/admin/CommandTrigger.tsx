"use client";

/** Botón del topbar que abre el command palette (⌘K). */
export function CommandTrigger() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("gesem:command"))}
      className="flex w-full max-w-sm items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-left text-sm text-slate-400 transition hover:border-slate-300 hover:bg-white"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <span className="flex-1 truncate">Buscar organización, persona o acción…</span>
      <kbd className="hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 sm:inline">
        ⌘K
      </kbd>
    </button>
  );
}
