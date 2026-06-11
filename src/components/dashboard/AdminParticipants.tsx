"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { sendParticipantReport } from "@/app/actions/reports";
import type { ActionState } from "@/app/actions/org";
import type { AdminParticipant } from "@/lib/data/dashboard";
import { Avatar } from "./AdminWidgets";

const initial: ActionState = {};

const inputCls =
  "rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

const STATUS: Record<string, { label: string; cls: string }> = {
  INVITED: { label: "Invitado", cls: "bg-slate-100 text-slate-600" },
  IN_PROGRESS: { label: "En curso", cls: "bg-amber-100 text-amber-700" },
  COMPLETED: { label: "Completado", cls: "bg-emerald-100 text-emerald-700" },
};

type Filter = "ALL" | "INVITED" | "IN_PROGRESS" | "COMPLETED";

/** Botón de envío manual del informe por email (lo dispara el administrador). */
function SendReportButton({ id, email }: { id: string; email: string }) {
  const [state, action, pending] = useActionState(sendParticipantReport, initial);
  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="participantId" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="bg-brand rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Enviando…" : "✉ Enviar informe"}
      </button>
      {state.error && (
        <span className="text-[11px] font-medium text-rose-600">
          {state.error}
        </span>
      )}
      {state.ok && (
        <span className="text-[11px] font-medium text-emerald-600">
          Enviado a {email}
        </span>
      )}
    </form>
  );
}

/** Tabla de participantes de toda la plataforma con búsqueda y filtro. */
export function AdminParticipants({
  participants,
}: {
  participants: AdminParticipant[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const term = query.trim().toLowerCase();

  const filtered = participants.filter((p) => {
    if (filter !== "ALL" && p.status !== filter) return false;
    if (!term) return true;
    return (
      p.fullName.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term) ||
      p.orgName.toLowerCase().includes(term)
    );
  });

  const tabs: { id: Filter; label: string }[] = [
    { id: "ALL", label: "Todos" },
    { id: "COMPLETED", label: "Completados" },
    { id: "IN_PROGRESS", label: "En curso" },
    { id: "INVITED", label: "Invitados" },
  ];

  return (
    <section className="glass animate-fade-up rounded-2xl border border-white/60 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Participantes ({participants.length})
        </h2>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, email u organización…"
          className={`${inputCls} w-72 max-w-full`}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filter === t.id
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500">
          No hay participantes que coincidan.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {filtered.map((p) => {
            const st = STATUS[p.status] ?? STATUS.INVITED;
            return (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={p.fullName} />
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-900">
                      {p.fullName}
                    </div>
                    <div className="truncate text-xs text-slate-400">
                      {p.email} · {p.orgName}
                      {p.teamName ? ` · ${p.teamName}` : ""}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span
                    className={`rounded-full px-2.5 py-1 font-semibold ${st.cls}`}
                  >
                    {st.label}
                  </span>
                  {p.result && (
                    <span className="text-slate-500">
                      <span className="font-semibold text-slate-700">
                        {p.result.profileCode}
                      </span>{" "}
                      · EQ {p.result.eq}
                    </span>
                  )}
                  {p.status === "COMPLETED" && (
                    <>
                      <Link
                        href={`/cliente/participantes/${p.id}`}
                        className="rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 font-semibold text-slate-600 transition hover:border-slate-300"
                      >
                        Ver informe
                      </Link>
                      <SendReportButton id={p.id} email={p.email} />
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
