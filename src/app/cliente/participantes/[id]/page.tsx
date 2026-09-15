import { notFound } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import { requireRole } from "@/lib/auth/dal";
import { effectiveRoles, adminOrganizationIds } from "@/lib/auth/rbac";
import { allOrganizationIds, participantReport, participantDiscGraphs } from "@/lib/data/dashboard";
import { getActiveInstrument } from "@/lib/instruments";
import { buildProfileNarrativeDb, loadProfileBlocks } from "@/lib/narratives/library";
import { Report } from "@/components/Report";
import { ReportActions } from "@/components/dashboard/ReportActions";
import { btn } from "@/components/admin/ui";
import { getLang } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n/dictionaries";

export const metadata = { title: "Informe del participante" };

/**
 * Vista de informe individual para quien gestiona la organización. Reconstruye
 * el resultado desde BD, lo muestra en un área imprimible (PDF) y permite
 * enviarlo por email. La portada del informe ya lleva el nombre: la barra
 * superior solo tiene las acciones, en una fila.
 */
export default async function ParticipantReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireRole("SUPERADMIN", "ORG_ADMIN");
  const orgIds = effectiveRoles(session).includes("SUPERADMIN")
    ? await allOrganizationIds()
    : adminOrganizationIds(session);

  const data = await participantReport(id, orgIds);
  if (!data) notFound();

  const { participant, result } = data;
  // El informe sigue el idioma del selector (cookie `lang`), igual que la vista
  // del participante: instrumento, narrativa, bloques de la biblioteca y fecha.
  const lang = await getLang();
  const t = getDict(lang).reportPage;
  const def = getActiveInstrument(lang);
  const narrative = result ? await buildProfileNarrativeDb(result, lang) : undefined;
  const blocks = result ? await loadProfileBlocks(result.profileCode, lang) : undefined;
  const graphs = result ? ((await participantDiscGraphs(id)) ?? undefined) : undefined;
  const reportDate = new Date().toLocaleDateString(lang === "ca" ? "ca-ES" : "es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-6">
      <div className="no-print animate-fade-up mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <BackLink href="/cliente" className={`${btn.secondary} shrink-0`}>
            {t.back}
          </BackLink>
          <span className="min-w-0 truncate text-sm text-slate-500">
            <span className="font-semibold text-slate-800">{participant.fullName}</span>
            <span className="hidden sm:inline"> · {participant.email}</span>
          </span>
        </div>
        {result && (
          <ReportActions participantId={participant.id} email={participant.email} lang={lang} />
        )}
      </div>

      {!result ? (
        <p className="rounded-2xl border border-amber-100 bg-amber-50/60 p-6 text-sm text-amber-800">
          {t.notCompleted}
        </p>
      ) : (
        <div className="print-area space-y-6">
          <Report
            result={result}
            def={def}
            narrative={narrative}
            blocks={blocks}
            graphs={graphs}
            lang={lang}
            showInternalCode
            meta={{
              participantName: participant.fullName,
              clientName: participant.organizationName,
              projectName: participant.projectName,
              date: reportDate,
            }}
          />
        </div>
      )}
    </main>
  );
}
