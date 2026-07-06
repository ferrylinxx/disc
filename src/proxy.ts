/**
 * Proxy (Next.js 16 — sustituye a `middleware`). Protección de rutas en el
 * borde: verifica la cookie de sesión y aplica los guards de rol (RBAC).
 *
 * Solo realiza comprobaciones optimistas (lee la cookie firmada). La
 * autorización definitiva vive cerca del dato, en el DAL de cada página/acción.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession, SESSION_COOKIE } from "@/lib/auth/jwt";
import {
  canAccessPath,
  homePathForRole,
  isProtectedPath,
  primaryRole,
} from "@/lib/auth/rbac";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await decryptSession(token);

  // Usuario autenticado que visita /login → respeta ?next (p. ej. el enlace de
  // invitación lleva next=/evaluacion) y, si no, va a su panel por rol. Evita
  // que un admin invitado a hacer el test acabe en /admin.
  if (pathname === "/login" && session) {
    const url = req.nextUrl.clone();
    const next = req.nextUrl.searchParams.get("next");
    const safeNext =
      next && next.startsWith("/") && !next.startsWith("//") ? next : null;
    url.pathname = safeNext ?? homePathForRole(primaryRole(session));
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isProtectedPath(pathname)) {
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (!canAccessPath(session, pathname)) {
      const url = req.nextUrl.clone();
      url.pathname = "/denegado";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Excluye API, estáticos, imágenes y assets con extensión.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
