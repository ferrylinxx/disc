"use client";

import { useActionState } from "react";
import {
  requestPasswordReset,
  type RequestResetState,
} from "@/app/actions/account";

const initial: RequestResetState = {};
const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

/** Solicitud de enlace de restablecimiento de contraseña. */
export default function RequestResetForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);

  if (state.ok) {
    return (
      <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
        Si el correo tiene una cuenta, te hemos enviado un enlace para
        restablecer tu contraseña. Revisa tu bandeja de entrada.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="tu@empresa.com"
          className={inputCls}
        />
      </div>
      {state.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="bg-brand w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar enlace"}
      </button>
    </form>
  );
}
