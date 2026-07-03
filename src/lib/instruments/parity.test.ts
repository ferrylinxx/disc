import { describe, it, expect } from "vitest";
import { DISC_GESEM_V1, DISC_GESEM_V1_CA } from "./disc-gesem";

/**
 * La versión catalana del instrumento solo cambia los textos: debe mantener los
 * mismos códigos y orden de contextos, ítems y opciones que la española (el
 * cálculo usa los códigos). Este test evita que la traducción se desincronice.
 */
describe("Paridad del instrumento ES/CA", () => {
  it("mismos contextos y en el mismo orden", () => {
    expect(DISC_GESEM_V1_CA.contexts.map((c) => c.code)).toEqual(
      DISC_GESEM_V1.contexts.map((c) => c.code),
    );
  });

  it("mismas dimensiones y en el mismo orden", () => {
    expect(DISC_GESEM_V1_CA.dimensions.map((d) => d.code)).toEqual(
      DISC_GESEM_V1.dimensions.map((d) => d.code),
    );
  });

  it("mismos ítems (código, contexto y opciones) en el mismo orden", () => {
    const es = DISC_GESEM_V1.items;
    const ca = DISC_GESEM_V1_CA.items;
    expect(ca.length).toBe(es.length);
    es.forEach((item, i) => {
      expect(ca[i].code).toBe(item.code);
      expect(ca[i].contextCode).toBe(item.contextCode);
      expect(ca[i].options.map((o) => o.code)).toEqual(
        item.options.map((o) => o.code),
      );
      expect(ca[i].options.map((o) => o.dimensionCode)).toEqual(
        item.options.map((o) => o.dimensionCode),
      );
    });
  });

  it("todos los textos catalanes están rellenos", () => {
    for (const item of DISC_GESEM_V1_CA.items) {
      expect(item.prompt.trim().length).toBeGreaterThan(0);
      for (const o of item.options) {
        expect(o.text.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
