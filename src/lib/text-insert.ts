/**
 * Inserción de texto en la posición del cursor de un campo (sustituyendo la
 * selección, si la hay). Se usa para las variables del correo de invitación.
 */
export interface Insertion {
  /** Valor resultante del campo. */
  value: string;
  /** Posición donde dejar el cursor (al final de lo insertado). */
  caret: number;
}

/**
 * Inserta `snippet` entre `start` y `end` de `value`. Añade un espacio delante
 * si el carácter anterior no es un espacio ni un salto de línea, para que las
 * variables no se peguen a la palabra previa.
 */
export function insertAt(value: string, start: number, end: number, snippet: string): Insertion {
  const from = Math.max(0, Math.min(start, value.length));
  const to = Math.max(from, Math.min(end, value.length));
  const before = value.slice(0, from);
  const after = value.slice(to);
  const needsSpace = before.length > 0 && !/[\s(¡¿"'«]$/.test(before);
  const text = needsSpace ? ` ${snippet}` : snippet;
  return { value: before + text + after, caret: before.length + text.length };
}
