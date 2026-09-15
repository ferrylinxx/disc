"use client";

import { useState, useTransition } from "react";
import { createOrganization } from "@/app/actions/org";
import { btn, fieldCls } from "./ui";
import { toast } from "./ui-client";

/**
 * "+ Nueva organización": abre un diálogo con el formulario. Crear una
 * organización es poco frecuente, así que no ocupa sitio fijo encima del listado.
 */
export function NewOrgButton({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      const r = await createOrganization({}, formData);
      if (r.error) {
        toast(r.error, "error");
        return;
      }
      toast("Organización creada.", "success");
      setOpen(false);
    });
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btn.primary}>
        + Nueva organización
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[65] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <form
            action={submit}
            onClick={(e) => e.stopPropagation()}
            className="animate-scale-in w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <h3 className="text-base font-bold text-slate-900">Nueva organización</h3>
            <p className="mt-1 text-sm text-slate-500">
              Crea un cliente para empezar a invitar participantes y organizar equipos.
            </p>
            <input
              name="name"
              required
              autoFocus
              placeholder="Nombre de la organización"
              className={`${fieldCls} mt-4`}
            />
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className={btn.secondary}>
                Cancelar
              </button>
              <button type="submit" disabled={pending} className={btn.primary}>
                {pending ? "Creando…" : "Crear organización"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
