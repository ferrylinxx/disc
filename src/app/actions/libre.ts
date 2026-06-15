"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

const schema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(100),
  email: z.string().trim().email("Introduce un email válido."),
});

export type LibreState = { error: string } | null;

/**
 * Crea un Participant + Invitation para la evaluación pública (sin login).
 * Usa una organización "libre" especial y redirige al token generado.
 */
export async function startLibreEvaluation(
  _state: LibreState,
  formData: FormData,
): Promise<LibreState> {
  const parsed = schema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Datos inválidos." };
  }
  const { fullName, email } = parsed.data;

  const activeVersion = await prisma.instrumentVersion.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });
  if (!activeVersion) {
    return {
      error: "No hay cuestionario activo. Contacta con el administrador.",
    };
  }

  // Org "libre" — se crea la primera vez, se reutiliza siempre.
  const org = await prisma.organization.upsert({
    where: { slug: "libre" },
    create: { name: "Evaluaciones Libres", slug: "libre" },
    update: {},
  });

  // Assessment permanente para evaluaciones libres de esta versión.
  let assessment = await prisma.assessment.findFirst({
    where: { organizationId: org.id, versionId: activeVersion.id, name: "LIBRE" },
  });
  if (!assessment) {
    assessment = await prisma.assessment.create({
      data: {
        organizationId: org.id,
        versionId: activeVersion.id,
        name: "LIBRE",
        status: "ACTIVE",
      },
    });
  }

  const participant = await prisma.participant.create({
    data: {
      organizationId: org.id,
      email,
      fullName,
      status: "INVITED",
    },
  });

  const token = crypto.randomUUID();
  await prisma.invitation.create({
    data: {
      assessmentId: assessment.id,
      participantId: participant.id,
      token,
      status: "PENDING",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  redirect(`/evaluacion/${token}`);
}
