/**
 * Sistema de idioma del flujo del participante (catalán por defecto + castellano).
 * Diccionario importable desde servidor y cliente. No pasar el dict por props a
 * componentes cliente (contiene funciones): pasar `lang` y resolver con getDict.
 */

export type Lang = "ca" | "es";
export const LANGS: Lang[] = ["ca", "es"];
export const DEFAULT_LANG: Lang = "ca";

export function isLang(v: unknown): v is Lang {
  return v === "ca" || v === "es";
}

const es = {
  langName: { ca: "Català", es: "Castellà" },
  nav: {
    howItWorks: "Cómo funciona",
    model: "El modelo",
    platform: "La plataforma",
    access: "Acceder",
    start: "Comenzar",
    myPanel: "Mi panel",
    logout: "Salir",
    privacy: "Privacidad",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
  },
  intake: {
    title: "Evaluación DISC GESEM",
    subtitle:
      "Introduce tus datos para comenzar. Tu informe quedará guardado y podrás recibirlo por email.",
    name: "Nombre completo",
    namePh: "Ej. Ana García López",
    email: "Email",
    emailPh: "Ej. ana@empresa.com",
    emailNote: "Solo se usará para enviarte tu informe si lo solicitas.",
    submit: "Comenzar evaluación →",
    submitting: "Preparando cuestionario…",
    methodNote:
      "Este cuestionario mide estilos conductuales, no rasgos clínicos. Los resultados son tendencias, no diagnósticos.",
  },
  quiz: {
    prep: "Preparación",
    hello: (name: string) => `Hola, ${name}`,
    introSubtitle: "Antes de empezar, dedica un momento a entender cómo funciona.",
    draftTitle: "Tienes un cuestionario a medias",
    draftBody: (n: number) =>
      `Guardamos tu progreso (${n} ${n === 1 ? "bloque" : "bloques"} completados). ¿Quieres continuar donde lo dejaste?`,
    resume: "Continuar",
    startOver: "Empezar de nuevo",
    instrPre: "En cada bloque toca primero la frase que ",
    instrMost: "más",
    instrMid: " te representa y luego la que ",
    instrLeast: "menos",
    instrPost: ". El cuestionario ",
    instrAuto: "avanza solo",
    instrKeys: "; en ordenador puedes usar las teclas ",
    continue: "Continuar",
    howToAnswer:
      "En cada situación encontrarás cuatro formas diferentes de actuar. No hay respuestas correctas o incorrectas. Elige solo la que MÁS se parece a cómo sueles actuar y la que MENOS se parece a ti; las otras dos no puntúan. Responde de forma espontánea, pensando en cómo actúas habitualmente.",
    selfTitle: "¿Cómo te ves? (evaluación inicial)",
    selfSubtitle:
      "Estos son los cuatro estilos del modelo DISC. Antes de empezar, elige a priori con cuál te identificas más; al terminar lo compararemos con tu resultado real. Es solo un punto de partida: ninguno es mejor que otro.",
    selfStart: "Empezar cuestionario",
    selfHints: {
      D: "Orientación a resultados y decisión",
      I: "Comunicación, energía y relación",
      S: "Cooperación, apoyo y constancia",
      C: "Análisis, rigor y calidad",
    } as Record<string, string>,
    quizTitle: "Cuestionario",
    itemOf: (i: number, total: number) => `Ítem ${i} de ${total}`,
    completed: (n: number, pct: number) => `${n} completados · ${pct}%`,
    pickMost: "Toca la frase que MÁS te representa",
    pickLeast: "Ahora toca la que MENOS te representa",
    back: "← Atrás",
    restartBlock: "Reiniciar bloque",
    calculating: "Calculando…",
    most: "MÁS",
    least: "MENOS",
    reflectTitle: "Una última reflexión",
    reflectSubtitle:
      "Opcional. Tus palabras nos ayudan a interpretar y mejorar el cuestionario.",
    reflectLabel:
      "¿Te has reconocido en lo que has ido respondiendo? ¿Algo te ha sorprendido?",
    reflectPh: "Escribe aquí tu reflexión (opcional)…",
    skip: "Omitir",
    videoTitle: "Un último paso antes de tu informe",
    videoSubtitle: "Dedica un momento a este vídeo. Al terminar podrás ver tu informe.",
    seeReport: "Ver mi informe",
    error: "Error al calcular el resultado.",
    thanks: "¡Gracias por completar el cuestionario!",
    resultDesc:
      "Este es tu informe. Describe los recursos que sueles utilizar con más frecuencia. Puedes leerlo ahora; también lo tendrá tu facilitador.",
    downloadPdf: "↓ Descargar informe (PDF)",
    backHome: "← Volver al inicio",
    received:
      "Hemos recibido tus respuestas correctamente. Tu facilitador te hará llegar tu informe personalizado.",
  },
  report: {
    individual: "Informe individual",
    howToRead: "Cómo interpretar este informe",
    howToReadPre: "DISC GESEM describe los ",
    howToReadResources: "recursos",
    howToReadMid:
      " que sueles utilizar con más frecuencia y cómo pueden influir en tu forma de comunicarte, coordinarte y colaborar. ",
    howToReadNo: "No",
    howToReadPost:
      " es un test de personalidad ni un diagnóstico: describe tendencias, según tus respuestas, que pueden variar con el contexto y el momento.",
    principles: [
      "Ningún perfil es mejor que otro.",
      "El resultado muestra tendencias predominantes.",
      "Todos los recursos pueden desarrollarse.",
      "El verdadero valor aparece al comprender las diferencias.",
    ],
    readingIndexTitle: "En este informe · 5-8 min de lectura",
    tendencyPre: "Tu tendencia predominante",
    intensity: "Intensidad",
    internalCode: "Código interno",
    tendencyClose:
      "Como cualquier tendencia, esta puede variar según las circunstancias y ampliarse con la experiencia. Ningún estilo es mejor que otro: todos aportan valor y todos pueden desarrollar nuevas formas de actuar.",
    posicion: "Tu posición dentro del modelo DISC",
    posicionCaption: "Intensidad relativa de cada recurso, según tus respuestas:",
    tendencyDef: "Definición de tu tendencia",
    intFlexible: "Flexible",
    intModerada: "Moderada",
    intDefinida: "Definida",
    intMuyDefinida: "Muy definida",
    adaptableNote:
      "Perfil adaptable: repartes tu energía entre varios recursos, sin una tendencia marcada.",
    posicionNote:
      "Los recursos predominantes muestran las tendencias que aparecen con mayor frecuencia en tu manera de actuar y relacionarte. No representan capacidades fijas ni limitan tu forma de responder en otros contextos.",
    recursos: "Recursos predominantes",
    recursosLead:
      "Todas las personas disponen de los cuatro recursos. La diferencia suele estar en cuáles utilizamos con más frecuencia y en qué situaciones.",
    aportacion: "Aportación habitual",
    valoracion: "Lo que otras personas suelen valorar",
    valoracionLead: "Las personas de tu entorno suelen valorar especialmente:",
    valoracionNote:
      "Estas aportaciones pueden variar según el contexto, el momento y las personas con las que interactúas.",
    observar: "Aspectos que merece la pena observar",
    observarLead:
      "Como cualquier recurso, aquello que suele ayudarte en muchas situaciones también puede requerir ajustes en determinados contextos.",
    observarNote:
      "El objetivo no consiste en cambiar quién eres, sino en ampliar tu repertorio para responder con mayor flexibilidad a cada situación.",
    coordinacion: "Coordinación y colaboración",
    coordinacionBlurb:
      "Comprender tus recursos resulta especialmente útil cuando los utilizas de forma consciente con otras personas. Cada equipo necesita recursos diferentes: el valor aparece al reconocer qué aportas y qué necesitas de los demás.",
    coordinating: "Cuando coordinas personas o proyectos",
    collaborating: "Cuando colaboras con otras personas",
    contributions: "Lo que probablemente aportas",
    needs: "Lo que probablemente necesitas de otras personas",
    differences: "Cuando aparecen diferencias",
    contextos: "Contextos de mejor desempeño",
    contextosCaption: "Recurso que sueles activar en cada situación, según tus respuestas:",
    contextosHeatmap: "Intensidad de cada recurso por situación:",
    repertorio: "Ampliación de repertorio",
    repertorioLead:
      "Recursos menos habituales que puedes desarrollar para responder con más flexibilidad en distintas situaciones:",
    eq: "Equilibrio entre recursos (EQ)",
    reflexion: "Preguntas para la reflexión",
    reflexionLead:
      "Preguntas para llevarte a la conversación y trabajar en la sesión; no tienen respuesta correcta.",
    mapIntro:
      "El mapa sitúa los cuatro recursos en dos ejes: arriba/abajo (activo ↔ reflexivo) e izquierda/derecha (orientado a tareas ↔ a personas). Tu punto refleja la mezcla de tus recursos.",
    closing:
      "El autoconocimiento es el punto de partida. La comprensión mutua es el puente. La adaptación consciente es la competencia. La colaboración eficaz es el resultado.",
    methodNote:
      "DISC GESEM utiliza un modelo ipsativo de elección forzada inspirado en las cuatro dimensiones DISC. Describe tendencias de comportamiento en un momento determinado y constituye una herramienta de autoconocimiento y desarrollo. No es un diagnóstico clínico ni una evaluación de capacidades.",
    situacion: "Situación",
    graphsLead: "Tres lecturas de tu estilo, según tus respuestas:",
    graphPublic: "Yo público",
    graphPublicDesc:
      "Los comportamientos que eliges con más frecuencia al decidir cómo actuar ante los demás; la imagen conductual que tiendes a proyectar.",
    graphPrivate: "Yo privado",
    graphPrivateDesc:
      "Los recursos que eliges con menos frecuencia; ayuda a ver qué estilos usas menos de forma espontánea.",
    graphMirror: "Yo percibido",
    graphMirrorDesc:
      "El resultado neto del cuestionario; es la base de la interpretación narrativa del informe.",
    axisTop: "Activo · directo",
    axisBottom: "Reflexivo · sereno",
    axisLeft: "Orientado a tareas",
    axisRight: "Orientado a personas",
    interpSame: (style: string) =>
      `Te muestras y actúas de forma parecida: tu estilo ${style} aparece tanto de cara a los demás como en tu forma más instintiva.`,
    interpDiff: (pub: string, priv: string, perc: string) =>
      `De cara a los demás sueles apoyarte más en ${pub}; tu estilo más instintivo, bajo presión, tiende a ${priv}. Tu resultado integrado se apoya sobre todo en ${perc}.`,
    howGeneratedTitle: "Cómo se genera tu resultado",
    howGenerated: [
      "Se calcula a partir del patrón global de todas tus respuestas.",
      "El sistema identifica la combinación de recursos que predomina.",
      "Describe tendencias de comportamiento, no etiquetas permanentes.",
      "Es un punto de partida para el autoconocimiento y el desarrollo.",
    ],
    graphsHow: "Cómo se construye cada lectura:",
    graphPublicSrc: "a partir de tus elecciones «Más».",
    graphPrivateSrc: "a partir de tus elecciones «Menos».",
    graphMirrorSrc: "de la integración de ambas.",
    graphsNotThree:
      "Los tres resultados son complementarios: ofrecen perspectivas diferentes del mismo estilo conductual, no tres personalidades distintas.",
    introNoEval:
      "Muestra tus preferencias conductuales actuales; no evalúa capacidades, inteligencia ni rendimiento.",
    profileIntro:
      "Tu perfil combina tu recurso con mayor puntuación y el segundo predominante. No te etiqueta: describe una tendencia conductual.",
    intensityExplain:
      "La intensidad indica cuánto predomina tu recurso principal respecto al segundo. No expresa calidad, competencia ni rendimiento.",
    eqExplain:
      "Cuando las diferencias entre los cuatro recursos son muy pequeñas, el sistema identifica un Perfil Equilibrado (EQ): indica mayor flexibilidad para adaptarte a distintas situaciones, no un perfil mejor o peor.",
    contextsIntro:
      "Cada contexto muestra tu tendencia a usar ciertos recursos en distintas situaciones profesionales. Son valores descriptivos, no niveles de desempeño.",
    aportacionLead: "Lo que sueles aportar de forma natural y puedes potenciar:",
    dimensionsTitle: "Las cuatro dimensiones DISC",
    dimensionsIntro:
      "Todas las personas usamos los cuatro recursos en distinta medida. En DISC GESEM cada dimensión mantiene su letra DISC y su nombre en lenguaje de recursos:",
    dimensionItems: {
      D: { name: "Dominancia", recurso: "Impulsar", desc: "Acción y resultados: decidir con rapidez, asumir retos y hacer avanzar." },
      I: { name: "Influencia", recurso: "Conectar", desc: "Personas y comunicación: buscar interacción, generar entusiasmo y crear relación." },
      S: { name: "Estabilidad", recurso: "Sostener", desc: "Estabilidad y colaboración: mantener el ritmo, escuchar y dar continuidad." },
      C: { name: "Cumplimiento", recurso: "Estructurar", desc: "Rigor y calidad: analizar, cuidar el detalle y buscar precisión." },
    } as Record<string, { name: string; recurso: string; desc: string }>,
    nuanceTitle: "Tu combinación personal",
    nuanceLead:
      "Aunque compartas código de perfil con otras personas, tu combinación de matices es propia:",
    primaryLabel: "Recurso principal",
    secondaryLabel: "Recurso de apoyo",
    nuanceGap: (a: string, b: string, n: number) =>
      `Tu recurso principal (${a}) destaca ${n} puntos sobre el de apoyo (${b}).`,
    nuanceBalanced:
      "Tus recursos están muy equilibrados, sin una diferencia marcada entre ellos.",
    index: [
      "Tu posición dentro del modelo DISC",
      "Recursos predominantes",
      "Aportación habitual",
      "Lo que otras personas suelen valorar",
      "Aspectos que merece la pena observar",
      "Coordinación y colaboración",
      "Contextos de mejor desempeño",
      "Ampliación de repertorio",
      "Preguntas para la reflexión",
    ],
  },
  token: {
    invalidTitle: "Invitación no válida",
    invalidBody:
      "El enlace no existe o ha cambiado. Pide a tu facilitador que te reenvíe la invitación.",
    completedTitle: "Evaluación completada",
    completedBody:
      "Ya has completado este cuestionario. Tu facilitador puede compartir contigo el informe de resultados.",
    expiredTitle: "Invitación caducada",
    expiredBody:
      "Este enlace ha expirado. Solicita uno nuevo a tu facilitador para continuar.",
    goHome: "Ir al inicio",
    noneTitle: "No tienes evaluaciones pendientes",
    noneBody:
      "Tu cuenta no tiene ninguna evaluación asignada por ahora. Si crees que es un error, contacta con tu facilitador.",
    wrongAccountTitle: "Inicia sesión con tu cuenta",
    wrongAccountBody:
      "Esta invitación pertenece a otra cuenta. Cierra sesión e inicia con el correo al que llegó la invitación.",
  },
  panel: {
    title: "Tu espacio",
    hello: "Hola",
    subtitle: "Aquí tienes tus datos y tu evaluación DISC GESEM.",
    profileTitle: "Tu perfil",
    profileEmpty: "Todavía no has completado el cuestionario.",
    startCta: "Hacer el cuestionario",
    viewReport: "Ver mi informe",
    completedBadge: "Completado",
    distributionTitle: "Tu distribución de recursos",
    distributionHint: "Reparto proporcional de tu estilo (suma 100%).",
    summaryTitle: "En breve",
    contributionLabel: "Sueles aportar",
    valuedLabel: "Lo que suelen valorar de ti",
    eqTitle: "Equilibrio de recursos",
    eqHint: "Cómo combinas tus distintos recursos.",
    actionsTitle: "Acciones",
    heroPendingTitle: "Tu cuestionario te espera",
    heroPendingSubtitle: "Complétalo para ver aquí tu perfil.",
    intensityLabel: "Intensidad",
    eq: "Equilibrio de recursos (EQ)",
    primary: "Recurso principal",
    secondary: "Recurso de apoyo",
    accountTitle: "Tu cuenta",
    name: "Nombre",
    email: "Correo",
    organization: "Organización",
    team: "Equipo",
    statusLabel: "Estado",
    statusInvited: "Invitado",
    statusInProgress: "En curso",
    statusCompleted: "Completado",
    none: "—",
    securityTitle: "Contraseña",
    securityHint: "Cambia tu contraseña cuando quieras.",
    newPassword: "Nueva contraseña",
    repeatPassword: "Repite la contraseña",
    save: "Guardar contraseña",
    saved: "Contraseña actualizada ✓",
    tabOverview: "Resumen",
    tabGlossary: "Glosario",
    tabAccount: "Cuenta",
    tabSecurity: "Seguridad",
    tabPrivacy: "Privacidad",
    logout: "Cerrar sesión",
    completedOn: "Completado el",
    downloadPdf: "Descargar PDF",
    editName: "Editar nombre",
    namePlaceholder: "Tu nombre",
    saveName: "Guardar",
    nameSaved: "Nombre actualizado ✓",
    privacyTitle: "Privacidad",
    privacyHint: "Tus derechos sobre tus datos (RGPD).",
    downloadData: "Descargar mis datos",
    deleteTitle: "Eliminar mi cuenta",
    deleteButton: "Eliminar mi cuenta",
    deleteWarning:
      "Esto eliminará de forma permanente tu cuenta y tus resultados. No se puede deshacer. Escribe ELIMINAR para confirmar.",
    deleteConfirmPlaceholder: "Escribe ELIMINAR",
    deleteCancel: "Cancelar",
    notDiagnosis:
      "Los resultados describen tendencias de estilo y no constituyen un diagnóstico.",
  },
  inicio: {
    badge: "basado en el modelo DISC",
    heroH1a: "Descubre cómo",
    heroH1b: "trabaja",
    heroH1grad: "tu equipo",
    heroH1c: "de verdad",
    heroLead1:
      "Evaluación de estilos conductuales, informe individual con insights y mapa colectivo del equipo. ",
    heroLeadStrong: "De la invitación al plan de acción",
    heroLead2: ", en una sola plataforma.",
    ctaTry: "Probar la evaluación",
    ctaOrg: "Acceso para organizaciones",
    credPre: "Una herramienta de ",
    cred3c: "comunicación, coordinación y colaboración",
    statDims: "dimensiones",
    statCtx: "contextos",
    statItems: "ítems",
    statDur: "duración",
    mockReport: "Informe individual",
    mockHeadline: "Impulsar y movilizar",
    mockSub: "Tendencia definida · según tus respuestas",
    mockChip1: "Decisión y empuje en momentos de avance",
    mockChip2: "Reservar espacio para escuchar al equipo",
    mockQuestion: "Una pregunta para reflexionar",
    mockTeam: "Mapa de equipo",
    mockParticipation: "92% participación",
    mockEq: "Equilibrio",
    mockHeadlineMobile: "Impulsar + Conectar",
    mockSubMobile: "Impulsar y movilizar · según tus respuestas",
    howKicker: "Cómo funciona",
    howTitleA: "Del email de invitación",
    howTitleGrad: "al plan de acción",
    steps: [
      {
        title: "Invita a tu equipo",
        text: "Añade participantes uno a uno o pegando una lista desde Excel. Cada persona recibe su enlace personal por email.",
      },
      {
        title: "Responden en 15 minutos",
        text: "35 situaciones profesionales reales. El progreso se guarda solo: pueden parar y seguir en cualquier dispositivo.",
      },
      {
        title: "Informe y mapa de equipo",
        text: "Cada persona recibe su mapa de tendencias y tú ves el del equipo: estilos, complementariedad, vacíos y plan de acción.",
      },
    ],
    resultKicker: "El resultado",
    resultTitleA: "Dos entregables que",
    resultTitleGrad: "abren conversaciones",
    indReport: "Informe individual",
    indBadge: "12 apartados",
    indDesc:
      "Un mapa personal en clave de tendencia: claro, accionable y sin etiquetas cerradas.",
    reportBlocks: [
      "Tu tendencia predominante",
      "Recursos predominantes",
      "Aportación habitual",
      "Coordinación y colaboración",
      "Aspectos que merece la pena observar",
      "Preguntas para la reflexión",
    ],
    teamReport: "Mapa de equipo",
    teamBadge: "10 pantallas",
    teamDesc:
      "La foto colectiva: cómo se complementa el equipo por contexto y qué le falta en la mesa.",
    teamBlocks: [
      "Distribución de estilos del equipo",
      "Combinaciones y complementariedad",
      "Vacíos: lo que falta en la mesa",
      "Conversaciones recomendadas",
      "Plan de acción colectivo",
      "Exportación CSV y PDF",
    ],
    chips: [
      "Índice de equilibrio (EQ)",
      "Intensidad del perfil",
      "Insights automáticos",
      "Narrativas en lenguaje claro",
      "PDF · CSV · Email",
    ],
    modelKicker: "El modelo",
    modelTitleA: "Cuatro maneras de",
    modelTitleGrad: "aportar al equipo",
    modelDesc: (n: number) =>
      `Ningún estilo es mejor que otro: cada uno suma algo distinto. El cuestionario observa tus tendencias en ${n} contextos profesionales.`,
    platformKicker: "La plataforma",
    platformTitleA: "Todo lo que necesitas para",
    platformTitleGrad: "llevarlo a tu organización",
    features: [
      { title: "Invitaciones con un clic", text: "Email automático con enlace personal, reenvío y carga masiva desde una lista pegada." },
      { title: "Continúa donde lo dejaste", text: "El borrador se guarda en el navegador y en el servidor: cambia de dispositivo sin perder nada." },
      { title: "Informe que se entiende", text: "Sin jerga: qué recursos utilizas, qué merece la pena observar y preguntas para la reflexión." },
      { title: "Mapa de equipo", text: "Distribución de estilos, complementariedad, vacíos y conversaciones recomendadas." },
      { title: "Exporta y comparte", text: "Informe individual en PDF, mapa de equipo en CSV/PDF y envío por email al participante." },
      { title: "Multi-organización", text: "Clientes, proyectos y equipos separados, con roles de administrador y facilitador." },
    ],
    noteTitle: "Un punto de partida, no una etiqueta",
    noteBody:
      "DISC GESEM es un cuestionario de estilos conductuales alineado con las cuatro dimensiones del modelo DISC. Los resultados describen tendencias que pueden variar según el contexto y el momento, y no constituyen un diagnóstico: son una hipótesis de trabajo para la conversación y el desarrollo personal y de equipo.",
    ctaTitleA: "Pruébalo tú antes de",
    ctaTitleB: "invitar a tu equipo",
    ctaDesc:
      "La evaluación abierta es anónima y tarda unos 15 minutos. Verás el mismo informe que recibirá tu equipo.",
    ctaStart: "Comenzar evaluación →",
    ctaOrg2: "Soy una organización",
    footerDesc: (name: string, ver: string) =>
      `Plataforma de autoconocimiento conductual y desarrollo de equipos. ${name} v${ver}.`,
    footerProduct: "Producto",
    footerEval: "Evaluación",
    footerModel: "El modelo",
    footerOrgs: "Organizaciones",
    footerAccess: "Acceso",
    footerFacil: "Facilitadores",
    footerDisclaimer:
      "Los resultados describen tendencias conductuales y no constituyen un diagnóstico.",
    footerPrivacy: "Política de privacidad",
  },
};

const ca: typeof es = {
  langName: { ca: "Català", es: "Castellà" },
  nav: {
    howItWorks: "Com funciona",
    model: "El model",
    platform: "La plataforma",
    access: "Accedir",
    start: "Començar",
    myPanel: "El meu panell",
    logout: "Surt",
    privacy: "Privacitat",
    openMenu: "Obre el menú",
    closeMenu: "Tanca el menú",
  },
  intake: {
    title: "Avaluació DISC GESEM",
    subtitle:
      "Introdueix les teves dades per començar. El teu informe quedarà desat i podràs rebre'l per correu.",
    name: "Nom complet",
    namePh: "Ex. Anna García López",
    email: "Correu electrònic",
    emailPh: "Ex. anna@empresa.com",
    emailNote: "Només s'utilitzarà per enviar-te el teu informe si ho demanes.",
    submit: "Començar avaluació →",
    submitting: "Preparant el qüestionari…",
    methodNote:
      "Aquest qüestionari mesura estils de conducta, no trets clínics. Els resultats són tendències, no diagnòstics.",
  },
  quiz: {
    prep: "Preparació",
    hello: (name: string) => `Hola, ${name}`,
    introSubtitle: "Abans de començar, dedica un moment a entendre com funciona.",
    draftTitle: "Tens un qüestionari a mitges",
    draftBody: (n: number) =>
      `Hem desat el teu progrés (${n} ${n === 1 ? "bloc" : "blocs"} completats). Vols continuar on ho vas deixar?`,
    resume: "Continuar",
    startOver: "Començar de nou",
    instrPre: "A cada bloc toca primer la frase que ",
    instrMost: "més",
    instrMid: " et representa i després la que ",
    instrLeast: "menys",
    instrPost: ". El qüestionari ",
    instrAuto: "avança sol",
    instrKeys: "; a l'ordinador pots fer servir les tecles ",
    continue: "Continuar",
    howToAnswer:
      "A cada situació trobaràs quatre maneres diferents d'actuar. No hi ha respostes correctes o incorrectes. Tria només la que MÉS s'assembla a com sols actuar i la que MENYS s'assembla a tu; les altres dues no puntuen. Respon de manera espontània, pensant en com actues habitualment.",
    selfTitle: "Com et veus? (avaluació inicial)",
    selfSubtitle:
      "Aquests són els quatre estils del model DISC. Abans de començar, tria a priori amb quin t'identifiques més; en acabar el compararem amb el teu resultat real. És només un punt de partida: cap no és millor que un altre.",
    selfStart: "Començar el qüestionari",
    selfHints: {
      D: "Orientació a resultats i decisió",
      I: "Comunicació, energia i relació",
      S: "Cooperació, suport i constància",
      C: "Anàlisi, rigor i qualitat",
    },
    quizTitle: "Qüestionari",
    itemOf: (i: number, total: number) => `Ítem ${i} de ${total}`,
    completed: (n: number, pct: number) => `${n} completats · ${pct}%`,
    pickMost: "Toca la frase que MÉS et representa",
    pickLeast: "Ara toca la que MENYS et representa",
    back: "← Enrere",
    restartBlock: "Reinicia el bloc",
    calculating: "Calculant…",
    most: "MÉS",
    least: "MENYS",
    reflectTitle: "Una última reflexió",
    reflectSubtitle:
      "Opcional. Les teves paraules ens ajuden a interpretar i millorar el qüestionari.",
    reflectLabel:
      "T'has reconegut en el que has anat responent? Hi ha alguna cosa que t'hagi sorprès?",
    reflectPh: "Escriu aquí la teva reflexió (opcional)…",
    skip: "Omet",
    videoTitle: "Un últim pas abans del teu informe",
    videoSubtitle: "Dedica un moment a aquest vídeo. En acabar podràs veure el teu informe.",
    seeReport: "Veure el meu informe",
    error: "Error en calcular el resultat.",
    thanks: "Gràcies per completar el qüestionari!",
    resultDesc:
      "Aquest és el teu informe. Descriu els recursos que sols utilitzar amb més freqüència. Pots llegir-lo ara; també el tindrà el teu facilitador.",
    downloadPdf: "↓ Descarrega l'informe (PDF)",
    backHome: "← Torna a l'inici",
    received:
      "Hem rebut les teves respostes correctament. El teu facilitador et farà arribar el teu informe personalitzat.",
  },
  report: {
    individual: "Informe individual",
    howToRead: "Com interpretar aquest informe",
    howToReadPre: "DISC GESEM descriu els ",
    howToReadResources: "recursos",
    howToReadMid:
      " que sols utilitzar amb més freqüència i com poden influir en la teva manera de comunicar-te, coordinar-te i col·laborar. ",
    howToReadNo: "No",
    howToReadPost:
      " és un test de personalitat ni un diagnòstic: descriu tendències, segons les teves respostes, que poden variar amb el context i el moment.",
    principles: [
      "Cap perfil no és millor que un altre.",
      "El resultat mostra tendències predominants.",
      "Tots els recursos es poden desenvolupar.",
      "El veritable valor apareix en comprendre les diferències.",
    ],
    readingIndexTitle: "En aquest informe · 5-8 min de lectura",
    tendencyPre: "La teva tendència predominant",
    intensity: "Intensitat",
    internalCode: "Codi intern",
    tendencyClose:
      "Com qualsevol tendència, aquesta pot variar segons les circumstàncies i ampliar-se amb l'experiència. Cap estil no és millor que un altre: tots aporten valor i tots poden desenvolupar noves formes d'actuar.",
    posicion: "La teva posició dins del model DISC",
    posicionCaption: "Intensitat relativa de cada recurs, segons les teves respostes:",
    tendencyDef: "Definició de la teva tendència",
    intFlexible: "Flexible",
    intModerada: "Moderada",
    intDefinida: "Definida",
    intMuyDefinida: "Molt definida",
    adaptableNote:
      "Perfil adaptable: reparteixes la teva energia entre diversos recursos, sense una tendència marcada.",
    posicionNote:
      "Els recursos predominants mostren les tendències que apareixen amb més freqüència en la teva manera d'actuar i relacionar-te. No representen capacitats fixes ni limiten la teva manera de respondre en altres contextos.",
    recursos: "Recursos predominants",
    recursosLead:
      "Totes les persones disposen dels quatre recursos. La diferència sol estar en quins utilitzem amb més freqüència i en quines situacions.",
    aportacion: "Aportació habitual",
    valoracion: "El que les altres persones solen valorar",
    valoracionLead: "Les persones del teu entorn solen valorar especialment:",
    valoracionNote:
      "Aquestes aportacions poden variar segons el context, el moment i les persones amb qui interactues.",
    observar: "Aspectes que val la pena observar",
    observarLead:
      "Com qualsevol recurs, allò que sol ajudar-te en moltes situacions també pot requerir ajustos en determinats contextos.",
    observarNote:
      "L'objectiu no és canviar qui ets, sinó ampliar el teu repertori per respondre amb més flexibilitat a cada situació.",
    coordinacion: "Coordinació i col·laboració",
    coordinacionBlurb:
      "Comprendre els teus recursos resulta especialment útil quan els utilitzes de manera conscient amb altres persones. Cada equip necessita recursos diferents: el valor apareix en reconèixer què aportes i què necessites dels altres.",
    coordinating: "Quan coordines persones o projectes",
    collaborating: "Quan col·labores amb altres persones",
    contributions: "El que probablement aportes",
    needs: "El que probablement necessites d'altres persones",
    differences: "Quan apareixen diferències",
    contextos: "Contextos de millor exercici",
    contextosCaption: "Recurs que sols activar en cada situació, segons les teves respostes:",
    contextosHeatmap: "Intensitat de cada recurs per situació:",
    repertorio: "Ampliació del repertori",
    repertorioLead:
      "Recursos menys habituals que pots desenvolupar per respondre amb més flexibilitat en diferents situacions:",
    eq: "Equilibri entre recursos (EQ)",
    reflexion: "Preguntes per a la reflexió",
    reflexionLead:
      "Preguntes per endur-te a la conversa i treballar a la sessió; no tenen resposta correcta.",
    mapIntro:
      "El mapa situa els quatre recursos en dos eixos: amunt/avall (actiu ↔ reflexiu) i esquerra/dreta (orientat a tasques ↔ a persones). El teu punt reflecteix la barreja dels teus recursos.",
    closing:
      "L'autoconeixement és el punt de partida. La comprensió mútua és el pont. L'adaptació conscient és la competència. La col·laboració eficaç és el resultat.",
    methodNote:
      "DISC GESEM utilitza un model ipsatiu d'elecció forçada inspirat en les quatre dimensions DISC. Descriu tendències de comportament en un moment determinat i és una eina d'autoconeixement i desenvolupament. No és un diagnòstic clínic ni una avaluació de capacitats.",
    situacion: "Situació",
    graphsLead: "Tres lectures del teu estil, segons les teves respostes:",
    graphPublic: "Jo públic",
    graphPublicDesc:
      "Els comportaments que tries amb més freqüència en decidir com actuar davant els altres; la imatge conductual que tendeixes a projectar.",
    graphPrivate: "Jo privat",
    graphPrivateDesc:
      "Els recursos que tries amb menys freqüència; ajuda a veure quins estils fas servir menys de manera espontània.",
    graphMirror: "Jo percebut",
    graphMirrorDesc:
      "El resultat net del qüestionari; és la base de la interpretació narrativa de l'informe.",
    axisTop: "Actiu · directe",
    axisBottom: "Reflexiu · serè",
    axisLeft: "Orientat a tasques",
    axisRight: "Orientat a persones",
    interpSame: (style: string) =>
      `Et mostres i actues de manera semblant: el teu estil ${style} apareix tant de cara als altres com en la teva forma més instintiva.`,
    interpDiff: (pub: string, priv: string, perc: string) =>
      `De cara als altres sols recolzar-te més en ${pub}; el teu estil més instintiu, sota pressió, tendeix a ${priv}. El teu resultat integrat es recolza sobretot en ${perc}.`,
    howGeneratedTitle: "Com es genera el teu resultat",
    howGenerated: [
      "Es calcula a partir del patró global de totes les teves respostes.",
      "El sistema identifica la combinació de recursos que predomina.",
      "Descriu tendències de comportament, no etiquetes permanents.",
      "És un punt de partida per a l'autoconeixement i el desenvolupament.",
    ],
    graphsHow: "Com es construeix cada lectura:",
    graphPublicSrc: "a partir de les teves eleccions «Més».",
    graphPrivateSrc: "a partir de les teves eleccions «Menys».",
    graphMirrorSrc: "de la integració de totes dues.",
    graphsNotThree:
      "Els tres resultats són complementaris: ofereixen perspectives diferents del mateix estil conductual, no tres personalitats diferents.",
    introNoEval:
      "Mostra les teves preferències conductuals actuals; no avalua capacitats, intel·ligència ni rendiment.",
    profileIntro:
      "El teu perfil combina el teu recurs amb més puntuació i el segon predominant. No t'etiqueta: descriu una tendència conductual.",
    intensityExplain:
      "La intensitat indica com de predominant és el teu recurs principal respecte al segon. No expressa qualitat, competència ni rendiment.",
    eqExplain:
      "Quan les diferències entre els quatre recursos són molt petites, el sistema identifica un Perfil Equilibrat (EQ): indica més flexibilitat per adaptar-te a diferents situacions, no un perfil millor o pitjor.",
    contextsIntro:
      "Cada context mostra la teva tendència a fer servir certs recursos en diferents situacions professionals. Són valors descriptius, no nivells d'exercici.",
    aportacionLead: "El que sols aportar de manera natural i pots potenciar:",
    dimensionsTitle: "Les quatre dimensions DISC",
    dimensionsIntro:
      "Totes les persones fem servir els quatre recursos en diferent mesura. A DISC GESEM cada dimensió manté la seva lletra DISC i el seu nom en llenguatge de recursos:",
    dimensionItems: {
      D: { name: "Dominància", recurso: "Impulsar", desc: "Acció i resultats: decidir amb rapidesa, assumir reptes i fer avançar." },
      I: { name: "Influència", recurso: "Connectar", desc: "Persones i comunicació: buscar interacció, generar entusiasme i crear relació." },
      S: { name: "Estabilitat", recurso: "Sostenir", desc: "Estabilitat i col·laboració: mantenir el ritme, escoltar i donar continuïtat." },
      C: { name: "Compliment", recurso: "Estructurar", desc: "Rigor i qualitat: analitzar, cuidar el detall i buscar precisió." },
    } as Record<string, { name: string; recurso: string; desc: string }>,
    nuanceTitle: "La teva combinació personal",
    nuanceLead:
      "Encara que comparteixis codi de perfil amb altres persones, la teva combinació de matisos és pròpia:",
    primaryLabel: "Recurs principal",
    secondaryLabel: "Recurs de suport",
    nuanceGap: (a: string, b: string, n: number) =>
      `El teu recurs principal (${a}) destaca ${n} punts sobre el de suport (${b}).`,
    nuanceBalanced:
      "Els teus recursos estan molt equilibrats, sense una diferència marcada entre ells.",
    index: [
      "La teva posició dins del model DISC",
      "Recursos predominants",
      "Aportació habitual",
      "El que les altres persones solen valorar",
      "Aspectes que val la pena observar",
      "Coordinació i col·laboració",
      "Contextos de millor exercici",
      "Ampliació del repertori",
      "Preguntes per a la reflexió",
    ],
  },
  token: {
    invalidTitle: "Invitació no vàlida",
    invalidBody:
      "L'enllaç no existeix o ha canviat. Demana al teu facilitador que te'l torni a enviar.",
    completedTitle: "Avaluació completada",
    completedBody:
      "Ja has completat aquest qüestionari. El teu facilitador pot compartir amb tu l'informe de resultats.",
    expiredTitle: "Invitació caducada",
    expiredBody:
      "Aquest enllaç ha caducat. Demana'n un de nou al teu facilitador per continuar.",
    goHome: "Vés a l'inici",
    noneTitle: "No tens avaluacions pendents",
    noneBody:
      "El teu compte no té cap avaluació assignada de moment. Si creus que és un error, contacta amb el teu facilitador.",
    wrongAccountTitle: "Inicia sessió amb el teu compte",
    wrongAccountBody:
      "Aquesta invitació pertany a un altre compte. Tanca la sessió i inicia amb el correu al qual va arribar la invitació.",
  },
  panel: {
    title: "El teu espai",
    hello: "Hola",
    subtitle: "Aquí tens les teves dades i la teva avaluació DISC GESEM.",
    profileTitle: "El teu perfil",
    profileEmpty: "Encara no has completat el qüestionari.",
    startCta: "Fer el qüestionari",
    viewReport: "Veure el meu informe",
    completedBadge: "Completat",
    distributionTitle: "La teva distribució de recursos",
    distributionHint: "Repartiment proporcional del teu estil (suma 100%).",
    summaryTitle: "En breu",
    contributionLabel: "Acostumes a aportar",
    valuedLabel: "El que solen valorar de tu",
    eqTitle: "Equilibri de recursos",
    eqHint: "Com combines els teus diferents recursos.",
    actionsTitle: "Accions",
    heroPendingTitle: "El teu qüestionari t'espera",
    heroPendingSubtitle: "Completa'l per veure aquí el teu perfil.",
    intensityLabel: "Intensitat",
    eq: "Equilibri de recursos (EQ)",
    primary: "Recurs principal",
    secondary: "Recurs de suport",
    accountTitle: "El teu compte",
    name: "Nom",
    email: "Correu",
    organization: "Organització",
    team: "Equip",
    statusLabel: "Estat",
    statusInvited: "Convidat",
    statusInProgress: "En curs",
    statusCompleted: "Completat",
    none: "—",
    securityTitle: "Contrasenya",
    securityHint: "Canvia la teva contrasenya quan vulguis.",
    newPassword: "Nova contrasenya",
    repeatPassword: "Repeteix la contrasenya",
    save: "Desar contrasenya",
    saved: "Contrasenya actualitzada ✓",
    tabOverview: "Resum",
    tabGlossary: "Glossari",
    tabAccount: "Compte",
    tabSecurity: "Seguretat",
    tabPrivacy: "Privadesa",
    logout: "Tancar sessió",
    completedOn: "Completat el",
    downloadPdf: "Descarregar PDF",
    editName: "Editar nom",
    namePlaceholder: "El teu nom",
    saveName: "Desar",
    nameSaved: "Nom actualitzat ✓",
    privacyTitle: "Privadesa",
    privacyHint: "Els teus drets sobre les teves dades (RGPD).",
    downloadData: "Descarregar les meves dades",
    deleteTitle: "Eliminar el meu compte",
    deleteButton: "Eliminar el meu compte",
    deleteWarning:
      "Això eliminarà de manera permanent el teu compte i els teus resultats. No es pot desfer. Escriu ELIMINAR per confirmar.",
    deleteConfirmPlaceholder: "Escriu ELIMINAR",
    deleteCancel: "Cancel·lar",
    notDiagnosis:
      "Els resultats descriuen tendències d'estil i no constitueixen un diagnòstic.",
  },
  inicio: {
    badge: "basat en el model DISC",
    heroH1a: "Descobreix com",
    heroH1b: "treballa",
    heroH1grad: "el teu equip",
    heroH1c: "de veritat",
    heroLead1:
      "Avaluació d'estils de conducta, informe individual amb insights i mapa col·lectiu de l'equip. ",
    heroLeadStrong: "De la invitació al pla d'acció",
    heroLead2: ", en una sola plataforma.",
    ctaTry: "Provar l'avaluació",
    ctaOrg: "Accés per a organitzacions",
    credPre: "Una eina de ",
    cred3c: "comunicació, coordinació i col·laboració",
    statDims: "dimensions",
    statCtx: "contextos",
    statItems: "ítems",
    statDur: "durada",
    mockReport: "Informe individual",
    mockHeadline: "Impulsar i mobilitzar",
    mockSub: "Tendència definida · segons les teves respostes",
    mockChip1: "Decisió i empenta en moments d'avanç",
    mockChip2: "Reservar espai per escoltar l'equip",
    mockQuestion: "Una pregunta per reflexionar",
    mockTeam: "Mapa d'equip",
    mockParticipation: "92% participació",
    mockEq: "Equilibri",
    mockHeadlineMobile: "Impulsar + Connectar",
    mockSubMobile: "Impulsar i mobilitzar · segons les teves respostes",
    howKicker: "Com funciona",
    howTitleA: "De l'email d'invitació",
    howTitleGrad: "al pla d'acció",
    steps: [
      {
        title: "Convida el teu equip",
        text: "Afegeix participants un a un o enganxant una llista des d'Excel. Cada persona rep el seu enllaç personal per correu.",
      },
      {
        title: "Responen en 15 minuts",
        text: "35 situacions professionals reals. El progrés es desa sol: poden aturar-se i continuar en qualsevol dispositiu.",
      },
      {
        title: "Informe i mapa d'equip",
        text: "Cada persona rep el seu mapa de tendències i tu veus el de l'equip: estils, complementarietat, buits i pla d'acció.",
      },
    ],
    resultKicker: "El resultat",
    resultTitleA: "Dos lliurables que",
    resultTitleGrad: "obren converses",
    indReport: "Informe individual",
    indBadge: "12 apartats",
    indDesc:
      "Un mapa personal en clau de tendència: clar, accionable i sense etiquetes tancades.",
    reportBlocks: [
      "La teva tendència predominant",
      "Recursos predominants",
      "Aportació habitual",
      "Coordinació i col·laboració",
      "Aspectes que val la pena observar",
      "Preguntes per a la reflexió",
    ],
    teamReport: "Mapa d'equip",
    teamBadge: "10 pantalles",
    teamDesc:
      "La foto col·lectiva: com es complementa l'equip per context i què li falta a la taula.",
    teamBlocks: [
      "Distribució d'estils de l'equip",
      "Combinacions i complementarietat",
      "Buits: el que falta a la taula",
      "Converses recomanades",
      "Pla d'acció col·lectiu",
      "Exportació CSV i PDF",
    ],
    chips: [
      "Índex d'equilibri (EQ)",
      "Intensitat del perfil",
      "Insights automàtics",
      "Narratives en llenguatge clar",
      "PDF · CSV · Email",
    ],
    modelKicker: "El model",
    modelTitleA: "Quatre maneres de",
    modelTitleGrad: "aportar a l'equip",
    modelDesc: (n: number) =>
      `Cap estil no és millor que un altre: cadascun suma alguna cosa diferent. El qüestionari observa les teves tendències en ${n} contextos professionals.`,
    platformKicker: "La plataforma",
    platformTitleA: "Tot el que necessites per",
    platformTitleGrad: "portar-ho a la teva organització",
    features: [
      { title: "Invitacions amb un clic", text: "Email automàtic amb enllaç personal, reenviament i càrrega massiva des d'una llista enganxada." },
      { title: "Continua on ho vas deixar", text: "L'esborrany es desa al navegador i al servidor: canvia de dispositiu sense perdre res." },
      { title: "Informe que s'entén", text: "Sense argot: quins recursos utilitzes, què val la pena observar i preguntes per a la reflexió." },
      { title: "Mapa d'equip", text: "Distribució d'estils, complementarietat, buits i converses recomanades." },
      { title: "Exporta i comparteix", text: "Informe individual en PDF, mapa d'equip en CSV/PDF i enviament per correu al participant." },
      { title: "Multi-organització", text: "Clients, projectes i equips separats, amb rols d'administrador i facilitador." },
    ],
    noteTitle: "Un punt de partida, no una etiqueta",
    noteBody:
      "DISC GESEM és un qüestionari d'estils de conducta alineat amb les quatre dimensions del model DISC. Els resultats descriuen tendències que poden variar segons el context i el moment, i no constitueixen un diagnòstic: són una hipòtesi de treball per a la conversa i el desenvolupament personal i d'equip.",
    ctaTitleA: "Prova-ho tu abans",
    ctaTitleB: "de convidar el teu equip",
    ctaDesc:
      "L'avaluació oberta és anònima i triga uns 15 minuts. Veuràs el mateix informe que rebrà el teu equip.",
    ctaStart: "Començar avaluació →",
    ctaOrg2: "Soc una organització",
    footerDesc: (name: string, ver: string) =>
      `Plataforma d'autoconeixement de conducta i desenvolupament d'equips. ${name} v${ver}.`,
    footerProduct: "Producte",
    footerEval: "Avaluació",
    footerModel: "El model",
    footerOrgs: "Organitzacions",
    footerAccess: "Accés",
    footerFacil: "Facilitadors",
    footerDisclaimer:
      "Els resultats descriuen tendències de conducta i no constitueixen un diagnòstic.",
    footerPrivacy: "Política de privacitat",
  },
};

export const dict = { es, ca };
export type Dict = typeof es;

/** Devuelve el diccionario del idioma (con respaldo al idioma por defecto). */
export function getDict(lang: Lang): Dict {
  return dict[lang] ?? dict[DEFAULT_LANG];
}
