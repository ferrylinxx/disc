/**
 * Posición de un punto en la rejilla DISC con el orden oficial D↖ I↗ / S↙ C↘,
 * **anclada al cuadrante del recurso dominante** (primary).
 *
 * A diferencia de una proyección de balance (centroide de las 4 dimensiones),
 * este cálculo garantiza que el punto cae en el cuadrante del recurso primario:
 * un perfil SI (S alto con I casi igual) aparece SIEMPRE en la zona S, no en el
 * centro ni en el lado opuesto. La profundidad hacia la esquina refleja cuán
 * marcado es el recurso; un pequeño sesgo intra-cuadrante (que nunca cruza los
 * ejes) refleja el recurso secundario.
 *
 * Devuelve coordenadas normalizadas: x en [-1,1] (+ = derecha), y en [-1,1]
 * (+ = arriba). Cada consumidor las escala a su lienzo.
 */
const CORNER: Record<string, readonly [number, number]> = {
  D: [-1, 1], // arriba-izquierda
  I: [1, 1], //  arriba-derecha
  S: [-1, -1], // abajo-izquierda
  C: [1, -1], // abajo-derecha
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function quadrantPoint(
  shares: Record<string, number>,
  primary: string,
  secondary?: string,
): { x: number; y: number } {
  const corner = CORNER[primary];
  if (!corner) return { x: 0, y: 0 };
  const [px, py] = corner;
  const p = shares[primary] ?? 0;

  // Recurso secundario: el segundo con más peso si no se indica.
  const sec =
    secondary && CORNER[secondary]
      ? secondary
      : Object.keys(CORNER)
          .filter((k) => k !== primary)
          .sort((a, b) => (shares[b] ?? 0) - (shares[a] ?? 0))[0];

  // Profundidad hacia la esquina según cuán dominante es el primario:
  // ~25% (poco marcado) queda cerca del centro; 70%+ llega casi a la esquina.
  // Siempre dentro del cuadrante del recurso dominante.
  const depth = clamp((p - 25) / 45, 0, 1) * 0.6 + 0.32; // 0.32 .. 0.92
  let x = px * depth;
  let y = py * depth;

  // Sesgo suave hacia el recurso secundario, acotado para no cruzar los ejes
  // (el punto nunca sale del cuadrante del recurso dominante).
  const secCorner = sec ? CORNER[sec] : undefined;
  if (secCorner) {
    const s = shares[sec] ?? 0;
    const lean = clamp(s / 100, 0, 0.5) * 0.5; // 0 .. 0.25
    if (Math.sign(secCorner[0]) !== Math.sign(px)) x += (0 - x) * lean;
    if (Math.sign(secCorner[1]) !== Math.sign(py)) y += (0 - y) * lean;
  }

  return { x, y };
}
