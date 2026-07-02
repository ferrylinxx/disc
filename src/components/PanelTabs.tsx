"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Navegación por pestañas del panel del participante. */
export function PanelTabs({
  tabs,
}: {
  tabs: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200/70 bg-white/70 p-1 backdrop-blur">
      {tabs.map((tab) => {
        const active =
          tab.href === "/panel"
            ? pathname === "/panel"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-brand text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
