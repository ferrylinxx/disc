/**
 * Estructura per-perfil × bloque de la Biblioteca Narrativa (Entregable 10/11).
 *
 * 13 perfiles × 9 bloques = 117 textos independientes. Cada bloque se almacena
 * como una entrada NarrativeEntry con scope "BLOCK" y key `${perfil}:${bloque}`.
 * El motor leerá el perfil → sus 9 bloques. Mientras GESEM no entregue la
 * Biblioteca Narrativa definitiva, estas entradas se siembran con el contenido
 * interino compuesto por recurso, y se podrán sobrescribir desde el editor o
 * importando el Excel (scripts/import-blocks.ts).
 */
import type { ProfileNarrative } from "./disc-gesem.profiles";

/**
 * Los 9 bloques narrativos oficiales, en orden. Las extensiones son las del
 * Estándar editorial canónico V1.1 (17/09/2026): suman 700-790 palabras, dentro
 * del objetivo de 700-800 por perfil (las preguntas quedan fuera del recuento).
 */
export const BLOCKS = [
  { id: "tendencia", label: "Tendencia predominante", length: "140-155 palabras" },
  { id: "recursos", label: "Recursos predominantes", length: "85-95 palabras" },
  { id: "aportacion", label: "Aportación habitual", length: "75-85 palabras" },
  { id: "valoracion", label: "Lo que otros suelen valorar", length: "60-70 palabras" },
  { id: "observar", label: "Aspectos que merece la pena observar", length: "80-90 palabras" },
  { id: "coordinacion", label: "Coordinación y colaboración", length: "105-120 palabras" },
  { id: "contextos", label: "Contextos de mejor desempeño", length: "65-75 palabras" },
  { id: "ampliacion", label: "Ampliación de repertorio", length: "90-100 palabras" },
  { id: "reflexion", label: "Preguntas para la reflexión", length: "5 preguntas" },
] as const;

export type BlockId = (typeof BLOCKS)[number]["id"];

/** Los 13 códigos de perfil oficiales. */
export const PROFILE_CODES = [
  "DI", "ID", "DC", "CD", "IS", "SI", "SC", "CS", "DS", "SD", "IC", "CI", "EQ",
] as const;

/** Resuelve un id de bloque desde su id o su etiqueta (para importaciones). */
export function resolveBlockId(value: string): BlockId | null {
  const v = value.trim().toLowerCase();
  const byId = BLOCKS.find((b) => b.id === v);
  if (byId) return byId.id;
  const byLabel = BLOCKS.find((b) => b.label.toLowerCase() === v);
  return byLabel ? byLabel.id : null;
}

/**
 * Deriva el texto de cada bloque a partir de la narrativa compuesta. Sirve para
 * sembrar las 117 entradas con contenido interino coherente por perfil.
 *
 * Coordinación no lleva los microbloques "Lo que probablemente aportas /
 * necesitas": el Estándar editorial V1.1 los eliminó (repetían otros apartados
 * y en DC y CD se contradecían).
 */
export function blockTextsFromNarrative(n: ProfileNarrative): Record<BlockId, string> {
  return {
    tendencia: n.intro,
    recursos: n.resources.map((r) => `${r.name}: ${r.description}`).join("\n"),
    aportacion: n.contribution,
    valoracion: n.valuedItems.join("\n"),
    observar: n.observe.join("\n"),
    coordinacion: [
      n.coordination.coordinating,
      n.coordination.collaborating,
      n.team.differences,
    ]
      .filter(Boolean)
      .join("\n\n"),
    contextos: n.contexts,
    ampliacion: n.repertoire,
    reflexion: n.reflection.join("\n"),
  };
}
