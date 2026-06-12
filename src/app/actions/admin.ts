"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import type { ActionState } from "@/app/actions/org";

/**
 * Acciones de gestión exclusivas de la consola SUPERADMIN. Los borrados se
 * apoyan en las cascadas del schema (organización → proyectos/equipos/
 * participantes/assessments; participante → invitaciones/respuestas/resultados).
 */

const IdSchema = z.object({ id: z.string().min(1) });

const RenameOrgSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, { error: "Nombre demasiado corto." }).trim(),
});

/** Renombra una organización (el slug se mantiene estable como identificador). */
export async function updateOrganization(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("SUPERADMIN");
  const parsed = RenameOrgSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
  });
  if (!parsed.success) return { error: "Revisa el nombre." };

  await prisma.organization.update({
    where: { id: parsed.data.id },
    data: { name: parsed.data.name },
  });
  revalidatePath("/admin", "layout");
  revalidatePath("/cliente");
  return { ok: true };
}

/**
 * Elimina una organización con todo su contenido (proyectos, equipos,
 * participantes, evaluaciones y resultados). Redirige al listado.
 */
export async function deleteOrganization(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("SUPERADMIN");
  const parsed = IdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { error: "Organización inválida." };

  const org = await prisma.organization.findUnique({
    where: { id: parsed.data.id },
    select: { id: true },
  });
  if (!org) return { error: "La organización no existe." };

  await prisma.organization.delete({ where: { id: org.id } });
  revalidatePath("/admin", "layout");
  revalidatePath("/cliente");
  redirect("/admin/organizaciones");
}

/** Elimina un proyecto (sus equipos caen en cascada; participantes quedan sin equipo). */
export async function deleteProject(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("SUPERADMIN");
  const parsed = IdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { error: "Proyecto inválido." };

  await prisma.project.delete({ where: { id: parsed.data.id } });
  revalidatePath("/admin", "layout");
  revalidatePath("/cliente");
  return { ok: true };
}

/** Elimina un equipo (los participantes quedan sin equipo, no se borran). */
export async function deleteTeam(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("SUPERADMIN");
  const parsed = IdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { error: "Equipo inválido." };

  await prisma.team.delete({ where: { id: parsed.data.id } });
  revalidatePath("/admin", "layout");
  revalidatePath("/cliente");
  return { ok: true };
}

/**
 * Elimina un participante con sus invitaciones, respuestas y resultados.
 * Acción irreversible: la confirmación se pide en la UI.
 */
export async function deleteParticipant(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("SUPERADMIN");
  const parsed = IdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { error: "Participante inválido." };

  await prisma.participant.delete({ where: { id: parsed.data.id } });
  revalidatePath("/admin", "layout");
  revalidatePath("/cliente");
  revalidatePath("/facilitador");
  return { ok: true };
}
