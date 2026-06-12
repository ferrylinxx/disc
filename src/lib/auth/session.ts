import "server-only";
import { cookies } from "next/headers";
import {
  decryptSession,
  encryptSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  type SessionMembership,
  type GlobalRole,
  type SessionPayload,
} from "./jwt";

export { SESSION_COOKIE };

interface CreateSessionInput {
  userId: string;
  email: string;
  name: string | null;
  globalRole: GlobalRole;
  memberships: SessionMembership[];
}

/**
 * La cookie solo se marca `secure` si la app se sirve por HTTPS: con un
 * despliegue interno por HTTP (p. ej. http://IP:puerto) una cookie `secure`
 * nunca llegaría al servidor y el login quedaría roto.
 */
function isSecureCookie(): boolean {
  const appUrl = process.env.APP_URL?.trim();
  if (appUrl) return appUrl.startsWith("https:");
  return process.env.NODE_ENV === "production";
}

/** Crea la sesión y fija la cookie HttpOnly firmada. */
export async function createSession(input: CreateSessionInput): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  const token = await encryptSession({ ...input, expiresAt: expiresAt.toISOString() });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Lee y verifica la sesión actual (o null si no hay/expiró). */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return decryptSession(token);
}

/** Elimina la cookie de sesión (logout). */
export async function deleteSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
