import { describe, expect, it } from "vitest";
import { hasStyle, hasUnicodeStyle, setStyle, toggleStyle, visibleLength } from "./unicode-style";

describe("negrita y cursiva del asunto con letras Unicode", () => {
  it("pone y quita la negrita", () => {
    const bold = setStyle("Taller 2026", "bold", true);
    expect(bold).toBe("𝗧𝗮𝗹𝗹𝗲𝗿 𝟮𝟬𝟮𝟲");
    expect(hasStyle(bold, "bold")).toBe(true);
    expect(setStyle(bold, "bold", false)).toBe("Taller 2026");
  });

  it("conserva los acentos, la ce trencada, la eñe y la ela geminada", () => {
    const bold = setStyle("Procés d’Estils: col·laborar, niño, França", "bold", true);
    expect(bold).toContain("𝗣𝗿𝗼𝗰𝗲́𝘀");
    expect(bold).toContain("𝗰𝗼𝗹·𝗹𝗮𝗯𝗼𝗿𝗮𝗿");
    expect(bold).toContain("𝗻𝗶𝗻̃𝗼");
    expect(setStyle(bold, "bold", false)).toBe("Procés d’Estils: col·laborar, niño, França");
  });

  it("combina negrita y cursiva, y quita cada una por separado", () => {
    const both = setStyle(setStyle("Estils", "bold", true), "italic", true);
    expect(both).toBe("𝙀𝙨𝙩𝙞𝙡𝙨");
    expect(setStyle(both, "bold", false)).toBe("𝘌𝘴𝘵𝘪𝘭𝘴");
    expect(setStyle(both, "italic", false)).toBe("𝗘𝘀𝘁𝗶𝗹𝘀");
  });

  it("no toca las variables", () => {
    expect(setStyle("Hola {{nombre}}", "bold", true)).toBe("𝗛𝗼𝗹𝗮 {{nombre}}");
  });

  it("alterna: si ya está todo en negrita, la quita", () => {
    expect(toggleStyle("Hola", "bold")).toBe("𝗛𝗼𝗹𝗮");
    expect(toggleStyle("𝗛𝗼𝗹𝗮", "bold")).toBe("Hola");
    // Mezclado: la pone en todo.
    expect(toggleStyle("𝗛ola", "bold")).toBe("𝗛𝗼𝗹𝗮");
  });

  it("detecta el estilo y cuenta la longitud visible", () => {
    expect(hasUnicodeStyle("Hola 𝗺𝗼́𝗻")).toBe(true);
    expect(hasUnicodeStyle("Hola món")).toBe(false);
    expect("𝗛𝗼𝗹𝗮".length).toBe(8);
    expect(visibleLength("𝗛𝗼𝗹𝗮")).toBe(4);
  });
});
