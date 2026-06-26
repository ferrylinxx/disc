import { redirect } from "next/navigation";

/**
 * Punto de entrada: el acceso va directo al login. Los usuarios autenticados
 * son redirigidos a su panel desde /login (proxy). La landing sigue disponible
 * en /inicio.
 */
export default function Home() {
  redirect("/login");
}
