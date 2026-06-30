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
    eq: "Equilibrio entre recursos (EQ)",
    reflexion: "Preguntas para la reflexión",
    closing:
      "El autoconocimiento es el punto de partida. La comprensión mutua es el puente. La adaptación consciente es la competencia. La colaboración eficaz es el resultado.",
    methodNote:
      "Este informe describe tendencias de interacción según tus respuestas y puede variar con el contexto y el momento. No constituye un diagnóstico, sino un punto de partida para la conversación y el desarrollo.",
    situacion: "Situación",
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
    eq: "Equilibri entre recursos (EQ)",
    reflexion: "Preguntes per a la reflexió",
    closing:
      "L'autoconeixement és el punt de partida. La comprensió mútua és el pont. L'adaptació conscient és la competència. La col·laboració eficaç és el resultat.",
    methodNote:
      "Aquest informe descriu tendències d'interacció segons les teves respostes i pot variar amb el context i el moment. No constitueix un diagnòstic, sinó un punt de partida per a la conversa i el desenvolupament.",
    situacion: "Situació",
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
  },
};

export const dict = { es, ca };
export type Dict = typeof es;

/** Devuelve el diccionario del idioma (con respaldo al idioma por defecto). */
export function getDict(lang: Lang): Dict {
  return dict[lang] ?? dict[DEFAULT_LANG];
}
