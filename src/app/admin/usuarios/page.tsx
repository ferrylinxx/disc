import { requireRole } from "@/lib/auth/dal";
import { adminUsers } from "@/lib/data/dashboard";
import { UserManager } from "@/components/dashboard/UserManager";
import { PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Usuarios · Consola GESEM" };

export default async function AdminUsersPage() {
  const session = await requireRole("SUPERADMIN");
  const { users, organizations } = await adminUsers();

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Cuentas de acceso a la plataforma: superadmins, admins de cliente y facilitadores, con su presencia en línea."
      />
      <UserManager
        users={users}
        organizations={organizations}
        currentUserId={session.userId}
      />
    </>
  );
}
