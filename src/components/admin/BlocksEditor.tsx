"use client";

import { useActionState, useState } from "react";
import { saveBlock } from "@/app/actions/narratives";
import type { ActionState } from "@/app/actions/org";
import type { AdminBlockEntry, BlockLocale } from "@/lib/data/narratives";
import {
  PROFILE_WORD_TARGET,
  REPORT_BLOCK_IDS,
  countWords,
  lengthTone,
  parseWordRange,
} from "@/lib/narratives/word-count";
import { ProfileChip, btn } from "./ui";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  PUBLISHED: { label: "Publicado", cls: "bg-emerald-100 text-emerald-700" },
  DRAFT: { label: "Borrador", cls: "bg-amber-100 text-amber-700" },
  ARCHIVED: { label: "Archivado", cls: "bg-slate-200 text-slate-500" },
};

function StatusBadge({ status, inDb }: { status: string; inDb: boolean }) {
  const s = inDb ? STATUS_LABEL[status] : null;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        s?.cls ?? "bg-slate-100 text-slate-400"
      }`}
    >
      {s?.label ?? "Sin guardar"}
    </span>
  );
}

const TONE_CLS = {
  short: "text-amber-600",
  ok: "text-emerald-600",
  long: "text-slate-500",
} as const;

/** Alto del área de texto según la longitud, para leer bloques largos sin desplazarse. */
function textRows(text: string, blockId: string): number {
  const min = blockId === "reflexion" || blockId === "recursos" ? 6 : 4;
  return Math.min(16, Math.max(min, Math.ceil(text.length / 80)));
}

const isReportBlock = (id: string) => (REPORT_BLOCK_IDS as readonly string[]).includes(id);

function BlockEditor({ entry, locale }: { entry: AdminBlockEntry; locale: BlockLocale }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveBlock, {});
  const [text, setText] = useState(entry.text);
  const [status, setStatus] = useState(entry.inDb ? entry.status : "DRAFT");
  const range = parseWordRange(entry.lengthHint);
  const words = countWords(text);
  const unused = !isReportBlock(entry.blockId);

  return (
    <form
      action={action}
      className={`rounded-xl border bg-white p-3 ${unused ? "border-dashed border-slate-200 opacity-80" : "border-slate-200"}`}
    >
      <input type="hidden" name="profile" value={entry.profile} />
      <input type="hidden" name="blockId" value={entry.blockId} />
      <input type="hidden" name="locale" value={locale} />
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-800">
          {entry.blockLabel}
          <span className="ml-2 font-normal text-[10px] text-slate-400">{entry.lengthHint}</span>
        </span>
        <span className="flex items-center gap-2">
          {range && (
            <span className={`text-[11px] font-semibold tabular-nums ${TONE_CLS[lengthTone(words, range)]}`}>
              {words} palabras
            </span>
          )}
          {unused ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              No se muestra en el informe
            </span>
          ) : (
            <StatusBadge status={entry.status} inDb={entry.inDb} />
          )}
        </span>
      </div>
      {entry.referenceText !== null && (
        <details className="mb-2 rounded-lg bg-slate-50 px-3 py-2">
          <summary className="cursor-pointer text-[11px] font-semibold text-slate-500">
            Original en castellano
          </summary>
          <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-600">
            {entry.referenceText || "Sin texto en castellano."}
          </p>
        </details>
      )}
      <textarea
        name="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={textRows(text, entry.blockId)}
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
          <option value="PUBLISHED">Publicado</option>
          <option value="ARCHIVED">Archivado</option>
        </select>
        <button type="submit" disabled={pending} className={btn.primary}>
          {pending ? "Guardando…" : "Guardar"}
        </button>
        {state?.ok && <span className="text-xs font-medium text-emerald-600">{state.message ?? "Guardado."}</span>}
        {state?.error && <span className="text-xs font-medium text-rose-600">{state.error}</span>}
      </div>
    </form>
  );
}

/**
 * Editor de la Biblioteca Narrativa por perfil, en un idioma. Cada perfil
 * muestra cuántas palabras publicadas tiene frente a las 700-800 del canon V1:
 * "8/8 publicados" no distinguía un texto V1 completo de la plantilla corta.
 */
export function BlocksEditor({
  profiles,
  locale,
}: {
  profiles: { profile: string; profileName: string; blocks: AdminBlockEntry[] }[];
  locale: BlockLocale;
}) {
  return (
    <div className="space-y-2">
      {profiles.map((p) => {
        const reportBlocks = p.blocks.filter((b) => isReportBlock(b.blockId));
        const published = reportBlocks.filter((b) => b.status === "PUBLISHED");
        const words = published.reduce((sum, b) => sum + countWords(b.text), 0);
        const tone = lengthTone(words, PROFILE_WORD_TARGET);
        const barPct = Math.min(100, Math.round((words / PROFILE_WORD_TARGET.min) * 100));
        return (
          <details key={p.profile} className="group rounded-xl border border-slate-200 bg-white">
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-4 py-3">
              <span className="flex min-w-0 items-center gap-3">
                <ProfileChip code={p.profile} />
                <span className="truncate text-sm font-semibold text-slate-800">{p.profileName}</span>
              </span>
              <span className="flex items-center gap-4 text-xs text-slate-500">
                <span className="hidden items-center gap-2 sm:flex" title="Palabras publicadas en los 8 apartados del informe">
                  <span className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                    <span
                      className={`block h-full rounded-full ${tone === "short" ? "bg-amber-400" : "bg-emerald-500"}`}
                      style={{ width: `${barPct}%` }}
                    />
                  </span>
                  <span className={`w-28 font-semibold tabular-nums ${TONE_CLS[tone]}`}>
                    {words} / {PROFILE_WORD_TARGET.min} palabras
                  </span>
                </span>
                <span className="whitespace-nowrap">
                  {published.length}/{reportBlocks.length} publicados
                </span>
                <span className="transition group-open:rotate-180">▾</span>
              </span>
            </summary>
            <div className="grid gap-3 border-t border-slate-100 p-4 lg:grid-cols-2">
              {p.blocks.map((b) => (
                <BlockEditor key={`${locale}:${b.blockId}`} entry={b} locale={locale} />
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}
