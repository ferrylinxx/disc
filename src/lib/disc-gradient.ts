/**
 * Degradados oficiales de las dimensiones DISC GESEM (diseño de marca).
 * Cada dimensión tiene dos paradas de color para construir el degradado.
 */
export const DISC_GRAD: Record<string, [string, string]> = {
  D: ["#D1133A", "#F5C0C5"],
  I: ["#FFAE00", "#F9E866"],
  S: ["#30C67C", "#82F4B1"],
  C: ["#6F7BF7", "#9BF8F4"],
};

/** Paradas [inicio, fin] del degradado de una dimensión (con respaldo azul GESEM). */
export function discGradStops(code: string): [string, string] {
  return DISC_GRAD[code] ?? ["#00a1e0", "#93e4ed"];
}

/** Cadena CSS `linear-gradient(...)` para una dimensión, al ángulo indicado. */
export function discGrad(code: string, deg = 45): string {
  const [a, b] = discGradStops(code);
  return `linear-gradient(${deg}deg, ${a}, ${b})`;
}

/** Mezcla dos colores hex (#RRGGBB) en proporción t (0=a, 1=b). */
function mixHex(a: string, b: string, t: number): string {
  const p = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [ar, ag, ab] = p(a);
  const [br, bg, bb] = p(b);
  const c = (x: number, y: number) =>
    Math.round(x + (y - x) * t).toString(16).padStart(2, "0");
  return `#${c(ar, br)}${c(ag, bg)}${c(ab, bb)}`;
}

/**
 * Degradado "fuerte" para barras/columnas: del color sólido a un tono medio (no
 * al casi-blanco del final), para que se lean mejor. Mantiene la identidad DISC
 * sin tocar la paleta de marca (que sí usa el tono claro en fondos amplios).
 */
export function discGradStrong(code: string, deg = 90): string {
  const [a, b] = discGradStops(code);
  return `linear-gradient(${deg}deg, ${a}, ${mixHex(a, b, 0.5)})`;
}
