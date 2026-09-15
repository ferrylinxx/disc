/**
 * Colocación de las burbujas del mapa conductual del equipo (informe de equipo).
 * Cada persona ya trae su posición en una rejilla de 200×200 anclada al
 * cuadrante de su recurso dominante (ver `quadrantPoint`); aquí solo se evita
 * que las burbujas se tapen entre sí.
 */

/** Rejilla del mapa: origen y lado, en unidades del viewBox del SVG. */
export const TEAM_GRID = { x: 10, y: 26, size: 200 } as const;

/** Cuadrante de cada recurso: [columna, fila] (D↖ I↗ / S↙ C↘). */
export const QUAD_ORIGIN: Record<string, [number, number]> = {
  D: [0, 0],
  I: [1, 0],
  S: [0, 1],
  C: [1, 1],
};

export interface BubbleInput {
  x: number;
  y: number;
  code: string;
  n: number;
}

/**
 * Separa las burbujas por relajación iterativa sin sacarlas nunca del cuadrante
 * de su recurso dominante. Determinista: misma entrada, mismo dibujo.
 */
export function layoutTeamBubbles<T extends BubbleInput>(
  points: T[],
): { bubbles: T[]; r: number } {
  const perQuad = new Map<string, number>();
  for (const p of points) perQuad.set(p.code, (perQuad.get(p.code) ?? 0) + 1);
  const crowd = Math.max(0, ...perQuad.values());
  // Cuantas más personas en un mismo cuadrante, burbujas más pequeñas.
  const r = crowd > 20 ? 6.5 : crowd > 12 ? 8 : 9.5;
  const minDist = 2 * r + 1.5;
  const half = TEAM_GRID.size / 2;

  const bubbles = points.map((p) => ({
    ...p,
    x: TEAM_GRID.x + p.x,
    y: TEAM_GRID.y + p.y,
  }));
  const bounds = (code: string) => {
    const [qx, qy] = QUAD_ORIGIN[code] ?? [0, 0];
    const pad = r + 2;
    return {
      minX: TEAM_GRID.x + qx * half + pad,
      maxX: TEAM_GRID.x + (qx + 1) * half - pad,
      minY: TEAM_GRID.y + qy * half + pad,
      maxY: TEAM_GRID.y + (qy + 1) * half - pad,
    };
  };

  for (let iter = 0; iter < 200; iter++) {
    let moved = false;
    for (let i = 0; i < bubbles.length; i++) {
      for (let j = i + 1; j < bubbles.length; j++) {
        const a = bubbles[i];
        const b = bubbles[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.hypot(dx, dy);
        if (dist >= minDist) continue;
        if (dist < 0.01) {
          // Coinciden: se separan en un ángulo fijo según su orden.
          const ang = (j * 2.399) % (Math.PI * 2);
          dx = Math.cos(ang);
          dy = Math.sin(ang);
          dist = 1;
        }
        const push = (minDist - dist) / 2 + 0.01;
        a.x -= (dx / dist) * push;
        a.y -= (dy / dist) * push;
        b.x += (dx / dist) * push;
        b.y += (dy / dist) * push;
        moved = true;
      }
    }
    for (const p of bubbles) {
      const q = bounds(p.code);
      p.x = Math.max(q.minX, Math.min(q.maxX, p.x));
      p.y = Math.max(q.minY, Math.min(q.maxY, p.y));
    }
    if (!moved) break;
  }
  return { bubbles, r };
}
