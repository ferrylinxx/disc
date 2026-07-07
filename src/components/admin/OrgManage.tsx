"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  deleteOrganization,
  deleteProject,
  deleteTeam,
  updateOrganization,
} from "@/app/actions/admin";
import {
  improveInvitationWelcome,
  previewInvitationEmail,
  updateOrgEmailConfig,
  type ActionState,
} from "@/app/actions/org";
import { ConfirmButton, toast } from "./ui-client";

const initial: ActionState = {};
const inputCls =
  "rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

/** Personalización del correo de invitación de la organización. */
export function OrgEmailForm({
  id,
  programName,
  sessionDate,
  sessionInfo,
  deadline,
  welcomeIntro,
}: {
  id: string;
  programName: string;
  sessionDate: string;
  sessionInfo: string;
  deadline: string;
  welcomeIntro: string;
}) {
  const [state, action, pending] = useActionState(updateOrgEmailConfig, initial);
  const seen = useRef<ActionState | null>(null);
  useEffect(() => {
    if (state === seen.current) return;
    seen.current = state;
    if (state.error) toast(state.error, "error");
    else if (state.ok) toast("Correo de invitación actualizado.", "success");
  }, [state]);

  // Campos controlados: la vista previa y la IA usan los valores sin guardar.
  const [prog, setProg] = useState(programName);
  const [sDate, setSDate] = useState(sessionDate);
  const [sess, setSess] = useState(sessionInfo);
  const [dead, setDead] = useState(deadline);
  const [intro, setIntro] = useState(welcomeIntro);
  const [lang, setLang] = useState<"ca" | "es">("ca");
  const [preview, setPreview] = useState<{ subject: string; html: string } | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [improving, setImproving] = useState(false);

  async function openPreview(l: "ca" | "es") {
    setPreviewing(true);
    const r = await previewInvitationEmail({
      organizationId: id,
      programName: prog,
      sessionDate: sDate,
      sessionInfo: sess,
      deadline: dead,
      welcomeIntro: intro,
      lang: l,
    });
    setPreviewing(false);
    if (r.ok && r.html) {
      setLang(l);
      setPreview({ subject: r.subject ?? "", html: r.html });
    } else toast(r.error ?? "No se pudo generar la vista previa.", "error");
  }

  async function improve() {
    setImproving(true);
    const r = await improveInvitationWelcome({ programName: prog, current: intro, lang });
    setImproving(false);
    if (r.ok && r.text) {
      setIntro(r.text);
      toast("Mensaje mejorado con IA.", "success");
    } else toast(r.error ?? "No se pudo mejorar con IA.", "error");
  }

  const labelCls = "mb-1 block text-xs font-semibold text-slate-500";
  return (
    <>
      <form action={action} className="space-y-3">
        <input type="hidden" name="organizationId" value={id} />
        <label className="block">
          <span className={labelCls}>Nombre del programa</span>
          <input
            name="programName"
            value={prog}
            onChange={(e) => setProg(e.target.value)}
            placeholder="CONECTAR PARA COLABORAR"
            className={`${inputCls} w-full`}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={labelCls}>Fecha del taller</span>
            <input
              type="date"
              name="sessionDate"
              value={sDate}
              onChange={(e) => setSDate(e.target.value)}
              className={`${inputCls} w-full`}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Fecha límite</span>
            <input
              type="date"
              name="deadline"
              value={dead}
              onChange={(e) => setDead(e.target.value)}
              className={`${inputCls} w-full`}
            />
          </label>
        </div>
        <label className="block">
          <span className={labelCls}>Lugar del taller</span>
          <input
            name="sessionInfo"
            value={sess}
            onChange={(e) => setSess(e.target.value)}
            placeholder="vuestras instalaciones"
            className={`${inputCls} w-full`}
          />
        </label>
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">Mensaje de bienvenida (opcional)</span>
            <button
              type="button"
              onClick={improve}
              disabled={improving}
              className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 disabled:opacity-60"
            >
              {improving ? "Mejorando…" : "✨ Mejorar con IA"}
            </button>
          </div>
          <textarea
            name="welcomeIntro"
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            rows={4}
            placeholder="Si lo dejas vacío se usa un texto por defecto. Admite markdown: **negrita**, _cursiva_ y listas con guiones."
            className={`${inputCls} w-full resize-y`}
          />
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            Admite markdown: **negrita**, _cursiva_, listas con “- ” y enlaces [texto](https://…).
            <br />
            Variables (se rellenan al enviar):{" "}
            <code className="text-slate-500">{"{{nombre}}"}</code>,{" "}
            <code className="text-slate-500">{"{{nombre_completo}}"}</code>,{" "}
            <code className="text-slate-500">{"{{email}}"}</code>,{" "}
            <code className="text-slate-500">{"{{programa}}"}</code>,{" "}
            <code className="text-slate-500">{"{{organizacion}}"}</code>.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {pending ? "Guardando…" : "Guardar correo"}
          </button>
          <button
            type="button"
            onClick={() => openPreview(lang)}
            disabled={previewing}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {previewing ? "Generando…" : "👁 Vista previa"}
          </button>
          <span className="text-xs text-slate-400">
            Si el programa está vacío, el correo usa el texto genérico.
          </span>
        </div>
      </form>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Asunto
                </p>
                <p className="truncate text-sm font-bold text-slate-800">{preview.subject}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="flex rounded-lg border border-slate-200 p-0.5 text-xs font-semibold">
                  {(["ca", "es"] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => openPreview(l)}
                      className={`rounded-md px-2 py-1 transition ${
                        lang === l ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="rounded-lg px-2 py-1 text-slate-400 transition hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>
            </div>
            <iframe
              srcDoc={preview.html}
              title="Vista previa del correo"
              className="h-[70vh] w-full bg-white"
            />
          </div>
        </div>
      )}
    </>
  );
}

/** Renombrado inline de la organización. */
export function RenameOrgForm({ id, name }: { id: string; name: string }) {
  const [state, action, pending] = useActionState(updateOrganization, initial);
  const seen = useRef<ActionState | null>(null);
  useEffect(() => {
    if (state === seen.current) return;
    seen.current = state;
    if (state.error) toast(state.error, "error");
    else if (state.ok) toast("Organización renombrada.", "success");
  }, [state]);
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input
        name="name"
        defaultValue={name}
        required
        className={`${inputCls} min-w-[220px] flex-1`}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Renombrar"}
      </button>
    </form>
  );
}

/** Eliminación de la organización completa, con confirmación explícita. */
export function DeleteOrgButton({ id, name }: { id: string; name: string }) {
  return (
    <ConfirmButton
      action={deleteOrganization}
      fields={{ id }}
      title={`Eliminar la organización ${name}`}
      body="Se borrarán sus proyectos, equipos, participantes, invitaciones y resultados. Esta acción no se puede deshacer."
      confirmLabel="Eliminar organización"
      triggerClass="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
      triggerLabel="Eliminar organización"
    />
  );
}

/** Botón pequeño de borrado para proyectos y equipos. */
export function DeleteEntityButton({
  kind,
  id,
  label,
}: {
  kind: "project" | "team";
  id: string;
  label: string;
}) {
  const body =
    kind === "project"
      ? "Sus equipos se borrarán; los participantes quedarán sin equipo (no se eliminan)."
      : "Los participantes quedarán sin equipo (no se eliminan).";
  return (
    <ConfirmButton
      action={kind === "project" ? deleteProject : deleteTeam}
      fields={{ id }}
      title={`Eliminar el ${kind === "project" ? "proyecto" : "equipo"} ${label}`}
      body={body}
      confirmLabel="Eliminar"
      successMessage={kind === "project" ? "Proyecto eliminado." : "Equipo eliminado."}
      triggerClass="rounded-md px-1.5 py-0.5 text-xs font-bold text-slate-300 transition hover:bg-rose-50 hover:text-rose-600"
      triggerLabel="✕"
    />
  );
}
