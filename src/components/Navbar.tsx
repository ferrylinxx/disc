import { currentSession } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { homePathForRole, primaryRole } from "@/lib/auth/rbac";
import { getLang } from "@/lib/i18n/server";
import { NavbarClient } from "./NavbarClient";

/** Barra de navegación consciente de la sesión y del idioma (Server Component). */
export default async function Navbar() {
  const session = await currentSession();
  const panelHref = session ? homePathForRole(primaryRole(session)) : null;
  // El superadmin edita su perfil en la consola; el resto, en su panel.
  const profileHref = !session
    ? null
    : session.globalRole === "SUPERADMIN"
      ? "/admin/perfil"
      : "/panel/cuenta";
  const [lang, me] = await Promise.all([
    getLang(),
    session
      ? prisma.user.findUnique({
          where: { id: session.userId },
          select: { name: true, image: true },
        })
      : null,
  ]);

  return (
    <NavbarClient
      authed={!!session}
      displayName={me?.name ?? session?.name ?? session?.email ?? null}
      image={me?.image ?? null}
      panelHref={panelHref}
      profileHref={profileHref}
      lang={lang}
    />
  );
}
