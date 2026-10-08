"use client";

import { Fragment, useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addMembership,
  bulkUserAction,
  createUser,
  deleteUser,
  removeMembership,
  updateUser,
} from "@/app/actions/users";
import type { ActionState } from "@/app/actions/org";
import type { AdminUser } from "@/lib/data/dashboard";
import { ConfirmButton, toast } from "@/components/admin/ui-client";
import { PresenceBadge, ONLINE_WINDOW_MS } from "@/components/admin/PresenceBadge";
import { btn, tableCls } from "@/components/admin/ui";
import { Avatar } from "@/components/dashboard/AdminWidgets";

const initial: ActionState = {};

const inputCls =
  "rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

/** Desplegables de la fila de filtros: compactos para que quepan en una línea. */
const filterSelectCls = `${inputCls} py-1 text-xs`;

const globalRoleLabel: Record<string, string> = {
  SUPERADMIN: "Superadmin",
  USER: "Usuario",
};

/** Lanza un toast cuando una server action cambia de estado. */
function useToastOnResult(state: ActionState, okMsg: string) {
  const seen = useRef<ActionState | null>(null);
  useEffect(() => {
    if (state === seen.current) return;
    seen.current = state;
    if (state.error) toast(state.error, "error");
    else if (state.ok) toast(state.message ?? okMsg, "success");
  }, [state, okMsg]);
}

function csvCell(v: string | number): string {
  const s = String(v ?? "");
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function exportUsersCsv(users: AdminUser[]) {
  const header = ["Nombre", "Email", "Rol", "Organizaciones", "Evaluaciones"];
  const lines = users.map((u) =>
    [
      u.name ?? "",
      u.email,
      globalRoleLabel[u.globalRole] ?? u.globalRole,
      u.orgs.map((o) => o.name).join(" / "),
      u.participantCount,
    ]
      .map(csvCell)
      .join(","),
  );
  const csv = "﻿" + [header.join(","), ...lines].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `usuarios-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast(`${users.length} filas exportadas a CSV.`, "info");
}
const memberRoleLabel: Record<string, string> = {
  ADMIN: "Admin cliente",
  FACILITATOR: "Facilitador",
};

interface OrgOption {
  id: string;
  name: string;
}

/** Cada cuánto se refresca el listado para reflejar la presencia (ms). */
const REFRESH_MS = 15_000;
const PAGE_SIZE = 20;
/** Usuarios que se ven de golpe al abrir un grupo (luego, "Ver más"). */
const GROUP_PAGE = 20;
/** Con pocos resultados (o al buscar) los grupos se abren solos. */
const AUTO_OPEN_MAX = 25;

const isOnline = (u: AdminUser, now: number) =>
  u.lastSeenAt != null && now - new Date(u.lastSeenAt).getTime() < ONLINE_WINDOW_MS;

/** Grupo de la vista por organización. */
interface UserGroupData {
  key: string;
  kind: "super" | "org" | "none";
  /** Id de la organización (solo en los grupos de tipo "org"). */
  orgId?: string;
  name: string;
  users: AdminUser[];
}

type GRole = "ALL" | "SUPERADMIN" | "USER";
type MRole = "ALL" | "ADMIN" | "FACILITATOR" | "NONE";
type Conn = "ALL" | "ONLINE" | "ACTIVE" | "NONE";
type SortKey = "name" | "lastSeen" | "orgs" | "role";

/** Chip de filtro reutilizable. */
function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

export function UserManager({
  users,
  organizations,
  currentUserId,
}: {
  users: AdminUser[];
  organizations: OrgOption[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [gRole, setGRole] = useState<GRole>("ALL");
  const [mRole, setMRole] = useState<MRole>("ALL");
  const [conn, setConn] = useState<Conn>("ALL");
  const [orgFilter, setOrgFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  // Por defecto, por organización: con muchos usuarios, la lista entera no se gestiona.
  const [grouped, setGrouped] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  // "Ahora" para la presencia: se fija al montar y avanza con cada refresco.
  const [now, setNow] = useState(() => Date.now());

  const term = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    const rows = users.filter((u) => {
      if (term) {
        const domain = (u.email.split("@")[1] ?? "").toLowerCase();
        const hay = [u.name ?? "", u.email, ...u.orgs.map((o) => o.name)]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(term) && !domain.includes(term)) return false;
      }
      if (gRole !== "ALL" && u.globalRole !== gRole) return false;
      if (mRole === "NONE" && u.memberships.length > 0) return false;
      if (
        (mRole === "ADMIN" || mRole === "FACILITATOR") &&
        !u.memberships.some((m) => m.role === mRole)
      )
        return false;
      if (orgFilter !== "ALL" && !u.orgs.some((o) => o.id === orgFilter)) return false;
      if (conn !== "ALL") {
        const t = u.lastSeenAt ? now - new Date(u.lastSeenAt).getTime() : Infinity;
        const online = t < ONLINE_WINDOW_MS;
        if (conn === "ONLINE" && !online) return false;
        if (conn === "ACTIVE" && (online || u.lastSeenAt == null)) return false;
        if (conn === "NONE" && u.lastSeenAt != null) return false;
      }
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      if (sortKey === "orgs") return (a.orgs.length - b.orgs.length) * dir;
      if (sortKey === "role")
        return (globalRoleLabel[a.globalRole] ?? "").localeCompare(
          globalRoleLabel[b.globalRole] ?? "",
          "es",
        ) * dir;
      if (sortKey === "lastSeen") {
        const ta = a.lastSeenAt ? new Date(a.lastSeenAt).getTime() : 0;
        const tb = b.lastSeenAt ? new Date(b.lastSeenAt).getTime() : 0;
        return (ta - tb) * dir;
      }
      return (a.name ?? a.email).localeCompare(b.name ?? b.email, "es") * dir;
    });
    return rows;
  }, [users, term, gRole, mRole, orgFilter, conn, sortKey, sortDir, now]);

  const onlineCount = users.filter((u) => isOnline(u, now)).length;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  // Al cambiar filtros, orden o vista, se vuelve a la primera página.
  const pageKey = [term, gRole, mRole, orgFilter, conn, sortKey, sortDir, grouped].join("|");
  const [pageFor, setPageFor] = useState(pageKey);
  if (pageFor !== pageKey) {
    setPageFor(pageKey);
    setPage(0);
  }

  // Refresco periódico para reflejar la presencia casi en tiempo real.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setNow(Date.now());
      router.refresh();
    }, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [router]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const clearSelection = () => setSelected(new Set());
  const pageIds = paged.map((u) => u.id);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const toggleAllOnPage = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });

  // Vista por organización: superadmins arriba, una fila plegable por
  // organización (quien está en varias sale en cada una) y, al final, quien no
  // tiene ninguna. Si se filtra por una organización, solo sale su grupo.
  const groups = useMemo<UserGroupData[]>(() => {
    if (!grouped) return [];
    const map = new Map<string, UserGroupData>();
    const supers: AdminUser[] = [];
    const noOrg: AdminUser[] = [];
    for (const u of filtered) {
      if (u.globalRole === "SUPERADMIN") supers.push(u);
      if (u.orgs.length === 0 && u.globalRole !== "SUPERADMIN") noOrg.push(u);
      for (const o of u.orgs) {
        if (orgFilter !== "ALL" && o.id !== orgFilter) continue;
        const g = map.get(o.id) ?? { key: o.id, kind: "org", orgId: o.id, name: o.name, users: [] };
        g.users.push(u);
        map.set(o.id, g);
      }
    }
    const orgs = [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
    if (orgFilter !== "ALL") return orgs;
    return [
      ...(supers.length ? [{ key: "super", kind: "super" as const, name: "Superadmins", users: supers }] : []),
      ...orgs,
      ...(noOrg.length ? [{ key: "none", kind: "none" as const, name: "Sin organización", users: noOrg }] : []),
    ];
  }, [grouped, filtered, orgFilter]);

  // Grupos abiertos. Al buscar (o con pocos resultados) se abren todos y lo que
  // se toca es cerrarlos; si no, empiezan cerrados. `flipped` guarda los que el
  // usuario ha cambiado respecto a eso, y se vacía cuando cambia el modo.
  const autoOpen =
    Boolean(term) || orgFilter !== "ALL" || groups.length === 1 || filtered.length <= AUTO_OPEN_MAX;
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [flippedFor, setFlippedFor] = useState(autoOpen);
  if (flippedFor !== autoOpen) {
    setFlippedFor(autoOpen);
    setFlipped(new Set());
  }
  const isGroupOpen = (key: string) => autoOpen !== flipped.has(key);
  const toggleGroup = (key: string) =>
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const setAllGroups = (open: boolean) =>
    setFlipped(open === autoOpen ? new Set() : new Set(groups.map((g) => g.key)));
  const openCount = groups.filter((g) => isGroupOpen(g.key)).length;
  const orgGroups = groups.filter((g) => g.kind === "org").length;

  const toggleMany = (ids: string[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });

  const selectedUsers = users.filter((u) => selected.has(u.id));

  return (
    <section className="animate-fade-up rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/40">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-slate-900">Usuarios ({users.length})</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {onlineCount} en línea
          </span>
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar nombre, email u organización…"
            className={`${inputCls} min-w-0 flex-1 basis-full py-2 sm:w-72 sm:flex-none sm:basis-auto`}
          />
          <button
            type="button"
            onClick={() => exportUsersCsv(filtered)}
            disabled={filtered.length === 0}
            className={btn.secondary}
          >
            ↓ CSV
          </button>
          <button type="button" onClick={() => setShowCreate((v) => !v)} className={btn.primary}>
            {showCreate ? "Cerrar" : "+ Nuevo usuario"}
          </button>
        </div>
      </div>

      {/* Filtros: rol global en chips; el resto, desplegables en la misma fila */}
      <div className="mb-4 flex flex-wrap items-center gap-2 border-y border-slate-100 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip active={gRole === "ALL"} onClick={() => setGRole("ALL")}>Todos</Chip>
          <Chip active={gRole === "SUPERADMIN"} onClick={() => setGRole("SUPERADMIN")}>Superadmin</Chip>
          <Chip active={gRole === "USER"} onClick={() => setGRole("USER")}>Usuario</Chip>
        </div>
        <span className="mx-1 hidden h-5 w-px bg-slate-200 sm:block" />
        <select
          value={mRole}
          onChange={(e) => setMRole(e.target.value as MRole)}
          aria-label="Rol en organizaciones"
          className={filterSelectCls}
        >
          <option value="ALL">Cualquier rol en organización</option>
          <option value="ADMIN">Admin cliente</option>
          <option value="FACILITATOR">Facilitador</option>
          <option value="NONE">Sin rol en organizaciones</option>
        </select>
        <select
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
          aria-label="Organización"
          className={filterSelectCls}
        >
          <option value="ALL">Todas las organizaciones</option>
          {organizations.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
        <select
          value={conn}
          onChange={(e) => setConn(e.target.value as Conn)}
          aria-label="Conexión"
          className={filterSelectCls}
        >
          <option value="ALL">Cualquier conexión</option>
          <option value="ONLINE">En línea</option>
          <option value="ACTIVE">Con actividad</option>
          <option value="NONE">Sin actividad</option>
        </select>
        <div className="flex flex-wrap items-center gap-1 sm:ml-auto">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            aria-label="Ordenar"
            className={filterSelectCls}
          >
            <option value="name">Ordenar: nombre</option>
            <option value="lastSeen">Ordenar: última conexión</option>
            <option value="orgs">Ordenar: nº organizaciones</option>
            <option value="role">Ordenar: rol</option>
          </select>
          <button
            type="button"
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            title="Cambiar dirección"
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
          >
            {sortDir === "asc" ? "↑" : "↓"}
          </button>
          <div
            role="group"
            aria-label="Vista"
            className="inline-flex rounded-full bg-slate-100 p-0.5 sm:ml-1"
          >
            {[
              { on: true, label: "Por organización" },
              { on: false, label: "Lista" },
            ].map((v) => (
              <button
                key={v.label}
                type="button"
                onClick={() => setGrouped(v.on)}
                aria-pressed={grouped === v.on}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  grouped === v.on
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="mb-4">
          <CreateUserForm
            organizations={organizations}
            onCreated={() => setShowCreate(false)}
          />
        </div>
      )}

      {selected.size > 0 && (
        <UserBulkBar users={selectedUsers} onDone={clearSelection} onClear={clearSelection} />
      )}

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">No hay usuarios que coincidan.</p>
      ) : grouped ? (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              {filtered.length} {filtered.length === 1 ? "usuario" : "usuarios"} en {orgGroups}{" "}
              {orgGroups === 1 ? "organización" : "organizaciones"}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setAllGroups(true)}
                disabled={openCount === groups.length}
                className={btn.ghost}
              >
                Abrir todas
              </button>
              <button
                type="button"
                onClick={() => setAllGroups(false)}
                disabled={openCount === 0}
                className={btn.ghost}
              >
                Cerrar todas
              </button>
            </div>
          </div>
          <div className="space-y-2.5">
            {groups.map((g) => (
              <UserGroup
                key={g.key}
                group={g}
                open={isGroupOpen(g.key)}
                onToggleOpen={() => toggleGroup(g.key)}
                organizations={organizations}
                currentUserId={currentUserId}
                selected={selected}
                onToggle={toggle}
                onToggleMany={toggleMany}
                now={now}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <UsersTable
            users={paged}
            organizations={organizations}
            currentUserId={currentUserId}
            selected={selected}
            onToggle={toggle}
            allSelected={allOnPageSelected}
            onToggleAll={toggleAllOnPage}
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              {filtered.length} usuarios · página {safePage + 1} de {totalPages}
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
    </section>
  );
}

/**
 * Un grupo de la vista por organización: cabecera plegable con el resumen
 * (usuarios, gestores, en línea y unas caras) y, abierto, su tabla de 20 en 20.
 */
function UserGroup({
  group,
  open,
  onToggleOpen,
  organizations,
  currentUserId,
  selected,
  onToggle,
  onToggleMany,
  now,
}: {
  group: UserGroupData;
  open: boolean;
  onToggleOpen: () => void;
  organizations: OrgOption[];
  currentUserId: string;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleMany: (ids: string[], on: boolean) => void;
  now: number;
}) {
  const [limit, setLimit] = useState(GROUP_PAGE);
  const { users } = group;
  const online = users.filter((u) => isOnline(u, now)).length;
  const roleCount = (role: "ADMIN" | "FACILITATOR") =>
    users.filter((u) =>
      u.memberships.some((m) => m.organizationId === group.orgId && m.role === role),
    ).length;
  const admins = group.kind === "org" ? roleCount("ADMIN") : 0;
  const facilitators = group.kind === "org" ? roleCount("FACILITATOR") : 0;
  const ids = users.map((u) => u.id);
  const allSelected = ids.length > 0 && ids.every((id) => selected.has(id));
  const someSelected = ids.some((id) => selected.has(id));
  const rest = users.length - limit;
  const faces = users.slice(0, 4);

  const summary = [
    `${users.length} ${users.length === 1 ? "usuario" : "usuarios"}`,
    admins ? `${admins} admin cliente` : null,
    facilitators ? `${facilitators} ${facilitators === 1 ? "facilitador" : "facilitadores"}` : null,
  ].filter(Boolean);

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition ${
        open ? "border-slate-200 shadow-sm shadow-slate-200/50" : "border-slate-200/70 hover:border-slate-300"
      }`}
    >
      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={open}
        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
          open ? "bg-slate-50/80" : "bg-white hover:bg-slate-50/60"
        }`}
      >
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-90" : ""}`}
        >
          <path d="M7.2 4.6a1 1 0 0 1 1.4 0l4.7 4.7a1 1 0 0 1 0 1.4l-4.7 4.7a1 1 0 1 1-1.4-1.4l4-4-4-4a1 1 0 0 1 0-1.4Z" />
        </svg>
        <GroupIcon group={group} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-bold text-slate-900">{group.name}</span>
            {someSelected && (
              <span className="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700">
                {ids.filter((id) => selected.has(id)).length} sel.
              </span>
            )}
          </span>
          <span className="mt-0.5 block truncate text-xs text-slate-500">{summary.join(" · ")}</span>
        </span>
        {online > 0 && (
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {online} en línea
          </span>
        )}
        <span className="hidden shrink-0 items-center -space-x-1.5 md:flex" aria-hidden>
          {faces.map((u) => (
            <span key={u.id} className="inline-flex rounded-full ring-2 ring-white">
              <Avatar name={u.name || u.email} image={u.image} size="sm" />
            </span>
          ))}
          {users.length > faces.length && (
            <span className="grid h-7 min-w-7 place-items-center rounded-full bg-slate-100 px-1.5 text-[10px] font-bold text-slate-500 ring-2 ring-white">
              +{users.length - faces.length}
            </span>
          )}
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-2 pb-2">
          <UsersTable
            users={users.slice(0, limit)}
            organizations={organizations}
            currentUserId={currentUserId}
            selected={selected}
            onToggle={onToggle}
            allSelected={allSelected}
            onToggleAll={() => onToggleMany(ids, !allSelected)}
            allLabel={`Seleccionar los ${users.length} de ${group.name}`}
            keyPrefix={`${group.key}-`}
          />
          {rest > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLimit((l) => l + GROUP_PAGE)}
                className={btn.secondary}
              >
                Ver {Math.min(GROUP_PAGE, rest)} más
              </button>
              {rest > GROUP_PAGE && (
                <button type="button" onClick={() => setLimit(users.length)} className={btn.ghost}>
                  Ver los {users.length}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Icono del grupo: iniciales de la organización, corona o "sin organización". */
function GroupIcon({ group }: { group: UserGroupData }) {
  if (group.kind === "org") {
    return (
      <span className="shrink-0">
        <Avatar name={group.name} />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
        group.kind === "super"
          ? "bg-gradient-to-br from-amber-100 to-yellow-50 text-amber-600 ring-1 ring-amber-200"
          : "bg-slate-100 text-slate-400"
      }`}
    >
      {group.kind === "super" ? (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M3 8.5 7.5 12 12 5l4.5 7L21 8.5 19 18H5Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
          <circle cx="12" cy="8.5" r="3.5" />
          <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
        </svg>
      )}
    </span>
  );
}

/**
 * Tabla de usuarios (misma presentación que Organizaciones y Participantes).
 * "Gestionar" abre el editor en una fila a todo el ancho, debajo del usuario.
 */
function UsersTable({
  users,
  organizations,
  currentUserId,
  selected,
  onToggle,
  allSelected,
  onToggleAll,
  allLabel = "Seleccionar página",
  keyPrefix = "",
}: {
  users: AdminUser[];
  organizations: OrgOption[];
  currentUserId: string;
  selected?: Set<string>;
  onToggle?: (id: string) => void;
  allSelected?: boolean;
  onToggleAll?: () => void;
  allLabel?: string;
  keyPrefix?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const selectable = Boolean(onToggle);
  const cols = selectable ? 7 : 6;

  return (
    <div className="overflow-x-auto">
      <table className={tableCls.table}>
        <thead className={tableCls.thead}>
          <tr>
            {selectable && (
              <th className={`${tableCls.th} w-8`}>
                <input
                  type="checkbox"
                  checked={allSelected ?? false}
                  onChange={onToggleAll}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-sky-500"
                  aria-label={allLabel}
                  title={allLabel}
                />
              </th>
            )}
            <th className={tableCls.th}>Usuario</th>
            <th className={tableCls.th}>Rol</th>
            <th className={tableCls.th}>Organizaciones</th>
            <th className={`${tableCls.th} text-center`}>Evaluaciones</th>
            <th className={tableCls.th}>Conexión</th>
            <th className={tableCls.th} />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            const open = openId === user.id;
            const isChecked = selected?.has(user.id) ?? false;
            return (
              <Fragment key={`${keyPrefix}${user.id}`}>
                <tr className={`${tableCls.tr} ${isChecked || open ? "bg-sky-50/40" : ""}`}>
                  {selectable && (
                    <td className={tableCls.td}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggle?.(user.id)}
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-sky-500"
                        aria-label={`Seleccionar ${user.name ?? user.email}`}
                      />
                    </td>
                  )}
                  <td className={tableCls.td}>
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar name={user.name || user.email} image={user.image} superadmin={user.globalRole === "SUPERADMIN"} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 truncate font-semibold text-slate-900">
                          {user.name || "—"}
                          {isSelf && (
                            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-600">
                              tú
                            </span>
                          )}
                        </div>
                        <div className="truncate text-xs text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className={tableCls.td}>
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        user.globalRole === "SUPERADMIN"
                          ? "bg-sky-50 text-sky-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {globalRoleLabel[user.globalRole] ?? user.globalRole}
                    </span>
                  </td>
                  <td className={`${tableCls.td} max-w-[260px]`}>
                    {user.orgs.length === 0 ? (
                      <span className="text-xs text-slate-300">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {user.orgs.map((o) => {
                          const m = user.memberships.find((x) => x.organizationId === o.id);
                          return (
                            <span
                              key={o.id}
                              className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-100"
                              title={m ? memberRoleLabel[m.role] : "Participante"}
                            >
                              {o.name}
                              {m && <span className="text-sky-600"> · {memberRoleLabel[m.role]}</span>}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </td>
                  <td className={`${tableCls.td} text-center text-slate-600`}>
                    {user.participantCount}
                  </td>
                  <td className={`${tableCls.td} whitespace-nowrap`}>
                    <PresenceBadge lastSeenAt={user.lastSeenAt} />
                  </td>
                  <td className={`${tableCls.td} text-right`}>
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : user.id)}
                      aria-expanded={open}
                      className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-sky-300 hover:text-sky-600"
                    >
                      {open ? "Cerrar" : "Gestionar"}
                    </button>
                  </td>
                </tr>
                {open && (
                  <tr>
                    <td colSpan={cols} className="px-3 pb-4">
                      <UserEditor user={user} organizations={organizations} isSelf={isSelf} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Barra de acciones en lote para usuarios (borrar, cambiar rol, exportar). */
function UserBulkBar({
  users,
  onDone,
  onClear,
}: {
  users: AdminUser[];
  onDone: () => void;
  onClear: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const ids = users.map((u) => u.id);

  async function run(op: "delete" | "role", role?: "SUPERADMIN" | "USER") {
    setBusy(true);
    const r = await bulkUserAction({ op, ids, role });
    setBusy(false);
    if (r.error) toast(r.error, "error");
    else {
      toast(r.message ?? "Hecho.", "success");
      setConfirm(false);
      onDone();
    }
  }

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2">
      <span className="text-xs font-semibold text-slate-600">{ids.length} seleccionados</span>
      <button
        type="button"
        disabled={busy}
        onClick={() => run("role", "SUPERADMIN")}
        className="rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:opacity-50"
      >
        → Superadmin
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => run("role", "USER")}
        className="rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:opacity-50"
      >
        → Usuario
      </button>
      <button
        type="button"
        onClick={() => exportUsersCsv(users)}
        className="rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-200 transition hover:bg-sky-100"
      >
        ↓ Exportar selección
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => setConfirm(true)}
        className="rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50 disabled:opacity-50"
      >
        ✕ Borrar
      </button>
      <button
        type="button"
        onClick={onClear}
        className="ml-auto rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-100"
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
            <h3 className="text-base font-bold text-slate-900">Eliminar {ids.length} usuarios</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Se eliminarán sus cuentas y asignaciones. Tu propia cuenta se conserva. No se puede
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
                disabled={busy}
                onClick={() => run("delete")}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {busy ? "…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateUserForm({
  organizations,
  onCreated,
}: {
  organizations: OrgOption[];
  onCreated?: () => void;
}) {
  const [state, action, pending] = useActionState(createUser, initial);
  useToastOnResult(state, "Usuario creado.");

  useEffect(() => {
    if (state.ok) onCreated?.();
  }, [state.ok, onCreated]);

  return (
    <section className="rounded-2xl border border-sky-100 bg-sky-50/40 p-5">
      <h3 className="mb-1 text-sm font-bold text-slate-900">Nuevo usuario</h3>
      <p className="mb-4 text-xs text-slate-500">
        Crea una cuenta con acceso por credenciales y, si quieres, asígnala a una
        organización.
      </p>
      <form
        key={state.ok ? "reset" : "form"}
        action={action}
        className="flex flex-wrap items-end gap-2"
      >
        <label className="flex-1 min-w-[180px] text-xs font-medium text-slate-500">
          Nombre
          <input
            name="name"
            placeholder="Nombre completo"
            className={`${inputCls} mt-1 w-full`}
          />
        </label>
        <label className="flex-1 min-w-[180px] text-xs font-medium text-slate-500">
          Email
          <input
            name="email"
            type="email"
            required
            placeholder="persona@empresa.com"
            className={`${inputCls} mt-1 w-full`}
          />
        </label>
        <label className="flex-1 min-w-[160px] text-xs font-medium text-slate-500">
          Contraseña
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            className={`${inputCls} mt-1 w-full`}
          />
        </label>
        <label className="text-xs font-medium text-slate-500">
          Rol global
          <select name="globalRole" defaultValue="USER" className={`${inputCls} mt-1 block`}>
            <option value="USER">Usuario</option>
            <option value="SUPERADMIN">Admin GESEM</option>
          </select>
        </label>
        <label className="text-xs font-medium text-slate-500">
          Organización
          <select name="organizationId" defaultValue="" className={`${inputCls} mt-1 block`}>
            <option value="">Sin organización</option>
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-500">
          Rol en organización
          <select name="membershipRole" defaultValue="ADMIN" className={`${inputCls} mt-1 block`}>
            <option value="ADMIN">Admin cliente</option>
            <option value="FACILITATOR">Facilitador</option>
          </select>
        </label>
        <label className="text-xs font-medium text-slate-500">
          Idioma del correo
          <select name="lang" defaultValue="ca" className={`${inputCls} mt-1 block`}>
            <option value="ca">Catalán</option>
            <option value="es">Castellano</option>
          </select>
        </label>
        <button type="submit" disabled={pending} className={btn.primary}>
          {pending ? "Creando…" : "Crear usuario"}
        </button>
        <Feedback state={state} />
      </form>
    </section>
  );
}

function Feedback({ state }: { state: ActionState }) {
  if (state.error)
    return <p className="text-xs font-medium text-rose-600">{state.error}</p>;
  if (state.ok)
    return <p className="text-xs font-medium text-emerald-600">Guardado ✓</p>;
  return null;
}

function UserEditor({
  user,
  organizations,
  isSelf,
}: {
  user: AdminUser;
  organizations: OrgOption[];
  isSelf: boolean;
}) {
  const [editState, editAction, editing] = useActionState(updateUser, initial);
  const [memState, memAction, savingMem] = useActionState(
    addMembership,
    initial,
  );
  const [rmState, rmAction] = useActionState(removeMembership, initial);
  useToastOnResult(editState, "Usuario actualizado.");
  useToastOnResult(memState, "Organización asignada.");
  useToastOnResult(rmState, "Asignación retirada.");

  return (
    <div className="space-y-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <form action={editAction} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="userId" value={user.id} />
        <label className="flex-1 min-w-[180px] text-xs font-medium text-slate-500">
          Nombre
          <input
            name="name"
            defaultValue={user.name ?? ""}
            placeholder="Nombre completo"
            className={`${inputCls} mt-1 w-full`}
          />
        </label>
        <label className="text-xs font-medium text-slate-500">
          Rol global
          <select
            name="globalRole"
            defaultValue={user.globalRole}
            disabled={isSelf}
            className={`${inputCls} mt-1 block`}
          >
            <option value="USER">Usuario</option>
            <option value="SUPERADMIN">Admin GESEM</option>
          </select>
        </label>
        <button type="submit" disabled={editing} className={btn.primary}>
          {editing ? "Guardando…" : "Guardar"}
        </button>
        <Feedback state={editState} />
      </form>

      <div className="border-t border-slate-100 pt-3">
        <p className="mb-2 text-xs font-semibold text-slate-500">
          Rol en organizaciones
        </p>
        {user.memberships.length === 0 ? (
          <p className="mb-2 text-xs text-slate-400">Sin asignaciones.</p>
        ) : (
          <ul className="mb-3 space-y-1.5">
            {user.memberships.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="text-slate-700">
                  {m.organizationName}{" "}
                  <span className="text-xs text-slate-400">
                    · {memberRoleLabel[m.role] ?? m.role}
                  </span>
                </span>
                <form action={rmAction}>
                  <input type="hidden" name="membershipId" value={m.id} />
                  <button
                    type="submit"
                    className="text-xs font-semibold text-rose-500 hover:text-rose-700"
                  >
                    Quitar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
        {rmState.error && (
          <p className="mb-2 text-xs font-medium text-rose-600">
            {rmState.error}
          </p>
        )}
        {organizations.length > 0 && (
          <form action={memAction} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="userId" value={user.id} />
            <select name="organizationId" required className={`${inputCls} min-w-[160px]`}>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
            <select name="role" className={inputCls}>
              <option value="ADMIN">Admin cliente</option>
              <option value="FACILITATOR">Facilitador</option>
            </select>
            <button type="submit" disabled={savingMem} className={btn.secondary}>
              {savingMem ? "Asignando…" : "Asignar"}
            </button>
            <Feedback state={memState} />
          </form>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
        {isSelf ? (
          <span
            title="No puedes eliminar tu propia cuenta"
            className="cursor-not-allowed rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-300"
          >
            Eliminar usuario
          </span>
        ) : (
          <ConfirmButton
            action={deleteUser}
            fields={{ userId: user.id }}
            title={`Eliminar a ${user.name || user.email}`}
            body="Se eliminará la cuenta y sus asignaciones. Esta acción no se puede deshacer."
            confirmLabel="Eliminar usuario"
            successMessage="Usuario eliminado."
            triggerClass={btn.danger}
            triggerLabel="Eliminar usuario"
          />
        )}
      </div>
    </div>
  );
}
