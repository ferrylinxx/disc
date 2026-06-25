/**
 * Analítica del MAPA DE EQUIPO avanzado. Módulo puro y determinista: a partir
 * de los resultados individuales calcula la lectura colectiva (distribución,
 * combinaciones, contextos, fortalezas/riesgos, complementariedad, vacíos,
 * conversaciones, plan e insights). Redacción en clave de tendencia (no
 * diagnóstico). El aislamiento multi-tenant se aplica antes, en la capa de datos.
 */
import type { DimensionScore, Dimension, EvaluationContext } from "@/lib/engine/types";
import { proportionalShares } from "@/lib/engine/scoring";
import { resolveProfile, styleShort } from "@/lib/narratives/disc-gesem.catalog";
import { teamDimensionInsight } from "@/lib/narratives/disc-gesem.team";

/** Resultado individual mínimo que necesita la analítica de equipo. */
export interface TeamParticipantResult {
  eq: number;
  profileCode: string;
  primary: string;
  isEq: boolean;
  global: DimensionScore[];
  byContext: Record<string, { dimensionCode: string; percent: number }[]>;
}

/** Umbral (en % de share medio) por debajo del cual un estilo es un "vacío". */
const GAP_THRESHOLD = 10;
/** Umbral de presencia para considerar que un estilo aporta complementariedad. */
const PRESENT_THRESHOLD = 18;

export interface TeamInsights {
  overview: {
    total: number;
    completed: number;
    participation: number;
    predominantProfile: { code: string; name: string } | null;
    predominantStyle: { code: string; share: number } | null;
    eqAverage: number;
    /** Índice de diversidad: nº de perfiles distintos y su nivel. */
    diversity: { distinct: number; level: "Baja" | "Media" | "Alta" } | null;
  };
  /** Resumen ejecutivo narrativo del equipo (120-180 palabras). */
  executiveSummary: string;
  /** Puntos del scatter sobre la cuadrícula DISC (uno por participante). */
  discPoints: { x: number; y: number; code: string }[];
  /** Claves de lectura de la distribución de recursos (3-4 ideas). */
  readingKeys: string[];
  /** Claves para el liderazgo del equipo (implicaciones para el responsable). */
  leadershipKeys: string[];
  distribution: { dimensionCode: string; share: number }[];
  distributionText: string;
  combinations: { code: string; name: string; count: number }[];
  contexts: { code: string; name: string; scores: { dimensionCode: string; percent: number }[] }[];
  strengths: string[];
  risks: string[];
  complementarity: { dimensionCode: string; share: number; text: string }[];
  gaps: { dimensionCode: string; share: number; observation: string }[];
  conversations: string[];
  actionPlan: string[];
  insights: string[];
}

/** Calcula la lectura colectiva del equipo a partir de los resultados. */
export function computeTeamInsights(
  dimensions: Dimension[],
  contexts: EvaluationContext[],
  participants: { hasResult: boolean; result: TeamParticipantResult | null }[],
): TeamInsights {
  const dimCodes = [...dimensions].sort((a, b) => a.order - b.order).map((d) => d.code);
  const dimName = new Map(dimensions.map((d) => [d.code, d.name]));
  const withResult = participants
    .map((p) => p.result)
    .filter((r): r is TeamParticipantResult => r !== null);

  const total = participants.length;
  const completed = withResult.length;
  const participation = total > 0 ? Math.round((completed / total) * 100) : 0;
  const eqAverage =
    completed > 0
      ? Math.round(withResult.reduce((a, r) => a + r.eq, 0) / completed)
      : 0;

  // Distribución colectiva: media de los repartos proporcionales individuales.
  const shareSum = new Map<string, number>(dimCodes.map((c) => [c, 0]));
  for (const r of withResult) {
    for (const s of proportionalShares(r.global)) {
      shareSum.set(s.dimensionCode, (shareSum.get(s.dimensionCode) ?? 0) + s.share);
    }
  }
  const distribution = dimCodes
    .map((code) => ({
      dimensionCode: code,
      share: completed > 0 ? Math.round((shareSum.get(code) ?? 0) / completed) : 0,
    }))
    .sort((a, b) => b.share - a.share);

  // Distribución de combinaciones (profileCode: "DI", "EQ", ...).
  const comboCount = new Map<string, number>();
  for (const r of withResult) {
    comboCount.set(r.profileCode, (comboCount.get(r.profileCode) ?? 0) + 1);
  }
  const combinations = [...comboCount.entries()]
    .map(([code, count]) => ({ code, name: resolveProfile(code).name, count }))
    .sort((a, b) => b.count - a.count);

  // Mapa de contextos colectivo: media del % por dimensión en cada contexto.
  const ctxList = [...contexts].sort((a, b) => a.order - b.order);
  const ctxScores = ctxList.map((ctx) => {
    const sum = new Map<string, { sum: number; n: number }>();
    for (const r of withResult) {
      for (const s of r.byContext[ctx.code] ?? []) {
        const acc = sum.get(s.dimensionCode) ?? { sum: 0, n: 0 };
        acc.sum += s.percent;
        acc.n += 1;
        sum.set(s.dimensionCode, acc);
      }
    }
    return {
      code: ctx.code,
      name: ctx.name,
      scores: dimCodes.map((code) => {
        const acc = sum.get(code);
        return {
          dimensionCode: code,
          percent: acc && acc.n > 0 ? Math.round(acc.sum / acc.n) : 0,
        };
      }),
    };
  });

  const predominantStyle = distribution[0] && completed > 0
    ? { code: distribution[0].dimensionCode, share: distribution[0].share }
    : null;
  const predominantProfile = combinations[0]
    ? { code: combinations[0].code, name: combinations[0].name }
    : null;

  // Índice de diversidad: nº de perfiles (combinaciones) distintos presentes.
  // Criterio oficial GESEM: Baja 1-3 · Media 4-6 · Alta 7+.
  const diversity =
    completed > 0
      ? {
          distinct: combinations.length,
          level: (combinations.length >= 7
            ? "Alta"
            : combinations.length >= 4
              ? "Media"
              : "Baja") as "Baja" | "Media" | "Alta",
        }
      : null;

  // Fortalezas / riesgos colectivos a partir de los estilos presentes (máx 5).
  const present = distribution.filter((d) => d.share >= PRESENT_THRESHOLD);
  const leading = present.length > 0 ? present : distribution.slice(0, 2);
  const strengths = leading
    .map((d) => teamDimensionInsight(d.dimensionCode).strength)
    .slice(0, 5);
  const risks = leading
    .map((d) => teamDimensionInsight(d.dimensionCode).risk)
    .slice(0, 5);

  const complementarity = distribution
    .filter((d) => d.share >= PRESENT_THRESHOLD)
    .map((d) => ({
      dimensionCode: d.dimensionCode,
      share: d.share,
      text: teamDimensionInsight(d.dimensionCode).contributes,
    }));

  const gaps = distribution
    .filter((d) => d.share < GAP_THRESHOLD)
    .map((d) => ({
      dimensionCode: d.dimensionCode,
      share: d.share,
      observation: teamDimensionInsight(d.dimensionCode).gap,
    }));

  // Conversaciones recomendadas: prioriza los vacíos y el estilo predominante.
  const conversations = [
    ...gaps.map((g) => teamDimensionInsight(g.dimensionCode).conversation),
    ...(predominantStyle
      ? [teamDimensionInsight(predominantStyle.code).conversation]
      : []),
  ]
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 5);

  // Plan de acción de equipo: apoyado en estilo predominante y vacíos.
  const actionPlan: string[] = [];
  if (predominantStyle) {
    actionPlan.push(
      `Aprovechad la tendencia a ${styleShort(predominantStyle.code)} como motor del equipo, ` +
        `cuidando que no eclipse otros estilos.`,
    );
  }
  for (const g of gaps.slice(0, 2)) {
    actionPlan.push(
      `Reforzad de forma consciente el estilo ${styleShort(g.dimensionCode)} ` +
        `(${dimName.get(g.dimensionCode) ?? g.dimensionCode}), poco presente hoy.`,
    );
  }
  actionPlan.push(
    "Revisad estos resultados en equipo como punto de partida para el desarrollo, no como una conclusión cerrada.",
  );

  // Insights automáticos.
  const insights: string[] = [];
  if (completed === 0) {
    insights.push("Aún no hay resultados suficientes para generar la lectura del equipo.");
  } else {
    if (predominantStyle) {
      insights.push(
        `El equipo tiende a ${styleShort(predominantStyle.code)} como estilo predominante (${predominantStyle.share}%).`,
      );
    }
    insights.push(
      eqAverage >= 70
        ? `El EQ medio (${eqAverage}) sugiere un equipo con buena capacidad de adaptación entre estilos.`
        : `El EQ medio (${eqAverage}) sugiere estilos marcados; conviene cuidar la flexibilidad mutua.`,
    );
    if (gaps.length > 0) {
      insights.push(
        `Posibles vacíos en: ${gaps.map((g) => styleShort(g.dimensionCode)).join(", ")}.`,
      );
    }
  }

  // Mapa DISC del equipo: un punto por participante en el cuadrante.
  const discPoints = withResult.map((r) => {
    const sh: Record<string, number> = {};
    for (const s of proportionalShares(r.global)) sh[s.dimensionCode] = s.share;
    const dd = sh.D ?? 0, ii = sh.I ?? 0, ss = sh.S ?? 0, cc = sh.C ?? 0;
    const x = (ii + ss - (dd + cc)) / 100;
    const y = (dd + ii - (ss + cc)) / 100;
    return {
      x: Math.max(22, Math.min(178, 100 + x * 74)),
      y: Math.max(22, Math.min(178, 100 - y * 74)),
      code: r.primary,
    };
  });

  // Resumen ejecutivo (radiografía): párrafo narrativo de la composición.
  const topNames = leading.map((d) => styleShort(d.dimensionCode)).join(" y ");
  const lowList = gaps.length > 0 ? gaps.map((g) => g.dimensionCode) : [];
  const lowNames = lowList.map((c) => styleShort(c)).join(" y ");
  const eqClause =
    eqAverage >= 70
      ? "una buena capacidad de adaptación entre estilos"
      : "estilos marcados que conviene cuidar con flexibilidad mutua";
  const executiveSummary =
    completed === 0
      ? "Aún no hay resultados suficientes para generar la radiografía del equipo. La lectura se completará a medida que las personas finalicen su evaluación."
      : `Este equipo muestra una mayor presencia de recursos orientados a ${topNames}, ` +
        `una combinación que suele favorecer formas de trabajo coherentes con esas tendencias. ` +
        (lowNames
          ? `Los recursos vinculados a ${lowNames} aparecen con menor presencia relativa, por lo que en determinadas situaciones puede resultar útil reforzarlos de forma consciente. `
          : "El reparto entre los cuatro recursos es relativamente equilibrado. ") +
        `La diversidad del equipo es ${(diversity?.level ?? "media").toLowerCase()} ` +
        `(${diversity?.distinct ?? 0} perfiles distintos) y el equilibrio medio (EQ ${eqAverage}) sugiere ${eqClause}. ` +
        `Esta composición es un punto de partida para la conversación: describe tendencias colectivas del sistema, ` +
        `no conclusiones sobre personas concretas, y su utilidad depende de los retos y del momento del equipo.`;

  // Claves de lectura de la distribución de recursos (3-4 ideas).
  const readingKeys: string[] = [];
  if (completed > 0) {
    if (leading[0])
      readingKeys.push(
        `Apoyaos en ${styleShort(leading[0].dimensionCode)} como recurso más presente del equipo.`,
      );
    if (gaps[0])
      readingKeys.push(
        `Reforzad de forma consciente ${styleShort(gaps[0].dimensionCode)}, hoy menos representado.`,
      );
    readingKeys.push(
      diversity?.level === "Alta"
        ? "La diversidad es alta: aprovechadla cuidando la coordinación y la comunicación."
        : diversity?.level === "Baja"
          ? "La diversidad es baja: incorporad perspectivas diferentes en las decisiones clave."
          : "Una diversidad media facilita combinar foco y complementariedad.",
    );
    readingKeys.push(
      "Leed estos recursos como tendencias del sistema, no como etiquetas de personas.",
    );
  }

  // Claves para el liderazgo del equipo (implicaciones para el responsable).
  const leadershipKeys: string[] = [];
  if (completed > 0) {
    if (predominantStyle) {
      leadershipKeys.push(
        `Apóyate en ${styleShort(predominantStyle.code)} como motor del equipo: da dirección clara y reconócelo, cuidando que no eclipse otros recursos.`,
      );
    }
    for (const g of gaps.slice(0, 2)) {
      leadershipKeys.push(
        `Asegura de forma consciente ${styleShort(g.dimensionCode)}, hoy poco presente: incorpóralo tú o define quién lo cubre en las decisiones clave.`,
      );
    }
    leadershipKeys.push(
      diversity?.level === "Alta"
        ? "Con alta diversidad, dedica tiempo a alinear criterios y a traducir entre estilos: tu papel es facilitar la coordinación."
        : diversity?.level === "Baja"
          ? "Con baja diversidad, busca deliberadamente perspectivas diferentes antes de decidir para evitar puntos ciegos."
          : "Una diversidad media te permite combinar foco y complementariedad: reparte roles según los recursos de cada persona.",
    );
    leadershipKeys.push(
      eqAverage >= 70
        ? `El equipo se adapta bien entre estilos (EQ ${eqAverage}); puedes delegar y dar autonomía manteniendo objetivos comunes.`
        : `Con estilos marcados (EQ ${eqAverage}), explicita las reglas de juego y media en las diferencias de ritmo y prioridades.`,
    );
    leadershipKeys.push(
      "Usa estas claves como punto de partida para una conversación con el equipo, no como una receta cerrada.",
    );
  }

  return {
    overview: {
      total,
      completed,
      participation,
      predominantProfile,
      predominantStyle,
      eqAverage,
      diversity,
    },
    executiveSummary,
    discPoints,
    readingKeys,
    leadershipKeys,
    distribution,
    distributionText: distributionInterpretation(distribution, dimName, completed),
    combinations,
    contexts: ctxScores,
    strengths,
    risks,
    complementarity,
    gaps,
    conversations,
    actionPlan,
    insights,
  };
}

/** Texto interpretativo de la distribución DISC colectiva. */
function distributionInterpretation(
  distribution: { dimensionCode: string; share: number }[],
  dimName: Map<string, string>,
  completed: number,
): string {
  if (completed === 0 || distribution.length === 0) {
    return "Sin resultados suficientes para interpretar la distribución del equipo.";
  }
  const top = distribution[0];
  const second = distribution[1];
  const spread = top.share - distribution[distribution.length - 1].share;
  if (spread <= 8) {
    return "El equipo muestra un reparto equilibrado entre los cuatro estilos, con tendencia a la adaptabilidad.";
  }
  const topName = dimName.get(top.dimensionCode) ?? top.dimensionCode;
  const secondName = second ? dimName.get(second.dimensionCode) ?? second.dimensionCode : "";
  return (
    `El equipo tiende a apoyarse sobre todo en ${styleShort(top.dimensionCode)} ` +
    `(${topName}, ${top.share}%)` +
    (second ? `, seguido de ${styleShort(second.dimensionCode)} (${secondName}, ${second.share}%).` : ".")
  );
}
