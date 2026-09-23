import { describe, expect, it } from "vitest";
import { invitationEmail } from "./templates";

const base = {
  participantName: "Laura Ejemplo",
  accountEmail: "laura@ejemplo.com",
  loginUrl: "https://disc.gesem.es/login",
  setPasswordUrl: "https://disc.gesem.es/restablecer/x",
  lang: "ca" as const,
};
const program = {
  name: "ESTILS COMUNICATIUS",
  sessionDate: "2026-10-10",
  sessionInfo: "les vostres instal·lacions",
  deadline: "2026-10-07",
  welcomeIntro: "<p>Hola {{nombre}}</p>",
};

describe("recuadro del programa en el correo de invitación", () => {
  it("se muestra por defecto, con taller y fecha límite también en el texto plano", () => {
    const email = invitationEmail({ ...base, program });
    expect(email.html).toMatch(/>Taller<\/td>/);
    expect(email.html).toContain("10 d’octubre del 2026");
    expect(email.text).toContain("Data límit: 7 d’octubre del 2026");
  });

  it("se oculta si la organización lo desactiva, sin quitar la bienvenida ni el mensaje", () => {
    const email = invitationEmail({ ...base, program: { ...program, showInfo: false } });
    expect(email.html).not.toMatch(/>(Programa|Taller|Data límit)<\/td>/);
    expect(email.html).not.toContain("10 d’octubre del 2026");
    expect(email.text).not.toContain("Data límit");
    expect(email.html).toContain("ESTILS COMUNICATIUS");
    expect(email.html).toContain("Hola Laura");
  });
});
