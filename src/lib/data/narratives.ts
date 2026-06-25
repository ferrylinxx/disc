import "server-only";
import { prisma } from "@/lib/db";
import { RESOURCE_NARRATIVES } from "@/lib/narratives/disc-gesem.profiles";
import { PROFILE_CATALOG, styleShort } from "@/lib/narratives/disc-gesem.catalog";

/** Entrada de narrativa para el editor de administración (BD + valor base). */
export interface AdminNarrativeEntry {
  scope: "RESOURCE" | "PROFILE";
  key: string;
  label: string;
  content: unknown;
  status: string;
  version: number;
  author: string | null;
  updatedAt: string | null;
  /** true si la entrada ya está guardada en BD (no es solo el valor por defecto). */
  inDb: boolean;
}

const RESOURCE_KEYS = ["D", "I", "S", "C"];

/**
 * Lista todas las narrativas para el editor: 4 recursos + las combinaciones del
 * catálogo. Para cada clave devuelve el contenido de BD si existe, o el valor
 * por defecto del código, junto con su estado/versión/autor.
 */
export async function adminNarrativeEntries(): Promise<AdminNarrativeEntry[]> {
  let rows: {
    scope: string;
    key: string;
    content: unknown;
    status: string;
    version: number;
    author: string | null;
    updatedAt: Date;
  }[] = [];
  try {
    rows = await prisma.narrativeEntry.findMany({ where: { locale: "es" } });
  } catch (e) {
    console.error("[narratives] tabla no disponible aún:", e);
  }
  const byKey = new Map(rows.map((r) => [`${r.scope}:${r.key}`, r]));
  const out: AdminNarrativeEntry[] = [];

  for (const key of RESOURCE_KEYS) {
    const r = byKey.get(`RESOURCE:${key}`);
    out.push({
      scope: "RESOURCE",
      key,
      label: `${styleShort(key)} · recurso ${key}`,
      // Fusión sobre el valor por defecto: el editor ve también los campos nuevos.
      content: r
        ? { ...RESOURCE_NARRATIVES[key], ...(r.content as object) }
        : RESOURCE_NARRATIVES[key],
      status: r?.status ?? "—",
      version: r?.version ?? 0,
      author: r?.author ?? null,
      updatedAt: r?.updatedAt?.toISOString() ?? null,
      inDb: !!r,
    });
  }
  for (const key of Object.keys(PROFILE_CATALOG)) {
    const r = byKey.get(`PROFILE:${key}`);
    out.push({
      scope: "PROFILE",
      key,
      label: `${PROFILE_CATALOG[key].name} · ${key}`,
      content: r ? r.content : PROFILE_CATALOG[key],
      status: r?.status ?? "—",
      version: r?.version ?? 0,
      author: r?.author ?? null,
      updatedAt: r?.updatedAt?.toISOString() ?? null,
      inDb: !!r,
    });
  }
  return out;
}
