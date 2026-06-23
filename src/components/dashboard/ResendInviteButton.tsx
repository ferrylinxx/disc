"use client";

import { useActionState } from "react";
import { resendInvitation } from "@/app/actions/participants";
import type { ActionState } from "@/app/actions/org";

const initial: ActionState = {};

/** Botón para reenviar por email la invitación activa de un participante. */
export function ResendInviteButton({
  participantId,
}: {
  participantId: string;
}) {
  const [state, action, pending] = useActionState(resendInvitation, initial);

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="participantId" value={participantId} />
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-600 transition hover:bg-sky-100 disabled:opacity-60"
      >
        {pending ? "Enviando…" : "✉ Reenviar"}
      </button>
      {state.error && (
        <span className="text-[11px] font-semibold text-rose-600">
          {state.error}
        </span>
      )}
      {state.ok && (
        <span className="text-[11px] font-semibold text-emerald-600">
          ¡Enviada!
        </span>
      )}
    </form>
  );
}
