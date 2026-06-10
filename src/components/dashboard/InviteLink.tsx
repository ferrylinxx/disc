"use client";

import { useEffect, useState } from "react";

/**
 * Muestra el enlace de invitación de un participante con botones de copiar y
 * abrir. Construye la URL absoluta en cliente a partir del origin actual.
 */
export function InviteLink({
  path,
  compact = false,
}: {
  path: string;
  compact?: boolean;
}) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => setOrigin(window.location.origin), []);

  const url = origin ? `${origin}${path}` : path;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard no disponible */
    }
  }

  return (
    <div
      className={`flex items-center gap-2 ${compact ? "" : "rounded-xl bg-slate-50 p-2"}`}
    >
      <code className="flex-1 truncate rounded-lg bg-white px-2.5 py-1.5 text-xs text-slate-500 ring-1 ring-slate-200">
        {url}
      </code>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
      >
        {copied ? "¡Copiado!" : "Copiar"}
      </button>
      <a
        href={path}
        target="_blank"
        rel="noreferrer"
        className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
      >
        Abrir
      </a>
    </div>
  );
}
