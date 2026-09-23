"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { WelcomeEditorApi } from "./WelcomeEditor";
import type { InlineRichInputApi } from "./InlineRichInput";
import EmailPreview, { type AiProposal, type PreviewData, type PreviewOptions } from "./EmailPreview";
import {
  AiButton,
  SubjectInput,
  TranslateControl,
  VariableChips,
  type EmailVariable,
} from "./EmailFormControls";
import { IconCheck, IconEye, Spinner } from "./icons";
import {
  deleteOrganization,
  deleteProject,
  deleteTeam,
  updateOrganization,
} from "@/app/actions/admin";
import {
  fixInvitationWithAi,
  improveInvitationWelcome,
  previewInvitationEmail,
  sendTestInvitationEmail,
  suggestEmailField,
  translateInvitationWelcome,
  updateOrgEmailConfig,
  type ActionState,
} from "@/app/actions/org";
import { addOrgGestor } from "@/app/actions/users";
import { insertAt } from "@/lib/text-insert";
import { applyFix, type EmailFields, type FixId } from "@/lib/email/fixes";
import { ConfirmButton, toast } from "./ui-client";
import { btn } from "./ui";

// El editor con formato solo se descarga al abrir el formulario del correo.
const WelcomeEditor = dynamic(() => import("./WelcomeEditor"), {
  ssr: false,
  loading: () => <div className="h-[232px] animate-pulse rounded-xl border border-slate-200 bg-slate-50" />,
});

// Campo de una línea con formato para el nombre del programa (misma librería que el editor).
const InlineRichInput = dynamic(() => import("./InlineRichInput"), {
  ssr: false,
  loading: () => <div className="h-[42px] animate-pulse rounded-xl border border-slate-200 bg-slate-50" />,
});

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** ¿El HTML del editor tiene texto? ("<p></p>" cuenta como vacío). */
const hasText = (html: string) => html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim() !== "";

const initial: ActionState = {};
const inputCls =
  "rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

/** Variables del correo: se insertan en el campo que tenga el cursor. */
const EMAIL_VARS: readonly EmailVariable[] = [
  { tag: "{{nombre}}", label: "Nombre", help: "Nombre de pila de cada persona" },
  { tag: "{{nombre_completo}}", label: "Nombre y apellidos", help: "Nombre y apellidos de cada persona" },
  { tag: "{{email}}", label: "Correo", help: "Correo con el que accede" },
  { tag: "{{programa}}", label: "Programa", help: "Nombre del programa de arriba" },
  { tag: "{{organizacion}}", label: "Organización", help: "Nombre de la organización" },
];

/** Personalización del correo de invitación de la organización. */
export function OrgEmailForm({
  id,
  programName,
  programNameHtml,
  emailSubject,
  emailLang,
  sessionDate,
  sessionInfo,
  deadline,
  welcomeIntro,
  showProgramBox,
}: {
  id: string;
  programName: string;
  programNameHtml: string;
  emailSubject: string;
  emailLang: string;
  sessionDate: string;
  sessionInfo: string;
  deadline: string;
  welcomeIntro: string;
  showProgramBox: boolean;
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
  const [progHtml, setProgHtml] = useState(programNameHtml);
  const [subj, setSubj] = useState(emailSubject);
  const [sDate, setSDate] = useState(sessionDate);
  const [sess, setSess] = useState(sessionInfo);
  const [dead, setDead] = useState(deadline);
  const [intro, setIntro] = useState(welcomeIntro);
  const [showBox, setShowBox] = useState(showProgramBox);
  // Idioma del correo de la org: es también el idioma de la vista previa.
  const [lang, setLang] = useState<"ca" | "es">(emailLang === "es" ? "es" : "ca");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [improving, setImproving] = useState(false);
  const [translating, setTranslating] = useState<"ca" | "es" | null>(null);
  const [suggesting, setSuggesting] = useState<"programName" | "emailSubject" | null>(null);

  // Las variables se insertan en el último campo que tuvo el foco (asunto o
  // mensaje); por defecto, el mensaje de bienvenida.
  const subjRef = useRef<HTMLInputElement>(null);
  const editorApi = useRef<WelcomeEditorApi | null>(null);
  const programApi = useRef<InlineRichInputApi | null>(null);
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

  /** Cambia el nombre del programa en el campo con formato y en el formulario. */
  function replaceProgram(name: string, html: string) {
    setProg(name);
    setProgHtml(html);
    programApi.current?.setHtml(html || escapeHtml(name));
  }

  /** Sustituye el mensaje (p. ej. con lo que devuelve la IA) en el editor y en el formulario. */
  function replaceIntro(html: string) {
    setIntro(html);
    editorApi.current?.setHtml(html);
  }

  /** Los campos de texto del correo tal y como están ahora en el formulario. */
  const currentFields = (): EmailFields => ({
    programName: prog,
    programNameHtml: progHtml,
    emailSubject: subj,
    welcomeIntro: intro,
  });

  /** Aplica campos nuevos (arreglos o propuesta de la IA) al formulario y a los editores. */
  function applyFields(f: EmailFields) {
    if (f.programName !== prog || f.programNameHtml !== progHtml) replaceProgram(f.programName, f.programNameHtml);
    if (f.emailSubject !== subj) setSubj(f.emailSubject);
    if (f.welcomeIntro !== intro) replaceIntro(f.welcomeIntro);
  }

  function quickFix(fixes: FixId[]): EmailFields {
    const next = fixes.reduce((f, fix) => applyFix(f, fix), currentFields());
    applyFields(next);
    return next;
  }

  /**
   * El correo tal y como está en el formulario (sin guardar), para la vista
   * previa, la prueba o la IA; `override` sustituye los campos de texto.
   */
  const draft = (opts: PreviewOptions, override?: EmailFields) => ({
    organizationId: id,
    programName: override?.programName ?? prog,
    programNameHtml: override?.programNameHtml ?? progHtml,
    emailSubject: override?.emailSubject ?? subj,
    sessionDate: sDate,
    sessionInfo: sess,
    deadline: dead,
    welcomeIntro: override?.welcomeIntro ?? intro,
    showProgramBox: showBox,
    lang: opts.lang,
    sampleName: opts.sampleName,
  });

  async function loadPreview(opts: PreviewOptions, override?: EmailFields): Promise<PreviewData | null> {
    const r = await previewInvitationEmail(draft(opts, override));
    if (r.ok && r.html) {
      return {
        subject: r.subject ?? "",
        preheader: r.preheader ?? "",
        html: r.html,
        from: r.from ?? "",
        to: r.to ?? "",
        checks: r.checks ?? [],
      };
    }
    toast(r.error ?? "No se pudo generar la vista previa.", "error");
    return null;
  }

  async function openPreview() {
    setPreviewing(true);
    const data = await loadPreview({ lang, sampleName: "Laura Ejemplo" });
    setPreviewing(false);
    if (data) setPreview(data);
  }

  async function aiFix(opts: PreviewOptions, problems: string[]): Promise<AiProposal | null> {
    const r = await fixInvitationWithAi({ ...draft(opts), problems });
    if (!r.ok || !r.proposal) {
      toast(r.error ?? "La IA no pudo revisar el correo.", "error");
      return null;
    }
    const p = r.proposal;
    return {
      fields: {
        programName: p.programName,
        // Si la IA cambia el nombre, se pierde su formato; si no, se conserva.
        programNameHtml: p.programName === prog ? progHtml : "",
        emailSubject: p.emailSubject,
        welcomeIntro: p.welcomeIntro,
      },
      changes: p.changes,
    };
  }

  async function sendTest(opts: PreviewOptions) {
    const r = await sendTestInvitationEmail(draft(opts));
    if (r.ok) toast(`Correo de prueba enviado a ${r.to}.`, "success");
    else toast(r.error ?? "No se pudo enviar la prueba.", "error");
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
      if (field === "programName") replaceProgram(r.text, "");
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
          <div role="group" aria-label="Idioma del correo" className="flex rounded-full border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
            {(["ca", "es"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`rounded-full px-3.5 py-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  lang === l ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-900"
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
              label={prog.trim() ? "Mejorar con IA" : "Sugerir con IA"}
              size="sm"
            />
          </div>
          <input type="hidden" name="programName" value={prog} />
          <input type="hidden" name="programNameHtml" value={progHtml} />
          <InlineRichInput
            initialHtml={programNameHtml || escapeHtml(programName)}
            placeholder="CONECTAR PARA COLABORAR"
            ariaLabel="Nombre del programa"
            onChange={(html, text) => {
              setProg(text);
              setProgHtml(html);
            }}
            onReady={(api) => {
              programApi.current = api;
            }}
          />
          <span className="mt-1 block text-[11px] text-slate-400">
            El formato se ve en el cuerpo del correo; en el asunto y en la bandeja de entrada va sin formato.
          </span>
        </div>
        <div>
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">Asunto del correo</span>
            <AiButton
              busy={suggesting === "emailSubject"}
              onClick={() => suggest("emailSubject")}
              title={subj.trim() ? "Pule el asunto con IA" : "Propón un asunto con IA"}
              label={subj.trim() ? "Mejorar con IA" : "Sugerir con IA"}
              size="sm"
            />
          </div>
          <SubjectInput
            value={subj}
            onChange={setSubj}
            inputRef={subjRef}
            onFocus={() => setTarget("subject")}
            placeholder="Bienvenido/a al proceso {{programa}}"
          />
          <span className="mt-1 block text-[11px] text-slate-400">
            Si lo dejas vacío: “Bienvenido/a al proceso [programa]”. Admite datos, emojis y negrita o cursiva.
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
        <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5">
          <input
            type="checkbox"
            name="showProgramBox"
            value="1"
            checked={showBox}
            onChange={(e) => setShowBox(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-sky-600"
          />
          <span className="text-sm text-slate-700">
            Mostrar el recuadro azul con el programa, el taller y la fecha límite
            <span className="mt-0.5 block text-[11px] text-slate-400">
              Desmárcalo si ya das las fechas en el mensaje de bienvenida, para no repetirlas.
            </span>
          </span>
        </label>
        <div>
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">Mensaje de bienvenida (opcional)</span>
            <div className="flex flex-wrap items-center gap-2">
              <TranslateControl busy={translating} disabled={!introHasText} onTranslate={translate} />
              <AiButton
                busy={improving}
                onClick={improve}
                label={introHasText ? "Mejorar con IA" : "Escribir con IA"}
                busyLabel={introHasText ? "Mejorando…" : "Escribiendo…"}
                title={
                  introHasText
                    ? "Pule el mensaje con IA conservando el formato"
                    : "Redacta un mensaje de bienvenida con IA"
                }
              />
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
          <div className="mt-2.5">
            <VariableChips target={target} vars={EMAIL_VARS} onInsert={insertVar} />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
            Selecciona texto y usa la barra para darle formato; si pegas desde Word se conserva
            lo básico. Los datos se rellenan con los de cada persona al enviar.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="bg-brand inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white shadow-md shadow-sky-500/25 transition hover:-translate-y-px hover:shadow-lg hover:shadow-sky-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:translate-y-0 disabled:opacity-60"
          >
            {pending ? <Spinner size={15} /> : <IconCheck size={17} strokeWidth={2.2} />}
            {pending ? "Guardando…" : "Guardar correo"}
          </button>
          <button
            type="button"
            onClick={openPreview}
            disabled={previewing}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-200/60 transition hover:-translate-y-px hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:translate-y-0 disabled:opacity-60"
          >
            {previewing ? <Spinner size={15} className="text-sky-600" /> : <IconEye size={17} className="text-sky-600" />}
            {previewing ? "Preparando…" : "Vista previa"}
          </button>
          <span className="text-xs text-slate-400">
            Si el programa está vacío, el correo usa el texto genérico.
          </span>
        </div>
      </form>

      {preview && (
        <EmailPreview
          initial={preview}
          initialLang={lang}
          configuredLang={lang}
          load={loadPreview}
          sendTest={sendTest}
          onQuickFix={quickFix}
          onAiFix={aiFix}
          onApply={applyFields}
          onClose={() => setPreview(null)}
        />
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
