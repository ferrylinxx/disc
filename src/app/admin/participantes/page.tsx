import { requireRole } from "@/lib/auth/dal";
import { adminParticipants, allOrganizationIds, teamsForOrganizations } from "@/lib/data/dashboard";
import { ParticipantsTable } from "@/components/admin/ParticipantsTable";
import { Card, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Participantes · Consola" };

export default async function AdminParticipantsPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  await requireRole("SUPERADMIN");
  const [participants, { filtro }, teams] = await Promise.all([
    adminParticipants(),
    searchParams,
    allOrganizationIds().then(teamsForOrganizations),
  ]);

  return (
    <>
      <PageHeader
        title="Participantes"
        description="Todas las personas evaluadas en la plataforma. El envío del informe por email es siempre manual."
      />
      <Card>
        <ParticipantsTable
          participants={participants}
          initialFilter={filtro === "rapidas" ? "FAST" : "ALL"}
          teams={teams.map((t) => ({ id: t.id, name: t.name, organizationId: t.project.organizationId }))}
        />
      </Card>
    </>
  );
}
