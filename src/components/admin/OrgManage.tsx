"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { WelcomeEditorApi } from "./WelcomeEditor";
import {
  deleteOrganization,
  deleteProject,
  deleteTeam,
  updateOrganization,
} from "@/app/actions/admin";
import {
  improveInvitationWelcome,
  previewInvitationEmail,
  suggestEmailField,
  translateInvitationWelcome,
  updateOrgEmailConfig,
  type ActionState,
} from "@/app/actions/org";
import { addOrgGestor } from "@/app/actions/users";
import { insertAt } from "@/lib/text-insert";
import { ConfirmButton, toast } from "./ui-client";
import { btn } from "./ui";

// El editor con formato solo se descarga al abrir el formulario del correo.
const WelcomeEditor = dynamic(() => import("./WelcomeEditor"), {
  ssr: false,
  loading: () => <div className="h-[232px] animate-pulse rounded-xl border border-slate-200 bg-slate-50" />,
});

/** ¿El HTML del editor tiene texto? ("<p></p>" cuenta como vacío). */
const hasText = (html: string) => html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim() !== "";

const initial: ActionState = {};
const inputCls =
  "rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

/** Variables del correo: se insertan en el campo que tenga el cursor. */
const EMAIL_VARS = [
  { tag: "{{nombre}}", help: "Nombre de pila de la persona" },
  { tag: "{{nombre_completo}}", help: "Nombre y apellidos" },
  { tag: "{{email}}", help: "Correo con el que accede" },
  { tag: "{{programa}}", help: "Nombre del programa de arriba" },
  { tag: "{{organizacion}}", help: "Nombre de la organización" },
] as const;

/** Botón pequeño de IA junto a la etiqueta de un campo del correo. */
function AiButton({
  busy,
  onClick,
  title,
  label = "✨ IA",
}: {
  busy: boolean;
  onClick: () => void;
  title: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      title={title}
      className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 disabled:opacity-60"
    >
      {busy ? "Pensando…" : label}
    </button>
  );
}

/** Personalización del correo de invitación de la organización. */
export function OrgEmailForm({
  id,
  programName,
  emailSubject,
  emailLang,
  sessionDate,
  sessionInfo,
  deadline,
  welcomeIntro,
}: {
  id: string;
  programName: string;
  emailSubject: string;
  emailLang: string;
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
  const [subj, setSubj] = useState(emailSubject);
  const [sDate, setSDate] = useState(sessionDate);
  const [sess, setSess] = useState(sessionInfo);
  const [dead, setDead] = useState(deadline);
  const [intro, setIntro] = useState(welcomeIntro);
  // Idioma del correo de la org: es también el idioma de la vista previa.
  const [lang, setLang] = useState<"ca" | "es">(emailLang === "es" ? "es" : "ca");
  const [preview, setPreview] = useState<{ subject: string; html: string } | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [improving, setImproving] = useState(false);
  const [translating, setTranslating] = useState<"ca" | "es" | null>(null);
  const [suggesting, setSuggesting] = useState<"programName" | "emailSubject" | null>(null);

  // Las variables se insertan en el último campo que tuvo el foco (asunto o
  // mensaje); por defecto, el mensaje de bienvenida.
  const subjRef = useRef<HTMLInputElement>(null);
  const editorApi = useRef<WelcomeEditorApi | null>(null);
  const [target, setTarget] = useState<"subject" | "intro">("intro");
  const introHasText = hasText(intro);

  function insertVar(tag: string) {
    if (target === "intro") {
      editorApi.current?.insertText(tag);
      return;
    }
    const el = subjRef.current;
    if (!el) return;
    const { value, caret } = insertAt(el.value, el.selectionStart ?? el.value.length, el.selectionEnd ?? el.value.length, tag);
    setSubj(value);
    // El cursor se recoloca cuando React ya ha pintado el nuevo valor.
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  }

  /** Sustituye el mensaje (p. ej. con lo que devuelve la IA) en el editor y en el formulario. */
  function replaceIntro(html: string) {
    setIntro(html);
    editorApi.current?.setHtml(html);
  }

  async function openPreview(l: "ca" | "es") {
    setPreviewing(true);
    const r = await previewInvitationEmail({
      organizationId: id,
      programName: prog,
      emailSubject: subj,
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
      replaceIntro(r.text);
      toast("Mensaje mejorado con IA.", "success");
    } else toast(r.error ?? "No se pudo mejorar con IA.", "error");
  }

  async function suggest(field: "programName" | "emailSubject") {
    setSuggesting(field);
    const r = await suggestEmailField({
      organizationId: id,
      field,
      current: field === "programName" ? prog : subj,
      programName: prog,
      lang,
    });
    setSuggesting(null);
    if (r.ok && r.text) {
      if (field === "programName") setProg(r.text);
      else setSubj(r.text);
      toast(field === "programName" ? "Nombre de programa sugerido." : "Asunto sugerido.", "success");
    } else toast(r.error ?? "No se pudo sugerir con IA.", "error");
  }

  async function translate(to: "ca" | "es") {
    setTranslating(to);
    const r = await translateInvitationWelcome({ text: intro, to });
    setTranslating(null);
    if (r.ok && r.text) {
      replaceIntro(r.text);
      const nombre = to === "ca" ? "catalán" : "castellano";
      toast(
        lang === to
          ? `Mensaje traducido al ${nombre}.`
          : `Mensaje traducido al ${nombre}. El resto del correo sigue en ${lang === "ca" ? "catalán" : "castellano"}.`,
        "success",
      );
    } else toast(r.error ?? "No se pudo traducir con IA.", "error");
  }

  const labelCls = "mb-1 block text-xs font-semibold text-slate-500";
  return (
    <>
      <form action={action} className="space-y-3">
        <input type="hidden" name="organizationId" value={id} />
        <input type="hidden" name="emailLang" value={lang} />
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Idioma del correo</span>
          <div className="flex rounded-lg border border-slate-200 p-0.5 text-xs font-semibold">
            {(["ca", "es"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`rounded-md px-3 py-1 transition ${
                  lang === l ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {l === "ca" ? "Català" : "Español"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">Nombre del programa</span>
            <AiButton
              busy={suggesting === "programName"}
              onClick={() => suggest("programName")}
              title={prog.trim() ? "Pule el nombre del programa con IA" : "Propón un nombre de programa con IA"}
              label={prog.trim() ? "✨ Mejorar con IA" : "✨ Sugerir con IA"}
            />
          </div>
          <input
            name="programName"
            value={prog}
            onChange={(e) => setProg(e.target.value)}
            placeholder="CONECTAR PARA COLABORAR"
            className={`${inputCls} w-full`}
          />
        </div>
        <div>
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">Asunto del correo</span>
            <AiButton
              busy={suggesting === "emailSubject"}
              onClick={() => suggest("emailSubject")}
              title={subj.trim() ? "Pule el asunto con IA" : "Propón un asunto con IA"}
              label={subj.trim() ? "✨ Mejorar con IA" : "✨ Sugerir con IA"}
            />
          </div>
          <input
            ref={subjRef}
            name="emailSubject"
            value={subj}
            onChange={(e) => setSubj(e.target.value)}
            onFocus={() => setTarget("subject")}
            placeholder="Bienvenido/a al proceso {{programa}}"
            className={`${inputCls} w-full`}
          />
          <span className="mt-1 block text-[11px] text-slate-400">
            Si lo dejas vacío: “Bienvenido/a al proceso [programa]”. Admite variables.
          </span>
        </div>
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
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">Mensaje de bienvenida (opcional)</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {(["ca", "es"] as const).map((to) => (
                <button
                  key={to}
                  type="button"
                  onClick={() => translate(to)}
                  disabled={translating !== null || !introHasText}
                  title={
                    introHasText
                      ? `Traduce el mensaje al ${to === "ca" ? "catalán" : "castellano"} con IA`
                      : "Escribe primero el mensaje"
                  }
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-sky-300 hover:text-sky-700 disabled:opacity-50"
                >
                  {translating === to ? "Traduciendo…" : to === "ca" ? "🌐 Al català" : "🌐 Al castellano"}
                </button>
              ))}
              <button
                type="button"
                onClick={improve}
                disabled={improving}
                className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 disabled:opacity-60"
              >
                {improving ? "Mejorando…" : "✨ Mejorar con IA"}
              </button>
            </div>
          </div>
          <input type="hidden" name="welcomeIntro" value={intro} />
          <WelcomeEditor
            initialHtml={welcomeIntro}
            onChange={(html) => setIntro(html)}
            onFocus={() => setTarget("intro")}
            onReady={(api) => {
              editorApi.current = api;
            }}
          />
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">
              Variables → {target === "subject" ? "asunto" : "mensaje"}
            </span>
            {EMAIL_VARS.map((v) => (
              <button
                key={v.tag}
                type="button"
                onClick={() => insertVar(v.tag)}
                title={`${v.help} · se inserta donde tengas el cursor`}
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
              >
                {v.tag}
              </button>
            ))}
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            Selecciona texto y usa la barra para darle formato; también puedes pegar desde Word
            y se conserva lo básico. Las variables se insertan donde tengas el cursor y se
            rellenan al enviar. Comprueba el resultado con «Vista previa».
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className={btn.primary}
          >
            {pending ? "Guardando…" : "Guardar correo"}
          </button>
          <button
            type="button"
            onClick={() => openPreview(lang)}
            disabled={previewing}
            className={btn.secondary}
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
              // Sin permisos: el correo es HTML estático y no debe ejecutar nada.
              sandbox=""
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
        className={btn.primary}
      >
        {pending ? "Guardando…" : "Renombrar"}
      </button>
    </form>
  );
}

/** Alta de un gestor (Admin cliente o Facilitador) directamente en la organización. */
export function AddGestorForm({
  organizationId,
  users,
}: {
  organizationId: string;
  users: { id: string; name: string | null; email: string }[];
}) {
  const [state, action, pending] = useActionState(addOrgGestor, initial);
  const seen = useRef<ActionState | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  useEffect(() => {
    if (state === seen.current) return;
    seen.current = state;
    if (state.error) toast(state.error, "error");
    else if (state.ok) {
      toast(state.message ?? "Gestor añadido.", "success");
      if (!state.credentials) {
        setEmail("");
        setName("");
      }
    }
  }, [state]);

  function pickUser(e: React.ChangeEvent<HTMLSelectElement>) {
    const u = users.find((x) => x.id === e.target.value);
    if (u) {
      setEmail(u.email);
      setName(u.name ?? "");
    }
    e.target.value = "";
  }

  return (
    <div className="space-y-3">
      {users.length > 0 && (
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            Elegir un usuario ya creado
          </label>
          <select onChange={pickUser} defaultValue="" className={`${inputCls} w-full`}>
            <option value="">— Selecciona un usuario existente —</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name ? `${u.name} · ${u.email}` : u.email}
              </option>
            ))}
          </select>
        </div>
      )}
      <form action={action} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="organizationId" value={organizationId} />
        <div className="min-w-[190px] flex-1">
          <label className="mb-1 block text-xs font-semibold text-slate-500">Email del gestor</label>
          <input
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="persona@empresa.com"
            className={`${inputCls} w-full`}
          />
        </div>
        <div className="min-w-[130px]">
          <label className="mb-1 block text-xs font-semibold text-slate-500">Nombre (opcional)</label>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre"
            className={`${inputCls} w-full`}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Rol</label>
          <select name="role" defaultValue="ADMIN" className={inputCls}>
            <option value="ADMIN">Admin cliente</option>
            <option value="FACILITATOR">Facilitador</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={pending}
          className={btn.primary}
        >
          {pending ? "Añadiendo…" : "Añadir gestor"}
        </button>
      </form>
      {state.credentials && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-xs leading-relaxed text-emerald-800">
          Cuenta creada. Cópiale estas credenciales (no se volverán a mostrar):
          <br />
          <b>Correo:</b> {state.credentials.email} &nbsp;·&nbsp; <b>Contraseña:</b>{" "}
          <span className="font-mono">{state.credentials.password}</span>
        </div>
      )}
      <p className="text-[11px] text-slate-400">
        Elige un <b>usuario ya creado</b> en el desplegable, o escribe un email nuevo (se crea la
        cuenta y, si hay SMTP, se le envían las credenciales). <b>Admin cliente</b> gestiona la
        organización; <b>Facilitador</b> acompaña las sesiones.
      </p>
    </div>
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
      triggerClass={btn.danger}
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
