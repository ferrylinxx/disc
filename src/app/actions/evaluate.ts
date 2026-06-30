"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getActiveInstrument } from "@/lib/instruments";
import { score, discGraphShares } from "@/lib/engine/scoring";
import type { ScoringResult, DiscGraphs } from "@/lib/engine/types";
import { buildProfileNarrativeDb } from "@/lib/narratives/library";
import type { ProfileNarrative } from "@/lib/narratives/disc-gesem.profiles";

const responseSchema = z.object({
  itemCode: z.string(),
  mostOptionCode: z.string(),
  leastOptionCode: z.string(),
  // Trazabilidad para validación (opcional): tiempo y cambios por ítem.
  timeMs: z.number().int().nonnegative().optional(),
  changeCount: z.number().int().nonnegative().optional(),
});

type ResponseInput = z.infer<typeof responseSchema>;

const payloadSchema = z.object({
  responses: z.array(responseSchema),
  // Token de invitación: si llega, el resultado se persiste en BD.
  token: z.string().optional(),
  // Autoposicionamiento inicial elegido por el participante.
  selfPlacement: z.string().optional(),
  // Reflexión abierta final del participante.
  reflection: z.string().optional(),
});

export interface EvaluateResponse {
  ok: boolean;
  error?: string;
  result?: ScoringResult;
  /** Narrativa del informe compuesta desde la biblioteca (BD + valores base). */
  narrative?: ProfileNarrative;
  /** Tres lecturas DISC (público=Más, privado=Menos) para el informe. */
  graphs?: DiscGraphs;
  /** true si el resultado quedó guardado en base de datos. */
  saved?: boolean;
}

/**
 * Server Action que recibe las respuestas Más/Menos, valida, ejecuta el motor
 * de scoring y devuelve el resultado. Si llega un `token` de invitación válido,
 * además persiste ResponseSet, ItemResponse, Result y ResultDimensionScore, y
 * marca la invitación y el participante como completados.
 */
export async function evaluate(input: unknown): Promise<EvaluateResponse> {
  const parsed = payloadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Datos de respuesta inválidos." };
  }

  const def = getActiveInstrument();
  const validItems = new Set(def.items.map((i) => i.code));

  for (const r of parsed.data.responses) {
    if (!validItems.has(r.itemCode)) {
      return { ok: false, error: `Ítem desconocido: ${r.itemCode}` };
    }
    if (r.mostOptionCode === r.leastOptionCode) {
      return { ok: false, error: `Más y Menos no pueden coincidir en ${r.itemCode}` };
    }
  }

  const result = score(def, parsed.data.responses);
  if (!result.quality.complete) {
    return { ok: false, error: "Debes responder todos los ítems." };
  }

  const narrative = await buildProfileNarrativeDb(result);
  const graphs = discGraphShares(def, parsed.data.responses);

  if (parsed.data.token) {
    try {
      const saved = await persistResult(
        parsed.data.token,
        parsed.data.responses,
        result,
        parsed.data.selfPlacement,
        parsed.data.reflection,
      );
      return { ok: true, result, narrative, graphs, saved };
    } catch (e) {
      console.error("[evaluate] persistencia fallida:", e);
      return { ok: false, error: "No se pudo guardar el resultado." };
    }
  }

  return { ok: true, result, narrative, graphs };
}

/**
 * Persiste el conjunto de respuestas y el resultado para una invitación.
 * Mapea los códigos del instrumento (dimensión/contexto/ítem/opción) a los IDs
 * de la versión publicada en BD y escribe todo en una transacción.
 */
async function persistResult(
  token: string,
  responses: ResponseInput[],
  result: ScoringResult,
  selfPlacement: string | undefined,
  reflection: string | undefined,
): Promise<boolean> {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { assessment: true },
  });
  if (!invitation) throw new Error("Invitación no encontrada.");
  // Reenvío de una invitación ya completada: no duplicamos persistencia.
  if (invitation.status === "COMPLETED") return false;

  const version = await prisma.instrumentVersion.findUnique({
    where: { id: invitation.assessment.versionId },
    include: {
      dimensions: { select: { id: true, code: true } },
      contexts: { select: { id: true, code: true } },
      items: { select: { id: true, code: true, options: { select: { id: true, code: true } } } },
    },
  });
  if (!version) throw new Error("Versión del instrumento no encontrada.");

  const dimId = new Map(version.dimensions.map((d) => [d.code, d.id]));
  const ctxId = new Map(version.contexts.map((c) => [c.code, c.id]));
  const itemId = new Map(version.items.map((i) => [i.code, i.id]));
  const optionId = new Map<string, string>();
  for (const it of version.items) {
    for (const o of it.options) optionId.set(`${it.code}:${o.code}`, o.id);
  }

  const { assessmentId, participantId } = invitation;
  const versionId = version.id;

  await prisma.$transaction(async (tx) => {
    const responseSet = await tx.responseSet.create({
      data: {
        assessmentId,
        participantId,
        versionId,
        selfPlacement: selfPlacement
          ? ({ code: selfPlacement } as Prisma.InputJsonValue)
          : undefined,
        reflection: reflection ?? null,
        submittedAt: new Date(),
        responses: {
          create: responses.map((r) => ({
            itemId: itemId.get(r.itemCode)!,
            mostOptionId: optionId.get(`${r.itemCode}:${r.mostOptionCode}`)!,
            leastOptionId: optionId.get(`${r.itemCode}:${r.leastOptionCode}`)!,
            timeMs: r.timeMs ?? null,
            changeCount: r.changeCount ?? null,
          })),
        },
      },
    });

    const scoreRows = result.global.map((s) => ({
      dimensionId: dimId.get(s.dimensionCode)!,
      contextId: null as string | null,
      raw: Math.round(s.raw),
      percent: Math.round(s.percent),
    }));
    for (const [ctxCode, arr] of Object.entries(result.byContext)) {
      for (const s of arr) {
        scoreRows.push({
          dimensionId: dimId.get(s.dimensionCode)!,
          contextId: ctxId.get(ctxCode) ?? null,
          raw: Math.round(s.raw),
          percent: Math.round(s.percent),
        });
      }
    }

    await tx.result.create({
      data: {
        responseSetId: responseSet.id,
        participantId,
        versionId,
        profileCode: result.profileCode,
        primaryDimensionId: dimId.get(result.primaryDimension)!,
        secondaryDimensionId: dimId.get(result.secondaryDimension)!,
        isPureProfile: result.isEq,
        eq: Math.round(result.eq),
        quality: result.quality as unknown as Prisma.InputJsonValue,
        scores: { create: scoreRows },
      },
    });

    await tx.participant.update({
      where: { id: participantId },
      data: { status: "COMPLETED" },
    });
    await tx.invitation.update({
      where: { id: invitation.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  });

  revalidatePath("/facilitador");
  revalidatePath("/cliente");
  revalidatePath("/admin", "layout");
  return true;
}
