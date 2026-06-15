import type { Metadata } from "next";
import { IntakeForm } from "@/components/IntakeForm";

export const metadata: Metadata = {
  title: "Evaluación · DISC GESEM",
  description: "Cuestionario conductual DISC GESEM.",
};

export default function EvaluacionPage() {
  return <IntakeForm />;
}
