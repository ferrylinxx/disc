import type { InstrumentDefinition, ScoringResult } from "@/lib/engine/types";
import {
  DIMENSION_NARRATIVES,
  resolveEqBand,
} from "@/lib/narratives/disc-gesem.narratives";
import {
  intensityLabel,
  intensityMessage,
  resolveProfile,
} from "@/lib/narratives/disc-gesem.catalog";

const BRAND = "#6366f1";

function shell(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f6f7fb;padding:24px;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#0f172a;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:linear-gradient(120deg,#6366f1,#8b5cf6);padding:24px 28px;color:#ffffff;">
      <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:.85;">DISC GESEM</div>
      <div style="font-size:20px;font-weight:800;margin-top:4px;">${title}</div>
    </div>
    <div style="padding:24px 28px;">${body}</div>
    <div style="padding:16px 28px;border-top:1px solid #f1f5f9;color:#94a3b8;font-size:12px;">
      Cuestionario de estilos conductuales DISC GESEM. Los resultados describen tendencias y no constituyen un diagnóstico.
    </div>
  </div></body></html>`;
}

/** Email de invitación a la evaluación. */
export function invitationEmail(input: {
  participantName: string;
  url: string;
}): { subject: string; html: string; text: string } {
  const first = input.participantName.split(" ")[0] || "Hola";
  const body = `
    <p style="margin:0 0 12px;">Hola ${first},</p>
    <p style="margin:0 0 16px;line-height:1.6;color:#475569;">
      Te invitamos a completar tu cuestionario <strong>DISC GESEM</strong>. Solo te
      llevará unos minutos y te ayudará a conocer mejor tu estilo conductual.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${input.url}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:9999px;">
        Empezar el cuestionario
      </a>
    </p>
    <p style="margin:0;color:#94a3b8;font-size:13px;word-break:break-all;">
      Si el botón no funciona, copia este enlace: ${input.url}
    </p>`;
  return {
    subject: "Tu cuestionario DISC GESEM",
    html: shell("Tu evaluación te espera", body),
    text: `Hola ${first}, completa tu cuestionario DISC GESEM aquí: ${input.url}`,
  };
}

function bar(label: string, percent: number, color: string): string {
  const w = Math.max(0, Math.min(100, percent));
  return `<tr>
    <td style="padding:4px 8px 4px 0;font-size:13px;font-weight:600;color:#334155;white-space:nowrap;">${label}</td>
    <td style="width:100%;padding:4px 0;">
      <div style="background:#e2e8f0;border-radius:9999px;height:12px;">
        <div style="background:${color};width:${w}%;height:12px;border-radius:9999px;"></div>
      </div>
    </td>
    <td style="padding:4px 0 4px 8px;font-size:13px;font-weight:700;color:#0f172a;">${Math.round(percent)}</td>
  </tr>`;
}

function list(items: string[], mark: string, color: string): string {
  return items
    .map(
      (s) =>
        `<li style="margin:0 0 6px;color:#475569;font-size:14px;list-style:none;"><span style="color:${color};font-weight:700;">${mark}</span> ${s}</li>`,
    )
    .join("");
}

/** Email con el informe individual del participante. */
export function reportEmail(input: {
  participantName: string;
  result: ScoringResult;
  def: InstrumentDefinition;
}): { subject: string; html: string; text: string } {
  const { result, def, participantName } = input;
  const dimName = (c: string) =>
    def.dimensions.find((d) => d.code === c)?.name ?? c;
  const dimColor = (c: string) =>
    def.dimensions.find((d) => d.code === c)?.color ?? "#64748b";
  const primary = DIMENSION_NARRATIVES[result.primaryDimension];
  const secondary = result.isEq
    ? null
    : DIMENSION_NARRATIVES[result.secondaryDimension];
  const eqBand = resolveEqBand(result.eq);
  const profile = resolveProfile(result.profileCode);
  const first = participantName.split(" ")[0] || "Hola";

  const bars = result.global
    .map((s) => bar(dimName(s.dimensionCode), s.percent, dimColor(s.dimensionCode)))
    .join("");
  const actions = [
    ...(primary?.development ?? []),
    ...(secondary?.development.slice(0, 1) ?? []),
  ];

  const body = `
    <p style="margin:0 0 16px;">Hola ${first}, este es tu informe DISC GESEM.</p>
    <div style="background:linear-gradient(135deg,${dimColor(result.primaryDimension)},${dimColor(result.secondaryDimension)});color:#fff;border-radius:14px;padding:18px 20px;margin:0 0 20px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;opacity:.85;">Tu perfil · ${result.profileCode}</div>
      <div style="font-size:22px;font-weight:800;margin-top:4px;">${profile.name}</div>
      <div style="font-size:13px;opacity:.9;margin-top:6px;">Intensidad: ${intensityLabel(result.intensity)}. ${intensityMessage(result.intensity)}</div>
    </div>
    <h3 style="margin:0 0 8px;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Perfil global</h3>
    <table style="width:100%;border-collapse:collapse;margin:0 0 20px;">${bars}</table>
    <h3 style="margin:0 0 8px;font-size:14px;color:#15803d;">Fortalezas</h3>
    <ul style="margin:0 0 18px;padding:0;">${list(primary?.strengths ?? [], "+", "#16a34a")}</ul>
    <h3 style="margin:0 0 8px;font-size:14px;color:#b45309;">Puntos de atención</h3>
    <ul style="margin:0 0 18px;padding:0;">${list(primary?.watchouts ?? [], "!", "#d97706")}</ul>
    <div style="background:#eef2ff;border-radius:12px;padding:14px 16px;margin:0 0 18px;">
      <strong style="color:#3730a3;">Equilibrio (EQ ${result.eq}): ${eqBand.label}.</strong>
      <span style="color:#475569;">${eqBand.description}</span>
    </div>
    <h3 style="margin:0 0 8px;font-size:14px;color:${BRAND};">Plan de acción</h3>
    <ol style="margin:0;padding-left:18px;color:#475569;font-size:14px;">
      ${actions.map((a) => `<li style="margin:0 0 6px;">${a}</li>`).join("")}
    </ol>`;

  return {
    subject: `Tu informe DISC GESEM · ${result.profileCode}`,
    html: shell("Tu informe personalizado", body),
    text: `Hola ${first}, tu perfil DISC GESEM es ${result.profileCode} (${dimName(result.primaryDimension)}). EQ ${result.eq}.`,
  };
}
