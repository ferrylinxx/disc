/**
 * Traducción catalana de las narrativas por recurso (RESOURCE_NARRATIVES) y de
 * las etiquetas de contexto del informe individual. Misma estructura que la
 * versión española; se usa cuando el idioma es catalán.
 */
import type { ResourceNarrative } from "./disc-gesem.profiles";

export const RESOURCE_NARRATIVES_CA: Record<string, ResourceNarrative> = {
  D: {
    resources: [
      { name: "Iniciativa", description: "Tendeix a posar en marxa accions i activar decisions sense necessitat d'estímuls externs constants." },
      { name: "Orientació a resultats", description: "Sol dirigir l'atenció cap a objectius, avenços i assoliment de fites." },
      { name: "Influència", description: "Tendeix a mobilitzar altres persones i a empènyer les situacions cap endavant." },
    ],
    contribution:
      "En equips i projectes, sol aportar impuls, direcció i capacitat per desbloquejar situacions. Sovint contribueix a mantenir el focus en els objectius i que les coses avancin.",
    valued:
      "Les persones del seu entorn solen apreciar la seva capacitat per prendre decisions, la seva orientació a l'acció i la seva disposició a assumir iniciatives quan una situació requereix impuls.",
    coordinating:
      "Quan coordina persones o projectes, sol aportar energia i claredat d'objectius, i facilita que les decisions es converteixin en accions. Val la pena observar que no totes les persones necessiten el mateix ritme.",
    collaborating:
      "Quan col·labora, tendeix a aportar dinamisme i a mantenir el moviment. En contextos amb ritmes diferents, pot ser útil dedicar més espai a escoltar i a integrar perspectives diferents.",
    communication:
      "La seva comunicació sol ser directa i orientada a l'acció. En determinats contextos, pot ser útil comprovar que el missatge s'ha comprès i no només escoltat.",
    contexts:
      "Els seus recursos solen desplegar-se amb més facilitat en entorns dinàmics, amb marge per decidir, influir i convertir les idees en accions.",
    valuedItems: [
      "La teva capacitat per impulsar l'acció.",
      "La claredat de les teves decisions.",
      "L'energia que transmets.",
      "La teva orientació als resultats.",
      "La teva disposició a assumir iniciatives.",
    ],
    observe: [
      "Com equilibres velocitat i participació quan altres persones necessiten més temps.",
      "Quan convé escoltar i contrastar abans de tancar una decisió.",
      "L'impacte que un ritme molt alt pot tenir en la resta de l'equip.",
      "Com sostens el seguiment dels detalls.",
      "Quan convé revisar terminis i expectatives amb calma.",
    ],
    repertoire:
      "Ampliar el repertori pot consistir a incorporar espais d'anàlisi abans de tancar decisions i a donar més atenció al seguiment quan el context ho requereix.",
    reflection: [
      "Quins recursos reconeixes amb més claredat en la teva manera habitual de treballar i relacionar-te?",
      "En quines situacions aquests recursos t'han ajudat especialment a generar resultats o a mobilitzar altres persones?",
      "Quines altres maneres d'actuar podrien complementar els teus recursos quan el context o les persones ho requereixen?",
      "Què necessites habitualment de les persones amb qui treballes per coordinar-te millor?",
      "Què poden necessitar de tu les persones amb un estil diferent del teu?",
    ],
    teamContributions: [
      "Impulsar l'acció i l'avenç.",
      "Afavorir la presa de decisions.",
      "Generar energia i moviment.",
      "Mobilitzar altres persones.",
      "Orientar l'equip cap als objectius.",
    ],
    teamAppreciates: [
      "Claredat en els objectius.",
      "Persones que aportin anàlisi i rigor.",
      "Seguiment dels acords.",
      "Espais per escoltar altres perspectives.",
    ],
    differences:
      "Les diferències de ritme o de prioritats poden generar tensions naturals en qualsevol equip. Comprendre-les ajuda a equilibrar la velocitat amb la reflexió i a convertir-les en oportunitats de col·laboració.",
  },
  I: {
    resources: [
      { name: "Influència", description: "Capacitat per mobilitzar i generar adhesió a través de la comunicació i la interacció." },
      { name: "Energia relacional", description: "Tendeix a buscar interacció, intercanvi i connexió amb altres persones." },
      { name: "Comunicació", description: "Facilita expressar idees, transmetre missatges i afavorir la interacció entre persones." },
      { name: "Optimisme", description: "Sol enfocar-se en possibilitats, oportunitats i escenaris favorables." },
    ],
    contribution:
      "Sol aportar entusiasme, capacitat per connectar persones i per generar participació al voltant de noves idees o iniciatives. Sovint ajuda a crear un clima de confiança.",
    valued:
      "Les persones del seu entorn solen valorar la seva proximitat, la seva facilitat per comunicar i la seva capacitat per implicar altres persones i mantenir una mirada optimista davant els reptes.",
    coordinating:
      "Quan coordina, sol recolzar-se en la relació i la comunicació per mobilitzar. Val la pena observar com transforma l'entusiasme en acords concrets i en seguiment sostingut.",
    collaborating:
      "Quan col·labora, tendeix a afavorir la participació i el bon clima. Pot ser útil mantenir el focus i la claredat quan conviuen moltes perspectives.",
    communication:
      "La seva comunicació sol ser expressiva i propera, i afavoreix la connexió. En contextos que requereixen concreció, pot ser útil acompanyar-la de claredat i priorització.",
    contexts:
      "Els seus recursos solen desplegar-se amb més facilitat en entorns relacionals, participatius i amb espai per a la interacció i la creativitat.",
    valuedItems: [
      "La teva proximitat i la teva facilitat per comunicar.",
      "La teva capacitat per connectar les persones.",
      "L'entusiasme que generes.",
      "La teva mirada optimista davant els reptes.",
      "La teva facilitat per implicar altres persones.",
    ],
    observe: [
      "Com converteixes les converses en acords concrets i accions sostingudes.",
      "Quan convé prioritzar el focus davant l'amplitud de perspectives.",
      "Com mantens la claredat quan hi ha moltes converses obertes.",
      "Com equilibres la proximitat amb la concreció.",
      "Quan convé aterrar les idees en compromisos.",
    ],
    repertoire:
      "Ampliar el repertori pot consistir a recolzar-se en estructura i seguiment per donar continuïtat al que es posa en marxa.",
    reflection: [
      "Quins recursos reconeixes amb més claredat en la teva manera de comunicar i relacionar-te?",
      "En quines situacions la teva capacitat per connectar ha afavorit especialment la col·laboració?",
      "Quines maneres d'actuar podrien complementar els teus recursos quan una situació necessita més concreció?",
      "Què necessites habitualment de les persones amb qui treballes per coordinar-te millor?",
      "Què poden necessitar de tu les persones amb un estil diferent del teu?",
    ],
    teamContributions: [
      "Connectar les persones de l'equip.",
      "Generar participació i implicació.",
      "Comunicar idees amb entusiasme.",
      "Crear un clima de confiança.",
      "Mobilitzar a través de la relació.",
    ],
    teamAppreciates: [
      "Concreció i focus.",
      "Persones que aterrin les idees en acords.",
      "Estructura i seguiment.",
      "Reconeixement de l'esforç.",
    ],
    differences:
      "Quan conviuen estils més directes o més analítics, les diferències de comunicació poden generar friccions. Comprendre-les ajuda a mantenir el focus sense perdre la proximitat.",
  },
  S: {
    resources: [
      { name: "Estabilitat", description: "Aporta continuïtat, constància i serenitat en situacions canviants." },
      { name: "Escolta", description: "Presta atenció genuïna a altres persones i considera perspectives diferents de la pròpia." },
      { name: "Cooperació", description: "Tendeix a contribuir al treball conjunt afavorint relacions constructives." },
      { name: "Paciència", description: "Sosté processos i ritmes que requereixen temps abans de generar resultats visibles." },
    ],
    contribution:
      "Sol aportar estabilitat, escolta i continuïtat. Sovint contribueix a sostenir acords, cuidar la cohesió de l'equip i acompanyar les persones en els processos.",
    valued:
      "Les persones del seu entorn solen valorar la seva fiabilitat, la seva disponibilitat per escoltar i la sensació de confiança i serenitat que transmet.",
    coordinating:
      "Quan coordina, sol aportar estabilitat i cuidar que les persones se sentin acompanyades. Val la pena observar quan una situació requereix més ritme o una decisió més explícita.",
    collaborating:
      "Quan col·labora, tendeix a afavorir la cohesió i la confiança. Pot ser útil expressar la pròpia posició quan el context necessita claredat o un canvi de ritme.",
    communication:
      "La seva comunicació sol generar seguretat i proximitat. En determinats contextos, pot ser útil guanyar concreció i posicionar-se de manera explícita.",
    contexts:
      "Els seus recursos solen desplegar-se amb més facilitat en entorns estables, col·laboratius i amb relacions de confiança mantingudes en el temps.",
    valuedItems: [
      "La confiança i serenitat que transmets.",
      "La teva fiabilitat i constància.",
      "La teva disposició per escoltar.",
      "El suport que ofereixes a l'equip.",
      "La teva capacitat per sostenir acords.",
    ],
    observe: [
      "Quan la cerca d'harmonia ajorna converses necessàries.",
      "Quan convé posicionar-te de manera explícita.",
      "Com afrontes els canvis de ritme quan el context els exigeix.",
      "Quan convé impulsar una decisió amb més claredat.",
      "Com expresses les teves necessitats dins l'equip.",
    ],
    repertoire:
      "Ampliar el repertori pot consistir a expressar abans la pròpia posició i a introduir canvis de ritme quan la situació ho requereix.",
    reflection: [
      "Quins recursos reconeixes amb més claredat en la teva manera de sostenir relacions i processos?",
      "En quines situacions la teva estabilitat ha aportat especialment valor a l'equip?",
      "Quines maneres d'actuar podrien complementar els teus recursos quan una situació necessita més rapidesa o decisió?",
      "Què necessites habitualment de les persones amb qui treballes per coordinar-te millor?",
      "Què poden necessitar de tu les persones amb un estil diferent del teu?",
    ],
    teamContributions: [
      "Aportar estabilitat i continuïtat.",
      "Escoltar i cuidar l'equip.",
      "Sostenir els acords en el temps.",
      "Generar confiança i cohesió.",
      "Acompanyar les persones en els processos.",
    ],
    teamAppreciates: [
      "Claredat sobre les prioritats.",
      "Persones que impulsin i decideixin.",
      "Anticipació davant els canvis.",
      "Temps per adaptar-se.",
    ],
    differences:
      "Davant ritmes més ràpids o canvis freqüents poden aparèixer tensions. Comprendre aquestes diferències ajuda a equilibrar l'estabilitat amb la capacitat d'adaptació.",
  },
  C: {
    resources: [
      { name: "Anàlisi", description: "Tendeix a examinar la informació amb profunditat abans de concloure o decidir." },
      { name: "Rigor", description: "Presta atenció al detall, la precisió i la qualitat dels resultats." },
      { name: "Organització", description: "Estructura activitats, recursos i informació de manera ordenada i comprensible." },
      { name: "Prudència", description: "Valora riscos, conseqüències i impactes abans d'actuar." },
    ],
    contribution:
      "Sol aportar anàlisi, mètode i rigor. Sovint contribueix a millorar la qualitat de les decisions i a ordenar la informació perquè el treball avanci amb criteri.",
    valued:
      "Les persones del seu entorn solen valorar la seva preparació, la seva atenció al detall i la fiabilitat que aporta a les decisions i al seguiment.",
    coordinating:
      "Quan coordina, sol aportar criteri, ordre i atenció a la qualitat. Val la pena observar quan el nivell de detall facilita o frena l'acció.",
    collaborating:
      "Quan col·labora, tendeix a aportar estructura i consistència. Pot ser útil simplificar alguns missatges quan l'equip necessita avançar amb rapidesa.",
    communication:
      "La seva comunicació sol aportar rigor i comprensió. En determinats contextos, pot ser útil revisar si el nivell de detall facilita o dificulta l'acció.",
    contexts:
      "Els seus recursos solen desplegar-se amb més facilitat en entorns que valoren l'anàlisi, la qualitat i el treball ben estructurat.",
    valuedItems: [
      "El teu rigor i atenció al detall.",
      "La qualitat de la teva anàlisi.",
      "La teva preparació i mètode.",
      "La fiabilitat del teu seguiment.",
      "El teu criteri per prendre decisions.",
    ],
    observe: [
      "Quan ja hi ha informació suficient per avançar.",
      "Com simplificar els missatges quan l'equip necessita acció.",
      "L'equilibri entre rigor i ritme de resposta.",
      "Quan convé decidir amb la informació disponible.",
      "Com comparteixes el criteri sense saturar de detall.",
    ],
    repertoire:
      "Ampliar el repertori pot consistir a definir un punt de decisió quan l'anàlisi ja és suficient per avançar.",
    reflection: [
      "Quins recursos reconeixes amb més claredat en la teva manera d'analitzar i organitzar?",
      "En quines situacions el teu rigor ha millorat especialment la qualitat d'una decisió?",
      "Quines maneres d'actuar podrien complementar els teus recursos quan una situació necessita més velocitat?",
      "Què necessites habitualment de les persones amb qui treballes per coordinar-te millor?",
      "Què poden necessitar de tu les persones amb un estil diferent del teu?",
    ],
    teamContributions: [
      "Aportar anàlisi i rigor.",
      "Millorar la qualitat de les decisions.",
      "Ordenar la informació i els processos.",
      "Anticipar riscos.",
      "Donar criteri i consistència.",
    ],
    teamAppreciates: [
      "Marge per analitzar.",
      "Persones que aportin impuls i decisió.",
      "Objectius i criteris clars.",
      "Espais per aprofundir.",
    ],
    differences:
      "Quan el context exigeix rapidesa, les diferències entre anàlisi i acció poden generar tensió. Comprendre-les ajuda a equilibrar el rigor amb l'agilitat.",
  },
};

/** Etiquetas de los contextos del informe individual en catalán. */
export const REPORT_CONTEXTS_CA: { label: string; code: string }[] = [
  { label: "Decisions", code: "DECISION" },
  { label: "Comunicació", code: "COMUNICACION" },
  { label: "Coordinació", code: "COLABORACION" },
  { label: "Desacords", code: "CONFLICTO" },
  { label: "Canvi", code: "CAMBIO" },
];
