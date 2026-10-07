"use client";

import { useId } from "react";

/**
 * Marco de oro del avatar de superadmin: el aro y una tiara de cinco puntas
 * dibujados como una sola pieza (mismo degradado y un único contorno exterior
 * que recorre el aro y sube por las puntas), para que la corona nazca del aro
 * en vez de flotar encima. El rubí va justo donde se unen.
 *
 * Coordenadas en px de un avatar de 36: centro de la cara en (0, 0), cara de
 * radio 18, aro de 17.5 a 21 (medio píxel sobre la cara para que no quede
 * hueco). Para otros tamaños se escala entero. Componente de cliente solo por
 * useId: cada marco necesita sus propios degradados (los repetidos dejan de
 * verse si el primero está en una pestaña oculta).
 */

const R_OUT = 21;
const R_IN = 17.5;
const VIEW = { x: -23, y: -35, w: 46, h: 58 };

// Puntos sobre el borde exterior del aro, a ±42° de la vertical: ahí arranca la tiara.
const BASE = 14.05; // 21·sin 42°
const BASE_Y = -15.6; // -21·cos 42°
const INNER_X = 12.71; // 19·sin 42°
const INNER_Y = -14.12; // -19·cos 42°

/** Borde superior de la tiara, de izquierda a derecha: las puntas se abren hacia fuera. */
const CROWN_TOP = [
  [-BASE, BASE_Y],
  [-15.2, -24.2],
  [-10.4, -21.8],
  [-7.2, -27.8],
  [-3.5, -24.4],
  [0, -30.6],
  [3.5, -24.4],
  [7.2, -27.8],
  [10.4, -21.8],
  [15.2, -24.2],
  [BASE, BASE_Y],
] as const;
const PEARLS = [
  [-15.2, -24.2, 1.7],
  [-7.2, -27.8, 1.9],
  [0, -30.6, 2.2],
  [7.2, -27.8, 1.9],
  [15.2, -24.2, 1.7],
] as const;

const r2 = (n: number) => Math.round(n * 100) / 100;
const line = (pts: readonly (readonly number[])[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");

/** Tiara rellena: borde superior y cierre por dentro de la banda del aro. */
const CROWN_FILL = `${line(CROWN_TOP)} L${INNER_X} ${INNER_Y} A19 19 0 0 0 ${-INNER_X} ${INNER_Y} Z`;
/** Contorno exterior de toda la pieza: puntas de la tiara y, por abajo, el aro. */
const OUTLINE = `${line(CROWN_TOP)} A${R_OUT} ${R_OUT} 0 1 1 ${-BASE} ${BASE_Y}`;
/** Aro: corona circular entre R_IN y R_OUT. */
const RING = `M0 ${-R_OUT} A${R_OUT} ${R_OUT} 0 1 1 0 ${R_OUT} A${R_OUT} ${R_OUT} 0 1 1 0 ${-R_OUT} Z M0 ${-R_IN} A${R_IN} ${R_IN} 0 1 0 0 ${R_IN} A${R_IN} ${R_IN} 0 1 0 0 ${-R_IN} Z`;

export function RoyalFrame({ face }: { face: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gold = `royal-gold-${uid}`;
  const pearl = `royal-pearl-${uid}`;
  const k = face / 36;
  return (
    <svg
      aria-hidden
      className="royal-frame"
      width={r2(VIEW.w * k)}
      height={r2(VIEW.h * k)}
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
      // El centro del dibujo (0, 0) cae en el centro de la cara.
      style={{ left: r2(face / 2 + VIEW.x * k), top: r2(face / 2 + VIEW.y * k) }}
    >
      <defs>
        {/* Un solo degradado para aro y tiara: oro con un reflejo abajo a la derecha. */}
        <linearGradient id={gold} gradientUnits="userSpaceOnUse" x1="-15" y1="-33" x2="14" y2="21">
          <stop offset="0" stopColor="#fff3b0" />
          <stop offset="0.2" stopColor="#fcd34d" />
          <stop offset="0.45" stopColor="#eab308" />
          <stop offset="0.66" stopColor="#a16207" />
          <stop offset="0.82" stopColor="#fde68a" />
          <stop offset="1" stopColor="#b7791f" />
        </linearGradient>
        <radialGradient id={pearl} cx="0.35" cy="0.32" r="0.72">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#fef3c7" />
          <stop offset="1" stopColor="#d4a017" />
        </radialGradient>
      </defs>

      {/* Oro: aro y tiara con el mismo degradado, sin costura entre ellos */}
      <path d={RING} fill={`url(#${gold})`} fillRule="evenodd" />
      <path d={CROWN_FILL} fill={`url(#${gold})`} />

      {/* Contornos: el exterior recorre aro y puntas; el interior perfila la cara */}
      <path d={OUTLINE} fill="none" stroke="#7c4a03" strokeWidth="0.9" strokeLinejoin="round" />
      <circle r={R_IN + 0.15} fill="none" stroke="#7c4a03" strokeOpacity="0.45" strokeWidth="0.6" />

      {/* Reflejos */}
      <path d="M-18.3 -6.5A19.3 19.3 0 0 1 -12.4 -14.8" fill="none" stroke="#fff" strokeOpacity="0.65" strokeWidth="1" strokeLinecap="round" />
      <path d="M-13.3 -17.2 -14 -23M-6.6 -22.2 -7 -26.4M-1.3 -24.4 -0.5 -29" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.75" strokeLinecap="round" />

      {/* Joyas: zafiros en el aro y rubí donde nace la tiara */}
      <circle cx="-8.5" cy="-17.6" r="1.2" fill="#0ea5e9" stroke="#0c4a6e" strokeWidth="0.45" />
      <circle cx="8.5" cy="-17.6" r="1.2" fill="#0ea5e9" stroke="#0c4a6e" strokeWidth="0.45" />
      <path d="M0 -21.5 2.1 -19.3 0 -17.1 -2.1 -19.3Z" fill="#e11d48" stroke="#881337" strokeWidth="0.5" strokeLinejoin="round" />
      <path d="M-0.8 -19.9 0 -20.6" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.6" strokeLinecap="round" />

      {/* Perlas en las puntas */}
      {PEARLS.map(([x, y, r]) => (
        <circle key={x} cx={x} cy={y} r={r} fill={`url(#${pearl})`} stroke="#7c4a03" strokeWidth="0.7" />
      ))}

      {/* Destello (aparece y se apaga, sin girar) */}
      <path
        className="royal-twinkle"
        d="M13.2 -33c.22 1.1.72 1.6 1.82 1.82-1.1.22-1.6.72-1.82 1.82-.22-1.1-.72-1.6-1.82-1.82 1.1-.22 1.6-.72 1.82-1.82Z"
        fill="#fffbeb"
        stroke="#f59e0b"
        strokeWidth="0.35"
      />
    </svg>
  );
}
