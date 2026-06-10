/**
 * Seed de autenticación/demo: una organización y un usuario por rol.
 * Idempotente (upsert por email/slug). Contraseña común para la demo.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
const needsSsl =
  !!connectionString && /sslmode=|\.supabase\.com/.test(connectionString);
const adapter = new PrismaPg(
  needsSsl
    ? { connectionString, ssl: { rejectUnauthorized: false } }
    : { connectionString },
);
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = "gesem1234";

const SUPERADMINS = [
  { email: "ferrangarola22@gmail.com", name: "Ferran Garola", password: "Ferran2203%" },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const org = await prisma.organization.upsert({
    where: { slug: "gesem-demo" },
    update: {},
    create: { name: "GESEM Demo", slug: "gesem-demo" },
  });

  // SUPERADMIN (Admin GESEM, global).
  await prisma.user.upsert({
    where: { email: "admin@gesem.dev" },
    update: { passwordHash, globalRole: "SUPERADMIN" },
    create: {
      email: "admin@gesem.dev",
      name: "Admin GESEM",
      globalRole: "SUPERADMIN",
      passwordHash,
    },
  });

  // ADMIN Cliente (membership ADMIN en la org demo).
  const clientUser = await prisma.user.upsert({
    where: { email: "cliente@gesem.dev" },
    update: { passwordHash },
    create: {
      email: "cliente@gesem.dev",
      name: "Admin Cliente",
      passwordHash,
    },
  });
  await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: clientUser.id,
        organizationId: org.id,
      },
    },
    update: { role: "ADMIN" },
    create: { userId: clientUser.id, organizationId: org.id, role: "ADMIN" },
  });

  // FACILITATOR (membership FACILITATOR en la org demo).
  const facUser = await prisma.user.upsert({
    where: { email: "facilitador@gesem.dev" },
    update: { passwordHash },
    create: {
      email: "facilitador@gesem.dev",
      name: "Facilitador Demo",
      passwordHash,
    },
  });
  await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: facUser.id,
        organizationId: org.id,
      },
    },
    update: { role: "FACILITATOR" },
    create: { userId: facUser.id, organizationId: org.id, role: "FACILITATOR" },
  });

  // SUPERADMINS adicionales (con contraseña propia).
  for (const sa of SUPERADMINS) {
    const hash = await bcrypt.hash(sa.password, 10);
    await prisma.user.upsert({
      where: { email: sa.email },
      update: { passwordHash: hash, globalRole: "SUPERADMIN", name: sa.name },
      create: {
        email: sa.email,
        name: sa.name,
        globalRole: "SUPERADMIN",
        passwordHash: hash,
      },
    });
  }

  console.log("Seed auth OK. Usuarios demo (contraseña: gesem1234):");
  console.log("  · admin@gesem.dev        → SUPERADMIN (Admin GESEM)");
  console.log("  · cliente@gesem.dev      → ADMIN Cliente");
  console.log("  · facilitador@gesem.dev  → Facilitador");
  for (const sa of SUPERADMINS) {
    console.log(`  · ${sa.email}  → SUPERADMIN (${sa.name})`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
