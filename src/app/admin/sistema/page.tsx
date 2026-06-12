import { requireRole } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { getActiveInstrument } from "@/lib/instruments";
import { isMailConfigured } from "@/lib/email/mailer";
import { SmtpCheckButton } from "@/components/dashboard/SmtpCheckButton";
import { Card, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Sistema · Consola GESEM" };

export default async function AdminSystemPage() {
  await requireRole("SUPERADMIN");
  const def = getActiveInstrument();
  const mailReady = isMailConfigured();
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  const [responseSets, results, invitations] = await Promise.all([
    prisma.responseSet.count(),
    prisma.result.count(),
    prisma.invitation.count(),
  ]);

  return (
    <>
      <PageHeader
        title="Sistema"
        description="Estado de los servicios, instrumento activo y volumen de datos."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card
          title="Email (SMTP)"
          description="Envío de invitaciones e informes"
          action={
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
              {mailReady ? "Configurado" : "Sin configurar"}
            </span>
          }
        >
          <p className="mb-4 text-xs text-slate-500">
            El informe nunca se envía automáticamente: lo decide y lo envía el
            administrador desde la ficha del participante.
          </p>
          <SmtpCheckButton />
        </Card>

        <Card title="Instrumento activo" description="Versión publicada del cuestionario">
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Instrumento</dt>
              <dd className="font-semibold text-slate-900">
                {def.instrumentName} · v{def.version}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Estructura</dt>
              <dd className="font-semibold text-slate-900">
                {def.dimensions.length} dimensiones · {def.contexts.length}{" "}
                contextos · {def.items.length} ítems
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">URL de la app</dt>
              <dd className="truncate font-mono text-xs text-slate-600">{appUrl}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card title="Volumen de datos" description="Registros acumulados en la base de datos">
        <dl className="grid gap-4 sm:grid-cols-3">
          {[
            [invitations, "Invitaciones emitidas"],
            [responseSets, "Cuestionarios registrados"],
            [results, "Resultados calculados"],
          ].map(([n, label]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
            >
              <dt className="text-2xl font-bold tracking-tight text-slate-900">
                {n}
              </dt>
              <dd className="mt-0.5 text-xs font-medium text-slate-500">{label}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </>
  );
}
