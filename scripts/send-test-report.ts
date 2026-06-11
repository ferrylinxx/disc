/**
 * Script PUNTUAL de prueba: genera un resultado de ejemplo con el motor de
 * scoring, compone el nuevo informe por email ("Mapa de Interacción
 * Profesional") y lo envía a un destinatario indicado. Carga credenciales SMTP
 * desde .env (NO escribe secretos en consola). Uso:
 *   npx tsx scripts/send-test-report.ts [destinatario]
 */
import "dotenv/config";
import nodemailer from "nodemailer";
import { DISC_GESEM_V1 } from "../src/lib/instruments/disc-gesem";
import { score } from "../src/lib/engine/scoring";
import { reportEmail } from "../src/lib/email/templates";
import type { ItemResponse } from "../src/lib/engine/types";

const TO = process.argv[2] ?? "ferrangarola22@gmail.com";

// "Más" por contexto para que el mapa por contextos sea variado y realista.
const MOST_BY_CONTEXT: Record<string, string> = {
  DECISION: "d",
  ACCION: "d",
  COMUNICACION: "i",
  COLABORACION: "s",
  CAMBIO: "i",
  CONFLICTO: "c",
  ORGANIZACION: "c",
};
// "Menos" por contexto (siempre distinto de "Más").
const LEAST_BY_CONTEXT: Record<string, string> = {
  DECISION: "c",
  ACCION: "c",
  COMUNICACION: "c",
  COLABORACION: "c",
  CAMBIO: "c",
  CONFLICTO: "s",
  ORGANIZACION: "i",
};

function sampleResponses(): ItemResponse[] {
  return DISC_GESEM_V1.items.map((i) => ({
    itemCode: i.code,
    mostOptionCode: MOST_BY_CONTEXT[i.contextCode] ?? "d",
    leastOptionCode: LEAST_BY_CONTEXT[i.contextCode] ?? "c",
  }));
}

function readSmtp() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT ?? "465");
  const secure = (process.env.SMTP_SECURE ?? "true") !== "false";
  const from =
    process.env.EMAIL_FROM ?? (user ? `DISC GESEM <${user}>` : undefined);
  return { host, user, pass, port, secure, from };
}

async function main() {
  const { host, user, pass, port, secure, from } = readSmtp();
  if (!host || !user || !pass) {
    throw new Error(
      "SMTP no configurado: define SMTP_HOST, SMTP_USER y SMTP_PASS en .env",
    );
  }

  const result = score(DISC_GESEM_V1, sampleResponses());
  const email = reportEmail({
    participantName: "Ferran (prueba)",
    result,
    def: DISC_GESEM_V1,
  });

  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transport.verify();
  const info = await transport.sendMail({
    from,
    to: TO,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });

  console.log("Perfil de prueba:", result.profileCode, "· EQ", result.eq);
  console.log("Enviado a:", TO);
  console.log("messageId:", info.messageId);
}

main().catch((err) => {
  console.error("Fallo al enviar el correo de prueba:", err.message);
  process.exit(1);
});
