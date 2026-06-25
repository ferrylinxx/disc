/**
 * Seed de la estructura per-perfil × bloque (Biblioteca Narrativa).
 * Crea 117 entradas (13 perfiles × 9 bloques) con scope "BLOCK" y key
 * `${perfil}:${bloque}`, pre-rellenadas con el contenido interino compuesto por
 * recurso. Idempotente: NO sobrescribe entradas existentes (preserva ediciones
 * y futuras importaciones del Excel).
 */
import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { buildProfileNarrative } from "../src/lib/narratives/disc-gesem.profiles";
import { BLOCKS, PROFILE_CODES, blockTextsFromNarrative } from "../src/lib/narratives/blocks";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1,
  }),
});

/** Resultado sintético para componer la narrativa de un código de perfil. */
function resultFor(code: string) {
  if (code === "EQ") {
    return { profileCode: "EQ", primaryDimension: "D", secondaryDimension: "I", isEq: true };
  }
  return {
    profileCode: code,
    primaryDimension: code[0],
    secondaryDimension: code[1],
    isEq: false,
  };
}

async function main() {
  let created = 0;
  for (const code of PROFILE_CODES) {
    const narrative = buildProfileNarrative(resultFor(code) as never);
    const texts = blockTextsFromNarrative(narrative);
    for (const block of BLOCKS) {
      await prisma.narrativeEntry.upsert({
        where: { scope_key_locale: { scope: "BLOCK", key: `${code}:${block.id}`, locale: "es" } },
        update: {},
        create: {
          scope: "BLOCK",
          key: `${code}:${block.id}`,
          locale: "es",
          content: { text: texts[block.id] } as Prisma.InputJsonValue,
          status: "DRAFT",
          version: 1,
          author: "seed-blocks",
        },
      });
      created++;
    }
  }
  console.log(
    `Seed bloques OK: ${PROFILE_CODES.length} perfiles × ${BLOCKS.length} bloques = ${created} entradas (scope BLOCK).`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
