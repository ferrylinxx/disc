import type { ReactNode } from "react";
import { RoyalFrame } from "./RoyalFrame";

/** Widgets presentacionales del panel admin (server-safe, sin estado). */

/** Tarjeta de KPI con icono, valor destacado y pista contextual opcional. */
export function StatTile({
  label,
  value,
  hint,
  accent = "#00a1e0",
  icon,
}: {
  label: string;
  value: number | string;
  hint?: string;
  accent?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="glass animate-scale-in rounded-2xl border border-white/60 p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-100">
      <div className="flex items-start justify-between gap-2">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          {icon}
        </span>
        {hint && (
          <span className="text-[11px] font-medium text-slate-400">{hint}</span>
        )}
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </div>
      <div className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
    </div>
  );
}

/** Anillo de progreso (donut SVG) con degradado de marca. */
export function ProgressRing({
  value,
  label,
  size = 132,
}: {
  value: number;
  label?: string;
  size?: number;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00a1e0" />
            <stop offset="100%" stopColor="#5ac3dd" />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="10"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tracking-tight text-slate-900">
          {pct}%
        </span>
        {label && (
          <span className="text-[11px] font-medium text-slate-500">{label}</span>
        )}
      </div>
    </div>
  );
}

const AVATAR_COLORS = [
  "#00a1e0",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#5ac3dd",
];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_SIZES = {
  sm: { px: 28, cls: "h-7 w-7 text-[10px]" },
  md: { px: 36, cls: "h-9 w-9 text-xs" },
  lg: { px: 96, cls: "h-24 w-24 text-3xl" },
} as const;

/**
 * Avatar circular: la foto de perfil si la hay y, si no, iniciales con un color
 * estable derivado del nombre. Los superadmin llevan aro de oro con tiara, de
 * una sola pieza (RoyalFrame), y ondas que salen hacia fuera (estilos .royal en
 * globals.css).
 */
export function Avatar({
  name,
  image,
  superadmin = false,
  size = "md",
}: {
  name: string;
  image?: string | null;
  superadmin?: boolean;
  size?: keyof typeof AVATAR_SIZES;
}) {
  const idx =
    [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) %
    AVATAR_COLORS.length;
  const face = (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-white shadow-sm ${
        AVATAR_SIZES[size].cls
      } ${superadmin ? "royal-face" : ""}`}
      style={{ backgroundColor: AVATAR_COLORS[idx] }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
      ) : (
        initialsOf(name)
      )}
    </span>
  );
  if (!superadmin) return face;
  return (
    <span className="royal" title="Superadministrador">
      <span className="royal-wave" aria-hidden />
      <span className="royal-wave" aria-hidden />
      {face}
      <RoyalFrame face={AVATAR_SIZES[size].px} />
      <span className="sr-only">Superadministrador</span>
    </span>
  );
}
