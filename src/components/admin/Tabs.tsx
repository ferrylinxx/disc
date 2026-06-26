"use client";

import { useState, type ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  badge?: number | string;
  content: ReactNode;
}

/** Pestañas del admin: todas montadas, se muestra la activa (conserva estado). */
export function Tabs({ tabs }: { tabs: TabItem[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  return (
    <div>
      <div
        role="tablist"
        className="mb-5 flex flex-wrap gap-1 overflow-x-auto border-b border-slate-200"
      >
        {tabs.map((t) => {
          const on = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(t.id)}
              className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
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
