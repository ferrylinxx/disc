"use client";

import { useEffect } from "react";

/** Intervalo entre latidos de presencia (ms). */
const HEARTBEAT_MS = 45_000;

/**
 * Envía un latido a /api/presence al montar y cada ~45s mientras la pestaña está
 * visible, para mantener actualizado el estado en línea del usuario. Si no hay
 * sesión, el endpoint responde 204 (no-op). Se monta en el layout raíz, por lo
 * que cubre cualquier área autenticada de la app.
 */
export function PresenceHeartbeat() {
  useEffect(() => {
    let cancelled = false;

    const ping = () => {
      if (document.visibilityState !== "visible") return;
      fetch("/api/presence", {
        method: "POST",
        cache: "no-store",
        keepalive: true,
      }).catch(() => {
        // Silencioso: la presencia no es crítica para la sesión.
      });
    };

    ping();
    const id = window.setInterval(() => {
      if (!cancelled) ping();
    }, HEARTBEAT_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") ping();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
