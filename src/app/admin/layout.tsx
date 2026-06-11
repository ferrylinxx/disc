import type { ReactNode } from "react";
import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";

export const metadata = { title: "Consola GESEM" };

const dayFmt = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const heroPill =
  "rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/25";

/** Marco común del panel admin: cabecera + navegación lateral persistente. */
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
    <main className="mx-auto w-full max-w-7xl px-6 py-8">
      <section className="bg-brand animate-fade-up relative mb-6 overflow-hidden rounded-3xl p-7 text-white shadow-xl shadow-indigo-500/20">
        <div
          className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
              Consola GESEM
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight">
              Hola, {greetName}
            </h1>
            <p className="mt-1 text-sm capitalize text-white/70">{today}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/cliente" className={heroPill}>
              Panel cliente
            </Link>
            <Link href="/facilitador" className={heroPill}>
              Facilitador
            </Link>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <AdminSidebar counts={{ organizations, users, participants }} />
        <div className="min-w-0 flex-1 space-y-6">{children}</div>
      </div>
    </main>
  );
}
