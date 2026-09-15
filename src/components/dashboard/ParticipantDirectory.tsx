"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ProfileChip, StatusBadge } from "@/components/admin/ui";
import { CopyInviteButton } from "./CopyInviteButton";
import { ResendInviteButton } from "./ResendInviteButton";

export interface DirectoryRow {
  id: string;
  fullName: string;
  email: string;
  status: string;
  teamName: string | null;
  orgName?: string;
  result: { profileCode: string; eq: number } | null;
  inviteToken: string | null;
}

type Filter = "ALL" | "INVITED" | "IN_PROGRESS" | "COMPLETED";

/**
 * Listado de participantes para los paneles de cliente y facilitador: buscador,
 * filtro por estado y, si se pide, agrupado por organización. Filas compactas;
 * el enlace de invitación se copia con un botón en vez de mostrarse entero.
 */
export function ParticipantDirectory({
  rows,
  canManage,
  groupByOrg = false,
}: {
  rows: DirectoryRow[];
  /** Ver informe y reenviar invitación (admin de cliente). El facilitador solo sigue el progreso. */
  canManage: boolean;
  groupByOrg?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const term = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      rows.filter((p) => {
        if (filter !== "ALL" && p.status !== filter) return false;
        if (!term) return true;
        return [p.fullName, p.email, p.teamName ?? "", p.orgName ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(term);
      }),
    [rows, filter, term],
  );

  const groups = useMemo(() => {
    if (!groupByOrg) return [{ name: "", rows: filtered }];
    const map = new Map<string, DirectoryRow[]>();
    for (const r of filtered) {
      const key = r.orgName ?? "";
      map.set(key, [...(map.get(key) ?? []), r]);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b, "es"))
      .map(([name, list]) => ({ name, rows: list }));
  }, [filtered, groupByOrg]);

  const count = (s: Filter) => (s === "ALL" ? rows.length : rows.filter((r) => r.status === s).length);
  const tabs: { id: Filter; label: string }[] = [
    { id: "ALL", label: "Todos" },
    { id: "COMPLETED", label: "Completados" },
    { id: "IN_PROGRESS", label: "En curso" },
    { id: "INVITED", label: "Invitados" },
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
                filter === t.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.label}
              <span className={`ml-1.5 ${filter === t.id ? "text-white/70" : "text-slate-400"}`}>
                {count(t.id)}
              </span>
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar persona o equipo…"
          className="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 sm:w-64"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">No hay participantes que coincidan.</p>
      ) : (
        <div className="space-y-5">
          {groups.map((g) => (
            <div key={g.name || "todos"}>
              {groupByOrg && (
                <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  {g.name}
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                    {g.rows.length}
                  </span>
                </p>
              )}
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white">
                {g.rows.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                    <div className="min-w-0 flex-1 basis-56">
                      <div className="truncate font-semibold text-slate-900">{p.fullName}</div>
                      <div className="truncate text-xs text-slate-400">
                        {p.email}
                        {p.teamName ? ` · ${p.teamName}` : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {p.result && (
                        <>
                          <ProfileChip code={p.result.profileCode} />
                          <span className="whitespace-nowrap text-slate-500">EQ {p.result.eq}</span>
                        </>
                      )}
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="flex items-center justify-end gap-1.5 sm:w-52">
                      {p.status === "COMPLETED" && canManage ? (
                        <Link
                          href={`/cliente/participantes/${p.id}`}
                          className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
                        >
                          Ver informe →
                        </Link>
                      ) : (
                        p.status !== "COMPLETED" &&
                        p.inviteToken && (
                          <>
                            <CopyInviteButton path={`/evaluacion/${p.inviteToken}`} />
                            {canManage && <ResendInviteButton participantId={p.id} />}
                          </>
                        )
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
