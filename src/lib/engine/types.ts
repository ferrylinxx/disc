/**
 * Tipos del MOTOR DE EVALUACIONES configurable de DISC GESEM.
 *
 * El motor es agnóstico al instrumento: DISC es solo un conjunto de datos
 * (dimensiones, contextos, ítems y reglas) que se inyectan en tiempo de
 * ejecución. No hay nada de DISC "en duro" en este módulo.
 */

/** Estado del ciclo de vida de una versión de instrumento. */
export type VersionStatus = "draft" | "published" | "archived";

/** Método de puntuación soportado por el motor. */
export type ScoringMethod = "ipsative";

/**
 * Nivel de intensidad del perfil, derivado de la distancia entre la dimensión
 * primaria y la secundaria. Describe cuán marcada es la tendencia (no es un
 * juicio de valor): a mayor intensidad, perfil más reconocible y consistente.
 */
export type Intensity = "FLEXIBLE" | "MODERADA" | "DEFINIDA" | "MUY_DEFINIDA";

/** Umbrales (sobre la diferencia cruda primaria-secundaria) para la intensidad. */
export interface IntensityThresholds {
  /** Diferencia mínima para dejar de ser "Flexible" y pasar a "Moderada". */
  moderada: number;
  /** Diferencia mínima para "Definida". */
  definida: number;
  /** Diferencia mínima para "Muy definida". */
  muyDefinida: number;
}

/** Una dimensión medida por el instrumento (p. ej. D, I, S, C). */
export interface Dimension {
  /** Código corto y estable (D, I, S, C). Usado en scoring y narrativas. */
  code: string;
  name: string;
  /** Color HEX para visualizaciones (gráficos, mapa de equipo). */
  color: string;
  order: number;
}

/** Contexto temático que agrupa ítems (p. ej. "Toma de decisiones"). */
export interface EvaluationContext {
  code: string;
  name: string;
  description?: string;
  order: number;
}

/** Una opción/afirmación dentro de un ítem, asociada a una dimensión. */
export interface ItemOption {
  /** Identificador estable de la opción dentro del ítem. */
  code: string;
  text: string;
  /** Código de la dimensión que puntúa esta opción. */
  dimensionCode: string;
}

/** Un ítem = bloque de opciones con respuesta forzada Más/Menos. */
export interface Item {
  code: string;
  /** Código del contexto al que pertenece. */
  contextCode: string;
  order: number;
  prompt: string;
  options: ItemOption[];
}

/**
 * Configuración del cálculo. Todo parametrizable desde administración:
 * no hay valores DISC fijos en el código del motor.
 */
export interface ScoringConfig {
  method: ScoringMethod;
  mostValue: number;
  leastValue: number;
  unselectedValue: number;
  /**
   * Rango (máx − mín de las puntuaciones crudas globales) por debajo o igual al
   * cual el perfil se considera "EQ" (adaptable), sin una combinación dominante
   * clara. Sigue el criterio del catálogo oficial (rango ≤ umbral ⇒ EQ).
   */
  eqRangeThreshold: number;
  /** Umbrales de clasificación de la intensidad del perfil. */
  intensity: IntensityThresholds;
  /**
   * Configuración del índice EQ (equilibrio del perfil). Derivado, no medido
   * directamente. Documentado como supuesto de producto.
   */
  eq: EqConfig;
}

/**
 * EQ = índice de equilibrio/adaptabilidad del perfil en escala 0-100.
 * Cuanto más repartidas están las puntuaciones entre dimensiones, mayor EQ.
 */
export interface EqConfig {
  enabled: boolean;
  /** Escala de salida (por defecto 0-100). */
  min: number;
  max: number;
}

/** Definición completa y autocontenida de una versión de instrumento. */
export interface InstrumentDefinition {
  instrumentCode: string;
  instrumentName: string;
  version: string;
  status: VersionStatus;
  description: string;
  dimensions: Dimension[];
  contexts: EvaluationContext[];
  items: Item[];
  scoring: ScoringConfig;
}

/** Respuesta del participante a un ítem (Más/Menos). */
export interface ItemResponse {
  itemCode: string;
  /** Código de la opción marcada como "Más". */
  mostOptionCode: string;
  /** Código de la opción marcada como "Menos". */
  leastOptionCode: string;
}

/** Puntuación de una dimensión (cruda y normalizada). */
export interface DimensionScore {
  dimensionCode: string;
  raw: number;
  /** Porcentaje 0-100 normalizado dentro del individuo (lectura ipsativa). */
  percent: number;
}

/** Reparto proporcional de una dimensión (el conjunto suma 100%). */
export interface DimensionShare {
  dimensionCode: string;
  /** Porcentaje proporcional 0-100; el conjunto de dimensiones suma 100. */
  share: number;
}

/** Resultado del cálculo para un participante. */
export interface ScoringResult {
  /** Puntuaciones globales por dimensión. */
  global: DimensionScore[];
  /**
   * Reparto proporcional global por dimensión (suma 100), según la fórmula
   * de desplazamiento (raw − mín + 1) repartida sobre el total.
   */
  percentages: DimensionShare[];
  /** Puntuaciones por contexto: contextCode -> dimensión -> score. */
  byContext: Record<string, DimensionScore[]>;
  primaryDimension: string;
  secondaryDimension: string;
  /** "EQ" (perfil adaptable) o combinación de dos letras (p. ej. "DI"). */
  profileCode: string;
  /** true cuando el perfil es EQ/adaptable, sin combinación dominante clara. */
  isEq: boolean;
  /** Nivel de intensidad del perfil; null cuando es EQ (adaptable). */
  intensity: Intensity | null;
  /** Índice EQ 0-100 (o según escala configurada). */
  eq: number;
  /** Indicadores de calidad de la cumplimentación. */
  quality: ResponseQuality;
}

/** Métricas de validez de la respuesta. */
export interface ResponseQuality {
  answeredItems: number;
  totalItems: number;
  complete: boolean;
}
