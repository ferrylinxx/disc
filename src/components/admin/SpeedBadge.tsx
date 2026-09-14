import { DEFAULT_SPEED_THRESHOLDS, type SpeedAssessment } from "@/lib/engine/quality";
import { Pill } from "./ui";

/** Etiqueta del aviso, compartida con la exportación CSV. */
export const SPEED_WARNING_LABEL = "Respuestas muy rápidas";

/**
 * Aviso de calidad cuando la mayoría de ítems se respondió demasiado rápido para
 * haberlos leído. No juzga a la persona: advierte de que el resultado
 * probablemente no refleja su estilo y conviene revisarlo antes de usarlo.
 */
export function SpeedBadge({ speed }: { speed: SpeedAssessment | null }) {
  if (speed?.status !== "tooFast") return null;
  const secs = DEFAULT_SPEED_THRESHOLDS.fastItemMs / 1000;
  return (
    <span
      title={`${speed.fastItems} de ${speed.timedItems} ítems respondidos en menos de ${secs} s. Es probable que el resultado no refleje su estilo: revísalo antes de interpretarlo.`}
    >
      <Pill tone="amber">{SPEED_WARNING_LABEL}</Pill>
    </span>
  );
}
