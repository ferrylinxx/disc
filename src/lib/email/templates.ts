import type { InstrumentDefinition, ScoringResult } from "@/lib/engine/types";
import { resolveEqBand } from "@/lib/narratives/disc-gesem.narratives";
import { intensityLabel, styleShort } from "@/lib/narratives/disc-gesem.catalog";
import {
  buildProfileNarrative,
  contextLeaders,
  type ProfileNarrative,
} from "@/lib/narratives/disc-gesem.profiles";
import { generateInsights } from "@/lib/narratives/disc-gesem.insights";

const BRAND = "#00a1e0";

function shell(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f6f7fb;padding:24px;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#0f172a;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background-color:#00a1e0;background-image:linear-gradient(120deg,#00a1e0,#5ac3dd);padding:24px 28px;color:#ffffff;">
      <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:.85;">DISC GESEM</div>
      <div style="font-size:20px;font-weight:800;margin-top:4px;">${title}</div>
    </div>
    <div style="padding:24px 28px;">${body}</div>
    <div style="padding:16px 28px;border-top:1px solid #f1f5f9;color:#94a3b8;font-size:12px;">
      Cuestionario de estilos conductuales DISC GESEM. Los resultados describen tendencias y no constituyen un diagnóstico.
    </div>
  </div></body></html>`;
}

/**
 * Email de invitación: se ha creado una cuenta para el participante. Incluye
 * las credenciales de acceso (email y, en el alta inicial, la contraseña
 * temporal), el botón para acceder y un enlace para cambiar la contraseña.
 */
export function invitationEmail(input: {
  participantName: string;
  /** URL de acceso (login). */
  loginUrl: string;
  /** URL para establecer/cambiar la contraseña (token de un solo uso). */
  setPasswordUrl: string;
  /** Email de la cuenta (usuario). */
  accountEmail: string;
  /** Contraseña temporal en claro; solo en el alta inicial (no en reenvíos). */
  password?: string;
}): { subject: string; html: string; text: string } {
  const first = input.participantName.split(" ")[0] || "Hola";
  // Valor en "pastilla" monoespaciada: user-select:all permite seleccionarlo de
  // un clic en los clientes que lo soportan (resto: triple clic).
  const val = (v: string) =>
    `<span style="display:inline-block;background:#ffffff;border:1px solid #e2e8f0;border-radius:6px;padding:3px 9px;font-family:Consolas,Menlo,monospace;font-size:14px;font-weight:700;color:#0f172a;-webkit-user-select:all;user-select:all;">${v}</span>`;
  const row = (k: string, v: string) =>
    `<tr>
      <td style="padding:6px 12px 6px 0;font-size:13px;color:#64748b;white-space:nowrap;vertical-align:middle;">${k}</td>
      <td style="padding:6px 0;vertical-align:middle;">${val(v)}</td>
    </tr>`;
  const creds = `
    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${row("Correo:", input.accountEmail)}
      ${input.password ? row("Contraseña:", input.password) : ""}
    </table>`;
  const passwordNote = input.password
    ? `Puedes cambiar esta contraseña cuando quieras con el enlace de abajo.`
    : `Usa tu contraseña actual. Si no la recuerdas, puedes crear una nueva.`;

  const body = `
    <p style="margin:0 0 12px;">Hola ${first},</p>
    <p style="margin:0 0 16px;line-height:1.6;color:#475569;">
      Te invitamos a completar tu cuestionario <strong>DISC GESEM</strong>. Hemos
      creado una cuenta para ti; accede con estos datos para empezar:
    </p>
    <div style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:12px;padding:14px 16px;margin:0 0 8px;">
      ${creds}
    </div>
    <p style="margin:0 0 20px;color:#64748b;font-size:13px;line-height:1.5;">${passwordNote}</p>
    <p style="margin:0 0 12px;">
      <a href="${input.loginUrl}" style="display:inline-block;background-color:${BRAND};color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:9999px;">
        Acceder a mi cuenta
      </a>
    </p>
    <p style="margin:0 0 20px;font-size:14px;">
      <a href="${input.setPasswordUrl}" style="color:${BRAND};font-weight:600;text-decoration:none;">Cambiar mi contraseña →</a>
    </p>
    <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;word-break:break-all;">
      Si los botones no funcionan, copia estos enlaces:<br/>
      Acceso: ${input.loginUrl}<br/>
      Cambiar contraseña: ${input.setPasswordUrl}
    </p>`;
  const textLines = [
    `Hola ${first}, te invitamos a completar tu cuestionario DISC GESEM.`,
    `Correo: ${input.accountEmail}`,
    input.password ? `Contraseña temporal: ${input.password}` : "",
    `Acceder: ${input.loginUrl}`,
    `Cambiar contraseña: ${input.setPasswordUrl}`,
  ].filter(Boolean);
  return {
    subject: "Tu acceso a DISC GESEM",
    html: shell("Tu cuenta DISC GESEM", body),
    text: textLines.join("\n"),
  };
}

function bar(label: string, percent: number, color: string): string {
  const w = Math.max(0, Math.min(100, Math.round(percent)));
  // Barra "bulletproof": tabla anidada con celdas bgcolor (Outlook no pinta
  // divs vacíos con altura fija). Cada celda lleva contenido invisible para
  // forzar su alto en el motor de Word.
  const fill =
    w > 0
      ? `<td width="${w}%" bgcolor="${color}" style="background-color:${color};font-size:1px;line-height:12px;height:12px;border-radius:9999px;">&nbsp;</td>`
      : "";
  const track =
    w < 100
      ? `<td bgcolor="#e2e8f0" style="background-color:#e2e8f0;font-size:1px;line-height:12px;height:12px;border-radius:9999px;">&nbsp;</td>`
      : "";
  return `<tr>
    <td style="padding:4px 8px 4px 0;font-size:13px;font-weight:600;color:#334155;white-space:nowrap;">${label}</td>
    <td style="width:100%;padding:4px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;">
        <tr>${fill}${track}</tr>
      </table>
    </td>
    <td style="padding:4px 0 4px 8px;font-size:13px;font-weight:700;color:#0f172a;">${w}</td>
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
  /** Narrativa precompuesta desde BD; si falta, se compone con valores base. */
  narrative?: ProfileNarrative;
  /** Texto editorial fijo (Biblioteca V1) por apartado; tiene prioridad. */
  blocks?: Partial<Record<string, string>>;
}): { subject: string; html: string; text: string } {
  const { result, def, participantName } = input;
  const b = input.blocks ?? {};
  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const proseHtml = (t: string) =>
    t
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map(
        (p) =>
          `<p style="margin:0 0 12px;font-size:14px;color:#475569;line-height:1.6;">${escapeHtml(p)}</p>`,
      )
      .join("");
  const dimColor = (c: string) =>
    def.dimensions.find((d) => d.code === c)?.color ?? "#64748b";
  const narrative = input.narrative ?? buildProfileNarrative(result);
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
    coordRow("Cuando coordinas personas o proyectos", narrative.coordination.coordinating),
    coordRow("Cuando colaboras con otras personas", narrative.coordination.collaborating),
  ].join("");
  const resourcesHtml = narrative.resources
    .map(
      (r) =>
        `<li style="margin:0 0 10px;list-style:none;"><strong style="color:#0f172a;font-size:14px;">${r.name}.</strong> <span style="color:#475569;font-size:14px;">${r.description}</span></li>`,
    )
    .join("");
  const reflectionHtml = narrative.reflection
    .map(
      (q, i) =>
        `<li style="margin:0 0 10px;color:#fff;font-size:15px;font-weight:600;list-style:none;line-height:1.5;"><span style="color:#94a3b8;">${i + 1}.</span> ${q}</li>`,
    )
    .join("");
  const insightsHtml = insights
    .map(
      (t) =>
        `<li style="margin:0 0 10px;padding:12px 14px;background:#fff;border:1px solid #bae6fd;border-radius:10px;color:#475569;font-size:14px;list-style:none;line-height:1.5;">${t}</li>`,
    )
    .join("");

  const body = `
    <p style="margin:0 0 12px;font-size:13px;color:#64748b;line-height:1.5;">Hola ${first}. Este informe describe los recursos que sueles utilizar con más frecuencia y cómo pueden influir en tu forma de comunicarte, coordinarte y colaborar. Describe tendencias, según tus respuestas, no una clasificación.</p>
    <div style="background-color:${dimColor(result.primaryDimension)};background-image:linear-gradient(135deg,${dimColor(result.primaryDimension)},${dimColor(result.secondaryDimension)});color:#fff;border-radius:14px;padding:18px 20px;margin:0 0 20px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;opacity:.85;">Tu tendencia predominante</div>
      <div style="font-size:24px;font-weight:800;margin-top:4px;">${narrative.resourceHeadline}</div>
      <div style="font-size:14px;font-weight:600;opacity:.95;margin-top:2px;">${narrative.title}</div>
      <div style="font-size:13px;opacity:.9;margin-top:6px;">${narrative.intro}</div>
      <div style="font-size:12px;opacity:.8;margin-top:6px;">Intensidad: ${intensityLabel(result.intensity)} · Código interno: ${narrative.internalCode}</div>
    </div>
    ${b.tendencia ? `<h3 style="margin:0 0 8px;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Tendencia predominante</h3>${proseHtml(b.tendencia)}` : ""}
    <h3 style="margin:0 0 8px;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Recursos predominantes</h3>
    <table style="width:100%;border-collapse:collapse;margin:0 0 14px;">${bars}</table>
    ${b.recursos ? proseHtml(b.recursos) : `<ul style="margin:0 0 20px;padding:0;">${resourcesHtml}</ul>`}
    <h3 style="margin:0 0 8px;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Aportación habitual</h3>
    ${b.aportacion ? proseHtml(b.aportacion) : `<p style="margin:0 0 18px;font-size:14px;color:#475569;line-height:1.5;">${narrative.contribution}</p>`}
    <h3 style="margin:0 0 8px;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Lo que otras personas suelen valorar</h3>
    ${b.valoracion ? proseHtml(b.valoracion) : `<p style="margin:0 0 18px;font-size:14px;color:#475569;line-height:1.5;">${narrative.valued}</p>`}
    <h3 style="margin:0 0 8px;font-size:14px;color:#b45309;">Aspectos que merece la pena observar</h3>
    ${b.observar ? proseHtml(b.observar) : `<ul style="margin:0 0 18px;padding:0;">${list(narrative.observe, "•", "#d97706")}</ul>`}
    <h3 style="margin:0 0 8px;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Coordinación y colaboración</h3>
    ${b.coordinacion ? proseHtml(b.coordinacion) : `<div style="margin:0 0 18px;">${coordHtml}</div><h3 style="margin:0 0 8px;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Comunicación</h3><p style="margin:0 0 18px;font-size:14px;color:#475569;line-height:1.5;">${narrative.communication}</p>`}
    <h3 style="margin:0 0 8px;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Contextos de mejor desempeño</h3>
    ${b.contextos ? proseHtml(b.contextos) : `<p style="margin:0 0 12px;font-size:14px;color:#475569;line-height:1.5;">${narrative.contexts}</p>`}
    <table style="width:100%;border-collapse:collapse;margin:0 0 20px;">${contextRows}</table>
    <h3 style="margin:0 0 8px;font-size:14px;color:${BRAND};">Ampliación de repertorio</h3>
    ${b.ampliacion ? proseHtml(b.ampliacion) : `<p style="margin:0 0 12px;font-size:14px;color:#475569;line-height:1.5;">${narrative.repertoire}</p>${insights.length > 0 ? `<ul style="margin:0 0 18px;padding:0;">${insightsHtml}</ul>` : ""}`}
    <div style="background:#e0f2fe;border-radius:12px;padding:14px 16px;margin:0 0 18px;">
      <strong style="color:#075985;">Equilibrio entre recursos (EQ ${result.eq}): ${eqBand.label}.</strong>
      <span style="color:#475569;">${eqBand.description}</span>
    </div>
    <div style="background:#0f172a;border-radius:12px;padding:16px 18px;margin:0 0 18px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;">Preguntas para la reflexión</div>
      <ul style="margin:10px 0 0;padding:0;">${reflectionHtml}</ul>
    </div>
    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;text-align:center;">El autoconocimiento es el punto de partida. La comprensión mutua es el puente. La adaptación consciente es la competencia. La colaboración eficaz es el resultado.</p>`;

  return {
    subject: `Tu informe DISC GESEM · ${narrative.resourceHeadline}`,
    html: shell("Tu informe DISC GESEM", body),
    text: `Hola ${first}, tu informe DISC GESEM destaca recursos orientados a ${narrative.resourceHeadline} (${narrative.title}). EQ ${result.eq}.`,
  };
}
