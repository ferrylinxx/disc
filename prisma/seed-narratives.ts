/**
 * Seed de la biblioteca de narrativas editable (tabla narrative_entries).
 * Vuelca los valores por defecto del código (RESOURCE_NARRATIVES y
 * PROFILE_CATALOG) a BD como entradas PUBLISHED. Idempotente: hace upsert por
 * (scope, key, locale) y NO sobrescribe el contenido si la entrada ya existe
 * (para no pisar ediciones hechas desde administración).
 */
import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { RESOURCE_NARRATIVES } from "../src/lib/narratives/disc-gesem.profiles";
import { PROFILE_CATALOG } from "../src/lib/narratives/disc-gesem.catalog";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
});
const prisma = new PrismaClient({ adapter });

async function upsertEntry(scope: string, key: string, content: unknown) {
  await prisma.narrativeEntry.upsert({
    where: { scope_key_locale: { scope, key, locale: "es" } },
    // No sobrescribimos si ya existe (respeta ediciones del admin).
    update: {},
    create: {
      scope,
      key,
      locale: "es",
      content: content as Prisma.InputJsonValue,
      status: "PUBLISHED",
      version: 1,
      author: "seed",
    },
  });
}

async function main() {
  let resources = 0;
  for (const [key, value] of Object.entries(RESOURCE_NARRATIVES)) {
    await upsertEntry("RESOURCE", key, value);
    resources++;
  }
  let profiles = 0;
  for (const [key, value] of Object.entries(PROFILE_CATALOG)) {
    await upsertEntry("PROFILE", key, value);
    profiles++;
  }
  console.log(
    `Seed narrativas OK: ${resources} recursos + ${profiles} perfiles en narrative_entries.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
