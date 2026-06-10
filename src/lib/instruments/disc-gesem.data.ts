/**
 * Datos del instrumento DISC GESEM v1: 7 contextos y 35 ítems.
 * Cada ítem define 4 afirmaciones en orden fijo D, I, S, C.
 * Contenido editable; en producción procede de la BD configurable.
 */

export interface ContextRow {
  code: string;
  name: string;
  description: string;
}

export interface ItemRow {
  code: string;
  context: string;
  prompt: string;
  /** Afirmaciones en orden [D, I, S, C]. */
  options: [string, string, string, string];
}

export const DISC_CONTEXTS: ContextRow[] = [
  { code: "DECISION", name: "Toma de decisiones", description: "Cómo decides ante distintos escenarios." },
  { code: "ACCION", name: "Acción y ejecución", description: "Tu forma de poner las cosas en marcha." },
  { code: "COMUNICACION", name: "Comunicación", description: "Tu estilo al transmitir y escuchar." },
  { code: "COLABORACION", name: "Colaboración", description: "Tu manera de trabajar con otros." },
  { code: "CAMBIO", name: "Cambio e incertidumbre", description: "Cómo afrontas lo nuevo y lo imprevisible." },
  { code: "CONFLICTO", name: "Conflicto y desacuerdo", description: "Tu reacción ante el desacuerdo." },
  { code: "ORGANIZACION", name: "Organización y calidad", description: "Tu relación con el orden y el rigor." },
];

export const DISC_ITEM_ROWS: ItemRow[] = [
  { code: "DECISION_1", context: "DECISION", prompt: "Cuando hay que tomar una decisión importante…",
    options: ["Decido rápido y asumo el riesgo.", "Busco ideas y consulto con la gente.", "Prefiero pensarlo con calma y sin presión.", "Analizo los datos antes de decidir."] },
  { code: "DECISION_2", context: "DECISION", prompt: "Ante una decisión con información incompleta…",
    options: ["Tomo la iniciativa y avanzo.", "Confío en mi intuición y en el grupo.", "Espero a tener más certeza.", "Busco más datos para reducir el error."] },
  { code: "DECISION_3", context: "DECISION", prompt: "Lo que más valoro al decidir es…",
    options: ["Llegar al resultado cuanto antes.", "Que la decisión motive al equipo.", "Que nadie salga perjudicado.", "Que sea correcta y justificable."] },
  { code: "DECISION_4", context: "DECISION", prompt: "Cuando una decisión sale mal…",
    options: ["Rectifico rápido y sigo adelante.", "Mantengo el ánimo del equipo.", "Reviso con calma qué pasó.", "Analizo el error para no repetirlo."] },
  { code: "DECISION_5", context: "DECISION", prompt: "Prefiero decisiones que…",
    options: ["Me den control sobre el resultado.", "Generen entusiasmo.", "Aporten estabilidad.", "Se basen en criterios objetivos."] },

  { code: "ACCION_1", context: "ACCION", prompt: "Cuando arranca un proyecto…",
    options: ["Empujo para que empiece ya.", "Contagio energía a los demás.", "Voy paso a paso, sin prisa.", "Planifico cada detalle antes."] },
  { code: "ACCION_2", context: "ACCION", prompt: "Mi ritmo de trabajo habitual es…",
    options: ["Rápido y orientado a resultados.", "Dinámico y variado.", "Constante y sostenido.", "Metódico y preciso."] },
  { code: "ACCION_3", context: "ACCION", prompt: "Ante un plazo ajustado…",
    options: ["Acelero y priorizo lo esencial.", "Movilizo a la gente para lograrlo.", "Mantengo la calma y el orden.", "Reviso que todo cumpla los requisitos."] },
  { code: "ACCION_4", context: "ACCION", prompt: "Cuando tengo varias tareas a la vez…",
    options: ["Voy a por las de mayor impacto.", "Las combino según la energía.", "Las hago de una en una.", "Las organizo por procedimiento."] },
  { code: "ACCION_5", context: "ACCION", prompt: "Lo que me impulsa a ejecutar es…",
    options: ["El reto y el logro.", "El reconocimiento y la gente.", "La rutina y la seguridad.", "Hacer las cosas bien."] },

  { code: "COMUNICACION_1", context: "COMUNICACION", prompt: "Cuando comunico una idea…",
    options: ["Voy directo al grano.", "Soy expresivo y entusiasta.", "Hablo con calma y escucho.", "Soy preciso y detallado."] },
  { code: "COMUNICACION_2", context: "COMUNICACION", prompt: "En una reunión tiendo a…",
    options: ["Dirigir y marcar el rumbo.", "Animar y generar conversación.", "Apoyar y mantener el clima.", "Aportar datos y matices."] },
  { code: "COMUNICACION_3", context: "COMUNICACION", prompt: "Cuando escucho a otros…",
    options: ["Busco la conclusión rápido.", "Conecto con sus emociones.", "Presto atención con paciencia.", "Analizo la lógica de lo que dicen."] },
  { code: "COMUNICACION_4", context: "COMUNICACION", prompt: "Mi estilo al dar feedback es…",
    options: ["Franco y sin rodeos.", "Positivo y motivador.", "Cuidadoso y respetuoso.", "Concreto y basado en hechos."] },
  { code: "COMUNICACION_5", context: "COMUNICACION", prompt: "Prefiero comunicarme…",
    options: ["De forma breve y eficaz.", "Cara a cara y con energía.", "En un tono tranquilo.", "Por escrito y bien documentado."] },

  { code: "COLABORACION_1", context: "COLABORACION", prompt: "Trabajando en equipo, yo…",
    options: ["Tomo el liderazgo.", "Genero buen ambiente.", "Doy apoyo y cohesión.", "Aseguro el rigor del trabajo."] },
  { code: "COLABORACION_2", context: "COLABORACION", prompt: "Lo que aporto al grupo es…",
    options: ["Empuje y dirección.", "Energía e ideas.", "Lealtad y estabilidad.", "Calidad y orden."] },
  { code: "COLABORACION_3", context: "COLABORACION", prompt: "Cuando un compañero necesita ayuda…",
    options: ["Le doy una solución rápida.", "Le animo y acompaño.", "Le escucho y le apoyo.", "Le explico cómo hacerlo bien."] },
  { code: "COLABORACION_4", context: "COLABORACION", prompt: "En el reparto de tareas…",
    options: ["Asumo las más exigentes.", "Elijo las que implican a gente.", "Acepto lo que haga falta.", "Prefiero las que requieren precisión."] },
  { code: "COLABORACION_5", context: "COLABORACION", prompt: "Para mí un buen equipo es…",
    options: ["Uno que consigue resultados.", "Uno con buen clima.", "Uno unido y estable.", "Uno que trabaja con método."] },

  { code: "CAMBIO_1", context: "CAMBIO", prompt: "Ante un cambio inesperado…",
    options: ["Tomo el control de la situación.", "Lo vivo como una oportunidad.", "Necesito tiempo para adaptarme.", "Busco entender las reglas nuevas."] },
  { code: "CAMBIO_2", context: "CAMBIO", prompt: "La incertidumbre me hace…",
    options: ["Actuar para reducirla.", "Improvisar con optimismo.", "Preferir lo conocido.", "Querer más información."] },
  { code: "CAMBIO_3", context: "CAMBIO", prompt: "Cuando cambian las prioridades…",
    options: ["Me reoriento de inmediato.", "Me adapto con flexibilidad.", "Me cuesta soltar lo anterior.", "Reviso cómo afecta al plan."] },
  { code: "CAMBIO_4", context: "CAMBIO", prompt: "Frente a algo nuevo y desconocido…",
    options: ["Lo afronto con decisión.", "Lo exploro con curiosidad.", "Avanzo con cautela.", "Lo estudio antes de actuar."] },
  { code: "CAMBIO_5", context: "CAMBIO", prompt: "El cambio ideal para mí es…",
    options: ["El que me da más control.", "El que trae novedad.", "El gradual y previsible.", "El bien planificado."] },

  { code: "CONFLICTO_1", context: "CONFLICTO", prompt: "Ante un desacuerdo…",
    options: ["Defiendo mi postura con firmeza.", "Busco convencer con entusiasmo.", "Intento suavizar la tensión.", "Recurro a los hechos."] },
  { code: "CONFLICTO_2", context: "CONFLICTO", prompt: "Cuando alguien me lleva la contraria…",
    options: ["Le planto cara.", "Trato de persuadirle.", "Cedo para mantener la paz.", "Pido argumentos."] },
  { code: "CONFLICTO_3", context: "CONFLICTO", prompt: "En una discusión de equipo…",
    options: ["Quiero zanjarla rápido.", "Medio para que se entiendan.", "Evito el enfrentamiento.", "Aclaro los datos en disputa."] },
  { code: "CONFLICTO_4", context: "CONFLICTO", prompt: "Lo que más me incomoda de un conflicto es…",
    options: ["Perder el control.", "El mal ambiente.", "La tensión personal.", "La falta de objetividad."] },
  { code: "CONFLICTO_5", context: "CONFLICTO", prompt: "Para resolver un conflicto prefiero…",
    options: ["Una solución directa.", "Un acuerdo amistoso.", "Que se calmen los ánimos.", "Aplicar un criterio justo."] },

  { code: "ORGANIZACION_1", context: "ORGANIZACION", prompt: "Mi forma de organizarme es…",
    options: ["Por objetivos y resultados.", "Flexible según el día.", "Estable y rutinaria.", "Detallada y sistemática."] },
  { code: "ORGANIZACION_2", context: "ORGANIZACION", prompt: "Respecto a las normas…",
    options: ["Las cuestiono si frenan resultados.", "Las adapto a cada situación.", "Las respeto para dar estabilidad.", "Las sigo con rigor."] },
  { code: "ORGANIZACION_3", context: "ORGANIZACION", prompt: "Mi nivel de exigencia con la calidad…",
    options: ["Suficiente para lograr el objetivo.", "Importa, pero sin obsesión.", "Constante y fiable.", "Muy alto, cuido cada detalle."] },
  { code: "ORGANIZACION_4", context: "ORGANIZACION", prompt: "Cuando planifico…",
    options: ["Marco metas ambiciosas.", "Dejo margen para improvisar.", "Busco un plan realista.", "Detallo cada paso."] },
  { code: "ORGANIZACION_5", context: "ORGANIZACION", prompt: "El orden para mí es…",
    options: ["Un medio para ir más rápido.", "Secundario frente a las personas.", "Una fuente de tranquilidad.", "Imprescindible."] },
];
