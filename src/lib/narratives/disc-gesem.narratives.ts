/**
 * Narrativas base del instrumento DISC GESEM (representación configurable).
 * En producción provienen de las tablas `narratives` / `narrative_contents`
 * con versionado. Aquí se mantienen como datos para el informe sin BD.
 */

export interface DimensionNarrative {
  title: string;
  summary: string;
  strengths: string[];
  watchouts: string[];
  /** Acciones de desarrollo sugeridas para el plan individual. */
  development: string[];
}

/** Narrativa por dimensión, indexada por código (D, I, S, C). */
export const DIMENSION_NARRATIVES: Record<string, DimensionNarrative> = {
  D: {
    title: "Dominancia",
    summary:
      "Orientación al resultado, la acción y el control. Te mueves por retos, " +
      "decides rápido y no temes asumir riesgos para avanzar.",
    strengths: ["Decisión y empuje", "Orientación a objetivos", "Asunción de riesgos"],
    watchouts: ["Puede resultar impaciente", "Riesgo de pasar por alto matices", "Tono demasiado directo"],
    development: [
      "Reserva tiempo para escuchar antes de decidir en reuniones clave.",
      "Pide una segunda opinión en decisiones de alto impacto.",
      "Comparte el porqué de tus decisiones para alinear al equipo.",
    ],
  },
  I: {
    title: "Influencia",
    summary:
      "Orientación a las personas y a la comunicación. Generas entusiasmo, " +
      "conectas con los demás y movilizas equipos a través de la relación.",
    strengths: ["Comunicación y persuasión", "Energía y optimismo", "Construcción de relaciones"],
    watchouts: ["Puede dispersarse", "Exceso de optimismo", "Atención irregular al detalle"],
    development: [
      "Cierra cada conversación con compromisos y plazos concretos.",
      "Apóyate en checklists para no perder el detalle operativo.",
      "Contrasta tu optimismo con datos antes de comprometer fechas.",
    ],
  },
  S: {
    title: "Estabilidad",
    summary:
      "Orientación a la armonía, la constancia y el apoyo. Aportas calma, " +
      "fiabilidad y cohesión, y prefieres avanzar de forma sostenida.",
    strengths: ["Fiabilidad y constancia", "Escucha y apoyo", "Cohesión del equipo"],
    watchouts: ["Resistencia al cambio", "Evita el conflicto", "Le cuesta decir que no"],
    development: [
      "Expón tu desacuerdo de forma temprana en lugar de acumularlo.",
      "Prueba un cambio pequeño y controlado antes de descartarlo.",
      "Practica decir que no con alternativas constructivas.",
    ],
  },
  C: {
    title: "Cumplimiento",
    summary:
      "Orientación a la calidad, el rigor y los datos. Buscas precisión, " +
      "trabajas con método y te apoyas en criterios objetivos.",
    strengths: ["Rigor y precisión", "Análisis y método", "Alta exigencia de calidad"],
    watchouts: ["Puede caer en perfeccionismo", "Riesgo de parálisis por análisis", "Distante en lo emocional"],
    development: [
      "Define un nivel de 'suficientemente bueno' y respeta el plazo.",
      "Limita el tiempo de análisis fijando un punto de decisión.",
      "Dedica un momento a conectar con el equipo más allá de la tarea.",
    ],
  },
};

export interface EqBand {
  min: number;
  label: string;
  description: string;
}

/**
 * Bandas interpretativas del índice EQ. Describen cómo se REPARTEN los cuatro
 * recursos, no el perfil: con "Perfil equilibrado" un DC de intensidad
 * moderada parecía contradecir su propia tendencia (y se confundía con el
 * perfil EQ, que es otra cosa).
 */
export const EQ_BANDS: EqBand[] = [
  {
    min: 70,
    label: "Reparto amplio entre recursos",
    description:
      "Según tus respuestas, además de tus recursos principales sueles recurrir " +
      "también a los demás, lo que puede facilitar la adaptación a distintos " +
      "contextos y personas.",
  },
  {
    min: 40,
    label: "Reparto con acentos",
    description:
      "Según tus respuestas, algunos recursos destacan claramente sobre otros; " +
      "es probable que puedas ajustar tu forma de actuar cuando la situación lo pide.",
  },
  {
    min: 0,
    label: "Reparto concentrado",
    description:
      "Según tus respuestas, tiendes a apoyarte sobre todo en pocos recursos. " +
      "Puede aportar claridad y coherencia; ampliar el repertorio ayuda en " +
      "contextos menos habituales.",
  },
];

/** Bandas EQ en catalán (mismos umbrales). */
const EQ_BANDS_CA: EqBand[] = [
  {
    min: 70,
    label: "Repartiment ampli entre recursos",
    description:
      "Segons les teves respostes, a més dels teus recursos principals sols " +
      "recórrer també als altres, cosa que pot facilitar l'adaptació a diferents " +
      "contextos i persones.",
  },
  {
    min: 40,
    label: "Repartiment amb accents",
    description:
      "Segons les teves respostes, alguns recursos destaquen clarament sobre " +
      "altres; és probable que puguis ajustar la teva manera d'actuar quan la " +
      "situació ho demana.",
  },
  {
    min: 0,
    label: "Repartiment concentrat",
    description:
      "Segons les teves respostes, tendeixes a recolzar-te sobretot en pocs " +
      "recursos. Pot aportar claredat i coherència; ampliar el repertori ajuda " +
      "en contextos menys habituals.",
  },
];

/** Resuelve la banda EQ aplicable a un valor 0-100, en el idioma indicado. */
export function resolveEqBand(eq: number, lang: "ca" | "es" = "es"): EqBand {
  const bands = lang === "ca" ? EQ_BANDS_CA : EQ_BANDS;
  return bands.find((b) => eq >= b.min) ?? bands[bands.length - 1];
}
