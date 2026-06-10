"use client";

import { useActionState } from "react";
import { sendParticipantReport } from "@/app/actions/reports";
import type { ActionState } from "@/app/actions/org";

const initial: ActionState = {};

/**
 * Acciones del informe del participante (solo admin): descargar PDF mediante la
 * impresión nativa del navegador y enviar el informe por email. El participante
 * nunca ve su informe en la app; lo recibe por correo.
 */
export function ReportActions({
  participantId,
  email,
}: {
  participantId: string;
  email: string;
}) {
  const [state, action, pending] = useActionState(
    sendParticipantReport,
    initial,
  );

  return (
    <div className="no-print flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
        >
          ↓ Descargar PDF
        </button>
        <form action={action}>
          <input type="hidden" name="participantId" value={participantId} />
          <button
            type="submit"
            disabled={pending}
            className="bg-brand rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Enviando…" : "✉ Enviar informe por email"}
          </button>
        </form>
      </div>
      {state.error && (
        <p className="text-xs font-semibold text-rose-600">{state.error}</p>
      )}
      {state.ok && (
        <p className="text-xs font-semibold text-emerald-600">
          Informe enviado a {email}.
        </p>
      )}
    </div>
  );
}
