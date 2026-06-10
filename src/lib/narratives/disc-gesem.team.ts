/**
 * Narrativas a nivel de EQUIPO (mapa de equipo avanzado). Textos en clave de
 * tendencia/hipótesis, nunca diagnóstico (ver AGENTS.md). En producción son
 * editables desde administración; aquí se mantienen como datos.
 */

/** Aportaciones, riesgos, complementariedad y conversaciones por estilo. */
export interface TeamDimensionInsight {
  /** Fortaleza colectiva cuando el estilo está bien representado. */
  strength: string;
  /** Riesgo colectivo si el estilo domina en exceso. */
  risk: string;
  /** Qué aporta esta tendencia al equipo (complementariedad). */
  contributes: string;
  /** Observación cuando el estilo está poco presente (vacío potencial). */
  gap: string;
  /** Conversación recomendada asociada a la presencia/ausencia del estilo. */
  conversation: string;
}

/** Insights de equipo por código de dimensión (D, I, S, C). */
export const TEAM_DIMENSION_INSIGHTS: Record<string, TeamDimensionInsight> = {
  D: {
    strength: "Tiende a empujar las decisiones y a mantener el foco en resultados.",
    risk: "Puede acelerar en exceso y dejar poco espacio a otros ritmos.",
    contributes: "Aporta decisión, orientación a objetivos y empuje ante los retos.",
    gap: "Con poca presencia de Impulsar, al equipo puede costarle decidir y avanzar con rapidez.",
    conversation:
      "Acordad cómo y cuándo se toman las decisiones para combinar agilidad y participación.",
  },
  I: {
    strength: "Tiende a generar energía, comunicación abierta y cohesión.",
    risk: "Puede dispersarse y restar foco al cierre de compromisos.",
    contributes: "Aporta comunicación, entusiasmo y capacidad de movilizar a las personas.",
    gap: "Con poca presencia de Conectar, la comunicación y la energía del grupo pueden resentirse.",
    conversation:
      "Revisad cómo compartís información y reconocéis los avances para sostener la motivación.",
  },
  S: {
    strength: "Tiende a aportar estabilidad, escucha y continuidad en el trabajo.",
    risk: "Puede evitar el conflicto necesario y resistirse a los cambios.",
    contributes: "Aporta fiabilidad, apoyo mutuo y un ritmo sostenible.",
    gap: "Con poca presencia de Sostener, puede faltar continuidad y cuidado de las relaciones.",
    conversation:
      "Hablad de cómo afrontáis los cambios y los desacuerdos para que nadie los acumule.",
  },
  C: {
    strength: "Tiende a aportar rigor, método y atención a la calidad.",
    risk: "Puede caer en el exceso de análisis y ralentizar la ejecución.",
    contributes: "Aporta análisis, orden y criterios objetivos para decidir.",
    gap: "Con poca presencia de Estructurar, pueden escaparse detalles y faltar método.",
    conversation:
      "Definid qué nivel de detalle y calidad necesitáis para no bloquear el avance.",
  },
};

/** Resuelve el insight de equipo de una dimensión (con respaldo neutro). */
export function teamDimensionInsight(code: string): TeamDimensionInsight {
  return (
    TEAM_DIMENSION_INSIGHTS[code] ?? {
      strength: "Aporta una tendencia conductual al conjunto del equipo.",
      risk: "Conviene equilibrar su peso con otras tendencias.",
      contributes: "Suma una forma de trabajo complementaria.",
      gap: "Su baja presencia puede dejar un matiz poco cubierto.",
      conversation: "Comentad cómo cubrir este estilo dentro del equipo.",
    }
  );
}
