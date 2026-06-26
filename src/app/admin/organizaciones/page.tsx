import { requireRole } from "@/lib/auth/dal";
import { adminOrganizations } from "@/lib/data/dashboard";
import { CreateOrgForm } from "@/components/dashboard/Forms";
import { Card, PageHeader } from "@/components/admin/ui";
import { OrganizationsTable } from "@/components/admin/OrganizationsTable";

export const metadata = { title: "Organizaciones · Consola GESEM" };

export default async function AdminOrganizationsPage() {
  await requireRole("SUPERADMIN");
  const organizations = await adminOrganizations();
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
        description="Clientes de la plataforma. Entra en una organización para gestionar sus proyectos, equipos y participantes."
      />

      <Card
        title="Nueva organización"
        description="Crea un cliente para empezar a estructurar proyectos y equipos."
      >
        <CreateOrgForm />
      </Card>

      <Card title={`Organizaciones (${rows.length})`}>
        <OrganizationsTable organizations={rows} />
      </Card>
    </>
  );
}
