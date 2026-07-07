"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth/dal";
import { adminOrganizationIds, effectiveRoles } from "@/lib/auth/rbac";
import type { SessionPayload } from "@/lib/auth/jwt";
import { invitationEmail } from "@/lib/email/templates";
import { absoluteUrl } from "@/lib/email/mailer";

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
  programName: z.string().trim().max(120).optional(),
  sessionDate: z.string().trim().max(40).optional(),
  sessionInfo: z.string().trim().max(240).optional(),
  deadline: z.string().trim().max(40).optional(),
  welcomeIntro: z.string().trim().max(1200).optional(),
});

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
    sessionDate: formData.get("sessionDate") ?? undefined,
    sessionInfo: formData.get("sessionInfo") ?? undefined,
    deadline: formData.get("deadline") ?? undefined,
    welcomeIntro: formData.get("welcomeIntro") ?? undefined,
  });
  if (!parsed.success) return { error: "Revisa los datos del correo." };
  if (!assertOrgAccess(session, parsed.data.organizationId)) {
    return { error: "Sin permiso sobre esta organización." };
  }
  await prisma.organization.update({
    where: { id: parsed.data.organizationId },
    data: {
      programName: parsed.data.programName || null,
      sessionDate: parsed.data.sessionDate || null,
      sessionInfo: parsed.data.sessionInfo || null,
      deadline: parsed.data.deadline || null,
      welcomeIntro: parsed.data.welcomeIntro || null,
    },
  });
  revalidatePath(`/admin/organizaciones/${parsed.data.organizationId}`);
  return { ok: true };
}

/**
 * Compone el correo de invitación con los valores dados (sin guardar) y lo
 * devuelve para previsualizarlo antes de enviar. Usa credenciales/enlaces de
 * ejemplo (solo para la vista previa).
 */
export async function previewInvitationEmail(input: {
  organizationId: string;
  programName?: string;
  sessionDate?: string;
  sessionInfo?: string;
  deadline?: string;
  welcomeIntro?: string;
  lang?: "ca" | "es";
}): Promise<{ ok: boolean; subject?: string; html?: string; error?: string }> {
  const session = await requireAuth();
  if (!input.organizationId || !assertOrgAccess(session, input.organizationId)) {
    return { ok: false, error: "Sin permiso sobre esta organización." };
  }
  const lang = input.lang === "es" ? "es" : "ca";
  const name = (input.programName || "").trim();
  const email = invitationEmail({
    participantName: "Nombre Apellido",
    accountEmail: "participante@ejemplo.com",
    password: "Ej3mplo-2026",
    loginUrl: absoluteUrl("/login?next=/evaluacion&email=participante@ejemplo.com"),
    setPasswordUrl: absoluteUrl("/restablecer/ejemplo-token"),
    lang,
    program: name
      ? {
          name,
          sessionDate: input.sessionDate,
          sessionInfo: input.sessionInfo,
          deadline: input.deadline,
          welcomeIntro: input.welcomeIntro,
        }
      : undefined,
  });
  return { ok: true, subject: email.subject, html: email.html };
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
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return {
      ok: false,
      error: "Falta GROQ_API_KEY en el servidor. Añádela al .env para activar la mejora con IA.",
    };
  }
  const lang = input.lang === "es" ? "es" : "ca";
  const langName = lang === "es" ? "español" : "catalán";
  const program = (input.programName || "").trim();
  const current = (input.current || "").trim();
  const system =
    "Eres redactor de GESEM y escribes el mensaje de bienvenida de un correo de invitación a un cuestionario de estilos conductuales DISC. " +
    "Reglas obligatorias: habla de tendencias y preferencias, nunca de diagnóstico; prohibido 'eres', 'siempre', 'nunca', 'trastorno', 'capacidad'; " +
    "tono cálido, cercano y profesional; 2 a 5 frases; sin encabezados ni firma; no menciones contraseñas, enlaces ni respuestas 'Más/Menos'. " +
    "Puedes usar markdown ligero para estructurar: **negrita** para 1-2 ideas clave y, si aporta, una lista breve con guiones. " +
    "Responde SOLO con el texto del mensaje (markdown incluido), sin comillas ni explicaciones.";
  const user = current
    ? `Mejora este mensaje de bienvenida${program ? ` para el programa «${program}»` : ""}, en ${langName}:\n\n${current}`
    : `Escribe un mensaje de bienvenida${program ? ` para el programa «${program}»` : ""}, en ${langName}, que invite a la persona a completar su cuestionario DISC con calma y una mirada reflexiva antes del taller.`;
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 400,
        temperature: 0.7,
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
      choices?: { message?: { content?: string } }[];
    };
    const text = (data.choices?.[0]?.message?.content ?? "").trim();
    if (!text) return { ok: false, error: "La IA no devolvió texto." };
    return { ok: true, text };
  } catch (e) {
    console.error("[IA] fallo de conexión:", e);
    return { ok: false, error: "No se pudo conectar con la IA." };
  }
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
    "Devuelve SOLO líneas con el formato «Nombre Apellido, correo@dominio», una persona por línea. " +
    "Sin cabecera, sin numeración, sin viñetas y sin ninguna explicación. " +
    "Si una fila no tiene un correo claro, omítela. No inventes correos ni nombres.";
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
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
