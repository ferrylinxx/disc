/**
 * Definición sembrada del instrumento DISC GESEM v1.
 *
 * Este archivo NO contiene lógica de cálculo: solo datos. Representa lo que en
 * producción vive en las tablas configurables (instrument, version, context,
 * item, option, scoring_rule). Se mantiene aquí para poder ejecutar el flujo
 * sin base de datos y para sembrar la BD.
 */
import type {
  Dimension,
  EvaluationContext,
  InstrumentDefinition,
  Item,
  ScoringConfig,
} from "@/lib/engine/types";
import type { ContextRow, ItemRow } from "./disc-gesem.data";
import { DISC_CONTEXTS, DISC_ITEM_ROWS } from "./disc-gesem.data";
import {
  DISC_CONTEXTS_CA,
  DISC_ITEM_ROWS_CA,
  DISC_DIMENSION_NAMES_CA,
} from "./disc-gesem.data.ca";

// Colores base DISC (color sólido representativo de cada degradado GESEM).
export const DISC_DIMENSIONS: Dimension[] = [
  { code: "D", name: "Dominancia", color: "#D1133A", order: 1 },
  { code: "I", name: "Influencia", color: "#FFAE00", order: 2 },
  { code: "S", name: "Estabilidad", color: "#30C67C", order: 3 },
  { code: "C", name: "Cumplimiento", color: "#6F7BF7", order: 4 },
];

const SCORING: ScoringConfig = {
  method: "ipsative",
  mostValue: 1,
  leastValue: -1,
  unselectedValue: 0,
  // Rango global (máx − mín) ≤ 4 ⇒ perfil EQ (adaptable), según catálogo oficial.
  eqRangeThreshold: 4,
  // Umbrales de intensidad sobre la diferencia cruda primaria-secundaria.
  // Tabla oficial GESEM: Flexible 0-4 · Moderada 5-9 · Definida 10-14 · Muy definida 15+.
  intensity: { moderada: 5, definida: 10, muyDefinida: 15 },
  eq: { enabled: true, min: 0, max: 100 },
};

/** Orden fijo de las opciones de cada ítem: D, I, S, C. */
const OPTION_DIMENSIONS = ["D", "I", "S", "C"] as const;

const buildContexts = (rows: ContextRow[]): EvaluationContext[] =>
  rows.map((c, idx) => ({
    code: c.code,
    name: c.name,
    description: c.description,
    order: idx + 1,
  }));

const buildItems = (rows: ItemRow[]): Item[] =>
  rows.map((row, idx) => ({
    code: row.code,
    contextCode: row.context,
    order: idx + 1,
    prompt: row.prompt,
    options: OPTION_DIMENSIONS.map((dim, i) => ({
      code: dim.toLowerCase(),
      text: row.options[i],
      dimensionCode: dim,
    })),
  }));

export const DISC_GESEM_V1: InstrumentDefinition = {
  instrumentCode: "DISC_GESEM",
  instrumentName: "DISC GESEM",
  version: "1.0.0",
  status: "published",
  description:
    "Instrumento de autoconocimiento conductual GESEM. 7 contextos, 35 ítems, " +
    "respuesta forzada Más/Menos sobre las dimensiones D, I, S y C.",
  dimensions: DISC_DIMENSIONS,
  contexts: buildContexts(DISC_CONTEXTS),
  items: buildItems(DISC_ITEM_ROWS),
  scoring: SCORING,
};

/**
 * Versión catalana (mismos códigos y orden; solo cambian los textos). El cálculo
 * usa los códigos, así que es intercambiable con la versión española.
 */
export const DISC_GESEM_V1_CA: InstrumentDefinition = {
  ...DISC_GESEM_V1,
  dimensions: DISC_DIMENSIONS.map((d) => ({
    ...d,
    name: DISC_DIMENSION_NAMES_CA[d.code] ?? d.name,
  })),
  contexts: buildContexts(DISC_CONTEXTS_CA),
  items: buildItems(DISC_ITEM_ROWS_CA),
};
