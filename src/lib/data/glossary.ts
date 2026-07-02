import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { getGlossary, type Glossary } from "@/lib/glossary";
import type { Lang } from "@/lib/i18n/dictionaries";

/**
 * Glosario efectivo: lee la versión editada desde administración
 * (NarrativeEntry scope "GLOSSARY", key "v1", locale) y, si no existe o no es
 * válida, cae al glosario por defecto del código.
 */
function isValidGlossary(x: unknown): x is Glossary {
  if (!x || typeof x !== "object") return false;
  const g = x as Glossary;
  return Array.isArray(g.groups);
}

export const loadGlossary = cache(async (lang: Lang): Promise<Glossary> => {
  const fallback = getGlossary(lang);
  try {
    const row = await prisma.narrativeEntry.findUnique({
      where: { scope_key_locale: { scope: "GLOSSARY", key: "v1", locale: lang } },
      select: { content: true, status: true },
    });
    if (row && row.status !== "ARCHIVED" && isValidGlossary(row.content)) {
      const g = row.content as Glossary;
      return {
        title: g.title ?? fallback.title,
        intro: g.intro ?? fallback.intro,
        groups: g.groups,
      };
    }
  } catch {
    /* BD no disponible → fallback */
  }
  return fallback;
});

/** JSON (formateado) del glosario guardado o del valor por defecto, para el editor. */
export async function loadGlossaryJson(lang: Lang): Promise<string> {
  const g = await loadGlossary(lang);
  return JSON.stringify(g, null, 2);
}
