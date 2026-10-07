import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { getLang } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n/dictionaries";
import { panelParticipant } from "@/lib/data/panel";
import { Card, DataRows } from "@/components/PanelUI";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { ProfileForm } from "@/components/profile/ProfileForm";

/** Panel · Cuenta: foto de perfil, datos personales y datos de la participación. */
export default async function PanelAccountPage() {
  const session = await requireAuth();
  const lang = await getLang();
  const dict = getDict(lang);
  const t = dict.panel;
  const [participant, user] = await Promise.all([
    panelParticipant(session.userId),
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, image: true, jobTitle: true, phone: true, globalRole: true },
    }),
  ]);
  if (!user) redirect("/login");

  const name = user.name ?? participant?.fullName ?? user.email;
  const superadmin = user.globalRole === "SUPERADMIN";
  const statusMap: Record<string, string> = {
    INVITED: t.statusInvited,
    IN_PROGRESS: t.statusInProgress,
    COMPLETED: t.statusCompleted,
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start">
      <Card title={dict.profile.photoTitle} hint={dict.profile.photoHint}>
        {/* La corona del superadmin sobresale por arriba: necesita aire. */}
        <div className={superadmin ? "pb-1 pt-12" : "pb-1 pt-4"}>
          <AvatarUploader name={name} image={user.image} superadmin={superadmin} labels={dict.profile} />
        </div>
      </Card>

      <div className="min-w-0 space-y-5">
        <Card title={dict.profile.dataTitle} hint={dict.profile.dataHint}>
          <ProfileForm
            defaults={{ name, email: user.email, jobTitle: user.jobTitle, phone: user.phone }}
            labels={dict.profile}
          />
        </Card>

        {participant && (
          <Card title={t.accountTitle}>
            <DataRows
              rows={[
                { label: t.organization, value: participant.organization.name },
                { label: t.team, value: participant.team?.name ?? t.none },
                { label: t.statusLabel, value: statusMap[participant.status] ?? participant.status },
              ]}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
