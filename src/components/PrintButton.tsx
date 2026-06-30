"use client";

/** Botón para descargar el informe como PDF mediante la impresión del navegador. */
export function PrintButton({ label = "↓ Descargar informe (PDF)" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="bg-brand rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
    >
      {label}
    </button>
  );
}
