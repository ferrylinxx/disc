/**
 * Revisión automática del correo de invitación antes de enviarlo: detecta los
 * despistes habituales (asteriscos en el asunto, saludo repetido, variables que
 * no existen, fechas incoherentes…). Solo avisa; no bloquea el envío.
 */
import { welcomeIsEmpty, welcomeToText } from "./rich-text";

export type CheckLevel = "warn" | "info" | "ok";
export interface EmailCheck {
  level: CheckLevel;
  text: string;
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

/** Saludos con los que suele empezar un mensaje; el correo ya empieza con "Hola {nombre},". */
const GREETING =
  /^(hola|hello|hi|bon dia|bona tarda|buenos d[ií]as|buenas tardes|benvolgud[ao]s?|estimad[ao]s?|querid[ao]s?)\b/i;

const SUBJECT_MAX = 60;

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

export function checkInvitation(input: {
  programName?: string;
  /** Asunto tal y como lo ha escrito la persona (vacío = el de por defecto). */
  subject?: string;
  welcomeIntro?: string;
  sessionDate?: string;
  deadline?: string;
  showProgramBox?: boolean;
  /** Hoy (inyectable para los tests). */
  today?: Date;
}): EmailCheck[] {
  const out: EmailCheck[] = [];
  const program = (input.programName ?? "").trim();
  const subject = (input.subject ?? "").trim();
  const welcome = (input.welcomeIntro ?? "").trim();
  const hasWelcome = !welcomeIsEmpty(welcome);
  const welcomeText = hasWelcome ? welcomeToText(welcome, {}) : "";

  if (!program) {
    out.push({
      level: "warn",
      text: "Sin nombre de programa se envía el correo genérico: no salen el asunto personalizado, las fechas ni el mensaje de bienvenida.",
    });
  }

  if (/\*\*|__|~~/.test(subject)) {
    out.push({
      level: "warn",
      text: "El asunto no admite formato: los asteriscos (o guiones bajos) llegarán tal cual.",
    });
  }
  if (subject.length > SUBJECT_MAX) {
    out.push({
      level: "info",
      text: `El asunto tiene ${subject.length} caracteres: en el móvil se suele cortar a partir de unos ${SUBJECT_MAX}.`,
    });
  }

  if (hasWelcome && GREETING.test(welcomeText.trim())) {
    out.push({
      level: "warn",
      text: "El correo ya empieza con «Hola {nombre},» y tu mensaje vuelve a saludar: la persona leerá el saludo dos veces.",
    });
  }
  if (!hasWelcome && program) {
    out.push({ level: "info", text: "Sin mensaje propio: se usará el texto de bienvenida por defecto." });
  }

  for (const v of unknownVars(`${subject}\n${welcome}`)) {
    out.push({
      level: "warn",
      text: `La variable {{${v}}} no existe y saldrá escrita tal cual. Usa los botones de variables.`,
    });
  }

  const today = input.today ?? new Date();
  today.setHours(0, 0, 0, 0);
  const session = isoDay(input.sessionDate);
  const deadline = isoDay(input.deadline);
  if (session && session < today) out.push({ level: "warn", text: "La fecha del taller ya ha pasado." });
  if (deadline && deadline < today) out.push({ level: "warn", text: "La fecha límite ya ha pasado." });
  if (session && deadline && deadline > session) {
    out.push({ level: "warn", text: "La fecha límite es posterior al taller." });
  }
  if (input.showProgramBox === false && (session || deadline)) {
    out.push({
      level: "info",
      text: "El recuadro de fechas está oculto: comprueba que el mensaje de bienvenida da la fecha del taller y la fecha límite.",
    });
  }

  if (!out.some((c) => c.level === "warn")) {
    out.unshift({ level: "ok", text: "No se han detectado problemas." });
  }
  return out;
}
