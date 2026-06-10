import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Cliente Supabase para entornos de servidor (Server Components, Route
 * Handlers, Server Actions). Sincroniza la sesión vía cookies.
 *
 * En Server Components la escritura de cookies no está permitida durante el
 * render: el try/catch evita el error y la renovación de sesión se delega al
 * middleware/route handler correspondiente.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Llamado desde un Server Component: ignorar.
          }
        },
      },
    },
  );
}
