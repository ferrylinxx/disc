import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para componentes de navegador ("use client").
 * Usa la clave publishable (pública por diseño, protegida por RLS).
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
