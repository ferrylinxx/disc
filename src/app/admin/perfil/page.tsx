import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { getDict } from "@/lib/i18n/dictionaries";
import { Card, PageHeader } from "@/components/admin/ui";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export const metadata = { title: "Mi perfil · Consola" };

/** Consola · Mi perfil: foto, datos personales y contraseña del propio superadmin. */
export default async function AdminProfilePage() {
  const session = await requireRole("SUPERADMIN");
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      email: true,
      image: true,
      jobTitle: true,
      phone: true,
      createdAt: true,
      memberships: {
        select: { role: true, organization: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!user) redirect("/login");

  // La consola va siempre en castellano (el selector de idioma es para los informes).
  const dict = getDict("es");
  const t = dict.profile;
  const name = user.name ?? user.email;
  const since = user.createdAt.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const rows = [
    { label: "Correo", value: user.email },
    ...(user.phone ? [{ label: "Teléfono", value: user.phone }] : []),
    { label: "Miembro desde", value: since },
    ...(user.memberships.length
      ? [
          {
            label: "Gestiona",
            value: user.memberships
              .map((m) => `${m.organization.name}${m.role === "FACILITATOR" ? " (facilitador)" : ""}`)
              .join(", "),
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader
        title="Mi perfil"
        description="Tu foto, tus datos y tu contraseña. Los cambios se ven al momento en toda la consola."
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start">
        <section className="animate-fade-up overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm shadow-slate-200/40">
          <div aria-hidden className="relative h-28 overflow-hidden bg-gradient-to-br from-sky-500 via-sky-400 to-cyan-300">
            <span className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/15" />
            <span className="absolute -bottom-14 -left-8 h-32 w-32 rounded-full bg-white/10" />
            <span className="absolute right-16 top-6 h-10 w-10 rounded-full bg-white/10" />
          </div>
          <div className="-mt-12 px-6 pb-6">
            <AvatarUploader name={name} image={user.image} superadmin labels={t}>
              <div className="mt-4">
                <h2 className="text-lg font-bold tracking-tight text-slate-900">{name}</h2>
                {user.jobTitle && <p className="mt-0.5 text-sm text-slate-500">{user.jobTitle}</p>}
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-100 to-yellow-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">
                  <CrownIcon />
                  Superadmin
                </span>
              </div>
            </AvatarUploader>

            <dl className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
              {rows.map((r) => (
                <div key={r.label} className="flex items-baseline justify-between gap-4">
                  <dt className="shrink-0 text-xs font-medium text-slate-400">{r.label}</dt>
                  <dd className="min-w-0 truncate text-right font-medium text-slate-700" title={r.value}>
                    {r.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <div className="min-w-0 space-y-5">
          <Card title={t.dataTitle} description={t.dataHint}>
            <ProfileForm
              defaults={{ name, email: user.email, jobTitle: user.jobTitle, phone: user.phone }}
              labels={t}
            />
          </Card>
          <Card title="Contraseña" description="Mínimo 8 caracteres. La próxima vez que entres, usa la nueva.">
            <ChangePasswordForm
              labels={{
                newPassword: dict.panel.newPassword,
                repeatPassword: dict.panel.repeatPassword,
                save: dict.panel.save,
                saved: dict.panel.saved,
              }}
            />
          </Card>
        </div>
      </div>
    </>
  );
}

function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden>
      <path d="M3 8.5 7.5 12 12 5l4.5 7L21 8.5 19 18H5Z" />
    </svg>
  );
}
