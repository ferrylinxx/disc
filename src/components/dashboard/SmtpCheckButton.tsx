"use client";

import { useState } from "react";

interface CheckResult {
  ok: boolean;
  config?: { host?: string; port?: number; secure?: boolean; user?: string };
  error?: string;
}

/**
 * Botón de diagnóstico SMTP (solo admin). Llama a /api/smtp-check, que ejecuta
 * `transporter.verify()` en el servidor, y muestra si el host acepta conexión y
 * credenciales. No expone la contraseña: solo metadatos no sensibles.
 */
export function SmtpCheckButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/smtp-check", { cache: "no-store" });
      const data = (await res.json()) as CheckResult;
      setResult(data);
    } catch {
      setResult({ ok: false, error: "No se pudo contactar con el servidor." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-60"
      >
        {loading ? "Verificando…" : "Probar SMTP"}
      </button>

      {result && (
        <div
          className={`rounded-xl border p-3 text-sm ${
            result.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <div className="font-semibold">
            {result.ok
              ? "✓ Conexión y credenciales correctas"
              : "✕ No se pudo verificar el envío"}
          </div>
          {result.config && (
            <div className="mt-1 text-xs text-slate-600">
              {result.config.host}:{result.config.port} ·{" "}
              {result.config.secure ? "SSL" : "STARTTLS"} · {result.config.user}
            </div>
          )}
          {result.error && (
            <div className="mt-1 text-xs">{result.error}</div>
          )}
        </div>
      )}
    </div>
  );
}
