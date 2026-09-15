import { describe, expect, it } from "vitest";
import { countWords, lengthTone, parseWordRange } from "./word-count";

describe("medidas de extensión de la biblioteca", () => {
  it("cuenta palabras con saltos de línea y espacios repetidos", () => {
    expect(countWords("Tiende a combinar  decisión,\n\nexigencia y orientación.")).toBe(7);
    expect(countWords("   ")).toBe(0);
  });

  it("lee el rango de la pista de cada apartado", () => {
    expect(parseWordRange("180-250 palabras")).toEqual({ min: 180, max: 250 });
    expect(parseWordRange("5 preguntas")).toBeNull();
  });

  it("clasifica la extensión respecto al rango", () => {
    const r = { min: 120, max: 180 };
    expect(lengthTone(40, r)).toBe("short");
    expect(lengthTone(150, r)).toBe("ok");
    expect(lengthTone(200, r)).toBe("long");
  });
});
