import Link from "next/link";
import { getActiveInstrument } from "@/lib/instruments";
import { participantReportByToken, participantDiscGraphs } from "@/lib/data/dashboard";
import { buildProfileNarrativeDb, loadProfileBlocks } from "@/lib/narratives/library";
import { Questionnaire, type DraftState } from "@/components/Questionnaire";
import { Report } from "@/components/Report";
import { PrintButton } from "@/components/PrintButton";
import { AutoPrint } from "@/components/PanelClient";
import { getDict, type Lang } from "@/lib/i18n/dictionaries";

/** Aviso a pantalla completa con vuelta al inicio. */
export function Notice({
  title,
  body,
  goHome,
}: {
  title: string;
  body: string;
  goHome: string;
}) {
  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="animate-fade-up glass rounded-3xl border border-white/70 p-8 text-center shadow-xl">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-3 leading-relaxed text-slate-600">{body}</p>
        <Link
          href="/"
          className="bg-brand mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:scale-[1.02]"
        >
          {goHome}
        </Link>
      </div>
    </div>
  );
}

interface Props {
  token: string;
  status: string;
  expiresAt: Date;
  draft: DraftState | null;
  participantName: string;
  lang: Lang;
  /** Abre el diálogo de impresión automáticamente al mostrar el informe. */
  autoPrint?: boolean;
}

/**
 * Renderiza el estado de una evaluación por invitación (para el participante
 * autenticado): informe si está completada, aviso si caducó o el cuestionario
 * si sigue activa. Fuente única usada por /evaluacion y /evaluacion/[token].
 */
export async function EvaluationByInvitation({
  token,
  status,
  expiresAt,
  draft,
  participantName,
  lang,
  autoPrint = false,
}: Props) {
  const d = getDict(lang);

  if (status === "COMPLETED") {
    const data = await participantReportByToken(token);
    if (!data?.result) {
      return (
        <Notice
          title={d.token.completedTitle}
          body={d.token.completedBody}
          goHome={d.token.goHome}
        />
      );
    }
    const def = getActiveInstrument(lang);
    const narrative = await buildProfileNarrativeDb(data.result, lang);
    const blocks = await loadProfileBlocks(data.result.profileCode, lang);
    const graphs = (await participantDiscGraphs(data.participant.id)) ?? undefined;
    const reportDate = new Date().toLocaleDateString(
      lang === "ca" ? "ca-ES" : "es-ES",
      { day: "2-digit", month: "long", year: "numeric" },
    );
    return (
      <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-14">
        {autoPrint && <AutoPrint />}
        <div className="animate-fade-up mb-6 flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
            ✓
          </span>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
            {d.quiz.thanks}
          </h1>
          <p className="mt-2 max-w-md leading-relaxed text-slate-600">
            {d.quiz.resultDesc}
          </p>
        </div>
        <div className="print-area">
          <Report
            result={data.result}
            def={def}
            narrative={narrative}
            blocks={blocks}
            graphs={graphs}
            lang={lang}
            meta={{
              participantName: data.participant.fullName,
              clientName: data.participant.organizationName,
              projectName: data.participant.projectName,
              date: reportDate,
            }}
          />
        </div>
        <div className="no-print mt-8 flex flex-wrap items-center justify-center gap-3">
          <PrintButton label={d.quiz.downloadPdf} />
          <Link
            href="/"
            className="rounded-full border border-slate-200 bg-white/80 px-6 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            {d.quiz.backHome}
          </Link>
        </div>
      </main>
    );
  }

  if (expiresAt.getTime() < Date.now()) {
    return (
      <Notice
        title={d.token.expiredTitle}
        body={d.token.expiredBody}
        goHome={d.token.goHome}
      />
    );
  }

  const def = getActiveInstrument(lang);
  return (
    <Questionnaire
      def={def}
      lang={lang}
      invite={{ token, participantName, draft }}
    />
  );
}
