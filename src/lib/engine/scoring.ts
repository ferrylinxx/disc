/**
 * MOTOR DE SCORING configurable (modelo ipsativo).
 *
 * Calcula puntuaciones por dimensión (global y por contexto), perfil
 * primario/secundario, código de combinación e índice EQ. Todo el
 * comportamiento se deriva de la `InstrumentDefinition` y su `ScoringConfig`:
 * el motor no conoce DISC, solo dimensiones genéricas.
 */
import type {
  DimensionScore,
  DimensionShare,
  InstrumentDefinition,
  Intensity,
  IntensityThresholds,
  ItemResponse,
  ScoringResult,
} from "./types";

/** Construye índices rápidos para acceso O(1) durante el cálculo. */
function buildIndex(def: InstrumentDefinition) {
  const itemByCode = new Map(def.items.map((i) => [i.code, i]));
  const optionDimension = new Map<string, string>();
  for (const item of def.items) {
    for (const opt of item.options) {
      optionDimension.set(`${item.code}:${opt.code}`, opt.dimensionCode);
    }
  }
  return { itemByCode, optionDimension };
}

/** Normaliza una puntuación cruda a porcentaje 0-100 (lectura ipsativa). */
function toPercent(
  raw: number,
  itemCount: number,
  mostValue: number,
  leastValue: number,
): number {
  const maxRaw = itemCount * mostValue;
  const minRaw = itemCount * leastValue;
  if (maxRaw === minRaw) return 50;
  return Math.round(((raw - minRaw) / (maxRaw - minRaw)) * 100);
}

/** Cuenta, por dimensión, en cuántos ítems del conjunto aparece como opción. */
function itemsPerDimension(
  items: InstrumentDefinition["items"],
  dimensionCodes: string[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const code of dimensionCodes) counts[code] = 0;
  for (const item of items) {
    const present = new Set(item.options.map((o) => o.dimensionCode));
    for (const code of present) if (code in counts) counts[code] += 1;
  }
  return counts;
}

/** Suma puntuaciones crudas por dimensión para un subconjunto de respuestas. */
function rawScores(
  items: InstrumentDefinition["items"],
  responses: ItemResponse[],
  optionDimension: Map<string, string>,
  config: InstrumentDefinition["scoring"],
  dimensionCodes: string[],
): Record<string, number> {
  const allowed = new Set(items.map((i) => i.code));
  const raw: Record<string, number> = {};
  for (const code of dimensionCodes) raw[code] = 0;
  for (const r of responses) {
    if (!allowed.has(r.itemCode)) continue;
    const mostDim = optionDimension.get(`${r.itemCode}:${r.mostOptionCode}`);
    const leastDim = optionDimension.get(`${r.itemCode}:${r.leastOptionCode}`);
    if (mostDim && mostDim in raw) raw[mostDim] += config.mostValue;
    if (leastDim && leastDim in raw) raw[leastDim] += config.leastValue;
  }
  return raw;
}

/** Convierte puntuaciones crudas en `DimensionScore[]` con porcentaje. */
function buildScores(
  raw: Record<string, number>,
  counts: Record<string, number>,
  config: InstrumentDefinition["scoring"],
  dimensionCodes: string[],
): DimensionScore[] {
  return dimensionCodes.map((code) => ({
    dimensionCode: code,
    raw: raw[code],
    percent: toPercent(raw[code], counts[code], config.mostValue, config.leastValue),
  }));
}

/** Índice EQ a partir de la dispersión de los porcentajes globales. */
function computeEq(scores: DimensionScore[], config: InstrumentDefinition["scoring"]): number {
  if (!config.eq.enabled || scores.length === 0) return 0;
  const percents = scores.map((s) => s.percent);
  const mean = percents.reduce((a, b) => a + b, 0) / percents.length;
  const variance = percents.reduce((a, p) => a + (p - mean) ** 2, 0) / percents.length;
  const std = Math.sqrt(variance);
  const evenness = 1 - Math.min(1, std / 50);
  return Math.round(config.eq.min + evenness * (config.eq.max - config.eq.min));
}

/**
 * Reparto proporcional (suma 100) sobre puntuaciones crudas. Aplica el
 * desplazamiento (raw − mín + 1) para evitar negativos y reparte sobre el
 * total. Corrige el redondeo asignando el residuo a la dimensión mayor para
 * que el conjunto sume exactamente 100.
 */
export function proportionalShares(scores: DimensionScore[]): DimensionShare[] {
  if (scores.length === 0) return [];
  const min = Math.min(...scores.map((s) => s.raw));
  const shifted = scores.map((s) => s.raw - min + 1);
  const total = shifted.reduce((a, b) => a + b, 0);
  const exact = shifted.map((v) => (v / total) * 100);
  const rounded = exact.map((v) => Math.round(v));
  const diff = 100 - rounded.reduce((a, b) => a + b, 0);
  if (diff !== 0) {
    let idx = 0;
    for (let i = 1; i < exact.length; i++) if (exact[i] > exact[idx]) idx = i;
    rounded[idx] += diff;
  }
  return scores.map((s, i) => ({ dimensionCode: s.dimensionCode, share: rounded[i] }));
}

/** Clasifica la intensidad a partir de la diferencia cruda primaria-secundaria. */
export function classifyIntensity(delta: number, t: IntensityThresholds): Intensity {
  if (delta >= t.muyDefinida) return "MUY_DEFINIDA";
  if (delta >= t.definida) return "DEFINIDA";
  if (delta >= t.moderada) return "MODERADA";
  return "FLEXIBLE";
}

/** Cálculo principal: produce el resultado completo del participante. */
export function score(
  def: InstrumentDefinition,
  responses: ItemResponse[],
): ScoringResult {
  const { optionDimension } = buildIndex(def);
  const dims = [...def.dimensions].sort((a, b) => a.order - b.order);
  const dimCodes = dims.map((d) => d.code);

  const globalCounts = itemsPerDimension(def.items, dimCodes);
  const globalRaw = rawScores(def.items, responses, optionDimension, def.scoring, dimCodes);
  const global = buildScores(globalRaw, globalCounts, def.scoring, dimCodes);

  const byContext: Record<string, DimensionScore[]> = {};
  for (const ctx of def.contexts) {
    const ctxItems = def.items.filter((i) => i.contextCode === ctx.code);
    const counts = itemsPerDimension(ctxItems, dimCodes);
    const raw = rawScores(ctxItems, responses, optionDimension, def.scoring, dimCodes);
    byContext[ctx.code] = buildScores(raw, counts, def.scoring, dimCodes);
  }

  const ranked = [...global].sort(
    (a, b) => b.raw - a.raw || dimCodes.indexOf(a.dimensionCode) - dimCodes.indexOf(b.dimensionCode),
  );
  const primary = ranked[0].dimensionCode;
  const secondary = ranked[1].dimensionCode;

  // Perfil EQ (adaptable) cuando el rango global (máx − mín) es muy estrecho:
  // no hay una combinación dominante clara.
  const range = ranked[0].raw - ranked[ranked.length - 1].raw;
  const isEq = range <= def.scoring.eqRangeThreshold;
  const profileCode = isEq ? "EQ" : `${primary}${secondary}`;
  const intensity = isEq
    ? null
    : classifyIntensity(ranked[0].raw - ranked[1].raw, def.scoring.intensity);

  const answered = responses.filter(
    (r) => r.mostOptionCode && r.leastOptionCode && r.mostOptionCode !== r.leastOptionCode,
  ).length;

  return {
    global,
    percentages: proportionalShares(global),
    byContext,
    primaryDimension: primary,
    secondaryDimension: secondary,
    profileCode,
    isEq,
    intensity,
    eq: computeEq(global, def.scoring),
    quality: {
      answeredItems: answered,
      totalItems: def.items.length,
      complete: answered === def.items.length,
    },
  };
}
