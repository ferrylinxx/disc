/**
 * Verificación: carga las narrativas de BD y compone un informe de ejemplo,
 * comprobando que la composición desde BD produce los 12 bloques sin errores.
 * No modifica nada. Ejecutar con: npx tsx scripts/verify-narratives.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  RESOURCE_NARRATIVES,
  buildProfileNarrative,
  type NarrativeLibrary,
  type ResourceNarrative,
} from "../src/lib/narratives/disc-gesem.profiles";
import { PROFILE_CATALOG, type ProfileEntry } from "../src/lib/narratives/disc-gesem.catalog";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const resources: Record<string, ResourceNarrative> = { ...RESOURCE_NARRATIVES };
  const profiles: Record<string, ProfileEntry> = { ...PROFILE_CATALOG };
  const rows = await prisma.narrativeEntry.findMany({
    where: { status: "PUBLISHED", locale: "es" },
  });
  console.log(`Entradas PUBLISHED en BD: ${rows.length}`);
  for (const r of rows) {
    if (r.scope === "RESOURCE") resources[r.key] = r.content as unknown as ResourceNarrative;
    else if (r.scope === "PROFILE") profiles[r.key] = r.content as unknown as ProfileEntry;
  }
  const library: NarrativeLibrary = { resources, profiles };

  // Resultado sintético DI (D primaria, I secundaria, no EQ).
  const result = {
    profileCode: "DI",
    primaryDimension: "D",
    secondaryDimension: "I",
    isEq: false,
  } as never;

  const n = buildProfileNarrative(result, "es", library);
  const checks: [string, boolean][] = [
    ["title", !!n.title],
    ["resourceHeadline", n.resourceHeadline === "Impulsar + Conectar"],
    ["internalCode", n.internalCode === "DI"],
    ["intro", n.intro.length > 20],
    ["resources>=2", n.resources.length >= 2],
    ["contribution", n.contribution.length > 20],
    ["valued", n.valued.length > 20],
    ["coordinating", n.coordination.coordinating.length > 20],
    ["collaborating", n.coordination.collaborating.length > 20],
    ["communication", n.communication.length > 20],
    ["contexts", n.contexts.length > 20],
    ["observe=3", n.observe.length === 3],
    ["repertoire", n.repertoire.length > 20],
    ["reflection=3", n.reflection.length === 3],
  ];
  let ok = true;
  for (const [name, pass] of checks) {
    console.log(`${pass ? "✓" : "✗"} ${name}`);
    if (!pass) ok = false;
  }
  console.log("\nTendencia:", n.resourceHeadline, "·", n.title);
  console.log("Aportación (inicio):", n.contribution.slice(0, 70) + "…");
  console.log(ok ? "\nRESULTADO: OK" : "\nRESULTADO: FALLOS");
  process.exitCode = ok ? 0 : 1;
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
