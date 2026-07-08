"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
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

const initial: ActionState = {};

const inputCls =
  "rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

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
      u.memberships.length,
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
  const [grouped, setGrouped] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);

  const term = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    const now = Date.now();
    const rows = users.filter((u) => {
      if (term) {
        const domain = (u.email.split("@")[1] ?? "").toLowerCase();
        const hay = [u.name ?? "", u.email, ...u.memberships.map((m) => m.organizationName)]
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
      if (orgFilter !== "ALL" && !u.memberships.some((m) => m.organizationId === orgFilter))
        return false;
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
      if (sortKey === "orgs") return (a.memberships.length - b.memberships.length) * dir;
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
  }, [users, term, gRole, mRole, orgFilter, conn, sortKey, sortDir]);

  const onlineCount = users.filter(
    (u) =>
      u.lastSeenAt && Date.now() - new Date(u.lastSeenAt).getTime() < ONLINE_WINDOW_MS,
  ).length;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => setPage(0), [term, gRole, mRole, orgFilter, conn, sortKey, sortDir, grouped]);

  // Refresco periódico para reflejar la presencia casi en tiempo real.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
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

  // Vista agrupada por organización.
  const groups = useMemo(() => {
    if (!grouped) return null;
    const map = new Map<string, { name: string; users: AdminUser[] }>();
    const noOrg: AdminUser[] = [];
    for (const u of filtered) {
      if (u.memberships.length === 0) {
        noOrg.push(u);
        continue;
      }
      for (const m of u.memberships) {
        const g = map.get(m.organizationId) ?? { name: m.organizationName, users: [] };
        g.users.push(u);
        map.set(m.organizationId, g);
      }
    }
    const arr = [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
    if (noOrg.length) arr.push({ name: "Sin organización", users: noOrg });
    return arr;
  }, [grouped, filtered]);

  const selectedUsers = users.filter((u) => selected.has(u.id));

  return (
    <div className="space-y-6">
      <section className="glass animate-fade-up rounded-2xl border border-white/60 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Usuarios ({users.length})
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {onlineCount} en línea
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, email, dominio u organización…"
              className={`${inputCls} w-72 max-w-full`}
            />
            <button
              type="button"
              onClick={() => exportUsersCsv(filtered)}
              disabled={filtered.length === 0}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-50"
            >
              ↓ CSV
            </button>
            <button
              type="button"
              onClick={() => setShowCreate((v) => !v)}
              className="bg-brand rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:opacity-95"
            >
              {showCreate ? "Cerrar" : "Nuevo usuario"}
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-4 flex flex-col gap-2 border-y border-slate-100 py-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Rol</span>
            <Chip active={gRole === "ALL"} onClick={() => setGRole("ALL")}>Todos</Chip>
            <Chip active={gRole === "SUPERADMIN"} onClick={() => setGRole("SUPERADMIN")}>Superadmin</Chip>
            <Chip active={gRole === "USER"} onClick={() => setGRole("USER")}>Usuario</Chip>
            <span className="mx-2 h-4 w-px bg-slate-200" />
            <Chip active={mRole === "ALL"} onClick={() => setMRole("ALL")}>Cualquier org</Chip>
            <Chip active={mRole === "ADMIN"} onClick={() => setMRole("ADMIN")}>Admin cliente</Chip>
            <Chip active={mRole === "FACILITATOR"} onClick={() => setMRole("FACILITATOR")}>Facilitador</Chip>
            <Chip active={mRole === "NONE"} onClick={() => setMRole("NONE")}>Sin organización</Chip>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Conexión</span>
            <Chip active={conn === "ALL"} onClick={() => setConn("ALL")}>Todas</Chip>
            <Chip active={conn === "ONLINE"} onClick={() => setConn("ONLINE")}>En línea</Chip>
            <Chip active={conn === "ACTIVE"} onClick={() => setConn("ACTIVE")}>Activo</Chip>
            <Chip active={conn === "NONE"} onClick={() => setConn("NONE")}>Sin actividad</Chip>
            <span className="mx-2 h-4 w-px bg-slate-200" />
            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className={`${inputCls} py-1`}
            >
              <option value="ALL">Todas las organizaciones</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
            <span className="mx-1 h-4 w-px bg-slate-200" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className={`${inputCls} py-1`}
            >
              <option value="name">Ordenar: Nombre</option>
              <option value="lastSeen">Ordenar: Última conexión</option>
              <option value="orgs">Ordenar: Nº organizaciones</option>
              <option value="role">Ordenar: Rol</option>
            </select>
            <button
              type="button"
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              title="Cambiar dirección"
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
            >
              {sortDir === "asc" ? "↑" : "↓"}
            </button>
            <span className="mx-1 h-4 w-px bg-slate-200" />
            <Chip active={grouped} onClick={() => setGrouped((v) => !v)}>
              {grouped ? "▣ Agrupado por org" : "☰ Lista"}
            </Chip>
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
          <p className="text-sm text-slate-500">No hay usuarios que coincidan.</p>
        ) : grouped && groups ? (
          <div className="space-y-4">
            {groups.map((g) => (
              <div key={g.name} className="rounded-xl border border-slate-100 bg-white/50 p-3">
                <div className="mb-1 flex items-center gap-2 px-1 text-sm font-bold text-slate-700">
                  {g.name}
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                    {g.users.length}
                  </span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {g.users.map((user) => (
                    <UserRow
                      key={`${g.name}-${user.id}`}
                      user={user}
                      organizations={organizations}
                      isSelf={user.id === currentUserId}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-2 flex items-center gap-2 px-1 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={allOnPageSelected}
                onChange={toggleAllOnPage}
                className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-sky-500"
                aria-label="Seleccionar página"
              />
              Seleccionar esta página
            </div>
            <ul className="divide-y divide-slate-100">
              {paged.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  organizations={organizations}
                  isSelf={user.id === currentUserId}
                  selected={selected.has(user.id)}
                  onToggle={() => toggle(user.id)}
                />
              ))}
            </ul>
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
    <section className="rounded-2xl border border-slate-100 bg-white/60 p-6">
      <h2 className="mb-1 text-lg font-semibold text-slate-900">
        Nuevo usuario
      </h2>
      <p className="mb-4 text-sm text-slate-500">
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
            <option value="es">Español</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={pending}
          className="bg-brand rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:opacity-95 disabled:opacity-60"
        >
          {pending ? "Creando…" : "Crear usuario"}
        </button>
        <Feedback state={state} />
      </form>
    </section>
  );
}

function UserRow({
  user,
  organizations,
  isSelf,
  selected,
  onToggle,
}: {
  user: AdminUser;
  organizations: OrgOption[];
  isSelf: boolean;
  selected?: boolean;
  onToggle?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className={`py-3 ${selected ? "bg-sky-50/40" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          {onToggle && (
            <input
              type="checkbox"
              checked={selected ?? false}
              onChange={onToggle}
              className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 accent-sky-500"
              aria-label={`Seleccionar ${user.name ?? user.email}`}
            />
          )}
          <div>
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            {user.name || "—"}
            {isSelf && (
              <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-600">
                tú
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400">{user.email}</div>
          <div className="mt-1">
            <PresenceBadge lastSeenAt={user.lastSeenAt} />
          </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
            {globalRoleLabel[user.globalRole] ?? user.globalRole}
          </span>
          <span>{user.memberships.length} organizaciones</span>
          <span>{user.participantCount} evaluaciones</span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-slate-200 bg-white/80 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300"
          >
            {open ? "Cerrar" : "Gestionar"}
          </button>
        </div>
      </div>

      {open && (
        <UserEditor
          user={user}
          organizations={organizations}
          isSelf={isSelf}
        />
      )}
    </li>
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
    <div className="mt-3 space-y-4 rounded-xl border border-slate-100 bg-white/60 p-4">
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
        <button
          type="submit"
          disabled={editing}
          className="bg-brand rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:opacity-95 disabled:opacity-60"
        >
          {editing ? "Guardando…" : "Guardar"}
        </button>
        <Feedback state={editState} />
      </form>

      <div className="border-t border-slate-100 pt-3">
        <p className="mb-2 text-xs font-semibold text-slate-500">
          Organizaciones
        </p>
        {user.memberships.length === 0 ? (
          <p className="text-xs text-slate-400">Sin asignaciones.</p>
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
            <button
              type="submit"
              disabled={savingMem}
              className="rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 disabled:opacity-60"
            >
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
            className="cursor-not-allowed rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-300"
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
            triggerClass="rounded-xl border border-rose-200 px-3 py-1.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
            triggerLabel="Eliminar usuario"
          />
        )}
      </div>
    </div>
  );
}
