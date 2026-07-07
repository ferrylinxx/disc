"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/dal";
import { adminOrganizationIds, effectiveRoles } from "@/lib/auth/rbac";
import type { SessionPayload } from "@/lib/auth/jwt";
import { absoluteUrl, isMailConfigured, sendMail } from "@/lib/email/mailer";
import { invitationEmail } from "@/lib/email/templates";
import {
  createPasswordSetToken,
  hashPassword,
  randomPassword,
} from "@/lib/auth/password";
import type { Lang } from "@/lib/i18n/dictionaries";
import type { ActionState } from "./org";

function assertOrgAccess(session: SessionPayload, orgId: string): boolean {
  if (effectiveRoles(session).includes("SUPERADMIN")) return true;
  return adminOrganizationIds(session).includes(orgId);
}

/**
 * (Re)genera la contraseña de una cuenta de participante y la devuelve en claro
 * para el email. PROTECCIÓN: nunca resetea cuentas de staff (SUPERADMIN o con
 * membresías) — así invitar/reenviar no puede bloquear a un admin/formadora.
 * Para esas cuentas devuelve undefined (el email no incluye contraseña).
 */
async function issueParticipantPassword(
  userId: string,
): Promise<string | undefined> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { globalRole: true, _count: { select: { memberships: true } } },
  });
  if (!user) return undefined;
  if (user.globalRole === "SUPERADMIN" || user._count.memberships > 0) {
    return undefined; // cuenta de staff: no se toca su contraseña
  }
  const tempPassword = randomPassword();
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(tempPassword) },
  });
  return tempPassword;
}

/**
 * Garantiza una cuenta de usuario para el participante y devuelve una contraseña
 * en claro para el email cuando corresponde. Si el email ya tiene cuenta de
 * participante, le genera una contraseña nueva; si es cuenta de staff, la
 * reutiliza sin tocarla (tempPassword undefined). Si no existe, la crea.
 */
async function ensureParticipantAccount(
  email: string,
  fullName: string,
): Promise<{ userId: string; tempPassword?: string }> {
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    const tempPassword = await issueParticipantPassword(existing.id);
    return { userId: existing.id, tempPassword };
  }

  const tempPassword = randomPassword();
  const passwordHash = await hashPassword(tempPassword);
  const user = await prisma.user.create({
    data: { email, name: fullName, passwordHash, globalRole: "USER" },
    select: { id: true },
  });
  return { userId: user.id, tempPassword };
}

/**
 * Envía (best-effort) el email con las credenciales de acceso. No lanza: si el
 * SMTP no está configurado o falla, se registra y se continúa. Genera un token
 * de un solo uso para cambiar la contraseña.
 */
async function sendAccountInvite(input: {
  to: string;
  fullName: string;
  userId: string;
  tempPassword?: string;
  lang?: Lang;
  /** Organización, para personalizar el correo con su programa/fechas. */
  organizationId?: string;
}): Promise<boolean> {
  if (!isMailConfigured()) return false;
  try {
    // Personalización del correo por organización (programa, taller, fecha límite).
    let program: Parameters<typeof invitationEmail>[0]["program"];
    if (input.organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: input.organizationId },
        select: {
          name: true,
          programName: true,
          sessionDate: true,
          sessionInfo: true,
          deadline: true,
          welcomeIntro: true,
        },
      });
      if (org?.programName) {
        program = {
          name: org.programName,
          sessionDate: org.sessionDate,
          sessionInfo: org.sessionInfo,
          deadline: org.deadline,
          welcomeIntro: org.welcomeIntro,
          orgName: org.name,
        };
      }
    }
    const token = await createPasswordSetToken(input.userId);
    // El enlace de acceso lleva las credenciales para autocompletar el login
    // (el usuario solo pulsa "Entrar"). Van codificadas en la query.
    const loginParams = new URLSearchParams({
      next: "/evaluacion",
      email: input.to,
    });
    if (input.tempPassword) loginParams.set("pw", input.tempPassword);
    const email = invitationEmail({
      participantName: input.fullName,
      accountEmail: input.to,
      password: input.tempPassword,
      loginUrl: absoluteUrl(`/login?${loginParams.toString()}`),
      setPasswordUrl: absoluteUrl(`/restablecer/${token}`),
      lang: input.lang,
      program,
    });
    await sendMail({
      to: input.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    return true;
  } catch (e) {
    console.error("[sendAccountInvite] envío fallido:", e);
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

  const account = await ensureParticipantAccount(
    parsed.data.email,
    parsed.data.fullName,
  );

  const participant = await prisma.participant.create({
    data: {
      organizationId: parsed.data.organizationId,
      teamId,
      userId: account.userId,
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

  const lang: Lang = formData.get("lang") === "es" ? "es" : "ca";
  const emailed = await sendAccountInvite({
    to: parsed.data.email,
    fullName: parsed.data.fullName,
    userId: account.userId,
    tempPassword: account.tempPassword,
    lang,
    organizationId: parsed.data.organizationId,
  });

  if (teamId) revalidatePath(`/cliente/equipos/${teamId}`);
  revalidatePath("/cliente");
  revalidatePath("/facilitador");
  const message = emailed
    ? "Participante añadido. Le hemos enviado sus credenciales de acceso por email."
    : "Participante añadido. Configura el SMTP para enviarle las credenciales por email.";
  return {
    ok: true,
    message,
    ...(account.tempPassword
      ? {
          credentials: {
            email: parsed.data.email,
            password: account.tempPassword,
          },
        }
      : {}),
  };
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
      userId: true,
    },
  });
  if (!participant || !assertOrgAccess(session, participant.organizationId)) {
    return { error: "Sin permiso o participante no encontrado." };
  }

  // Participante antiguo sin cuenta → la crea ahora. Cuenta ya enlazada →
  // genera una contraseña nueva para reenviarla (salvo cuentas de staff).
  let userId = participant.userId;
  let tempPassword: string | undefined;
  if (!userId) {
    const account = await ensureParticipantAccount(
      participant.email,
      participant.fullName,
    );
    userId = account.userId;
    tempPassword = account.tempPassword;
    await prisma.participant.update({
      where: { id: participantId },
      data: { userId },
    });
  } else {
    tempPassword = await issueParticipantPassword(userId);
  }

  const sent = await sendAccountInvite({
    to: participant.email,
    fullName: participant.fullName,
    userId,
    tempPassword,
    organizationId: participant.organizationId,
  });
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
    const account = await ensureParticipantAccount(
      valid.data.email,
      valid.data.fullName,
    );
    const participant = await prisma.participant.create({
      data: {
        organizationId: parsed.data.organizationId,
        teamId,
        userId: account.userId,
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
    const sent = await sendAccountInvite({
      to: valid.data.email,
      fullName: valid.data.fullName,
      userId: account.userId,
      tempPassword: account.tempPassword,
      organizationId: parsed.data.organizationId,
    });
    if (sent) emailed += 1;
  }

  if (teamId) revalidatePath(`/cliente/equipos/${teamId}`);
  revalidatePath("/cliente");
  revalidatePath("/facilitador");

  const parts = [`${created} participantes creados`];
  if (emailed > 0) parts.push(`${emailed} emails enviados`);
  if (skipped > 0) parts.push(`${skipped} filas omitidas`);
  return { ok: true, message: parts.join(" · ") + "." };
}

/**
 * Acción en lote sobre varios participantes: borrar o reenviar invitación.
 * Opera solo sobre las personas de organizaciones a las que se tiene acceso.
 */
export async function bulkParticipantAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuth();
  const op = String(formData.get("op") ?? "");
  const ids = formData.getAll("ids").map(String).filter(Boolean);
  if (ids.length === 0) return { error: "No hay participantes seleccionados." };
  if (op !== "delete" && op !== "resend") {
    return { error: "Acción no válida." };
  }

  const targets = await prisma.participant.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      organizationId: true,
      fullName: true,
      email: true,
      userId: true,
    },
  });
  const allowed = targets.filter((t) => assertOrgAccess(session, t.organizationId));

  if (op === "delete") {
    const result = await prisma.participant.deleteMany({
      where: { id: { in: allowed.map((t) => t.id) } },
    });
    revalidatePath("/admin", "layout");
    revalidatePath("/cliente");
    revalidatePath("/facilitador");
    return { ok: true, message: `${result.count} participantes eliminados.` };
  }

  // resend
  if (!isMailConfigured()) {
    return { error: "SMTP no configurado. Define SMTP_PASS en .env.local." };
  }
  let sent = 0;
  for (const t of allowed) {
    let userId = t.userId;
    let tempPassword: string | undefined;
    if (!userId) {
      const account = await ensureParticipantAccount(t.email, t.fullName);
      userId = account.userId;
      tempPassword = account.tempPassword;
      await prisma.participant.update({
        where: { id: t.id },
        data: { userId },
      });
    } else {
      tempPassword = await issueParticipantPassword(userId);
    }
    const ok = await sendAccountInvite({
      to: t.email,
      fullName: t.fullName,
      userId,
      tempPassword,
      organizationId: t.organizationId,
    });
    if (ok) sent += 1;
  }
  return { ok: true, message: `${sent} invitaciones reenviadas.` };
}
