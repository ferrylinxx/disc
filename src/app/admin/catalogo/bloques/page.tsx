import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { adminBlockEntries, type BlockLocale } from "@/lib/data/narratives";
import { BlocksEditor } from "@/components/admin/BlocksEditor";
import { PageHeader, Card } from "@/components/admin/ui";

export const metadata = { title: "Biblioteca narrativa · Consola GESEM" };

const LOCALES: { code: BlockLocale; label: string }[] = [
  { code: "es", label: "Castellano" },
  { code: "ca", label: "Català" },
];

export default async function AdminBlocksPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  await requireRole("SUPERADMIN");
  const { lang } = await searchParams;
  const locale: BlockLocale = lang === "ca" ? "ca" : "es";
  const profiles = await adminBlockEntries(locale);

  return (
    <>
      <PageHeader
        title="Biblioteca narrativa (117 bloques)"
        description={
          locale === "ca"
            ? "Traducción catalana. Cada bloque muestra el original en castellano para comparar. Los informes en catalán solo usan lo publicado."
            : "13 perfiles × 9 bloques. Revisa o edita el contenido de cada bloque. Publica lo definitivo cuando esté validado."
        }
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/catalogo"
          className="text-sm font-semibold text-sky-700 transition hover:text-sky-900"
        >
          ← Volver a narrativas y catálogo
        </Link>
        <nav
          aria-label="Idioma de la biblioteca"
          className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm"
        >
          {LOCALES.map((l) => (
            <Link
              key={l.code}
              href={l.code === "es" ? "/admin/catalogo/bloques" : `/admin/catalogo/bloques?lang=${l.code}`}
              aria-current={l.code === locale ? "page" : undefined}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                l.code === locale ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <Card>
        <BlocksEditor profiles={profiles} locale={locale} />
      </Card>
    </>
  );
}
