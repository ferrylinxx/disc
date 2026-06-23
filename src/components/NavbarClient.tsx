"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

/** Secciones de la landing (ancladas). Solo se muestran en la home. */
const SECTIONS = [
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#dimensiones", label: "El modelo" },
  { href: "/#plataforma", label: "La plataforma" },
];

interface Props {
  authed: boolean;
  displayName: string | null;
  panelHref: string | null;
}

/** Barra de navegación (cliente): navegación de secciones + menú móvil. */
export function NavbarClient({ authed, displayName, panelHref }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const close = () => setOpen(false);

  // Al hacer scroll, la barra deja de ser transparente y se compacta.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fondo sólido si se ha hecho scroll o si el menú móvil está abierto.
  const solid = scrolled || open;

  return (
    <header className="sticky top-0 z-40">
      <div
        className={`transition-all duration-300 ${
          solid
            ? "glass border-b border-white/60 shadow-sm shadow-slate-900/5"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div
          className={`mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 transition-all duration-300 ${
            solid ? "py-2.5" : "py-4"
          }`}
        >
          {/* Logo */}
          <Link href="/" onClick={close} className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/gesem-logo.svg"
              alt="GESEM"
              className={`w-auto transition-all duration-300 ${solid ? "h-6" : "h-7"}`}
            />
            <span className="hidden h-5 w-px bg-slate-300 sm:block" />
            <span className="hidden text-sm font-bold tracking-tight text-slate-900 sm:inline">
              DISC
            </span>
          </Link>

          {/* Navegación de secciones (solo home, escritorio) */}
          {isHome && (
            <nav className="hidden items-center gap-1 md:flex">
              {SECTIONS.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="group relative rounded-full px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
                >
                  {s.label}
                  <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-brand transition group-hover:scale-x-100" />
                </Link>
              ))}
            </nav>
          )}

          {/* Acciones (escritorio) */}
          <div className="hidden items-center gap-2.5 md:flex">
            {authed ? (
              <>
                {displayName && (
                  <span className="hidden text-xs font-medium text-slate-500 lg:inline">
                    {displayName}
                  </span>
                )}
                {panelHref && (
                  <Link
                    href={panelHref}
                    className="rounded-full px-4 py-2 text-xs font-semibold text-slate-700 transition hover:text-slate-900"
                  >
                    Mi panel
                  </Link>
                )}
                <form action={logout}>
                  <button
                    type="submit"
                    className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    Salir
                  </button>
                </form>
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
                  className="bg-brand rounded-full px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:opacity-90"
                >
                  Comenzar
                </Link>
              </>
            )}
          </div>

          {/* Botón hamburguesa (móvil) */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/70 text-slate-700 transition hover:border-slate-300 md:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-5 w-5"
            >
              {open ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Panel móvil desplegable */}
        {open && (
          <div className="animate-fade-up border-t border-white/60 md:hidden">
            <nav className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-6 py-4">
              {isHome &&
                SECTIONS.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    onClick={close}
                    className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
                  >
                    {s.label}
                  </Link>
                ))}
              <Link
                href="/privacidad"
                onClick={close}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
              >
                Privacidad
              </Link>

              <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
                {authed ? (
                  <>
                    {panelHref && (
                      <Link
                        href={panelHref}
                        onClick={close}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700"
                      >
                        Mi panel
                      </Link>
                    )}
                    <form action={logout}>
                      <button
                        type="submit"
                        className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600"
                      >
                        Salir
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={close}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700"
                    >
                      Acceder
                    </Link>
                    <Link
                      href="/evaluacion"
                      onClick={close}
                      className="bg-brand rounded-full px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-sky-500/25"
                    >
                      Comenzar evaluación
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
