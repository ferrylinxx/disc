import { requireRole } from "@/lib/auth/dal";
import { adminOrganizations } from "@/lib/data/dashboard";
import { Card, PageHeader } from "@/components/admin/ui";
import { OrganizationsTable } from "@/components/admin/OrganizationsTable";
import { NewOrgButton } from "@/components/admin/NewOrgButton";

export const metadata = { title: "Organizaciones · Consola" };

export default async function AdminOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ nueva?: string }>;
}) {
  await requireRole("SUPERADMIN");
  const [organizations, { nueva }] = await Promise.all([adminOrganizations(), searchParams]);
  const rows = organizations.map((o) => ({
    id: o.id,
    name: o.name,
    slug: o.slug,
    createdAt: o.createdAt.toISOString(),
    projects: o._count.projects,
    members: o._count.members,
    participants: o._count.participants,
    completed: o.completed,
  }));

  return (
    <>
      <PageHeader
        title="Organizaciones"
        description="Clientes de la plataforma. Entra en una organización para gestionar sus participantes, equipos e informes."
      >
        <NewOrgButton defaultOpen={nueva === "1"} />
      </PageHeader>

      <Card title={`Organizaciones (${rows.length})`}>
        <OrganizationsTable organizations={rows} />
      </Card>
    </>
  );
}
