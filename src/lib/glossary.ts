import type { Lang } from "@/lib/i18n/dictionaries";

/**
 * Glosario DISC GESEM (bilingüe). Solo datos, sin estado. Respeta las reglas de
 * redacción: tendencias/recursos, sin diagnóstico ni etiquetas de valor.
 */

export interface GlossaryEntry {
  term: string;
  /** Recurso DISC asociado (para el chip de color), si aplica. */
  code?: "D" | "I" | "S" | "C";
  def: string;
}
export interface GlossaryGroup {
  title: string;
  entries: GlossaryEntry[];
}
export interface Glossary {
  intro: string;
  groups: GlossaryGroup[];
}

const ES: Glossary = {
  intro:
    "Estos términos describen tendencias de estilo conductual, no un diagnóstico. Te ayudan a leer tu informe DISC GESEM con más claridad.",
  groups: [
    {
      title: "El modelo",
      entries: [
        {
          term: "DISC GESEM",
          def: "Cuestionario de estilos conductuales basado en el modelo DISC, alineado conceptualmente con sus cuatro dimensiones. Describe tendencias de comportamiento —no rasgos clínicos ni capacidades— para el autoconocimiento, la comunicación y el desarrollo de equipos. No es un diagnóstico.",
        },
        {
          term: "Recurso conductual",
          def: "Cada una de las cuatro formas de responder que todas las personas usamos en distinta medida: Impulsar, Conectar, Sostener y Estructurar. Hablamos de “recursos” (no de tipos) porque se combinan y se desarrollan según el contexto.",
        },
      ],
    },
    {
      title: "Los cuatro recursos",
      entries: [
        { term: "Impulsar", code: "D", def: "Recurso orientado a la acción y los resultados: suele decidir con rapidez, asumir retos y hacer avanzar." },
        { term: "Conectar", code: "I", def: "Recurso orientado a las personas y la comunicación: tiende a buscar interacción, generar entusiasmo y crear relación." },
        { term: "Sostener", code: "S", def: "Recurso orientado a la estabilidad y la colaboración: tiende a mantener el ritmo, escuchar y dar continuidad." },
        { term: "Estructurar", code: "C", def: "Recurso orientado al rigor y la calidad: suele analizar, cuidar el detalle y buscar precisión." },
      ],
    },
    {
      title: "Tu resultado",
      entries: [
        { term: "Tendencia predominante", def: "El recurso (o combinación) que, según tus respuestas, sueles usar con más frecuencia. Es una hipótesis de trabajo, no una etiqueta; puede variar con el contexto." },
        { term: "Patrón predominante", def: "Combinación de tus dos recursos principales (p. ej. Impulsar + Conectar) que describe tu estilo más habitual." },
        { term: "Patrón equilibrado (EQ)", def: "Cuando ningún recurso destaca con claridad y tiendes a repartir tu comportamiento entre varios. No es mejor ni peor que un patrón marcado: describe una forma más flexible de responder." },
        { term: "Intensidad", def: "Cuánto se marca tu tendencia: alta = estilo más definido; baja = estilo más matizado. No mide calidad ni eficacia." },
        { term: "Repertorio", def: "El conjunto de recursos que tienes disponibles. “Ampliar el repertorio” es desarrollar los menos habituales para responder mejor en más situaciones." },
        { term: "Contexto", def: "La situación concreta (equipo, tarea, presión…) que influye en qué recurso usas. Tu estilo puede cambiar de un contexto a otro." },
        { term: "Adaptación", def: "Ajuste consciente del comportamiento a lo que pide una situación o persona. La distancia entre tu Yo Público y tu Yo Privado da pistas de cuánto sueles adaptarte." },
      ],
    },
    {
      title: "Las tres lecturas",
      entries: [
        { term: "Yo Público", def: "Cómo sueles mostrarte y adaptarte ante los demás. Se construye con tus elecciones “Más”; es el que más varía según el entorno." },
        { term: "Yo Privado", def: "Tu estilo más instintivo, el que tiende a aparecer bajo presión. Se construye con tus elecciones “Menos”; es el más estable." },
        { term: "Yo Percibido", def: "La integración de ambos: cómo tiendes a comportarte de forma habitual. Es la lectura que se usa para la narrativa. No son tres personalidades distintas, sino tres miradas del mismo estilo." },
      ],
    },
  ],
};

const CA: Glossary = {
  intro:
    "Aquests termes descriuen tendències d'estil conductual, no un diagnòstic. T'ajuden a llegir el teu informe DISC GESEM amb més claredat.",
  groups: [
    {
      title: "El model",
      entries: [
        {
          term: "DISC GESEM",
          def: "Qüestionari d'estils conductuals basat en el model DISC, alineat conceptualment amb les seves quatre dimensions. Descriu tendències de comportament —no trets clínics ni capacitats— per a l'autoconeixement, la comunicació i el desenvolupament d'equips. No és un diagnòstic.",
        },
        {
          term: "Recurs conductual",
          def: "Cadascuna de les quatre maneres de respondre que totes les persones fem servir en diferent mesura: Impulsar, Connectar, Sostenir i Estructurar. Parlem de “recursos” (no de tipus) perquè es combinen i es desenvolupen segons el context.",
        },
      ],
    },
    {
      title: "Els quatre recursos",
      entries: [
        { term: "Impulsar", code: "D", def: "Recurs orientat a l'acció i els resultats: sol decidir amb rapidesa, assumir reptes i fer avançar." },
        { term: "Connectar", code: "I", def: "Recurs orientat a les persones i la comunicació: tendeix a buscar interacció, generar entusiasme i crear relació." },
        { term: "Sostenir", code: "S", def: "Recurs orientat a l'estabilitat i la col·laboració: tendeix a mantenir el ritme, escoltar i donar continuïtat." },
        { term: "Estructurar", code: "C", def: "Recurs orientat al rigor i la qualitat: sol analitzar, cuidar el detall i buscar precisió." },
      ],
    },
    {
      title: "El teu resultat",
      entries: [
        { term: "Tendència predominant", def: "El recurs (o combinació) que, segons les teves respostes, sols fer servir amb més freqüència. És una hipòtesi de treball, no una etiqueta; pot variar amb el context." },
        { term: "Patró predominant", def: "Combinació dels teus dos recursos principals (p. ex. Impulsar + Connectar) que descriu el teu estil més habitual." },
        { term: "Patró equilibrat (EQ)", def: "Quan cap recurs destaca amb claredat i tendeixes a repartir el teu comportament entre diversos. No és millor ni pitjor que un patró marcat: descriu una manera més flexible de respondre." },
        { term: "Intensitat", def: "Com de marcada és la teva tendència: alta = estil més definit; baixa = estil més matisat. No mesura qualitat ni eficàcia." },
        { term: "Repertori", def: "El conjunt de recursos que tens disponibles. “Ampliar el repertori” és desenvolupar els menys habituals per respondre millor en més situacions." },
        { term: "Context", def: "La situació concreta (equip, tasca, pressió…) que influeix en quin recurs fas servir. El teu estil pot canviar d'un context a un altre." },
        { term: "Adaptació", def: "Ajust conscient del comportament al que demana una situació o persona. La distància entre el teu Jo Públic i el teu Jo Privat dona pistes de quant sols adaptar-te." },
      ],
    },
    {
      title: "Les tres lectures",
      entries: [
        { term: "Jo Públic", def: "Com sols mostrar-te i adaptar-te davant els altres. Es construeix amb les teves eleccions “Més”; és el que més varia segons l'entorn." },
        { term: "Jo Privat", def: "El teu estil més instintiu, el que tendeix a aparèixer sota pressió. Es construeix amb les teves eleccions “Menys”; és el més estable." },
        { term: "Jo Percebut", def: "La integració de tots dos: com tendeixes a comportar-te de manera habitual. És la lectura que es fa servir per a la narrativa. No són tres personalitats diferents, sinó tres mirades del mateix estil." },
      ],
    },
  ],
};

/** Devuelve el glosario en el idioma indicado. */
export function getGlossary(lang: Lang): Glossary {
  return lang === "ca" ? CA : ES;
}
