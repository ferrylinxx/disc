"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { globalSearch, type SearchHit } from "@/app/actions/search";

const NAV: { title: string; href: string; hint: string }[] = [
  { title: "Resumen", href: "/admin", hint: "Panel" },
  { title: "Organizaciones", href: "/admin/organizaciones", hint: "Gestión" },
  { title: "Usuarios", href: "/admin/usuarios", hint: "Gestión" },
  { title: "Participantes", href: "/admin/participantes", hint: "Gestión" },
  { title: "Contenido y narrativas", href: "/admin/catalogo", hint: "Plataforma" },
  { title: "Biblioteca (117 bloques)", href: "/admin/catalogo/bloques", hint: "Plataforma" },
  { title: "Sistema", href: "/admin/sistema", hint: "Plataforma" },
];

const KIND_LABEL: Record<SearchHit["kind"], string> = {
  org: "Organización",
  participant: "Participante",
  user: "Usuario",
};

/** Buscador global (⌘K): navegación rápida + búsqueda de orgs/personas. */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQ("");
    setHits([]);
    setActive(0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("gesem:command", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("gesem:command", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const term = q.trim();
    if (term.length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await globalSearch(term);
        setHits(res);
        setActive(0);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [q, open]);

  const navMatches = NAV.filter((n) =>
    q.trim().length === 0
      ? true
      : n.title.toLowerCase().includes(q.trim().toLowerCase()),
  );
  const items: { href: string; title: string; sub: string; tag: string }[] = [
    ...navMatches.map((n) => ({
      href: n.href,
      title: n.title,
      sub: n.hint,
      tag: "Ir a",
    })),
    ...hits.map((h) => ({
      href: h.href,
      title: h.title,
      sub: h.subtitle,
      tag: KIND_LABEL[h.kind],
    })),
  ];

  const go = (href: string) => {
    close();
    router.push(href);
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items[active]) go(items[active].href);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-900/40 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="animate-scale-in w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-4">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Buscar organización, persona o ir a…"
            className="flex-1 bg-transparent py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          {loading && <span className="text-xs text-slate-400">…</span>}
          <kbd className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
            Esc
          </kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {items.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-slate-400">
              {q.trim().length < 2
                ? "Escribe para buscar…"
                : "Sin resultados"}
            </p>
          ) : (
            items.map((it, i) => (
              <button
                key={`${it.href}-${i}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(it.href)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                  i === active ? "bg-sky-50" : "hover:bg-slate-50"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {it.title}
                  </p>
                  <p className="truncate text-xs text-slate-400">{it.sub}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                  {it.tag}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
