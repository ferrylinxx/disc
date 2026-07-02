"use client";

import { useActionState } from "react";
import {
  changeOwnPassword,
  type ChangePasswordState,
} from "@/app/actions/account";

const initial: ChangePasswordState = {};
const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

interface Labels {
  newPassword: string;
  repeatPassword: string;
  save: string;
  saved: string;
}

/** Formulario de cambio de contraseña para el usuario autenticado (panel). */
export function ChangePasswordForm({ labels }: { labels: Labels }) {
  const [state, action, pending] = useActionState(changeOwnPassword, initial);

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder={labels.newPassword}
          className={inputCls}
        />
        <input
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder={labels.repeatPassword}
          className={inputCls}
        />
      </div>

      {state?.error && (
        <p className="text-xs font-medium text-rose-600">{state.error}</p>
      )}
      {state?.ok && (
        <p className="text-xs font-medium text-emerald-600">{labels.saved}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-brand rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "…" : labels.save}
      </button>
    </form>
  );
}
