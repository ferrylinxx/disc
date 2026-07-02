import type { ReactNode } from "react";
import { requireAuth } from "@/lib/auth/dal";
import { getLang } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n/dictionaries";
import { logout } from "@/app/actions/auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PanelTabs } from "@/components/PanelTabs";
import { GlossaryButton } from "@/components/GlossaryDrawer";
import { panelParticipant } from "@/lib/data/panel";

export const metadata = { title: "Tu espacio · DISC GESEM" };

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
  const name = participant?.fullName ?? session.name ?? session.email;

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
        <div className="flex items-center gap-2">
          <GlossaryButton lang={lang} />
          <LanguageSwitcher lang={lang} />
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              {t.logout}
            </button>
          </form>
        </div>
      </div>

      <PanelTabs tabs={tabs} />

      <div className="mt-6">{children}</div>
    </main>
  );
}
