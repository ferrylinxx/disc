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
      if (r.scope === "RESOURCE") {
        resources[r.key] = r.content as unknown as ResourceNarrative;
      } else if (r.scope === "PROFILE") {
        profiles[r.key] = r.content as unknown as ProfileEntry;
      }
    }
  } catch (e) {
    console.error("[narratives] usando valores por defecto (BD no disponible):", e);
  }
  return { resources, profiles };
});

/** Compone la narrativa de un resultado usando la biblioteca cargada de BD. */
export async function buildProfileNarrativeDb(
  result: ScoringResult,
): Promise<ProfileNarrative> {
  const library = await loadNarrativeLibrary();
  return buildProfileNarrative(result, library);
}
