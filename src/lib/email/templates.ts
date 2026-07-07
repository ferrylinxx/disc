import type { InstrumentDefinition, ScoringResult } from "@/lib/engine/types";
import { resolveEqBand } from "@/lib/narratives/disc-gesem.narratives";
import { intensityLabel } from "@/lib/narratives/disc-gesem.catalog";
import {
  buildProfileNarrative,
  type ProfileNarrative,
} from "@/lib/narratives/disc-gesem.profiles";
import type { Lang } from "@/lib/i18n/dictionaries";

const BRAND = "#00a1e0";

/** Formatea una fecha ISO (YYYY-MM-DD) a texto legible; si no es ISO, la devuelve tal cual. */
function fmtDate(value: string | null | undefined, lang: Lang): string {
  const v = (value ?? "").trim();
  if (!v) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v + "T00:00:00");
  if (Number.isNaN(d.getTime())) return v;
  return new Intl.DateTimeFormat(lang === "ca" ? "ca-ES" : "es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * Sustituye variables {{nombre}}, {{email}}, {{programa}}, {{organizacion}}… por
 * los datos reales del participante. Las desconocidas o vacías se dejan tal cual.
 */
function fillVars(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{\s*([a-zA-Z_]+)\s*\}\}/g, (m, key: string) => {
    const v = vars[key.toLowerCase()];
    return v !== undefined && v !== "" ? v : m;
  });
}

/**
 * Markdown mínimo → HTML para el cuerpo del correo (negrita, cursiva, enlaces,
 * listas). Los saltos de línea simples se tratan como espacios (unen líneas
 * envueltas); solo una línea en blanco separa párrafos. Agrupa listas y
 * párrafos aunque estén mezclados sin línea en blanco entre medias.
 */
function mdToHtml(src: string): string {
  const inline = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/_([^_]+)_/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" style="color:#00a1e0;">$1</a>');
  const isItem = (l: string) => /^\s*[-*]\s+/.test(l);
  const out: string[] = [];
  for (const block of src.replace(/\r\n/g, "\n").trim().split(/\n\s*\n/)) {
    const lines = block.split("\n");
    let i = 0;
    while (i < lines.length) {
      if (isItem(lines[i])) {
        const items: string[] = [];
        while (i < lines.length && isItem(lines[i])) {
          items.push(
            `<li style="margin:0 0 4px;">${inline(lines[i].replace(/^\s*[-*]\s+/, "").trim())}</li>`,
          );
          i++;
        }
        out.push(
          `<ul style="margin:0 0 12px;padding-left:18px;color:#475569;font-size:14px;line-height:1.6;">${items.join("")}</ul>`,
        );
      } else {
        const para: string[] = [];
        while (i < lines.length && !isItem(lines[i])) {
          const t = lines[i].trim();
          if (t) para.push(t);
          i++;
        }
        if (para.length) {
          const text = inline(para.join(" ")).replace(/[ \t]{2,}/g, " ");
          out.push(`<p style="margin:0 0 12px;line-height:1.6;color:#475569;">${text}</p>`);
        }
      }
    }
  }
  return out.join("");
}

/**
 * Marco del correo: banda blanca con el logo (PNG hospedado), franja de marca
 * con el título, cuerpo y pie con el aviso legal. Maquetado con tablas para que
 * Outlook lo centre y limite bien el ancho.
 */
function shell(title: string, body: string, lang: Lang = "es"): string {
  const appUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(
    /\/+$/,
    "",
  );
  const footer =
    lang === "ca"
      ? "Qüestionari d'estils conductuals DISC GESEM. Els resultats descriuen tendències i no constitueixen un diagnòstic."
      : "Cuestionario de estilos conductuales DISC GESEM. Los resultados describen tendencias y no constituyen un diagnóstico.";
  return `<!doctype html><html><body style="margin:0;background:#eef1f7;padding:30px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#0f172a;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f7;"><tr><td align="center" style="padding:0 16px;">
    <table role="presentation" width="700" cellpadding="0" cellspacing="0" style="width:100%;max-width:700px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e6eaf1;box-shadow:0 12px 34px rgba(15,23,42,0.07);">
      <tr><td style="padding:24px 36px 20px;background:#ffffff;border-bottom:1px solid #f1f5f9;">
        <img src="${appUrl}/brand/gesem-logo-email.png" alt="GESEM DISC" width="130" style="display:block;border:0;height:auto;width:130px;" />
      </td></tr>
      <tr><td style="background-color:#00a1e0;background-image:linear-gradient(125deg,#0092ce 0%,#00a1e0 48%,#59c2dc 100%);padding:26px 36px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.82);">GESEM</div>
        <div style="font-size:22px;font-weight:800;line-height:1.3;color:#ffffff;margin-top:5px;">${title}</div>
      </td></tr>
      <tr><td style="padding:28px 36px 30px;">${body}</td></tr>
      <tr><td style="padding:22px 36px 26px;background:#f8fafc;border-top:1px solid #eef2f7;">
        <div style="color:#94a3b8;font-size:12px;line-height:1.6;">${footer}</div>
      </td></tr>
    </table>
    <div style="max-width:700px;margin:16px auto 0;color:#aeb8c7;font-size:11px;text-align:center;letter-spacing:.3px;">DISC GESEM · Cuestionario de estilos conductuales</div>
  </td></tr></table>
  </body></html>`;
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
  /** Idioma del correo (catalán por defecto). */
  lang?: Lang;
  /** Modo "cuenta" (creación de usuario): sin el onboarding del cuestionario. */
  account?: boolean;
  /** Personalización por organización (opcional): programa, taller, fecha límite y bienvenida. */
  program?: {
    name?: string | null;
    /** Asunto personalizado (admite variables); si vacío, se usa el asunto por defecto del programa. */
    subject?: string | null;
    /** Fecha del taller en ISO (YYYY-MM-DD). */
    sessionDate?: string | null;
    /** Lugar del taller. */
    sessionInfo?: string | null;
    /** Fecha límite en ISO (YYYY-MM-DD). */
    deadline?: string | null;
    /** Mensaje de bienvenida (admite markdown y variables {{nombre}}, {{email}}…). */
    welcomeIntro?: string | null;
    /** Nombre de la organización (para la variable {{organizacion}}). */
    orgName?: string | null;
  };
}): { subject: string; html: string; text: string } {
  const lang = input.lang ?? "ca";
  const account = input.account ?? false;
  const first = input.participantName.split(" ")[0] || "";
  const ca = lang === "ca";
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const prog = input.program;
  const programName = prog?.name?.trim() || "";
  const hasProgram = programName.length > 0;
  // Variables sustituibles en el mensaje de bienvenida ({{nombre}}, {{email}}…).
  const fullName = input.participantName.trim();
  const vars: Record<string, string> = {
    nombre: first,
    name: first,
    nombre_completo: fullName,
    nombrecompleto: fullName,
    fullname: fullName,
    email: input.accountEmail,
    correo: input.accountEmail,
    programa: programName,
    program: programName,
    organizacion: prog?.orgName?.trim() ?? "",
    org: prog?.orgName?.trim() ?? "",
  };

  const T = ca
    ? {
        subject: "El teu accés a DISC GESEM",
        shellTitle: "El teu compte DISC GESEM",
        hello: first ? `Hola ${first},` : "Hola,",
        intro:
          "Et convidem a completar el teu qüestionari <strong>DISC GESEM</strong>. Hem creat un compte per a tu; accedeix amb aquestes dades per començar:",
        introAccount:
          "S'ha creat el teu compte a <strong>DISC GESEM</strong>. Accedeix amb aquestes dades:",
        correo: "Correu:",
        pwd: "Contrasenya:",
        pwWith: "Pots canviar aquesta contrasenya quan vulguis amb l'enllaç de sota.",
        pwWithout: "Fes servir la teva contrasenya actual. Si no la recordes, pots crear-ne una de nova.",
        loginBtn: "Accedir al meu compte",
        onboardingTitle: "Abans de començar",
        onboarding: [
          "És un qüestionari d'estils conductuals (DISC): no hi ha respostes correctes ni incorrectes.",
          "Durada: uns 10–15 minuts, millor d'una tirada i sense interrupcions.",
          "Confidencial: els teus resultats només els veu el teu facilitador/a.",
          "Respon amb sinceritat, pensant en com ets habitualment.",
          "En acabar veuràs el teu perfil; el treballareu a la sessió.",
        ],
        expiry: "Aquest accés caduca d'aquí a 30 dies.",
        changePwd: "Canviar la meva contrasenya →",
        fallback: "Si els botons no funcionen, copia aquests enllaços:",
        fAccess: "Accés:",
        fChange: "Canviar contrasenya:",
        tPwd: "Contrasenya temporal:",
      }
    : {
        subject: "Tu acceso a DISC GESEM",
        shellTitle: "Tu cuenta DISC GESEM",
        hello: first ? `Hola ${first},` : "Hola,",
        intro:
          "Te invitamos a completar tu cuestionario <strong>DISC GESEM</strong>. Hemos creado una cuenta para ti; accede con estos datos para empezar:",
        introAccount:
          "Se ha creado tu cuenta en <strong>DISC GESEM</strong>. Accede con estos datos:",
        correo: "Correo:",
        pwd: "Contraseña:",
        pwWith: "Puedes cambiar esta contraseña cuando quieras con el enlace de abajo.",
        pwWithout: "Usa tu contraseña actual. Si no la recuerdas, puedes crear una nueva.",
        loginBtn: "Acceder a mi cuenta",
        onboardingTitle: "Antes de empezar",
        onboarding: [
          "Es un cuestionario de estilos conductuales (DISC): no hay respuestas correctas ni incorrectas.",
          "Duración: unos 10–15 minutos, mejor de una vez y sin interrupciones.",
          "Confidencial: tus resultados solo los ve tu facilitador/a.",
          "Responde con sinceridad, pensando en cómo eres habitualmente.",
          "Al terminar verás tu perfil; lo trabajaréis en la sesión.",
        ],
        expiry: "Este acceso caduca dentro de 30 días.",
        changePwd: "Cambiar mi contraseña →",
        fallback: "Si los botones no funcionan, copia estos enlaces:",
        fAccess: "Acceso:",
        fChange: "Cambiar contraseña:",
        tPwd: "Contraseña temporal:",
      };

  // Asunto: personalizado (con variables) si se indica; si no, el del programa; si no, el genérico.
  const customSubject = prog?.subject?.trim();
  const subject = customSubject
    ? fillVars(customSubject, vars)
    : hasProgram
      ? ca
        ? `Benvingut/da al procés ${programName}`
        : `Bienvenido/a al proceso ${programName}`
      : T.subject;
  const W = ca
    ? {
        lead: (n: string) => `Et donem la benvinguda al procés <strong>${n}</strong>.`,
        reflective:
          "Més que respondre un qüestionari, regala't uns minuts per conèixer-te millor i arribar a la sessió amb una mirada més conscient sobre la teva manera de col·laborar.",
        lProgram: "Programa",
        lSession: "Taller",
        lDeadline: "Data límit",
      }
    : {
        lead: (n: string) => `Te damos la bienvenida al proceso <strong>${n}</strong>.`,
        reflective:
          "Más que responder un cuestionario, regálate unos minutos para conocerte mejor y llegar a la sesión con una mirada más consciente sobre tu forma de colaborar.",
        lProgram: "Programa",
        lSession: "Taller",
        lDeadline: "Fecha límite",
      };
  const sessionDateFmt = fmtDate(prog?.sessionDate, lang);
  const location = prog?.sessionInfo?.trim() ? esc(prog.sessionInfo.trim()) : "";
  const deadlineFmt = fmtDate(prog?.deadline, lang);
  const sessionCell = [sessionDateFmt, location].filter(Boolean).join(" · ");
  const infoRow = (k: string, v: string) =>
    `<tr>
      <td style="padding:5px 14px 5px 0;font-size:12px;color:#64748b;white-space:nowrap;vertical-align:top;">${k}</td>
      <td style="padding:5px 0;font-size:14px;color:#0f172a;font-weight:600;vertical-align:top;">${v}</td>
    </tr>`;
  const infoRows = [
    infoRow(W.lProgram, esc(programName)),
    sessionCell ? infoRow(W.lSession, sessionCell) : "",
    deadlineFmt ? infoRow(W.lDeadline, deadlineFmt) : "",
  ].join("");
  const programBlock = hasProgram
    ? `
    <p style="margin:0 0 14px;line-height:1.6;color:#334155;font-size:15px;">${W.lead(esc(programName))}</p>
    <div style="background:#f2f9ff;border:1px solid #d6ebfb;border-radius:16px;padding:16px 20px;margin:0 0 18px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;">${infoRows}</table>
    </div>
    <div style="margin:0 0 4px;">${mdToHtml(fillVars(prog?.welcomeIntro?.trim() || W.reflective, vars))}</div>`
    : "";

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
      ${row(T.correo, input.accountEmail)}
      ${input.password ? row(T.pwd, input.password) : ""}
    </table>`;
  const onboarding = T.onboarding
    .map(
      (x) =>
        `<tr><td style="padding:0 10px 9px 0;vertical-align:top;color:#00a1e0;font-weight:800;font-size:13px;line-height:1.5;">&#10003;</td><td style="padding:0 0 9px;color:#475569;font-size:13px;line-height:1.55;">${x}</td></tr>`,
    )
    .join("");

  const onboardingBlock = account
    ? ""
    : `
    <div style="background:#f2f9ff;border:1px solid #d6ebfb;border-radius:16px;padding:16px 20px;margin:0 0 12px;">
      <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:#0284c7;margin:0 0 12px;">${T.onboardingTitle}</div>
      <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${onboarding}</table>
    </div>
    <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;text-align:center;">${T.expiry}</p>`;

  const divider = `<div style="height:1px;background:#eef2f7;margin:22px 0;"></div>`;
  const button = `<a href="${input.loginUrl}" style="display:inline-block;background-color:${BRAND};background-image:linear-gradient(120deg,#00a1e0,#37b4e2);color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 34px;border-radius:9999px;box-shadow:0 8px 18px rgba(0,161,224,0.30);">${T.loginBtn} &rarr;</a>`;
  const body = `
    <p style="margin:0 0 18px;font-size:17px;font-weight:600;color:#0f172a;">${T.hello}</p>
    ${programBlock}
    ${hasProgram ? divider : ""}
    <p style="margin:0 0 16px;line-height:1.6;color:#475569;">${account ? T.introAccount : T.intro}</p>
    <div style="border:1px solid #e6eef7;border-radius:16px;padding:18px 20px;margin:0 0 20px;background:#f9fcff;">
      ${creds}
      <p style="margin:14px 0 0;color:#64748b;font-size:13px;line-height:1.5;">${input.password ? T.pwWith : T.pwWithout}</p>
    </div>
    <div style="text-align:center;margin:0 0 24px;">${button}</div>
    ${onboardingBlock}
    <p style="margin:16px 0 20px;font-size:14px;text-align:center;">
      <a href="${input.setPasswordUrl}" style="color:${BRAND};font-weight:600;text-decoration:none;">${T.changePwd}</a>
    </p>
    <div style="border-top:1px solid #f1f5f9;padding-top:16px;">
      <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.7;word-break:break-all;">
        ${T.fallback}<br/>
        ${T.fAccess} ${input.loginUrl}<br/>
        ${T.fChange} ${input.setPasswordUrl}
      </p>
    </div>`;
  const sessionText = [sessionDateFmt, prog?.sessionInfo?.trim()].filter(Boolean).join(" · ");
  const textLines = [
    T.hello,
    hasProgram
      ? ca
        ? `Benvingut/da al procés ${programName}.`
        : `Bienvenido/a al proceso ${programName}.`
      : "",
    hasProgram && sessionText ? `${W.lSession}: ${sessionText}` : "",
    deadlineFmt ? `${W.lDeadline}: ${deadlineFmt}` : "",
    hasProgram && prog?.welcomeIntro?.trim() ? fillVars(prog.welcomeIntro.trim(), vars) : "",
    T.intro.replace(/<[^>]+>/g, ""),
    `${T.correo} ${input.accountEmail}`,
    input.password ? `${T.tPwd} ${input.password}` : "",
    `${T.fAccess} ${input.loginUrl}`,
    `${T.fChange} ${input.setPasswordUrl}`,
  ].filter(Boolean);
  return {
    subject,
    html: shell(T.shellTitle, body, lang),
    text: textLines.join("\n"),
  };
}

/**
 * Email de restablecimiento de contraseña (autoservicio). Enlace de un solo uso
 * a /restablecer. Bilingüe (catalán por defecto).
 */
export function passwordResetEmail(input: {
  name: string;
  resetUrl: string;
  lang?: Lang;
}): { subject: string; html: string; text: string } {
  const lang = input.lang ?? "ca";
  const first = input.name.split(" ")[0] || "";
  const ca = lang === "ca";
  const T = ca
    ? {
        subject: "Restableix la teva contrasenya · DISC GESEM",
        shellTitle: "Restablir la contrasenya",
        hello: first ? `Hola ${first},` : "Hola,",
        intro:
          "Has demanat restablir la contrasenya del teu compte <strong>DISC GESEM</strong>. Fes clic per crear-ne una de nova:",
        btn: "Restablir la contrasenya",
        expire: "L'enllaç caduca d'aquí a 14 dies.",
        ignore: "Si no ho has demanat tu, pots ignorar aquest correu.",
        fallback: "Si el botó no funciona, copia aquest enllaç:",
      }
    : {
        subject: "Restablece tu contraseña · DISC GESEM",
        shellTitle: "Restablecer la contraseña",
        hello: first ? `Hola ${first},` : "Hola,",
        intro:
          "Has solicitado restablecer la contraseña de tu cuenta <strong>DISC GESEM</strong>. Haz clic para crear una nueva:",
        btn: "Restablecer la contraseña",
        expire: "El enlace caduca dentro de 14 días.",
        ignore: "Si no lo has solicitado tú, puedes ignorar este correo.",
        fallback: "Si el botón no funciona, copia este enlace:",
      };
  const body = `
    <p style="margin:0 0 12px;">${T.hello}</p>
    <p style="margin:0 0 20px;line-height:1.6;color:#475569;">${T.intro}</p>
    <p style="margin:0 0 18px;">
      <a href="${input.resetUrl}" style="display:inline-block;background-color:${BRAND};color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:9999px;">${T.btn}</a>
    </p>
    <p style="margin:0 0 18px;color:#94a3b8;font-size:12px;">${T.expire} ${T.ignore}</p>
    <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;word-break:break-all;">${T.fallback}<br/>${input.resetUrl}</p>`;
  return {
    subject: T.subject,
    html: shell(T.shellTitle, body, lang),
    text: `${T.hello} ${T.intro.replace(/<[^>]+>/g, "")}\n${input.resetUrl}`,
  };
}

/**
 * Email del informe (versión corta): resumen de la tendencia + EQ, cómo leer el
 * informe, preparación para la sesión y enlace para ver el informe completo
 * online. Evita volcar toda la narrativa (que se lee en la web).
 */
export function reportEmail(input: {
  participantName: string;
  result: ScoringResult;
  def: InstrumentDefinition;
  /** Narrativa precompuesta desde BD; si falta, se compone con valores base. */
  narrative?: ProfileNarrative;
  /** Aceptado por compatibilidad; el correo (versión corta) no lo usa. */
  blocks?: Partial<Record<string, string>>;
  /** Enlace para ver el informe completo online (login del participante). */
  reportUrl?: string;
}): { subject: string; html: string; text: string } {
  const { result, def, participantName } = input;
  const dimColor = (c: string) =>
    def.dimensions.find((d) => d.code === c)?.color ?? "#64748b";
  const narrative = input.narrative ?? buildProfileNarrative(result);
  const eqBand = resolveEqBand(result.eq);
  const first = participantName.split(" ")[0] || "Hola";
  const reflectionHtml = narrative.reflection
    .map(
      (q, i) =>
        `<li style="margin:0 0 8px;color:#475569;font-size:14px;list-style:none;line-height:1.5;"><span style="color:#94a3b8;font-weight:700;">${i + 1}.</span> ${q}</li>`,
    )
    .join("");

  const body = `
    <p style="margin:0 0 14px;font-size:14px;color:#475569;line-height:1.6;">Hola ${first}, tu informe DISC GESEM ya está listo. Aquí tienes un resumen; puedes leerlo completo online.</p>
    <div style="background-color:${dimColor(result.primaryDimension)};background-image:linear-gradient(135deg,${dimColor(result.primaryDimension)},${dimColor(result.secondaryDimension)});color:#fff;border-radius:14px;padding:18px 20px;margin:0 0 20px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;opacity:.85;">Tu tendencia predominante</div>
      <div style="font-size:24px;font-weight:800;margin-top:4px;">${narrative.resourceHeadline}</div>
      <div style="font-size:14px;font-weight:600;opacity:.95;margin-top:2px;">${narrative.title}</div>
      <div style="font-size:12px;opacity:.85;margin-top:8px;">Intensidad: ${intensityLabel(result.intensity)} · Equilibrio (EQ ${result.eq}): ${eqBand.label}</div>
    </div>
    <h3 style="margin:0 0 8px;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Cómo leer tu informe</h3>
    <ul style="margin:0 0 18px;padding:0;">
      <li style="margin:0 0 6px;list-style:none;color:#475569;font-size:14px;line-height:1.5;">• Describe tendencias según tus respuestas, no una clasificación fija.</li>
      <li style="margin:0 0 6px;list-style:none;color:#475569;font-size:14px;line-height:1.5;">• Ningún estilo es mejor que otro: todos aportan valor.</li>
      <li style="margin:0 0 6px;list-style:none;color:#475569;font-size:14px;line-height:1.5;">• Es un punto de partida para la conversación y el desarrollo.</li>
    </ul>
    <div style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:12px;padding:14px 16px;margin:0 0 20px;">
      <div style="font-size:13px;font-weight:800;color:#0f172a;margin:0 0 6px;">Antes de la sesión</div>
      <p style="margin:0 0 10px;font-size:13px;color:#475569;line-height:1.5;">Léelo con calma, subraya lo que más te resuene y piensa en ejemplos reales. Estas preguntas te pueden ayudar:</p>
      <ul style="margin:0;padding:0;">${reflectionHtml}</ul>
    </div>
    ${input.reportUrl ? `<p style="margin:0 0 18px;"><a href="${input.reportUrl}" style="display:inline-block;background-color:${BRAND};color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:9999px;">Ver mi informe completo</a></p>` : ""}
    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;text-align:center;">El autoconocimiento es el punto de partida. La comprensión mutua es el puente. La adaptación consciente es la competencia. La colaboración eficaz es el resultado.</p>`;

  return {
    subject: `Tu informe DISC GESEM · ${narrative.resourceHeadline}`,
    html: shell("Tu informe DISC GESEM", body, "es"),
    text: `Hola ${first}, tu informe DISC GESEM destaca recursos orientados a ${narrative.resourceHeadline} (${narrative.title}). EQ ${result.eq}.`,
  };
}
