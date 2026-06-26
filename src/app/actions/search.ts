"use server";

import { requireRole } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";

export interface SearchHit {
  kind: "org" | "participant" | "user";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

/**
 * Búsqueda global de la consola (organizaciones, participantes y usuarios).
 * Pensada para el command palette (⌘K). Solo SUPERADMIN.
 */
export async function globalSearch(query: string): Promise<SearchHit[]> {
  await requireRole("SUPERADMIN");
  const q = query.trim();
  if (q.length < 2) return [];

  const [orgs, participants, users] = await Promise.all([
    prisma.organization.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, slug: true, _count: { select: { participants: true } } },
      take: 5,
    }),
    prisma.participant.findMany({
      where: {
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        organization: { select: { name: true } },
      },
      take: 6,
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, email: true },
      take: 4,
    }),
  ]);

  const hits: SearchHit[] = [];
  for (const o of orgs) {
    hits.push({
      kind: "org",
      id: o.id,
      title: o.name,
      subtitle: `/${o.slug} · ${o._count.participants} participantes`,
      href: `/admin/organizaciones/${o.id}`,
    });
  }
  for (const p of participants) {
    hits.push({
      kind: "participant",
      id: p.id,
      title: p.fullName,
      subtitle: `${p.email}${p.organization ? ` · ${p.organization.name}` : ""}`,
      href: `/admin/participantes?q=${encodeURIComponent(p.fullName)}`,
    });
  }
  for (const u of users) {
    hits.push({
      kind: "user",
      id: u.id,
      title: u.name ?? u.email,
      subtitle: u.email,
      href: `/admin/usuarios`,
    });
  }
  return hits;
}
