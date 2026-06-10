import Link from "next/link";
import { currentSession } from "@/lib/auth/dal";
import { homePathForRole, primaryRole } from "@/lib/auth/rbac";
import LogoutButton from "./LogoutButton";

/** Barra de navegación consciente de la sesión (Server Component). */
export default async function Navbar() {
  const session = await currentSession();
  const panelHref = session
    ? homePathForRole(primaryRole(session))
    : null;

  return (
    <header className="sticky top-0 z-30">
      <div className="glass border-b border-white/60">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="bg-brand flex h-8 w-8 items-center justify-center rounded-xl text-sm font-black text-white shadow-lg shadow-indigo-500/30">
              G
            </span>
            <span className="text-sm font-bold tracking-tight text-slate-900">
              DISC <span className="text-gradient">GESEM</span>
            </span>
          </Link>

          <div className="flex items-center gap-2.5">
            {session ? (
              <>
                <span className="hidden text-xs font-medium text-slate-500 sm:inline">
                  {session.name ?? session.email}
                </span>
                {panelHref && (
                  <Link
                    href={panelHref}
                    className="rounded-full px-4 py-2 text-xs font-semibold text-slate-700 transition hover:text-slate-900"
                  >
                    Mi panel
                  </Link>
                )}
                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2 text-xs font-semibold text-slate-700 transition hover:text-slate-900"
                >
                  Acceder
                </Link>
                <Link
                  href="/evaluacion"
                  className="bg-brand rounded-full px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-90"
                >
                  Comenzar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
