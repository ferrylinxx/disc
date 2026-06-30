import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { effectiveRoles, adminOrganizationIds } from "@/lib/auth/rbac";
import { allOrganizationIds, participantReport, participantDiscGraphs } from "@/lib/data/dashboard";
import { getActiveInstrument } from "@/lib/instruments";
import { buildProfileNarrativeDb, loadProfileBlocks } from "@/lib/narratives/library";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { Report } from "@/components/Report";
import { ReportActions } from "@/components/dashboard/ReportActions";

export const metadata = { title: "Informe del participante · DISC GESEM" };

/**
 * Vista de informe individual para el admin. Reconstruye el resultado desde BD,
 * lo muestra en un área imprimible (PDF) y permite enviarlo por email. El
 * participante no accede a esta página: el informe lo gestiona el facilitador.
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
  const def = getActiveInstrument();
  const narrative = result ? await buildProfileNarrativeDb(result) : undefined;
  const blocks = result ? await loadProfileBlocks(result.profileCode) : undefined;
  const graphs = result ? ((await participantDiscGraphs(id)) ?? undefined) : undefined;
  const reportDate = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <DashboardShell
      badge="Informe"
      title={participant.fullName}
      subtitle={participant.email}
      actions={
        <Link
          href="/cliente"
          className="no-print rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        >
          ← Volver
        </Link>
      }
    >
      {!result ? (
        <p className="rounded-2xl border border-amber-100 bg-amber-50/60 p-6 text-sm text-amber-800">
          Este participante aún no ha completado la evaluación, por lo que no hay
          informe disponible.
        </p>
      ) : (
        <>
          <ReportActions
            participantId={participant.id}
            email={participant.email}
          />
          <div className="print-area space-y-6">
            <Report
              result={result}
              def={def}
              narrative={narrative}
              blocks={blocks}
              graphs={graphs}
              meta={{
                participantName: participant.fullName,
                clientName: participant.organizationName,
                projectName: participant.projectName,
                date: reportDate,
              }}
            />
          </div>
        </>
      )}
    </DashboardShell>
  );
}
