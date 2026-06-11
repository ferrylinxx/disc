import type { InstrumentDefinition, ScoringResult } from "@/lib/engine/types";
import { resolveEqBand } from "@/lib/narratives/disc-gesem.narratives";
import { intensityLabel, styleShort } from "@/lib/narratives/disc-gesem.catalog";
import {
  buildProfileNarrative,
  contextLeaders,
} from "@/lib/narratives/disc-gesem.profiles";
import { generateInsights } from "@/lib/narratives/disc-gesem.insights";

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

/** Subapartado de "Cuando coordinas personas" (etiqueta + texto). */
function coordRow(label: string, text: string): string {
  return `<p style="margin:0 0 12px;font-size:14px;line-height:1.5;color:#475569;">
    <strong style="color:#0f172a;">${label}.</strong> ${text}</p>`;
}

/**
 * Email con el informe individual "Mapa de Interacción Profesional": tendencia
 * predominante, mapa de recursos, mapa por contextos, cuando coordinas personas,
 * fortalezas, a observar, insights, EQ, experimento y pregunta poderosa.
 */
export function reportEmail(input: {
  participantName: string;
  result: ScoringResult;
  def: InstrumentDefinition;
}): { subject: string; html: string; text: string } {
  const { result, def, participantName } = input;
  const dimColor = (c: string) =>
    def.dimensions.find((d) => d.code === c)?.color ?? "#64748b";
  const narrative = buildProfileNarrative(result);
  const contexts = contextLeaders(result);
  const insights = generateInsights(result);
  const eqBand = resolveEqBand(result.eq);
  const first = participantName.split(" ")[0] || "Hola";

  const bars = result.global
    .map((s) => bar(styleShort(s.dimensionCode), s.percent, dimColor(s.dimensionCode)))
    .join("");
  const contextRows = contexts
    .map(
      (c) =>
        `<tr><td style="padding:4px 8px 4px 0;font-size:13px;font-weight:600;color:#334155;">${c.label}</td>
        <td style="padding:4px 0;"><span style="display:inline-block;background:${dimColor(c.dimensionCode)};color:#fff;font-size:12px;font-weight:700;padding:3px 10px;border-radius:9999px;">${c.resource}</span></td></tr>`,
    )
    .join("");
  const coordHtml = [
    coordRow("Cuando das indicaciones", narrative.coordination.instructions),
    coordRow("Cuando haces seguimiento", narrative.coordination.followup),
    coordRow("Cuando coordinas personas diferentes", narrative.coordination.coordinating),
    coordRow("Cuando aparece un desacuerdo", narrative.coordination.conflict),
    coordRow("Cuando necesitas generar compromiso", narrative.coordination.engagement),
  ].join("");
  const insightsHtml = insights
    .map(
      (t) =>
        `<li style="margin:0 0 10px;padding:12px 14px;background:#fff;border:1px solid #e0e7ff;border-radius:10px;color:#475569;font-size:14px;list-style:none;line-height:1.5;">${t}</li>`,
    )
    .join("");

  const body = `
    <p style="margin:0 0 16px;">Hola ${first}, este es tu Mapa de Interacción Profesional.</p>
    <div style="background:linear-gradient(135deg,${dimColor(result.primaryDimension)},${dimColor(result.secondaryDimension)});color:#fff;border-radius:14px;padding:18px 20px;margin:0 0 20px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;opacity:.85;">Tu tendencia predominante · ${result.profileCode}</div>
      <div style="font-size:22px;font-weight:800;margin-top:4px;">${narrative.title}</div>
      <div style="font-size:13px;opacity:.9;margin-top:6px;">${narrative.intro}</div>
      <div style="font-size:13px;opacity:.9;margin-top:6px;">Intensidad: ${intensityLabel(result.intensity)}.</div>
    </div>
    <h3 style="margin:0 0 8px;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Tu mapa de recursos</h3>
    <table style="width:100%;border-collapse:collapse;margin:0 0 20px;">${bars}</table>
    <h3 style="margin:0 0 8px;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Tu mapa por contextos</h3>
    <table style="width:100%;border-collapse:collapse;margin:0 0 20px;">${contextRows}</table>
    <h3 style="margin:0 0 8px;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Cuando coordinas personas</h3>
    <div style="margin:0 0 18px;">${coordHtml}</div>
    <h3 style="margin:0 0 8px;font-size:14px;color:#15803d;">Lo que puede estar funcionando bien</h3>
    <ul style="margin:0 0 18px;padding:0;">${list(narrative.strengths, "+", "#16a34a")}</ul>
    <h3 style="margin:0 0 8px;font-size:14px;color:#b45309;">Lo que merece la pena observar</h3>
    <ul style="margin:0 0 8px;padding:0;">${list(narrative.observe, "!", "#d97706")}</ul>
    <p style="margin:0 0 18px;font-size:13px;color:#94a3b8;line-height:1.5;">${narrative.complement}</p>
    ${insights.length > 0 ? `<h3 style="margin:0 0 8px;font-size:14px;color:${BRAND};">Insights personalizados</h3><ul style="margin:0 0 18px;padding:0;">${insightsHtml}</ul>` : ""}
    <div style="background:#eef2ff;border-radius:12px;padding:14px 16px;margin:0 0 18px;">
      <strong style="color:#3730a3;">Equilibrio (EQ ${result.eq}): ${eqBand.label}.</strong>
      <span style="color:#475569;">${eqBand.description}</span>
    </div>
    <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:14px 16px;margin:0 0 18px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#7c3aed;font-weight:700;">Tu experimento de esta semana</div>
      <p style="margin:6px 0 0;color:#475569;font-size:14px;line-height:1.5;">${narrative.experiment}</p>
    </div>
    <div style="background:#0f172a;border-radius:12px;padding:16px 18px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;">Una pregunta para ti</div>
      <p style="margin:6px 0 0;color:#fff;font-size:16px;font-weight:600;line-height:1.5;">${narrative.question}</p>
    </div>`;

  return {
    subject: `Tu informe DISC GESEM · ${result.profileCode}`,
    html: shell("Tu Mapa de Interacción Profesional", body),
    text: `Hola ${first}, tu Mapa de Interacción Profesional DISC GESEM es ${result.profileCode} (${narrative.title}). EQ ${result.eq}.`,
  };
}
