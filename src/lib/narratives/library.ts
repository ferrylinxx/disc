import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import type { ScoringResult } from "@/lib/engine/types";
import {
  RESOURCE_NARRATIVES,
  buildProfileNarrative,
  type NarrativeLibrary,
  type ProfileNarrative,
  type ResourceNarrative,
} from "./disc-gesem.profiles";
import { PROFILE_CATALOG, type ProfileEntry } from "./disc-gesem.catalog";

/**
 * Carga la biblioteca de narrativas desde BD (entradas PUBLISHED) y la fusiona
 * sobre los valores por defecto del código. Si la tabla aún no existe o falla la
 * consulta, devuelve los valores por defecto (la app nunca se queda sin texto).
 *
 * Memoizada por render (React cache) para no consultar BD en cada uso.
 */
export const loadNarrativeLibrary = cache(async (): Promise<NarrativeLibrary> => {
  const resources: Record<string, ResourceNarrative> = { ...RESOURCE_NARRATIVES };
  const profiles: Record<string, ProfileEntry> = { ...PROFILE_CATALOG };
  try {
    const rows = await prisma.narrativeEntry.findMany({
      where: { status: "PUBLISHED", locale: "es" },
    });
    for (const r of rows) {
      // Fusión superficial sobre los valores por defecto: si una entrada de BD
      // no trae campos nuevos (p. ej. team*), se completan desde el código.
      if (r.scope === "RESOURCE") {
        resources[r.key] = {
          ...(RESOURCE_NARRATIVES[r.key] ?? {}),
          ...(r.content as object),
        } as ResourceNarrative;
      } else if (r.scope === "PROFILE") {
        profiles[r.key] = {
          ...(PROFILE_CATALOG[r.key] ?? {}),
          ...(r.content as object),
        } as ProfileEntry;
      }
    }
  } catch (e) {
    console.error("[narratives] usando valores por defecto (BD no disponible):", e);
  }
  return { resources, profiles };
});

/**
 * Compone la narrativa de un resultado usando la biblioteca cargada de BD.
 * La biblioteca editable de BD está en español; en catalán se compone desde la
 * base catalana del código (RESOURCE_NARRATIVES_CA) sin fusión de BD.
 */
export async function buildProfileNarrativeDb(
  result: ScoringResult,
  lang: "ca" | "es" = "es",
): Promise<ProfileNarrative> {
  if (lang === "ca") return buildProfileNarrative(result, "ca");
  const library = await loadNarrativeLibrary();
  return buildProfileNarrative(result, "es", library);
}

/**
 * Carga el texto editorial fijo (Biblioteca V1) de un perfil: los apartados
 * publicados como bloques (scope "BLOCK", clave `<PERFIL>:<apartado>`). Devuelve
 * un mapa apartado→texto con lo que esté PUBLICADO (puede ser parcial o vacío).
 * El informe usa estos textos cuando existen y compone el resto por defecto.
 */
export const loadProfileBlocks = cache(
  async (profileCode: string, lang: "ca" | "es" = "es"): Promise<Record<string, string>> => {
    const out: Record<string, string> = {};
    // Los bloques editoriales de BD están en español. En catalán no hay bloques,
    // así que el informe compone todo desde la base catalana del código.
    if (lang === "ca") return out;
    try {
      const rows = await prisma.narrativeEntry.findMany({
        where: {
          scope: "BLOCK",
          status: "PUBLISHED",
          locale: "es",
          key: { startsWith: `${profileCode}:` },
        },
        select: { key: true, content: true },
      });
      for (const r of rows) {
        const blockId = r.key.split(":")[1];
        const text = (r.content as { text?: string })?.text?.trim();
        if (blockId && text) out[blockId] = text;
      }
    } catch (e) {
      console.error("[narratives] no se pudieron cargar los bloques:", e);
    }
    return out;
  },
);
