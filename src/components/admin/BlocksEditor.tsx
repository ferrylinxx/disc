"use client";

import { useActionState, useState } from "react";
import { saveBlock } from "@/app/actions/narratives";
import type { ActionState } from "@/app/actions/org";
import type { AdminBlockEntry } from "@/lib/data/narratives";

function StatusBadge({ status, inDb }: { status: string; inDb: boolean }) {
  if (!inDb) {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
        sin guardar
      </span>
    );
  }
  const map: Record<string, string> = {
    PUBLISHED: "bg-emerald-100 text-emerald-700",
    DRAFT: "bg-amber-100 text-amber-700",
    ARCHIVED: "bg-slate-200 text-slate-500",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${map[status] ?? "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
}

function BlockEditor({ entry }: { entry: AdminBlockEntry }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveBlock, {});
  const [text, setText] = useState(entry.text);
  const [status, setStatus] = useState(entry.inDb ? entry.status : "DRAFT");

  return (
    <form action={action} className="rounded-xl border border-slate-200 bg-white p-3">
      <input type="hidden" name="profile" value={entry.profile} />
      <input type="hidden" name="blockId" value={entry.blockId} />
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-800">
          {entry.blockLabel}
          <span className="ml-2 font-normal text-[10px] text-slate-400">{entry.lengthHint}</span>
        </span>
        <StatusBadge status={entry.status} inDb={entry.inDb} />
      </div>
      <textarea
        name="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={entry.blockId === "reflexion" || entry.blockId === "recursos" ? 6 : 4}
        placeholder={entry.blockId === "reflexion" ? "Una pregunta por línea (5)" : "Texto del bloque…"}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700"
        >
          <option value="DRAFT">Borrador</option>
          <option value="PUBLISHED">Publicada</option>
          <option value="ARCHIVED">Archivada</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          className="bg-brand rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
        {state?.ok && <span className="text-xs font-medium text-emerald-600">{state.message ?? "Guardado."}</span>}
        {state?.error && <span className="text-xs font-medium text-rose-600">{state.error}</span>}
      </div>
    </form>
  );
}

/** Editor de la Biblioteca Narrativa: 13 perfiles × 9 bloques (117). */
export function BlocksEditor({
  profiles,
}: {
  profiles: { profile: string; profileName: string; blocks: AdminBlockEntry[] }[];
}) {
  return (
    <div className="space-y-2">
      {profiles.map((p) => {
        const published = p.blocks.filter((b) => b.status === "PUBLISHED").length;
        return (
          <details key={p.profile} className="group rounded-xl border border-slate-200 bg-white">
            <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3">
              <span className="flex items-center gap-3">
                <span className="w-10 rounded-lg bg-slate-900 px-2 py-1 text-center text-xs font-bold text-white">
                  {p.profile}
                </span>
                <span className="text-sm font-semibold text-slate-800">{p.profileName}</span>
              </span>
              <span className="text-xs text-slate-400">
                {published}/9 publicados
                <span className="ml-2 transition group-open:rotate-180">▾</span>
              </span>
            </summary>
            <div className="grid gap-3 border-t border-slate-100 p-4 lg:grid-cols-2">
              {p.blocks.map((b) => (
                <BlockEditor key={b.blockId} entry={b} />
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}
