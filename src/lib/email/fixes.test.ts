import { describe, expect, it } from "vitest";
import {
  applyFix,
  countSpacing,
  findApostrophes,
  findEla,
  fixApostrophes,
  fixEla,
  fixSpacing,
  removeGreeting,
  stripSubjectMarkup,
  type EmailFields,
} from "./fixes";

const fields = (over: Partial<EmailFields> = {}): EmailFields => ({
  programName: "CONNECTAR PER A COL.LABORAR",
  programNameHtml: "<strong>CONNECTAR PER A COL.LABORAR</strong>",
  emailSubject: "Benvingut/da al taller **Estils comunicatius**",
  welcomeIntro: "<p>Hola {{nombre}},</p><p>El taller serà el 14 d´octubre a les vostres instal.lacions .</p>",
  ...over,
});

describe("arreglos automáticos del correo", () => {
  it("quita el formato del asunto (caso real de CSUC)", () => {
    expect(stripSubjectMarkup("Benvingut/da al taller **Estils comunicatius**")).toBe(
      "Benvingut/da al taller Estils comunicatius",
    );
  });

  it("corrige el apóstrofo con acento, también ante comillas", () => {
    expect(fixApostrophes("d´octubre i d`una i d´\"Estils\"")).toBe("d’octubre i d’una i d’\"Estils\"");
    expect(findApostrophes("el 14 d´octubre, d´una")).toEqual(["d´octubre", "d´una"]);
    // El aviso solo cita lo que el arreglo corrige: "Nom´¨es" queda para la IA.
    expect(findApostrophes("Nom´¨es necessitaràs")).toEqual([]);
    // Un acento suelto que no va entre letras no se toca.
    expect(fixApostrophes("un ´ suelto")).toBe("un ´ suelto");
  });

  it("corrige la ela geminada sin tocar correos ni webs", () => {
    expect(fixEla("col.laborar i INSTAL.LACIONS")).toBe("col·laborar i INSTAL·LACIONS");
    expect(fixEla("escriu a mail.laura@csuc.cat o www.col.laborar.cat")).toBe(
      "escriu a mail.laura@csuc.cat o www.col.laborar.cat",
    );
    expect(findEla("per col.laborar, i instal.lacions.")).toEqual(["col.laborar", "instal.lacions"]);
  });

  it("quita espacios dobles y antes de puntuación", () => {
    expect(fixSpacing("Hola  món , com va ?")).toBe("Hola món, com va?");
    expect(countSpacing("Hola  món , com va ?")).toBe(3);
  });

  it("quita el saludo si ocupa su propio párrafo", () => {
    expect(removeGreeting("<p>Hola {{nombre}},</p><p>Et donem la benvinguda.</p>")).toBe("<p>Et donem la benvinguda.</p>");
    expect(removeGreeting('<p style="text-align:center"><strong>Hola {{nombre}},</strong></p><p>x</p>')).toBe("<p>x</p>");
  });

  it("quita solo la frase de saludo si el párrafo sigue", () => {
    expect(removeGreeting("<p>Hola {{nombre}}, et convidem al taller.</p>")).toBe("<p>Et convidem al taller.</p>");
    expect(removeGreeting("<p>Buenos días Marta: te esperamos.</p>")).toBe("<p>Te esperamos.</p>");
  });

  it("no toca un mensaje que no empieza saludando", () => {
    const html = "<p>Et donem la benvinguda, {{nombre}}.</p>";
    expect(removeGreeting(html)).toBe(html);
    expect(removeGreeting("<p>Holanda és lluny.</p>")).toBe("<p>Holanda és lluny.</p>");
  });

  it("aplica la tipografía a todos los campos sin romper etiquetas ni variables", () => {
    const f = applyFix(applyFix(applyFix(fields(), "apostrophes"), "ela"), "spacing");
    expect(f.programName).toBe("CONNECTAR PER A COL·LABORAR");
    expect(f.programNameHtml).toBe("<strong>CONNECTAR PER A COL·LABORAR</strong>");
    expect(f.welcomeIntro).toBe("<p>Hola {{nombre}},</p><p>El taller serà el 14 d’octubre a les vostres instal·lacions.</p>");
    expect(f.emailSubject).toBe(fields().emailSubject);
  });

  it("cada arreglo solo cambia su campo", () => {
    const f = applyFix(fields(), "subject-markup");
    expect(f.emailSubject).toBe("Benvingut/da al taller Estils comunicatius");
    expect(f.welcomeIntro).toBe(fields().welcomeIntro);
    expect(applyFix(fields(), "greeting").welcomeIntro).toBe(
      "<p>El taller serà el 14 d´octubre a les vostres instal.lacions .</p>",
    );
  });
});
