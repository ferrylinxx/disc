import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { logout } from "@/app/actions/auth";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { CommandPalette } from "@/components/admin/CommandPalette";
import { CommandTrigger } from "@/components/admin/CommandTrigger";
import { Toaster } from "@/components/admin/ui-client";

export const metadata = { title: "Consola GESEM" };

/** Marco de la consola admin: topbar con buscador + navegación lateral. */
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

  return (
    <div className="relative min-h-screen bg-slate-50">
      {/* Tinte de marca suave en la parte superior */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-72 bg-gradient-to-b from-sky-100/50 via-sky-50/30 to-transparent"
      />
      <CommandPalette />
      <Toaster />
      <main className="relative mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6">
        {/* Topbar */}
        <div className="animate-fade-up mb-5 flex items-center gap-3">
          <div className="flex-1">
            <CommandTrigger />
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 py-1 pl-3 pr-1 shadow-sm backdrop-blur sm:flex">
            <span className="text-xs font-medium text-slate-500">
              Hola, <span className="font-semibold text-slate-800">{greetName}</span>
            </span>
            <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-600">
              Superadmin
            </span>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur transition hover:border-slate-300 hover:text-slate-900"
            >
              Salir
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <AdminSidebar counts={{ organizations, users, participants }} />
          <div className="min-w-0 flex-1 space-y-5 pb-16">{children}</div>
        </div>
      </main>
    </div>
  );
}
