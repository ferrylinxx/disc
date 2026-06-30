import type { Metadata } from "next";
import { IntakeForm } from "@/components/IntakeForm";
import { getLang } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Evaluación · DISC GESEM",
  description: "Cuestionario conductual DISC GESEM.",
};

export default async function EvaluacionPage() {
  const lang = await getLang();
  return <IntakeForm lang={lang} />;
}
