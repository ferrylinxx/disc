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
      "La variable {{apellido}} no existe y saldrá escrita tal cual. Usa los botones de «Insertar».",
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

  it("detecta apóstrofos con acento y ela geminada, con arreglo automático", () => {
    const r = checkInvitation({
      ...ok,
      programName: "CONNECTAR PER A COL.LABORAR",
      welcomeIntro: "<p>Et donem la benvinguda el 14 d´octubre a les vostres instal.lacions.</p>",
      today: today(),
    });
    const apos = r.find((c) => c.fix === "apostrophes");
    const ela = r.find((c) => c.fix === "ela");
    expect(apos?.text).toContain("«d´octubre»");
    expect(ela?.text).toContain("«COL.LABORAR» y «instal.lacions»");
    expect(apos?.field).toBe("typography");
  });

  it("asocia cada aviso a su campo y a su arreglo", () => {
    const r = checkInvitation({ ...ok, subject: "Hola **x**", welcomeIntro: "<p>Hola {{nombre}},</p>", today: today() });
    expect(r.find((c) => c.fix === "subject-markup")?.field).toBe("subject");
    expect(r.find((c) => c.fix === "greeting")?.field).toBe("welcome");
  });

  it("avisa si el mensaje está en el otro idioma", () => {
    const es = "<p>Te damos la bienvenida y te pedimos que completes el cuestionario con calma antes de la sesión, para que puedas llegar con tus ideas. Es muy breve y te ayudará también a preparar el taller con los compañeros.</p>";
    expect(warns({ ...ok, welcomeIntro: es, lang: "ca" } as Parameters<typeof checkInvitation>[0]).join()).toContain("parece estar en castellano");
    expect(warns({ ...ok, welcomeIntro: es, lang: "es" } as Parameters<typeof checkInvitation>[0])).toHaveLength(0);
  });

  it("el mensaje real de CSUC (en catalán, con «amb tu mateix») no se toma por castellano", () => {
    const ca = "<p>Més que respondre un qüestionari, et convidem a regalar-te uns minuts amb tu mateix: un espai per reflexionar, conèixer-te millor i arribar al taller amb una mirada més conscient. Perquè entendre com ens comuniquem també ens ajuda.</p>";
    expect(warns({ ...ok, welcomeIntro: ca, lang: "ca" } as Parameters<typeof checkInvitation>[0])).toHaveLength(0);
  });

  it("cuenta la longitud visible y avisa de las letras especiales en el asunto", () => {
    const r = checkInvitation({ ...ok, subject: "Benvinguda al taller 𝗘𝘀𝘁𝗶𝗹𝘀", today: today() });
    const texts = r.map((c) => c.text).join();
    expect(texts).toContain("letras especiales");
    expect(texts).not.toContain("caracteres");
    expect(r[0].level).toBe("ok");
  });

  it("informa del asunto en mayúsculas", () => {
    const r = checkInvitation({ ...ok, subject: "BENVINGUT AL TALLER", today: today() });
    expect(r.map((c) => c.text).join()).toContain("todo en mayúsculas");
  });
});

