"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  deleteOrganization,
  deleteProject,
  deleteTeam,
  updateOrganization,
} from "@/app/actions/admin";
import type { ActionState } from "@/app/actions/org";
import { ConfirmButton, toast } from "./ui-client";

const initial: ActionState = {};
const inputCls =
  "rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

/** Renombrado inline de la organización. */
export function RenameOrgForm({ id, name }: { id: string; name: string }) {
  const [state, action, pending] = useActionState(updateOrganization, initial);
  const seen = useRef<ActionState | null>(null);
  useEffect(() => {
    if (state === seen.current) return;
    seen.current = state;
    if (state.error) toast(state.error, "error");
    else if (state.ok) toast("Organización renombrada.", "success");
  }, [state]);
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
    </form>
  );
}

/** Eliminación de la organización completa, con confirmación explícita. */
export function DeleteOrgButton({ id, name }: { id: string; name: string }) {
  return (
    <ConfirmButton
      action={deleteOrganization}
      fields={{ id }}
      title={`Eliminar la organización ${name}`}
      body="Se borrarán sus proyectos, equipos, participantes, invitaciones y resultados. Esta acción no se puede deshacer."
      confirmLabel="Eliminar organización"
      triggerClass="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
      triggerLabel="Eliminar organización"
    />
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
  const body =
    kind === "project"
      ? "Sus equipos se borrarán; los participantes quedarán sin equipo (no se eliminan)."
      : "Los participantes quedarán sin equipo (no se eliminan).";
  return (
    <ConfirmButton
      action={kind === "project" ? deleteProject : deleteTeam}
      fields={{ id }}
      title={`Eliminar el ${kind === "project" ? "proyecto" : "equipo"} ${label}`}
      body={body}
      confirmLabel="Eliminar"
      successMessage={kind === "project" ? "Proyecto eliminado." : "Equipo eliminado."}
      triggerClass="rounded-md px-1.5 py-0.5 text-xs font-bold text-slate-300 transition hover:bg-rose-50 hover:text-rose-600"
      triggerLabel="✕"
    />
  );
}
