import type { DimensionScore, Dimension } from "@/lib/engine/types";

interface Props {
  scores: DimensionScore[];
  dimensions: Dimension[];
  compact?: boolean;
}

/** Barras horizontales por dimensión (porcentaje ipsativo 0-100). */
export function ScoreBars({ scores, dimensions, compact }: Props) {
  const meta = new Map(dimensions.map((d) => [d.code, d]));
  return (
    <div className={compact ? "space-y-2" : "space-y-3.5"}>
      {scores.map((s, i) => {
        const d = meta.get(s.dimensionCode);
        const color = d?.color ?? "#64748b";
        return (
          <div key={s.dimensionCode} className="flex items-center gap-3">
            <span
              className={`flex shrink-0 items-center justify-center rounded-lg font-bold text-white shadow-sm ${compact ? "h-6 w-6 text-[11px]" : "h-7 w-7 text-xs"}`}
              style={{ backgroundColor: color }}
            >
              {s.dimensionCode}
            </span>
            <div
              className={`flex-1 overflow-hidden rounded-full bg-slate-100 ${compact ? "h-2.5" : "h-3.5"}`}
            >
              <div
                className="animate-fade-up h-full rounded-full"
                style={{
                  width: `${s.percent}%`,
                  backgroundImage: `linear-gradient(90deg, ${color}cc, ${color})`,
                  animationDelay: `${i * 90}ms`,
                }}
              />
            </div>
            <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-500">
              {s.percent}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
