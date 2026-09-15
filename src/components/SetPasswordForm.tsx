"use client";

import { useActionState } from "react";
import { setPassword, type SetPasswordState } from "@/app/actions/account";
import { getDict, type Lang } from "@/lib/i18n/dictionaries";

const initial: SetPasswordState = {};
const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

/** Formulario para establecer/cambiar la contraseña con un token del email. */
export default function SetPasswordForm({ token, lang }: { token: string; lang: Lang }) {
  const [state, action, pending] = useActionState(setPassword, initial);
  const t = getDict(lang).auth;

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="token" value={token} />

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">
          {t.newPassword}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder={t.newPasswordPh}
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirm" className="text-sm font-medium text-slate-700">
          {t.repeatPassword}
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputCls}
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-brand w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? t.saving : t.savePassword}
      </button>
    </form>
  );
}
