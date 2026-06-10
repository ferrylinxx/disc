import type { InstrumentDefinition } from "@/lib/engine/types";
import { DISC_GESEM_V1 } from "./disc-gesem";

/**
 * Punto único de acceso al instrumento activo. Hoy devuelve la definición
 * sembrada en memoria; en producción cargará la versión publicada desde la BD
 * (tablas instrument/version/context/item/option), sin cambiar el resto del
 * código que consume `InstrumentDefinition`.
 */
export function getActiveInstrument(): InstrumentDefinition {
  return DISC_GESEM_V1;
}
