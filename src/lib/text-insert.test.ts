import { describe, expect, it } from "vitest";
import { insertAt } from "./text-insert";

describe("insertar variables del correo en el cursor", () => {
  it("inserta en medio y deja el cursor tras la variable", () => {
    const r = insertAt("Hola , et donem la benvinguda", 5, 5, "{{nombre}}");
    expect(r.value).toBe("Hola {{nombre}}, et donem la benvinguda");
    expect(r.caret).toBe("Hola {{nombre}}".length);
  });

  it("sustituye el texto seleccionado", () => {
    const r = insertAt("Hola NOMBRE,", 5, 11, "{{nombre}}");
    expect(r.value).toBe("Hola {{nombre}},");
  });

  it("no añade espacio al principio del campo ni tras un salto de línea", () => {
    expect(insertAt("", 0, 0, "{{programa}}").value).toBe("{{programa}}");
    expect(insertAt("Hola\n", 5, 5, "{{programa}}").value).toBe("Hola\n{{programa}}");
  });

  it("añade un espacio si el cursor está pegado a una palabra", () => {
    const r = insertAt("Benvingut", 9, 9, "{{nombre}}");
    expect(r.value).toBe("Benvingut {{nombre}}");
    expect(r.caret).toBe(r.value.length);
  });

  it("no separa la variable de un paréntesis o comilla de apertura", () => {
    expect(insertAt("(", 1, 1, "{{email}}").value).toBe("({{email}}");
  });

  it("tolera posiciones fuera de rango", () => {
    expect(insertAt("abc", 99, 99, "X").value).toBe("abc X");
    expect(insertAt("abc", -5, 1, "X").value).toBe("Xbc");
  });
});
