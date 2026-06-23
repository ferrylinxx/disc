import type { Dimension, Intensity } from "@/lib/engine/types";
import {
  STYLE_NAMES,
  PROFILE_CATALOG,
  INTENSITY_LABELS,
  INTENSITY_MESSAGES,
  EQ_MESSAGE,
} from "@/lib/narratives/disc-gesem.catalog";

/** Orden de presentación de los niveles de intensidad. */
const INTENSITY_ORDER: Intensity[] = [
  "FLEXIBLE",
  "MODERADA",
  "DEFINIDA",
  "MUY_DEFINIDA",
];

/**
 * Vista de solo lectura del catálogo oficial DISC GESEM: estilos base, las 12
 * combinaciones + perfil adaptable (EQ) y los mensajes por intensidad. Refleja
 * la nomenclatura única de la plataforma; en producción será editable en BD.
 */
export function CatalogView({ dimensions }: { dimensions: Dimension[] }) {
  const color = new Map(dimensions.map((d) => [d.code, d.color]));
  const dye = (code: string) => color.get(code) ?? "#64748b";
  const combos = Object.entries(PROFILE_CATALOG).filter(([code]) => code !== "EQ");
  const eq = PROFILE_CATALOG.EQ;

  return (
    <>
      <section className="glass animate-fade-up rounded-2xl border border-white/60 p-6">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Estilos base</h2>
        <p className="mb-4 text-sm text-slate-500">
          Nomenclatura oficial de las cuatro dimensiones. Describen tendencias de
          comportamiento, no rasgos fijos.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["D", "I", "S", "C"].map((code) => {
            const s = STYLE_NAMES[code];
            if (!s) return null;
            return (
              <div
                key={code}
                className="rounded-2xl border border-slate-100 bg-white/70 p-4"
                style={{ borderTopColor: dye(code), borderTopWidth: 3 }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
                    style={{ backgroundColor: dye(code) }}
                  >
                    {code}
                  </span>
                  <span className="font-semibold text-slate-900">{s.short}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{s.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="glass animate-fade-up rounded-2xl border border-white/60 p-6">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">
          Combinaciones ({combos.length})
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Resultado de la dimensión primaria y la secundaria. Redactadas como
          tendencias de trabajo.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {combos.map(([code, entry]) => (
            <div
              key={code}
              className="rounded-xl border border-slate-100 bg-white/60 p-4"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-lg bg-slate-900 px-2 py-0.5 text-xs font-bold text-white">
                  {code}
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {entry.name}
                </span>
              </div>
              <p className="text-xs text-slate-500">{entry.summary}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/60 p-4">
          <div className="mb-1 flex items-center gap-2">
            <span className="bg-brand rounded-lg px-2 py-0.5 text-xs font-bold text-white">
              EQ
            </span>
            <span className="text-sm font-semibold text-slate-800">{eq.name}</span>
          </div>
          <p className="text-xs text-slate-600">{eq.summary}</p>
        </div>
      </section>

      <section className="glass animate-fade-up rounded-2xl border border-white/60 p-6">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">
          Mensajes por intensidad
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Texto automático según cuán marcada es la tendencia (no es un juicio de
          valor).
        </p>
        <ul className="space-y-3">
          {INTENSITY_ORDER.map((level) => (
            <li
              key={level}
              className="rounded-xl border border-slate-100 bg-white/60 p-3"
            >
              <div className="text-sm font-semibold text-slate-800">
                {INTENSITY_LABELS[level]}
              </div>
              <p className="mt-0.5 text-sm text-slate-600">
                {INTENSITY_MESSAGES[level]}
              </p>
            </li>
          ))}
          <li className="rounded-xl border border-sky-100 bg-sky-50/60 p-3">
            <div className="text-sm font-semibold text-slate-800">
              Adaptable (EQ)
            </div>
            <p className="mt-0.5 text-sm text-slate-600">{EQ_MESSAGE}</p>
          </li>
        </ul>
      </section>
    </>
  );
}
