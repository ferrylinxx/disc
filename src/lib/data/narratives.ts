import "server-only";
import { prisma } from "@/lib/db";
import { RESOURCE_NARRATIVES } from "@/lib/narratives/disc-gesem.profiles";
import { PROFILE_CATALOG, styleShort } from "@/lib/narratives/disc-gesem.catalog";
import { BLOCKS, PROFILE_CODES } from "@/lib/narratives/blocks";

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

/** Un bloque de la Biblioteca Narrativa (perfil × bloque) para el editor. */
export interface AdminBlockEntry {
  profile: string;
  profileName: string;
  blockId: string;
  blockLabel: string;
  lengthHint: string;
  text: string;
  status: string;
  version: number;
  author: string | null;
  updatedAt: string | null;
  inDb: boolean;
}

/** Perfiles con sus 9 bloques (117 entradas) para el editor de administración. */
export async function adminBlockEntries(): Promise<
  { profile: string; profileName: string; blocks: AdminBlockEntry[] }[]
> {
  let rows: {
    key: string;
    content: unknown;
    status: string;
    version: number;
    author: string | null;
    updatedAt: Date;
  }[] = [];
  try {
    rows = await prisma.narrativeEntry.findMany({ where: { scope: "BLOCK", locale: "es" } });
  } catch (e) {
    console.error("[blocks] tabla no disponible:", e);
  }
  const byKey = new Map(rows.map((r) => [r.key, r]));

  return PROFILE_CODES.map((profile) => ({
    profile,
    profileName: PROFILE_CATALOG[profile]?.name ?? profile,
    blocks: BLOCKS.map((b) => {
      const r = byKey.get(`${profile}:${b.id}`);
      const text =
        r && typeof r.content === "object" && r.content !== null
          ? String((r.content as { text?: unknown }).text ?? "")
          : "";
      return {
        profile,
        profileName: PROFILE_CATALOG[profile]?.name ?? profile,
        blockId: b.id,
        blockLabel: b.label,
        lengthHint: b.length,
        text,
        status: r?.status ?? "—",
        version: r?.version ?? 0,
        author: r?.author ?? null,
        updatedAt: r?.updatedAt?.toISOString() ?? null,
        inDb: !!r,
      };
    }),
  }));
}
