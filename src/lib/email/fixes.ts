/**
 * Arreglos automáticos del correo de invitación (los que no necesitan IA).
 * Módulo puro, sin dependencias de servidor: la vista previa los aplica al
 * instante. En el HTML del mensaje solo se toca el texto, nunca las etiquetas
 * ni las variables {{…}}.
 */

export type FixId = "subject-markup" | "greeting" | "apostrophes" | "ela" | "spacing";

export interface EmailFields {
  programName: string;
  programNameHtml: string;
  emailSubject: string;
  welcomeIntro: string;
}

/** Saludos con los que suele empezar un mensaje; el correo ya empieza con "Hola {nombre},". */
export const GREETING =
  /^(hola|hello|hi|bon dia|bona tarda|buenos d[ií]as|buenas tardes|benvolgud[ao]s?|estimad[ao]s?|querid[ao]s?)\b/i;

const L = "A-Za-zÀ-ÖØ-öø-ÿ";
const APOSTROPHE = new RegExp(`([${L}])[´\`](?=[${L}"“«]|&quot;)`, "g");
const ELA = new RegExp(`([${L}])(l)\\.(l)(?=[${L}])`, "gi");

/** Aplica `fn` solo a los trozos de texto de un HTML (ni etiquetas ni variables). */
function mapText(html: string, fn: (text: string) => string): string {
  return html
    .split(/(<[^>]*>|\{\{[^}]*\}\})/)
    .map((part, i) => (i % 2 === 1 ? part : fn(part)))
    .join("");
}

/** Palabras con apóstrofo escrito con acento (d´octubre), para los avisos. */
export function findApostrophes(text: string): string[] {
  return [...text.matchAll(new RegExp(`[${L}]*[${L}][´\`][${L}"“«]*`, "g"))].map((m) => m[0]);
}

/** Palabras con "l.l" en lugar de "l·l" (col.laborar), sin contar correos ni webs. */
export function findEla(text: string): string[] {
  return text
    .split(/\s+/)
    .filter((w) => !/@|:\/\/|www\./i.test(w) && new RegExp(ELA.source, "i").test(w))
    .map((w) => w.replace(/^[^A-Za-zÀ-ÿ]+|[^A-Za-zÀ-ÿ]+$/g, ""));
}

/** Espacios dobles o antes de un signo de puntuación. */
export function countSpacing(text: string): number {
  return (text.match(/ {2,}| +[,.;:!?](?=\s|$)/g) ?? []).length;
}

export function fixApostrophes(text: string): string {
  return text.replace(APOSTROPHE, "$1’");
}

export function fixEla(text: string): string {
  return text
    .split(/(\s+)/)
    .map((w) => (/@|:\/\/|www\./i.test(w) ? w : w.replace(ELA, "$1$2·$3")))
    .join("");
}

export function fixSpacing(text: string): string {
  return text.replace(/ {2,}/g, " ").replace(/ +([,.;:!?])(?=\s|$)/g, "$1");
}

export function stripSubjectMarkup(subject: string): string {
  return subject.replace(/\*\*|__|~~/g, "").replace(/\s{2,}/g, " ").trim();
}

const plain = (html: string) => html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

/**
 * Quita el saludo del principio del mensaje: el bloque entero si solo es el
 * saludo ("Hola {{nombre}},") o la frase de saludo si el párrafo sigue.
 */
export function removeGreeting(html: string): string {
  const first = html.match(/^\s*<(p|h2|h3)([^>]*)>([\s\S]*?)<\/\1>/);
  if (!first || !GREETING.test(plain(first[3]))) return html;
  const text = plain(first[3]);
  if (/^[^.!?]{0,60}[,.!:]?$/.test(text) && !/[,.!:]\s*\S/.test(text)) {
    return html.slice(first[0].length).trimStart();
  }
  // El saludo abre un párrafo más largo: se quita hasta la primera coma o signo.
  const parts = first[3].split(/(<[^>]*>)/);
  let removed = false;
  let capitalize = false;
  for (let i = 0; i < parts.length; i += 2) {
    if (!removed && parts[i].trim()) {
      const greeting = GREETING.source.replace(/^\^/, "");
      parts[i] = parts[i].replace(new RegExp(`^(\\s*)${greeting}[^,.!:]{0,40}[,.!:]\\s*`, "i"), "$1");
      removed = true;
      capitalize = true;
    }
    if (capitalize && parts[i].trim()) {
      parts[i] = parts[i].replace(new RegExp(`[${L}]`), (c) => c.toUpperCase());
      capitalize = false;
    }
  }
  return html.replace(first[3], parts.join(""));
}

/** Aplica un arreglo a los campos del correo y devuelve los campos nuevos. */
export function applyFix(fields: EmailFields, fix: FixId): EmailFields {
  const all = (fn: (t: string) => string): EmailFields => ({
    programName: fn(fields.programName),
    programNameHtml: mapText(fields.programNameHtml, fn),
    emailSubject: fn(fields.emailSubject),
    welcomeIntro: mapText(fields.welcomeIntro, fn),
  });
  switch (fix) {
    case "subject-markup":
      return { ...fields, emailSubject: stripSubjectMarkup(fields.emailSubject) };
    case "greeting":
      return { ...fields, welcomeIntro: removeGreeting(fields.welcomeIntro) };
    case "apostrophes":
      return all(fixApostrophes);
    case "ela":
      return all(fixEla);
    case "spacing":
      return all(fixSpacing);
  }
}
