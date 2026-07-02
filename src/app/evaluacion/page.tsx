import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import {
  EvaluationByInvitation,
  Notice,
} from "@/components/EvaluationByInvitation";
import { type DraftState } from "@/components/Questionnaire";
import { getLang } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Tu evaluación · DISC GESEM",
  description: "Cuestionario conductual DISC GESEM.",
};

/**
 * Evaluación del participante autenticado. Resuelve su invitación (la más
 * reciente de su cuenta) y entrega el cuestionario o el informe. Requiere login.
 */
export default async function EvaluacionPage() {
  const session = await requireAuth();
  const lang = await getLang();
  const d = getDict(lang);

  const participant = await prisma.participant.findFirst({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: {
      fullName: true,
      invitations: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { token: true, status: true, expiresAt: true, draft: true },
      },
    },
  });

  const invitation = participant?.invitations[0];
  if (!participant || !invitation) {
    return (
      <Notice
        title={d.token.noneTitle}
        body={d.token.noneBody}
        goHome={d.token.goHome}
      />
    );
  }

  return (
    <EvaluationByInvitation
      token={invitation.token}
      status={invitation.status}
      expiresAt={invitation.expiresAt}
      draft={(invitation.draft as DraftState | null) ?? null}
      participantName={participant.fullName}
      lang={lang}
    />
  );
}
