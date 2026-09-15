"use client";

import { useState } from "react";

/**
 * Copia el enlace de invitación sin mostrarlo en pantalla: la URL con el token
 * a la vista ocupaba media fila y no aporta nada a quien gestiona.
 */
export function CopyInviteButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard no disponible */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      title="Copiar enlace de invitación"
      className="shrink-0 whitespace-nowrap rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
    >
      {copied ? "¡Copiado!" : "⎘ Copiar enlace"}
    </button>
  );
}
