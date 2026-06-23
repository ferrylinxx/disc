import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getActiveInstrument } from "@/lib/instruments";
import { Questionnaire, type DraftState } from "@/components/Questionnaire";

export const metadata: Metadata = {
  title: "Tu evaluación · DISC GESEM",
  description: "Cuestionario conductual DISC GESEM por invitación.",
};

/**
 * Evaluación por invitación. Resuelve el token, valida su estado/caducidad y
 * entrega el cuestionario con el contexto de la invitación para que el
 * resultado se persista al finalizar.
 */
export default async function EvaluacionTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { participant: { select: { fullName: true } } },
  });

  if (!invitation) {
    return (
      <Notice
        title="Invitación no válida"
        body="El enlace no existe o ha cambiado. Pide a tu facilitador que te reenvíe la invitación."
      />
    );
  }
  if (invitation.status === "COMPLETED") {
    return (
      <Notice
        title="Evaluación completada"
        body="Ya has completado este cuestionario. Tu facilitador puede compartir contigo el informe de resultados."
      />
    );
  }
  if (invitation.expiresAt.getTime() < Date.now()) {
    return (
      <Notice
        title="Invitación caducada"
        body="Este enlace ha expirado. Solicita uno nuevo a tu facilitador para continuar."
      />
    );
  }

  const def = getActiveInstrument();
  return (
    <Questionnaire
      def={def}
      invite={{
        token,
        participantName: invitation.participant.fullName,
        draft: (invitation.draft as DraftState | null) ?? null,
      }}
    />
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="animate-fade-up glass rounded-3xl border border-white/70 p-8 text-center shadow-xl">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-3 leading-relaxed text-slate-600">{body}</p>
        <Link
          href="/"
          className="bg-brand mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:scale-[1.02]"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
