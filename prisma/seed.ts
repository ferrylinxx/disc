/**
 * Seed del instrumento DISC GESEM v1 en la BD configurable.
 * Reutiliza la definición sembrada en `src/lib` (única fuente de verdad)
 * y la vuelca en las tablas instrument/version/context/item/option/narrative.
 * Idempotente: limpia el contenido versionado y lo regenera.
 */
import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DISC_GESEM_V1 } from "../src/lib/instruments/disc-gesem";
import {
  DIMENSION_NARRATIVES,
  EQ_BANDS,
} from "../src/lib/narratives/disc-gesem.narratives";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const def = DISC_GESEM_V1;
  const scoring = def.scoring as unknown as Prisma.InputJsonValue;

  const instrument = await prisma.instrument.upsert({
    where: { code: def.instrumentCode },
    update: { name: def.instrumentName, description: def.description },
    create: {
      code: def.instrumentCode,
      name: def.instrumentName,
      description: def.description,
    },
  });

  const version = await prisma.instrumentVersion.upsert({
    where: {
      instrumentId_version: {
        instrumentId: instrument.id,
        version: def.version,
      },
    },
    update: { status: "PUBLISHED", scoring, publishedAt: new Date() },
    create: {
      instrumentId: instrument.id,
      version: def.version,
      status: "PUBLISHED",
      description: def.description,
      scoring,
      publishedAt: new Date(),
    },
  });

  // Limpieza idempotente del contenido versionado.
  await prisma.narrative.deleteMany({ where: { versionId: version.id } });
  await prisma.item.deleteMany({ where: { versionId: version.id } });
  await prisma.context.deleteMany({ where: { versionId: version.id } });
  await prisma.dimension.deleteMany({ where: { versionId: version.id } });

  // Dimensiones.
  const dimIdByCode = new Map<string, string>();
  for (const d of def.dimensions) {
    const row = await prisma.dimension.create({
      data: {
        versionId: version.id,
        code: d.code,
        name: d.name,
        color: d.color,
        order: d.order,
      },
    });
    dimIdByCode.set(d.code, row.id);
  }

  // Contextos.
  const ctxIdByCode = new Map<string, string>();
  for (const c of def.contexts) {
    const row = await prisma.context.create({
      data: {
        versionId: version.id,
        code: c.code,
        name: c.name,
        description: c.description,
        order: c.order,
      },
    });
    ctxIdByCode.set(c.code, row.id);
  }

  // Ítems + opciones.
  for (const item of def.items) {
    const contextId = ctxIdByCode.get(item.contextCode)!;
    const itemRow = await prisma.item.create({
      data: {
        versionId: version.id,
        contextId,
        code: item.code,
        prompt: item.prompt,
        order: item.order,
        options: {
          create: item.options.map((o) => ({
            dimensionId: dimIdByCode.get(o.dimensionCode)!,
            code: o.code,
            text: o.text,
          })),
        },
      },
    });
    void itemRow;
  }

  // Narrativas por dimensión.
  for (const [code, n] of Object.entries(DIMENSION_NARRATIVES)) {
    await prisma.narrative.create({
      data: {
        versionId: version.id,
        scope: "DIMENSION",
        key: code,
        contents: {
          create: {
            revision: 1,
            locale: "es",
            title: n.title,
            body: n.summary,
            status: "PUBLISHED",
          },
        },
      },
    });
  }

  // Narrativas EQ (bandas).
  for (const band of EQ_BANDS) {
    await prisma.narrative.create({
      data: {
        versionId: version.id,
        scope: "EQ",
        key: `EQ_MIN_${band.min}`,
        contents: {
          create: {
            revision: 1,
            locale: "es",
            title: band.label,
            body: band.description,
            status: "PUBLISHED",
          },
        },
      },
    });
  }

  console.log(
    `Seed OK: instrumento ${instrument.code} v${version.version} ` +
      `(${def.dimensions.length} dim, ${def.contexts.length} ctx, ${def.items.length} ítems).`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
