import Link from "next/link";
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

      <Link
        href="/admin/catalogo/bloques"
        className="mb-6 flex items-center justify-between rounded-2xl border border-sky-100 bg-sky-50/50 px-5 py-4 transition hover:border-sky-200"
      >
        <div>
          <div className="text-sm font-bold text-slate-900">
            Biblioteca narrativa (117 bloques)
          </div>
          <div className="text-xs text-slate-500">
            13 perfiles × 9 bloques. Edita el contenido definitivo por perfil.
          </div>
        </div>
        <span className="text-sky-600">→</span>
      </Link>

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
