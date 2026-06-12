import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { AdminSidebar } from "@/components/admin/Sidebar";

export const metadata = { title: "Consola GESEM" };

const dayFmt = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** Marco de la consola admin: topbar fina + navegación lateral persistente. */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireRole("SUPERADMIN");
  const [organizations, users, participants] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.participant.count(),
  ]);

  const greetName = (session.name ?? session.email).split(" ")[0];
  const today = dayFmt.format(new Date());

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6">
      <div className="animate-fade-up mb-5 flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-3">
          <span className="bg-brand flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white shadow-lg shadow-indigo-500/30">
            ⌘
          </span>
          <div>
            <div className="text-sm font-bold tracking-tight text-slate-900">
              Consola GESEM
            </div>
            <div className="text-xs capitalize text-slate-400">{today}</div>
          </div>
        </div>
        <div className="text-xs font-medium text-slate-500">
          Hola, <span className="font-semibold text-slate-800">{greetName}</span>
          <span className="ml-2 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-600">
            Superadmin
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        <AdminSidebar counts={{ organizations, users, participants }} />
        <div className="min-w-0 flex-1 space-y-5 pb-16">{children}</div>
      </div>
    </main>
  );
}
