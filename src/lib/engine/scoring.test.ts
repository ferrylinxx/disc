import { describe, expect, it } from "vitest";
import { DISC_GESEM_V1 } from "@/lib/instruments/disc-gesem";
import { score } from "./scoring";
import type { ItemResponse } from "./types";

/** Construye respuestas marcando una misma opción Más/Menos en cada ítem. */
function uniformResponses(most: string, least: string): ItemResponse[] {
  return DISC_GESEM_V1.items.map((i) => ({
    itemCode: i.code,
    mostOptionCode: most,
    leastOptionCode: least,
  }));
}

describe("motor de scoring DISC GESEM", () => {
  it("el instrumento tiene 7 contextos y 35 ítems", () => {
    expect(DISC_GESEM_V1.contexts).toHaveLength(7);
    expect(DISC_GESEM_V1.items).toHaveLength(35);
  });

  it("perfil D muy definido cuando Más=D y Menos=C en todos los ítems", () => {
    const result = score(DISC_GESEM_V1, uniformResponses("d", "c"));
    const d = result.global.find((s) => s.dimensionCode === "D")!;
    const c = result.global.find((s) => s.dimensionCode === "C")!;
    expect(d.raw).toBe(35);
    expect(d.percent).toBe(100);
    expect(c.raw).toBe(-35);
    expect(c.percent).toBe(0);
    expect(result.primaryDimension).toBe("D");
    expect(result.isEq).toBe(false);
    expect(result.profileCode).toBe("DI");
    expect(result.intensity).toBe("MUY_DEFINIDA");
  });

  it("detecta perfil combinado DI cuando D e I están próximas", () => {
    const responses = DISC_GESEM_V1.items.map((item, idx) => ({
      itemCode: item.code,
      mostOptionCode: idx % 2 === 0 ? "d" : "i",
      leastOptionCode: "c",
    }));
    const result = score(DISC_GESEM_V1, responses);
    expect(result.isEq).toBe(false);
    expect(result.profileCode).toBe("DI");
    expect(result.primaryDimension).toBe("D");
    expect(result.secondaryDimension).toBe("I");
  });

  it("clasifica el perfil como EQ (adaptable) cuando el rango es estrecho", () => {
    const responses = DISC_GESEM_V1.items.map((item, idx) => {
      const dims = ["d", "i", "s", "c"];
      return {
        itemCode: item.code,
        mostOptionCode: dims[idx % 4],
        leastOptionCode: dims[(idx + 2) % 4],
      };
    });
    const result = score(DISC_GESEM_V1, responses);
    expect(result.eq).toBeGreaterThan(70);
    expect(result.profileCode).toBe("EQ");
    expect(result.isEq).toBe(true);
    expect(result.intensity).toBeNull();
  });

  it("el reparto proporcional global suma 100", () => {
    const result = score(DISC_GESEM_V1, uniformResponses("d", "c"));
    const sum = result.percentages.reduce((acc, p) => acc + p.share, 0);
    expect(sum).toBe(100);
    expect(result.percentages).toHaveLength(4);
  });

  it("calcula puntuaciones por contexto", () => {
    const result = score(DISC_GESEM_V1, uniformResponses("s", "d"));
    expect(Object.keys(result.byContext)).toHaveLength(7);
    const decisionS = result.byContext["DECISION"].find((s) => s.dimensionCode === "S")!;
    expect(decisionS.raw).toBe(5);
    expect(decisionS.percent).toBe(100);
  });

  it("reporta calidad completa de la cumplimentación", () => {
    const result = score(DISC_GESEM_V1, uniformResponses("i", "s"));
    expect(result.quality.complete).toBe(true);
    expect(result.quality.answeredItems).toBe(35);
  });
});
