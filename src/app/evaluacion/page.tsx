import type { Metadata } from "next";
import { getActiveInstrument } from "@/lib/instruments";
import { Questionnaire } from "@/components/Questionnaire";

export const metadata: Metadata = {
  title: "Evaluación · DISC GESEM",
  description: "Cuestionario conductual DISC GESEM.",
};

/**
 * Página de la experiencia del participante. Carga la definición del
 * instrumento activo en el servidor y la entrega al flujo cliente.
 */
export default function EvaluacionPage() {
  const def = getActiveInstrument();
  return <Questionnaire def={def} />;
}
