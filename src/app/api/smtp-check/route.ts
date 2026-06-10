import { currentSession } from "@/lib/auth/dal";
import { effectiveRoles } from "@/lib/auth/rbac";
import { verifyMail } from "@/lib/email/mailer";

/**
 * Diagnóstico SMTP (solo admin). Ejecuta `transporter.verify()` contra el
 * servidor configurado y devuelve si acepta la conexión y las credenciales.
 * No expone la contraseña: solo metadatos no sensibles y el resultado.
 *
 * GET /api/smtp-check
 */
export async function GET(): Promise<Response> {
  const session = await currentSession();
  if (!session) {
    return Response.json({ error: "No autenticado." }, { status: 401 });
  }
  const roles = effectiveRoles(session);
  const isAdmin = roles.includes("SUPERADMIN") || roles.includes("ORG_ADMIN");
  if (!isAdmin) {
    return Response.json({ error: "Acceso denegado." }, { status: 403 });
  }

  const result = await verifyMail();
  return Response.json(result, { status: result.ok ? 200 : 502 });
}
