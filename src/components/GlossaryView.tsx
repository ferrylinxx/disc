import { discGradStops } from "@/lib/disc-gradient";
import type { Glossary } from "@/lib/glossary";

/** Render presentacional del glosario (recibe los datos ya resueltos). */
export function GlossaryView({ data }: { data: Glossary }) {
  return (
    <div className="space-y-5">
      {data.intro && (
        <p className="text-sm leading-relaxed text-slate-500">{data.intro}</p>
      )}

      {data.groups.map((group) => (
        <section
          key={group.title}
          className="animate-fade-up rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/40"
        >
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">
            {group.title}
          </h2>
          <dl className="divide-y divide-slate-100">
            {group.entries.map((e) => (
              <div key={e.term} className="py-3 first:pt-0 last:pb-0">
                <dt className="flex items-center gap-2 font-semibold text-slate-900">
                  {e.code && (
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-black text-white"
                      style={{ backgroundColor: discGradStops(e.code)[0] }}
                    >
                      {e.code}
                    </span>
                  )}
                  {e.term}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-slate-600">
                  {e.def}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
