/**
 * BIBLIOTECA DE INSIGHTS AUTOMÁTICOS del informe individual (DISC GESEM V1-8).
 *
 * Los insights NO clasifican personas: generan reflexión, comprensión y
 * oportunidades de adaptación. Redacción en clave de tendencia ("Puede
 * facilitar…", "Merece la pena observar…", "Es posible que…"), nunca diagnóstica
 * (ver AGENTS.md). Separados del perfil para poder evolucionarlos sin tocar el
 * motor. En producción viven en BD con condición/prioridad/versión.
 */
import type { ScoringResult } from "@/lib/engine/types";

/** Insight individual por recurso alto (clave = código de dimensión). */
export const INDIVIDUAL_INSIGHTS: Record<string, string> = {
  D: "Tu tendencia a actuar y decidir puede ayudarte a generar movimiento y a evitar bloqueos innecesarios. Merece la pena observar cómo equilibras velocidad y participación cuando otras personas necesitan más tiempo.",
  I: "Tu capacidad para generar relación puede favorecer la participación, la confianza y el compromiso. Merece la pena observar cómo transformas las conversaciones en acuerdos concretos.",
  S: "Tu capacidad para generar estabilidad y confianza puede facilitar la colaboración y la continuidad. Merece la pena observar cuándo una situación requiere mayor rapidez o decisión.",
  C: "Tu tendencia a analizar y organizar puede mejorar la calidad y la consistencia de las decisiones. Merece la pena observar cuándo ya existe información suficiente para avanzar.",
};

/** Insights de intensidad (perfil definido vs. flexible). */
export const INTENSITY_INSIGHTS = {
  defined:
    "El resultado muestra una tendencia especialmente definida. Esto puede facilitar coherencia y consistencia; también puede reducir la flexibilidad si no existe una adaptación consciente al contexto.",
  flexible:
    "El resultado sugiere una utilización relativamente equilibrada de diferentes recursos. La flexibilidad puede resultar útil en contextos cambiantes; merece la pena observar cuándo conviene mostrar una posición más clara.",
} as const;

/** Insights contextuales de COMUNICACIÓN por recurso predominante. */
export const COMMUNICATION_INSIGHTS: Record<string, string> = {
  D: "En comunicación, tu tendencia puede ayudarte a transmitir claridad y dirección. Puede resultar útil comprobar que el mensaje ha sido comprendido y no únicamente escuchado.",
  I: "En comunicación, tu estilo puede favorecer participación y cercanía. Merece la pena observar cómo mantienes claridad y foco cuando existen múltiples perspectivas.",
  S: "En comunicación, tu estilo puede generar confianza y seguridad. Puede resultar útil revisar cuándo una situación requiere mayor nivel de concreción.",
  C: "En comunicación, tu estilo puede aportar rigor y comprensión. Merece la pena observar si el nivel de detalle facilita o dificulta la acción.",
};

/** Insights contextuales de DESACUERDOS por recurso predominante. */
export const CONFLICT_INSIGHTS: Record<string, string> = {
  D: "Ante desacuerdos, tiendes a orientarte rápidamente hacia la resolución. Puede resultar útil dedicar tiempo a comprender el origen antes de buscar soluciones.",
  I: "Ante desacuerdos, tiendes a proteger la relación. Merece la pena observar cuándo una conversación necesita más claridad que armonía.",
  S: "Ante desacuerdos, tiendes a buscar equilibrio y estabilidad. Puede resultar útil revisar cuándo es necesario posicionarse explícitamente.",
  C: "Ante desacuerdos, tiendes a analizar antes de concluir. Puede resultar útil equilibrar comprensión y velocidad de respuesta.",
};

/** Recurso predominante de un contexto (código de dimensión) o null. */
function leadOf(result: ScoringResult, code: string): string | null {
  const scores = result.byContext[code];
  if (!scores || scores.length === 0) return null;
  return [...scores].sort((a, b) => b.percent - a.percent)[0]?.dimensionCode ?? null;
}

/**
 * Genera hasta 3 insights personalizados priorizando relevancia (no cantidad):
 * 1) recurso predominante; 2) intensidad; 3) contexto (comunicación, luego
 * desacuerdos). Nunca repite mensajes.
 */
export function generateInsights(result: ScoringResult): string[] {
  const out: string[] = [];
  const push = (text: string | null | undefined) => {
    if (out.length < 3 && text && !out.includes(text)) out.push(text);
  };

  // 1) Recurso predominante (mayor reparto proporcional global).
  const topShare = [...result.percentages].sort((a, b) => b.share - a.share)[0];
  if (topShare) push(INDIVIDUAL_INSIGHTS[topShare.dimensionCode]);

  // 2) Intensidad del perfil.
  if (result.isEq || result.intensity === "FLEXIBLE") {
    push(INTENSITY_INSIGHTS.flexible);
  } else if (result.intensity === "MUY_DEFINIDA" || result.intensity === "DEFINIDA") {
    push(INTENSITY_INSIGHTS.defined);
  }

  // 3) Contextual: comunicación y, si hay hueco, desacuerdos.
  const commLead = leadOf(result, "COMUNICACION");
  if (commLead) push(COMMUNICATION_INSIGHTS[commLead]);
  const conflictLead = leadOf(result, "CONFLICTO");
  if (conflictLead) push(CONFLICT_INSIGHTS[conflictLead]);

  return out.slice(0, 3);
}
