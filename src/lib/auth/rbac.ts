/**
 * Modelo de roles efectivos y reglas de autorización (RBAC).
 * Edge-safe: solo tipos y lógica pura, reutilizable desde `proxy.ts`.
 *
 * Roles del producto:
 *  - SUPERADMIN  → Admin GESEM (global).
 *  - ORG_ADMIN   → Administrador Cliente (membership ADMIN).
 *  - FACILITATOR → Facilitador (membership FACILITATOR).
 *  - PARTICIPANT → Participante (sin rol de gestión).
 */
import type { SessionPayload } from "./jwt";

export type EffectiveRole =
  | "SUPERADMIN"
  | "ORG_ADMIN"
  | "FACILITATOR"
  | "PARTICIPANT";

/** Deriva los roles efectivos de una sesión (puede tener varios). */
export function effectiveRoles(session: SessionPayload | null): EffectiveRole[] {
  if (!session) return [];
  const roles = new Set<EffectiveRole>();
  if (session.globalRole === "SUPERADMIN") roles.add("SUPERADMIN");
  for (const m of session.memberships ?? []) {
    if (m.role === "ADMIN") roles.add("ORG_ADMIN");
    if (m.role === "FACILITATOR") roles.add("FACILITATOR");
  }
  if (roles.size === 0) roles.add("PARTICIPANT");
  return [...roles];
}

/** IDs de organizaciones donde el usuario es ADMIN cliente. */
export function adminOrganizationIds(session: SessionPayload | null): string[] {
  if (!session) return [];
  return (session.memberships ?? [])
    .filter((m) => m.role === "ADMIN")
    .map((m) => m.organizationId);
}

/** IDs de organizaciones donde el usuario es ADMIN o FACILITATOR. */
export function memberOrganizationIds(session: SessionPayload | null): string[] {
  if (!session) return [];
  return [...new Set((session.memberships ?? []).map((m) => m.organizationId))];
}

/** Rol principal (mayor privilegio) para decidir el panel por defecto. */
export function primaryRole(session: SessionPayload | null): EffectiveRole {
  const roles = effectiveRoles(session);
  const order: EffectiveRole[] = [
    "SUPERADMIN",
    "ORG_ADMIN",
    "FACILITATOR",
    "PARTICIPANT",
  ];
  return order.find((r) => roles.includes(r)) ?? "PARTICIPANT";
}

/** Ruta del panel inicial según el rol principal. */
export function homePathForRole(role: EffectiveRole): string {
  switch (role) {
    case "SUPERADMIN":
      return "/admin";
    case "ORG_ADMIN":
      return "/cliente";
    case "FACILITATOR":
      return "/facilitador";
    default:
      return "/panel";
  }
}

/** Prefijos de ruta protegidos y los roles que pueden acceder. */
export const ROUTE_GUARDS: { prefix: string; roles: EffectiveRole[] }[] = [
  { prefix: "/admin", roles: ["SUPERADMIN"] },
  { prefix: "/cliente", roles: ["SUPERADMIN", "ORG_ADMIN"] },
  { prefix: "/facilitador", roles: ["SUPERADMIN", "ORG_ADMIN", "FACILITATOR"] },
  // La evaluación requiere cuenta: cualquier usuario autenticado.
  {
    prefix: "/evaluacion",
    roles: ["SUPERADMIN", "ORG_ADMIN", "FACILITATOR", "PARTICIPANT"],
  },
  // Panel del participante: cualquier usuario autenticado.
  {
    prefix: "/panel",
    roles: ["SUPERADMIN", "ORG_ADMIN", "FACILITATOR", "PARTICIPANT"],
  },
];

/** ¿La ruta requiere autenticación? (cualquier prefijo protegido). */
export function isProtectedPath(pathname: string): boolean {
  return ROUTE_GUARDS.some((g) => pathname.startsWith(g.prefix));
}

/** ¿La sesión puede acceder a la ruta dada? */
export function canAccessPath(
  session: SessionPayload | null,
  pathname: string,
): boolean {
  const guard = ROUTE_GUARDS.find((g) => pathname.startsWith(g.prefix));
  if (!guard) return true;
  const roles = effectiveRoles(session);
  return guard.roles.some((r) => roles.includes(r));
}
