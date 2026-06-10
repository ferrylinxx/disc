import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Endpoint de diagnostico TEMPORAL. Verifica conectividad con la BD y la
 * presencia (no el valor) de variables clave. No expone secretos.
 * Eliminar tras depurar el deploy.
 */
function sanitize(msg: string): string {
  // Nunca devolver cadenas que parezcan credenciales/URLs de conexion.
  return msg.replace(/postgres(ql)?:\/\/[^\s"']+/gi, "postgres://[redacted]");
}

export async function GET() {
  const env = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    AUTH_SECRET: Boolean(process.env.AUTH_SECRET),
    APP_URL: process.env.APP_URL ?? null,
    sslmode: process.env.DATABASE_URL?.includes("sslmode=no-verify")
      ? "no-verify"
      : process.env.DATABASE_URL?.includes("sslmode=require")
        ? "require"
        : "none",
    pooler: process.env.DATABASE_URL?.includes("pooler.supabase.com")
      ? true
      : false,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    const [orgs, users] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count(),
    ]);
    return NextResponse.json({ ok: true, env, db: { orgs, users } });
  } catch (e) {
    const err = e as { name?: string; code?: string; message?: string };
    return NextResponse.json(
      {
        ok: false,
        env,
        error: {
          name: err.name ?? "Error",
          code: err.code ?? null,
          message: sanitize(err.message ?? String(e)).slice(0, 500),
        },
      },
      { status: 500 },
    );
  }
}
