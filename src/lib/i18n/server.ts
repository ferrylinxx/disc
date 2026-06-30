import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LANG, isLang, type Lang } from "./dictionaries";

/** Idioma activo según la cookie `lang` (catalán por defecto). */
export async function getLang(): Promise<Lang> {
  const v = (await cookies()).get("lang")?.value;
  return isLang(v) ? v : DEFAULT_LANG;
}
