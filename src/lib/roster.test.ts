import { describe, expect, it } from "vitest";
import { parseRoster } from "./roster";

describe("lectura de listados de participantes", () => {
  it("formato de siempre: Nombre, correo", () => {
    expect(parseRoster("Marta Puig, marta.puig@csuc.cat\nJordi Vilà; jordi.vila@csuc.cat")).toEqual([
      { fullName: "Marta Puig", email: "marta.puig@csuc.cat" },
      { fullName: "Jordi Vilà", email: "jordi.vila@csuc.cat" },
    ]);
  });

  it("caso real de la foto de CSUC: Cognoms, Nom, correu → Nom Cognoms", () => {
    const raw = [
      "Portugal Brugada, Albert, albert.portugal@csuc.cat",
      "Vega Sivera, Ricard de la, ricard.delavega@csuc.cat",
      "Via Fuentes, M. Teresa, teresa.via@csuc.cat",
    ].join("\n");
    expect(parseRoster(raw)).toEqual([
      { fullName: "Albert Portugal Brugada", email: "albert.portugal@csuc.cat" },
      { fullName: "Ricard de la Vega Sivera", email: "ricard.delavega@csuc.cat" },
      { fullName: "M. Teresa Via Fuentes", email: "teresa.via@csuc.cat" },
    ]);
  });

  it("respeta la cabecera cuando dice que el nombre va primero", () => {
    expect(parseRoster("Nom, Cognoms, Correu\nAlbert, Portugal Brugada, albert.portugal@csuc.cat")).toEqual([
      { fullName: "Albert Portugal Brugada", email: "albert.portugal@csuc.cat" },
    ]);
  });

  it("encuentra el correo en cualquier columna y salta cabeceras", () => {
    expect(parseRoster("Correo\tNombre\nana@csuc.cat\tAna Serra")).toEqual([
      { fullName: "Ana Serra", email: "ana@csuc.cat" },
    ]);
    expect(parseRoster("Nombre, Email\nAna Serra, ana@csuc.cat")).toHaveLength(1);
  });

  it("las líneas sin correo válido salen sin correo (se cuentan como omitidas)", () => {
    expect(parseRoster("Ana Serra, ana.csuc.cat\n\n  \nPere")).toEqual([
      { fullName: "Ana Serra ana.csuc.cat", email: "" },
      { fullName: "Pere", email: "" },
    ]);
  });
});
