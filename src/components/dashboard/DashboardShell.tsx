import type { ReactNode } from "react";

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** Marco visual común a todos los paneles (cabecera + contenedor). */
export default function DashboardShell({
  title,
  subtitle,
  badge,
  actions,
  children,
}: DashboardShellProps) {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="animate-fade-up mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          {badge && (
            <span className="bg-brand mb-2 inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              {badge}
            </span>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="space-y-6">{children}</div>
    </main>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  accent?: string;
}

/** Tarjeta de métrica para la fila de KPIs. */
export function StatCard({ label, value, accent = "#6366f1" }: StatCardProps) {
  return (
    <div className="glass animate-scale-in rounded-2xl border border-white/60 p-5">
      <div
        className="mb-2 h-1 w-10 rounded-full"
        style={{ backgroundColor: accent }}
      />
      <div className="text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
    </div>
  );
}
