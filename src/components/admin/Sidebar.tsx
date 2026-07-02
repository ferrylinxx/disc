"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const ic = "h-[18px] w-[18px] shrink-0";
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
  external: (
    <svg viewBox="0 0 24 24" className={ic} {...svg}>
      <path d="M14 5h5v5M19 5l-8 8M19 13v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
    </svg>
  ),
  collapse: (
    <svg viewBox="0 0 24 24" className={ic} {...svg}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  ),
} satisfies Record<string, ReactNode>;

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}
interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Navegación lateral de la consola admin: colapsable (escritorio). */
export function AdminSidebar({
  counts,
}: {
  counts: { organizations: number; users: number; participants: number };
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("gesem:nav") === "collapsed");
  }, []);
  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("gesem:nav", next ? "collapsed" : "open");
      return next;
    });
  };

  const groups: NavGroup[] = [
    { label: "General", items: [{ href: "/admin", label: "Resumen", icon: Icons.overview }] },
    {
      label: "Gestión",
      items: [
        { href: "/admin/organizaciones", label: "Organizaciones", icon: Icons.org, badge: counts.organizations },
        { href: "/admin/usuarios", label: "Usuarios", icon: Icons.users, badge: counts.users },
        { href: "/admin/participantes", label: "Participantes", icon: Icons.participants, badge: counts.participants },
      ],
    },
    {
      label: "Plataforma",
      items: [
        { href: "/admin/catalogo", label: "Contenido", icon: Icons.catalog },
        { href: "/admin/sistema", label: "Sistema", icon: Icons.system },
      ],
    },
  ];

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav
      className={`animate-fade-up flex gap-1 overflow-x-auto rounded-2xl border border-slate-200/70 bg-white/85 p-3 text-slate-600 shadow-sm shadow-slate-200/50 backdrop-blur transition-[width] md:sticky md:top-5 md:max-h-[calc(100vh-2.5rem)] md:shrink-0 md:flex-col md:overflow-y-auto ${
        collapsed ? "md:w-[68px]" : "md:w-60"
      }`}
    >
      {/* Marca + colapsar (escritorio) */}
      <div className="mb-2 hidden items-center justify-between px-2 md:flex">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2 px-1 py-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/gesem-logo.svg" alt="GESEM" className="h-7 w-auto" />
            <span className="h-4 w-px bg-slate-200" />
            <span className="text-sm font-bold tracking-tight text-slate-800">DISC</span>
          </Link>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <span className={`transition-transform ${collapsed ? "rotate-180" : ""}`}>
            {Icons.collapse}
          </span>
        </button>
      </div>

      {groups.map((group, gi) => (
        <div key={group.label} className="flex shrink-0 gap-1 md:block">
          {!collapsed && (
            <p
              className={`hidden px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 md:block ${gi > 0 ? "pt-4" : "pt-1"}`}
            >
              {group.label}
            </p>
          )}
          {group.items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`group relative flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition md:mb-0.5 ${
                  collapsed ? "md:justify-center md:px-0" : ""
                } ${
                  active
                    ? "bg-sky-50 text-sky-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {active && !collapsed && (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-sky-500" />
                )}
                <span className={active ? "text-sky-600" : "text-slate-400 group-hover:text-slate-500"}>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && typeof item.badge === "number" && (
                  <span
                    className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      active ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}

      {!collapsed && (
        <div className="hidden md:mt-5 md:block md:border-t md:border-slate-100 md:pt-4">
          <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Otros paneles
          </p>
          {[
            { href: "/cliente", label: "Panel cliente" },
            { href: "/facilitador", label: "Facilitador" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="mb-0.5 flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-[13px] font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <span className="text-slate-400">{Icons.external}</span>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
