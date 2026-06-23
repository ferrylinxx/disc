import type { ReactNode } from "react";

/**
 * Kit de UI de la consola admin (server-safe, sin estado).
 * Estética: tarjetas blancas limpias sobre fondo neutro, tipografía compacta.
 */

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
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
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
      className={`animate-fade-up rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50 ${className}`}
    >
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
          <div>
            {title && (
              <h2 className="text-sm font-bold text-slate-900">{title}</h2>
            )}
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

/** KPI con icono, valor y pista contextual. */
export function StatCard({
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
    <div className="animate-scale-in rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </span>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}14`, color: accent }}
        >
          {icon}
        </span>
      </div>
      <div className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
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
  icon = "◌",
  title,
  hint,
}: {
  icon?: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 py-10 text-center">
      <span className="text-2xl text-slate-300">{icon}</span>
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
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
