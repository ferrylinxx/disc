"use client";

import { useRouter } from "next/navigation";
import { LANGS, type Lang } from "@/lib/i18n/dictionaries";

const LABEL: Record<Lang, string> = { ca: "CAT", es: "ESP" };

/** Selector de idioma (CAT/ESP): guarda la preferencia en cookie y refresca. */
export function LanguageSwitcher({ lang }: { lang: Lang }) {
  const router = useRouter();
  const choose = (l: Lang) => {
    if (l === lang) return;
    document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };
  return (
    <div
      role="group"
      aria-label="Idioma"
      className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 p-0.5"
    >
      {LANGS.map((l) => {
        const on = l === lang;
        return (
          <button
            key={l}
            type="button"
            onClick={() => choose(l)}
            aria-pressed={on}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
              on ? "bg-brand text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {LABEL[l]}
          </button>
        );
      })}
    </div>
  );
}
