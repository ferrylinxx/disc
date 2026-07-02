import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/dal";
import {
  EvaluationByInvitation,
  Notice,
} from "@/components/EvaluationByInvitation";
import { type DraftState } from "@/components/Questionnaire";
import { getLang } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Tu evaluación · DISC GESEM",
  description: "Cuestionario conductual DISC GESEM por invitación.",
};

/**
 * Evaluación por invitación (enlace directo). Requiere sesión y que la cuenta
 * autenticada sea la del participante invitado; si no, avisa. Delega el render
 * en el componente compartido.
 */
export default async function EvaluacionTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await requireAuth();
  const lang = await getLang();
  const d = getDict(lang);

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    select: {
      status: true,
      expiresAt: true,
      draft: true,
      participant: { select: { fullName: true, userId: true } },
    },
  });

  if (!invitation) {
    return (
      <Notice
        title={d.token.invalidTitle}
        body={d.token.invalidBody}
        goHome={d.token.goHome}
      />
    );
  }

  // La invitación debe pertenecer a la cuenta autenticada.
  if (invitation.participant.userId !== session.userId) {
    return (
      <Notice
        title={d.token.wrongAccountTitle}
        body={d.token.wrongAccountBody}
        goHome={d.token.goHome}
      />
    );
  }

  return (
    <EvaluationByInvitation
      token={token}
      status={invitation.status}
      expiresAt={invitation.expiresAt}
      draft={(invitation.draft as DraftState | null) ?? null}
      participantName={invitation.participant.fullName}
      lang={lang}
    />
  );
}
