/**
 * Medidas de extensión de la Biblioteca Narrativa, para que el editor muestre
 * qué perfiles tienen ya su texto V1 completo y cuáles siguen con la plantilla
 * corta. Canon V1: 8 apartados y 700-800 palabras por perfil.
 */

/** Apartados que el informe individual muestra (el 9.º, "reflexion", no se usa). */
export const REPORT_BLOCK_IDS = [
  "tendencia",
  "recursos",
  "aportacion",
  "valoracion",
  "observar",
  "coordinacion",
  "contextos",
  "ampliacion",
] as const;

/** Extensión objetivo de un perfil completo (Manual Editorial V1). */
export const PROFILE_WORD_TARGET = { min: 700, max: 800 } as const;

/** Número de palabras de un texto. */
export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** Rango de palabras de una pista como "180-250 palabras"; null si no es un rango. */
export function parseWordRange(hint: string): { min: number; max: number } | null {
  const m = hint.match(/(\d+)\s*-\s*(\d+)\s*palabras/);
  return m ? { min: Number(m[1]), max: Number(m[2]) } : null;
}

/** Tono de una cifra respecto a su rango: corta, dentro o por encima. */
export function lengthTone(words: number, range: { min: number; max: number }): "short" | "ok" | "long" {
  if (words < range.min) return "short";
  if (words > range.max) return "long";
  return "ok";
}
