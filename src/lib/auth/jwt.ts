/**
 * Firma y verificación del token de sesión (HS256 con `jose`).
 * Módulo edge-safe: sin APIs de Node ni `next/headers`, de modo que puede
 * usarse tanto en Server Actions/RSC como en `proxy.ts` (Edge).
 */
import { SignJWT, jwtVerify } from "jose";

/** Rol global del usuario (alineado con el enum Prisma `GlobalRole`). */
export type GlobalRole = "SUPERADMIN" | "USER";

/** Rol dentro de una organización (alineado con `MembershipRole`). */
export type MembershipRole = "ADMIN" | "FACILITATOR";

export interface SessionMembership {
  organizationId: string;
  role: MembershipRole;
}

/** Carga mínima e imprescindible que viaja en la cookie de sesión. */
export interface SessionPayload {
  userId: string;
  email: string;
  name: string | null;
  globalRole: GlobalRole;
  memberships: SessionMembership[];
  /** Caducidad en ISO; se valida también de forma criptográfica. */
  expiresAt: string;
  [key: string]: unknown;
}

const SECRET = process.env.AUTH_SECRET ?? "dev-secret-change-me";
const encodedKey = new TextEncoder().encode(SECRET);
const ALG = "HS256";

/** Nombre de la cookie HttpOnly que guarda el token de sesión. */
export const SESSION_COOKIE = "gesem_session";

/** Duración de la sesión: 7 días. */
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export async function encryptSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decryptSession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: [ALG],
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}
