import { requireRole } from "@/lib/auth/dal";
import { getActiveInstrument } from "@/lib/instruments";
import { CatalogView } from "@/components/dashboard/CatalogView";
import { PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Catálogo · Consola GESEM" };

export default async function AdminCatalogPage() {
  await requireRole("SUPERADMIN");
  const def = getActiveInstrument();

  return (
    <>
      <PageHeader
        title="Catálogo"
        description={`Nomenclatura oficial de ${def.instrumentName} v${def.version}: estilos base, combinaciones e intensidades.`}
      />
      <CatalogView dimensions={def.dimensions} />
    </>
  );
}
