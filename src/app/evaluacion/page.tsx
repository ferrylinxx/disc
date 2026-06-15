import type { Metadata } from "next";
import { getActiveInstrument } from "@/lib/instruments";
import { Questionnaire } from "@/components/Questionnaire";
import { requireAuth } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Evaluación · DISC GESEM",
  description: "Cuestionario conductual DISC GESEM.",
};

export default async function EvaluacionPage() {
  await requireAuth();
  const def = getActiveInstrument();
  return <Questionnaire def={def} />;
}
