import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

/**
 * Utilidades de credenciales para cuentas de participante:
 * contraseña aleatoria, hash bcrypt y tokens de un solo uso para
 * establecer/cambiar la contraseña (reutiliza la tabla VerificationToken).
 */

// Sin caracteres ambiguos (0/O, 1/l/I) para que sea fácil de teclear.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

/** Genera una contraseña temporal legible (por defecto 12 caracteres). */
export function randomPassword(length = 12): string {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

/** Hash bcrypt de una contraseña en claro. */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

const PREFIX = "pwset:";
const TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 días

/**
 * Crea un token de un solo uso para establecer/cambiar contraseña de un usuario.
 * Se guarda en VerificationToken con identifier = "pwset:<userId>".
 */
export async function createPasswordSetToken(userId: string): Promise<string> {
  const token = globalThis.crypto.randomUUID().replace(/-/g, "");
  await prisma.verificationToken.create({
    data: {
      identifier: `${PREFIX}${userId}`,
      token,
      expires: new Date(Date.now() + TTL_MS),
    },
  });
  return token;
}

/**
 * Canjea un token de contraseña: valida que exista, no haya caducado y apunte a
 * un usuario. Devuelve el userId o null. Elimina el token (un solo uso).
 */
export async function consumePasswordSetToken(
  token: string,
): Promise<string | null> {
  const row = await prisma.verificationToken.findUnique({ where: { token } });
  if (!row || !row.identifier.startsWith(PREFIX)) return null;
  // Un solo uso: se borra tanto si es válido como si está caducado.
  await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
  if (row.expires.getTime() < Date.now()) return null;
  return row.identifier.slice(PREFIX.length);
}

/** Comprueba si un token de contraseña sigue siendo válido (sin canjearlo). */
export async function isPasswordSetTokenValid(token: string): Promise<boolean> {
  const row = await prisma.verificationToken.findUnique({ where: { token } });
  return Boolean(
    row && row.identifier.startsWith(PREFIX) && row.expires.getTime() >= Date.now(),
  );
}
