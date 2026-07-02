import { requireAuth } from "@/lib/auth/dal";
import { getLang } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n/dictionaries";
import { Card } from "@/components/PanelUI";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

/** Panel · Seguridad: cambio de contraseña. */
export default async function PanelSecurityPage() {
  await requireAuth();
  const lang = await getLang();
  const t = getDict(lang).panel;

  return (
    <div className="max-w-xl">
      <Card title={t.securityTitle} hint={t.securityHint}>
        <ChangePasswordForm
          labels={{
            newPassword: t.newPassword,
            repeatPassword: t.repeatPassword,
            save: t.save,
            saved: t.saved,
          }}
        />
      </Card>
    </div>
  );
}
