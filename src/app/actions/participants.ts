"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/dal";
import { adminOrganizationIds, effectiveRoles } from "@/lib/auth/rbac";
import type { SessionPayload } from "@/lib/auth/jwt";
import { absoluteUrl, isMailConfigured, sendMail } from "@/lib/email/mailer";
import { invitationEmail } from "@/lib/email/templates";
import type { ActionState } from "./org";

function assertOrgAccess(session: SessionPayload, orgId: string): boolean {
  if (effectiveRoles(session).includes("SUPERADMIN")) return true;
  return adminOrganizationIds(session).includes(orgId);
}

/**
 * Envía (best-effort) el email de invitación. No lanza: si el SMTP no está
 * configurado o falla, se registra y se continúa (el enlace siempre queda
 * disponible para copiar manualmente desde el panel).
 */
async function sendInvitationEmail(
  to: string,
  fullName: string,
  token: string,
): Promise<boolean> {
  if (!isMailConfigured()) return false;
  try {
    const email = invitationEmail({
      participantName: fullName,
      url: absoluteUrl(`/evaluacion/${token}`),
    });
    await sendMail({
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    return true;
  } catch (e) {
    console.error("[sendInvitationEmail] envío fallido:", e);
    return false;
  }
}

/** Localiza la versión publicada del instrumento activo (o lanza). */
async function activeVersionId(): Promise<string | null> {
  const version = await prisma.instrumentVersion.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: { id: true },
  });
  return version?.id ?? null;
}

/** Garantiza una evaluación ACTIVE por organización para la versión activa. */
async function ensureAssessment(
  organizationId: string,
  projectId: string | null,
  versionId: string,
): Promise<string> {
  const existing = await prisma.assessment.findFirst({
    where: { organizationId, versionId, status: "ACTIVE" },
    select: { id: true },
  });
  if (existing) return existing.id;
  const created = await prisma.assessment.create({
    data: {
      organizationId,
      projectId,
      versionId,
      name: "Evaluación DISC GESEM",
      status: "ACTIVE",
    },
    select: { id: true },
  });
  return created.id;
}

const ParticipantSchema = z.object({
  organizationId: z.string().min(1),
  teamId: z.string().optional(),
  fullName: z.string().min(2, { error: "Nombre demasiado corto." }).trim(),
  email: z.email({ error: "Email no válido." }).trim().toLowerCase(),
});

/**
 * Alta de participante + invitación por enlace. Crea el participante, asegura
 * una evaluación activa y genera un token de invitación con caducidad.
 */
export async function inviteParticipant(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuth();
  const parsed = ParticipantSchema.safeParse({
    organizationId: formData.get("organizationId"),
    teamId: formData.get("teamId") || undefined,
    fullName: formData.get("fullName"),
    email: formData.get("email"),
  });
  if (!parsed.success) return { error: "Revisa los datos del participante." };
  if (!assertOrgAccess(session, parsed.data.organizationId)) {
    return { error: "Sin permiso sobre esta organización." };
  }

  const versionId = await activeVersionId();
  if (!versionId) {
    return { error: "No hay un instrumento publicado. Ejecuta el seed." };
  }

  const teamId = parsed.data.teamId || null;
  let projectId: string | null = null;
  if (teamId) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { projectId: true },
    });
    projectId = team?.projectId ?? null;
  }

  const participant = await prisma.participant.create({
    data: {
      organizationId: parsed.data.organizationId,
      teamId,
      email: parsed.data.email,
      fullName: parsed.data.fullName,
      status: "INVITED",
    },
  });

  const assessmentId = await ensureAssessment(
    parsed.data.organizationId,
    projectId,
    versionId,
  );

  const token = globalThis.crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.invitation.create({
    data: {
      assessmentId,
      participantId: participant.id,
      token,
      status: "PENDING",
      expiresAt,
    },
  });

  await sendInvitationEmail(parsed.data.email, parsed.data.fullName, token);

  if (teamId) revalidatePath(`/cliente/equipos/${teamId}`);
  revalidatePath("/cliente");
  revalidatePath("/facilitador");
  return { ok: true, invitePath: `/evaluacion/${token}` };
}

/**
 * Reenvía la invitación por email al participante reutilizando su token activo
 * (PENDING/SENT/OPENED y no caducado). Solo para admins de la organización.
 */
export async function resendInvitation(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuth();
  const participantId = String(formData.get("participantId") ?? "");
  if (!participantId) return { error: "Falta el participante." };
  if (!isMailConfigured()) {
    return { error: "SMTP no configurado. Define SMTP_PASS en .env.local." };
  }

  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    select: {
      organizationId: true,
      fullName: true,
      email: true,
      invitations: {
        where: {
          status: { in: ["PENDING", "SENT", "OPENED"] },
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { token: true },
      },
    },
  });
  if (!participant || !assertOrgAccess(session, participant.organizationId)) {
    return { error: "Sin permiso o participante no encontrado." };
  }
  const token = participant.invitations[0]?.token;
  if (!token) {
    return { error: "No hay una invitación activa para reenviar." };
  }

  const sent = await sendInvitationEmail(
    participant.email,
    participant.fullName,
    token,
  );
  if (!sent) {
    return { error: "No se pudo enviar el correo. Revisa la configuración SMTP." };
  }
  return { ok: true };
}

/**
 * Parsea filas "Nombre, email" (CSV/Excel pegado). Acepta coma, punto y coma o
 * tabulador como separador, ignora cabecera y líneas vacías. No valida aquí el
 * email: eso lo hace Zod por fila al crear.
 */
function parseRoster(raw: string): { fullName: string; email: string }[] {
  const out: { fullName: string; email: string }[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(/[,;\t]/).map((p) => p.trim());
    if (parts.length < 2) continue;
    const [fullName, email] = parts;
    if (/^(nombre|name)$/i.test(fullName) && /^(email|correo)$/i.test(email)) {
      continue; // cabecera
    }
    out.push({ fullName, email });
  }
  return out;
}

const BulkSchema = z.object({
  organizationId: z.string().min(1),
  teamId: z.string().optional(),
  roster: z.string().min(1),
});

/**
 * Alta masiva de participantes desde un listado CSV/Excel pegado. Crea
 * participante + invitación por fila válida y envía el email de invitación.
 * Devuelve un resumen (creados, omitidos, email enviado/fallido).
 */
export async function bulkInviteParticipants(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuth();
  const parsed = BulkSchema.safeParse({
    organizationId: formData.get("organizationId"),
    teamId: formData.get("teamId") || undefined,
    roster: formData.get("roster"),
  });
  if (!parsed.success) return { error: "Pega al menos una fila Nombre, email." };
  if (!assertOrgAccess(session, parsed.data.organizationId)) {
    return { error: "Sin permiso sobre esta organización." };
  }

  const versionId = await activeVersionId();
  if (!versionId) {
    return { error: "No hay un instrumento publicado. Ejecuta el seed." };
  }

  const rows = parseRoster(parsed.data.roster);
  if (rows.length === 0) {
    return { error: "No se reconoció ninguna fila Nombre, email." };
  }

  const teamId = parsed.data.teamId || null;
  let projectId: string | null = null;
  if (teamId) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { projectId: true },
    });
    projectId = team?.projectId ?? null;
  }
  const assessmentId = await ensureAssessment(
    parsed.data.organizationId,
    projectId,
    versionId,
  );

  let created = 0;
  let skipped = 0;
  let emailed = 0;
  for (const row of rows) {
    const valid = ParticipantSchema.safeParse({
      organizationId: parsed.data.organizationId,
      teamId: teamId ?? undefined,
      fullName: row.fullName,
      email: row.email,
    });
    if (!valid.success) {
      skipped += 1;
      continue;
    }
    const participant = await prisma.participant.create({
      data: {
        organizationId: parsed.data.organizationId,
        teamId,
        email: valid.data.email,
        fullName: valid.data.fullName,
        status: "INVITED",
      },
    });
    const token = globalThis.crypto.randomUUID().replace(/-/g, "");
    await prisma.invitation.create({
      data: {
        assessmentId,
        participantId: participant.id,
        token,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    created += 1;
    if (await sendInvitationEmail(valid.data.email, valid.data.fullName, token)) {
      emailed += 1;
    }
  }

  if (teamId) revalidatePath(`/cliente/equipos/${teamId}`);
  revalidatePath("/cliente");
  revalidatePath("/facilitador");

  const parts = [`${created} participantes creados`];
  if (emailed > 0) parts.push(`${emailed} emails enviados`);
  if (skipped > 0) parts.push(`${skipped} filas omitidas`);
  return { ok: true, message: parts.join(" · ") + "." };
}
