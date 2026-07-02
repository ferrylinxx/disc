import { requireAuth } from "@/lib/auth/dal";
import { getLang } from "@/lib/i18n/server";
import { Glossary } from "@/components/Glossary";

/** Panel · Glosario: términos DISC GESEM explicados. */
export default async function PanelGlossaryPage() {
  await requireAuth();
  const lang = await getLang();
  return <Glossary lang={lang} />;
}
