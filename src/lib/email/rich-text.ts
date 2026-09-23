/**
 * Mensaje de bienvenida del correo de invitación con formato.
 *
 * El editor de la consola guarda HTML. Aquí se sanea con una lista blanca de
 * etiquetas y estilos (lo que llega del navegador no es de fiar) y se convierte
 * en HTML de correo con los estilos en línea que necesitan Outlook y Gmail.
 * Los mensajes antiguos, escritos en markdown ligero (**negrita**, _cursiva_,
 * listas con "- " y [enlaces](https://…)), se siguen aceptando tal cual.
 */
import sanitizeHtml from "sanitize-html";

const BRAND = "#00a1e0";

/** ¿El texto guardado es HTML del editor (y no markdown de los mensajes antiguos)? */
export function isWelcomeHtml(text: string | null | undefined): boolean {
  return /^\s*<(p|h[1-6]|ul|ol|li|blockquote|hr|div|span|strong|em|b|i|u|s|br|a)[\s>/]/i.test(text ?? "");
}

/** ¿El mensaje está vacío a efectos prácticos (p. ej. "<p></p>" del editor)? */
export function welcomeIsEmpty(text: string | null | undefined): boolean {
  return (text ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;| /g, "").trim() === "";
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Sustituye variables {{nombre}}, {{email}}, {{programa}}, {{organizacion}}… por
 * los datos reales. Las desconocidas o vacías se dejan tal cual. Con `escape`,
 * los valores se escapan para insertarlos en HTML.
 */
export function fillVars(
  text: string,
  vars: Record<string, string>,
  escape = false,
): string {
  return text.replace(/\{\{\s*([a-zA-Z_]+)\s*\}\}/g, (m, key: string) => {
    const v = vars[key.toLowerCase()];
    if (v === undefined || v === "") return m;
    return escape ? escapeHtml(v) : v;
  });
}

/**
 * Markdown mínimo → HTML (negrita, cursiva, enlaces, listas). Los saltos de
 * línea simples unen líneas; solo una línea en blanco separa párrafos. Con
 * `styled`, lleva los estilos en línea del correo; sin él, etiquetas limpias
 * para cargarlas en el editor.
 */
export function markdownToHtml(src: string, { styled = true } = {}): string {
  const inline = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/_([^_]+)_/g, "<em>$1</em>")
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
        styled ? `<a href="$2" style="color:${BRAND};">$1</a>` : '<a href="$2">$1</a>',
      );
  const ul = styled
    ? '<ul style="margin:0 0 12px;padding-left:18px;color:#475569;font-size:14px;line-height:1.6;">'
    : "<ul>";
  const li = styled ? '<li style="margin:0 0 4px;">' : "<li>";
  const p = styled ? '<p style="margin:0 0 12px;line-height:1.6;color:#475569;">' : "<p>";
  const isItem = (l: string) => /^\s*[-*]\s+/.test(l);
  const out: string[] = [];
  for (const block of src.replace(/\r\n/g, "\n").trim().split(/\n\s*\n/)) {
    const lines = block.split("\n");
    let i = 0;
    while (i < lines.length) {
      if (isItem(lines[i])) {
        const items: string[] = [];
        while (i < lines.length && isItem(lines[i])) {
          items.push(`${li}${inline(lines[i].replace(/^\s*[-*]\s+/, "").trim())}</li>`);
          i++;
        }
        out.push(`${ul}${items.join("")}</ul>`);
      } else {
        const para: string[] = [];
        while (i < lines.length && !isItem(lines[i])) {
          const t = lines[i].trim();
          if (t) para.push(t);
          i++;
        }
        if (para.length) out.push(`${p}${inline(para.join(" ")).replace(/[ \t]{2,}/g, " ")}</p>`);
      }
    }
  }
  return out.join("");
}

// ── Saneado ────────────────────────────────────────────────────────────────

const COLOR = [
  /^#[0-9a-f]{3,8}$/i,
  /^rgba?\(\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*(,\s*(0|1|0?\.\d+)\s*)?\)$/i,
];
const TEXT_STYLES = {
  color: COLOR,
  "background-color": COLOR,
  "font-size": [/^\d{1,2}(\.\d+)?(px|pt)$/i],
  // Solo nombres de fuente: sin paréntesis, puntos y comas ni url().
  "font-family": [/^[\w\s,'"-]{1,120}$/],
};
const ALIGN = { "text-align": [/^(left|center|right|justify)$/] };

/**
 * Deja solo el formato que el correo sabe pintar: párrafos, títulos, listas,
 * destacado, separador, negrita, cursiva, subrayado, tachado, enlaces y
 * <span> con color, resaltado, tamaño y tipografía. Todo lo demás (scripts,
 * imágenes, eventos, estilos de Word…) se elimina conservando el texto.
 */
export function sanitizeWelcomeHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "em", "u", "s", "span", "a", "h2", "h3", "ul", "ol", "li", "blockquote", "hr"],
    allowedAttributes: { a: ["href"], span: ["style"], p: ["style"], h2: ["style"], h3: ["style"] },
    allowedStyles: { span: TEXT_STYLES, p: ALIGN, h2: ALIGN, h3: ALIGN },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesAppliedToAttributes: ["href"],
    allowProtocolRelative: false,
    transformTags: {
      b: "strong",
      i: "em",
      strike: "s",
      del: "s",
      h1: "h2",
      h4: "h3",
      h5: "h3",
      h6: "h3",
      div: "p",
    },
  }).trim();
}

// ── HTML de correo ─────────────────────────────────────────────────────────

/** Estilos en línea de cada bloque en el correo (lo del usuario va detrás y manda). */
const EMAIL_STYLE: Record<string, string> = {
  p: "margin:0 0 12px;line-height:1.6;color:#475569;",
  h2: "margin:18px 0 8px;font-size:20px;line-height:1.3;color:#0f172a;font-weight:800;",
  h3: "margin:14px 0 6px;font-size:16px;line-height:1.35;color:#0f172a;font-weight:700;",
  ul: "margin:0 0 12px;padding-left:20px;color:#475569;font-size:14px;line-height:1.6;",
  ol: "margin:0 0 12px;padding-left:20px;color:#475569;font-size:14px;line-height:1.6;",
  li: "margin:0 0 4px;",
  blockquote: `margin:0 0 14px;padding:12px 16px;background:#f2f9ff;border-left:4px solid ${BRAND};border-radius:8px;color:#334155;`,
  hr: "border:0;border-top:1px solid #e2e8f0;margin:18px 0;",
  a: `color:${BRAND};`,
};

function withEmailStyle(tag: string): sanitizeHtml.Transformer {
  return (tagName, attribs) => {
    const { "data-tight": tight, style, ...rest } = attribs;
    // Párrafos dentro de una lista o de un destacado: sin margen propio.
    const base = tag === "p" && tight ? "margin:0;line-height:1.6;" : EMAIL_STYLE[tag];
    return { tagName, attribs: { ...rest, style: base + (style ?? "") } };
  };
}

/**
 * Mensaje de bienvenida listo para el cuerpo del correo, con las variables ya
 * sustituidas. Acepta el HTML del editor y el markdown de los mensajes antiguos.
 */
export function welcomeToEmailHtml(stored: string, vars: Record<string, string>): string {
  if (!isWelcomeHtml(stored)) return markdownToHtml(fillVars(stored, vars));
  const clean = fillVars(sanitizeWelcomeHtml(stored), vars, true)
    // El editor envuelve cada elemento de lista en <p>: se marca para quitarle el margen.
    .replace(/<li><p>/g, '<li><p data-tight="1">')
    .replace(
      /<blockquote><p((?:(?!<p[\s>])[\s\S])*?)<\/p><\/blockquote>/g,
      '<blockquote><p data-tight="1"$1</p></blockquote>',
    );
  return sanitizeHtml(clean, {
    allowedTags: false,
    allowedAttributes: { "*": ["style", "href", "data-tight"] },
    transformTags: Object.fromEntries(Object.keys(EMAIL_STYLE).map((t) => [t, withEmailStyle(t)])),
  });
}

const decodeEntities = (s: string) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(x?)([0-9a-f]+);/gi, (_, hex: string, n: string) =>
      String.fromCodePoint(parseInt(n, hex ? 16 : 10)),
    )
    .replace(/&amp;/g, "&");

/** Versión en texto plano del mensaje (parte text/plain del correo). */
export function welcomeToText(stored: string, vars: Record<string, string>): string {
  if (!isWelcomeHtml(stored)) {
    // Sin tocar los guiones bajos: romperían correos como nom_cognom@….
    return fillVars(stored, vars)
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, "$1 ($2)")
      .trim();
  }
  const text = fillVars(sanitizeWelcomeHtml(stored), vars)
    // Los párrafos dentro de una viñeta no deben separarla de la siguiente.
    .replace(/<li><p[^>]*>/g, "<li>")
    .replace(/<\/p><\/li>/g, "</li>")
    .replace(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "$2 ($1)")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<hr\s*\/?>/gi, "\n———\n")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/(p|h2|h3|blockquote|ul|ol)>/gi, "\n\n")
    .replace(/<[^>]+>/g, "");
  return decodeEntities(text)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n- \n/g, "\n- ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Contenido para cargar en el editor: HTML saneado (los mensajes antiguos se convierten). */
export function welcomeForEditor(stored: string | null | undefined): string {
  const text = (stored ?? "").trim();
  if (!text) return "";
  return isWelcomeHtml(text) ? sanitizeWelcomeHtml(text) : markdownToHtml(text, { styled: false });
}

/**
 * Normaliza lo que devuelve la IA: sin bloque de código alrededor, convertido a
 * HTML si llegó en markdown o en texto y saneado como cualquier otra entrada.
 */
export function welcomeFromAi(text: string): string {
  const raw = text
    .trim()
    .replace(/^```(?:html)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  return sanitizeWelcomeHtml(isWelcomeHtml(raw) ? raw : markdownToHtml(raw, { styled: false }));
}
