"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/dashboard/AdminWidgets";
import { EmptyState, Progress, tableCls } from "./ui";
import { toast } from "./ui-client";

export interface OrgRow {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  projects: number;
  members: number;
  participants: number;
  completed: number;
}

type SortKey = "name" | "projects" | "participants" | "completion" | "created";

const dateFmt = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" });

function csvCell(v: string | number): string {
  const s = String(v ?? "");
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportCsv(rows: OrgRow[]) {
  const header = ["Organización", "Slug", "Proyectos", "Gestores", "Participantes", "Completados", "Creada"];
  const lines = rows.map((o) =>
    [o.name, o.slug, o.projects, o.members, o.participants, o.completed, o.createdAt.slice(0, 10)]
      .map(csvCell)
      .join(","),
  );
  const csv = "﻿" + [header.join(","), ...lines].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `organizaciones-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast(`${rows.length} filas exportadas a CSV.`, "info");
}

const pctOf = (o: OrgRow) =>
  o.participants > 0 ? Math.round((o.completed / o.participants) * 100) : 0;

/** Tabla de organizaciones con búsqueda, orden y exportación CSV. */
export function OrganizationsTable({ organizations }: { organizations: OrgRow[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "name",
    dir: "asc",
  });
  const term = query.trim().toLowerCase();

  const rows = useMemo(() => {
    const filtered = organizations.filter(
      (o) =>
        !term ||
        o.name.toLowerCase().includes(term) ||
        o.slug.toLowerCase().includes(term),
    );
    const dir = sort.dir === "asc" ? 1 : -1;
    filtered.sort((a, b) => {
      switch (sort.key) {
        case "name":
          return a.name.localeCompare(b.name, "es") * dir;
        case "projects":
          return (a.projects - b.projects) * dir;
        case "participants":
          return (a.participants - b.participants) * dir;
        case "completion":
          return (pctOf(a) - pctOf(b)) * dir;
        case "created":
          return (a.createdAt < b.createdAt ? -1 : 1) * dir;
      }
    });
    return filtered;
  }, [organizations, term, sort]);

  const sortable = (key: SortKey, label: string) => (
    <button
      type="button"
      onClick={() => setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }))}
      className="inline-flex items-center gap-1 transition hover:text-slate-700"
    >
      {label}
      <span className="text-slate-300">
        {sort.key === key ? (sort.dir === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </button>
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar organización o slug…"
          className="w-64 max-w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        />
        <button
          type="button"
          onClick={() => exportCsv(rows)}
          disabled={rows.length === 0}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-50"
        >
          ↓ CSV
        </button>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Sin organizaciones que coincidan" hint="Prueba con otro término." />
      ) : (
        <div className="overflow-x-auto">
          <table className={tableCls.table}>
            <thead className={tableCls.thead}>
              <tr>
                <th className={tableCls.th}>{sortable("name", "Organización")}</th>
                <th className={tableCls.th}>{sortable("projects", "Proyectos")}</th>
                <th className={tableCls.th}>Gestores</th>
                <th className={tableCls.th}>{sortable("participants", "Participantes")}</th>
                <th className={`${tableCls.th} w-44`}>{sortable("completion", "Completados")}</th>
                <th className={tableCls.th}>{sortable("created", "Creada")}</th>
                <th className={tableCls.th} />
              </tr>
            </thead>
            <tbody>
              {rows.map((org) => {
                const pct = pctOf(org);
                return (
                  <tr key={org.id} className={tableCls.tr}>
                    <td className={tableCls.td}>
                      <Link href={`/admin/organizaciones/${org.id}`} className="group flex items-center gap-3">
                        <Avatar name={org.name} />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-slate-900 transition group-hover:text-sky-600">
                            {org.name}
                          </span>
                          <span className="block truncate text-xs text-slate-400">/{org.slug}</span>
                        </span>
                      </Link>
                    </td>
                    <td className={`${tableCls.td} text-slate-600`}>{org.projects}</td>
                    <td className={`${tableCls.td} text-slate-600`}>{org.members}</td>
                    <td className={`${tableCls.td} text-slate-600`}>{org.participants}</td>
                    <td className={tableCls.td}>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Progress value={pct} />
                        </div>
                        <span className="w-12 shrink-0 text-right text-xs font-semibold text-slate-500">
                          {org.completed} · {pct}%
                        </span>
                      </div>
                    </td>
                    <td className={`${tableCls.td} text-xs text-slate-400`}>
                      {dateFmt.format(new Date(org.createdAt))}
                    </td>
                    <td className={`${tableCls.td} text-right`}>
                      <Link
                        href={`/admin/organizaciones/${org.id}`}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-sky-300 hover:text-sky-600"
                      >
                        Gestionar →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
