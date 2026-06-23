"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

/** Secciones de la landing (ancladas). Solo se muestran en la home. */
const SECTIONS = [
  { id: "como-funciona", href: "/#como-funciona", label: "Cómo funciona" },
  { id: "dimensiones", href: "/#dimensiones", label: "El modelo" },
  { id: "plataforma", href: "/#plataforma", label: "La plataforma" },
];

interface Props {
  authed: boolean;
  displayName: string | null;
  panelHref: string | null;
}

/** Barra de navegación (cliente): isla flotante al scroll + scroll-spy + móvil. */
export function NavbarClient({ authed, displayName, panelHref }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const close = () => setOpen(false);

  // Al hacer scroll, la barra deja de ser transparente y se compacta.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: resalta la sección visible cerca del centro de la ventana.
  useEffect(() => {
    if (!isHome) return;
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (els.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [isHome]);

  // Fondo sólido si se ha hecho scroll o si el menú móvil está abierto.
  const solid = scrolled || open;

  return (
    <header className="sticky top-0 z-40">
      <div
        className={`mx-auto px-4 transition-all duration-300 ${
          solid ? "mt-3 max-w-5xl" : "max-w-6xl"
        }`}
      >
        <div
          className={`transition-all duration-300 ${
            solid
              ? "glass rounded-2xl border border-white/70 shadow-lg shadow-slate-900/5"
              : "border-b border-transparent"
          }`}
        >
          <div
            className={`flex items-center justify-between gap-4 transition-all duration-300 ${
              solid ? "px-4 py-2.5" : "px-2 py-4"
            }`}
          >
            {/* Logo */}
            <Link href="/" onClick={close} className="flex shrink-0 items-center gap-3">
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

            {/* Navegación de secciones — control segmentado (solo home, escritorio) */}
            {isHome && (
              <nav className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-white/50 p-1 backdrop-blur md:flex">
                {SECTIONS.map((s) => {
                  const on = active === s.id;
                  return (
                    <Link
                      key={s.id}
                      href={s.href}
                      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                        on
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {s.label}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Acciones (escritorio) */}
            <div className="hidden shrink-0 items-center gap-2 md:flex">
              {authed ? (
                <>
                  {displayName && (
                    <span className="hidden max-w-[12rem] truncate text-xs font-medium text-slate-500 lg:inline">
                      {displayName}
                    </span>
                  )}
                  {panelHref && (
                    <Link
                      href={panelHref}
                      className="rounded-full px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
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
                    className="rounded-full px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    Acceder
                  </Link>
                  <Link
                    href="/evaluacion"
                    className="bg-brand group inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/25 transition hover:-translate-y-0.5 hover:shadow-sky-500/40"
                  >
                    Comenzar
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
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
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white/70 text-slate-700 transition hover:border-slate-300 md:hidden"
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
            <div className="animate-fade-up border-t border-slate-200/70 md:hidden">
              <nav className="flex flex-col gap-1 px-4 py-4">
                {isHome &&
                  SECTIONS.map((s) => (
                    <Link
                      key={s.id}
                      href={s.href}
                      onClick={close}
                      className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                        active === s.id
                          ? "bg-sky-50 text-sky-700"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
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
                        className="bg-brand inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-sky-500/25"
                      >
                        Comenzar evaluación →
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
