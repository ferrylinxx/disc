"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth/dal";
import { adminOrganizationIds, effectiveRoles } from "@/lib/auth/rbac";
import type { SessionPayload } from "@/lib/auth/jwt";
import { invitationEmail } from "@/lib/email/templates";
import { absoluteUrl, isMailConfigured, mailFrom, sendMail } from "@/lib/email/mailer";
import { checkInvitation, type EmailCheck } from "@/lib/email/checks";
import {
  inlineText,
  isWelcomeHtml,
  sanitizeInlineHtml,
  sanitizeWelcomeHtml,
  welcomeFromAi,
  welcomeIsEmpty,
} from "@/lib/email/rich-text";

export interface ActionState {
  error?: string;
  ok?: boolean;
  /** Ruta relativa de la invitación recién creada (p. ej. /evaluacion/<token>). */
  invitePath?: string;
  /** Mensaje informativo de resultado (p. ej. resumen de una carga masiva). */
  message?: string;
  /** Credenciales recién generadas, para copiarlas desde el panel. */
  credentials?: { email: string; password: string };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

/** SUPERADMIN: acceso total. ADMIN: solo a sus organizaciones. */
function assertOrgAccess(session: SessionPayload, orgId: string): boolean {
  if (effectiveRoles(session).includes("SUPERADMIN")) return true;
  return adminOrganizationIds(session).includes(orgId);
}

const OrgSchema = z.object({
  name: z.string().min(2, { error: "Nombre demasiado corto." }).trim(),
});

/** Crea una organización (solo SUPERADMIN). */
export async function createOrganization(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("SUPERADMIN");
  const parsed = OrgSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: "Revisa el nombre." };

  const base = slugify(parsed.data.name) || "org";
  let slug = base;
  let n = 1;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${base}-${++n}`;
  }

  await prisma.organization.create({
    data: { name: parsed.data.name, slug },
  });
  revalidatePath("/admin", "layout");
  return { ok: true };
}

const OrgEmailSchema = z.object({
  organizationId: z.string().min(1),
  programName: z.string().trim().max(200).optional(),
  programNameHtml: z.string().trim().max(2000).optional(),
  emailSubject: z.string().trim().max(200).optional(),
  emailLang: z.enum(["ca", "es"]).optional(),
  sessionDate: z.string().trim().max(40).optional(),
  sessionInfo: z.string().trim().max(300).optional(),
  deadline: z.string().trim().max(40).optional(),
  welcomeIntro: z.string().trim().max(20000).optional(),
  showProgramBox: z.boolean(),
});

/**
 * Mensaje de bienvenida tal y como se guarda: el HTML del editor, saneado; el
 * markdown de los mensajes antiguos, tal cual; vacío (p. ej. "<p></p>"), null.
 */
function cleanWelcome(text: string | undefined): string | null {
  if (!text || welcomeIsEmpty(text)) return null;
  return isWelcomeHtml(text) ? sanitizeWelcomeHtml(text) : text;
}

/**
 * Nombre del programa con formato, saneado. Si no aporta nada (vacío o sin
 * formato), se guarda null y el correo usa el nombre en texto plano.
 */
function cleanProgramHtml(html: string | undefined, name: string | undefined): string | null {
  if (!html || !name?.trim()) return null;
  const clean = sanitizeInlineHtml(html);
  return /<(strong|em|u|s|span)[\s>]/.test(clean) && inlineText(clean) ? clean : null;
}

/**
 * Guarda la personalización del correo de invitación de una organización
 * (nombre del programa, taller, fecha límite y mensaje de bienvenida). Todos
 * opcionales: sin programName, el correo usa el texto genérico por defecto.
 */
export async function updateOrgEmailConfig(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuth();
  const parsed = OrgEmailSchema.safeParse({
    organizationId: formData.get("organizationId"),
    programName: formData.get("programName") ?? undefined,
    programNameHtml: formData.get("programNameHtml") ?? undefined,
    emailSubject: formData.get("emailSubject") ?? undefined,
    emailLang: formData.get("emailLang") || undefined,
    sessionDate: formData.get("sessionDate") ?? undefined,
    sessionInfo: formData.get("sessionInfo") ?? undefined,
    deadline: formData.get("deadline") ?? undefined,
    welcomeIntro: formData.get("welcomeIntro") ?? undefined,
    // Casilla: el formulario manda "1" si está marcada y nada si no.
    showProgramBox: formData.get("showProgramBox") === "1",
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      error: `Revisa los datos del correo${issue?.path?.length ? ` (campo "${issue.path.join(".")}")` : ""}.`,
    };
  }
  if (!assertOrgAccess(session, parsed.data.organizationId)) {
    return { error: "Sin permiso sobre esta organización." };
  }
  await prisma.organization.update({
    where: { id: parsed.data.organizationId },
    data: {
      programName: parsed.data.programName || null,
      programNameHtml: cleanProgramHtml(parsed.data.programNameHtml, parsed.data.programName),
      emailSubject: parsed.data.emailSubject || null,
      emailLang: parsed.data.emailLang || null,
      sessionDate: parsed.data.sessionDate || null,
      sessionInfo: parsed.data.sessionInfo || null,
      deadline: parsed.data.deadline || null,
      welcomeIntro: cleanWelcome(parsed.data.welcomeIntro),
      showProgramBox: parsed.data.showProgramBox,
    },
  });
  revalidatePath(`/admin/organizaciones/${parsed.data.organizationId}`);
  return { ok: true };
}

/** Datos del formulario del correo, sin guardar, para previsualizarlo o probarlo. */
export interface InvitationDraft {
  organizationId: string;
  programName?: string;
  /** El nombre con formato (negrita, cursiva, color) para el cuerpo del correo. */
  programNameHtml?: string;
  emailSubject?: string;
  sessionDate?: string;
  sessionInfo?: string;
  deadline?: string;
  welcomeIntro?: string;
  showProgramBox?: boolean;
  lang?: "ca" | "es";
  /** Nombre de la persona de ejemplo, para ver cómo se rellenan las variables. */
  sampleName?: string;
}

const SAMPLE_EMAIL = "participante@ejemplo.com";
const sampleNameOf = (d: InvitationDraft) => (d.sampleName || "").trim().slice(0, 80) || "Laura Ejemplo";

/**
 * Compone el correo de invitación con los valores del formulario. Las
 * credenciales y los enlaces son de ejemplo: nunca los de una persona real.
 */
async function composeDraft(input: InvitationDraft) {
  const name = (input.programName || "").trim();
  const org = await prisma.organization.findUnique({
    where: { id: input.organizationId },
    select: { name: true },
  });
  return invitationEmail({
    participantName: sampleNameOf(input),
    accountEmail: SAMPLE_EMAIL,
    password: "Ej3mplo-2026",
    loginUrl: absoluteUrl(`/login?next=/evaluacion&email=${SAMPLE_EMAIL}`),
    setPasswordUrl: absoluteUrl("/restablecer/ejemplo-token"),
    lang: input.lang === "es" ? "es" : "ca",
    program: name
      ? {
          name,
          nameHtml: input.programNameHtml,
          subject: input.emailSubject,
          sessionDate: input.sessionDate,
          sessionInfo: input.sessionInfo,
          deadline: input.deadline,
          welcomeIntro: input.welcomeIntro,
          orgName: org?.name ?? null,
          showInfo: input.showProgramBox !== false,
        }
      : undefined,
  });
}

/**
 * Vista previa del correo de invitación (sin guardar): el HTML, lo que verá la
 * persona en su bandeja (remitente, asunto y texto de vista previa) y una
 * revisión automática de los despistes habituales.
 */
export async function previewInvitationEmail(input: InvitationDraft): Promise<{
  ok: boolean;
  subject?: string;
  preheader?: string;
  html?: string;
  from?: string;
  to?: string;
  checks?: EmailCheck[];
  error?: string;
}> {
  const session = await requireAuth();
  if (!input.organizationId || !assertOrgAccess(session, input.organizationId)) {
    return { ok: false, error: "Sin permiso sobre esta organización." };
  }
  const email = await composeDraft(input);
  return {
    ok: true,
    subject: email.subject,
    preheader: email.preheader,
    html: email.html,
    from: mailFrom(),
    to: `${sampleNameOf(input)} <${SAMPLE_EMAIL}>`,
    checks: checkInvitation({
      programName: input.programName,
      subject: input.emailSubject,
      welcomeIntro: input.welcomeIntro,
      sessionDate: input.sessionDate,
      deadline: input.deadline,
      showProgramBox: input.showProgramBox,
      lang: input.lang === "es" ? "es" : "ca",
    }),
  };
}

/**
 * Envía el correo tal y como está en el formulario (sin guardar) a quien lo
 * pide, para verlo en su bandeja real (Outlook, Gmail, el móvil…). El asunto
 * lleva "[Prueba]" y los datos de acceso del cuerpo son de ejemplo.
 */
export async function sendTestInvitationEmail(
  input: InvitationDraft,
): Promise<{ ok: boolean; to?: string; error?: string }> {
  const session = await requireAuth();
  if (!input.organizationId || !assertOrgAccess(session, input.organizationId)) {
    return { ok: false, error: "Sin permiso sobre esta organización." };
  }
  if (!isMailConfigured()) {
    return { ok: false, error: "El envío de correo (SMTP) no está configurado en el servidor." };
  }
  const email = await composeDraft(input);
  try {
    await sendMail({
      to: session.email,
      subject: `[Prueba] ${email.subject}`,
      html: email.html,
      text: email.text,
    });
    return { ok: true, to: session.email };
  } catch (e) {
    console.error("[correo de prueba] fallo al enviar:", e);
    return { ok: false, error: "No se pudo enviar el correo de prueba. Revisa el SMTP en Sistema." };
  }
}

/**
 * Modelos de Groq. OJO: Groq retira modelos cada pocos meses y entonces la API
 * responde 404; si la IA deja de funcionar, comprueba
 * `GET https://api.groq.com/openai/v1/models` y actualiza estas constantes.
 */
const GROQ_TEXT_MODEL = "openai/gpt-oss-120b";
const GROQ_VISION_MODEL = "qwen/qwen3.8-27b";

/**
 * Presupuesto de tokens para un texto de entrada: tiene que caber el
 * razonamiento del modelo y la respuesta, que puede ser más larga que el
 * original (si alguien pega un mensaje largo, la traducción también lo es).
 */
function budgetFor(text: string): number {
  return Math.min(6000, 1200 + Math.ceil(text.length / 2));
}

/**
 * Llamada de texto a la IA (Groq, API compatible con OpenAI). Devuelve el
 * contenido del primer mensaje o un error ya redactado para la consola.
 */
async function groqText(
  system: string,
  user: string,
  opts: { temperature: number; maxTokens: number },
): Promise<{ ok: boolean; text?: string; error?: string }> {
  // gpt-oss razona antes de responder y ese razonamiento gasta max_tokens: con
  // el esfuerzo por defecto se comía el presupuesto entero y la respuesta
  // llegaba vacía o cortada ("La IA no devolvió texto").
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return {
      ok: false,
      error: "Falta GROQ_API_KEY en el servidor. Añádela al .env para activar la IA.",
    };
  }
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "content-type": "application/json",
        "user-agent": "disc-gesem/1.0",
      },
      body: JSON.stringify({
        model: GROQ_TEXT_MODEL,
        max_tokens: opts.maxTokens,
        reasoning_effort: "low",
        temperature: opts.temperature,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      console.error("[IA] respuesta no OK:", res.status, await res.text());
      return { ok: false, error: `La IA no respondió correctamente (${res.status}).` };
    }
    const data = (await res.json()) as {
      choices?: { finish_reason?: string; message?: { content?: string } }[];
    };
    const choice = data.choices?.[0];
    const text = (choice?.message?.content ?? "").trim();
    // Con finish_reason "length" el texto llega a medias: mejor avisar que
    // pegar media frase en el correo.
    if (choice?.finish_reason === "length") {
      console.error("[IA] respuesta cortada por max_tokens:", opts.maxTokens);
      return {
        ok: false,
        error: "La IA se quedó sin espacio para responder. Inténtalo otra vez o acorta el mensaje.",
      };
    }
    if (!text) return { ok: false, error: "La IA no devolvió texto. Inténtalo otra vez." };
    // El modelo a veces usa guion y espacio "no separables" (fer‑ho); se
    // cambian por los normales para que el texto sea editable con normalidad.
    return { ok: true, text: text.replace(/‑/g, "-").replace(/[  ]/g, " ") };
  } catch (e) {
    console.error("[IA] fallo de conexión:", e);
    return { ok: false, error: "No se pudo conectar con la IA." };
  }
}

/**
 * Mejora (o redacta) el mensaje de bienvenida del correo con IA (Groq, API
 * compatible con OpenAI), respetando las reglas de redacción (tendencia, no
 * diagnóstico). Requiere GROQ_API_KEY en el entorno del servidor.
 */
export async function improveInvitationWelcome(input: {
  programName?: string;
  current?: string;
  lang?: "ca" | "es";
}): Promise<{ ok: boolean; text?: string; error?: string }> {
  await requireAuth();
  const lang = input.lang === "es" ? "es" : "ca";
  const langName = lang === "es" ? "español" : "catalán";
  const program = (input.programName || "").trim();
  // El editor manda HTML ("<p></p>" si está vacío); los mensajes antiguos, markdown.
  const current = welcomeIsEmpty(input.current) ? "" : (input.current || "").trim();
  const system =
    "Eres redactor de GESEM y escribes el mensaje de bienvenida de un correo de invitación a un cuestionario de estilos conductuales DISC. " +
    "Reglas obligatorias: habla de tendencias y preferencias, nunca de diagnóstico; prohibido 'eres', 'siempre', 'nunca', 'trastorno', 'capacidad'; " +
    "tono cálido, cercano y profesional; 2 a 5 frases; sin firma; no menciones contraseñas, enlaces ni respuestas 'Más/Menos'. " +
    "Escribe en HTML sencillo: párrafos <p>, <strong> para 1-2 ideas clave y, si aporta, una lista <ul><li>. " +
    "Si el mensaje actual ya tiene formato (títulos, negritas, colores, tamaños, tipografías, alineación, destacados), consérvalo: mantén sus etiquetas y sus atributos style tal cual y no añadas estilos nuevos. " +
    "Puedes usar la variable {{nombre}} para dirigirte a la persona (se sustituye por su nombre al enviar); copia las variables {{…}} tal cual. " +
    "Responde SOLO con el HTML del mensaje, sin bloque de código ni explicaciones.";
  const user = current
    ? `Mejora este mensaje de bienvenida${program ? ` para el programa «${program}»` : ""}, en ${langName}:\n\n${current}`
    : `Escribe un mensaje de bienvenida${program ? ` para el programa «${program}»` : ""}, en ${langName}, que invite a la persona a completar su cuestionario DISC con calma y una mirada reflexiva antes del taller.`;
  const r = await groqText(system, user, { temperature: 0.7, maxTokens: budgetFor(current) });
  return r.ok && r.text ? { ok: true, text: welcomeFromAi(r.text) } : r;
}

/** Deja una sugerencia en una sola línea, sin comillas alrededor ni punto final. */
function oneLine(text: string, maxChars: number): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/^["'«»“”¡¿]+|["'«»“”.]+$/g, "")
    .trim()
    .slice(0, maxChars);
}

/**
 * Sugiere con IA (Groq) el nombre del programa o el asunto del correo: lo
 * redacta si está vacío y lo pule si ya hay algo. Requiere GROQ_API_KEY.
 */
export async function suggestEmailField(input: {
  organizationId: string;
  field: "programName" | "emailSubject";
  current?: string;
  programName?: string;
  lang?: "ca" | "es";
}): Promise<{ ok: boolean; text?: string; error?: string }> {
  const session = await requireAuth();
  if (!input.organizationId || !assertOrgAccess(session, input.organizationId)) {
    return { ok: false, error: "Sin permiso sobre esta organización." };
  }
  const org = await prisma.organization.findUnique({
    where: { id: input.organizationId },
    select: { name: true },
  });
  const orgName = org?.name?.trim() || "";
  const lang = input.lang === "es" ? "es" : "ca";
  const langName = lang === "es" ? "español" : "catalán";
  const current = (input.current || "").trim();
  const program = (input.programName || "").trim();
  const contexto = [
    orgName ? `Organización: «${orgName}».` : "",
    program ? `Programa: «${program}».` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const esPrograma = input.field === "programName";
  const system = esPrograma
    ? "Eres redactor de GESEM y nombras programas de desarrollo de equipos que empiezan con un cuestionario de estilos conductuales DISC. " +
      "El nombre es un lema corto: de 2 a 5 palabras, evocador y claro, sin comillas, sin punto final y sin el nombre de la empresa. " +
      "Habla de colaboración, comunicación o autoconocimiento; nunca de diagnóstico, evaluación del rendimiento ni capacidades. " +
      "Responde SOLO con el nombre."
    : "Eres redactor de GESEM y escribes el ASUNTO del correo que invita a una persona a completar su cuestionario de estilos conductuales DISC. " +
      "Una sola línea de menos de 60 caracteres, concreta y cordial, sin emojis, sin comillas y sin puntos suspensivos. " +
      "Puedes usar la variable {{programa}}, que se sustituye por el nombre del programa al enviar, y {{nombre}} para el nombre de la persona. " +
      "Nada de urgencias ni de lenguaje de diagnóstico. Responde SOLO con el asunto.";
  const que = esPrograma ? "el nombre del programa" : "el asunto";
  const user = current
    ? `Mejora ${que}, en ${langName}. ${contexto}\n\nActual: ${current}`
    : `Propón ${que}, en ${langName}. ${contexto}`;

  const r = await groqText(system, user, { temperature: 0.8, maxTokens: budgetFor(current) });
  if (!r.ok || !r.text) return r;
  return { ok: true, text: oneLine(r.text, 200) };
}

/**
 * Traduce el mensaje de bienvenida entre castellano y catalán con IA (Groq),
 * conservando el markdown y las variables {{…}}. Requiere GROQ_API_KEY.
 */
export async function translateInvitationWelcome(input: {
  text?: string;
  to?: "ca" | "es";
}): Promise<{ ok: boolean; text?: string; error?: string }> {
  await requireAuth();
  const text = (input.text || "").trim();
  if (welcomeIsEmpty(text)) return { ok: false, error: "Escribe primero el mensaje que quieres traducir." };
  const to = input.to === "es" ? "es" : "ca";
  const target = to === "es" ? "castellano" : "catalán";
  const system =
    `Eres traductor editorial de GESEM y traduces al ${target} el mensaje de bienvenida de un correo de invitación a un cuestionario de estilos conductuales DISC. ` +
    "Mantén el sentido, el tono cálido y profesional y el lenguaje de tendencia (nunca diagnóstico): no añadas ni quites ideas. " +
    "Conserva EXACTAMENTE el formato: todas las etiquetas HTML y sus atributos (style, href) se copian tal cual y solo se traduce el texto visible; si llega en markdown, conserva el markdown. " +
    "Las variables entre dobles llaves ({{nombre}}, {{nombre_completo}}, {{email}}, {{programa}}, {{organizacion}}) se copian tal cual: no las traduzcas ni cambies su ortografía. " +
    "Los nombres propios y los nombres de programa en mayúsculas se dejan como están. " +
    `Si el texto ya está en ${target}, corrígelo solo si tiene errores. ` +
    "Responde SOLO con el texto traducido, sin bloque de código, comillas ni explicaciones.";
  const r = await groqText(system, `Traduce al ${target}:\n\n${text}`, {
    temperature: 0.2,
    maxTokens: budgetFor(text),
  });
  return r.ok && r.text ? { ok: true, text: welcomeFromAi(r.text) } : r;
}

/** Propuesta de la IA para arreglar el correo (sin guardar). */
export interface AiEmailProposal {
  programName: string;
  emailSubject: string;
  welcomeIntro: string;
  /** Qué ha cambiado, en frases cortas, para enseñarlo antes de aplicarlo. */
  changes: string[];
}

/**
 * Revisa el correo con IA y propone una versión corregida: arregla los avisos
 * de la revisión automática y los errores claros de ortografía y tipografía,
 * sin cambiar el sentido ni el formato del mensaje. No guarda nada.
 */
export async function fixInvitationWithAi(
  input: InvitationDraft & { problems: string[] },
): Promise<{ ok: boolean; proposal?: AiEmailProposal; error?: string }> {
  const session = await requireAuth();
  if (!input.organizationId || !assertOrgAccess(session, input.organizationId)) {
    return { ok: false, error: "Sin permiso sobre esta organización." };
  }
  const langName = input.lang === "es" ? "castellano" : "catalán";
  const current = {
    programName: (input.programName || "").trim(),
    emailSubject: (input.emailSubject || "").trim(),
    welcomeIntro: welcomeIsEmpty(input.welcomeIntro) ? "" : (input.welcomeIntro || "").trim(),
  };
  const system =
    "Eres editor de GESEM y revisas el correo de invitación a un cuestionario de estilos conductuales DISC antes de enviarlo. " +
    `El correo se enviará en ${langName}. Recibes sus campos en JSON y una lista de avisos. ` +
    "Corrige lo que señalan los avisos y los errores claros de ortografía, acentos y tipografía (en catalán: apóstrofo ’, ela geminada l·l; en castellano: tildes). " +
    "Corrige palabras concretas: NO acortes, resumas ni reescribas frases, y no cambies el sentido, el tono ni la estructura; no añadas ideas nuevas. Si un campo está bien, devuélvelo exactamente igual. " +
    "La ela geminada (l·l) solo va en palabras catalanas que la llevan de verdad (col·laborar, instal·lacions, il·lusió); nunca la pongas en otras palabras ni en nombres propios. " +
    "welcomeIntro es HTML: conserva todas sus etiquetas y atributos style tal cual y traduce o corrige solo el texto visible. " +
    "El correo ya empieza con «Hola {nombre},»: si el mensaje vuelve a saludar al principio, quita ese saludo. " +
    "emailSubject es texto plano: sin asteriscos, menos de 60 caracteres. Si lleva letras especiales de negrita o cursiva (𝗮, 𝘢), consérvalas tal cual. Si está vacío, déjalo vacío. " +
    "Copia las variables entre dobles llaves ({{nombre}}, {{programa}}…) tal cual; si una variable no existe, sustitúyela por la más parecida de: nombre, nombre_completo, email, programa, organizacion. " +
    "Respeta siempre el lenguaje de tendencia: nunca diagnóstico. " +
    'Responde SOLO con un objeto JSON: {"programName": string, "emailSubject": string, "welcomeIntro": string, "changes": [string]}; ' +
    "en changes, cada cambio hecho en una frase corta ESCRITA EN CASTELLANO aunque el correo esté en catalán, citando la palabra antes y después (p. ej. «Nom´es» → «Només»); vacío si no hay cambios.";
  const user = JSON.stringify({ ...current, avisos: input.problems.slice(0, 20) });
  const r = await groqText(system, user, { temperature: 0.1, maxTokens: budgetFor(user) + 800 });
  if (!r.ok || !r.text) return { ok: false, error: r.error };

  let data: Partial<Record<keyof AiEmailProposal, unknown>>;
  try {
    const raw = r.text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    data = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
  } catch {
    console.error("[IA] respuesta no es JSON:", r.text.slice(0, 300));
    return { ok: false, error: "La IA no devolvió una propuesta válida. Inténtalo otra vez." };
  }
  const str = (v: unknown, fallback: string) => (typeof v === "string" ? v : fallback);
  const welcome = str(data.welcomeIntro, current.welcomeIntro);
  return {
    ok: true,
    proposal: {
      programName: oneLine(str(data.programName, current.programName), 200) || current.programName,
      emailSubject: current.emailSubject ? oneLine(str(data.emailSubject, current.emailSubject), 200) : "",
      welcomeIntro: current.welcomeIntro && welcome.trim() ? welcomeFromAi(welcome) : current.welcomeIntro,
      changes: Array.isArray(data.changes)
        ? data.changes
            .filter((c): c is string => typeof c === "string" && c.trim() !== "")
            // A veces la IA antepone el nombre interno del campo.
            .map((c) =>
              c
                .replace(/^\s*emailSubject\s*:\s*/i, "Asunto: ")
                .replace(/^\s*welcomeIntro\s*:\s*/i, "Mensaje: ")
                .replace(/^\s*programName\s*:\s*/i, "Programa: "),
            )
            .slice(0, 12)
        : [],
    },
  };
}

/**
 * Extrae un listado de participantes ("Nombre Apellido, correo") desde la foto o
 * imagen de una tabla, con IA de visión (Groq, Llama 4). Devuelve el texto para
 * revisarlo/editarlo antes de invitar. Requiere GROQ_API_KEY en el servidor.
 */
export async function extractRosterFromImage(input: {
  imageDataUrl: string;
}): Promise<{ ok: boolean; roster?: string; error?: string }> {
  await requireAuth();
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return { ok: false, error: "Falta GROQ_API_KEY en el servidor para la extracción con IA." };
  }
  const url = (input.imageDataUrl || "").trim();
  if (!/^data:image\/(png|jpe?g|webp);base64,/i.test(url)) {
    return { ok: false, error: "La imagen no es válida." };
  }
  const prompt =
    "Extrae de la imagen la tabla de personas (nombre y correo electrónico). " +
    "Devuelve SOLO líneas con el formato «Nombre Apellidos, correo@dominio», una persona por línea y con una sola coma. " +
    "Si la tabla tiene columnas separadas para apellidos y nombre, júntalos en orden natural, primero el nombre y después los apellidos (p. ej. «Albert Portugal Brugada, albert.portugal@empresa.cat»). " +
    "Sin cabecera, sin numeración, sin viñetas y sin ninguna explicación. " +
    "Si una fila no tiene un correo claro, omítela. No inventes correos ni nombres.";
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "content-type": "application/json",
        "user-agent": "disc-gesem/1.0",
      },
      body: JSON.stringify({
        model: GROQ_VISION_MODEL,
        max_tokens: 2000,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url } },
            ],
          },
        ],
      }),
    });
    if (!res.ok) {
      console.error("[IA-visión] respuesta no OK:", res.status, await res.text());
      return { ok: false, error: `La IA no procesó la imagen (${res.status}).` };
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = (data.choices?.[0]?.message?.content ?? "")
      .replace(/```[a-z]*\n?/gi, "")
      .replace(/```/g, "")
      .trim();
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.replace(/^\s*[-*\d.)]+\s*/, "").trim())
      .filter((l) => l.includes("@") && l.includes(","));
    if (lines.length === 0) {
      return { ok: false, error: "No se detectaron filas con nombre y correo en la imagen." };
    }
    return { ok: true, roster: lines.join("\n") };
  } catch (e) {
    console.error("[IA-visión] fallo de conexión:", e);
    return { ok: false, error: "No se pudo conectar con la IA de visión." };
  }
}

const ProjectSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(2, { error: "Nombre demasiado corto." }).trim(),
  description: z.string().trim().optional(),
});

/** Crea un proyecto en una organización (ADMIN de la org o SUPERADMIN). */
export async function createProject(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuth();
  const parsed = ProjectSchema.safeParse({
    organizationId: formData.get("organizationId"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: "Revisa los datos del proyecto." };
  if (!assertOrgAccess(session, parsed.data.organizationId)) {
    return { error: "Sin permiso sobre esta organización." };
  }

  await prisma.project.create({
    data: {
      organizationId: parsed.data.organizationId,
      name: parsed.data.name,
      description: parsed.data.description,
    },
  });
  revalidatePath("/cliente");
  return { ok: true };
}

const TeamSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(2, { error: "Nombre demasiado corto." }).trim(),
});

/** Crea un equipo dentro de un proyecto (ADMIN de la org o SUPERADMIN). */
export async function createTeam(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuth();
  const parsed = TeamSchema.safeParse({
    projectId: formData.get("projectId"),
    name: formData.get("name"),
  });
  if (!parsed.success) return { error: "Revisa el nombre del equipo." };

  const project = await prisma.project.findUnique({
    where: { id: parsed.data.projectId },
    select: { id: true, organizationId: true },
  });
  if (!project || !assertOrgAccess(session, project.organizationId)) {
    return { error: "Sin permiso sobre este proyecto." };
  }

  await prisma.team.create({
    data: { projectId: project.id, name: parsed.data.name },
  });
  revalidatePath(`/cliente/proyectos/${project.id}`);
  return { ok: true };
}
