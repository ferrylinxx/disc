"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/auth/session";
import { homePathForRole, primaryRole } from "@/lib/auth/rbac";
import type { GlobalRole, MembershipRole } from "@/lib/auth/jwt";

const LoginSchema = z.object({
  email: z.email({ error: "Introduce un email válido." }).trim().toLowerCase(),
  password: z.string().min(1, { error: "La contraseña es obligatoria." }),
});

export interface LoginState {
  error?: string;
}

/** Verifica credenciales, crea la sesión y redirige al panel del rol. */
export async function login(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Revisa el email y la contraseña." };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email },
    include: { memberships: true },
  });

  if (!user || !user.passwordHash) {
    return { error: "Credenciales incorrectas." };
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return { error: "Credenciales incorrectas." };
  }

  const memberships = user.memberships.map((m) => ({
    organizationId: m.organizationId,
    role: m.role as MembershipRole,
  }));

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    globalRole: user.globalRole as GlobalRole,
    memberships,
  });

  const dest = homePathForRole(
    primaryRole({
      userId: user.id,
      email: user.email,
      name: user.name,
      globalRole: user.globalRole as GlobalRole,
      memberships,
      expiresAt: "",
    }),
  );
  redirect(dest);
}

/** Cierra la sesión y vuelve al login. */
export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
