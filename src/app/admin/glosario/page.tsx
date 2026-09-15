import { requireRole } from "@/lib/auth/dal";
import { PageHeader } from "@/components/admin/ui";
import { GlossaryEditor } from "@/components/admin/GlossaryEditor";
import { loadGlossary } from "@/lib/data/glossary";

export const metadata = { title: "Glosario · Consola" };

/** Glosario DISC GESEM: formulario por idioma con vista previa en directo. */
export default async function AdminGlossaryPage() {
  await requireRole("SUPERADMIN");
  const [es, ca] = await Promise.all([loadGlossary("es"), loadGlossary("ca")]);

  return (
    <>
      <PageHeader
        title="Glosario"
        description="Términos que se muestran en el informe, el panel del participante y el cuestionario. Los cambios se aplican al guardar."
      />
      <GlossaryEditor initial={{ es, ca }} />
    </>
  );
}
