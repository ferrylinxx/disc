import type { NextRequest } from "next/server";
import { loadGlossary } from "@/lib/data/glossary";

/** Glosario efectivo (editable desde admin) para el drawer del cliente. */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("lang");
  const lang = q === "es" ? "es" : "ca";
  const data = await loadGlossary(lang);
  return Response.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
