"use client";

import { useActionState, useEffect, useState } from "react";
import {
  updateOwnName,
  deleteOwnAccount,
  type UpdateNameState,
  type DeleteAccountState,
} from "@/app/actions/account";

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

interface EditNameLabels {
  placeholder: string;
  save: string;
  saved: string;
}

/** Editar el nombre del usuario. */
export function EditNameForm({
  defaultName,
  labels,
}: {
  defaultName: string;
  labels: EditNameLabels;
}) {
  const [state, action, pending] = useActionState<UpdateNameState, FormData>(
    updateOwnName,
    {},
  );
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input
        name="name"
        defaultValue={defaultName}
        required
        minLength={2}
        placeholder={labels.placeholder}
        className={`${inputCls} min-w-[180px] flex-1`}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
      >
        {pending ? "…" : labels.save}
      </button>
      {state?.error && (
        <p className="w-full text-xs font-medium text-rose-600">{state.error}</p>
      )}
      {state?.ok && (
        <p className="w-full text-xs font-medium text-emerald-600">{labels.saved}</p>
      )}
    </form>
  );
}

interface DangerLabels {
  button: string;
  confirmPlaceholder: string;
  confirmWord: string;
  cancel: string;
  warning: string;
}

/** Zona de riesgo: eliminar la cuenta con confirmación escrita. */
export function DeleteAccount({ labels }: { labels: DangerLabels }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<DeleteAccountState, FormData>(
    deleteOwnAccount,
    {},
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
      >
        {labels.button}
      </button>
    );
  }

  return (
    <form action={action} className="space-y-2">
      <p className="text-xs leading-relaxed text-rose-600">{labels.warning}</p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          name="confirm"
          required
          autoComplete="off"
          placeholder={labels.confirmPlaceholder}
          className={`${inputCls} min-w-[160px] flex-1 border-rose-200 focus:border-rose-400 focus:ring-rose-100`}
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-60"
        >
          {pending ? "…" : labels.button}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
        >
          {labels.cancel}
        </button>
      </div>
      {state?.error && (
        <p className="text-xs font-medium text-rose-600">{state.error}</p>
      )}
    </form>
  );
}

/** Abre el diálogo de impresión automáticamente (para descargar el PDF). */
export function AutoPrint() {
  useEffect(() => {
    const id = setTimeout(() => window.print(), 700);
    return () => clearTimeout(id);
  }, []);
  return null;
}
