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

/** Nombres cortos de recurso en catalán (por código de dimensión). */
export const STYLE_SHORT_CA: Record<string, string> = {
  D: "Impulsar",
  I: "Connectar",
  S: "Sostenir",
  C: "Estructurar",
};

/** Nombre corto del estilo (verbo) por código, en el idioma indicado. */
export function styleShort(code: string, lang: "ca" | "es" = "es"): string {
  if (lang === "ca") return STYLE_SHORT_CA[code] ?? STYLE_NAMES[code]?.short ?? code;
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

/** Catálogo de perfiles en catalán (nombre + resumen). */
export const PROFILE_CATALOG_CA: Record<string, ProfileEntry> = {
  DI: { name: "Impulsar i mobilitzar", summary: "Tendeix a generar moviment, energia i orientació a objectius." },
  ID: { name: "Connectar i impulsar", summary: "Tendeix a mobilitzar persones a través de la relació i la influència." },
  DC: { name: "Impulsar amb rigor", summary: "Tendeix a combinar decisió, exigència i orientació a resultats." },
  CD: { name: "Analitzar per avançar", summary: "Tendeix a comprendre abans d'actuar i busca decisions fonamentades." },
  IS: { name: "Connectar i cohesionar", summary: "Tendeix a crear relacions de confiança i col·laboració." },
  SI: { name: "Sostenir relacions", summary: "Tendeix a generar estabilitat, suport i continuïtat." },
  SC: { name: "Generar estabilitat", summary: "Tendeix a aportar ordre, fiabilitat i seguiment." },
  CS: { name: "Estructurar amb sensibilitat", summary: "Tendeix a combinar mètode, qualitat i atenció a les persones." },
  DS: { name: "Liderar des del compromís", summary: "Tendeix a impulsar objectius mantenint proximitat i responsabilitat." },
  SD: { name: "Consolidar abans d'actuar", summary: "Tendeix a assegurar estabilitat abans d'impulsar canvis." },
  IC: { name: "Comunicar i organitzar", summary: "Tendeix a combinar comunicació, creativitat i estructura." },
  CI: { name: "Organitzar amb criteri", summary: "Tendeix a aportar anàlisi, ordre i coherència." },
  EQ: {
    name: "Perfil adaptable",
    summary:
      "No mostra una predominança clara i presenta una elevada flexibilitat conductual.",
  },
};

/** Resuelve la entrada de catálogo para un código de perfil (con respaldo), por idioma. */
export function resolveProfile(
  profileCode: string,
  lang: "ca" | "es" = "es",
): ProfileEntry {
  const catalog = lang === "ca" ? PROFILE_CATALOG_CA : PROFILE_CATALOG;
  return (
    catalog[profileCode] ??
    PROFILE_CATALOG[profileCode] ?? {
      name: profileCode,
      summary:
        lang === "ca"
          ? "Combinació de tendències conductuals."
          : "Combinación de tendencias conductuales.",
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

/** Etiqueta de intensidad en catalán. */
export const INTENSITY_LABELS_CA: Record<Intensity, string> = {
  FLEXIBLE: "Flexible",
  MODERADA: "Moderada",
  DEFINIDA: "Definida",
  MUY_DEFINIDA: "Molt definida",
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

/** Etiqueta de intensidad o "Adaptable" cuando el perfil es EQ, por idioma. */
export function intensityLabel(intensity: Intensity | null, lang: "ca" | "es" = "es"): string {
  const labels = lang === "ca" ? INTENSITY_LABELS_CA : INTENSITY_LABELS;
  return intensity ? labels[intensity] : "Adaptable";
}

/** Mensaje automático de intensidad, o el mensaje EQ cuando no hay intensidad. */
export function intensityMessage(intensity: Intensity | null): string {
  return intensity ? INTENSITY_MESSAGES[intensity] : EQ_MESSAGE;
}

/** Mensaje del perfil principal: "Tu tendencia predominante es: {nombre}". */
export function primaryProfileMessage(profileCode: string): string {
  return `Tu tendencia predominante es: ${resolveProfile(profileCode).name}.`;
}
