import { requireAuth } from "@/lib/auth/dal";
import { getLang } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n/dictionaries";
import { panelParticipant } from "@/lib/data/panel";
import { Card, DataRows } from "@/components/PanelUI";
import { EditNameForm } from "@/components/PanelClient";

/** Panel · Cuenta: datos de la cuenta y edición del nombre. */
export default async function PanelAccountPage() {
  const session = await requireAuth();
  const lang = await getLang();
  const t = getDict(lang).panel;
  const participant = await panelParticipant(session.userId);

  const name = participant?.fullName ?? session.name ?? session.email;
  const statusMap: Record<string, string> = {
    INVITED: t.statusInvited,
    IN_PROGRESS: t.statusInProgress,
    COMPLETED: t.statusCompleted,
  };
  const rows = [
    { label: t.name, value: name },
    { label: t.email, value: participant?.email ?? session.email },
    { label: t.organization, value: participant?.organization.name ?? t.none },
    { label: t.team, value: participant?.team?.name ?? t.none },
  ];
  if (participant) {
    rows.push({
      label: t.statusLabel,
      value: statusMap[participant.status] ?? participant.status,
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card title={t.accountTitle}>
        <DataRows rows={rows} />
      </Card>

      <Card title={t.editName}>
        <EditNameForm
          defaultName={name}
          labels={{
            placeholder: t.namePlaceholder,
            save: t.saveName,
            saved: t.nameSaved,
          }}
        />
      </Card>
    </div>
  );
}
