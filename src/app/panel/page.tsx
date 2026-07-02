import Link from "next/link";
import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { getLang } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n/dictionaries";
import { getActiveInstrument } from "@/lib/instruments";
import { participantReportByToken } from "@/lib/data/dashboard";
import { buildProfileNarrativeDb } from "@/lib/narratives/library";
import { resolveEqBand } from "@/lib/narratives/disc-gesem.narratives";
import { intensityLabel } from "@/lib/narratives/disc-gesem.catalog";
import { discGrad, discGradStops } from "@/lib/disc-gradient";
import { logout } from "@/app/actions/auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { EditNameForm, DeleteAccount } from "@/components/PanelClient";

export const metadata: Metadata = { title: "Tu espacio · DISC GESEM" };

function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "?";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

/** Panel del participante: perfil DISC, distribución, cuenta y seguridad. */
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
      invitations: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { token: true },
      },
      results: {
        orderBy: { computedAt: "desc" },
        take: 1,
        select: { computedAt: true },
      },
    },
  });

  const name = participant?.fullName ?? session.name ?? session.email;
  const token = participant?.invitations[0]?.token;
  const completed = participant?.status === "COMPLETED" && Boolean(token);
  const completedOn = participant?.results[0]?.computedAt;
  const completedOnStr = completedOn
    ? completedOn.toLocaleDateString(lang === "ca" ? "ca-ES" : "es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  const rich = completed && token ? await participantReportByToken(token) : null;
  const result = rich?.result ?? null;
  const narrative = result ? await buildProfileNarrativeDb(result) : null;

  const def = getActiveInstrument();
  const dimByCode = new Map(def.dimensions.map((d) => [d.code, d]));
  const orderedDims = [...def.dimensions].sort((a, b) => a.order - b.order);
  const shareByCode = new Map(
    (result?.percentages ?? []).map((p) => [p.dimensionCode, p.share]),
  );

  const primaryColor = result
    ? (dimByCode.get(result.primaryDimension)?.color ?? "#00a1e0")
    : "#00a1e0";
  const secondaryColor = result
    ? (dimByCode.get(result.secondaryDimension)?.color ?? "#5ac3dd")
    : "#5ac3dd";
  const eqBand = result ? resolveEqBand(result.eq) : null;

  const accountRows = [
    { label: t.name, value: name },
    { label: t.email, value: participant?.email ?? session.email },
    { label: t.organization, value: participant?.organization.name ?? t.none },
    { label: t.team, value: participant?.team?.name ?? t.none },
  ];

  const accountCard = (
    <Card title={t.accountTitle}>
      <dl className="space-y-3 text-sm">
        {accountRows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3">
            <dt className="text-slate-400">{r.label}</dt>
            <dd className="truncate text-right font-semibold text-slate-800">
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
          {t.editName}
        </p>
        <EditNameForm
          defaultName={name}
          labels={{
            placeholder: t.namePlaceholder,
            save: t.saveName,
            saved: t.nameSaved,
          }}
        />
      </div>
    </Card>
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:py-14">
      {/* Barra: idioma + cerrar sesión */}
      <div className="animate-fade-up mb-4 flex items-center justify-end gap-2">
        <LanguageSwitcher lang={lang} />
        <form action={logout}>
          <button
            type="submit"
            className="rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            {t.logout}
          </button>
        </form>
      </div>

      {/* Hero */}
      <section
        className="animate-fade-up relative overflow-hidden rounded-3xl p-7 text-white shadow-xl sm:p-9"
        style={{
          backgroundImage: completed
            ? `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
            : "linear-gradient(135deg, #00a1e0, #5ac3dd)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl font-black backdrop-blur">
              {initials(name)}
            </span>
            <div>
              <p className="text-sm font-medium text-white/80">
                {t.hello}, {name.split(" ")[0]}
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                {completed && narrative ? narrative.title : t.heroPendingTitle}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                {participant?.organization.name && (
                  <span className="rounded-full bg-white/15 px-3 py-1 font-semibold backdrop-blur">
                    {participant.organization.name}
                  </span>
                )}
                {participant?.team?.name && (
                  <span className="rounded-full bg-white/15 px-3 py-1 font-semibold backdrop-blur">
                    {participant.team.name}
                  </span>
                )}
                {completed && (
                  <span className="rounded-full bg-white/25 px-3 py-1 font-semibold backdrop-blur">
                    ✓ {t.completedBadge}
                    {completedOnStr ? ` · ${t.completedOn} ${completedOnStr}` : ""}
                  </span>
                )}
              </div>
            </div>
          </div>

          {completed && result ? (
            <div className="flex items-center gap-5">
              <div className="text-right">
                <div className="text-4xl font-black leading-none">
                  {result.profileCode}
                </div>
                <div className="mt-1 text-xs font-medium text-white/75">
                  {t.profileTitle}
                </div>
              </div>
              <div className="h-12 w-px bg-white/25" />
              <div className="text-right">
                <div className="text-4xl font-black leading-none">{result.eq}</div>
                <div className="mt-1 text-xs font-medium text-white/75">EQ</div>
              </div>
            </div>
          ) : (
            <Link
              href="/evaluacion"
              className="rounded-full bg-white px-6 py-3 text-sm font-bold text-sky-700 shadow-lg transition hover:-translate-y-0.5"
            >
              {t.startCta} →
            </Link>
          )}
        </div>
        {!completed && (
          <p className="relative mt-4 max-w-md text-sm text-white/85">
            {t.heroPendingSubtitle}
          </p>
        )}
      </section>

      {completed && result && narrative && eqBand ? (
        <>
          {/* Tiles */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Tile
              label={t.primary}
              value={dimByCode.get(result.primaryDimension)?.name ?? result.primaryDimension}
              color={discGradStops(result.primaryDimension)[0]}
            />
            <Tile
              label={t.secondary}
              value={dimByCode.get(result.secondaryDimension)?.name ?? result.secondaryDimension}
              color={discGradStops(result.secondaryDimension)[0]}
            />
            <Tile label={t.eqTitle} value={eqBand.label} color="#00a1e0" sub={`EQ ${result.eq}`} />
            <Tile
              label={t.intensityLabel}
              value={intensityLabel(result.intensity)}
              color="#6f7bf7"
            />
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              {/* Distribución de recursos */}
              <Card title={t.distributionTitle} hint={t.distributionHint}>
                <div className="space-y-3.5">
                  {orderedDims.map((dim) => {
                    const share = Math.round(shareByCode.get(dim.code) ?? 0);
                    return (
                      <div key={dim.code}>
                        <div className="mb-1.5 flex items-center gap-2.5">
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-black text-white"
                            style={{ backgroundColor: dim.color }}
                          >
                            {dim.code}
                          </span>
                          <span className="flex-1 text-sm font-medium text-slate-600">
                            {dim.name}
                          </span>
                          <span className="text-sm font-bold text-slate-700">
                            {share}%
                          </span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${share}%`,
                              backgroundImage: discGrad(dim.code, 90),
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Resumen narrativo */}
              <Card title={t.summaryTitle}>
                <p
                  className="text-lg font-bold"
                  style={{ color: primaryColor }}
                >
                  {narrative.resourceHeadline}
                </p>
                <p className="mt-2 leading-relaxed text-slate-600">
                  {narrative.intro}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Blurb label={t.contributionLabel} text={narrative.contribution} />
                  <Blurb label={t.valuedLabel} text={narrative.valued} />
                </div>
              </Card>
            </div>

            <div className="space-y-5">
              {/* EQ */}
              <Card title={t.eqTitle} hint={t.eqHint}>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black tracking-tight text-slate-900">
                    {result.eq}
                  </span>
                  <span className="mb-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700">
                    {eqBand.label}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {eqBand.description}
                </p>
              </Card>

              {/* Acciones */}
              <Card title={t.actionsTitle}>
                <div className="space-y-2">
                  <Link
                    href="/evaluacion"
                    className="bg-brand flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:-translate-y-0.5"
                  >
                    {t.viewReport} →
                  </Link>
                  <Link
                    href="/evaluacion?print=1"
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    ↓ {t.downloadPdf}
                  </Link>
                </div>
              </Card>

              {/* Cuenta */}
              {accountCard}
            </div>
          </div>
        </>
      ) : (
        // Sin completar: solo cuenta
        <div className="mt-6 grid gap-5 lg:grid-cols-2">{accountCard}</div>
      )}

      {/* Seguridad */}
      <div className="mt-5">
        <Card title={t.securityTitle} hint={t.securityHint}>
          <ChangePasswordForm
            labels={{
              newPassword: t.newPassword,
              repeatPassword: t.repeatPassword,
              save: t.save,
              saved: t.saved,
            }}
          />
        </Card>
      </div>

      {/* Privacidad (RGPD) */}
      <div className="mt-5">
        <Card title={t.privacyTitle} hint={t.privacyHint}>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/api/mis-datos"
              download
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              ↓ {t.downloadData}
            </a>
            <DeleteAccount
              labels={{
                button: t.deleteButton,
                confirmPlaceholder: t.deleteConfirmPlaceholder,
                confirmWord: "ELIMINAR",
                cancel: t.deleteCancel,
                warning: t.deleteWarning,
              }}
            />
          </div>
        </Card>
      </div>

      <p className="mt-8 text-center text-xs leading-relaxed text-slate-400">
        {t.notDiagnosis}
      </p>
    </main>
  );
}

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="animate-fade-up rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/40">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
        {title}
      </h2>
      {hint && <p className="mb-3 mt-0.5 text-xs text-slate-400">{hint}</p>}
      <div className={hint ? "" : "mt-4"}>{children}</div>
    </section>
  );
}

function Tile({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: string;
  color: string;
  sub?: string;
}) {
  return (
    <div className="animate-scale-in rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-lg font-bold leading-tight" style={{ color }}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

function Blurb({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <p className="text-sm leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}
