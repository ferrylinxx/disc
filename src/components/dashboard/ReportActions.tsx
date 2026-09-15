"use client";

import { useActionState } from "react";
import { sendParticipantReport } from "@/app/actions/reports";
import type { ActionState } from "@/app/actions/org";
import { btn } from "@/components/admin/ui";
import { getDict, type Lang } from "@/lib/i18n/dictionaries";

const initial: ActionState = {};

/**
 * Acciones del informe del participante (solo admin): descargar PDF mediante la
 * impresión nativa del navegador y enviar el informe por email.
 */
export function ReportActions({
  participantId,
  email,
  lang,
}: {
  participantId: string;
  email: string;
  lang: Lang;
}) {
  const [state, action, pending] = useActionState(sendParticipantReport, initial);
  const t = getDict(lang).reportPage;

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className={`${btn.secondary} whitespace-nowrap`}
        >
          {t.downloadPdf}
        </button>
        <form action={action}>
          <input type="hidden" name="participantId" value={participantId} />
          <button
            type="submit"
            disabled={pending}
            title={lang === "ca" ? t.emailLangNote : undefined}
            className={`${btn.primary} whitespace-nowrap`}
          >
            {pending ? t.sending : t.sendEmail}
          </button>
        </form>
      </div>
      {state.error && <p className="text-xs font-semibold text-rose-600">{state.error}</p>}
      {state.ok && <p className="text-xs font-semibold text-emerald-600">{t.sentTo(email)}</p>}
    </div>
  );
}
