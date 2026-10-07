"use client";

import { useActionState, type ReactNode } from "react";
import { updateOwnProfile, type ProfileState } from "@/app/actions/profile";
import type { Dict } from "@/lib/i18n/dictionaries";

type Labels = Dict["profile"];

const fieldCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

/** Datos personales del propio usuario: nombre, cargo y teléfono (el correo solo se ve). */
export function ProfileForm({
  defaults,
  labels,
}: {
  defaults: { name: string; email: string; jobTitle: string | null; phone: string | null };
  labels: Labels;
}) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateOwnProfile, {});
  // React vacía el formulario al enviarlo: si hubo error, vuelve lo que se escribió.
  const v = state.values ?? {
    name: defaults.name,
    jobTitle: defaults.jobTitle ?? "",
    phone: defaults.phone ?? "",
  };
  const errors: Record<NonNullable<ProfileState["error"]>, string> = {
    name: labels.errName,
    jobTitle: labels.errJobTitle,
    phone: labels.errPhone,
  };

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={labels.name} htmlFor="profile-name" className="sm:col-span-2">
          <input
            id="profile-name"
            name="name"
            defaultValue={v.name}
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            aria-invalid={state.error === "name" || undefined}
            className={fieldCls}
          />
        </Field>
        <Field label={labels.jobTitle} optional={labels.optional} htmlFor="profile-job">
          <input
            id="profile-job"
            name="jobTitle"
            defaultValue={v.jobTitle}
            maxLength={80}
            autoComplete="organization-title"
            placeholder={labels.jobTitlePh}
            aria-invalid={state.error === "jobTitle" || undefined}
            className={fieldCls}
          />
        </Field>
        <Field label={labels.phone} optional={labels.optional} htmlFor="profile-phone">
          <input
            id="profile-phone"
            name="phone"
            type="tel"
            defaultValue={v.phone}
            maxLength={30}
            autoComplete="tel"
            inputMode="tel"
            placeholder={labels.phonePh}
            aria-invalid={state.error === "phone" || undefined}
            className={fieldCls}
          />
        </Field>
        <Field label={labels.email} htmlFor="profile-email" className="sm:col-span-2" hint={labels.emailHint}>
          <div className="relative">
            <input
              id="profile-email"
              value={defaults.email}
              readOnly
              aria-describedby="profile-email-hint"
              className={`${fieldCls} cursor-not-allowed bg-slate-50 pr-9 text-slate-500 focus:border-slate-200 focus:ring-0`}
            />
            <LockIcon />
          </div>
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
        <button
          type="submit"
          disabled={pending}
          className="bg-brand inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-500/25 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-sky-500/30 disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {pending ? labels.saving : labels.save}
        </button>
        <p role="status" className="text-xs font-medium">
          {state.error ? (
            <span className="text-rose-600">{errors[state.error]}</span>
          ) : state.ok && !pending ? (
            <span className="text-emerald-600">{labels.saved}</span>
          ) : null}
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  optional,
  hint,
  className = "",
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
        {optional && <span className="ml-1 font-normal text-slate-400">({optional})</span>}
      </label>
      {children}
      {hint && (
        <p id={`${htmlFor}-hint`} className="mt-1.5 text-[11px] text-slate-400">
          {hint}
        </p>
      )}
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      aria-hidden
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
