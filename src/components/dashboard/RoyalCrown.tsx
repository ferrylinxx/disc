"use client";

import { useId } from "react";

/**
 * Corona del avatar de superadmin: oro con degradado, tres puntas rematadas
 * con perlas, un rubí y dos zafiros azul GESEM en la banda y un destello que
 * aparece de vez en cuando (.royal-twinkle). Componente de cliente solo por
 * useId: cada corona necesita sus propios degradados, porque los repetidos
 * dejan de verse si el primero está en una pestaña oculta.
 */
export function RoyalCrown({ size, className = "" }: { size: number; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gold = `crown-gold-${uid}`;
  const band = `crown-band-${uid}`;
  const pearl = `crown-pearl-${uid}`;
  return (
    <svg
      width={size}
      height={size * 0.78}
      viewBox="0 0 40 31"
      aria-hidden
      className={`royal-crown ${className}`}
    >
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff4c2" />
          <stop offset="0.32" stopColor="#fcd34d" />
          <stop offset="0.66" stopColor="#eab308" />
          <stop offset="1" stopColor="#a16207" />
        </linearGradient>
        <linearGradient id={band} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="0.5" stopColor="#d4a017" />
          <stop offset="1" stopColor="#8a5a0b" />
        </linearGradient>
        <radialGradient id={pearl} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#fef3c7" />
          <stop offset="1" stopColor="#d4a017" />
        </radialGradient>
      </defs>

      {/* Cuerpo de la corona: tres puntas */}
      <path
        d="M5.5 23.5 3.2 10.2l9.6 6.3L20 5.6l7.2 10.9 9.6-6.3-2.3 13.3Z"
        fill={`url(#${gold})`}
        stroke="#7c4a03"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      {/* Brillo en las caras de la izquierda */}
      <path d="M6.7 21.6 5.2 12.6l7.2 4.7" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="1" strokeLinecap="round" />
      <path d="M14.3 15.6 20 7.6" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.9" strokeLinecap="round" />

      {/* Banda con piedras */}
      <rect x="4.6" y="22.2" width="30.8" height="5.6" rx="1.8" fill={`url(#${band})`} stroke="#7c4a03" strokeWidth="1.1" />
      <rect x="6.4" y="23.2" width="27.2" height="1.1" rx="0.55" fill="#fff" fillOpacity="0.45" />
      <circle cx="12.4" cy="25.2" r="1.25" fill="#00a1e0" stroke="#0c4a6e" strokeWidth="0.5" />
      <circle cx="27.6" cy="25.2" r="1.25" fill="#00a1e0" stroke="#0c4a6e" strokeWidth="0.5" />
      <circle cx="20" cy="25.1" r="1.75" fill="#e11d48" stroke="#7f1d1d" strokeWidth="0.55" />
      <circle cx="19.45" cy="24.55" r="0.55" fill="#fff" fillOpacity="0.85" />

      {/* Perlas en las puntas */}
      <circle cx="3.2" cy="9.4" r="2.3" fill={`url(#${pearl})`} stroke="#7c4a03" strokeWidth="0.9" />
      <circle cx="20" cy="4.4" r="2.6" fill={`url(#${pearl})`} stroke="#7c4a03" strokeWidth="0.9" />
      <circle cx="36.8" cy="9.4" r="2.3" fill={`url(#${pearl})`} stroke="#7c4a03" strokeWidth="0.9" />

      {/* Destello */}
      <path
        className="royal-twinkle"
        d="M31.5 0.6c.3 1.6 1 2.3 2.6 2.6-1.6.3-2.3 1-2.6 2.6-.3-1.6-1-2.3-2.6-2.6 1.6-.3 2.3-1 2.6-2.6Z"
        fill="#fffbeb"
        stroke="#f59e0b"
        strokeWidth="0.4"
      />
    </svg>
  );
}
