"use client";

import { useActionState } from "react";
import { startLibreEvaluation, type LibreState } from "@/app/actions/libre";

export function IntakeForm() {
  const [state, action, pending] = useActionState<LibreState, FormData>(
    startLibreEvaluation,
    null,
  );

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Encabezado */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white shadow-lg shadow-indigo-200">
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
            Evaluación DISC GESEM
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Introduce tus datos para comenzar. Tu informe quedará guardado y
            podrás recibirlo por email.
          </p>
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
                Nombre completo
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                autoComplete="name"
                placeholder="Ej. Ana García López"
                className="w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Ej. ana@empresa.com"
                className="w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <p className="text-[11px] text-slate-400">
                Solo se usará para enviarte tu informe si lo solicitas.
              </p>
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
              className="bg-brand w-full rounded-xl py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Preparando cuestionario…" : "Comenzar evaluación →"}
            </button>
          </form>
        </div>

        {/* Nota metodológica */}
        <p className="mt-5 text-center text-[11px] leading-relaxed text-slate-400">
          Este cuestionario mide estilos conductuales, no rasgos clínicos.
          Los resultados son tendencias, no diagnósticos.
        </p>
      </div>
    </div>
  );
}
