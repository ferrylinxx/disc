import { requireRole } from "@/lib/auth/dal";
import { adminOrganizations } from "@/lib/data/dashboard";
import { CreateOrgForm } from "@/components/dashboard/Forms";
import { Avatar } from "@/components/dashboard/AdminWidgets";

export const metadata = { title: "Organizaciones · Consola GESEM" };

export default async function AdminOrganizationsPage() {
  await requireRole("SUPERADMIN");
  const organizations = await adminOrganizations();

  return (
    <>
      <section className="glass animate-fade-up rounded-2xl border border-white/60 p-6">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">
          Nueva organización
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Crea un cliente para empezar a estructurar proyectos y equipos.
        </p>
        <CreateOrgForm />
      </section>

      <section className="glass animate-fade-up rounded-2xl border border-white/60 p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Organizaciones ({organizations.length})
        </h2>
        {organizations.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aún no hay organizaciones. Crea la primera arriba.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {organizations.map((org) => {
              const pct =
                org._count.participants > 0
                  ? Math.round((org.completed / org._count.participants) * 100)
                  : 0;
              return (
                <div
                  key={org.id}
                  className="rounded-2xl border border-slate-200 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-indigo-100"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={org.name} />
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-900">
                        {org.name}
                      </div>
                      <div className="truncate text-xs text-slate-400">
                        /{org.slug}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500">
                    <span>{org._count.projects} proyectos</span>
                    <span>·</span>
                    <span>{org._count.members} gestores</span>
                    <span>·</span>
                    <span>{org._count.participants} participantes</span>
                  </div>
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600">
                        Completados
                      </span>
                      <span className="text-slate-400">
                        {org.completed} · {pct}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
