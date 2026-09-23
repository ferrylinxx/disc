import { describe, expect, it } from "vitest";
import {
  isWelcomeHtml,
  markdownToHtml,
  sanitizeWelcomeHtml,
  welcomeForEditor,
  welcomeFromAi,
  welcomeIsEmpty,
  welcomeToEmailHtml,
  welcomeToText,
} from "./rich-text";

const vars = { nombre: "Marta", programa: "CONNECTAR", email: "marta@csuc.cat" };

describe("saneado del mensaje de bienvenida", () => {
  it("elimina scripts, eventos, imágenes e iframes y conserva el texto", () => {
    const out = sanitizeWelcomeHtml(
      '<p onclick="alert(1)">Hola<script>alert(1)</script> <img src=x onerror=alert(1)><iframe src="https://x"></iframe>món</p>',
    );
    expect(out).toBe("<p>Hola món</p>");
  });

  it("bloquea enlaces javascript: y data:, y deja http, https y mailto", () => {
    expect(sanitizeWelcomeHtml('<p><a href="javascript:alert(1)">x</a></p>')).toBe("<p><a>x</a></p>");
    expect(sanitizeWelcomeHtml('<p><a href="data:text/html,hi">x</a></p>')).toBe("<p><a>x</a></p>");
    expect(sanitizeWelcomeHtml('<p><a href="https://gesem.cat" target="_blank" rel="noopener">web</a></p>')).toBe(
      '<p><a href="https://gesem.cat">web</a></p>',
    );
    expect(sanitizeWelcomeHtml('<p><a href="mailto:hola@gesem.cat">escriu</a></p>')).toContain('href="mailto:hola@gesem.cat"');
  });

  it("conserva color, resaltado, tamaño y tipografía, y descarta otros estilos", () => {
    const out = sanitizeWelcomeHtml(
      `<p><span style="color: #b91c1c; background-color: rgb(254, 240, 138); font-size: 18px; font-family: Georgia, 'Times New Roman', serif; position: fixed; background-image: url(https://x)">hola</span></p>`,
    );
    expect(out).toContain("color:#b91c1c");
    expect(out).toContain("background-color:rgb(254, 240, 138)");
    expect(out).toContain("font-size:18px");
    expect(out).toContain("font-family:Georgia");
    expect(out).not.toContain("position");
    expect(out).not.toContain("url(");
  });

  it("rechaza valores de estilo que intentan colar CSS", () => {
    const out = sanitizeWelcomeHtml('<p><span style="font-family: x;} body{display:none; color: red">a</span></p>');
    expect(out).not.toContain("display");
    expect(out).not.toMatch(/font-family:x;?\}/);
  });

  it("normaliza etiquetas equivalentes (b, i, h1, div) y deja la alineación", () => {
    expect(sanitizeWelcomeHtml('<h1>T</h1><div style="text-align: center">x</div><b>b</b><i>i</i>')).toBe(
      '<h2>T</h2><p style="text-align:center">x</p><strong>b</strong><em>i</em>',
    );
  });

  it("limpia lo que se pega desde Word", () => {
    const word =
      '<p class="MsoNormal" style="margin:0cm;mso-line-height-alt:12pt"><span style="font-family:Calibri;mso-fareast-font-family:Aptos">Hola</span><o:p></o:p></p>';
    expect(sanitizeWelcomeHtml(word)).toBe('<p><span style="font-family:Calibri">Hola</span></p>');
  });
});

describe("mensaje de bienvenida en el correo", () => {
  it("añade los estilos en línea del correo y respeta la alineación del usuario", () => {
    const out = welcomeToEmailHtml('<p style="text-align:center">Hola</p><h2>Títol</h2>', vars);
    expect(out).toContain('<p style="margin:0 0 12px;line-height:1.6;color:#475569;text-align:center">Hola</p>');
    expect(out).toMatch(/<h2 style="margin:18px 0 8px;[^"]*">Títol<\/h2>/);
  });

  it("quita el margen a los párrafos de listas y destacados", () => {
    const out = welcomeToEmailHtml("<ul><li><p>un</p></li></ul><blockquote><p>nota</p></blockquote>", vars);
    expect(out).toMatch(/<li style="margin:0 0 4px;?"><p style="margin:0;line-height:1.6;?">un<\/p><\/li>/);
    expect(out).toMatch(/<p style="margin:0;line-height:1.6;?">nota<\/p><\/blockquote>/);
    expect(out).not.toContain("data-tight");
  });

  it("sustituye las variables y escapa sus valores", () => {
    const out = welcomeToEmailHtml("<p>Hola {{nombre}}</p>", { nombre: "<b>Anna</b>" });
    expect(out).toContain("Hola &lt;b&gt;Anna&lt;/b&gt;");
  });

  it("sanea también al pintar, aunque lo guardado venga sucio", () => {
    const out = welcomeToEmailHtml('<p>Hola<script>x</script><a href="javascript:x">y</a></p>', vars);
    expect(out).not.toContain("script");
    expect(out).not.toContain("javascript");
  });

  it("los mensajes antiguos en markdown se pintan como antes", () => {
    const md = "Hola {{nombre}},\n\n**GESEM** et dona la _benvinguda_.\n\n- Primer punt";
    expect(welcomeToEmailHtml(md, vars)).toBe(markdownToHtml("Hola Marta,\n\n**GESEM** et dona la _benvinguda_.\n\n- Primer punt"));
    expect(welcomeToEmailHtml(md, vars)).toContain("<strong>GESEM</strong>");
  });
});

describe("texto plano, editor y detección", () => {
  it("convierte a texto legible con viñetas y enlaces", () => {
    const text = welcomeToText(
      '<p>Hola <strong>{{nombre}}</strong> &amp; equip</p><ul><li><p>Un</p></li><li><p>Dos</p></li></ul><p><a href="https://gesem.cat">Web</a></p>',
      vars,
    );
    expect(text).toBe("Hola Marta & equip\n\n- Un\n- Dos\n\nWeb (https://gesem.cat)");
  });

  it("en markdown, el texto plano no toca los guiones bajos de un correo", () => {
    expect(welcomeToText("Escriu a nom_cognom_x@csuc.cat", vars)).toBe("Escriu a nom_cognom_x@csuc.cat");
  });

  it("carga los mensajes antiguos en el editor como HTML limpio", () => {
    expect(welcomeForEditor("Hola **{{nombre}}**\n\n- punt")).toBe("<p>Hola <strong>{{nombre}}</strong></p><ul><li>punt</li></ul>");
    expect(welcomeForEditor("")).toBe("");
  });

  it("detecta vacío y formato", () => {
    expect(welcomeIsEmpty("<p></p>")).toBe(true);
    expect(welcomeIsEmpty("<p>&nbsp;</p>")).toBe(true);
    expect(welcomeIsEmpty("<p>x</p>")).toBe(false);
    expect(isWelcomeHtml("<p>x</p>")).toBe(true);
    expect(isWelcomeHtml("Hola **x**")).toBe(false);
    expect(isWelcomeHtml("Hola <b>x</b>")).toBe(false);
  });

  it("normaliza la respuesta de la IA (bloque de código, markdown o HTML)", () => {
    expect(welcomeFromAi("```html\n<p>Hola <b>x</b></p>\n```")).toBe("<p>Hola <strong>x</strong></p>");
    expect(welcomeFromAi("Hola **x**")).toBe("<p>Hola <strong>x</strong></p>");
  });
});
