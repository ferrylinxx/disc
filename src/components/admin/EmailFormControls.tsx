"use client";

import { useEffect, useId, useRef, useState } from "react";
import { IconPlus, IconSmile, IconTranslate, Spinner } from "./icons";

/** Emojis habituales en asuntos de invitación a un taller. */
const SUBJECT_EMOJIS = ["👋", "📅", "✅", "✨", "🎯", "📝", "🤝", "💬", "🚀", "⏰", "📌", "🙌"];

/**
 * El asunto no admite negrita ni colores en ningún programa de correo; los
 * emojis sí se ven. Botón con un panel de emojis que se insertan en el cursor.
 */
export function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title="Añadir un emoji al asunto"
        aria-label="Añadir un emoji al asunto"
        className={`grid h-7 w-7 place-items-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
          open ? "bg-sky-100 text-sky-800" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <IconSmile size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1.5 w-52 rounded-xl border border-slate-200 bg-white p-2.5 shadow-lg">
          <div className="grid grid-cols-6 gap-1">
            {SUBJECT_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onMouseDown={(ev) => ev.preventDefault()}
                onClick={() => {
                  onPick(e);
                  setOpen(false);
                }}
                className="grid h-8 w-8 place-items-center rounded-lg text-lg transition hover:bg-slate-100"
              >
                {e}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-snug text-slate-400">
            El asunto no admite negritas ni colores en ningún programa de correo; los emojis, sí.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Controles del formulario del correo de invitación: botón de IA (con el filo
 * de los cuatro colores DISC, `.ai-edge` en globals.css), traducción y chips
 * para insertar variables.
 */

/** Chispa de la IA rellena con los colores DISC (D, I, S, C). */
function Sparkle({ size }: { size: number }) {
  // useId puede traer caracteres que rompen url(#…): se dejan solo letras y números.
  const id = `ai-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="shrink-0">
      <defs>
        {/* De arriba a la izquierda (D) a abajo a la derecha (C), como en el mapa DISC. */}
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d1133a" />
          <stop offset="0.4" stopColor="#ffae00" />
          <stop offset="0.7" stopColor="#30c67c" />
          <stop offset="1" stopColor="#6f7bf7" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M10.5 2.5c.55 4.7 3.05 7.2 7.75 7.75-4.7.55-7.2 3.05-7.75 7.75-.55-4.7-3.05-7.2-7.75-7.75 4.7-.55 7.2-3.05 7.75-7.75Z"
      />
      <path
        fill={`url(#${id})`}
        d="M18.75 14.25c.28 2.35 1.52 3.6 3.75 3.85-2.23.26-3.47 1.5-3.75 3.9-.28-2.4-1.52-3.64-3.75-3.9 2.23-.25 3.47-1.5 3.75-3.85Z"
      />
    </svg>
  );
}

export function AiButton({
  busy,
  onClick,
  label,
  busyLabel = "Pensando…",
  title,
  size = "md",
  disabled = false,
}: {
  busy: boolean;
  onClick: () => void;
  label: string;
  busyLabel?: string;
  title: string;
  size?: "sm" | "md";
  disabled?: boolean;
}) {
  const sm = size === "sm";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      aria-busy={busy}
      title={title}
      className={`ai-edge inline-flex shrink-0 items-center gap-1.5 rounded-full font-semibold text-slate-800 transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${
        busy ? "text-slate-600" : "disabled:opacity-50"
      } ${sm ? "h-7 px-2.5 text-[11px]" : "h-8 px-3.5 text-xs"}`}
    >
      {busy ? <Spinner size={sm ? 12 : 13} className="text-[#6f7bf7]" /> : <Sparkle size={sm ? 13 : 15} />}
      {busy ? busyLabel : label}
    </button>
  );
}

export function TranslateControl({
  busy,
  disabled,
  onTranslate,
}: {
  /** Idioma al que se está traduciendo ahora mismo (o null). */
  busy: "ca" | "es" | null;
  /** Sin texto que traducir. */
  disabled: boolean;
  onTranslate: (to: "ca" | "es") => void;
}) {
  return (
    <div
      role="group"
      aria-label="Traducir el mensaje con IA"
      className="inline-flex h-8 shrink-0 items-stretch overflow-hidden rounded-full border border-slate-200 bg-white text-xs font-semibold shadow-sm shadow-slate-200/60"
    >
      <span className="flex items-center gap-1.5 pl-3 pr-2.5 text-slate-500">
        <IconTranslate size={15} />
        Traducir
      </span>
      {(["ca", "es"] as const).map((to) => (
        <button
          key={to}
          type="button"
          onClick={() => onTranslate(to)}
          disabled={disabled || busy !== null}
          aria-busy={busy === to}
          title={
            disabled
              ? "Escribe primero el mensaje"
              : `Traduce el mensaje al ${to === "ca" ? "catalán" : "castellano"} con IA, conservando el formato`
          }
          className="flex items-center gap-1.5 border-l border-slate-200 px-3 text-slate-700 transition hover:bg-sky-50 hover:text-sky-700 focus-visible:bg-sky-50 focus-visible:text-sky-700 focus-visible:outline-none disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent aria-[busy=true]:bg-sky-50 aria-[busy=true]:text-sky-700"
        >
          {busy === to && <Spinner size={12} />}
          {to === "ca" ? "Català" : "Castellano"}
        </button>
      ))}
    </div>
  );
}

export interface EmailVariable {
  tag: string;
  label: string;
  help: string;
}

export function VariableChips({
  target,
  vars,
  onInsert,
}: {
  target: "subject" | "intro";
  vars: readonly EmailVariable[];
  onInsert: (tag: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-0.5 text-xs text-slate-500">
        Insertar en {target === "subject" ? "el asunto" : "el mensaje"}:
      </span>
      {vars.map((v) => (
        <button
          key={v.tag}
          type="button"
          // Mantiene el cursor donde estaba (en el asunto o en el editor).
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onInsert(v.tag)}
          title={`${v.help}. Se escribe ${v.tag} y se rellena al enviar.`}
          className="group inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white pl-1 pr-2.5 text-xs font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-sky-100 text-sky-700 transition group-hover:bg-[#00a1e0] group-hover:text-white">
            <IconPlus size={12} strokeWidth={2.4} />
          </span>
          {v.label}
        </button>
      ))}
    </div>
  );
}
