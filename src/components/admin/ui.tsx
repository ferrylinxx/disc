import type { ReactNode } from "react";

/**
 * Sistema de diseño de la Consola GESEM (server-safe, sin estado).
 * Superficies limpias, esquinas suaves, azul GESEM como acento y tipografía
 * compacta. Estos componentes son la única fuente de estilo del admin.
 */

/** Clases de botón reutilizables (una sola fuente de verdad). */
export const btn = {
  primary:
    "inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60",
  secondary:
    "inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-60",
  danger:
    "inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-60",
  ghost:
    "inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-60",
};

/** Clase de campo de formulario reutilizable. */
export const fieldCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

/** Cabecera de página: título, descripción y acciones a la derecha. */
export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="animate-fade-up mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      )}
    </div>
  );
}

/** Tarjeta base de la consola. */
export function Card({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`animate-fade-up rounded-2xl border border-slate-200/70 bg-white shadow-sm shadow-slate-200/40 ${className}`}
    >
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
          <div>
            {title && <h2 className="text-sm font-bold text-slate-900">{title}</h2>}
            {description && (
              <p className="mt-0.5 text-xs text-slate-500">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}

/** KPI con icono, valor y pista/tendencia contextual. */
export function StatCard({
  label,
  value,
  hint,
  accent = "#00a1e0",
  icon,
  trend,
}: {
  label: string;
  value: number | string;
  hint?: string;
  accent?: string;
  icon?: ReactNode;
  trend?: { dir: "up" | "down" | "flat"; text: string };
}) {
  const trendCls =
    trend?.dir === "up"
      ? "text-emerald-600"
      : trend?.dir === "down"
        ? "text-rose-600"
        : "text-slate-400";
  return (
    <div className="animate-scale-in rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/40 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </span>
        {icon && (
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${accent}14`, color: accent }}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {trend && (
          <span className={`font-semibold ${trendCls}`}>
            {trend.dir === "up" ? "↑" : trend.dir === "down" ? "↓" : "→"}{" "}
            {trend.text}
          </span>
        )}
        {hint && <span className="text-slate-400">{hint}</span>}
      </div>
    </div>
  );
}

const PARTICIPANT_STATUS: Record<string, { label: string; cls: string }> = {
  INVITED: { label: "Invitado", cls: "bg-slate-100 text-slate-600" },
  IN_PROGRESS: { label: "En curso", cls: "bg-amber-100 text-amber-700" },
  COMPLETED: { label: "Completado", cls: "bg-emerald-100 text-emerald-700" },
};

/** Pastilla de estado de participante. */
export function StatusBadge({ status }: { status: string }) {
  const s = PARTICIPANT_STATUS[status] ?? PARTICIPANT_STATUS.INVITED;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

/** Pastilla genérica con tono semántico. */
export function Pill({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "sky" | "emerald" | "amber" | "rose";
}) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-600",
    sky: "bg-sky-50 text-sky-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** Chip de perfil DISC (p. ej. DI, EQ). */
export function ProfileChip({ code }: { code: string }) {
  return (
    <span className="inline-flex rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-bold tracking-wide text-white">
      {code}
    </span>
  );
}

/** Estado vacío de una tabla o sección. */
export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-xl text-slate-300">
        {icon ?? "◌"}
      </span>
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      {hint && <p className="max-w-sm text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

/** Barra de progreso fina con color configurable. */
export function Progress({
  value,
  color = "#10b981",
}: {
  value: number;
  color?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full transition-[width]"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

/** Estilos compartidos de tabla de la consola. */
export const tableCls = {
  table: "w-full text-left text-sm",
  thead:
    "border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-400",
  th: "px-3 py-2.5 font-semibold",
  tr: "border-b border-slate-50 transition hover:bg-slate-50/70",
  td: "px-3 py-3 align-middle",
};
