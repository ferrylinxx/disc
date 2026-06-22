import { requireRole } from "@/lib/auth/dal";
import { getActiveInstrument } from "@/lib/instruments";
import { adminNarrativeEntries } from "@/lib/data/narratives";
import { CatalogView } from "@/components/dashboard/CatalogView";
import { NarrativeEditor } from "@/components/admin/NarrativeEditor";
import { PageHeader, Card } from "@/components/admin/ui";

export const metadata = { title: "Narrativas · Consola GESEM" };

export default async function AdminCatalogPage() {
  await requireRole("SUPERADMIN");
  const def = getActiveInstrument();
  const entries = await adminNarrativeEntries();

  return (
    <>
      <PageHeader
        title="Narrativas y catálogo"
        description="Edita los textos del informe (recursos y perfiles). Los cambios se aplican sin necesidad de desplegar."
      />

      <Card className="mb-6">
        <NarrativeEditor entries={entries} />
      </Card>

      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
        Nomenclatura oficial (referencia)
      </h2>
      <CatalogView dimensions={def.dimensions} />
    </>
  );
}
