"use server";

import { requireAuth } from "@/lib/auth/dal";
import { adminOrganizationIds, effectiveRoles } from "@/lib/auth/rbac";
import type { SessionPayload } from "@/lib/auth/jwt";
import { allOrganizationIds, participantReport } from "@/lib/data/dashboard";
import { getActiveInstrument } from "@/lib/instruments";
import { buildProfileNarrativeDb, loadProfileBlocks } from "@/lib/narratives/library";
import { reportEmail } from "@/lib/email/templates";
import { absoluteUrl, isMailConfigured, sendMail } from "@/lib/email/mailer";
import type { ActionState } from "./org";

/** IDs de organización autorizados para la sesión (SUPERADMIN ve todas). */
async function authorizedOrgIds(session: SessionPayload): Promise<string[]> {
  return effectiveRoles(session).includes("SUPERADMIN")
    ? await allOrganizationIds()
    : adminOrganizationIds(session);
}

/**
 * Envía por email el informe individual del participante (lo genera el admin;
 * el participante no lo ve en la app). Reconstruye el resultado desde BD.
 */
export async function sendParticipantReport(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuth();
  const participantId = String(formData.get("participantId") ?? "");
  if (!participantId) return { error: "Falta el participante." };
  if (!isMailConfigured()) {
    return { error: "SMTP no configurado. Define SMTP_PASS en .env.local." };
  }

  const orgIds = await authorizedOrgIds(session);
  const data = await participantReport(participantId, orgIds);
  if (!data) return { error: "Sin permiso o participante no encontrado." };
  if (!data.result) {
    return { error: "El participante aún no ha completado la evaluación." };
  }

  const def = getActiveInstrument();
  const narrative = await buildProfileNarrativeDb(data.result);
  const blocks = await loadProfileBlocks(data.result.profileCode);
  const email = reportEmail({
    participantName: data.participant.fullName,
    result: data.result,
    def,
    narrative,
    blocks,
    reportUrl: absoluteUrl(
      `/login?next=/evaluacion&email=${encodeURIComponent(data.participant.email)}`,
    ),
  });
  try {
    await sendMail({
      to: data.participant.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
  } catch (e) {
    console.error("[sendParticipantReport] envío fallido:", e);
    return { error: "No se pudo enviar el correo. Revisa la configuración SMTP." };
  }
  return { ok: true };
}
