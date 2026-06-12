import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { adminOrganizations } from "@/lib/data/dashboard";
import { CreateOrgForm } from "@/components/dashboard/Forms";
import { Avatar } from "@/components/dashboard/AdminWidgets";
import {
  Card,
  EmptyState,
  PageHeader,
  Progress,
  tableCls,
} from "@/components/admin/ui";

export const metadata = { title: "Organizaciones · Consola GESEM" };

const dateFmt = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" });

export default async function AdminOrganizationsPage() {
  await requireRole("SUPERADMIN");
  const organizations = await adminOrganizations();

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

      <Card title={`Organizaciones (${organizations.length})`}>
        {organizations.length === 0 ? (
          <EmptyState
            title="Aún no hay organizaciones"
            hint="Crea la primera con el formulario de arriba."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className={tableCls.table}>
              <thead className={tableCls.thead}>
                <tr>
                  <th className={tableCls.th}>Organización</th>
                  <th className={tableCls.th}>Proyectos</th>
                  <th className={tableCls.th}>Gestores</th>
                  <th className={tableCls.th}>Participantes</th>
                  <th className={`${tableCls.th} w-44`}>Completados</th>
                  <th className={tableCls.th}>Creada</th>
                  <th className={tableCls.th} />
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => {
                  const pct =
                    org._count.participants > 0
                      ? Math.round(
                          (org.completed / org._count.participants) * 100,
                        )
                      : 0;
                  return (
                    <tr key={org.id} className={tableCls.tr}>
                      <td className={tableCls.td}>
                        <Link
                          href={`/admin/organizaciones/${org.id}`}
                          className="group flex items-center gap-3"
                        >
                          <Avatar name={org.name} />
                          <span className="min-w-0">
                            <span className="block truncate font-semibold text-slate-900 transition group-hover:text-indigo-600">
                              {org.name}
                            </span>
                            <span className="block truncate text-xs text-slate-400">
                              /{org.slug}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className={`${tableCls.td} text-slate-600`}>
                        {org._count.projects}
                      </td>
                      <td className={`${tableCls.td} text-slate-600`}>
                        {org._count.members}
                      </td>
                      <td className={`${tableCls.td} text-slate-600`}>
                        {org._count.participants}
                      </td>
                      <td className={tableCls.td}>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Progress value={pct} />
                          </div>
                          <span className="w-12 shrink-0 text-right text-xs font-semibold text-slate-500">
                            {org.completed} · {pct}%
                          </span>
                        </div>
                      </td>
                      <td className={`${tableCls.td} text-xs text-slate-400`}>
                        {dateFmt.format(org.createdAt)}
                      </td>
                      <td className={`${tableCls.td} text-right`}>
                        <Link
                          href={`/admin/organizaciones/${org.id}`}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
                        >
                          Gestionar →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
