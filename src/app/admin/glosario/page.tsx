import { requireRole } from "@/lib/auth/dal";
import { PageHeader } from "@/components/admin/ui";
import { Glossary } from "@/components/Glossary";

export const metadata = { title: "Glosario · Consola GESEM" };

/** Glosario DISC GESEM (referencia interna para administración). */
export default async function AdminGlossaryPage() {
  await requireRole("SUPERADMIN");
  return (
    <>
      <PageHeader
        title="Glosario"
        description="Términos del modelo DISC GESEM para interpretar los informes."
      />
      <Glossary lang="es" />
    </>
  );
}
