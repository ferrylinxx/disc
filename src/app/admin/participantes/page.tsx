import { requireRole } from "@/lib/auth/dal";
import { adminParticipants } from "@/lib/data/dashboard";
import { AdminParticipants } from "@/components/dashboard/AdminParticipants";

export const metadata = { title: "Participantes · Consola GESEM" };

export default async function AdminParticipantsPage() {
  await requireRole("SUPERADMIN");
  const participants = await adminParticipants();

  return <AdminParticipants participants={participants} />;
}
