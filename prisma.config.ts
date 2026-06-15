import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL usa el session pooler (puerto 5432) para migraciones DDL.
    // DATABASE_URL usa el transaction pooler (puerto 6543) para la app.
    url: process.env.DIRECT_URL ?? env("DATABASE_URL"),
  },
});
