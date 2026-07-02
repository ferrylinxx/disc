"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import type { ActionState } from "./org";

const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
type NarrativeStatus = (typeof STATUSES)[number];

/**
 * Guarda (upsert) una entrada de narrativa editable desde administración.
 * Incrementa la versión, registra el autor y revalida el editor. SUPERADMIN.
 */
export async function saveNarrative(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole("SUPERADMIN");
  const scope = String(formData.get("scope") ?? "");
  const key = String(formData.get("key") ?? "");
  const statusRaw = String(formData.get("status") ?? "PUBLISHED");
  const contentRaw = String(formData.get("content") ?? "");

  if (scope !== "RESOURCE" && scope !== "PROFILE") {
    return { error: "Ámbito no válido." };
  }
  if (!key) return { error: "Falta la clave de la narrativa." };

  let content: unknown;
  try {
    content = JSON.parse(contentRaw);
  } catch {
    return { error: "El contenido no es un JSON válido." };
  }

  const status: NarrativeStatus = STATUSES.includes(statusRaw as NarrativeStatus)
    ? (statusRaw as NarrativeStatus)
    : "PUBLISHED";
  const author = session.name ?? session.email ?? "admin";

  const existing = await prisma.narrativeEntry.findUnique({
    where: { scope_key_locale: { scope, key, locale: "es" } },
    select: { version: true },
  });

  await prisma.narrativeEntry.upsert({
    where: { scope_key_locale: { scope, key, locale: "es" } },
    update: {
      content: content as Prisma.InputJsonValue,
      status,
      author,
      version: (existing?.version ?? 0) + 1,
    },
    create: {
      scope,
      key,
      locale: "es",
      content: content as Prisma.InputJsonValue,
      status,
      author,
      version: 1,
    },
  });

  revalidatePath("/admin/catalogo");
  return { ok: true, message: `Guardado (v${(existing?.version ?? 0) + 1}).` };
}

/**
 * Guarda (upsert) un bloque de la Biblioteca Narrativa (perfil × bloque).
 * scope "BLOCK", key `${perfil}:${bloque}`, contenido { text }. SUPERADMIN.
 */
export async function saveBlock(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole("SUPERADMIN");
  const profile = String(formData.get("profile") ?? "").toUpperCase();
  const blockId = String(formData.get("blockId") ?? "");
  const statusRaw = String(formData.get("status") ?? "DRAFT");
  const text = String(formData.get("text") ?? "");
  if (!profile || !blockId) return { error: "Faltan datos del bloque." };

  const status: NarrativeStatus = STATUSES.includes(statusRaw as NarrativeStatus)
    ? (statusRaw as NarrativeStatus)
    : "DRAFT";
  const author = session.name ?? session.email ?? "admin";
  const key = `${profile}:${blockId}`;

  const existing = await prisma.narrativeEntry.findUnique({
    where: { scope_key_locale: { scope: "BLOCK", key, locale: "es" } },
    select: { version: true },
  });
  await prisma.narrativeEntry.upsert({
    where: { scope_key_locale: { scope: "BLOCK", key, locale: "es" } },
    update: {
      content: { text } as Prisma.InputJsonValue,
      status,
      author,
      version: (existing?.version ?? 0) + 1,
    },
    create: {
      scope: "BLOCK",
      key,
      locale: "es",
      content: { text } as Prisma.InputJsonValue,
      status,
      author,
      version: 1,
    },
  });

  revalidatePath("/admin/catalogo/bloques");
  return { ok: true, message: `Guardado (v${(existing?.version ?? 0) + 1}).` };
}

/**
 * Guarda (upsert) el glosario DISC GESEM de un idioma. scope "GLOSSARY",
 * key "v1", locale ca/es, contenido = { title, intro, groups[] }. SUPERADMIN.
 */
export async function saveGlossary(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole("SUPERADMIN");
  const locale = String(formData.get("locale") ?? "");
  const contentRaw = String(formData.get("content") ?? "");
  if (locale !== "ca" && locale !== "es") {
    return { error: "Idioma no válido." };
  }

  let content: unknown;
  try {
    content = JSON.parse(contentRaw);
  } catch {
    return { error: "El contenido no es un JSON válido." };
  }
  const c = content as { groups?: unknown };
  if (!c || typeof c !== "object" || !Array.isArray(c.groups)) {
    return { error: "El glosario debe tener un array 'groups'." };
  }

  const author = session.name ?? session.email ?? "admin";
  const existing = await prisma.narrativeEntry.findUnique({
    where: { scope_key_locale: { scope: "GLOSSARY", key: "v1", locale } },
    select: { version: true },
  });
  await prisma.narrativeEntry.upsert({
    where: { scope_key_locale: { scope: "GLOSSARY", key: "v1", locale } },
    update: {
      content: content as Prisma.InputJsonValue,
      status: "PUBLISHED",
      author,
      version: (existing?.version ?? 0) + 1,
    },
    create: {
      scope: "GLOSSARY",
      key: "v1",
      locale,
      content: content as Prisma.InputJsonValue,
      status: "PUBLISHED",
      author,
      version: 1,
    },
  });

  revalidatePath("/admin/glosario");
  return { ok: true, message: `Guardado (v${(existing?.version ?? 0) + 1}).` };
}
