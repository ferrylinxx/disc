import { requireRole } from "@/lib/auth/dal";
import { adminUsers } from "@/lib/data/dashboard";
import { UserManager } from "@/components/dashboard/UserManager";

export const metadata = { title: "Usuarios · Consola GESEM" };

export default async function AdminUsersPage() {
  const session = await requireRole("SUPERADMIN");
  const { users, organizations } = await adminUsers();

  return (
    <UserManager
      users={users}
      organizations={organizations}
      currentUserId={session.userId}
    />
  );
}
