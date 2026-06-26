import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { effectiveRoles, adminOrganizationIds } from "@/lib/auth/rbac";
import { allOrganizationIds, organizationTeamReport } from "@/lib/data/dashboard";
import { getActiveInstrument } from "@/lib/instruments";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { TeamMap } from "@/components/dashboard/TeamMap";
import { TeamExport } from "@/components/dashboard/TeamExport";

export const metadata = { title: "Informe de equipo · Organización" };

export default async function OrganizationTeamReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireRole("SUPERADMIN", "ORG_ADMIN");
  const orgIds = effectiveRoles(session).includes("SUPERADMIN")
    ? await allOrganizationIds()
    : adminOrganizationIds(session);

  const data = await organizationTeamReport(id, orgIds);
  if (!data) notFound();

  const def = getActiveInstrument();
  const dims = [...def.dimensions].sort((a, b) => a.order - b.order);

  return (
    <DashboardShell
      badge="Informe de equipo"
      title={data.org.name}
      subtitle={`Toda la organización · ${data.totals.completed}/${data.totals.total} completados`}
      actions={
        <Link
          href={`/admin/organizaciones/${id}`}
          className="no-print rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        >
          ← Volver
        </Link>
      }
    >
      {data.totals.completed === 0 ? (
        <p className="rounded-2xl border border-amber-100 bg-amber-50/60 p-6 text-sm text-amber-800">
          Aún no hay evaluaciones completadas en esta organización, por lo que el
          informe de equipo se generará a medida que las personas finalicen.
        </p>
      ) : (
        <>
          <TeamExport
            insights={data.insights}
            dimensions={dims}
            teamName={data.org.name}
          />
          <div className="print-area">
            <TeamMap
              insights={data.insights}
              dimensions={dims}
              header={{
                name: data.org.name,
                organizationName: data.org.name,
                projectName: "Toda la organización",
                createdAt: data.org.createdAt,
                total: data.totals.total,
              }}
            />
          </div>
        </>
      )}
    </DashboardShell>
  );
}
