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
import type { Lang } from "@/lib/i18n/dictionaries";

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

/** Traducción catalana de los insights (mismas claves que la versión española). */
const INSIGHTS_CA = {
  individual: {
    D: "La teva tendència a actuar i decidir pot ajudar-te a generar moviment i a evitar bloquejos innecessaris. Val la pena observar com equilibres velocitat i participació quan altres persones necessiten més temps.",
    I: "La teva capacitat per generar relació pot afavorir la participació, la confiança i el compromís. Val la pena observar com transformes les converses en acords concrets.",
    S: "La teva capacitat per generar estabilitat i confiança pot facilitar la col·laboració i la continuïtat. Val la pena observar quan una situació requereix més rapidesa o decisió.",
    C: "La teva tendència a analitzar i organitzar pot millorar la qualitat i la consistència de les decisions. Val la pena observar quan ja hi ha prou informació per avançar.",
  } as Record<string, string>,
  intensity: {
    defined:
      "El resultat mostra una tendència especialment definida. Això pot facilitar coherència i consistència; també pot reduir la flexibilitat si no hi ha una adaptació conscient al context.",
    flexible:
      "El resultat suggereix una utilització relativament equilibrada de diferents recursos. La flexibilitat pot ser útil en contextos canviants; val la pena observar quan convé mostrar una posició més clara.",
  },
  communication: {
    D: "En comunicació, la teva tendència pot ajudar-te a transmetre claredat i direcció. Pot ser útil comprovar que el missatge s'ha comprès i no només escoltat.",
    I: "En comunicació, el teu estil pot afavorir la participació i la proximitat. Val la pena observar com mantens la claredat i el focus quan hi ha múltiples perspectives.",
    S: "En comunicació, el teu estil pot generar confiança i seguretat. Pot ser útil revisar quan una situació requereix un nivell més alt de concreció.",
    C: "En comunicació, el teu estil pot aportar rigor i comprensió. Val la pena observar si el nivell de detall facilita o dificulta l'acció.",
  } as Record<string, string>,
  conflict: {
    D: "Davant dels desacords, tendeixes a orientar-te ràpidament cap a la resolució. Pot ser útil dedicar temps a comprendre'n l'origen abans de buscar solucions.",
    I: "Davant dels desacords, tendeixes a protegir la relació. Val la pena observar quan una conversa necessita més claredat que harmonia.",
    S: "Davant dels desacords, tendeixes a buscar equilibri i estabilitat. Pot ser útil revisar quan cal posicionar-se explícitament.",
    C: "Davant dels desacords, tendeixes a analitzar abans de concloure. Pot ser útil equilibrar comprensió i velocitat de resposta.",
  } as Record<string, string>,
};

const INSIGHTS_ES = {
  individual: INDIVIDUAL_INSIGHTS,
  intensity: INTENSITY_INSIGHTS,
  communication: COMMUNICATION_INSIGHTS,
  conflict: CONFLICT_INSIGHTS,
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
export function generateInsights(result: ScoringResult, lang: Lang = "es"): string[] {
  const i = lang === "ca" ? INSIGHTS_CA : INSIGHTS_ES;
  const out: string[] = [];
  const push = (text: string | null | undefined) => {
    if (out.length < 3 && text && !out.includes(text)) out.push(text);
  };

  // 1) Recurso predominante (mayor reparto proporcional global).
  const topShare = [...result.percentages].sort((a, b) => b.share - a.share)[0];
  if (topShare) push(i.individual[topShare.dimensionCode]);

  // 2) Intensidad del perfil.
  if (result.isEq || result.intensity === "FLEXIBLE") {
    push(i.intensity.flexible);
  } else if (result.intensity === "MUY_DEFINIDA" || result.intensity === "DEFINIDA") {
    push(i.intensity.defined);
  }

  // 3) Contextual: comunicación y, si hay hueco, desacuerdos.
  const commLead = leadOf(result, "COMUNICACION");
  if (commLead) push(i.communication[commLead]);
  const conflictLead = leadOf(result, "CONFLICTO");
  if (conflictLead) push(i.conflict[conflictLead]);

  return out.slice(0, 3);
}
