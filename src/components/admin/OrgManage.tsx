"use client";

import { useActionState } from "react";
import {
  deleteOrganization,
  deleteProject,
  deleteTeam,
  updateOrganization,
} from "@/app/actions/admin";
import type { ActionState } from "@/app/actions/org";

const initial: ActionState = {};

const inputCls =
  "rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

/** Renombrado inline de la organización. */
export function RenameOrgForm({ id, name }: { id: string; name: string }) {
  const [state, action, pending] = useActionState(updateOrganization, initial);
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input
        name="name"
        defaultValue={name}
        required
        className={`${inputCls} min-w-[220px] flex-1`}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Renombrar"}
      </button>
      {state.error && (
        <span className="text-xs font-medium text-rose-600">{state.error}</span>
      )}
      {state.ok && (
        <span className="text-xs font-medium text-emerald-600">Guardado ✓</span>
      )}
    </form>
  );
}

/** Eliminación de la organización completa, con confirmación explícita. */
export function DeleteOrgButton({ id, name }: { id: string; name: string }) {
  const [state, action, pending] = useActionState(deleteOrganization, initial);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        const sure = window.confirm(
          `¿Eliminar la organización «${name}»?\n\nSe borrarán sus proyectos, equipos, participantes, invitaciones y resultados. Esta acción no se puede deshacer.`,
        );
        if (!sure) e.preventDefault();
      }}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"
      >
        {pending ? "Eliminando…" : "Eliminar organización"}
      </button>
      {state.error && (
        <span className="text-xs font-medium text-rose-600">{state.error}</span>
      )}
    </form>
  );
}

/** Botón pequeño de borrado para proyectos y equipos. */
export function DeleteEntityButton({
  kind,
  id,
  label,
}: {
  kind: "project" | "team";
  id: string;
  label: string;
}) {
  const [state, action, pending] = useActionState(
    kind === "project" ? deleteProject : deleteTeam,
    initial,
  );
  const warning =
    kind === "project"
      ? `¿Eliminar el proyecto «${label}»?\n\nSus equipos se borrarán; los participantes quedarán sin equipo (no se eliminan).`
      : `¿Eliminar el equipo «${label}»?\n\nLos participantes quedarán sin equipo (no se eliminan).`;

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(warning)) e.preventDefault();
      }}
      className="inline-flex items-center gap-1.5"
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        title={`Eliminar ${kind === "project" ? "proyecto" : "equipo"}`}
        className="rounded-md px-1.5 py-0.5 text-xs font-bold text-slate-300 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
      >
        ✕
      </button>
      {state.error && (
        <span className="text-[10px] font-medium text-rose-600">
          {state.error}
        </span>
      )}
    </form>
  );
}
