import Link from "next/link";
import { requireAuth } from "@/lib/auth/dal";
import { getLang } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n/dictionaries";
import { getActiveInstrument } from "@/lib/instruments";
import { participantReportByToken } from "@/lib/data/dashboard";
import { buildProfileNarrativeDb } from "@/lib/narratives/library";
import { resolveEqBand } from "@/lib/narratives/disc-gesem.narratives";
import { intensityLabel } from "@/lib/narratives/disc-gesem.catalog";
import { discGradStrong, discGradStops } from "@/lib/disc-gradient";
import { panelParticipant } from "@/lib/data/panel";
import { Card, Tile, Blurb } from "@/components/PanelUI";

function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "?";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

/** Resumen del panel: perfil DISC, distribución de recursos y acciones. */
export default async function PanelOverviewPage() {
  const session = await requireAuth();
  const lang = await getLang();
  const t = getDict(lang).panel;

  const participant = await panelParticipant(session.userId);
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
  const narrative = result ? await buildProfileNarrativeDb(result, lang) : null;

  const def = getActiveInstrument(lang);
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
  const eqBand = result ? resolveEqBand(result.eq, lang) : null;

  return (
    <div className="space-y-6">
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
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                {completed && narrative ? narrative.title : t.heroPendingTitle}
              </h2>
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

      {completed && result && narrative && eqBand && (
        <>
          {/* Tiles */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              value={intensityLabel(result.intensity, lang)}
              color="#6f7bf7"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
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
                              backgroundImage: discGradStrong(dim.code, 90),
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
                <p className="text-lg font-bold" style={{ color: primaryColor }}>
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
            </div>
          </div>
        </>
      )}

      <p className="text-center text-xs leading-relaxed text-slate-400">
        {t.notDiagnosis}
      </p>
    </div>
  );
}
