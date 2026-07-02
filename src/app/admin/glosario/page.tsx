import { requireRole } from "@/lib/auth/dal";
import { PageHeader, Card } from "@/components/admin/ui";
import { GlossaryEditor } from "@/components/admin/GlossaryEditor";
import { GlossaryView } from "@/components/GlossaryView";
import { loadGlossary, loadGlossaryJson } from "@/lib/data/glossary";

export const metadata = { title: "Glosario · Consola GESEM" };

/** Glosario DISC GESEM: editable por idioma (JSON) + vista previa. */
export default async function AdminGlossaryPage() {
  await requireRole("SUPERADMIN");
  const [esJson, caJson, esData] = await Promise.all([
    loadGlossaryJson("es"),
    loadGlossaryJson("ca"),
    loadGlossary("es"),
  ]);

  return (
    <>
      <PageHeader
        title="Glosario"
        description="Edita los términos del glosario DISC GESEM. Se aplican en el informe, el panel del participante y el cuestionario."
      />

      <Card
        title="Estructura"
        description='Cada idioma es un JSON con { title, intro, groups: [{ title, entries: [{ term, code?, def }] }] }. "code" es opcional: "D", "I", "S" o "C".'
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <GlossaryEditor locale="es" label="Español" initialJson={esJson} />
          <GlossaryEditor locale="ca" label="Català" initialJson={caJson} />
        </div>
      </Card>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
          Vista previa (ES)
        </h2>
        <GlossaryView data={esData} />
      </div>
    </>
  );
}
