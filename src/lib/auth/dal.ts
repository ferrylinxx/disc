import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "./session";
import {
  canAccessPath,
  effectiveRoles,
  homePathForRole,
  primaryRole,
  type EffectiveRole,
} from "./rbac";
import type { SessionPayload } from "./jwt";

/**
 * Capa de acceso a datos de auth. Centraliza la verificación de sesión y los
 * guards de rol para RSC y Server Actions (verificación cercana al dato).
 */

/** Sesión actual memoizada durante el render (puede ser null). */
export const currentSession = cache(getSession);

/** Exige sesión; si no hay, redirige a /login. Devuelve la sesión. */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await currentSession();
  if (!session) redirect("/login");
  return session;
}

/** Exige que la sesión tenga alguno de los roles; si no, deniega. */
export async function requireRole(
  ...roles: EffectiveRole[]
): Promise<SessionPayload> {
  const session = await requireAuth();
  const mine = effectiveRoles(session);
  const ok = roles.some((r) => mine.includes(r));
  if (!ok) redirect("/denegado");
  return session;
}

/** Exige acceso a una ruta concreta según ROUTE_GUARDS. */
export async function requirePathAccess(
  pathname: string,
): Promise<SessionPayload> {
  const session = await requireAuth();
  if (!canAccessPath(session, pathname)) redirect("/denegado");
  return session;
}

/** Ruta del panel inicial del usuario autenticado. */
export async function homePath(): Promise<string> {
  const session = await currentSession();
  return homePathForRole(primaryRole(session));
}
