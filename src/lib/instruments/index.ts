import type { InstrumentDefinition } from "@/lib/engine/types";
import type { Lang } from "@/lib/i18n/dictionaries";
import { DISC_GESEM_V1, DISC_GESEM_V1_CA } from "./disc-gesem";

/**
 * Punto único de acceso al instrumento activo. Devuelve la definición sembrada
 * en el idioma indicado (catalán o, por defecto, español). Los códigos de ítems
 * y opciones son idénticos entre idiomas, así que el cálculo no cambia.
 */
export function getActiveInstrument(lang?: Lang): InstrumentDefinition {
  return lang === "ca" ? DISC_GESEM_V1_CA : DISC_GESEM_V1;
}
