import "server-only";
import nodemailer from "nodemailer";

/**
 * Transporte SMTP (singleton) configurado desde variables de entorno.
 * Nunca se escriben credenciales en código: la contraseña vive en SMTP_PASS.
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, EMAIL_FROM
 */
const globalForMailer = globalThis as unknown as {
  mailer: nodemailer.Transporter | undefined;
};

function readConfig() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT ?? "465");
  // SSL directo (465) por defecto; STARTTLS si SMTP_SECURE=false.
  const secure = (process.env.SMTP_SECURE ?? "true") !== "false";
  const from =
    process.env.EMAIL_FROM ?? (user ? `DISC GESEM <${user}>` : undefined);
  return { host, user, pass, port, secure, from };
}

/** ¿Hay configuración SMTP suficiente para enviar correos? */
export function isMailConfigured(): boolean {
  const { host, user, pass } = readConfig();
  return Boolean(host && user && pass);
}

/**
 * Construye una URL absoluta a partir de una ruta relativa usando APP_URL
 * (necesario en emails, donde no existe `window.location`). Sin barra final.
 */
export function absoluteUrl(path: string): string {
  const base = (process.env.APP_URL ?? "http://localhost:3000").replace(
    /\/+$/,
    "",
  );
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}

function getTransport(): nodemailer.Transporter {
  if (globalForMailer.mailer) return globalForMailer.mailer;
  const { host, port, secure, user, pass } = readConfig();
  if (!host || !user || !pass) {
    throw new Error(
      "SMTP no configurado: define SMTP_HOST, SMTP_USER y SMTP_PASS en .env.local.",
    );
  }
  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
  if (process.env.NODE_ENV !== "production") globalForMailer.mailer = transport;
  return transport;
}

export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  /** Texto plano alternativo (opcional). */
  text?: string;
}

/** Envía un correo HTML. Lanza si el SMTP no está configurado o falla. */
export async function sendMail({ to, subject, html, text }: SendMailInput) {
  const transport = getTransport();
  const { from } = readConfig();
  await transport.sendMail({ from, to, subject, html, text });
}

export interface VerifyMailResult {
  ok: boolean;
  /** Resumen no sensible de la config (sin contraseña). */
  config: { host?: string; port: number; secure: boolean; user?: string };
  /** Mensaje de error si la verificación falla. */
  error?: string;
}

/**
 * Verifica la conexión y las credenciales SMTP con `transporter.verify()`.
 * Nunca devuelve la contraseña; solo metadatos no sensibles y el resultado.
 */
export async function verifyMail(): Promise<VerifyMailResult> {
  const { host, port, secure, user } = readConfig();
  const config = { host, port, secure, user };
  if (!isMailConfigured()) {
    return {
      ok: false,
      config,
      error: "SMTP no configurado: faltan SMTP_HOST, SMTP_USER o SMTP_PASS.",
    };
  }
  try {
    const transport = getTransport();
    await transport.verify();
    return { ok: true, config };
  } catch (err) {
    return {
      ok: false,
      config,
      error: err instanceof Error ? err.message : "Error desconocido al verificar SMTP.",
    };
  }
}
