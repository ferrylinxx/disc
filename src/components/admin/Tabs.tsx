"use client";

import { useEffect, useState, type ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  badge?: number | string;
  content: ReactNode;
}

/**
 * Pestañas del admin: todas montadas, se muestra la activa (conserva estado).
 * La pestaña activa va en el hash de la URL (#participantes…): sobrevive a
 * recargar la página y permite enlazar a una pestaña desde otra.
 */
export function Tabs({ tabs }: { tabs: TabItem[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const ids = tabs.map((t) => t.id).join(",");

  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      if (ids.split(",").includes(id)) setActive(id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [ids]);

  const select = (id: string) => {
    setActive(id);
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <div>
      <div
        role="tablist"
        className="mb-5 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-slate-200"
      >
        {tabs.map((t) => {
          const on = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => select(t.id)}
              className={`-mb-px flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                on
                  ? "border-sky-500 text-sky-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.label}
              {t.badge != null && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    on ? "bg-sky-100 text-sky-600" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {tabs.map((t) => (
        <div key={t.id} hidden={t.id !== active} className="space-y-5">
          {t.content}
        </div>
      ))}
    </div>
  );
}
