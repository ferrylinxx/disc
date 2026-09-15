"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveGlossary } from "@/app/actions/narratives";
import type { ActionState } from "@/app/actions/org";
import type { Glossary, GlossaryEntry } from "@/lib/glossary";
import { GlossaryView } from "@/components/GlossaryView";
import { btn, fieldCls } from "./ui";
import { toast } from "./ui-client";

type Locale = "es" | "ca";
const LOCALES: { code: Locale; label: string }[] = [
  { code: "es", label: "Castellano" },
  { code: "ca", label: "Català" },
];
const CODES: (GlossaryEntry["code"] | "")[] = ["", "D", "I", "S", "C"];

/** Quita términos vacíos antes de guardar o previsualizar. */
function clean(g: Glossary): Glossary {
  return {
    ...g,
    groups: g.groups
      .map((grp) => ({
        ...grp,
        entries: grp.entries.filter((e) => e.term.trim() || e.def.trim()),
      }))
      .filter((grp) => grp.title.trim() || grp.entries.length > 0),
  };
}

/** Formulario de un idioma: título, introducción y grupos de términos. */
function LocaleForm({
  locale,
  value,
  onChange,
}: {
  locale: Locale;
  value: Glossary;
  onChange: (g: Glossary) => void;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveGlossary, {});
  const seen = useRef<ActionState | null>(null);
  useEffect(() => {
    if (state === seen.current) return;
    seen.current = state;
    if (state.error) toast(state.error, "error");
    else if (state.ok || state.message) toast(state.message ?? "Glosario guardado.", "success");
  }, [state]);

  const setGroup = (gi: number, patch: Partial<Glossary["groups"][number]>) =>
    onChange({
      ...value,
      groups: value.groups.map((g, i) => (i === gi ? { ...g, ...patch } : g)),
    });
  const setEntry = (gi: number, ei: number, patch: Partial<GlossaryEntry>) =>
    setGroup(gi, {
      entries: value.groups[gi].entries.map((e, i) => (i === ei ? { ...e, ...patch } : e)),
    });

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="content" value={JSON.stringify(clean(value))} readOnly />

      <div className="grid gap-3 sm:grid-cols-[14rem_1fr]">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500">Título</span>
          <input
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
            className={fieldCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500">Introducción</span>
          <textarea
            value={value.intro}
            onChange={(e) => onChange({ ...value, intro: e.target.value })}
            rows={2}
            className={`${fieldCls} resize-y`}
          />
        </label>
      </div>

      {value.groups.map((group, gi) => (
        <fieldset key={gi} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <input
              value={group.title}
              onChange={(e) => setGroup(gi, { title: e.target.value })}
              placeholder="Nombre del grupo"
              aria-label="Nombre del grupo"
              className={`${fieldCls} font-semibold`}
            />
            <button
              type="button"
              onClick={() => onChange({ ...value, groups: value.groups.filter((_, i) => i !== gi) })}
              title="Quitar el grupo entero"
              className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
            >
              Quitar grupo
            </button>
          </div>
          <div className="space-y-2">
            {group.entries.map((entry, ei) => (
              <div key={ei} className="grid gap-2 rounded-lg bg-white p-2.5 ring-1 ring-slate-100 sm:grid-cols-[12rem_4.5rem_1fr_auto]">
                <input
                  value={entry.term}
                  onChange={(e) => setEntry(gi, ei, { term: e.target.value })}
                  placeholder="Término"
                  aria-label="Término"
                  className={fieldCls}
                />
                <select
                  value={entry.code ?? ""}
                  onChange={(e) =>
                    setEntry(gi, ei, {
                      code: (e.target.value || undefined) as GlossaryEntry["code"],
                    })
                  }
                  aria-label="Recurso DISC asociado"
                  title="Recurso DISC asociado (opcional)"
                  className={fieldCls}
                >
                  {CODES.map((c) => (
                    <option key={c || "none"} value={c ?? ""}>
                      {c || "—"}
                    </option>
                  ))}
                </select>
                <textarea
                  value={entry.def}
                  onChange={(e) => setEntry(gi, ei, { def: e.target.value })}
                  placeholder="Definición"
                  aria-label="Definición"
                  rows={2}
                  className={`${fieldCls} resize-y`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setGroup(gi, { entries: group.entries.filter((_, i) => i !== ei) })
                  }
                  title="Quitar término"
                  aria-label="Quitar término"
                  className="self-start rounded-lg px-2 py-2 text-xs font-bold text-slate-300 transition hover:bg-rose-50 hover:text-rose-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setGroup(gi, { entries: [...group.entries, { term: "", def: "" }] })}
            className={`${btn.ghost} mt-2`}
          >
            + Añadir término
          </button>
        </fieldset>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() =>
            onChange({ ...value, groups: [...value.groups, { title: "", entries: [{ term: "", def: "" }] }] })
          }
          className={btn.secondary}
        >
          + Añadir grupo
        </button>
        <button type="submit" disabled={pending} className={btn.primary}>
          {pending ? "Guardando…" : `Guardar ${locale === "ca" ? "en catalán" : "en castellano"}`}
        </button>
      </div>
    </form>
  );
}

/**
 * Editor del glosario por idioma con vista previa en directo. Sustituye a la
 * edición del JSON a mano, donde una coma de más rompía el glosario entero.
 */
export function GlossaryEditor({ initial }: { initial: Record<Locale, Glossary> }) {
  const [locale, setLocale] = useState<Locale>("es");
  const [data, setData] = useState(initial);

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/40">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900">Términos</h2>
          <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLocale(l.code)}
                aria-pressed={locale === l.code}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  locale === l.code ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
        {/* Los dos idiomas quedan montados: cambiar de pestaña no pierde lo escrito. */}
        {LOCALES.map((l) => (
          <div key={l.code} hidden={l.code !== locale}>
            <LocaleForm
              locale={l.code}
              value={data[l.code]}
              onChange={(g) => setData((d) => ({ ...d, [l.code]: g }))}
            />
          </div>
        ))}
      </section>

      <section className="xl:sticky xl:top-5 xl:max-h-[calc(100vh-2.5rem)] xl:overflow-y-auto">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
          Vista previa · {locale === "ca" ? "Català" : "Castellano"}
        </h2>
        <GlossaryView data={clean(data[locale])} />
      </section>
    </div>
  );
}
