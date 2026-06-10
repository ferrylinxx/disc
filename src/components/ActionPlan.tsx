import type { InstrumentDefinition, ScoringResult } from "@/lib/engine/types";
import { DIMENSION_NARRATIVES } from "@/lib/narratives/disc-gesem.narratives";

interface Props {
  result: ScoringResult;
  def: InstrumentDefinition;
}

/**
 * Plan de acción individual: combina las acciones de desarrollo de la
 * dimensión primaria (y secundaria en perfiles combinados) en una lista
 * priorizada y accionable.
 */
export function ActionPlan({ result, def }: Props) {
  const dimName = (code: string) =>
    def.dimensions.find((d) => d.code === code)?.name ?? code;

  const primary = DIMENSION_NARRATIVES[result.primaryDimension];
  const secondary = result.isEq
    ? null
    : DIMENSION_NARRATIVES[result.secondaryDimension];

  const actions = [
    ...(primary?.development ?? []),
    ...(secondary?.development.slice(0, 1) ?? []),
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-white/80 shadow-sm backdrop-blur">
      <div className="bg-brand px-6 py-5 text-white">
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <span>🎯</span> Plan de acción
        </h3>
        <p className="mt-1 text-sm text-white/85">
          Foco de desarrollo a partir de tu perfil{" "}
          {dimName(result.primaryDimension)}
          {!result.isEq && ` + ${dimName(result.secondaryDimension)}`}.
        </p>
      </div>
      <ol className="space-y-3 p-6">
        {actions.map((action, i) => (
          <li
            key={action}
            className="animate-fade-up flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <span className="bg-brand flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md">
              {i + 1}
            </span>
            <span className="pt-1 text-sm leading-relaxed text-slate-700">
              {action}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
