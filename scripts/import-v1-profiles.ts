/**
 * Importa la Biblioteca Narrativa V1 (texto editorial validado) de los perfiles
 * ya entregados a narrative_entries (scope "BLOCK"), apartado por apartado.
 *
 * Perfiles incluidos: CI, IC, CS, SD, DS, EQ (6 de 13). Faltan DI, ID, DC, CD,
 * IS, SI, SC. Cada perfil aporta los 8 apartados canónicos; el bloque 9
 * "reflexion" no se toca (se conserva lo ya sembrado).
 *
 * Uso:  npx tsx scripts/import-v1-profiles.ts            (marca PUBLISHED)
 *       npx tsx scripts/import-v1-profiles.ts --draft    (deja en DRAFT)
 */
import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1,
  }),
});

const P = (...paras: string[]) => paras.join("\n\n");

/** 6 perfiles × 8 apartados canónicos (texto V1 íntegro). */
const PROFILES: Record<string, Record<string, string>> = {
  CI: {
    tendencia: P(
      "Las personas con predominancia CI suelen caracterizarse por una combinación equilibrada entre el pensamiento analítico y la capacidad para compartir conocimiento de manera cercana y comprensible. Habitualmente encuentran motivación en aquellos entornos donde pueden comprender en profundidad una realidad, estructurar la información y contribuir al desarrollo de otras personas mediante explicaciones claras, fundamentadas y útiles.",
      "Su primera tendencia suele orientarse hacia la comprensión. Antes de expresar una opinión o proponer una solución, acostumbran a observar, analizar y contrastar información para construir un criterio propio. Esta necesidad de comprender no responde únicamente al deseo de precisión, sino también al compromiso de aportar respuestas que resulten consistentes y generen valor.",
      "Una vez alcanzado ese nivel de comprensión, el perfil CI suele mostrar una notable capacidad para comunicar. Comparte ideas con claridad, adapta el mensaje a las necesidades de cada interlocutor y procura que el conocimiento pueda transformarse en aprendizaje y aplicación práctica.",
      "Su influencia no acostumbra a surgir del entusiasmo inmediato, sino de la credibilidad que transmite al combinar preparación, reflexión y una comunicación accesible. Esta combinación favorece una presencia profesional que inspira confianza y facilita el intercambio de conocimiento dentro de los equipos.",
    ),
    recursos: P(
      "Uno de los recursos más representativos del perfil CI es su capacidad para integrar análisis y comunicación.",
      "Habitualmente dedica tiempo a comprender los problemas en profundidad, organizar la información disponible y construir explicaciones que facilitan la toma de decisiones o el aprendizaje de otras personas.",
      "También suele destacar por su pensamiento estructurado. Acostumbra a identificar relaciones entre diferentes elementos, ordenar ideas complejas y convertir conceptos abstractos en propuestas claras y aplicables.",
      "Otro recurso especialmente relevante es su capacidad para aprender de manera continua. Con frecuencia muestra interés por ampliar conocimientos, revisar evidencias y mantenerse actualizado, incorporando nuevas perspectivas que enriquecen su trabajo y sus aportaciones.",
      "Además, suele comunicar desde la serenidad, generando conversaciones donde predominan la escucha, el respeto por diferentes opiniones y la búsqueda de soluciones fundamentadas.",
    ),
    aportacion: P(
      "Dentro de un equipo, el perfil CI suele desempeñar un papel especialmente relevante facilitando comprensión y claridad.",
      "Con frecuencia ayuda a organizar información dispersa, aporta criterios para analizar situaciones complejas y favorece que las decisiones se apoyen en argumentos consistentes.",
      "También acostumbra a contribuir al aprendizaje colectivo compartiendo conocimiento, explicando procesos y facilitando que otras personas comprendan aspectos técnicos o conceptuales que inicialmente pueden resultar difíciles.",
      "Su capacidad para combinar precisión y comunicación permite conectar el análisis con la aplicación práctica, fortaleciendo tanto la calidad de las decisiones como el desarrollo de las personas.",
    ),
    valoracion: P(
      "Las personas que colaboran con un perfil CI suelen destacar la solidez de sus aportaciones y la claridad con la que comparte aquello que conoce.",
      "Es habitual que valoren su preparación, su capacidad para explicar cuestiones complejas de forma comprensible y la confianza que transmite cuando fundamenta sus planteamientos.",
      "También suelen reconocer su disposición para ayudar, responder preguntas y acompañar procesos de aprendizaje sin imponer su punto de vista.",
      "Con frecuencia es percibido como alguien reflexivo, accesible y comprometido con generar comprensión antes que convencer.",
    ),
    observar: P(
      "Precisamente porque este perfil concede una gran importancia al conocimiento y al rigor, en determinadas situaciones puede dedicar más tiempo del necesario a profundizar en una cuestión antes de compartir una propuesta.",
      "Su deseo de ofrecer respuestas bien fundamentadas puede llevarle ocasionalmente a revisar información de forma reiterada o a retrasar determinadas decisiones mientras continúa perfeccionando su análisis.",
      "Asimismo, puede resultar útil recordar que existen contextos donde una explicación sintética o una decisión suficientemente fundamentada aportan más valor que una respuesta completamente desarrollada.",
      "Desarrollar una mayor comodidad para actuar con información razonablemente suficiente, simplificar determinados mensajes y aceptar que el aprendizaje también se produce durante la acción suele ampliar significativamente su capacidad de influencia.",
    ),
    coordinacion: P(
      "El perfil CI suele desenvolverse especialmente bien en equipos donde el intercambio de conocimiento, el pensamiento crítico y la mejora continua forman parte de la cultura de trabajo.",
      "Habitualmente contribuye organizando información, aportando criterios de análisis y facilitando conversaciones donde las decisiones se construyen sobre argumentos compartidos.",
      "Acostumbra a complementarse especialmente bien con perfiles más orientados a la acción o a la movilización de personas, aportando profundidad, estructura y una perspectiva que ayuda a consolidar las iniciativas antes de su puesta en marcha.",
      "Cuando el entorno valora el aprendizaje y la calidad de las decisiones, este perfil suele convertirse en una referencia por la solidez de sus aportaciones.",
    ),
    contextos: P(
      "Las personas con predominancia CI suelen expresar su máximo potencial en entornos donde el análisis, la transferencia de conocimiento y la comunicación técnica constituyen una parte importante del trabajo.",
      "La consultoría, la formación especializada, la investigación aplicada, el diseño instruccional, la planificación estratégica, la gestión del conocimiento, la mejora de procesos o cualquier función que requiera comprender, organizar y compartir información suelen ofrecer escenarios especialmente adecuados para este estilo conductual.",
      "También acostumbran a aportar un elevado valor en organizaciones que promueven el aprendizaje continuo y la toma de decisiones fundamentadas.",
    ),
    ampliacion: P(
      "Como cualquier tendencia conductual, este perfil desarrolla todo su potencial cuando incorpora nuevas formas de responder a situaciones diversas sin renunciar a aquello que constituye su principal fortaleza.",
      "En este caso, desarrollar una mayor agilidad para comunicar ideas en fases tempranas, priorizar la sencillez cuando el contexto lo requiere y asumir que determinadas decisiones deberán tomarse con información incompleta puede fortalecer significativamente su contribución.",
      "Asimismo, equilibrar la profundidad del análisis con una mayor orientación hacia la experimentación favorece que el conocimiento no solo explique la realidad, sino que también impulse su transformación.",
      "Cuando el pensamiento crítico, el rigor y la capacidad para compartir conocimiento se integran con iniciativa, flexibilidad y orientación a la acción, el perfil CI despliega una influencia serena, sólida y especialmente valiosa para el aprendizaje, la innovación y el desarrollo sostenible de las organizaciones.",
    ),
  },

  IC: {
    tendencia: P(
      "Las personas con predominancia IC suelen combinar una marcada facilidad para relacionarse con los demás con un interés natural por comprender en profundidad aquello que comunican. Habitualmente encuentran motivación en aquellos entornos donde pueden compartir ideas, generar conexiones entre las personas y aportar propuestas fundamentadas que contribuyan al desarrollo de proyectos y equipos.",
      "Su manera de actuar acostumbra a ser abierta, participativa y curiosa. Disfrutan intercambiando perspectivas, explorando nuevas posibilidades y enriqueciendo las conversaciones mediante argumentos, información y experiencias que aportan valor. A diferencia de otros perfiles predominantemente orientados a la influencia, suelen dedicar tiempo a preparar sus planteamientos antes de compartirlos, buscando que sus aportaciones resulten tanto inspiradoras como consistentes.",
      "Este perfil suele sentirse cómodo aprendiendo de manera continua. La incorporación del factor Conciencia favorece una actitud analítica que complementa su facilidad para comunicar, permitiéndole desarrollar una influencia basada no solo en el entusiasmo, sino también en la credibilidad.",
      "Su combinación de curiosidad, capacidad relacional y rigor hace que con frecuencia actúe como un puente entre el conocimiento y las personas, favoreciendo que las ideas complejas puedan comprenderse y aplicarse con mayor facilidad.",
    ),
    recursos: P(
      "Uno de los recursos más representativos del perfil IC es su capacidad para comunicar con claridad contenidos que requieren reflexión o un cierto nivel de complejidad.",
      "Habitualmente combina habilidades sociales con una preparación cuidadosa de la información, procurando que sus mensajes resulten comprensibles, estructurados y adaptados a las necesidades de cada interlocutor.",
      "También suele destacar por su interés constante por aprender. Con frecuencia busca ampliar conocimientos, actualizar información y comprender diferentes perspectivas antes de construir una opinión propia. Esta actitud favorece una comunicación fundamentada y una influencia basada en argumentos sólidos.",
      "Otro recurso especialmente relevante es su creatividad estructurada. Acostumbra a generar nuevas ideas, pero también a valorar su viabilidad, procurando encontrar un equilibrio entre innovación y consistencia.",
      "Además, suele desenvolverse con facilidad en entornos colaborativos donde el intercambio de conocimiento constituye un elemento esencial para avanzar.",
    ),
    aportacion: P(
      "Dentro de un equipo, el perfil IC suele contribuir conectando personas, ideas y conocimiento.",
      "Con frecuencia facilita que la información circule de manera comprensible, ayuda a transformar conceptos complejos en propuestas aplicables y favorece conversaciones que enriquecen la toma de decisiones.",
      "También acostumbra a desempeñar un papel relevante en procesos de aprendizaje, innovación y mejora continua, aportando una combinación especialmente valiosa entre creatividad, análisis y capacidad de comunicación.",
      "Su presencia suele estimular la curiosidad del equipo y favorecer una cultura donde compartir conocimiento forma parte del trabajo cotidiano.",
      "Más allá de la comunicación, acostumbra a impulsar decisiones mejor fundamentadas mediante preguntas, reflexiones y aportaciones que amplían la perspectiva colectiva.",
    ),
    valoracion: P(
      "Las personas que trabajan con un perfil IC suelen destacar su capacidad para explicar ideas con claridad y hacer accesibles temas que inicialmente pueden parecer complejos.",
      "Es habitual que valoren su curiosidad, su disposición para aprender de manera continua y la calidad de las conversaciones que genera dentro del equipo.",
      "También suelen reconocer su capacidad para combinar cercanía con rigor, aportando propuestas que resultan creativas sin perder consistencia.",
      "Con frecuencia es percibido como alguien que inspira confianza porque fundamenta sus opiniones, escucha diferentes perspectivas y procura construir soluciones mediante el diálogo y el conocimiento compartido.",
    ),
    observar: P(
      "Precisamente porque este perfil disfruta explorando nuevas ideas y profundizando en el conocimiento, en determinadas situaciones puede dedicar más tiempo del previsto a preparar una propuesta antes de compartirla.",
      "Su interés por comunicar con precisión puede llevarle ocasionalmente a ampliar excesivamente las explicaciones o a incorporar un nivel de detalle superior al que realmente necesita el contexto.",
      "Asimismo, la búsqueda de argumentos sólidos puede retrasar determinadas decisiones cuando considera que todavía existen aspectos por comprender o analizar.",
      "Desarrollar una mayor comodidad para adaptar el nivel de profundidad a cada situación y aceptar que no todas las conversaciones requieren el mismo grado de preparación suele ampliar significativamente su capacidad de influencia.",
    ),
    coordinacion: P(
      "El perfil IC suele desenvolverse especialmente bien en equipos donde el aprendizaje, la innovación y el intercambio de conocimiento forman parte de la cultura de trabajo.",
      "Habitualmente facilita la colaboración compartiendo información, promoviendo conversaciones enriquecedoras y ayudando a construir puentes entre perspectivas diferentes.",
      "Acostumbra a complementarse especialmente bien con perfiles más orientados a la ejecución, aportando reflexión, creatividad y una visión integradora que favorece decisiones mejor fundamentadas.",
      "Cuando el entorno valora tanto las personas como el conocimiento, este perfil suele convertirse en un dinamizador del aprendizaje colectivo.",
    ),
    contextos: P(
      "Las personas con predominancia IC suelen expresar su máximo potencial en entornos donde comunicar, aprender y generar conocimiento forman parte esencial de la actividad.",
      "La formación, la consultoría, la facilitación, la innovación, el diseño de experiencias de aprendizaje, la comunicación, el desarrollo organizativo, el marketing estratégico o cualquier función donde resulte necesario transformar información en comprensión compartida suelen ofrecer escenarios especialmente adecuados para este estilo conductual.",
      "También acostumbran a aportar un elevado valor en organizaciones que impulsan la mejora continua, la transferencia de conocimiento y la construcción de culturas de aprendizaje.",
    ),
    ampliacion: P(
      "Como cualquier tendencia conductual, este perfil incrementa su capacidad de adaptación cuando incorpora nuevas formas de responder a situaciones diversas sin perder aquello que constituye su principal fortaleza.",
      "En este caso, desarrollar una mayor agilidad para compartir ideas incluso cuando todavía se encuentran en construcción, simplificar determinados mensajes cuando el contexto lo requiere y priorizar la acción una vez alcanzado un nivel suficiente de información puede fortalecer significativamente su contribución.",
      "Asimismo, combinar su capacidad de análisis con una mayor orientación hacia la ejecución favorece que las ideas no solo inspiren, sino que también se conviertan en resultados concretos.",
      "Cuando la curiosidad, la capacidad de comunicación y el rigor intelectual se integran con decisión, síntesis y orientación a la acción, el perfil IC despliega una influencia especialmente sólida, creíble y transformadora para las personas, los equipos y las organizaciones.",
    ),
  },

  CS: {
    tendencia: P(
      "Las personas con predominancia CS suelen caracterizarse por una forma de actuar metódica, reflexiva y orientada a desarrollar un trabajo consistente. Habitualmente encuentran motivación en aquellos entornos donde pueden comprender con claridad qué se espera de ellas, organizar su actividad con criterio y contribuir a resultados fiables mediante una ejecución rigurosa y constante.",
      "Su primera tendencia suele dirigirse hacia el análisis y la comprensión de las situaciones. Antes de actuar acostumbran a observar el contexto, reunir información y valorar las diferentes alternativas con el propósito de minimizar errores y tomar decisiones fundamentadas. Esta aproximación favorece una manera de trabajar estructurada y orientada a la calidad.",
      "Al mismo tiempo, la influencia del factor Estabilidad aporta una marcada preferencia por la continuidad, la cooperación y la previsibilidad. Habitualmente valoran los entornos donde las relaciones son respetuosas, los procesos están definidos y existe tiempo suficiente para desarrollar el trabajo con profundidad.",
      "Más que buscar protagonismo o asumir riesgos innecesarios, el perfil CS suele orientarse a construir soluciones sólidas, sostenibles y bien fundamentadas, aportando seguridad tanto a los proyectos como a las personas con las que colabora.",
    ),
    recursos: P(
      "Uno de los recursos más característicos de este perfil es su capacidad para desarrollar un trabajo preciso y bien organizado.",
      "Habitualmente presta atención a los detalles que pueden influir en la calidad del resultado final, revisa cuidadosamente la información disponible y procura mantener elevados estándares en las tareas que desarrolla.",
      "También suele destacar por su planificación. Acostumbra a estructurar el trabajo de manera ordenada, anticipar necesidades y establecer procedimientos que favorecen una ejecución consistente y previsible.",
      "Otro recurso especialmente relevante es su fiabilidad. Cuando asume una responsabilidad, suele desarrollarla con un alto nivel de compromiso, respetando los acuerdos alcanzados y manteniendo una actitud constante incluso en proyectos de larga duración.",
      "Además, acostumbra a combinar el pensamiento analítico con una disposición colaborativa que facilita el trabajo conjunto y contribuye a generar relaciones profesionales basadas en la confianza.",
    ),
    aportacion: P(
      "Dentro de un equipo, el perfil CS suele aportar rigor, organización y estabilidad.",
      "Con frecuencia ayuda a estructurar procesos, clarificar procedimientos y mantener una forma de trabajar que favorece la continuidad y la calidad de los resultados. Su presencia suele reducir la incertidumbre y contribuir a que el equipo avance con mayor seguridad.",
      "También acostumbra a desempeñar un papel relevante en la revisión de información, la identificación de posibles riesgos y la mejora de los sistemas de trabajo. Su capacidad para observar aspectos que otras personas podrían pasar por alto incrementa la solidez de las decisiones colectivas.",
      "Su contribución suele hacerse visible a través de la consistencia con la que desarrolla su trabajo y de la confianza que genera en quienes colaboran con él.",
    ),
    valoracion: P(
      "Las personas que trabajan con un perfil CS suelen destacar su responsabilidad, su organización y el elevado nivel de calidad que imprime a las tareas que desarrolla.",
      "Es habitual que valoren la serenidad con la que analiza las situaciones, su capacidad para mantener los compromisos y la seguridad que transmite cuando participa en proyectos que requieren precisión.",
      "También suelen reconocer su disposición para colaborar desde el respeto y la discreción, favoreciendo un clima de trabajo estable donde las responsabilidades se desarrollan con claridad.",
      "Con frecuencia es percibido como alguien meticuloso, fiable y coherente, cuya presencia aporta orden y confianza al conjunto del equipo.",
    ),
    observar: P(
      "Precisamente porque este perfil concede una gran importancia a la calidad y a la planificación, en determinadas situaciones puede necesitar más tiempo para sentirse preparado antes de iniciar una acción.",
      "Su deseo de reducir la incertidumbre puede llevarle ocasionalmente a revisar la información en varias ocasiones o a posponer decisiones mientras continúa perfeccionando determinados aspectos del trabajo.",
      "Asimismo, la búsqueda de precisión puede hacer que dedique un esfuerzo considerable a detalles cuyo impacto final resulta limitado en relación con los objetivos generales.",
      "Incorporar una mayor flexibilidad para diferenciar aquello que requiere máxima exactitud de aquello que admite soluciones suficientemente eficaces, así como aceptar que determinadas decisiones deberán tomarse con información incompleta, suele ampliar su capacidad de adaptación sin comprometer la calidad de sus aportaciones.",
    ),
    coordinacion: P(
      "El perfil CS suele desenvolverse especialmente bien en equipos donde existen procesos definidos, expectativas claras y un clima basado en el respeto profesional.",
      "Habitualmente facilita la coordinación mediante una comunicación ordenada, el seguimiento de acuerdos y una elevada fiabilidad en el cumplimiento de las responsabilidades asumidas.",
      "Su capacidad para combinar análisis, organización y sensibilidad hacia las relaciones favorece la colaboración con perfiles muy diversos, especialmente cuando el equipo reconoce el valor complementario de diferentes formas de trabajar.",
      "También suele contribuir a consolidar procedimientos que permiten mantener la calidad y la continuidad de los proyectos a medio y largo plazo.",
    ),
    contextos: P(
      "Las personas con predominancia CS suelen expresar su máximo potencial en entornos donde la precisión, la planificación y la estabilidad constituyen elementos esenciales para el éxito del trabajo.",
      "Las funciones relacionadas con la gestión de calidad, la coordinación técnica, la planificación, la auditoría, la administración, el análisis de información, la documentación, la mejora de procesos o cualquier actividad que requiera organización y seguimiento constante suelen ofrecer escenarios especialmente adecuados para este estilo conductual.",
      "También acostumbran a aportar un elevado valor en organizaciones que buscan consolidar procedimientos, reducir riesgos y garantizar la consistencia de sus resultados.",
    ),
    ampliacion: P(
      "Como cualquier tendencia conductual, este perfil incrementa su capacidad de adaptación cuando incorpora nuevos recursos sin perder aquello que constituye su principal fortaleza.",
      "En este caso, desarrollar una mayor agilidad en determinadas decisiones, sentirse más cómodo experimentando soluciones nuevas cuando el contexto lo permite y comunicar con mayor rapidez sus criterios profesionales puede enriquecer notablemente su contribución.",
      "Del mismo modo, reconocer que la mejora continua también incluye aprender durante la ejecución, además de hacerlo antes de actuar, favorece un equilibrio especialmente valioso entre precisión y capacidad de respuesta.",
      "Cuando el rigor, la planificación y la búsqueda de calidad se integran con una mayor flexibilidad, confianza para actuar y apertura al cambio, el perfil CS despliega una aportación especialmente consistente, fiable y orientada a construir resultados duraderos para las personas, los equipos y la organización.",
    ),
  },

  SD: {
    tendencia: P(
      "Las personas con predominancia SD suelen combinar una marcada orientación hacia la estabilidad con una capacidad natural para asumir responsabilidades cuando la situación lo requiere. Habitualmente encuentran motivación en aquellos entornos donde pueden contribuir al funcionamiento del equipo desde la constancia, la cooperación y una forma de actuar serena, incorporando la determinación necesaria para avanzar cuando existe un propósito claro.",
      "Su primera tendencia suele dirigirse a comprender el contexto y preservar el equilibrio del grupo. Antes de actuar acostumbran a observar cómo afectan las decisiones a las personas implicadas, procurando mantener relaciones de confianza y un entorno de trabajo estable. Sin embargo, cuando consideran que ha llegado el momento de avanzar, suelen asumir la iniciativa con firmeza y compromiso.",
      "Este perfil no acostumbra a buscar el liderazgo desde el protagonismo, sino desde la responsabilidad. Con frecuencia ejerce influencia a través de la coherencia entre lo que dice y lo que hace, generando confianza mediante una presencia constante y una actitud orientada al cumplimiento de los compromisos.",
      "Su combinación de estabilidad y determinación favorece una manera de trabajar que transmite seguridad al equipo y facilita que los proyectos evolucionen de forma ordenada y sostenible.",
    ),
    recursos: P(
      "Uno de los recursos más característicos del perfil SD es su capacidad para mantener la continuidad de los proyectos sin perder de vista los objetivos establecidos.",
      "Habitualmente combina paciencia con capacidad de decisión, lo que le permite acompañar los procesos respetando el ritmo de las personas y, al mismo tiempo, impulsar las acciones necesarias para que el trabajo avance.",
      "También suele destacar por su sentido de la responsabilidad. Cuando asume un compromiso procura desarrollarlo con constancia, mostrando una elevada implicación tanto en la calidad del trabajo como en el bienestar del equipo.",
      "Otro recurso especialmente valioso es su capacidad para generar confianza. Su comportamiento suele transmitir serenidad, equilibrio y fiabilidad, favoreciendo relaciones profesionales estables y una colaboración basada en el respeto mutuo.",
      "Además, acostumbra a organizar el trabajo con criterio, manteniendo un seguimiento constante que contribuye a consolidar los resultados a largo plazo.",
    ),
    aportacion: P(
      "Dentro de un equipo, el perfil SD suele desempeñar un papel relevante como elemento de estabilidad y continuidad.",
      "Con frecuencia facilita que los acuerdos se mantengan en el tiempo, favorece el cumplimiento de los compromisos y ayuda a transformar las decisiones en acciones sostenidas. Su presencia aporta equilibrio entre la necesidad de avanzar y la importancia de mantener relaciones de trabajo saludables.",
      "También suele contribuir a crear entornos donde las personas conocen sus responsabilidades y disponen de un marco claro para desarrollar su actividad. Su forma de coordinar acostumbra a generar confianza porque combina cercanía con una orientación práctica hacia los resultados.",
      "En momentos de incertidumbre, este perfil suele aportar serenidad y una capacidad especialmente valiosa para mantener el rumbo sin precipitación.",
    ),
    valoracion: P(
      "Las personas que trabajan con un perfil SD suelen destacar su coherencia, su compromiso y la tranquilidad que transmite en el desarrollo cotidiano de los proyectos.",
      "Es habitual que valoren su disposición para colaborar, la responsabilidad con la que asume sus funciones y la confianza que genera cuando es necesario afrontar situaciones complejas.",
      "También suelen reconocer su capacidad para mantener la estabilidad del equipo sin renunciar a la consecución de los objetivos. Su manera de actuar favorece que las personas se sientan acompañadas, al mismo tiempo que perciben una dirección clara sobre el camino que debe seguirse.",
      "Con frecuencia es percibido como alguien cercano, constante y firme cuando las circunstancias requieren tomar decisiones.",
    ),
    observar: P(
      "Precisamente porque este perfil concede una gran importancia a la estabilidad y a las relaciones de confianza, en determinadas situaciones puede dedicar más tiempo del necesario a construir consenso antes de adoptar decisiones que afectan al equipo.",
      "Su deseo de preservar un clima de colaboración puede hacer que posponga conversaciones difíciles o que asuma responsabilidades adicionales para evitar sobrecargar a otras personas.",
      "Asimismo, puede resultar beneficioso recordar que determinadas circunstancias requieren actuar con mayor rapidez y que expresar desacuerdos de manera clara también contribuye al desarrollo saludable de las relaciones profesionales.",
      "Desarrollar una mayor comodidad ante escenarios de cambio acelerado y diferenciar entre prudencia y demora suele fortalecer significativamente su capacidad de liderazgo.",
    ),
    coordinacion: P(
      "El perfil SD suele desenvolverse especialmente bien en equipos donde predominan la confianza, la cooperación y una comunicación respetuosa.",
      "Habitualmente contribuye a consolidar la coordinación mediante el seguimiento constante de los compromisos y una actitud orientada a facilitar el trabajo conjunto. Su forma de relacionarse favorece la estabilidad del grupo y ayuda a mantener la cohesión incluso cuando aparecen situaciones de presión.",
      "Acostumbra a complementarse especialmente bien con perfiles más orientados a la innovación, la creatividad o el análisis, aportando continuidad, organización y capacidad para transformar las decisiones en resultados sostenibles.",
      "Cuando el entorno combina objetivos claros con relaciones sólidas, este perfil suele convertirse en un referente de equilibrio y consistencia.",
    ),
    contextos: P(
      "Las personas con predominancia SD suelen expresar su máximo potencial en entornos donde resulta importante coordinar personas, mantener procesos estables y avanzar de forma organizada hacia objetivos compartidos.",
      "Las funciones relacionadas con la coordinación de equipos, la supervisión, la gestión de operaciones, la atención a personas, la dirección de servicios, la gestión de proyectos o cualquier actividad que requiera continuidad y responsabilidad suelen ofrecer escenarios especialmente adecuados para este estilo conductual.",
      "También acostumbran a aportar un elevado valor en procesos de consolidación organizativa, crecimiento sostenido y acompañamiento de equipos.",
    ),
    ampliacion: P(
      "Como cualquier tendencia conductual, este perfil desarrolla todo su potencial cuando incorpora nuevas formas de responder a contextos diferentes sin perder aquello que constituye su principal fortaleza.",
      "En este caso, desarrollar una mayor agilidad para actuar cuando las circunstancias cambian con rapidez, expresar con mayor anticipación sus propias necesidades y asumir decisiones complejas sin esperar siempre a disponer de un consenso amplio puede incrementar significativamente su capacidad de influencia.",
      "Del mismo modo, reservar espacios para explorar nuevas alternativas antes de consolidar procedimientos favorece una mayor flexibilidad sin comprometer la estabilidad que caracteriza a este perfil.",
      "Cuando la serenidad, el compromiso y la capacidad para generar confianza se integran con una mayor iniciativa, rapidez de decisión y apertura al cambio, el perfil SD despliega una forma de liderazgo equilibrada, cercana y especialmente eficaz para acompañar a las personas mientras impulsa el avance de la organización.",
    ),
  },

  DS: {
    tendencia: P(
      "Las personas con predominancia DS suelen combinar una clara orientación hacia los resultados con una forma de actuar serena, constante y respetuosa con las personas que las rodean. Habitualmente encuentran motivación en aquellos entornos donde pueden asumir responsabilidades, impulsar proyectos y alcanzar objetivos sin renunciar a la construcción de relaciones de confianza y colaboración.",
      "Su tendencia natural las lleva a actuar con decisión cuando consideran que existe un propósito claro. No obstante, a diferencia de otros perfiles más impulsivos, acostumbran a valorar el impacto de sus decisiones sobre el equipo y procuran avanzar manteniendo un equilibrio entre la eficacia y la estabilidad de las relaciones.",
      "Este perfil suele sentirse cómodo asumiendo responsabilidades, organizando recursos y facilitando que las personas avancen hacia objetivos compartidos. La combinación entre iniciativa y constancia favorece una manera de trabajar que transmite seguridad y continuidad, incluso en situaciones de cambio o presión.",
      "Más que buscar protagonismo, suele orientar su energía hacia la consecución de resultados sostenibles, entendiendo que el compromiso de las personas constituye un elemento esencial para alcanzar objetivos duraderos.",
    ),
    recursos: P(
      "Uno de los recursos más representativos del perfil DS es su capacidad para mantener el rumbo incluso cuando aparecen dificultades. Habitualmente combina iniciativa con perseverancia, favoreciendo que los proyectos avancen de manera constante sin perder de vista los objetivos establecidos.",
      "También suele destacar por su sentido de la responsabilidad. Cuando asume un compromiso procura desarrollarlo con determinación, organizando el trabajo de forma práctica y favoreciendo que las personas dispongan de un marco claro para colaborar.",
      "Otro recurso especialmente valioso es su capacidad para generar confianza desde la coherencia. Su comportamiento suele transmitir estabilidad, firmeza y previsibilidad, aspectos que facilitan el trabajo conjunto y fortalecen la seguridad del equipo.",
      "Además, acostumbra a mantener una comunicación directa pero respetuosa, procurando expresar sus expectativas con claridad sin perder de vista las necesidades de quienes participan en el proyecto.",
    ),
    aportacion: P(
      "Dentro de un equipo, el perfil DS suele desempeñar un papel especialmente relevante impulsando el avance de los proyectos desde una perspectiva organizada y colaborativa.",
      "Con frecuencia ayuda a establecer prioridades, coordinar esfuerzos y mantener el compromiso colectivo incluso cuando las circunstancias exigen constancia a largo plazo. Su presencia favorece que las decisiones se traduzcan en acciones sostenidas y que los objetivos no se diluyan con el paso del tiempo.",
      "También suele contribuir a generar un clima de trabajo estable donde las personas conocen sus responsabilidades y disponen de un marco claro para desarrollar su actividad.",
      "Su combinación de firmeza y cercanía facilita una forma de liderazgo basada tanto en la consecución de resultados como en la construcción de relaciones de confianza.",
    ),
    valoracion: P(
      "Las personas que colaboran con un perfil DS suelen destacar su capacidad para asumir responsabilidades con serenidad y mantener el compromiso incluso en situaciones complejas.",
      "Es habitual que valoren la claridad con la que establece objetivos, la coherencia entre sus decisiones y su disposición para apoyar al equipo cuando resulta necesario.",
      "También suelen reconocer su capacidad para combinar exigencia con respeto, favoreciendo un entorno donde las personas saben qué se espera de ellas y perciben que pueden contar con un referente estable durante el desarrollo del proyecto.",
      "Con frecuencia es percibido como alguien fiable, constante y orientado a construir resultados sólidos sin generar una presión innecesaria sobre el equipo.",
    ),
    observar: P(
      "Precisamente porque este perfil busca equilibrar resultados y estabilidad, en determinadas situaciones puede asumir una carga de responsabilidad superior a la que le corresponde con el propósito de garantizar que el proyecto avance correctamente.",
      "Su deseo de mantener la cohesión también puede hacer que retrase determinadas conversaciones difíciles o que dedique más tiempo del necesario a facilitar acuerdos antes de tomar una decisión.",
      "Asimismo, puede resultar útil diferenciar aquellas situaciones que requieren consenso de aquellas que necesitan una actuación rápida y decidida. Incorporar una mayor flexibilidad para adaptar su estilo al contexto suele incrementar tanto la eficacia como la capacidad de influencia.",
      "Del mismo modo, reservar espacios para delegar responsabilidades y favorecer una mayor autonomía del equipo contribuye a desarrollar todo el potencial colectivo.",
    ),
    coordinacion: P(
      "El perfil DS suele desenvolverse especialmente bien en equipos donde existen objetivos claros, relaciones de confianza y una cultura basada en la colaboración.",
      "Habitualmente facilita la coordinación combinando organización, cercanía y orientación a resultados. Su forma de liderar suele generar estabilidad, ya que procura mantener una comunicación clara y un seguimiento constante del trabajo compartido.",
      "Acostumbra a complementarse especialmente bien con perfiles más creativos o analíticos, aportando continuidad, capacidad de decisión y una visión práctica orientada a convertir las ideas en resultados sostenibles.",
      "Cuando el equipo dispone de un propósito compartido y responsabilidades bien definidas, este perfil suele convertirse en un elemento que impulsa el avance sin comprometer la cohesión.",
    ),
    contextos: P(
      "Las personas con predominancia DS suelen expresar su máximo potencial en entornos donde resulta necesario combinar liderazgo, organización y trabajo colaborativo.",
      "La coordinación de equipos, la gestión de proyectos, la dirección operativa, la mejora de procesos, la supervisión de servicios, la gestión de personas o cualquier función donde sea importante alcanzar objetivos manteniendo relaciones estables suelen ofrecer escenarios especialmente adecuados para este estilo conductual.",
      "También acostumbran a aportar un elevado valor en organizaciones que atraviesan procesos de crecimiento o transformación y necesitan avanzar sin perder la cohesión interna.",
    ),
    ampliacion: P(
      "Como cualquier tendencia conductual, este perfil amplía su capacidad de adaptación cuando incorpora nuevas formas de responder a contextos diversos sin perder aquello que constituye su esencia.",
      "En este caso, desarrollar una mayor comodidad para delegar decisiones, aceptar distintos ritmos de trabajo y expresar con mayor claridad las expectativas antes de asumir responsabilidades adicionales puede fortalecer significativamente su contribución.",
      "Asimismo, incorporar espacios para la reflexión estratégica antes de actuar y reconocer que determinadas situaciones requieren explorar alternativas antes de decidir favorece un equilibrio especialmente valioso entre acción y sostenibilidad.",
      "Cuando la determinación, la constancia y el compromiso con las personas se integran con flexibilidad, capacidad de delegación y apertura a nuevas perspectivas, el perfil DS despliega una forma de liderazgo cercana, firme y especialmente orientada a construir resultados sólidos y duraderos.",
    ),
  },

  EQ: {
    tendencia: P(
      "El perfil EQ representa una distribución equilibrada de las tendencias conductuales evaluadas por el modelo DISC GESEM. En este resultado no se observa una predominancia claramente definida de uno de los cuatro factores principales, sino una presencia relativamente homogénea de todos ellos. Esta configuración suele traducirse en una elevada capacidad para adaptar la forma de actuar a las características de cada situación, las necesidades del entorno y las personas con las que interactúa.",
      "Las personas con este perfil acostumbran a desenvolverse con flexibilidad ante contextos diversos. Pueden mostrar iniciativa cuando las circunstancias requieren avanzar, dedicar tiempo al análisis cuando la complejidad lo aconseja, priorizar la colaboración cuando el equipo lo necesita o mantener la estabilidad en momentos de incertidumbre. Más que responder desde una única tendencia preferente, suelen ajustar su comportamiento a las demandas de cada contexto.",
      "Esta capacidad adaptativa favorece una visión amplia de las situaciones y permite comprender con relativa facilidad perspectivas diferentes. Con frecuencia encuentran puntos de encuentro entre personas con estilos diversos y contribuyen a generar espacios de diálogo donde las distintas formas de trabajar pueden complementarse.",
      "No obstante, esta flexibilidad no implica ausencia de preferencias personales, sino una menor intensidad relativa en comparación con los perfiles donde uno o dos factores predominan claramente.",
    ),
    recursos: P(
      "Uno de los recursos más característicos del perfil EQ es su capacidad para adaptarse a contextos cambiantes sin perder el equilibrio en su forma de actuar.",
      "Habitualmente puede modificar su estilo de comunicación, ajustar su nivel de participación y responder con diferentes estrategias según las necesidades de la situación. Esta flexibilidad facilita la colaboración con perfiles muy diversos y favorece una integración natural dentro de equipos multidisciplinares.",
      "También suele destacar por su capacidad para comprender perspectivas diferentes. Con frecuencia identifica las ventajas de distintas formas de afrontar un mismo reto, contribuyendo a generar decisiones más integradoras y consensuadas.",
      "Otro recurso especialmente valioso es su versatilidad. Puede desenvolverse con comodidad en funciones variadas, asumir responsabilidades diversas y adaptarse a cambios organizativos con relativa facilidad.",
      "Además, acostumbra a mostrar una actitud abierta hacia el aprendizaje y una disposición favorable para incorporar nuevas formas de trabajar cuando el contexto lo requiere.",
    ),
    aportacion: P(
      "Dentro de un equipo, el perfil EQ suele aportar equilibrio y capacidad de integración.",
      "Con frecuencia facilita la colaboración entre personas con estilos conductuales diferentes, ayudando a comprender distintas perspectivas y favoreciendo que las decisiones tengan en cuenta tanto los resultados como las necesidades de las personas y la calidad de los procesos.",
      "También acostumbra a desempeñar un papel relevante en situaciones donde resulta necesario adaptar el estilo de comunicación, mediar entre diferentes posiciones o contribuir a mantener una visión global de los proyectos.",
      "Su capacidad para ajustarse a contextos diversos favorece una colaboración flexible y facilita la coordinación en equipos donde conviven formas muy distintas de trabajar.",
    ),
    valoracion: P(
      "Las personas que colaboran con un perfil EQ suelen destacar su capacidad para comprender diferentes puntos de vista y adaptarse con naturalidad a las circunstancias.",
      "Es habitual que valoren su actitud abierta, la facilidad con la que establece relaciones de colaboración y la serenidad con la que aborda situaciones cambiantes.",
      "También suelen reconocer su disposición para escuchar, su flexibilidad y la ausencia de posiciones excesivamente rígidas, aspectos que favorecen la construcción de acuerdos y el entendimiento entre personas con perspectivas diferentes.",
      "Con frecuencia es percibido como alguien accesible, equilibrado y capaz de encontrar soluciones que integran distintas sensibilidades.",
    ),
    observar: P(
      "Precisamente porque este perfil dispone de una elevada capacidad de adaptación, en determinadas situaciones puede necesitar dedicar un tiempo adicional para identificar cuál es la respuesta más adecuada cuando existen diferentes alternativas igualmente válidas.",
      "La ausencia de una tendencia claramente predominante puede hacer que, ocasionalmente, resulte más complejo priorizar una dirección concreta o mantener una posición firme cuando el contexto presenta demandas contradictorias.",
      "Asimismo, la facilidad para comprender diferentes perspectivas puede llevar a posponer decisiones mientras continúa valorando nuevas posibilidades o intentando integrar todos los puntos de vista.",
      "En determinados momentos puede resultar especialmente útil definir criterios claros de priorización, identificar qué estilo resulta más eficaz para cada situación y asumir que no todas las decisiones permitirán satisfacer simultáneamente todas las expectativas.",
    ),
    coordinacion: P(
      "El perfil EQ suele desenvolverse especialmente bien en equipos diversos, donde la complementariedad entre diferentes estilos constituye una fortaleza.",
      "Habitualmente favorece la comunicación entre personas con preferencias conductuales distintas, facilitando el entendimiento y contribuyendo a crear un clima de colaboración respetuoso.",
      "Su flexibilidad le permite adaptar la forma de relacionarse según las características de cada interlocutor, fortaleciendo la coordinación y reduciendo posibles malentendidos derivados de diferentes estilos de comunicación.",
      "También acostumbra a aportar una visión integradora que ayuda al equipo a mantener el equilibrio entre innovación, análisis, ejecución y colaboración.",
    ),
    contextos: P(
      "Las personas con perfil EQ suelen expresar su máximo potencial en entornos donde la adaptabilidad, la colaboración y la capacidad para integrar perspectivas diversas constituyen elementos importantes del trabajo.",
      "La coordinación transversal, la gestión de proyectos multidisciplinares, la facilitación de equipos, la consultoría, la atención a personas, la gestión del cambio o cualquier función donde resulte necesario comprender diferentes realidades y adaptar el estilo de actuación suelen ofrecer escenarios especialmente adecuados para este perfil.",
      "También acostumbran a aportar un elevado valor en organizaciones que promueven la colaboración entre áreas, la innovación compartida y el aprendizaje continuo.",
    ),
    ampliacion: P(
      "Como cualquier resultado conductual, el perfil EQ incrementa su capacidad de adaptación cuando desarrolla una mayor conciencia sobre las tendencias que activa con más frecuencia en función del contexto y del papel que desempeña.",
      "En este caso, identificar qué preferencias resultan más útiles para cada situación, reforzar la confianza en las propias decisiones y asumir posiciones claras cuando las circunstancias lo requieren puede potenciar significativamente su contribución.",
      "Del mismo modo, reconocer que la flexibilidad alcanza su máximo valor cuando se combina con criterios consistentes de actuación favorece una forma de colaborar todavía más eficaz.",
      "El principal valor del perfil EQ reside en su capacidad para integrar perspectivas, adaptarse a contextos diversos y contribuir al equilibrio de los equipos. Cuando esta versatilidad se acompaña de claridad en la toma de decisiones y de una mayor conciencia sobre el propio estilo de actuación, se convierte en una aportación especialmente valiosa para favorecer la colaboración, el aprendizaje y el desarrollo sostenible de las organizaciones.",
    ),
  },
};

async function main() {
  const draft = process.argv.includes("--draft");
  const status = draft ? "DRAFT" : "PUBLISHED";
  let ok = 0;
  for (const [profile, blocks] of Object.entries(PROFILES)) {
    for (const [blockId, text] of Object.entries(blocks)) {
      const key = `${profile}:${blockId}`;
      const existing = await prisma.narrativeEntry.findUnique({
        where: { scope_key_locale: { scope: "BLOCK", key, locale: "es" } },
        select: { version: true },
      });
      await prisma.narrativeEntry.upsert({
        where: { scope_key_locale: { scope: "BLOCK", key, locale: "es" } },
        update: {
          content: { text } as Prisma.InputJsonValue,
          status: status as "DRAFT" | "PUBLISHED",
          author: "Biblioteca V1",
          version: (existing?.version ?? 0) + 1,
        },
        create: {
          scope: "BLOCK",
          key,
          locale: "es",
          content: { text } as Prisma.InputJsonValue,
          status: status as "DRAFT" | "PUBLISHED",
          author: "Biblioteca V1",
          version: 1,
        },
      });
      ok++;
    }
  }
  console.log(
    `Importados ${ok} apartados (${Object.keys(PROFILES).length} perfiles × 8) como ${status}.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
