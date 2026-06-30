"use client";

import { useActionState } from "react";
import { startLibreEvaluation, type LibreState } from "@/app/actions/libre";
import { getDict, type Lang } from "@/lib/i18n/dictionaries";

export function IntakeForm({ lang }: { lang: Lang }) {
  const t = getDict(lang).intake;
  const [state, action, pending] = useActionState<LibreState, FormData>(
    startLibreEvaluation,
    null,
  );

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Encabezado */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white shadow-lg shadow-sky-200">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7"
            >
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{t.subtitle}</p>
        </div>

        {/* Tarjeta del formulario */}
        <div className="glass ring-brand rounded-2xl border border-white/60 p-8 shadow-xl">
          <form action={action} className="space-y-5">
            {/* Nombre */}
            <div className="space-y-1.5">
              <label
                htmlFor="fullName"
                className="block text-sm font-semibold text-slate-700"
              >
                {t.name}
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                autoComplete="name"
                placeholder={t.namePh}
                className="w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700"
              >
                {t.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder={t.emailPh}
                className="w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
              <p className="text-[11px] text-slate-400">{t.emailNote}</p>
            </div>

            {/* Error */}
            {state?.error && (
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
                {state.error}
              </p>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={pending}
              className="bg-brand w-full rounded-xl py-3.5 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:opacity-90 disabled:opacity-60"
            >
              {pending ? t.submitting : t.submit}
            </button>
          </form>
        </div>

        {/* Nota metodológica */}
        <p className="mt-5 text-center text-[11px] leading-relaxed text-slate-400">
          {t.methodNote}
        </p>
      </div>
    </div>
  );
}
