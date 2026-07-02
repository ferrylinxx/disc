import type { ReactNode } from "react";

/** Tarjeta base del panel del participante (server-safe). */
export function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="animate-fade-up rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/40">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
        {title}
      </h2>
      {hint && <p className="mb-3 mt-0.5 text-xs text-slate-400">{hint}</p>}
      <div className={hint ? "" : "mt-4"}>{children}</div>
    </section>
  );
}

/** Métrica compacta con etiqueta, valor coloreado y subtítulo opcional. */
export function Tile({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: string;
  color: string;
  sub?: string;
}) {
  return (
    <div className="animate-scale-in rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-lg font-bold leading-tight" style={{ color }}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

/** Bloque de texto con etiqueta (aportación / valorado). */
export function Blurb({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <p className="text-sm leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}

/** Filas de datos clave/valor (p. ej. tarjeta de cuenta). */
export function DataRows({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="space-y-3 text-sm">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-3">
          <dt className="text-slate-400">{r.label}</dt>
          <dd className="truncate text-right font-semibold text-slate-800">
            {r.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
