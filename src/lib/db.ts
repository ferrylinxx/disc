import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Cliente Prisma (singleton) con driver adapter de PostgreSQL.
 * Patrón Prisma ORM v7: la conexión se inyecta vía adapter.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Config TLS para el adapter pg. Supabase (pooler) presenta una cadena que el
 * `pg` reciente trata como autofirmada cuando `sslmode=require`; se acepta sin
 * verificar la CA (la conexion sigue cifrada). No se aplica al Postgres local.
 */
function buildPgConfig() {
  const connectionString = process.env.DATABASE_URL;
  const needsSsl =
    !!connectionString && /sslmode=|\.supabase\.com/.test(connectionString);
  return needsSsl
    ? { connectionString, ssl: { rejectUnauthorized: false } }
    : { connectionString };
}

function createClient() {
  const adapter = new PrismaPg(buildPgConfig());
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
