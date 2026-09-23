/**
 * Lectura de listados de participantes pegados, subidos en CSV o extraídos de
 * una foto: una persona por línea, columnas separadas por coma, punto y coma o
 * tabulador. El correo puede estar en cualquier columna; el resto es el nombre.
 */

export interface RosterRow {
  fullName: string;
  /** Vacío si la línea no trae un correo reconocible (se contará como omitida). */
  email: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const H_NAME = /^(nombre|nom|name|first ?name)$/i;
const H_SURNAME = /^(apellidos?|cognoms?|surnames?|last ?name)$/i;
const H_EMAIL = /^(e-?mail|correo( electr[oó]nico)?|correu( electr[oò]nic)?|mail)$/i;
const H_FULL = /^(nombre completo|nom complet|full ?name|persona|participante?)$/i;

const isHeader = (parts: string[]) =>
  parts.length > 0 && parts.every((p) => H_NAME.test(p) || H_SURNAME.test(p) || H_EMAIL.test(p) || H_FULL.test(p));

/**
 * Convierte el texto en filas. Con dos columnas de nombre se entiende
 * "Apellidos, Nombre" (la coma entre ambos es la convención de las listas
 * ordenadas por apellido) y se reordena a "Nombre Apellidos", salvo que una
 * cabecera diga que el nombre va primero ("Nom, Cognoms, Correu").
 */
export function parseRoster(raw: string): RosterRow[] {
  const out: RosterRow[] = [];
  let nameFirst = false;
  for (const line of raw.split(/\r?\n/)) {
    const parts = line
      .split(/[,;\t]/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) continue;
    if (isHeader(parts)) {
      const iName = parts.findIndex((p) => H_NAME.test(p));
      const iSurname = parts.findIndex((p) => H_SURNAME.test(p));
      nameFirst = iName >= 0 && iSurname >= 0 && iName < iSurname;
      continue;
    }
    const at = parts.findIndex((p) => EMAIL.test(p));
    const email = at >= 0 ? parts[at] : "";
    const names = parts.filter((_, i) => i !== at);
    const fullName =
      names.length === 2 && !nameFirst && at >= 0 ? `${names[1]} ${names[0]}` : names.join(" ");
    out.push({ fullName: fullName.replace(/\s+/g, " ").trim(), email });
  }
  return out;
}
