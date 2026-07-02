"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { consumePasswordSetToken, hashPassword } from "@/lib/auth/password";

export interface SetPasswordState {
  error?: string;
}

const Schema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, { error: "La contraseña debe tener al menos 8 caracteres." }),
    confirm: z.string().min(1),
  })
  .refine((d) => d.password === d.confirm, {
    error: "Las contraseñas no coinciden.",
    path: ["confirm"],
  });

/**
 * Establece (o cambia) la contraseña de una cuenta a partir de un token de un
 * solo uso enviado por email. Al terminar redirige a /login para iniciar sesión.
 */
export async function setPassword(
  _state: SetPasswordState,
  formData: FormData,
): Promise<SetPasswordState> {
  const parsed = Schema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Revisa los datos.";
    return { error: first };
  }

  const userId = await consumePasswordSetToken(parsed.data.token);
  if (!userId) {
    return {
      error: "El enlace no es válido o ha caducado. Solicita uno nuevo.",
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  redirect("/login?reset=ok");
}
