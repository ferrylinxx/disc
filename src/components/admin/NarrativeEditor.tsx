"use client";

import { useActionState, useState } from "react";
import { saveNarrative } from "@/app/actions/narratives";
import type { ActionState } from "@/app/actions/org";
import type { AdminNarrativeEntry } from "@/lib/data/narratives";

/** Forma del contenido de un recurso (D/I/S/C). */
interface ResourceContent {
  resources: { name: string; description: string }[];
  contribution: string;
  valued: string;
  coordinating: string;
  collaborating: string;
  communication: string;
  contexts: string;
  observe: string[];
  repertoire: string;
  reflection: string[];
}

/** Forma del contenido de un perfil (DI..EQ). */
interface ProfileContent {
  name: string;
  summary: string;
}

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

function StatusBadge({ status, inDb }: { status: string; inDb: boolean }) {
  if (!inDb) {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
        Valor por defecto
      </span>
    );
  }
  const map: Record<string, string> = {
    PUBLISHED: "bg-emerald-100 text-emerald-700",
    DRAFT: "bg-amber-100 text-amber-700",
    ARCHIVED: "bg-slate-200 text-slate-500",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${map[status] ?? "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      {hint && <span className="ml-2 text-[11px] text-slate-400">{hint}</span>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  );
}

function ResourceFields({
  content,
  set,
}: {
  content: ResourceContent;
  set: (c: ResourceContent) => void;
}) {
  const resourcesText = content.resources
    .map((r) => `${r.name} | ${r.description}`)
    .join("\n");
  return (
    <div className="space-y-3">
      <Field
        label="Recursos predominantes"
        hint="una por línea: Nombre | descripción"
        rows={4}
        value={resourcesText}
        onChange={(v) =>
          set({
            ...content,
            resources: lines(v).map((l) => {
              const [name, ...rest] = l.split("|");
              return { name: name.trim(), description: rest.join("|").trim() };
            }),
          })
        }
      />
      <Field label="Aportación habitual" value={content.contribution} onChange={(v) => set({ ...content, contribution: v })} />
      <Field label="Lo que otras personas suelen valorar" value={content.valued} onChange={(v) => set({ ...content, valued: v })} />
      <Field label="Cuando coordina" value={content.coordinating} onChange={(v) => set({ ...content, coordinating: v })} />
      <Field label="Cuando colabora" value={content.collaborating} onChange={(v) => set({ ...content, collaborating: v })} />
      <Field label="Comunicación" value={content.communication} onChange={(v) => set({ ...content, communication: v })} />
      <Field label="Contextos de mejor desempeño" value={content.contexts} onChange={(v) => set({ ...content, contexts: v })} />
      <Field
        label="Aspectos que merece la pena observar"
        hint="uno por línea (3)"
        rows={3}
        value={content.observe.join("\n")}
        onChange={(v) => set({ ...content, observe: lines(v) })}
      />
      <Field label="Ampliación de repertorio" value={content.repertoire} onChange={(v) => set({ ...content, repertoire: v })} />
      <Field
        label="Preguntas para la reflexión"
        hint="una por línea (3)"
        rows={3}
        value={content.reflection.join("\n")}
        onChange={(v) => set({ ...content, reflection: lines(v) })}
      />
    </div>
  );
}

function ProfileFields({
  content,
  set,
}: {
  content: ProfileContent;
  set: (c: ProfileContent) => void;
}) {
  return (
    <div className="space-y-3">
      <Field label="Nombre de la tendencia" rows={1} value={content.name} onChange={(v) => set({ ...content, name: v })} />
      <Field label="Resumen" rows={2} value={content.summary} onChange={(v) => set({ ...content, summary: v })} />
    </div>
  );
}

function EntryEditor({ entry }: { entry: AdminNarrativeEntry }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveNarrative, {});
  const [content, setContent] = useState<ResourceContent | ProfileContent>(
    entry.content as ResourceContent | ProfileContent,
  );
  const [status, setStatus] = useState(entry.inDb ? entry.status : "PUBLISHED");

  return (
    <details className="group rounded-xl border border-slate-200 bg-white">
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3">
        <span className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-800">{entry.label}</span>
          <StatusBadge status={entry.status} inDb={entry.inDb} />
        </span>
        <span className="text-xs text-slate-400">
          {entry.inDb ? `v${entry.version}${entry.author ? ` · ${entry.author}` : ""}` : "sin guardar"}
          <span className="ml-2 transition group-open:rotate-180">▾</span>
        </span>
      </summary>

      <form action={action} className="border-t border-slate-100 px-4 py-4">
        <input type="hidden" name="scope" value={entry.scope} />
        <input type="hidden" name="key" value={entry.key} />
        <input type="hidden" name="content" value={JSON.stringify(content)} readOnly />

        {entry.scope === "RESOURCE" ? (
          <ResourceFields content={content as ResourceContent} set={setContent} />
        ) : (
          <ProfileFields content={content as ProfileContent} set={setContent} />
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <option value="PUBLISHED">Publicada</option>
            <option value="DRAFT">Borrador</option>
            <option value="ARCHIVED">Archivada</option>
          </select>
          <button
            type="submit"
            disabled={pending}
            className="bg-brand rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Guardando…" : "Guardar"}
          </button>
          {state?.ok && <span className="text-sm font-medium text-emerald-600">{state.message ?? "Guardado."}</span>}
          {state?.error && <span className="text-sm font-medium text-rose-600">{state.error}</span>}
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Solo se publica lo que esté en estado “Publicada”. El informe usa estas narrativas en cuanto guardas.
        </p>
      </form>
    </details>
  );
}

/** Editor de la biblioteca de narrativas (recursos + perfiles). */
export function NarrativeEditor({ entries }: { entries: AdminNarrativeEntry[] }) {
  const resources = entries.filter((e) => e.scope === "RESOURCE");
  const profiles = entries.filter((e) => e.scope === "PROFILE");

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 text-sm font-bold text-slate-900">
          Recursos <span className="font-normal text-slate-400">— gobiernan el contenido del informe (D/I/S/C)</span>
        </h3>
        <div className="space-y-2">
          {resources.map((e) => (
            <EntryEditor key={`${e.scope}:${e.key}`} entry={e} />
          ))}
        </div>
      </section>
      <section>
        <h3 className="mb-3 text-sm font-bold text-slate-900">
          Perfiles <span className="font-normal text-slate-400">— nombre y resumen de cada combinación (DI…EQ)</span>
        </h3>
        <div className="space-y-2">
          {profiles.map((e) => (
            <EntryEditor key={`${e.scope}:${e.key}`} entry={e} />
          ))}
        </div>
      </section>
    </div>
  );
}
