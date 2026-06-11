"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const ic = "h-5 w-5";
const svg = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const Icons = {
  overview: (
    <svg viewBox="0 0 24 24" className={ic} {...svg}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  org: (
    <svg viewBox="0 0 24 24" className={ic} {...svg}>
      <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M9 7h2M9 11h2M9 15h2M15 21V11h2a2 2 0 0 1 2 2v8" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" className={ic} {...svg}>
      <path d="M16 19a4 4 0 0 0-8 0M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 19a3 3 0 0 0-4-3M18 9a2.5 2.5 0 0 0 0-4" />
    </svg>
  ),
  participants: (
    <svg viewBox="0 0 24 24" className={ic} {...svg}>
      <path d="M14 19a5 5 0 0 0-10 0M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M16 12l2 2 4-4" />
    </svg>
  ),
  catalog: (
    <svg viewBox="0 0 24 24" className={ic} {...svg}>
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM19 17H6a2 2 0 0 0-2 2" />
    </svg>
  ),
  system: (
    <svg viewBox="0 0 24 24" className={ic} {...svg}>
      <rect x="3" y="4" width="18" height="7" rx="2" />
      <rect x="3" y="13" width="18" height="7" rx="2" />
      <path d="M7 7.5h.01M7 16.5h.01" />
    </svg>
  ),
} satisfies Record<string, ReactNode>;

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

/** Navegación lateral del panel admin con resaltado de la sección activa. */
export function AdminSidebar({
  counts,
}: {
  counts: { organizations: number; users: number; participants: number };
}) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: "/admin", label: "Resumen", icon: Icons.overview },
    {
      href: "/admin/organizaciones",
      label: "Organizaciones",
      icon: Icons.org,
      badge: counts.organizations,
    },
    {
      href: "/admin/usuarios",
      label: "Usuarios",
      icon: Icons.users,
      badge: counts.users,
    },
    {
      href: "/admin/participantes",
      label: "Participantes",
      icon: Icons.participants,
      badge: counts.participants,
    },
    { href: "/admin/catalogo", label: "Catálogo", icon: Icons.catalog },
    { href: "/admin/sistema", label: "Sistema", icon: Icons.system },
  ];

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav className="glass flex gap-1 overflow-x-auto rounded-2xl border border-white/60 p-2 md:sticky md:top-20 md:w-60 md:shrink-0 md:flex-col md:overflow-visible">
      <p className="hidden px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:block">
        Gestión
      </p>
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
              active
                ? "bg-brand text-white shadow-lg shadow-indigo-200"
                : "text-slate-600 hover:bg-white/70"
            }`}
          >
            <span className="shrink-0">{item.icon}</span>
            <span>{item.label}</span>
            {typeof item.badge === "number" && (
              <span
                className={`ml-auto rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                  active
                    ? "bg-white/25 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
