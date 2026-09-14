import { describe, expect, it } from "vitest";
import { assessResponseSpeed, classifySpeed } from "./quality";

/**
 * Tiempos reales (ms) de una pasada de prueba en producción: 35 ítems con una
 * media de 1 s, 34 de ellos por debajo de 3 s.
 */
const PASADA_DE_PRUEBA = [
  2534, 792, 772, 653, 621, 691, 712, 707, 690, 628, 688, 683, 829, 577, 667,
  706, 1264, 688, 705, 591, 644, 818, 595, 642, 2016, 3339, 1019, 985, 704, 986,
  702, 2514, 1170, 796, 1705,
];

describe("calidad por velocidad de respuesta", () => {
  it("marca la pasada de prueba real (1 s por ítem)", () => {
    expect(assessResponseSpeed(PASADA_DE_PRUEBA)).toEqual({
      status: "tooFast",
      timedItems: 35,
      fastItems: 34,
    });
  });

  it("no marca a quien lee las preguntas (de 10,8 a 34 s por ítem)", () => {
    const leyendo = Array.from({ length: 35 }, (_, i) => 10_800 + i * 680);
    expect(assessResponseSpeed(leyendo)).toEqual({
      status: "ok",
      timedItems: 35,
      fastItems: 0,
    });
  });

  it("el umbral es inclusivo: la mitad exacta de ítems rápidos marca", () => {
    expect(classifySpeed({ timedItems: 10, fastItems: 5 }).status).toBe("tooFast");
    expect(classifySpeed({ timedItems: 10, fastItems: 4 }).status).toBe("ok");
  });

  it("un ítem de exactamente 3 s no cuenta como rápido", () => {
    expect(assessResponseSpeed(Array(10).fill(3000)).fastItems).toBe(0);
  });

  it("ignora tiempos ausentes y no decide con pocos datos", () => {
    expect(assessResponseSpeed([null, undefined, 500, 400])).toEqual({
      status: "insufficientData",
      timedItems: 2,
      fastItems: 2,
    });
  });
});
