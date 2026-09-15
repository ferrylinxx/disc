import type { ReactNode } from "react";
import { requireAuth } from "@/lib/auth/dal";
import { getLang } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n/dictionaries";
import { PanelTabs } from "@/components/PanelTabs";
import { GlossaryButton } from "@/components/GlossaryDrawer";
import { panelParticipant } from "@/lib/data/panel";

export const metadata = { title: "Tu espacio" };

/** Marco del panel del participante: cabecera + pestañas por sección. */
export default async function PanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAuth();
  const lang = await getLang();
  const t = getDict(lang).panel;
  const participant = await panelParticipant(session.userId);
  // Mismo nombre que la cabecera de la web (la cuenta), no el de la ficha.
  const name = session.name ?? participant?.fullName ?? session.email;

  const tabs = [
    { href: "/panel", label: t.tabOverview },
    { href: "/panel/cuenta", label: t.tabAccount },
    { href: "/panel/seguridad", label: t.tabSecurity },
    { href: "/panel/privacidad", label: t.tabPrivacy },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:py-12">
      <div className="animate-fade-up mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-sky-600">
            {t.hello}, {name.split(" ")[0]}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {t.title}
          </h1>
        </div>
        {/* Idioma y salir ya están en la cabecera de la web: aquí no se repiten. */}
        <GlossaryButton lang={lang} />
      </div>

      <PanelTabs tabs={tabs} />

      <div className="mt-6">{children}</div>
    </main>
  );
}
