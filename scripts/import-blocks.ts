/**
 * Importa la Biblioteca Narrativa (117 bloques) desde un CSV y la vuelca en
 * narrative_entries (scope "BLOCK"). Exporta la hoja del Excel a CSV con tres
 * columnas (cabeceras flexibles): perfil | bloque | texto.
 *
 * Uso:  npx tsx scripts/import-blocks.ts ruta/al/biblioteca.csv [--publish]
 *
 *  - "perfil": DI, ID, … EQ.
 *  - "bloque": id (tendencia, recursos, …) o etiqueta ("Tendencia predominante").
 *  - "texto":  contenido del bloque. Para "reflexion", una pregunta por línea.
 *  - --publish: marca las entradas como PUBLISHED (por defecto se deja DRAFT).
 */
import "dotenv/config";
import { readFileSync } from "fs";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PROFILE_CODES, resolveBlockId } from "../src/lib/narratives/blocks";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1,
  }),
});

/** Parser CSV mínimo robusto (comillas, comas y saltos de línea escapados). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += ch;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function colIndex(header: string[], names: string[]): number {
  const lower = header.map((h) => h.trim().toLowerCase());
  for (const n of names) {
    const idx = lower.indexOf(n);
    if (idx >= 0) return idx;
  }
  return -1;
}

async function main() {
  const file = process.argv[2];
  const publish = process.argv.includes("--publish");
  if (!file) {
    console.error("Falta la ruta al CSV. Uso: npx tsx scripts/import-blocks.ts archivo.csv [--publish]");
    process.exit(1);
  }
  const rows = parseCsv(readFileSync(file, "utf8"));
  if (rows.length < 2) { console.error("CSV vacío o sin filas de datos."); process.exit(1); }

  const header = rows[0];
  const pi = colIndex(header, ["perfil", "código", "codigo", "profile"]);
  const bi = colIndex(header, ["bloque", "block"]);
  const ti = colIndex(header, ["texto", "contenido", "content", "text"]);
  if (pi < 0 || bi < 0 || ti < 0) {
    console.error("Cabeceras esperadas: perfil, bloque, texto. Encontradas:", header.join(", "));
    process.exit(1);
  }

  let ok = 0;
  const skipped: string[] = [];
  for (const r of rows.slice(1)) {
    const profile = (r[pi] ?? "").trim().toUpperCase();
    const blockId = resolveBlockId(r[bi] ?? "");
    const text = (r[ti] ?? "").trim();
    if (!PROFILE_CODES.includes(profile as (typeof PROFILE_CODES)[number]) || !blockId) {
      skipped.push(`${profile}/${r[bi]}`);
      continue;
    }
    await prisma.narrativeEntry.upsert({
      where: { scope_key_locale: { scope: "BLOCK", key: `${profile}:${blockId}`, locale: "es" } },
      update: {
        content: { text } as Prisma.InputJsonValue,
        status: publish ? "PUBLISHED" : "DRAFT",
        author: "import",
      },
      create: {
        scope: "BLOCK",
        key: `${profile}:${blockId}`,
        locale: "es",
        content: { text } as Prisma.InputJsonValue,
        status: publish ? "PUBLISHED" : "DRAFT",
        version: 1,
        author: "import",
      },
    });
    ok++;
  }
  console.log(`Importadas ${ok} entradas (${publish ? "PUBLISHED" : "DRAFT"}).`);
  if (skipped.length) console.log(`Omitidas ${skipped.length}: ${skipped.slice(0, 8).join(", ")}${skipped.length > 8 ? "…" : ""}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
