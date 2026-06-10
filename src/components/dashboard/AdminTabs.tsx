"use client";

import { useState, type ReactNode } from "react";

export interface AdminTab {
  id: string;
  label: string;
  badge?: number;
  icon?: ReactNode;
  content: ReactNode;
}

/** Navegación por pestañas para el panel admin (estado en cliente). */
export function AdminTabs({ tabs }: { tabs: AdminTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <div className="space-y-6">
      <div className="glass animate-fade-up flex flex-wrap gap-1 rounded-2xl border border-white/60 p-1.5">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-brand text-white shadow-lg shadow-indigo-200"
                  : "text-slate-600 hover:bg-white/70"
              }`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              {tab.label}
              {typeof tab.badge === "number" && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={tab.id === active ? "space-y-6" : "hidden"}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
