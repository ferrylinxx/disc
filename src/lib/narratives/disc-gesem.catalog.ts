/**
 * CATÁLOGO OFICIAL de perfiles y leyendas DISC GESEM (PDF "Catálogo oficial").
 *
 * Nomenclatura única que debe usar toda la plataforma (informe, mapa de equipo,
 * dashboard, narrativas, PDF). En producción es editable desde administración y
 * vive en BD; aquí se mantiene como datos para funcionar sin base de datos.
 *
 * Redacción en clave de TENDENCIA/HIPÓTESIS, nunca diagnóstica (ver AGENTS.md).
 */
import type { Intensity } from "@/lib/engine/types";

/** Nombre corto oficial (verbo) y descripción breve por estilo base. */
export interface StyleInfo {
  /** Nombre corto oficial usado en leyendas y gráficas (verbo). */
  short: string;
  description: string;
}

/** Estilos base: D=Impulsar, I=Conectar, S=Sostener, C=Estructurar. */
export const STYLE_NAMES: Record<string, StyleInfo> = {
  D: { short: "Impulsar", description: "Orientación a la acción, la decisión y el avance." },
  I: { short: "Conectar", description: "Orientación a la relación, la influencia y la participación." },
  S: { short: "Sostener", description: "Orientación a la estabilidad, la cooperación y la continuidad." },
  C: { short: "Estructurar", description: "Orientación al análisis, la calidad y el método." },
};

/** Nombre corto del estilo (verbo) por código; cae al código si no existe. */
export function styleShort(code: string): string {
  return STYLE_NAMES[code]?.short ?? code;
}

/** Una entrada del catálogo: nombre oficial + resumen de la combinación/EQ. */
export interface ProfileEntry {
  name: string;
  summary: string;
}

/**
 * Combinaciones oficiales (12) + EQ ("Perfil adaptable"). La clave es el código
 * de perfil que produce el motor: primaria+secundaria (p. ej. "DI") o "EQ".
 */
export const PROFILE_CATALOG: Record<string, ProfileEntry> = {
  DI: { name: "Impulsar y movilizar", summary: "Tiende a generar movimiento, energía y orientación a objetivos." },
  ID: { name: "Conectar e impulsar", summary: "Tiende a movilizar personas a través de la relación y la influencia." },
  DC: { name: "Impulsar con rigor", summary: "Tiende a combinar decisión, exigencia y orientación a resultados." },
  CD: { name: "Analizar para avanzar", summary: "Tiende a comprender antes de actuar y busca decisiones fundamentadas." },
  IS: { name: "Conectar y cohesionar", summary: "Tiende a crear relaciones de confianza y colaboración." },
  SI: { name: "Sostener relaciones", summary: "Tiende a generar estabilidad, apoyo y continuidad." },
  SC: { name: "Generar estabilidad", summary: "Tiende a aportar orden, fiabilidad y seguimiento." },
  CS: { name: "Estructurar con sensibilidad", summary: "Tiende a combinar método, calidad y atención a las personas." },
  DS: { name: "Liderar desde el compromiso", summary: "Tiende a impulsar objetivos manteniendo cercanía y responsabilidad." },
  SD: { name: "Consolidar antes de actuar", summary: "Tiende a asegurar estabilidad antes de impulsar cambios." },
  IC: { name: "Comunicar y organizar", summary: "Tiende a combinar comunicación, creatividad y estructura." },
  CI: { name: "Organizar con criterio", summary: "Tiende a aportar análisis, orden y coherencia." },
  EQ: {
    name: "Perfil adaptable",
    summary:
      "No muestra una predominancia clara y presenta una elevada flexibilidad conductual.",
  },
};

/** Resuelve la entrada de catálogo para un código de perfil (con respaldo). */
export function resolveProfile(profileCode: string): ProfileEntry {
  return (
    PROFILE_CATALOG[profileCode] ?? {
      name: profileCode,
      summary: "Combinación de tendencias conductuales.",
    }
  );
}

/** Etiqueta legible de cada nivel de intensidad. */
export const INTENSITY_LABELS: Record<Intensity, string> = {
  FLEXIBLE: "Flexible",
  MODERADA: "Moderada",
  DEFINIDA: "Definida",
  MUY_DEFINIDA: "Muy definida",
};

/** Mensajes automáticos de resultado por intensidad (texto oficial del PDF). */
export const INTENSITY_MESSAGES: Record<Intensity, string> = {
  FLEXIBLE:
    "Tu resultado muestra capacidad para adaptarte a diferentes estilos según el contexto.",
  MODERADA:
    "Tu resultado muestra una tendencia clara sin limitar tu capacidad de adaptación.",
  DEFINIDA:
    "Tu resultado muestra una forma de actuación consistente y fácilmente reconocible.",
  MUY_DEFINIDA:
    "Tu resultado muestra una preferencia conductual muy marcada que puede aportar grandes " +
    "fortalezas y también requerir una gestión consciente de sus riesgos.",
};

/** Mensaje para el perfil EQ (adaptable), que no tiene nivel de intensidad. */
export const EQ_MESSAGE =
  "Tu resultado no muestra una predominancia clara: sueles adaptar tu estilo al contexto " +
  "y a las personas con las que trabajas.";

/** Etiqueta de intensidad o "Adaptable" cuando el perfil es EQ. */
export function intensityLabel(intensity: Intensity | null): string {
  return intensity ? INTENSITY_LABELS[intensity] : "Adaptable";
}

/** Mensaje automático de intensidad, o el mensaje EQ cuando no hay intensidad. */
export function intensityMessage(intensity: Intensity | null): string {
  return intensity ? INTENSITY_MESSAGES[intensity] : EQ_MESSAGE;
}

/** Mensaje del perfil principal: "Tu tendencia predominante es: {nombre}". */
export function primaryProfileMessage(profileCode: string): string {
  return `Tu tendencia predominante es: ${resolveProfile(profileCode).name}.`;
}
