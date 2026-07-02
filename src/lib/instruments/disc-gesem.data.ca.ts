/**
 * Traducción catalana del instrumento DISC GESEM v1 (7 contextos, 35 ítems).
 * Mismos códigos y mismo orden que la versión española; opciones en orden fijo
 * [D, I, S, C]. Se usa para mostrar el cuestionario en catalán (el cálculo usa
 * los códigos, no el texto).
 */
import type { ContextRow, ItemRow } from "./disc-gesem.data";

/** Nombres de dimensión en catalán (por código DISC). */
export const DISC_DIMENSION_NAMES_CA: Record<string, string> = {
  D: "Dominància",
  I: "Influència",
  S: "Estabilitat",
  C: "Compliment",
};

export const DISC_CONTEXTS_CA: ContextRow[] = [
  { code: "DECISION", name: "Presa de decisions", description: "Com decideixes davant de diferents escenaris." },
  { code: "ACCION", name: "Acció i execució", description: "La teva manera de posar les coses en marxa." },
  { code: "COMUNICACION", name: "Comunicació", description: "El teu estil en transmetre i escoltar." },
  { code: "COLABORACION", name: "Col·laboració", description: "La teva manera de treballar amb altres." },
  { code: "CAMBIO", name: "Canvi i incertesa", description: "Com afrontes el que és nou i imprevisible." },
  { code: "CONFLICTO", name: "Conflicte i desacord", description: "La teva reacció davant del desacord." },
  { code: "ORGANIZACION", name: "Organització i qualitat", description: "La teva relació amb l'ordre i el rigor." },
];

export const DISC_ITEM_ROWS_CA: ItemRow[] = [
  { code: "DECISION_1", context: "DECISION", prompt: "Quan cal prendre una decisió important…",
    options: ["Decideixo ràpid i assumeixo el risc.", "Busco idees i ho consulto amb la gent.", "Prefereixo pensar-ho amb calma i sense pressió.", "Analitzo les dades abans de decidir."] },
  { code: "DECISION_2", context: "DECISION", prompt: "Davant d'una decisió amb informació incompleta…",
    options: ["Prenc la iniciativa i avanço.", "Confio en la meva intuïció i en el grup.", "Espero a tenir més certesa.", "Busco més dades per reduir l'error."] },
  { code: "DECISION_3", context: "DECISION", prompt: "El que més valoro en decidir és…",
    options: ["Arribar al resultat com més aviat millor.", "Que la decisió motivi l'equip.", "Que ningú en surti perjudicat.", "Que sigui correcta i justificable."] },
  { code: "DECISION_4", context: "DECISION", prompt: "Quan una decisió surt malament…",
    options: ["Rectifico ràpid i tiro endavant.", "Mantinc l'ànim de l'equip.", "Reviso amb calma què ha passat.", "Analitzo l'error per no repetir-lo."] },
  { code: "DECISION_5", context: "DECISION", prompt: "Prefereixo decisions que…",
    options: ["Em donin control sobre el resultat.", "Generin entusiasme.", "Aportin estabilitat.", "Es basin en criteris objectius."] },

  { code: "ACCION_1", context: "ACCION", prompt: "Quan arranca un projecte…",
    options: ["Empenyo perquè comenci ja.", "Encomano energia als altres.", "Vaig pas a pas, sense pressa.", "Planifico cada detall abans."] },
  { code: "ACCION_2", context: "ACCION", prompt: "El meu ritme de treball habitual és…",
    options: ["Ràpid i orientat a resultats.", "Dinàmic i variat.", "Constant i sostingut.", "Metòdic i precís."] },
  { code: "ACCION_3", context: "ACCION", prompt: "Davant d'un termini ajustat…",
    options: ["Accelero i prioritzo l'essencial.", "Mobilitzo la gent per aconseguir-ho.", "Mantinc la calma i l'ordre.", "Reviso que tot compleixi els requisits."] },
  { code: "ACCION_4", context: "ACCION", prompt: "Quan tinc diverses tasques alhora…",
    options: ["Vaig a per les de més impacte.", "Les combino segons l'energia.", "Les faig d'una en una.", "Les organitzo per procediment."] },
  { code: "ACCION_5", context: "ACCION", prompt: "El que m'impulsa a executar és…",
    options: ["El repte i l'assoliment.", "El reconeixement i la gent.", "La rutina i la seguretat.", "Fer les coses bé."] },

  { code: "COMUNICACION_1", context: "COMUNICACION", prompt: "Quan comunico una idea…",
    options: ["Vaig directe al gra.", "Sóc expressiu i entusiasta.", "Parlo amb calma i escolto.", "Sóc precís i detallat."] },
  { code: "COMUNICACION_2", context: "COMUNICACION", prompt: "En una reunió tendeixo a…",
    options: ["Dirigir i marcar el rumb.", "Animar i generar conversa.", "Donar suport i mantenir el clima.", "Aportar dades i matisos."] },
  { code: "COMUNICACION_3", context: "COMUNICACION", prompt: "Quan escolto els altres…",
    options: ["Busco la conclusió ràpid.", "Connecto amb les seves emocions.", "Hi paro atenció amb paciència.", "Analitzo la lògica del que diuen."] },
  { code: "COMUNICACION_4", context: "COMUNICACION", prompt: "El meu estil en donar feedback és…",
    options: ["Franc i sense embuts.", "Positiu i motivador.", "Curós i respectuós.", "Concret i basat en fets."] },
  { code: "COMUNICACION_5", context: "COMUNICACION", prompt: "Prefereixo comunicar-me…",
    options: ["De manera breu i eficaç.", "Cara a cara i amb energia.", "En un to tranquil.", "Per escrit i ben documentat."] },

  { code: "COLABORACION_1", context: "COLABORACION", prompt: "Treballant en equip, jo…",
    options: ["Prenc el lideratge.", "Genero bon ambient.", "Dono suport i cohesió.", "Asseguro el rigor de la feina."] },
  { code: "COLABORACION_2", context: "COLABORACION", prompt: "El que aporto al grup és…",
    options: ["Empenta i direcció.", "Energia i idees.", "Lleialtat i estabilitat.", "Qualitat i ordre."] },
  { code: "COLABORACION_3", context: "COLABORACION", prompt: "Quan un company necessita ajuda…",
    options: ["Li dono una solució ràpida.", "L'animo i l'acompanyo.", "L'escolto i li dono suport.", "Li explico com fer-ho bé."] },
  { code: "COLABORACION_4", context: "COLABORACION", prompt: "En el repartiment de tasques…",
    options: ["Assumeixo les més exigents.", "Trio les que impliquen gent.", "Accepto el que calgui.", "Prefereixo les que requereixen precisió."] },
  { code: "COLABORACION_5", context: "COLABORACION", prompt: "Per a mi un bon equip és…",
    options: ["Un que aconsegueix resultats.", "Un amb bon clima.", "Un d'unit i estable.", "Un que treballa amb mètode."] },

  { code: "CAMBIO_1", context: "CAMBIO", prompt: "Davant d'un canvi inesperat…",
    options: ["Prenc el control de la situació.", "Ho visc com una oportunitat.", "Necessito temps per adaptar-m'hi.", "Busco entendre les regles noves."] },
  { code: "CAMBIO_2", context: "CAMBIO", prompt: "La incertesa em fa…",
    options: ["Actuar per reduir-la.", "Improvisar amb optimisme.", "Preferir el que és conegut.", "Voler més informació."] },
  { code: "CAMBIO_3", context: "CAMBIO", prompt: "Quan canvien les prioritats…",
    options: ["Em reoriento immediatament.", "M'adapto amb flexibilitat.", "Em costa deixar anar el d'abans.", "Reviso com afecta el pla."] },
  { code: "CAMBIO_4", context: "CAMBIO", prompt: "Davant d'una cosa nova i desconeguda…",
    options: ["L'afronto amb decisió.", "L'exploro amb curiositat.", "Avanço amb cautela.", "L'estudio abans d'actuar."] },
  { code: "CAMBIO_5", context: "CAMBIO", prompt: "El canvi ideal per a mi és…",
    options: ["El que em dóna més control.", "El que porta novetat.", "El gradual i previsible.", "El ben planificat."] },

  { code: "CONFLICTO_1", context: "CONFLICTO", prompt: "Davant d'un desacord…",
    options: ["Defenso la meva postura amb fermesa.", "Busco convèncer amb entusiasme.", "Intento suavitzar la tensió.", "Recorro als fets."] },
  { code: "CONFLICTO_2", context: "CONFLICTO", prompt: "Quan algú em porta la contrària…",
    options: ["Li planto cara.", "Intento persuadir-lo.", "Cedeixo per mantenir la pau.", "Demano arguments."] },
  { code: "CONFLICTO_3", context: "CONFLICTO", prompt: "En una discussió d'equip…",
    options: ["Vull tancar-la ràpid.", "Faig de mitjancer perquè s'entenguin.", "Evito l'enfrontament.", "Aclareixo les dades en disputa."] },
  { code: "CONFLICTO_4", context: "CONFLICTO", prompt: "El que més m'incomoda d'un conflicte és…",
    options: ["Perdre el control.", "El mal ambient.", "La tensió personal.", "La manca d'objectivitat."] },
  { code: "CONFLICTO_5", context: "CONFLICTO", prompt: "Per resoldre un conflicte prefereixo…",
    options: ["Una solució directa.", "Un acord amistós.", "Que es calmin els ànims.", "Aplicar un criteri just."] },

  { code: "ORGANIZACION_1", context: "ORGANIZACION", prompt: "La meva manera d'organitzar-me és…",
    options: ["Per objectius i resultats.", "Flexible segons el dia.", "Estable i rutinària.", "Detallada i sistemàtica."] },
  { code: "ORGANIZACION_2", context: "ORGANIZACION", prompt: "Respecte a les normes…",
    options: ["Les qüestiono si frenen resultats.", "Les adapto a cada situació.", "Les respecto per donar estabilitat.", "Les segueixo amb rigor."] },
  { code: "ORGANIZACION_3", context: "ORGANIZACION", prompt: "El meu nivell d'exigència amb la qualitat…",
    options: ["Suficient per assolir l'objectiu.", "Importa, però sense obsessió.", "Constant i fiable.", "Molt alt, cuido cada detall."] },
  { code: "ORGANIZACION_4", context: "ORGANIZACION", prompt: "Quan planifico…",
    options: ["Marco fites ambicioses.", "Deixo marge per improvisar.", "Busco un pla realista.", "Detallo cada pas."] },
  { code: "ORGANIZACION_5", context: "ORGANIZACION", prompt: "L'ordre per a mi és…",
    options: ["Un mitjà per anar més ràpid.", "Secundari davant de les persones.", "Una font de tranquil·litat.", "Imprescindible."] },
];
