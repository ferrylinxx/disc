import type { DimensionScore, Dimension } from "@/lib/engine/types";
import { discGrad, discGradStrong } from "@/lib/disc-gradient";

interface Props {
  scores: DimensionScore[];
  /** Se mantiene por compatibilidad de la API (el color sale del degradado DISC). */
  dimensions?: Dimension[];
  compact?: boolean;
}

/**
 * Barras horizontales por dimensión que muestran la INTENSIDAD RELATIVA
 * (el ancho refleja la puntuación). Sin porcentajes (Especificación del
 * Informe Individual). Color: degradado oficial de cada dimensión DISC.
 */
export function ScoreBars({ scores, compact }: Props) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3.5"}>
      {scores.map((s, i) => (
        <div key={s.dimensionCode} className="flex items-center gap-3">
          <span
            className={`flex shrink-0 items-center justify-center rounded-lg font-bold text-white shadow-sm ${compact ? "h-6 w-6 text-[11px]" : "h-7 w-7 text-xs"}`}
            style={{ backgroundImage: discGrad(s.dimensionCode) }}
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
                backgroundImage: discGradStrong(s.dimensionCode, 90),
                animationDelay: `${i * 90}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
