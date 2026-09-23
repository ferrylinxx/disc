"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { sendParticipantReport } from "@/app/actions/reports";
import {
  resendInvitation,
  bulkParticipantAction,
} from "@/app/actions/participants";
import { deleteParticipant } from "@/app/actions/admin";
import type { ActionState } from "@/app/actions/org";
import type { AdminParticipant } from "@/lib/data/dashboard";
import { Avatar } from "@/components/dashboard/AdminWidgets";
import { EmptyState, ProfileChip, StatusBadge, tableCls } from "./ui";
import { ConfirmButton, toast } from "./ui-client";
import { PresenceBadge } from "./PresenceBadge";
import { SPEED_WARNING_LABEL, SpeedBadge } from "./SpeedBadge";

const initial: ActionState = {};
const inputCls =
  "rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";
const rowBtn =
  "inline-flex items-center whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition disabled:opacity-50";

export type ParticipantFilter = "ALL" | "INVITED" | "IN_PROGRESS" | "COMPLETED" | "FAST" | "UNSENT";
type SortKey = "name" | "status" | "org";
const PAGE_SIZE = 15;

const STATUS_LABEL: Record<string, string> = {
  INVITED: "Invitado",
  IN_PROGRESS: "En curso",
  COMPLETED: "Completado",
};

const isFast = (p: AdminParticipant) => p.result?.speed?.status === "tooFast";
/** Añadido sin enviarle el correo de invitación (todavía no ha recibido nada). */
const isUnsent = (p: AdminParticipant) => p.status === "INVITED" && !p.inviteSent;

function UnsentChip() {
  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200"
      title="Se añadió sin enviar el correo: todavía no ha recibido la invitación"
    >
      Sin enviar
    </span>
  );
}

function csvCell(v: string | number | null | undefined): string {
  const s = String(v ?? "");
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv(rows: AdminParticipant[], showOrg: boolean) {
  const header = [
    "Nombre",
    "Email",
    ...(showOrg ? ["Organización"] : []),
    "Equipo",
    "Estado",
    "Perfil",
    "EQ",
    "Calidad",
  ];
  const lines = rows.map((p) =>
    [
      p.fullName,
      p.email,
      ...(showOrg ? [p.orgName] : []),
      p.teamName ?? "",
      STATUS_LABEL[p.status] ?? p.status,
      p.result?.profileCode ?? "",
      p.result?.eq ?? "",
      isFast(p) ? SPEED_WARNING_LABEL : "",
    ]
      .map(csvCell)
      .join(","),
  );
  const csv = "﻿" + [header.join(","), ...lines].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `participantes-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast(`${rows.length} filas exportadas a CSV.`, "info");
}

/** Lanza un toast cuando una server action por fila termina. */
function useToastOnResult(state: ActionState, okMsg: string) {
  const seen = useRef<ActionState | null>(null);
  useEffect(() => {
    if (state === seen.current) return;
    seen.current = state;
    if (state.error) toast(state.error, "error");
    else if (state.ok) toast(state.message ?? okMsg, "success");
  }, [state, okMsg]);
}

function CopyLinkButton({ token }: { token: string }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/evaluacion/${token}`,
      );
      toast("Enlace de invitación copiado.", "info");
    } catch {
      toast("No se pudo copiar el enlace.", "error");
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      title="Copiar enlace de invitación"
      className={`${rowBtn} bg-slate-100 text-slate-600 hover:bg-slate-200`}
    >
      ⎘ Enlace
    </button>
  );
}

function ResendButton({ id, sent }: { id: string; sent: boolean }) {
  const [state, action, pending] = useActionState(resendInvitation, initial);
  useToastOnResult(state, sent ? "Invitación reenviada." : "Invitación enviada.");
  return (
    <form action={action} className="inline">
      <input type="hidden" name="participantId" value={id} />
      <button
        type="submit"
        disabled={pending}
        title={sent ? "Reenviar la invitación por email" : "Enviar la invitación por email"}
        className={`${rowBtn} ${sent ? "bg-sky-50 text-sky-700 hover:bg-sky-100" : "bg-brand text-white shadow-sm shadow-sky-500/25"}`}
      >
        {pending ? "Enviando…" : sent ? "✉ Reenviar" : "✉ Enviar"}
      </button>
    </form>
  );
}

function SendReportButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState(sendParticipantReport, initial);
  useToastOnResult(state, "Informe enviado.");
  return (
    <form action={action} className="inline">
      <input type="hidden" name="participantId" value={id} />
      <button
        type="submit"
        disabled={pending}
        title="Enviar el informe por email al participante"
        className={`${rowBtn} bg-sky-50 text-sky-700 hover:bg-sky-100`}
      >
        {pending ? "Enviando…" : "✉ Enviar"}
      </button>
    </form>
  );
}

/** Acciones de una fila: informe (ver/enviar) o invitación (enlace/reenviar) y borrar. */
function RowActions({ p }: { p: AdminParticipant }) {
  return (
    <div className="flex flex-nowrap items-center justify-end gap-1.5">
      {p.status === "COMPLETED" ? (
        <>
          <Link
            href={`/cliente/participantes/${p.id}`}
            className={`${rowBtn} border border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-700`}
          >
            Ver informe
          </Link>
          <SendReportButton id={p.id} />
        </>
      ) : (
        p.inviteToken && (
          <>
            <CopyLinkButton token={p.inviteToken} />
            <ResendButton id={p.id} sent={p.inviteSent} />
          </>
        )
      )}
      <ConfirmButton
        action={deleteParticipant}
        fields={{ id: p.id }}
        title={`Eliminar a ${p.fullName}`}
        body="Se borrarán sus invitaciones, respuestas y resultados. No se puede deshacer."
        confirmLabel="Eliminar"
        successMessage="Participante eliminado."
        triggerClass={`${rowBtn} text-slate-300 hover:bg-rose-50 hover:text-rose-600`}
        triggerLabel="✕"
      />
    </div>
  );
}

/** Perfil + EQ + aviso de calidad, o guion si aún no hay resultado. */
function ResultCell({ p }: { p: AdminParticipant }) {
  if (!p.result) return <span className="text-xs text-slate-300">—</span>;
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <ProfileChip code={p.result.profileCode} />
      <span className="whitespace-nowrap text-xs text-slate-500">EQ {p.result.eq}</span>
      <SpeedBadge speed={p.result.speed} />
    </span>
  );
}

/** Barra de acciones en lote (aparece al seleccionar filas). */
function BulkBar({
  ids,
  onDone,
  onClear,
}: {
  ids: string[];
  onDone: () => void;
  onClear: () => void;
}) {
  const [state, action, pending] = useActionState(bulkParticipantAction, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const [op, setOp] = useState<"delete" | "resend">("resend");
  const [confirm, setConfirm] = useState(false);
  const seen = useRef<ActionState | null>(null);

  useEffect(() => {
    if (state === seen.current) return;
    seen.current = state;
    if (state.error) toast(state.error, "error");
    else if (state.ok) {
      toast(state.message ?? "Hecho.", "success");
      setConfirm(false);
      onDone();
    }
  }, [state, onDone]);

  const run = (operation: "delete" | "resend") => {
    setOp(operation);
    setTimeout(() => formRef.current?.requestSubmit(), 0);
  };

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2">
      <span className="text-xs font-semibold text-slate-600">
        {ids.length} seleccionados
      </span>
      <form ref={formRef} action={action} className="contents">
        <input type="hidden" name="op" value={op} />
        {ids.map((id) => (
          <input key={id} type="hidden" name="ids" value={id} />
        ))}
        <button
          type="button"
          onClick={() => run("resend")}
          disabled={pending}
          className={`${rowBtn} bg-white text-sky-700 ring-1 ring-sky-200 hover:bg-sky-100`}
        >
          ✉ Enviar invitación
        </button>
        <button
          type="button"
          onClick={() => setConfirm(true)}
          disabled={pending}
          className={`${rowBtn} bg-white text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50`}
        >
          ✕ Borrar
        </button>
      </form>
      <button
        type="button"
        onClick={onClear}
        className={`${rowBtn} ml-auto text-slate-500 hover:bg-slate-100`}
      >
        Limpiar selección
      </button>

      {confirm && (
        <div
          className="fixed inset-0 z-[65] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
          onClick={() => setConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-scale-in w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <h3 className="text-base font-bold text-slate-900">
              Eliminar {ids.length} participantes
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Se borrarán sus invitaciones, respuestas y resultados. No se puede
              deshacer.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => run("delete")}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {pending ? "…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Tabla de participantes: búsqueda, filtros, orden, lote, CSV y paginación. */
export function ParticipantsTable({
  participants,
  showOrg = true,
  initialFilter = "ALL",
}: {
  participants: AdminParticipant[];
  showOrg?: boolean;
  initialFilter?: ParticipantFilter;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ParticipantFilter>(initialFilter);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "name",
    dir: "asc",
  });
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const term = query.trim().toLowerCase();
  // La columna Equipo solo se muestra si alguien tiene equipo: vacía era ruido.
  const showTeam = participants.some((p) => p.teamName);

  const filtered = useMemo(() => {
    const rows = participants.filter((p) => {
      if (filter === "FAST" && !isFast(p)) return false;
      if (filter === "UNSENT" && !isUnsent(p)) return false;
      if (filter !== "ALL" && filter !== "FAST" && filter !== "UNSENT" && p.status !== filter) return false;
      if (!term) return true;
      return (
        p.fullName.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term) ||
        p.orgName.toLowerCase().includes(term) ||
        (p.teamName ?? "").toLowerCase().includes(term)
      );
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      const va =
        sort.key === "name" ? a.fullName : sort.key === "org" ? a.orgName : a.status;
      const vb =
        sort.key === "name" ? b.fullName : sort.key === "org" ? b.orgName : b.status;
      return va.localeCompare(vb, "es") * dir;
    });
    return rows;
  }, [participants, filter, term, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [filter, term, sort]);

  const pagedIds = paged.map((p) => p.id);
  const allOnPageSelected =
    pagedIds.length > 0 && pagedIds.every((id) => selected.has(id));
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAllOnPage = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) pagedIds.forEach((id) => next.delete(id));
      else pagedIds.forEach((id) => next.add(id));
      return next;
    });
  const clearSelection = () => setSelected(new Set());

  const fastCount = participants.filter(isFast).length;
  const unsentCount = participants.filter(isUnsent).length;
  const tabs: { id: ParticipantFilter; label: string; count: number }[] = [
    { id: "ALL", label: "Todos", count: participants.length },
    { id: "COMPLETED", label: "Completados", count: participants.filter((p) => p.status === "COMPLETED").length },
    { id: "IN_PROGRESS", label: "En curso", count: participants.filter((p) => p.status === "IN_PROGRESS").length },
    { id: "INVITED", label: "Invitados", count: participants.filter((p) => p.status === "INVITED").length },
    ...(unsentCount > 0 ? [{ id: "UNSENT" as const, label: "Sin enviar", count: unsentCount }] : []),
    ...(fastCount > 0 ? [{ id: "FAST" as const, label: "Respuestas rápidas", count: fastCount }] : []),
  ];

  const sortable = (key: SortKey, label: string) => (
    <button
      type="button"
      onClick={() =>
        setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }))
      }
      className={tableCls.sort}
    >
      {label}
      <span className="text-slate-300">
        {sort.key === key ? (sort.dir === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </button>
  );

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
                  ? t.id === "FAST"
                    ? "bg-amber-500 text-white"
                    : "bg-slate-900 text-white"
                  : t.id === "FAST"
                    ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.label}
              <span className={`ml-1.5 ${filter === t.id ? "text-white/70" : "text-slate-400"}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
        <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar persona u organización…"
            className={`${inputCls} min-w-0 flex-1 sm:w-72 sm:flex-none`}
          />
          <button
            type="button"
            onClick={() => downloadCsv(filtered, showOrg)}
            disabled={filtered.length === 0}
            className="shrink-0 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-50"
          >
            ↓ CSV
          </button>
        </div>
      </div>

      {selected.size > 0 && (
        <BulkBar
          ids={[...selected]}
          onDone={clearSelection}
          onClear={clearSelection}
        />
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title="No hay participantes que coincidan"
          hint="Prueba con otro filtro o término de búsqueda."
        />
      ) : (
        <>
          {/* Móvil: tarjetas (la tabla obligaba a desplazarse de lado) */}
          <ul className="space-y-2 md:hidden">
            {paged.map((p) => (
              <li
                key={p.id}
                className={`rounded-xl border border-slate-100 p-3 ${selected.has(p.id) ? "bg-sky-50/50" : "bg-white"}`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                    className="mt-2.5 h-4 w-4 cursor-pointer rounded border-slate-300 accent-sky-500"
                    aria-label={`Seleccionar ${p.fullName}`}
                  />
                  <Avatar name={p.fullName} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-slate-900">{p.fullName}</div>
                    <div className="truncate text-xs text-slate-400">
                      {p.email}
                      {showOrg ? ` · ${p.orgName}` : ""}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusBadge status={p.status} />
                      {isUnsent(p) && <UnsentChip />}
                      <ResultCell p={p} />
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-50 pt-2">
                  <PresenceBadge lastSeenAt={p.lastSeenAt} />
                  <RowActions p={p} />
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <table className={tableCls.table}>
              <thead className={tableCls.thead}>
                <tr>
                  <th className={`${tableCls.th} w-8`}>
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={toggleAllOnPage}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-sky-500"
                      aria-label="Seleccionar página"
                    />
                  </th>
                  <th className={tableCls.th}>{sortable("name", "Participante")}</th>
                  {showOrg && <th className={tableCls.th}>{sortable("org", "Organización")}</th>}
                  {showTeam && <th className={tableCls.th}>Equipo</th>}
                  <th className={tableCls.th}>{sortable("status", "Estado")}</th>
                  <th className={tableCls.th}>Conexión</th>
                  <th className={tableCls.th}>Resultado</th>
                  <th className={`${tableCls.th} text-right`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((p) => (
                  <tr
                    key={p.id}
                    className={`${tableCls.tr} ${selected.has(p.id) ? "bg-sky-50/50" : ""}`}
                  >
                    <td className={tableCls.td}>
                      <input
                        type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={() => toggle(p.id)}
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-sky-500"
                        aria-label={`Seleccionar ${p.fullName}`}
                      />
                    </td>
                    <td className={tableCls.td}>
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Avatar name={p.fullName} />
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-slate-900">{p.fullName}</div>
                          <div className="truncate text-xs text-slate-400">{p.email}</div>
                        </div>
                      </div>
                    </td>
                    {showOrg && <td className={`${tableCls.td} text-[13px] text-slate-600`}>{p.orgName}</td>}
                    {showTeam && <td className={`${tableCls.td} text-slate-500`}>{p.teamName ?? "—"}</td>}
                    <td className={tableCls.td}>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={p.status} />
                        {isUnsent(p) && <UnsentChip />}
                      </div>
                    </td>
                    <td className={`${tableCls.td} whitespace-nowrap`}>
                      <PresenceBadge lastSeenAt={p.lastSeenAt} />
                    </td>
                    <td className={tableCls.td}>
                      <ResultCell p={p} />
                    </td>
                    <td className={tableCls.td}>
                      <RowActions p={p} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              {filtered.length} resultados · página {safePage + 1} de {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-600 transition hover:border-slate-300 disabled:opacity-40"
              >
                ← Anterior
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={safePage >= totalPages - 1}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-600 transition hover:border-slate-300 disabled:opacity-40"
              >
                Siguiente →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
