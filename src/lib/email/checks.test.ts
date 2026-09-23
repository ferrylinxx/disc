import { describe, expect, it } from "vitest";
import { checkInvitation } from "./checks";

const today = () => new Date("2026-09-23T10:00:00");
const ok = {
  programName: "ESTILS COMUNICATIUS",
  subject: "Benvingut/da al taller {{programa}}",
  welcomeIntro: "<p>Et donem la benvinguda al procés.</p>",
  sessionDate: "2026-10-10",
  deadline: "2026-10-07",
  showProgramBox: true,
};
const warns = (input: Parameters<typeof checkInvitation>[0]) =>
  checkInvitation({ today: today(), ...input })
    .filter((c) => c.level === "warn")
    .map((c) => c.text);

describe("revisión automática del correo de invitación", () => {
  it("sin problemas, lo dice", () => {
    const r = checkInvitation({ ...ok, today: today() });
    expect(r[0]).toEqual({ level: "ok", text: "No se han detectado problemas." });
    expect(r.filter((c) => c.level === "warn")).toHaveLength(0);
  });

  it("avisa de los asteriscos en el asunto (caso real de CSUC)", () => {
    expect(warns({ ...ok, subject: "Benvingut/da al taller **Estils comunicatius**" }).join()).toContain("asunto no admite formato");
  });

  it("avisa del saludo repetido, también con formato y en castellano", () => {
    expect(warns({ ...ok, welcomeIntro: "<p><strong>Hola {{nombre}},</strong></p><p>…</p>" }).join()).toContain("saludo dos veces");
    expect(warns({ ...ok, welcomeIntro: "Buenos días, {{nombre}}" }).join()).toContain("saludo dos veces");
    expect(warns({ ...ok, welcomeIntro: "<p>Holanda és lluny</p>" })).toHaveLength(0);
  });

  it("avisa de variables inexistentes y acepta las conocidas y sus alias", () => {
    expect(warns({ ...ok, welcomeIntro: "<p>{{apellido}} y {{ Nombre }}</p>" })).toEqual([
      "La variable {{apellido}} no existe y saldrá escrita tal cual. Usa los botones de variables.",
    ]);
  });

  it("detecta fechas pasadas y fecha límite posterior al taller", () => {
    const w = warns({ ...ok, sessionDate: "2026-09-01", deadline: "2026-09-20" }).join(" | ");
    expect(w).toContain("taller ya ha pasado");
    expect(w).toContain("fecha límite ya ha pasado");
    expect(warns({ ...ok, sessionDate: "2026-10-01", deadline: "2026-10-05" }).join()).toContain("posterior al taller");
  });

  it("sin programa, avisa de que se envía el genérico", () => {
    expect(warns({ ...ok, programName: "" }).join()).toContain("correo genérico");
  });

  it("informa (sin alarmar) del asunto largo y del recuadro oculto", () => {
    const r = checkInvitation({ ...ok, subject: "x".repeat(75), showProgramBox: false, today: today() });
    expect(r.filter((c) => c.level === "info").map((c) => c.text).join()).toMatch(/75 caracteres.*recuadro de fechas está oculto/);
    expect(r[0].level).toBe("ok");
  });
});
