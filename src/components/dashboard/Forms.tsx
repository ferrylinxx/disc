"use client";

import { useActionState } from "react";
import {
  createOrganization,
  createProject,
  createTeam,
  type ActionState,
} from "@/app/actions/org";
import {
  bulkInviteParticipants,
  inviteParticipant,
} from "@/app/actions/participants";
import { InviteLink } from "./InviteLink";

const initial: ActionState = {};

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

function Feedback({ state }: { state: ActionState }) {
  if (state.error)
    return (
      <p className="text-xs font-medium text-rose-600">{state.error}</p>
    );
  if (state.invitePath)
    return (
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-emerald-600">
          Invitación creada ✓ Comparte este enlace:
        </p>
        <InviteLink path={state.invitePath} />
      </div>
    );
  if (state.ok)
    return (
      <p className="text-xs font-medium text-emerald-600">Guardado ✓</p>
    );
  return null;
}

function Submit({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-brand rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Guardando…" : label}
    </button>
  );
}

/** Alta de organización (SUPERADMIN). */
export function CreateOrgForm() {
  const [state, action, pending] = useActionState(createOrganization, initial);
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input
        name="name"
        required
        placeholder="Nombre de la organización"
        className={`${inputCls} flex-1 min-w-[220px]`}
      />
      <Submit pending={pending} label="Crear organización" />
      <Feedback state={state} />
    </form>
  );
}

/** Alta de proyecto en una organización (ADMIN cliente). */
export function CreateProjectForm({ organizationId }: { organizationId: string }) {
  const [state, action, pending] = useActionState(createProject, initial);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="organizationId" value={organizationId} />
      <div className="flex flex-wrap items-center gap-2">
        <input
          name="name"
          required
          placeholder="Nombre del proyecto"
          className={`${inputCls} flex-1 min-w-[200px]`}
        />
        <input
          name="description"
          placeholder="Descripción (opcional)"
          className={`${inputCls} flex-1 min-w-[200px]`}
        />
        <Submit pending={pending} label="Añadir proyecto" />
      </div>
      <Feedback state={state} />
    </form>
  );
}

/** Alta de equipo dentro de un proyecto. */
export function CreateTeamForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(createTeam, initial);
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="projectId" value={projectId} />
      <input
        name="name"
        required
        placeholder="Nombre del equipo"
        className={`${inputCls} flex-1 min-w-[160px]`}
      />
      <Submit pending={pending} label="Añadir equipo" />
      <Feedback state={state} />
    </form>
  );
}

interface TeamOption {
  id: string;
  name: string;
  projectName: string;
}

/** Alta de participante + invitación por enlace. */
export function InviteParticipantForm({
  organizationId,
  teams,
}: {
  organizationId: string;
  teams: TeamOption[];
}) {
  const [state, action, pending] = useActionState(inviteParticipant, initial);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="organizationId" value={organizationId} />
      <div className="flex flex-wrap items-center gap-2">
        <input
          name="fullName"
          required
          placeholder="Nombre completo"
          className={`${inputCls} flex-1 min-w-[160px]`}
        />
        <input
          name="email"
          type="email"
          required
          placeholder="email@empresa.com"
          className={`${inputCls} flex-1 min-w-[180px]`}
        />
        <select name="teamId" className={`${inputCls} min-w-[160px]`}>
          <option value="">Sin equipo</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.projectName} · {t.name}
            </option>
          ))}
        </select>
        <Submit pending={pending} label="Invitar" />
      </div>
      <Feedback state={state} />
    </form>
  );
}

/** Alta masiva de participantes pegando un listado CSV/Excel "Nombre, email". */
export function BulkInviteForm({
  organizationId,
  teams,
}: {
  organizationId: string;
  teams: TeamOption[];
}) {
  const [state, action, pending] = useActionState(
    bulkInviteParticipants,
    initial,
  );
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="organizationId" value={organizationId} />
      <textarea
        name="roster"
        required
        rows={4}
        placeholder={"Nombre Apellido, email@empresa.com\nOtra Persona, otra@empresa.com"}
        className={`${inputCls} font-mono text-xs`}
      />
      <div className="flex flex-wrap items-center gap-2">
        <select name="teamId" className={`${inputCls} min-w-[160px] flex-1`}>
          <option value="">Sin equipo</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.projectName} · {t.name}
            </option>
          ))}
        </select>
        <Submit pending={pending} label="Invitar a todos" />
      </div>
      <p className="text-[11px] text-slate-400">
        Una persona por línea: nombre y email separados por coma. Desde Excel,
        copia las dos columnas y pégalas aquí.
      </p>
      {state.message ? (
        <p className="text-xs font-medium text-emerald-600">{state.message}</p>
      ) : (
        <Feedback state={state} />
      )}
    </form>
  );
}
