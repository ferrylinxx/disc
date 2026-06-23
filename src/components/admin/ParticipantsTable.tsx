"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { sendParticipantReport } from "@/app/actions/reports";
import { resendInvitation } from "@/app/actions/participants";
import { deleteParticipant } from "@/app/actions/admin";
import type { ActionState } from "@/app/actions/org";
import type { AdminParticipant } from "@/lib/data/dashboard";
import { Avatar } from "@/components/dashboard/AdminWidgets";
import { EmptyState, ProfileChip, StatusBadge, tableCls } from "./ui";

const initial: ActionState = {};

const inputCls =
  "rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

type Filter = "ALL" | "INVITED" | "IN_PROGRESS" | "COMPLETED";

const btn =
  "rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition disabled:opacity-50";

/** Copia el enlace de invitación al portapapeles. */
function CopyLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/evaluacion/${token}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* portapapeles no disponible */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      title="Copiar enlace de invitación"
      className={`${btn} bg-slate-100 text-slate-600 hover:bg-slate-200`}
    >
      {copied ? "¡Copiado!" : "⎘ Enlace"}
    </button>
  );
}

function ResendButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState(resendInvitation, initial);
  return (
    <form action={action} className="inline-flex items-center gap-1.5">
      <input type="hidden" name="participantId" value={id} />
      <button
        type="submit"
        disabled={pending}
        title="Reenviar invitación por email"
        className={`${btn} bg-sky-50 text-sky-600 hover:bg-sky-100`}
      >
        {pending ? "Enviando…" : "✉ Reenviar"}
      </button>
      {state.error && (
        <span className="text-[10px] font-medium text-rose-600">{state.error}</span>
      )}
      {state.ok && (
        <span className="text-[10px] font-medium text-emerald-600">✓</span>
      )}
    </form>
  );
}

function SendReportButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState(sendParticipantReport, initial);
  return (
    <form action={action} className="inline-flex items-center gap-1.5">
      <input type="hidden" name="participantId" value={id} />
      <button
        type="submit"
        disabled={pending}
        title="Enviar el informe por email al participante"
        className={`${btn} bg-brand text-white shadow-sm hover:opacity-90`}
      >
        {pending ? "Enviando…" : "✉ Informe"}
      </button>
      {state.error && (
        <span className="text-[10px] font-medium text-rose-600">{state.error}</span>
      )}
      {state.ok && (
        <span className="text-[10px] font-medium text-emerald-600">✓ Enviado</span>
      )}
    </form>
  );
}

function DeleteButton({ id, name }: { id: string; name: string }) {
  const [state, action, pending] = useActionState(deleteParticipant, initial);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        const sure = window.confirm(
          `¿Eliminar a «${name}»?\n\nSe borrarán sus invitaciones, respuestas y resultados. No se puede deshacer.`,
        );
        if (!sure) e.preventDefault();
      }}
      className="inline-flex items-center gap-1.5"
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        title="Eliminar participante"
        className={`${btn} text-slate-300 hover:bg-rose-50 hover:text-rose-600`}
      >
        ✕
      </button>
      {state.error && (
        <span className="text-[10px] font-medium text-rose-600">{state.error}</span>
      )}
    </form>
  );
}

/** Tabla de participantes con búsqueda, filtros y acciones de gestión. */
export function ParticipantsTable({
  participants,
  showOrg = true,
}: {
  participants: AdminParticipant[];
  showOrg?: boolean;
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
      p.orgName.toLowerCase().includes(term) ||
      (p.teamName ?? "").toLowerCase().includes(term)
    );
  });

  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: "ALL", label: "Todos", count: participants.length },
    {
      id: "COMPLETED",
      label: "Completados",
      count: participants.filter((p) => p.status === "COMPLETED").length,
    },
    {
      id: "IN_PROGRESS",
      label: "En curso",
      count: participants.filter((p) => p.status === "IN_PROGRESS").length,
    },
    {
      id: "INVITED",
      label: "Invitados",
      count: participants.filter((p) => p.status === "INVITED").length,
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
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
              <span
                className={`ml-1.5 ${filter === t.id ? "text-slate-300" : "text-slate-400"}`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, email, organización…"
          className={`${inputCls} w-72 max-w-full`}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No hay participantes que coincidan"
          hint="Prueba con otro filtro o término de búsqueda."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className={tableCls.table}>
            <thead className={tableCls.thead}>
              <tr>
                <th className={tableCls.th}>Participante</th>
                {showOrg && <th className={tableCls.th}>Organización</th>}
                <th className={tableCls.th}>Equipo</th>
                <th className={tableCls.th}>Estado</th>
                <th className={tableCls.th}>Resultado</th>
                <th className={`${tableCls.th} text-right`}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className={tableCls.tr}>
                  <td className={tableCls.td}>
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar name={p.fullName} />
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-slate-900">
                          {p.fullName}
                        </div>
                        <div className="truncate text-xs text-slate-400">
                          {p.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  {showOrg && (
                    <td className={`${tableCls.td} text-slate-500`}>
                      {p.orgName}
                    </td>
                  )}
                  <td className={`${tableCls.td} text-slate-500`}>
                    {p.teamName ?? "—"}
                  </td>
                  <td className={tableCls.td}>
                    <StatusBadge status={p.status} />
                  </td>
                  <td className={tableCls.td}>
                    {p.result ? (
                      <span className="inline-flex items-center gap-2">
                        <ProfileChip code={p.result.profileCode} />
                        <span className="text-xs text-slate-500">
                          EQ {p.result.eq}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className={tableCls.td}>
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      {p.status === "COMPLETED" ? (
                        <>
                          <Link
                            href={`/cliente/participantes/${p.id}`}
                            className={`${btn} border border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-600`}
                          >
                            Ver informe
                          </Link>
                          <SendReportButton id={p.id} />
                        </>
                      ) : (
                        p.inviteToken && (
                          <>
                            <CopyLinkButton token={p.inviteToken} />
                            <ResendButton id={p.id} />
                          </>
                        )
                      )}
                      <DeleteButton id={p.id} name={p.fullName} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
