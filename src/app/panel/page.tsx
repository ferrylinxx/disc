import Link from "next/link";
import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { getLang } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n/dictionaries";
import { discGrad, discGradStops } from "@/lib/disc-gradient";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export const metadata: Metadata = { title: "Tu espacio · DISC GESEM" };

/** Panel básico del participante: perfil, cuenta y contraseña. */
export default async function PanelPage() {
  const session = await requireAuth();
  const lang = await getLang();
  const t = getDict(lang).panel;

  const participant = await prisma.participant.findFirst({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: {
      fullName: true,
      email: true,
      status: true,
      organization: { select: { name: true } },
      team: { select: { name: true } },
      results: {
        orderBy: { computedAt: "desc" },
        take: 1,
        select: {
          profileCode: true,
          eq: true,
          primaryDimension: { select: { code: true, name: true } },
          secondaryDimension: { select: { code: true, name: true } },
        },
      },
    },
  });

  const result = participant?.results[0] ?? null;
  const name = participant?.fullName ?? session.name ?? session.email;
  const firstName = name.split(" ")[0];
  const statusMap: Record<string, string> = {
    INVITED: t.statusInvited,
    IN_PROGRESS: t.statusInProgress,
    COMPLETED: t.statusCompleted,
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10 sm:py-14">
      <div className="animate-fade-up mb-8">
        <p className="text-sm font-semibold text-sky-600">
          {t.hello}, {firstName}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
          {t.title}
        </h1>
        <p className="mt-2 text-slate-500">{t.subtitle}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Perfil / evaluación */}
        <section className="animate-fade-up glass rounded-3xl border border-white/70 p-6 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
            {t.profileTitle}
          </h2>

          {result ? (
            <>
              <div className="mt-4 flex flex-wrap items-center gap-5">
                <span
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-3xl font-black text-white shadow-lg"
                  style={{ backgroundImage: discGrad(result.primaryDimension.code, 135) }}
                >
                  {result.profileCode}
                </span>
                <div className="grid flex-1 gap-3 sm:grid-cols-3">
                  <Metric
                    label={t.primary}
                    value={result.primaryDimension.name}
                    color={discGradStops(result.primaryDimension.code)[0]}
                  />
                  <Metric
                    label={t.secondary}
                    value={result.secondaryDimension.name}
                    color={discGradStops(result.secondaryDimension.code)[0]}
                  />
                  <Metric label={t.eq} value={String(result.eq)} color="#00a1e0" />
                </div>
              </div>
              <Link
                href="/evaluacion"
                className="bg-brand mt-6 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:-translate-y-0.5"
              >
                {t.viewReport} →
              </Link>
            </>
          ) : (
            <>
              <p className="mt-4 leading-relaxed text-slate-600">{t.profileEmpty}</p>
              <Link
                href="/evaluacion"
                className="bg-brand mt-5 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:-translate-y-0.5"
              >
                {t.startCta} →
              </Link>
            </>
          )}
        </section>

        {/* Cuenta */}
        <section className="animate-fade-up glass rounded-3xl border border-white/70 p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
            {t.accountTitle}
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label={t.name} value={name} />
            <Row label={t.email} value={participant?.email ?? session.email} />
            <Row label={t.organization} value={participant?.organization.name ?? t.none} />
            <Row label={t.team} value={participant?.team?.name ?? t.none} />
            {participant && (
              <Row
                label={t.statusLabel}
                value={statusMap[participant.status] ?? participant.status}
              />
            )}
          </dl>
        </section>
      </div>

      {/* Seguridad */}
      <section className="animate-fade-up glass mt-5 rounded-3xl border border-white/70 p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
          {t.securityTitle}
        </h2>
        <p className="mb-4 mt-1 text-sm text-slate-500">{t.securityHint}</p>
        <ChangePasswordForm
          labels={{
            newPassword: t.newPassword,
            repeatPassword: t.repeatPassword,
            save: t.save,
            saved: t.saved,
          }}
        />
      </section>

      <p className="mt-8 text-center text-xs leading-relaxed text-slate-400">
        {t.notDiagnosis}
      </p>
    </main>
  );
}

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white/60 px-3 py-2">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-bold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right font-semibold text-slate-800">{value}</dd>
    </div>
  );
}
