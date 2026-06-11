import { requireRole } from "@/lib/auth/dal";
import { getActiveInstrument } from "@/lib/instruments";
import { CatalogView } from "@/components/dashboard/CatalogView";

export const metadata = { title: "Catálogo · Consola GESEM" };

export default async function AdminCatalogPage() {
  await requireRole("SUPERADMIN");
  const def = getActiveInstrument();

  return <CatalogView dimensions={def.dimensions} />;
}
