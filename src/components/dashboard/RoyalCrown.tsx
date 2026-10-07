"use client";

import { useId } from "react";

/**
 * Corona del avatar de superadmin, dibujada para verse bien en pequeño (20-26
 * px de ancho): silueta rotunda de tres puntas con contorno oscuro, perlas en
 * las puntas, un rubí tallado en el centro de la banda y dos zafiros azul
 * GESEM. Va recta y centrada sobre el avatar, con la base apoyada en el aro.
 * Componente de cliente solo por useId: cada corona necesita sus propios
 * degradados, porque los repetidos dejan de verse si el primero está en una
 * pestaña oculta.
 */
export function RoyalCrown({ width, className = "" }: { width: number; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gold = `crown-gold-${uid}`;
  const band = `crown-band-${uid}`;
  const pearl = `crown-pearl-${uid}`;
  return (
    <svg
      width={width}
      height={Math.round(width * 0.62 * 10) / 10}
      viewBox="0 0 40 25"
      aria-hidden
      className={`royal-crown ${className}`}
    >
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff1a8" />
          <stop offset="0.35" stopColor="#facc15" />
          <stop offset="0.7" stopColor="#eab308" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id={band} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="0.55" stopColor="#ca8a04" />
          <stop offset="1" stopColor="#92400e" />
        </linearGradient>
        <radialGradient id={pearl} cx="0.35" cy="0.32" r="0.72">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#fef3c7" />
          <stop offset="1" stopColor="#d4a017" />
        </radialGradient>
      </defs>

      {/* Cuerpo: tres puntas */}
      <path
        d="M5 19 3.5 7l8.5 6L20 3.5 28 13l8.5-6L35 19Z"
        fill={`url(#${gold})`}
        stroke="#78350f"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      {/* Brillos */}
      <path d="M6.4 17.2 5.5 10.4" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M15.3 10.2 20 6.4" stroke="#fff" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />

      {/* Banda con piedras */}
      <rect x="4.2" y="17.4" width="31.6" height="5.8" rx="2.1" fill={`url(#${band})`} stroke="#78350f" strokeWidth="1.3" />
      <circle cx="11.6" cy="20.3" r="1.5" fill="#0ea5e9" stroke="#0c4a6e" strokeWidth="0.6" />
      <circle cx="28.4" cy="20.3" r="1.5" fill="#0ea5e9" stroke="#0c4a6e" strokeWidth="0.6" />
      <path d="M20 17.9 22.4 20.3 20 22.7 17.6 20.3Z" fill="#e11d48" stroke="#881337" strokeWidth="0.6" strokeLinejoin="round" />
      <path d="M19.2 19.3 20 18.6" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.7" strokeLinecap="round" />

      {/* Perlas en las puntas */}
      <circle cx="3.5" cy="6.2" r="2.6" fill={`url(#${pearl})`} stroke="#78350f" strokeWidth="1" />
      <circle cx="20" cy="3.2" r="3" fill={`url(#${pearl})`} stroke="#78350f" strokeWidth="1" />
      <circle cx="36.5" cy="6.2" r="2.6" fill={`url(#${pearl})`} stroke="#78350f" strokeWidth="1" />

      {/* Destello (aparece y se apaga, sin girar) */}
      <path
        className="royal-twinkle"
        d="M30.5.4c.25 1.3.85 1.9 2.15 2.15-1.3.25-1.9.85-2.15 2.15-.25-1.3-.85-1.9-2.15-2.15 1.3-.25 1.9-.85 2.15-2.15Z"
        fill="#fffbeb"
        stroke="#f59e0b"
        strokeWidth="0.4"
      />
    </svg>
  );
}
