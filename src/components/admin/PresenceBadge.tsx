"use client";

/** Ventana para considerar a alguien "en línea" (margen sobre el heartbeat). */
export const ONLINE_WINDOW_MS = 2 * 60 * 1000;

/** Texto relativo aproximado de la última actividad. */
export function formatLastSeen(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "hace instantes";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

/** Indicador de presencia (en línea / inactivo / sin actividad) basado en lastSeenAt. */
export function PresenceBadge({ lastSeenAt }: { lastSeenAt: Date | string | null }) {
  if (!lastSeenAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
        <span className="h-2 w-2 rounded-full bg-slate-300" />
        Sin actividad
      </span>
    );
  }
  const date = lastSeenAt instanceof Date ? lastSeenAt : new Date(lastSeenAt);
  const online = Date.now() - date.getTime() < ONLINE_WINDOW_MS;
  if (online) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        En línea
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
      <span className="h-2 w-2 rounded-full bg-slate-300" />
      Activo {formatLastSeen(date)}
    </span>
  );
}
