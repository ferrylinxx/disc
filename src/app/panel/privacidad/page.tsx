import { requireAuth } from "@/lib/auth/dal";
import { getLang } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n/dictionaries";
import { Card } from "@/components/PanelUI";
import { DeleteAccount } from "@/components/PanelClient";

/** Panel · Privacidad (RGPD): descargar datos y eliminar cuenta. */
export default async function PanelPrivacyPage() {
  await requireAuth();
  const lang = await getLang();
  const t = getDict(lang).panel;

  return (
    <div className="max-w-xl space-y-5">
      <Card title={t.privacyTitle} hint={t.privacyHint}>
        <a
          href="/api/mis-datos"
          download
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          ↓ {t.downloadData}
        </a>
      </Card>

      <Card title={t.deleteTitle}>
        <DeleteAccount
          labels={{
            button: t.deleteButton,
            confirmPlaceholder: t.deleteConfirmPlaceholder,
            confirmWord: "ELIMINAR",
            cancel: t.deleteCancel,
            warning: t.deleteWarning,
          }}
        />
      </Card>

      <p className="text-center text-xs leading-relaxed text-slate-400">
        {t.notDiagnosis}
      </p>
    </div>
  );
}
