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
