import { describe, expect, it } from "vitest";
import { DISC_GESEM_V1 } from "@/lib/instruments/disc-gesem";
import { score } from "@/lib/engine/scoring";
import { generateInsights } from "./disc-gesem.insights";

/** Respuestas uniformes: la misma opción Más/Menos en todos los ítems. */
function resultado(most: string, least: string) {
  return score(
    DISC_GESEM_V1,
    DISC_GESEM_V1.items.map((i) => ({ itemCode: i.code, mostOptionCode: most, leastOptionCode: least })),
  );
}

/** Perfil EQ (flexible): Más/Menos rotando entre las cuatro opciones. */
function resultadoEq() {
  const dims = ["d", "i", "s", "c"];
  return score(
    DISC_GESEM_V1,
    DISC_GESEM_V1.items.map((item, idx) => ({
      itemCode: item.code,
      mostOptionCode: dims[idx % 4],
      leastOptionCode: dims[(idx + 2) % 4],
    })),
  );
}

/**
 * Los insights del informe deben existir en los dos idiomas: si falta una
 * traducción, el catalán devolvería menos frases o repetiría el castellano.
 */
describe("insights del informe en catalán y castellano", () => {
  const casos = [
    ["recurso D", resultado("d", "c")],
    ["recurso I", resultado("i", "s")],
    ["recurso S", resultado("s", "d")],
    ["recurso C", resultado("c", "i")],
    ["perfil EQ", resultadoEq()],
  ] as const;

  for (const [nombre, r] of casos) {
    it(`${nombre}: mismas frases en los dos idiomas y ninguna en castellano dentro del catalán`, () => {
      const es = generateInsights(r, "es");
      const ca = generateInsights(r, "ca");
      expect(es.length).toBeGreaterThan(0);
      expect(ca).toHaveLength(es.length);
      for (const frase of ca) expect(es).not.toContain(frase);
    });
  }
});
