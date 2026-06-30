import { currentSession } from "@/lib/auth/dal";
import { homePathForRole, primaryRole } from "@/lib/auth/rbac";
import { getLang } from "@/lib/i18n/server";
import { NavbarClient } from "./NavbarClient";

/** Barra de navegación consciente de la sesión y del idioma (Server Component). */
export default async function Navbar() {
  const session = await currentSession();
  const panelHref = session ? homePathForRole(primaryRole(session)) : null;
  const lang = await getLang();

  return (
    <NavbarClient
      authed={!!session}
      displayName={session?.name ?? session?.email ?? null}
      panelHref={panelHref}
      lang={lang}
    />
  );
}
