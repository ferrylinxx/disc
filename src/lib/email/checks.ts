/**
 * Revisión automática del correo de invitación antes de enviarlo: detecta los
 * despistes habituales (asteriscos en el asunto, saludo repetido, variables que
 * no existen, tipografía, idioma, fechas incoherentes…). Solo avisa; no bloquea
 * el envío. Los avisos con `fix` se pueden arreglar sin IA (src/lib/email/fixes.ts).
 */
import { welcomeIsEmpty, welcomeToText } from "./rich-text";
import { countSpacing, findApostrophes, findEla, GREETING, type FixId } from "./fixes";
import { hasUnicodeStyle, visibleLength } from "@/lib/unicode-style";

export type CheckLevel = "warn" | "info" | "ok";
/** Dónde está el problema, para agruparlo en la vista previa. */
export type CheckField = "program" | "subject" | "welcome" | "dates" | "typography";
export interface EmailCheck {
  level: CheckLevel;
  text: string;
  field?: CheckField;
  /** Arreglo automático disponible para este aviso. */
  fix?: FixId;
}

/** Variables que sustituye la plantilla (con sus alias). */
const KNOWN_VARS = new Set([
  "nombre",
  "name",
  "nombre_completo",
  "nombrecompleto",
  "fullname",
  "email",
  "correo",
  "programa",
  "program",
  "organizacion",
  "org",
]);

const SUBJECT_MAX = 60;
const WELCOME_MAX_WORDS = 220;

/**
 * Palabras que solo son de un idioma (o casi), para detectar un mensaje en el
 * idioma equivocado. Límites con \p{L}: \b no ve las letras acentuadas (també).
 * "tu" no cuenta: existe en los dos idiomas.
 */
const CA_WORDS =
  /(?<!\p{L})(i|amb|els|perquè|també|teu|teva|teus|vostre|vostra|nostre|nostra|aquest|aquesta|molt|però|mateix|dins|qüestionari|sessió|puguis|fer|seva)(?!\p{L})|l·l/giu;
const ES_WORDS =
  /(?<!\p{L})(y|con|los|para|porque|también|tus|vuestro|vuestra|nuestro|nuestra|este|esta|muy|pero|mismo|dentro|cuestionario|sesión|puedas|hacer|su)(?!\p{L})|ñ/giu;

function isoDay(value?: string): Date | null {
  const v = (value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(`${v}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function unknownVars(text: string): string[] {
  const found = [...text.matchAll(/\{\{\s*([^}]*?)\s*\}\}/g)].map((m) => m[1]);
  return [...new Set(found.filter((v) => !KNOWN_VARS.has(v.toLowerCase())))];
}

/** "a", "a y b", "a, b y c" y "a, b, c y N más". */
function listExamples(items: string[], max = 3): string {
  const uniq = [...new Set(items)];
  const shown = uniq.slice(0, max).map((x) => `«${x}»`);
  const rest = uniq.length - shown.length;
  if (rest > 0) return `${shown.join(", ")} y ${rest} más`;
  return shown.length > 1 ? `${shown.slice(0, -1).join(", ")} y ${shown.at(-1)}` : shown[0];
}

export function checkInvitation(input: {
  programName?: string;
  /** Asunto tal y como lo ha escrito la persona (vacío = el de por defecto). */
  subject?: string;
  welcomeIntro?: string;
  sessionDate?: string;
  deadline?: string;
  showProgramBox?: boolean;
  /** Idioma con el que se enviará el correo. */
  lang?: "ca" | "es";
  /** Hoy (inyectable para los tests). */
  today?: Date;
}): EmailCheck[] {
  const out: EmailCheck[] = [];
  const program = (input.programName ?? "").trim();
  const subject = (input.subject ?? "").trim();
  const welcome = (input.welcomeIntro ?? "").trim();
  const hasWelcome = !welcomeIsEmpty(welcome);
  const welcomeText = hasWelcome ? welcomeToText(welcome, {}) : "";

  // Programa
  if (!program) {
    out.push({
      level: "warn",
      field: "program",
      text: "Sin nombre de programa se envía el correo genérico: no salen el asunto personalizado, las fechas ni el mensaje de bienvenida.",
    });
  }

  // Asunto
  if (/\*\*|__|~~/.test(subject)) {
    out.push({
      level: "warn",
      field: "subject",
      fix: "subject-markup",
      text: "El asunto no admite formato: los asteriscos (o guiones bajos) llegarán tal cual.",
    });
  }
  const subjectLength = visibleLength(subject);
  if (subjectLength > SUBJECT_MAX) {
    out.push({
      level: "info",
      field: "subject",
      text: `El asunto tiene ${subjectLength} caracteres: en el móvil se suele cortar a partir de unos ${SUBJECT_MAX}.`,
    });
  }
  if (hasUnicodeStyle(subject)) {
    out.push({
      level: "info",
      field: "subject",
      text: "El asunto usa letras especiales para la negrita o la cursiva: se ven bien, pero los lectores de pantalla las leen mal y el buscador del correo no las encuentra. Mejor en una o dos palabras.",
    });
  }
  const letters = subject.replace(/\{\{[^}]*\}\}/g, "").replace(/[^A-Za-zÀ-ÿ]/g, "");
  if (letters.length >= 8 && letters === letters.toUpperCase()) {
    out.push({
      level: "info",
      field: "subject",
      text: "El asunto está todo en mayúsculas: se lee como si gritara y algunos filtros lo tratan como spam.",
    });
  }

  // Mensaje de bienvenida
  if (hasWelcome && GREETING.test(welcomeText.trim())) {
    out.push({
      level: "warn",
      field: "welcome",
      fix: "greeting",
      text: "El correo ya empieza con «Hola {nombre},» y tu mensaje vuelve a saludar: la persona leerá el saludo dos veces.",
    });
  }
  if (!hasWelcome && program) {
    out.push({ level: "info", field: "welcome", text: "Sin mensaje propio: se usará el texto de bienvenida por defecto." });
  }
  if (hasWelcome && input.lang) {
    const ca = (welcomeText.match(CA_WORDS) ?? []).length;
    const es = (welcomeText.match(ES_WORDS) ?? []).length;
    const other = input.lang === "ca" ? es : ca;
    const own = input.lang === "ca" ? ca : es;
    if (other >= 6 && other > own * 2) {
      out.push({
        level: "warn",
        field: "welcome",
        text: `El mensaje parece estar en ${input.lang === "ca" ? "castellano" : "catalán"}, pero el correo se enviará en ${input.lang === "ca" ? "catalán" : "castellano"}. Usa «Traducir» o cambia el idioma del correo.`,
      });
    }
  }
  const words = welcomeText.split(/\s+/).filter(Boolean).length;
  if (words > WELCOME_MAX_WORDS) {
    out.push({
      level: "info",
      field: "welcome",
      text: `El mensaje tiene ${words} palabras: los correos breves (menos de ${WELCOME_MAX_WORDS}) se leen enteros más a menudo.`,
    });
  }

  for (const v of unknownVars(`${subject}\n${welcome}`)) {
    out.push({
      level: "warn",
      field: unknownVars(subject).includes(v) ? "subject" : "welcome",
      text: `La variable {{${v}}} no existe y saldrá escrita tal cual. Usa los botones de «Insertar».`,
    });
  }

  // Tipografía (asunto, programa y mensaje)
  const allText = [subject, program, welcomeText].join("\n");
  const apostrophes = findApostrophes(allText);
  if (apostrophes.length) {
    out.push({
      level: "warn",
      field: "typography",
      fix: "apostrophes",
      text: `Apóstrofo escrito con acento (´) en ${listExamples(apostrophes)}: se escribe ’ (d’octubre).`,
    });
  }
  const ela = findEla(allText);
  if (ela.length) {
    out.push({
      level: "warn",
      field: "typography",
      fix: "ela",
      text: `Ela geminada con punto normal en ${listExamples(ela)}: se escribe con punto volado (col·laborar).`,
    });
  }
  const spacing = countSpacing(allText);
  if (spacing) {
    out.push({
      level: "info",
      field: "typography",
      fix: "spacing",
      text: `${spacing === 1 ? "Hay un espacio" : `Hay ${spacing} espacios`} de más o antes de un signo de puntuación.`,
    });
  }

  // Fechas
  const today = input.today ?? new Date();
  today.setHours(0, 0, 0, 0);
  const session = isoDay(input.sessionDate);
  const deadline = isoDay(input.deadline);
  if (session && session < today) out.push({ level: "warn", field: "dates", text: "La fecha del taller ya ha pasado." });
  if (deadline && deadline < today) out.push({ level: "warn", field: "dates", text: "La fecha límite ya ha pasado." });
  if (session && deadline && deadline > session) {
    out.push({ level: "warn", field: "dates", text: "La fecha límite es posterior al taller." });
  }
  if (input.showProgramBox === false && (session || deadline)) {
    out.push({
      level: "info",
      field: "dates",
      text: "El recuadro de fechas está oculto: comprueba que el mensaje de bienvenida da la fecha del taller y la fecha límite.",
    });
  }

  if (!out.some((c) => c.level === "warn")) {
    out.unshift({ level: "ok", text: "No se han detectado problemas." });
  }
  return out;
}
