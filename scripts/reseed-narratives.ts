/**
 * Re-seed de la biblioteca de narrativas: SOBRESCRIBE el contenido de las
 * entradas RESOURCE/PROFILE con los valores actuales del código. Úsese tras
 * ampliar el modelo de narrativas (p. ej. nuevos campos valuedItems/team) y
 * SOLO mientras no haya ediciones manuales que conservar.
 */
import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { RESOURCE_NARRATIVES } from "../src/lib/narratives/disc-gesem.profiles";
import { PROFILE_CATALOG } from "../src/lib/narratives/disc-gesem.catalog";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1,
  }),
});

async function overwrite(scope: string, key: string, content: unknown) {
  await prisma.narrativeEntry.upsert({
    where: { scope_key_locale: { scope, key, locale: "es" } },
    update: { content: content as Prisma.InputJsonValue, author: "reseed" },
    create: {
      scope,
      key,
      locale: "es",
      content: content as Prisma.InputJsonValue,
      status: "PUBLISHED",
      version: 1,
      author: "reseed",
    },
  });
}

async function main() {
  let r = 0;
  for (const [key, value] of Object.entries(RESOURCE_NARRATIVES)) {
    await overwrite("RESOURCE", key, value);
    r++;
  }
  let p = 0;
  for (const [key, value] of Object.entries(PROFILE_CATALOG)) {
    await overwrite("PROFILE", key, value);
    p++;
  }
  console.log(`Re-seed OK: ${r} recursos + ${p} perfiles sobrescritos.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
