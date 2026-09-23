/**
 * Negrita y cursiva para el asunto del correo. Un asunto es texto plano: la
 * única forma de que se vea en negrita o cursiva en Gmail, Outlook o el móvil
 * es usar las letras "matemáticas" de Unicode (𝗮, 𝘢, 𝙖). Las letras con acento
 * no existen en esos alfabetos: se descomponen (é → e + ◌́) y se reconstruyen
 * con el signo combinable. Las variables {{…}} nunca se transforman.
 */

export type UnicodeStyle = "bold" | "italic";

/** Primer código de cada alfabeto sans-serif: [mayúsculas, minúsculas, dígitos]. */
const BLOCKS = {
  bold: [0x1d5d4, 0x1d5ee, 0x1d7ec],
  italic: [0x1d608, 0x1d622, null],
  boldItalic: [0x1d63c, 0x1d656, null],
} as const;

interface Glyph {
  /** Letra o dígito ASCII base, o el carácter tal cual si no se puede estilizar. */
  base: string;
  bold: boolean;
  italic: boolean;
}

function decode(ch: string): Glyph {
  const cp = ch.codePointAt(0)!;
  for (const [name, [upper, lower, digit]] of Object.entries(BLOCKS)) {
    const bold = name !== "italic";
    const italic = name !== "bold";
    if (cp >= upper && cp < upper + 26) return { base: String.fromCharCode(65 + cp - upper), bold, italic };
    if (cp >= lower && cp < lower + 26) return { base: String.fromCharCode(97 + cp - lower), bold, italic };
    if (digit && cp >= digit && cp < digit + 10) return { base: String.fromCharCode(48 + cp - digit), bold, italic };
  }
  return { base: ch, bold: false, italic: false };
}

function encode(g: Glyph): string {
  const block = g.bold && g.italic ? BLOCKS.boldItalic : g.bold ? BLOCKS.bold : g.italic ? BLOCKS.italic : null;
  if (!block) return g.base;
  const c = g.base.charCodeAt(0);
  if (c >= 65 && c <= 90) return String.fromCodePoint(block[0] + c - 65);
  if (c >= 97 && c <= 122) return String.fromCodePoint(block[1] + c - 97);
  // Cursiva no tiene dígitos: se quedan en negrita (si la hay) o normales.
  if (c >= 48 && c <= 57) return block[2] ? String.fromCodePoint(block[2] + c - 48) : g.bold ? String.fromCodePoint(BLOCKS.bold[2] + c - 48) : g.base;
  return g.base;
}

const styleable = (g: Glyph) => /^[A-Za-z0-9]$/.test(g.base);

/** Trozos del texto: [texto, variable, texto, variable…] para no tocar las variables. */
const splitVars = (text: string) => text.split(/(\{\{[^}]*\}\})/);

/** ¿Todas las letras del texto tienen ya ese estilo? (sin contar variables ni signos) */
export function hasStyle(text: string, style: UnicodeStyle): boolean {
  const glyphs = splitVars(text.normalize("NFD"))
    .filter((_, i) => i % 2 === 0)
    .flatMap((part) => [...part].map(decode))
    .filter(styleable);
  return glyphs.length > 0 && glyphs.every((g) => g[style]);
}

/** Pone o quita negrita/cursiva en el texto, conservando acentos y variables. */
export function setStyle(text: string, style: UnicodeStyle, on: boolean): string {
  return splitVars(text.normalize("NFD"))
    .map((part, i) =>
      i % 2 === 1
        ? part
        : [...part]
            .map((ch) => {
              const g = decode(ch);
              return styleable(g) ? encode({ ...g, [style]: on }) : ch;
            })
            .join(""),
    )
    .join("")
    .normalize("NFC");
}

/** Alterna el estilo: si todo lo tiene, lo quita; si no, lo pone. */
export function toggleStyle(text: string, style: UnicodeStyle): string {
  return setStyle(text, style, !hasStyle(text, style));
}

/** ¿Usa letras especiales de negrita o cursiva? */
export function hasUnicodeStyle(text: string): boolean {
  return /[\u{1D400}-\u{1D7FF}]/u.test(text);
}

/** Longitud que ve la persona (una letra especial ocupa dos unidades en JavaScript). */
export function visibleLength(text: string): number {
  return [...text.normalize("NFC")].length;
}
