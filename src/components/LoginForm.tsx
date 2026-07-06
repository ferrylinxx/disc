"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/auth";

const initial: LoginState = {};

export default function LoginForm({
  defaultEmail = "",
  defaultPassword = "",
  next,
}: {
  defaultEmail?: string;
  defaultPassword?: string;
  next?: string;
}) {
  const [state, action, pending] = useActionState(login, initial);

  return (
    <form action={action} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}
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
          defaultValue={defaultEmail}
          placeholder="tu@empresa.com"
          className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          defaultValue={defaultPassword}
          placeholder="••••••••"
          className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
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
        {pending ? "Entrando…" : "Entrar"}
      </button>

      <p className="text-center text-sm">
        <Link
          href="/recuperar"
          className="font-semibold text-sky-600 transition hover:text-sky-700"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
    </form>
  );
}
