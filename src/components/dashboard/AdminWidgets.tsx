import type { ReactNode } from "react";

/** Widgets presentacionales del panel admin (server-safe, sin estado). */

/** Tarjeta de KPI con icono, valor destacado y pista contextual opcional. */
export function StatTile({
  label,
  value,
  hint,
  accent = "#6366f1",
  icon,
}: {
  label: string;
  value: number | string;
  hint?: string;
  accent?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="glass animate-scale-in rounded-2xl border border-white/60 p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-100">
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
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
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
  "#6366f1",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Avatar circular con iniciales y color estable derivado del nombre. */
export function Avatar({ name }: { name: string }) {
  const idx =
    [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) %
    AVATAR_COLORS.length;
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
      style={{ backgroundColor: AVATAR_COLORS[idx] }}
    >
      {initialsOf(name)}
    </span>
  );
}
