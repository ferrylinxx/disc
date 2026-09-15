import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { getActiveInstrument } from "@/lib/instruments";
import { adminBlockEntries, adminNarrativeEntries } from "@/lib/data/narratives";
import { CatalogView } from "@/components/dashboard/CatalogView";
import { NarrativeEditor } from "@/components/admin/NarrativeEditor";
import { PageHeader, Card } from "@/components/admin/ui";
import { PROFILE_WORD_TARGET, REPORT_BLOCK_IDS, countWords } from "@/lib/narratives/word-count";

export const metadata = { title: "Contenido · Consola" };

export default async function AdminCatalogPage() {
  await requireRole("SUPERADMIN");
  const def = getActiveInstrument();
  const [entries, blocks] = await Promise.all([adminNarrativeEntries(), adminBlockEntries("es")]);

  // Perfiles cuyo texto publicado ya alcanza la extensión del canon V1.
  const complete = blocks.filter(
    (p) =>
      p.blocks
        .filter((b) => (REPORT_BLOCK_IDS as readonly string[]).includes(b.blockId) && b.status === "PUBLISHED")
        .reduce((sum, b) => sum + countWords(b.text), 0) >= PROFILE_WORD_TARGET.min,
  ).length;

  return (
    <>
      <PageHeader
        title="Contenido del informe"
        description="Textos que componen los informes. Los cambios se aplican al guardar, sin desplegar."
      />

      <Link
        href="/admin/catalogo/bloques"
        className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-sky-100 bg-sky-50/50 px-5 py-4 transition hover:border-sky-200"
      >
        <div>
          <div className="text-sm font-bold text-slate-900">Biblioteca narrativa</div>
          <div className="text-xs text-slate-500">
            El texto definitivo de cada perfil, apartado por apartado. {complete} de {blocks.length}{" "}
            perfiles tienen ya su texto V1 completo (≥ {PROFILE_WORD_TARGET.min} palabras).
          </div>
        </div>
        <span className="text-sky-600">→</span>
      </Link>

      <Card
        className="mb-6"
        title="Textos base por recurso y perfil"
        description="Nombre y resumen de cada perfil, y los textos por recurso que completan el informe cuando un apartado no está en la Biblioteca narrativa."
      >
        <NarrativeEditor entries={entries} />
      </Card>

      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
        Nomenclatura oficial (referencia)
      </h2>
      <CatalogView dimensions={def.dimensions} />
    </>
  );
}
