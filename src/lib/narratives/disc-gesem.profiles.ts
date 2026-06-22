/**
 * Narrativas de perfil para el INFORME INDIVIDUAL GESEM.
 *
 * Estructura GESEM definitiva (docs V1-20/21/24/25): el informe es
 * INTERPRETATIVO y REFLEXIVO. No incluye retos, experimentos, tareas ni planes
 * de acción individuales. El protagonista es el RECURSO predominante
 * (Impulsar/Conectar/Sostener/Estructurar); el código de perfil (DI, ID, …)
 * funciona solo como referencia interna de interpretación.
 *
 * Toda la redacción está en clave de TENDENCIA/HIPÓTESIS, nunca diagnóstica ni
 * de fortaleza/debilidad (ver Guía Editorial y AGENTS.md). Es contenido interino
 * compuesto por recurso; en producción vivirá en BD versionada y editable.
 */
import type { ScoringResult } from "@/lib/engine/types";
import { resolveProfile, styleShort } from "./disc-gesem.catalog";

/** Un recurso del Diccionario de Recursos con su definición breve. */
export interface ResourceItem {
  name: string;
  description: string;
}

/** Fragmentos narrativos asociados a un recurso (dimensión D/I/S/C). */
export interface ResourceNarrative {
  /** Recursos predominantes (Diccionario de Recursos). */
  resources: ResourceItem[];
  /** Aportación habitual en equipos y proyectos. */
  contribution: string;
  /** Lo que otras personas suelen valorar. */
  valued: string;
  /** Cuando coordina personas o proyectos. */
  coordinating: string;
  /** Cuando colabora con otras personas. */
  collaborating: string;
  /** Cómo suele comunicarse. */
  communication: string;
  /** Contextos de mejor desempeño. */
  contexts: string;
  /** Aspectos que merece la pena observar (3 elementos). */
  observe: [string, string, string];
  /** Ampliación de repertorio (no es corrección: amplía posibilidades). */
  repertoire: string;
  /** Preguntas para la reflexión (3, abiertas, no evalúan ni sugieren). */
  reflection: [string, string, string];
}

/** Narrativa por recurso, indexada por código de dimensión (D, I, S, C). */
export const RESOURCE_NARRATIVES: Record<string, ResourceNarrative> = {
  D: {
    resources: [
      { name: "Iniciativa", description: "Tiende a poner en marcha acciones y activar decisiones sin necesidad de estímulos externos constantes." },
      { name: "Orientación a resultados", description: "Suele dirigir la atención hacia objetivos, avances y consecución de metas." },
      { name: "Influencia", description: "Tiende a movilizar a otras personas y a empujar las situaciones hacia adelante." },
    ],
    contribution:
      "En equipos y proyectos, suele aportar impulso, dirección y capacidad para desbloquear situaciones. Con frecuencia contribuye a mantener el foco en los objetivos y a que las cosas avancen.",
    valued:
      "Las personas de su entorno suelen apreciar su capacidad para tomar decisiones, su orientación a la acción y su disposición a asumir iniciativas cuando una situación requiere impulso.",
    coordinating:
      "Cuando coordina personas o proyectos, suele aportar energía y claridad de objetivos, y facilita que las decisiones se conviertan en acciones. Merece la pena observar que no todas las personas necesitan el mismo ritmo.",
    collaborating:
      "Cuando colabora, tiende a aportar dinamismo y a mantener el movimiento. En contextos con ritmos distintos, puede resultar útil dedicar más espacio a escuchar y a integrar perspectivas diferentes.",
    communication:
      "Su comunicación suele ser directa y orientada a la acción. En determinados contextos, puede resultar útil comprobar que el mensaje se ha comprendido y no únicamente escuchado.",
    contexts:
      "Sus recursos suelen desplegarse con mayor facilidad en entornos dinámicos, con margen para decidir, influir y convertir las ideas en acciones.",
    observe: [
      "Cómo equilibra velocidad y participación cuando otras personas necesitan más tiempo.",
      "Cuándo conviene escuchar y contrastar antes de cerrar una decisión.",
      "El impacto que un ritmo muy alto puede tener en el resto del equipo.",
    ],
    repertoire:
      "Ampliar el repertorio puede consistir en incorporar espacios de análisis antes de cerrar decisiones y en dar más atención al seguimiento cuando el contexto lo requiere.",
    reflection: [
      "¿Qué recursos reconoces con más claridad en tu forma habitual de trabajar y relacionarte?",
      "¿En qué situaciones esos recursos te han ayudado especialmente a generar resultados o a movilizar a otras personas?",
      "¿Qué otras formas de actuar podrían complementar tus recursos cuando el contexto o las personas lo requieren?",
    ],
  },
  I: {
    resources: [
      { name: "Influencia", description: "Capacidad para movilizar y generar adhesión a través de la comunicación y la interacción." },
      { name: "Energía relacional", description: "Tiende a buscar interacción, intercambio y conexión con otras personas." },
      { name: "Comunicación", description: "Facilita expresar ideas, transmitir mensajes y favorecer la interacción entre personas." },
      { name: "Optimismo", description: "Suele enfocarse en posibilidades, oportunidades y escenarios favorables." },
    ],
    contribution:
      "Suele aportar entusiasmo, capacidad para conectar personas y para generar participación alrededor de nuevas ideas o iniciativas. Con frecuencia ayuda a crear un clima de confianza.",
    valued:
      "Las personas de su entorno suelen valorar su cercanía, su facilidad para comunicar y su capacidad para implicar a otras personas y mantener una mirada optimista ante los retos.",
    coordinating:
      "Cuando coordina, suele apoyarse en la relación y en la comunicación para movilizar. Merece la pena observar cómo transforma el entusiasmo en acuerdos concretos y en seguimiento sostenido.",
    collaborating:
      "Cuando colabora, tiende a favorecer la participación y el buen clima. Puede resultar útil mantener el foco y la claridad cuando conviven muchas perspectivas.",
    communication:
      "Su comunicación suele ser expresiva y cercana, y favorece la conexión. En contextos que requieren concreción, puede resultar útil acompañarla de claridad y priorización.",
    contexts:
      "Sus recursos suelen desplegarse con mayor facilidad en entornos relacionales, participativos y con espacio para la interacción y la creatividad.",
    observe: [
      "Cómo convierte las conversaciones en acuerdos concretos y acciones sostenidas.",
      "Cuándo conviene priorizar el foco frente a la amplitud de perspectivas.",
      "Cómo mantiene la claridad cuando hay muchas conversaciones abiertas.",
    ],
    repertoire:
      "Ampliar el repertorio puede consistir en apoyarse en estructura y seguimiento para dar continuidad a lo que se pone en marcha.",
    reflection: [
      "¿Qué recursos reconoces con más claridad en tu forma de comunicar y relacionarte?",
      "¿En qué situaciones tu capacidad para conectar ha favorecido especialmente la colaboración?",
      "¿Qué formas de actuar podrían complementar tus recursos cuando una situación necesita más concreción?",
    ],
  },
  S: {
    resources: [
      { name: "Estabilidad", description: "Aporta continuidad, constancia y serenidad en situaciones cambiantes." },
      { name: "Escucha", description: "Presta atención genuina a otras personas y considera perspectivas distintas a la propia." },
      { name: "Cooperación", description: "Tiende a contribuir al trabajo conjunto favoreciendo relaciones constructivas." },
      { name: "Paciencia", description: "Sostiene procesos y ritmos que requieren tiempo antes de generar resultados visibles." },
    ],
    contribution:
      "Suele aportar estabilidad, escucha y continuidad. Con frecuencia contribuye a sostener acuerdos, cuidar la cohesión del equipo y acompañar a las personas en los procesos.",
    valued:
      "Las personas de su entorno suelen valorar su fiabilidad, su disponibilidad para escuchar y la sensación de confianza y serenidad que transmite.",
    coordinating:
      "Cuando coordina, suele aportar estabilidad y cuidar que las personas se sientan acompañadas. Merece la pena observar cuándo una situación requiere más ritmo o una decisión más explícita.",
    collaborating:
      "Cuando colabora, tiende a favorecer la cohesión y la confianza. Puede resultar útil expresar la propia posición cuando el contexto necesita claridad o un cambio de ritmo.",
    communication:
      "Su comunicación suele generar seguridad y cercanía. En determinados contextos, puede resultar útil ganar concreción y posicionarse de forma explícita.",
    contexts:
      "Sus recursos suelen desplegarse con mayor facilidad en entornos estables, colaborativos y con relaciones de confianza mantenidas en el tiempo.",
    observe: [
      "Cuándo la búsqueda de armonía aplaza conversaciones necesarias.",
      "Cuándo conviene posicionarse de forma explícita.",
      "Cómo afronta los cambios de ritmo cuando el contexto los exige.",
    ],
    repertoire:
      "Ampliar el repertorio puede consistir en expresar antes la propia posición y en introducir cambios de ritmo cuando la situación lo requiere.",
    reflection: [
      "¿Qué recursos reconoces con más claridad en tu forma de sostener relaciones y procesos?",
      "¿En qué situaciones tu estabilidad ha aportado especialmente valor al equipo?",
      "¿Qué formas de actuar podrían complementar tus recursos cuando una situación necesita más rapidez o decisión?",
    ],
  },
  C: {
    resources: [
      { name: "Análisis", description: "Tiende a examinar la información con profundidad antes de concluir o decidir." },
      { name: "Rigor", description: "Presta atención al detalle, la precisión y la calidad de los resultados." },
      { name: "Organización", description: "Estructura actividades, recursos e información de forma ordenada y comprensible." },
      { name: "Prudencia", description: "Valora riesgos, consecuencias e impactos antes de actuar." },
    ],
    contribution:
      "Suele aportar análisis, método y rigor. Con frecuencia contribuye a mejorar la calidad de las decisiones y a ordenar la información para que el trabajo avance con criterio.",
    valued:
      "Las personas de su entorno suelen valorar su preparación, su atención al detalle y la fiabilidad que aporta a las decisiones y al seguimiento.",
    coordinating:
      "Cuando coordina, suele aportar criterio, orden y atención a la calidad. Merece la pena observar cuándo el nivel de detalle facilita o frena la acción.",
    collaborating:
      "Cuando colabora, tiende a aportar estructura y consistencia. Puede resultar útil simplificar algunos mensajes cuando el equipo necesita avanzar con rapidez.",
    communication:
      "Su comunicación suele aportar rigor y comprensión. En determinados contextos, puede resultar útil revisar si el nivel de detalle facilita o dificulta la acción.",
    contexts:
      "Sus recursos suelen desplegarse con mayor facilidad en entornos que valoran el análisis, la calidad y el trabajo bien estructurado.",
    observe: [
      "Cuándo ya existe información suficiente para avanzar.",
      "Cómo simplificar los mensajes cuando el equipo necesita acción.",
      "El equilibrio entre rigor y ritmo de respuesta.",
    ],
    repertoire:
      "Ampliar el repertorio puede consistir en definir un punto de decisión cuando el análisis ya es suficiente para avanzar.",
    reflection: [
      "¿Qué recursos reconoces con más claridad en tu forma de analizar y organizar?",
      "¿En qué situaciones tu rigor ha mejorado especialmente la calidad de una decisión?",
      "¿Qué formas de actuar podrían complementar tus recursos cuando una situación necesita más velocidad?",
    ],
  },
};

/** Narrativa de perfil compuesta para el informe GESEM (estructura de bloques). */
export interface ProfileNarrative {
  /** Nombre oficial de la combinación (referencia: Tendencia predominante). */
  title: string;
  /** Recursos predominantes que dan nombre a la tendencia (ej. "Impulsar + Conectar"). */
  resourceHeadline: string;
  /** Código interno de interpretación (DI, ID, …). No protagonista. */
  internalCode: string;
  /** Texto introductorio breve (Tendencia predominante). */
  intro: string;
  /** Recursos predominantes con su definición (Bloque "Recursos predominantes"). */
  resources: ResourceItem[];
  /** Aportación habitual. */
  contribution: string;
  /** Lo que otras personas suelen valorar. */
  valued: string;
  /** Coordinación y colaboración (cuando coordina / cuando colabora). */
  coordination: { coordinating: string; collaborating: string };
  /** Comunicación. */
  communication: string;
  /** Contextos de mejor desempeño. */
  contexts: string;
  /** Aspectos que merece la pena observar. */
  observe: string[];
  /** Ampliación de repertorio. */
  repertoire: string;
  /** Preguntas para la reflexión (3). */
  reflection: string[];
}

/** Toma elementos distintos de dos listas hasta completar `n`. */
function pickDistinct(primary: ResourceItem[], secondary: ResourceItem[], n: number): ResourceItem[] {
  const out: ResourceItem[] = [];
  for (const v of [...primary, ...secondary]) {
    if (out.length >= n) break;
    if (!out.some((x) => x.name === v.name)) out.push(v);
  }
  return out;
}

/**
 * Compone la narrativa del perfil desde el recurso predominante (y el
 * secundario para enriquecer recursos y observaciones). El recurso primario
 * gobierna coordinación, comunicación, contextos y ampliación de repertorio.
 */
export function buildProfileNarrative(result: ScoringResult): ProfileNarrative {
  const profile = resolveProfile(result.profileCode);
  const primary = RESOURCE_NARRATIVES[result.primaryDimension] ?? RESOURCE_NARRATIVES.D;
  const secondary = result.isEq
    ? null
    : RESOURCE_NARRATIVES[result.secondaryDimension] ?? null;

  const resourceHeadline = result.isEq
    ? "Recursos equilibrados"
    : `${styleShort(result.primaryDimension)} + ${styleShort(result.secondaryDimension)}`;

  const combo = result.isEq
    ? "Según tus respuestas, sueles repartir tu energía entre varios recursos y adaptar tu forma de actuar al contexto y a las personas."
    : `Según tus respuestas, sueles apoyarte sobre todo en recursos orientados a ${styleShort(result.primaryDimension)} y a ${styleShort(result.secondaryDimension)}.`;

  return {
    title: profile.name,
    resourceHeadline,
    internalCode: result.profileCode,
    intro: `${profile.summary} ${combo}`,
    resources: secondary
      ? pickDistinct(primary.resources.slice(0, 2), secondary.resources, 4)
      : primary.resources.slice(0, 4),
    contribution: primary.contribution,
    valued: primary.valued,
    coordination: {
      coordinating: primary.coordinating,
      collaborating: primary.collaborating,
    },
    communication: primary.communication,
    contexts: primary.contexts,
    observe: secondary
      ? Array.from(new Set([...primary.observe.slice(0, 2), ...secondary.observe])).slice(0, 3)
      : primary.observe.slice(0, 3),
    repertoire: primary.repertoire,
    reflection: primary.reflection.slice(0, 3),
  };
}

/** Un contexto del informe ("Tu mapa por contextos") con su recurso predominante. */
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

/** Deriva el recurso predominante para cada uno de los 5 contextos del informe. */
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
