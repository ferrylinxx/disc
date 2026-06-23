import { currentSession } from "@/lib/auth/dal";
import { homePathForRole, primaryRole } from "@/lib/auth/rbac";
import { NavbarClient } from "./NavbarClient";

/** Barra de navegación consciente de la sesión (Server Component). */
export default async function Navbar() {
  const session = await currentSession();
  const panelHref = session ? homePathForRole(primaryRole(session)) : null;

  return (
    <NavbarClient
      authed={!!session}
      displayName={session?.name ?? session?.email ?? null}
      panelHref={panelHref}
    />
  );
}
