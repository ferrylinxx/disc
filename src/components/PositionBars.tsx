"use client";

import { useState } from "react";
import { discGrad } from "@/lib/disc-gradient";
import type { DimensionShare } from "@/lib/engine/types";

type Key = "publico" | "privado" | "percibido";
const KEYS: Key[] = ["publico", "privado", "percibido"];

interface Props {
  readings: Record<Key, DimensionShare[]>;
  labels: Record<Key, string>;
  /** Dimensiones en orden con su nombre de estilo (D · Impulsar, …). */
  dims: { code: string; name: string }[];
  lead: string;
  interp: string;
}

/**
 * Las tres lecturas (yo público / privado / percibido) como gráfico de barras,
 * con un botón para alternar cuál se muestra. Cada lectura usa su color.
 */
export function PositionBars({ readings, labels, dims, lead, interp }: Props) {
  const [sel, setSel] = useState<Key>("percibido");
  const shareOf = (arr: DimensionShare[], code: string) =>
    arr.find((s) => s.dimensionCode === code)?.share ?? 0;

  return (
    <div>
      <p className="text-sm text-slate-500">{lead}</p>

      {/* Botón para alternar la lectura */}
      <div className="mt-3 inline-flex flex-wrap gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
        {KEYS.map((k) => {
          const on = k === sel;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setSel(k)}
              aria-pressed={on}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                on ? "bg-brand text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {labels[k]}
            </button>
          );
        })}
      </div>

      {/* Barras de la lectura seleccionada */}
      <div className="mt-5 space-y-3">
        {dims.map((d) => {
          const v = shareOf(readings[sel], d.code);
          return (
            <div key={d.code} className="flex items-center gap-3">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white shadow-sm"
                style={{ backgroundImage: discGrad(d.code) }}
              >
                {d.code}
              </span>
              <span className="w-24 shrink-0 text-xs font-semibold text-slate-600">
                {d.name}
              </span>
              <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, v))}%`, backgroundImage: discGrad(d.code, 90) }}
                />
              </div>
              <span className="w-9 text-right text-xs font-bold text-slate-700">{v}%</span>
            </div>
          );
        })}
      </div>

      {interp && (
        <p className="mt-5 rounded-xl border border-sky-100 bg-sky-50/50 p-3 text-sm leading-relaxed text-slate-700">
          {interp}
        </p>
      )}
    </div>
  );
}
