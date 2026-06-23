"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addMembership,
  createUser,
  deleteUser,
  removeMembership,
  updateUser,
} from "@/app/actions/users";
import type { ActionState } from "@/app/actions/org";
import type { AdminUser } from "@/lib/data/dashboard";

const initial: ActionState = {};

const inputCls =
  "rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

const globalRoleLabel: Record<string, string> = {
  SUPERADMIN: "Admin GESEM",
  USER: "Usuario",
};
const memberRoleLabel: Record<string, string> = {
  ADMIN: "Admin cliente",
  FACILITATOR: "Facilitador",
};

interface OrgOption {
  id: string;
  name: string;
}

/** Ventana para considerar a un usuario "en línea" (margen sobre el heartbeat). */
const ONLINE_WINDOW_MS = 2 * 60 * 1000;
/** Cada cuánto se refresca el listado para reflejar la presencia (ms). */
const REFRESH_MS = 15_000;

/** Texto relativo aproximado de la última actividad. */
function formatLastSeen(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "hace instantes";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

/** Indicador de presencia (en línea / inactivo) basado en lastSeenAt. */
function PresenceBadge({ lastSeenAt }: { lastSeenAt: Date | string | null }) {
  if (!lastSeenAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
        <span className="h-2 w-2 rounded-full bg-slate-300" />
        Sin actividad
      </span>
    );
  }
  const date = lastSeenAt instanceof Date ? lastSeenAt : new Date(lastSeenAt);
  const online = Date.now() - date.getTime() < ONLINE_WINDOW_MS;
  if (online) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        En línea
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
      <span className="h-2 w-2 rounded-full bg-slate-300" />
      Activo {formatLastSeen(date)}
    </span>
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
  const [showCreate, setShowCreate] = useState(false);
  const term = query.trim().toLowerCase();
  const filtered = term
    ? users.filter(
        (u) =>
          u.email.toLowerCase().includes(term) ||
          (u.name ?? "").toLowerCase().includes(term),
      )
    : users;

  const onlineCount = users.filter(
    (u) =>
      u.lastSeenAt &&
      Date.now() - new Date(u.lastSeenAt).getTime() < ONLINE_WINDOW_MS,
  ).length;

  // Refresco periódico para reflejar la presencia casi en tiempo real.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [router]);

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
            placeholder="Buscar por nombre o email…"
            className={`${inputCls} w-64 max-w-full`}
          />
          <button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className="bg-brand rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:opacity-95"
          >
            {showCreate ? "Cerrar" : "Nuevo usuario"}
          </button>
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

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500">No hay usuarios que coincidan.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {filtered.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              organizations={organizations}
              isSelf={user.id === currentUserId}
            />
          ))}
        </ul>
      )}
      </section>
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
}: {
  user: AdminUser;
  organizations: OrgOption[];
  isSelf: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
  const [delState, delAction, deleting] = useActionState(deleteUser, initial);
  const [memState, memAction, savingMem] = useActionState(
    addMembership,
    initial,
  );
  const [rmState, rmAction] = useActionState(removeMembership, initial);

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

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <Feedback state={delState} />
        <form action={delAction}>
          <input type="hidden" name="userId" value={user.id} />
          <button
            type="submit"
            disabled={isSelf || deleting}
            title={isSelf ? "No puedes eliminar tu propia cuenta" : undefined}
            className="rounded-xl border border-rose-200 px-3 py-1.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? "Eliminando…" : "Eliminar usuario"}
          </button>
        </form>
      </div>
    </div>
  );
}
