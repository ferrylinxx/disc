import { describe, expect, it } from "vitest";
import { layoutTeamBubbles, QUAD_ORIGIN, TEAM_GRID } from "./team-bubbles";

/** n personas del mismo recurso apiladas casi en el mismo punto. */
function cluster(code: string, x: number, y: number, n: number, from: number) {
  return Array.from({ length: n }, (_, i) => ({ code, x: x + (i % 2) * 0.5, y, n: from + i }));
}

function insideQuadrant(p: { x: number; y: number; code: string }) {
  const [qx, qy] = QUAD_ORIGIN[p.code];
  const half = TEAM_GRID.size / 2;
  return (
    p.x > TEAM_GRID.x + qx * half &&
    p.x < TEAM_GRID.x + (qx + 1) * half &&
    p.y > TEAM_GRID.y + qy * half &&
    p.y < TEAM_GRID.y + (qy + 1) * half
  );
}

describe("mapa conductual del equipo: burbujas sin solaparse", () => {
  const casos = [
    // Reparto real de "Equipo Gesem" (15 personas) que se veía amontonado.
    ["equipo de 15", [...cluster("C", 140, 140, 7, 1), ...cluster("I", 140, 60, 4, 8), ...cluster("S", 60, 140, 3, 12), ...cluster("D", 60, 60, 1, 15)]],
    ["16 en un solo cuadrante", cluster("I", 150, 50, 16, 1)],
    ["25 en un solo cuadrante", cluster("S", 40, 160, 25, 1)],
  ] as const;

  for (const [nombre, puntos] of casos) {
    it(`${nombre}: ninguna burbuja tapa a otra ni sale de su cuadrante`, () => {
      const { bubbles, r } = layoutTeamBubbles([...puntos]);
      expect(bubbles).toHaveLength(puntos.length);
      for (const b of bubbles) expect(insideQuadrant(b)).toBe(true);
      for (let i = 0; i < bubbles.length; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
          const d = Math.hypot(bubbles[i].x - bubbles[j].x, bubbles[i].y - bubbles[j].y);
          expect(d).toBeGreaterThanOrEqual(2 * r);
        }
      }
    });
  }
});
