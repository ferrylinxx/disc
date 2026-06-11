import { requireRole } from "@/lib/auth/dal";
import { getActiveInstrument } from "@/lib/instruments";
import { isMailConfigured } from "@/lib/email/mailer";
import { SmtpCheckButton } from "@/components/dashboard/SmtpCheckButton";

export const metadata = { title: "Sistema · Consola GESEM" };

export default async function AdminSystemPage() {
  await requireRole("SUPERADMIN");
  const def = getActiveInstrument();
  const mailReady = isMailConfigured();
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  return (
    <section className="glass animate-fade-up rounded-2xl border border-white/60 p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Estado del sistema
      </h2>
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            mailReady
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${mailReady ? "bg-emerald-500" : "bg-amber-500"}`}
          />
          SMTP {mailReady ? "configurado" : "sin configurar"}
        </span>
      </div>
      <SmtpCheckButton />
      <dl className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-slate-500">Instrumento activo</dt>
          <dd className="font-medium text-slate-900">
            {def.instrumentName} · v{def.version}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-slate-500">Estructura</dt>
          <dd className="font-medium text-slate-900">
            {def.dimensions.length} dimensiones · {def.contexts.length}{" "}
            contextos · {def.items.length} ítems
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-slate-500">URL de la app</dt>
          <dd className="truncate font-mono text-xs text-slate-600">
            {appUrl}
          </dd>
        </div>
      </dl>
    </section>
  );
}
