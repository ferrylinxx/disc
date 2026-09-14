/**
 * CALIDAD DE LA CUMPLIMENTACIÓN por velocidad de respuesta.
 *
 * Cada ítem exige leer un enunciado y cuatro afirmaciones y marcar Más y Menos.
 * Cuando la mayoría se responde en muy poco tiempo, las elecciones se reparten
 * casi al azar entre dimensiones: el perfil sale plano, el índice EQ se dispara
 * y el resultado no refleja un estilo conductual. Este módulo lo detecta a
 * partir del tiempo por ítem que ya se registra (`ItemResponse.timeMs`).
 *
 * Módulo puro y agnóstico al instrumento, como el motor de scoring.
 */

/** Umbrales de la comprobación de velocidad. */
export interface SpeedThresholds {
  /** Un ítem respondido por debajo de este tiempo (ms) cuenta como rápido. */
  fastItemMs: number;
  /** Proporción de ítems rápidos a partir de la cual se marca el resultado. */
  fastShareThreshold: number;
  /** Mínimo de ítems con tiempo registrado para emitir un veredicto. */
  minTimedItems: number;
}

/**
 * Valores por defecto, contrastados con los datos de producción (sep 2026): los
 * participantes reales no tienen ningún ítem por debajo de 3 s (media de 11 a
 * 113 s por ítem), y las pasadas de prueba tienen 31-34 de 35. Exigir la mitad
 * de ítems rápidos deja un margen amplio a ambos lados.
 */
export const DEFAULT_SPEED_THRESHOLDS: SpeedThresholds = {
  fastItemMs: 3000,
  fastShareThreshold: 0.5,
  minTimedItems: 10,
};

/** Veredicto: correcto, demasiado rápido o sin datos suficientes para decidir. */
export type SpeedStatus = "ok" | "tooFast" | "insufficientData";

export interface SpeedAssessment {
  status: SpeedStatus;
  /** Ítems con tiempo registrado. */
  timedItems: number;
  /** Ítems respondidos por debajo de `fastItemMs`. */
  fastItems: number;
}

/** Decide a partir de los recuentos (útil cuando se agregan en BD). */
export function classifySpeed(
  counts: { timedItems: number; fastItems: number },
  t: SpeedThresholds = DEFAULT_SPEED_THRESHOLDS,
): SpeedAssessment {
  const { timedItems, fastItems } = counts;
  if (timedItems < t.minTimedItems) {
    return { status: "insufficientData", timedItems, fastItems };
  }
  const tooFast = fastItems / timedItems >= t.fastShareThreshold;
  return { status: tooFast ? "tooFast" : "ok", timedItems, fastItems };
}

/** Evalúa una lista de tiempos por ítem (ms); ignora los ausentes o inválidos. */
export function assessResponseSpeed(
  timesMs: ReadonlyArray<number | null | undefined>,
  t: SpeedThresholds = DEFAULT_SPEED_THRESHOLDS,
): SpeedAssessment {
  let timedItems = 0;
  let fastItems = 0;
  for (const ms of timesMs) {
    if (typeof ms !== "number" || !Number.isFinite(ms) || ms < 0) continue;
    timedItems += 1;
    if (ms < t.fastItemMs) fastItems += 1;
  }
  return classifySpeed({ timedItems, fastItems }, t);
}
