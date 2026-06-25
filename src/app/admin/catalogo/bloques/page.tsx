import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { adminBlockEntries } from "@/lib/data/narratives";
import { BlocksEditor } from "@/components/admin/BlocksEditor";
import { PageHeader, Card } from "@/components/admin/ui";

export const metadata = { title: "Biblioteca narrativa · Consola GESEM" };

export default async function AdminBlocksPage() {
  await requireRole("SUPERADMIN");
  const profiles = await adminBlockEntries();

  return (
    <>
      <PageHeader
        title="Biblioteca narrativa (117 bloques)"
        description="13 perfiles × 9 bloques. Revisa o edita el contenido de cada bloque. Publica lo definitivo cuando esté validado."
      />
      <div className="mb-4">
        <Link
          href="/admin/catalogo"
          className="text-sm font-semibold text-sky-700 transition hover:text-sky-900"
        >
          ← Volver a narrativas y catálogo
        </Link>
      </div>
      <Card>
        <BlocksEditor profiles={profiles} />
      </Card>
    </>
  );
}
