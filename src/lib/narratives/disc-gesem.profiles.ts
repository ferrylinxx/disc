/**
 * Narrativas de perfil para el INFORME INDIVIDUAL "Mapa de Interacción
 * Profesional" (Especificación Funcional del Informe Individual + Wireframe).
 *
 * La narrativa se compone por RECURSO predominante (Impulsar/Conectar/Sostener/
 * Estructurar), alineado con el motor de narrativas (DISC calcula, GESEM
 * interpreta). Toda la redacción está en clave de TENDENCIA/HIPÓTESIS, nunca
 * diagnóstica (ver AGENTS.md). En producción vive en BD versionada.
 */
import type { ScoringResult } from "@/lib/engine/types";
import { resolveProfile, styleShort } from "./disc-gesem.catalog";

/** Fragmentos narrativos asociados a un recurso (dimensión D/I/S/C). */
export interface ResourceNarrative {
  /** Cuando das indicaciones. */
  instructions: string;
  /** Cuando haces seguimiento. */
  followup: string;
  /** Cuando coordinas personas diferentes. */
  coordinating: string;
  /** Cuando aparece un desacuerdo. */
  conflict: string;
  /** Cuando necesitas generar compromiso. */
  engagement: string;
  /** Qué puede estar funcionando bien (3 aportaciones). */
  strengths: [string, string, string];
  /** Qué merece la pena observar (3 elementos). */
  observe: [string, string, string];
  /** Qué podría complementar tu forma habitual de actuar. */
  complement: string;
  /** Experimento de transferencia (1 acción, 1 semana). */
  experiment: string;
  /** Pregunta poderosa. */
  question: string;
}

/** Narrativa por recurso, indexada por código de dimensión (D, I, S, C). */
export const RESOURCE_NARRATIVES: Record<string, ResourceNarrative> = {
  D: {
    instructions:
      "Cuando das indicaciones, sueles ser directo/a y orientarte rápidamente a la acción; es probable que priorices el qué y el para qué.",
    followup:
      "En el seguimiento tiendes a fijarte en avances y resultados. Puede resultar útil reconocer también el esfuerzo y el proceso.",
    coordinating:
      "Al coordinar personas diferentes, sueles marcar el ritmo y empujar hacia el objetivo. Merece la pena observar cuándo conviene ajustar la velocidad a cada persona.",
    conflict:
      "Ante un desacuerdo, tiendes a afrontarlo de forma directa y a buscar una resolución rápida. Puede resultar útil dedicar un momento a comprender su origen.",
    engagement:
      "Para generar compromiso, sueles apoyarte en la claridad de objetivos y en la energía. Merece la pena observar cómo incorporas a quienes necesitan más tiempo.",
    strengths: [
      "Generar dirección y movimiento.",
      "Tomar decisiones y desbloquear situaciones.",
      "Movilizar al equipo hacia objetivos.",
    ],
    observe: [
      "Cómo equilibras velocidad y participación.",
      "Cuándo conviene escuchar antes de decidir.",
      "El impacto que puede tener un tono muy directo.",
    ],
    complement:
      "Incorporar pausas para integrar perspectivas diferentes podría enriquecer tus decisiones.",
    experiment:
      "Antes de cerrar una decisión importante, pide la perspectiva de dos personas diferentes.",
    question:
      "¿En qué situaciones avanzar más despacio podría ayudarte a llegar más lejos con tu equipo?",
  },
  I: {
    instructions:
      "Cuando das indicaciones, sueles hacerlo desde la cercanía y la conversación, cuidando el tono y la relación.",
    followup:
      "En el seguimiento tiendes a apoyarte en el diálogo y el ánimo. Puede resultar útil acompañarlo de acuerdos y plazos concretos.",
    coordinating:
      "Al coordinar personas diferentes, sueles favorecer la participación y el clima. Merece la pena observar cómo mantienes el foco cuando hay muchas perspectivas.",
    conflict:
      "Ante un desacuerdo, tiendes a proteger la relación y a buscar consenso. Puede resultar útil aportar claridad cuando la armonía no basta.",
    engagement:
      "Para generar compromiso, sueles implicar a través de la relación. Merece la pena observar cómo transformas el entusiasmo en acciones sostenidas.",
    strengths: [
      "Generar relación y confianza.",
      "Movilizar a través de la comunicación.",
      "Favorecer la participación.",
    ],
    observe: [
      "Cómo conviertes conversaciones en acuerdos.",
      "Cuándo priorizar el foco sobre la amplitud.",
      "Cómo mantienes claridad con muchas perspectivas.",
    ],
    complement:
      "Apoyarte en estructura y seguimiento podría dar continuidad a lo que pones en marcha.",
    experiment:
      "Cierra tus próximas conversaciones clave con un acuerdo concreto y una persona responsable.",
    question:
      "¿Qué conversación pendiente ganaría más con claridad que con armonía?",
  },
  S: {
    instructions:
      "Cuando das indicaciones, sueles hacerlo con calma y cuidando que la persona se sienta acompañada.",
    followup:
      "En el seguimiento tiendes a ser constante y fiable. Puede resultar útil expresar también expectativas explícitas.",
    coordinating:
      "Al coordinar personas diferentes, sueles aportar estabilidad y cohesión. Merece la pena observar cuándo una situación requiere más ritmo o decisión.",
    conflict:
      "Ante un desacuerdo, tiendes a buscar equilibrio y a evitar la tensión. Puede resultar útil posicionarte explícitamente cuando es necesario.",
    engagement:
      "Para generar compromiso, sueles apoyarte en la confianza y la continuidad. Merece la pena observar cuándo conviene introducir un cambio de ritmo.",
    strengths: [
      "Generar estabilidad y confianza.",
      "Sostener acuerdos y continuidad.",
      "Cuidar la cohesión del equipo.",
    ],
    observe: [
      "Cuándo la búsqueda de armonía aplaza conversaciones.",
      "Cuándo conviene posicionarte de forma explícita.",
      "Cómo afrontas los cambios de ritmo.",
    ],
    complement:
      "Expresar antes tu posición podría agilizar decisiones que hoy tiendes a aplazar.",
    experiment:
      "Esta semana, expón tu opinión en una situación en la que normalmente esperarías.",
    question:
      "¿Qué conversación necesaria estás aplazando para mantener la armonía?",
  },
  C: {
    instructions:
      "Cuando das indicaciones, sueles aportar detalle, criterio y orden.",
    followup:
      "En el seguimiento tiendes a fijarte en la calidad y el cumplimiento. Puede resultar útil reconocer también el avance imperfecto.",
    coordinating:
      "Al coordinar personas diferentes, sueles aportar método y rigor. Merece la pena observar cuándo el nivel de detalle facilita o frena la acción.",
    conflict:
      "Ante un desacuerdo, tiendes a analizar antes de concluir. Puede resultar útil equilibrar comprensión y velocidad de respuesta.",
    engagement:
      "Para generar compromiso, sueles apoyarte en la coherencia y en criterios claros. Merece la pena observar cuándo simplificar el mensaje ayuda a avanzar.",
    strengths: [
      "Aportar análisis y rigor.",
      "Mejorar la calidad de las decisiones.",
      "Ordenar y dar criterio.",
    ],
    observe: [
      "Cuándo ya existe información suficiente para avanzar.",
      "Cómo simplificar los mensajes para la acción.",
      "El equilibrio entre rigor y ritmo.",
    ],
    complement:
      "Definir un punto de decisión podría ayudarte a avanzar cuando el análisis ya es suficiente.",
    experiment:
      "Fija de antemano el momento en que cerrarás el análisis y tomarás la decisión.",
    question:
      "¿En qué decisión reciente ya tenías información suficiente para avanzar antes?",
  },
};

/** Narrativa de perfil compuesta para el informe (8 bloques). */
export interface ProfileNarrative {
  /** Nombre oficial de la combinación (Bloque 1). */
  title: string;
  /** Texto introductorio breve (Bloque 1). */
  intro: string;
  /** Subapartados de "Cuando coordinas personas" (Bloque 4). */
  coordination: {
    instructions: string;
    followup: string;
    coordinating: string;
    conflict: string;
    engagement: string;
  };
  /** Qué puede estar funcionando bien (Bloque 5). */
  strengths: string[];
  /** Qué merece la pena observar (Bloque 6). */
  observe: string[];
  /** Qué podría complementar tu forma habitual de actuar. */
  complement: string;
  /** Experimento de transferencia (Bloque 7). */
  experiment: string;
  /** Pregunta poderosa (Bloque 8). */
  question: string;
}

/** Toma elementos distintos de dos listas hasta completar `n`. */
function pickDistinct(primary: string[], secondary: string[], n: number): string[] {
  const out: string[] = [];
  for (const v of [...primary, ...secondary]) {
    if (out.length >= n) break;
    if (!out.includes(v)) out.push(v);
  }
  return out;
}

/**
 * Compone la narrativa del perfil desde el recurso predominante (y el
 * secundario para enriquecer fortalezas/observaciones). El recurso primario
 * gobierna "Cuando coordinas personas", el experimento y la pregunta.
 */
export function buildProfileNarrative(result: ScoringResult): ProfileNarrative {
  const profile = resolveProfile(result.profileCode);
  const primary = RESOURCE_NARRATIVES[result.primaryDimension] ?? RESOURCE_NARRATIVES.D;
  const secondary = result.isEq
    ? null
    : RESOURCE_NARRATIVES[result.secondaryDimension] ?? null;

  const combo = result.isEq
    ? `Según tus respuestas, sueles repartir tu energía entre varios recursos y adaptar tu estilo al contexto y a las personas.`
    : `Según tus respuestas, sueles combinar recursos orientados a ${styleShort(result.primaryDimension)} y a ${styleShort(result.secondaryDimension)}.`;

  return {
    title: profile.name,
    intro: `${profile.summary} ${combo}`,
    coordination: {
      instructions: primary.instructions,
      followup: primary.followup,
      coordinating: primary.coordinating,
      conflict: primary.conflict,
      engagement: primary.engagement,
    },
    strengths: secondary
      ? pickDistinct(primary.strengths.slice(0, 2), secondary.strengths, 3)
      : primary.strengths.slice(0, 3),
    observe: secondary
      ? pickDistinct(primary.observe.slice(0, 2), secondary.observe, 3)
      : primary.observe.slice(0, 3),
    complement: primary.complement,
    experiment: primary.experiment,
    question: primary.question,
  };
}

/** Un contexto del informe (Bloque 3) con su recurso predominante. */
export interface ContextLeader {
  /** Etiqueta visible del contexto (Decisiones, Comunicación, …). */
  label: string;
  /** Código de dimensión predominante en ese contexto (D/I/S/C). */
  dimensionCode: string;
  /** Recurso predominante (nombre oficial: Impulsar, Conectar, …). */
  resource: string;
}

/**
 * Mapa de los 5 contextos del informe individual a los códigos del instrumento.
 * Si un código no existe en el instrumento activo, ese contexto se omite.
 */
export const REPORT_CONTEXTS: { label: string; code: string }[] = [
  { label: "Decisiones", code: "DECISION" },
  { label: "Comunicación", code: "COMUNICACION" },
  { label: "Coordinación", code: "COLABORACION" },
  { label: "Desacuerdos", code: "CONFLICTO" },
  { label: "Cambio", code: "CAMBIO" },
];

/** Deriva el recurso predominante (Bloque 3) para cada uno de los 5 contextos. */
export function contextLeaders(result: ScoringResult): ContextLeader[] {
  const leaders: ContextLeader[] = [];
  for (const { label, code } of REPORT_CONTEXTS) {
    const scores = result.byContext[code];
    if (!scores || scores.length === 0) continue;
    const top = [...scores].sort((a, b) => b.percent - a.percent)[0];
    leaders.push({
      label,
      dimensionCode: top.dimensionCode,
      resource: styleShort(top.dimensionCode),
    });
  }
  return leaders;
}
