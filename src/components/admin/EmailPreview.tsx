"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { CheckField, EmailCheck } from "@/lib/email/checks";
import type { EmailFields, FixId } from "@/lib/email/fixes";
import { AiButton } from "./EmailFormControls";
import {
  IconAlert,
  IconCheckCircle,
  IconClose,
  IconInfo,
  IconMonitor,
  IconPhone,
  IconRefresh,
  IconSend,
  IconWand,
  Spinner,
} from "./icons";

/**
 * Vista previa del correo de invitación a pantalla completa: el correo en
 * escritorio o en un móvil, cómo aparecerá en la bandeja de entrada, una
 * revisión automática y el envío de una prueba al propio buzón.
 */

export interface PreviewData {
  subject: string;
  preheader: string;
  html: string;
  from: string;
  to: string;
  checks: EmailCheck[];
}

export interface PreviewOptions {
  lang: "ca" | "es";
  sampleName: string;
}

/** Versión corregida que propone la IA, todavía sin aplicar al formulario. */
export interface AiProposal {
  fields: EmailFields;
  changes: string[];
}

type Device = "desktop" | "mobile";

const LANG_NAME = { ca: "catalán", es: "castellano" } as const;

/**
 * Prepara el HTML para el iframe: los enlaces se abren en una pestaña nueva
 * (así se pueden comprobar sin salir de la vista previa).
 */
function frameHtml(html: string) {
  return html.includes("<head>")
    ? html.replace("<head>", '<head><base target="_blank">')
    : html.replace("<html>", '<html><head><base target="_blank"></head>');
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex rounded-full border border-slate-200 bg-slate-100/70 p-0.5 text-xs font-semibold">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
            value === o.value ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const CHECK_STYLE: Record<EmailCheck["level"], { icon: ReactNode; cls: string }> = {
  warn: { icon: <IconAlert size={16} className="text-amber-600" />, cls: "border-amber-200/80 bg-amber-50/70 text-amber-950" },
  info: { icon: <IconInfo size={16} className="text-sky-600" />, cls: "border-sky-100 bg-sky-50/60 text-slate-800" },
  ok: { icon: <IconCheckCircle size={16} className="text-emerald-600" />, cls: "border-emerald-200 bg-emerald-50 text-emerald-900" },
};

const FIELD_LABEL: Record<CheckField, string> = {
  program: "Programa",
  subject: "Asunto",
  welcome: "Mensaje de bienvenida",
  typography: "Ortografía y tipografía",
  dates: "Fechas",
};
const FIELD_ORDER: CheckField[] = ["program", "subject", "welcome", "typography", "dates"];

/** Qué hace cada arreglo automático, dicho en el botón. */
const FIX_LABEL: Record<FixId, string> = {
  "subject-markup": "Quitar los asteriscos",
  greeting: "Quitar el saludo del mensaje",
  apostrophes: "Corregir los apóstrofos",
  ela: "Corregir la ela geminada",
  spacing: "Quitar los espacios de más",
};

function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-slate-900">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

const fixBtnCls =
  "inline-flex h-7 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-950 hover:ring-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:opacity-50";

/** "DISC GESEM <x@y>" → { name: "DISC GESEM", address: "x@y" }. */
function splitAddress(value: string) {
  const m = value.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  return m ? { name: m[1] || m[2], address: m[2] } : { name: value, address: "" };
}

export default function EmailPreview({
  initial,
  initialLang,
  configuredLang,
  load,
  sendTest,
  onQuickFix,
  onAiFix,
  onApply,
  onClose,
}: {
  initial: PreviewData;
  initialLang: "ca" | "es";
  /** Idioma con el que se enviará el correo (el del formulario). */
  configuredLang: "ca" | "es";
  /** Genera la vista previa con el formulario o, si se da, con otros campos (la propuesta de la IA). */
  load: (opts: PreviewOptions, override?: EmailFields) => Promise<PreviewData | null>;
  sendTest: (opts: PreviewOptions) => Promise<void>;
  /** Aplica arreglos automáticos al formulario y devuelve los campos resultantes. */
  onQuickFix: (fixes: FixId[]) => EmailFields;
  /** Pide a la IA una versión corregida; no toca el formulario. */
  onAiFix: (opts: PreviewOptions, problems: string[]) => Promise<AiProposal | null>;
  /** Aplica al formulario la propuesta de la IA. */
  onApply: (fields: EmailFields) => void;
  onClose: () => void;
}) {
  const [data, setData] = useState(initial);
  const [device, setDevice] = useState<Device>("desktop");
  const [lang, setLang] = useState(initialLang);
  const [sampleName, setSampleName] = useState("Laura Ejemplo");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [frameHeight, setFrameHeight] = useState(900);
  const [proposal, setProposal] = useState<AiProposal | null>(null);
  const [fixing, setFixing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  // Pantalla completa: sin scroll detrás y Esc para cerrar.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, []);

  /**
   * Regenera la vista previa. Sin `override`, muestra la propuesta de la IA si
   * hay una pendiente; con `null`, lo que hay en el formulario.
   */
  async function refresh(opts: PreviewOptions, override?: EmailFields | null) {
    const fields = override === undefined ? proposal?.fields : (override ?? undefined);
    setLoading(true);
    const next = await load(opts, fields);
    setLoading(false);
    if (next) setData(next);
  }

  async function quickFix(fixes: FixId[]) {
    const fields = onQuickFix(fixes);
    setNotice("Arreglado en el formulario. Guarda el correo para conservarlo.");
    await refresh({ lang, sampleName }, fields);
  }

  async function aiFix() {
    setNotice(null);
    setFixing(true);
    // Solo los avisos: las notas (longitud, recuadro oculto) no son algo que "arreglar".
    const problems = data.checks.filter((c) => c.level === "warn").map((c) => c.text);
    const p = await onAiFix({ lang, sampleName }, problems);
    setFixing(false);
    if (!p) return;
    if (p.changes.length === 0) {
      setNotice("La IA no ha encontrado nada que cambiar.");
      return;
    }
    setProposal(p);
    await refresh({ lang, sampleName }, p.fields);
  }

  function applyProposal() {
    if (!proposal) return;
    onApply(proposal.fields);
    setProposal(null);
    setNotice("Propuesta aplicada al formulario. Guarda el correo para conservarla.");
  }

  async function discardProposal() {
    setProposal(null);
    await refresh({ lang, sampleName }, null);
  }

  function changeLang(l: "ca" | "es") {
    setLang(l);
    void refresh({ lang: l, sampleName });
  }

  function changeName(name: string) {
    setSampleName(name);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => void refresh({ lang, sampleName: name }), 450);
  }

  async function onSend() {
    setSending(true);
    await sendTest({ lang, sampleName });
    setSending(false);
  }

  const warnings = data.checks.filter((c) => c.level === "warn").length;
  const notes = data.checks.filter((c) => c.level === "info").length;
  const autoFixes = [...new Set(data.checks.map((c) => c.fix).filter((f): f is FixId => !!f))];
  const groups = FIELD_ORDER.map((f) => ({ field: f, items: data.checks.filter((c) => c.field === f) })).filter(
    (g) => g.items.length > 0,
  );
  const from = splitAddress(data.from);
  const to = splitAddress(data.to);
  const html = frameHtml(data.html);

  // Portal al <body>: si no, un antepasado con transform (las animaciones de
  // entrada de la consola) hace que "fixed" se mida contra él y no contra la ventana.
  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-slate-100"
      role="dialog"
      aria-modal="true"
      aria-label="Vista previa del correo de invitación"
    >
      <header className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-2.5 shadow-sm sm:gap-3 sm:px-6">
        <div className="mr-auto min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-sky-600">Vista previa del correo</p>
          <p className="truncate text-sm font-semibold text-slate-900" title={data.subject}>
            {data.subject}
          </p>
        </div>
        <Segmented
          label="Dispositivo"
          value={device}
          onChange={setDevice}
          options={[
            { value: "desktop", label: <><IconMonitor size={15} /> Escritorio</> },
            { value: "mobile", label: <><IconPhone size={15} /> Móvil</> },
          ]}
        />
        <Segmented
          label="Idioma de la vista previa"
          value={lang}
          onChange={changeLang}
          options={[
            { value: "ca", label: "Català" },
            { value: "es", label: "Español" },
          ]}
        />
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          Destinatario
          <input
            value={sampleName}
            onChange={(e) => changeName(e.target.value)}
            className="w-36 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-normal text-slate-900 outline-none focus:border-sky-400"
            title="Nombre de ejemplo: así ves cómo se rellenan {{nombre}} y {{nombre_completo}}"
          />
        </label>
        <button
          type="button"
          onClick={() => void refresh({ lang, sampleName })}
          disabled={loading}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm shadow-slate-200/60 transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:opacity-60"
          title="Vuelve a generar el correo"
        >
          {loading ? <Spinner size={13} className="text-sky-600" /> : <IconRefresh size={15} className="text-sky-600" />}
          {loading ? "Actualizando…" : "Actualizar"}
        </button>
        <button
          type="button"
          onClick={onSend}
          disabled={sending}
          className="bg-brand inline-flex h-8 items-center gap-1.5 rounded-full px-4 text-xs font-semibold text-white shadow-md shadow-sky-500/25 transition hover:-translate-y-px hover:shadow-lg hover:shadow-sky-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:translate-y-0 disabled:opacity-60"
          title="Te envía este correo a tu dirección, con [Prueba] en el asunto y datos de acceso de ejemplo"
        >
          {sending ? <Spinner size={13} /> : <IconSend size={15} />}
          {sending ? "Enviando…" : "Enviarme una prueba"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          title="Cerrar (Esc)"
          aria-label="Cerrar la vista previa"
        >
          <IconClose size={18} />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <main className="relative min-h-0 flex-1 overflow-auto px-3 py-5 sm:px-6">
          {loading && (
            <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center">
              <span className="rounded-full bg-slate-900/85 px-3 py-1 text-xs font-semibold text-white shadow">
                Actualizando la vista previa…
              </span>
            </div>
          )}
          {proposal && (
            <div className="sticky top-0 z-10 mx-auto mb-4 flex w-full max-w-[920px] flex-wrap items-center gap-3 rounded-2xl border border-indigo-200 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur">
              <IconWand size={16} className="text-indigo-500" />
              <p className="mr-auto text-[13px] font-medium text-slate-800">
                Estás viendo la propuesta de la IA. Todavía no se ha aplicado al formulario.
              </p>
              <button type="button" onClick={applyProposal} className="bg-brand inline-flex h-8 items-center gap-1.5 rounded-full px-4 text-xs font-semibold text-white shadow-sm shadow-sky-500/25">
                Aplicar
              </button>
              <button type="button" onClick={() => void discardProposal()} className={fixBtnCls}>
                Descartar
              </button>
            </div>
          )}
          {device === "desktop" ? (
            <div className="mx-auto w-full max-w-[920px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="space-y-1.5 border-b border-slate-100 px-5 py-4 text-sm">
                <p className="text-lg font-bold leading-snug text-slate-900">{data.subject}</p>
                <div className="flex flex-wrap items-center gap-x-2 text-slate-600">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-sky-500 text-xs font-bold text-white">DG</span>
                  <span className="font-semibold text-slate-900">{from.name}</span>
                  {from.address && <span className="text-slate-400">&lt;{from.address}&gt;</span>}
                </div>
                <p className="text-xs text-slate-500">
                  para <span className="font-medium text-slate-700">{to.name}</span>
                  {to.address && <span className="text-slate-400"> &lt;{to.address}&gt;</span>}
                </p>
              </div>
              <iframe
                key={`${lang}-desktop`}
                // Sin scripts; mismo origen solo para medir la altura del correo.
                sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                srcDoc={html}
                title="Correo en escritorio"
                onLoad={(e) => {
                  const doc = e.currentTarget.contentDocument;
                  if (doc) setFrameHeight(doc.documentElement.scrollHeight + 8);
                }}
                style={{ height: frameHeight }}
                className="block w-full bg-white"
              />
            </div>
          ) : (
            <div className="mx-auto w-[390px] max-w-full rounded-[46px] border-[11px] border-slate-900 bg-slate-900 shadow-2xl">
              <div className="flex items-center justify-between rounded-t-[35px] bg-white px-6 pb-1 pt-3 text-[11px] font-semibold text-slate-900">
                <span>9:41</span>
                <span className="h-5 w-24 rounded-full bg-slate-900" aria-hidden />
                <span>● ● ●</span>
              </div>
              <div className="border-b border-slate-100 bg-white px-4 py-2.5">
                <p className="text-[15px] font-bold leading-snug text-slate-900">{data.subject}</p>
                <p className="mt-1 text-xs text-slate-500">
                  <span className="font-semibold text-slate-800">{from.name}</span> · para {to.name}
                </p>
              </div>
              <iframe
                key={`${lang}-mobile`}
                sandbox="allow-popups allow-popups-to-escape-sandbox"
                srcDoc={html}
                title="Correo en el móvil"
                className="block h-[640px] max-h-[calc(100vh-15rem)] w-full rounded-b-[35px] bg-white"
              />
            </div>
          )}
        </main>

        <aside className="w-full shrink-0 space-y-6 overflow-auto border-t border-slate-200 bg-white p-5 lg:w-[360px] lg:border-l lg:border-t-0">
          <Section
            title="Revisión"
            action={
              <AiButton
                size="sm"
                busy={fixing}
                disabled={!!proposal}
                onClick={() => void aiFix()}
                label={warnings > 0 ? "Arreglar con IA" : "Revisar con IA"}
                busyLabel="Revisando…"
                title="La IA propone una versión corregida del programa, el asunto y el mensaje; la ves aquí antes de aplicarla"
              />
            }
          >
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              {warnings > 0 ? (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-900">
                  {warnings} {warnings === 1 ? "aviso" : "avisos"}
                </span>
              ) : (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-900">Sin avisos</span>
              )}
              {notes > 0 && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                  {notes} {notes === 1 ? "nota" : "notas"}
                </span>
              )}
              {autoFixes.length > 1 && !proposal && (
                <button type="button" onClick={() => void quickFix(autoFixes)} disabled={loading} className={`${fixBtnCls} ml-auto`}>
                  <IconWand size={13} className="text-sky-600" />
                  Arreglar lo automático ({autoFixes.length})
                </button>
              )}
            </div>

            {proposal && (
              <div className="rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50/70 to-white p-3.5">
                <p className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
                  <IconWand size={15} className="text-indigo-500" />
                  Propuesta de la IA
                </p>
                <p className="mt-0.5 text-xs text-slate-500">Ya la ves en el correo. Revísala antes de aplicarla.</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-[13px] leading-snug text-slate-700">
                  {proposal.changes.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={applyProposal} className="bg-brand inline-flex h-8 items-center gap-1.5 rounded-full px-4 text-xs font-semibold text-white shadow-sm shadow-sky-500/25">
                    Aplicar al formulario
                  </button>
                  <button type="button" onClick={() => void discardProposal()} className={fixBtnCls}>
                    Descartar
                  </button>
                </div>
              </div>
            )}

            {notice && (
              <p className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white" role="status">
                {notice}
              </p>
            )}

            {warnings === 0 && notes === 0 && (
              <div className={`flex gap-2 rounded-xl border px-3 py-2.5 text-[13px] leading-snug ${CHECK_STYLE.ok.cls}`}>
                {CHECK_STYLE.ok.icon}
                <span>No se han detectado problemas.</span>
              </div>
            )}

            {groups.map((g) => (
              <div key={g.field} className="space-y-1.5">
                <p className="text-xs font-medium text-slate-500">{FIELD_LABEL[g.field]}</p>
                <ul className="space-y-1.5">
                  {g.items.map((c, i) => (
                    <li key={i} className={`rounded-xl border px-3 py-2.5 text-[13px] leading-snug ${CHECK_STYLE[c.level].cls}`}>
                      <div className="flex gap-2">
                        <span className="mt-px shrink-0">{CHECK_STYLE[c.level].icon}</span>
                        <span>{c.text}</span>
                      </div>
                      {c.fix && !proposal && (
                        <button type="button" onClick={() => void quickFix([c.fix!])} disabled={loading} className={`${fixBtnCls} ml-6 mt-2`}>
                          <IconWand size={13} className="text-sky-600" />
                          {FIX_LABEL[c.fix]}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>

          <Section title="Así aparece en la bandeja de entrada">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="flex gap-3 bg-white px-3 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sky-500 text-xs font-bold text-white">DG</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-bold text-slate-900">{from.name}</span>
                    <span className="shrink-0 text-[11px] font-semibold text-sky-600">ahora</span>
                  </div>
                  <p className="truncate text-[13px] font-semibold text-slate-800">{data.subject}</p>
                  <p className="line-clamp-2 text-xs text-slate-500">{data.preheader}</p>
                </div>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              El texto gris es el que el programa de correo enseña bajo el asunto. Se genera solo, con el
              programa y la fecha límite.
            </p>
          </Section>

          <Section title="Envío">
            <dl className="space-y-1.5 text-[13px]">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Remitente</dt>
                <dd className="truncate text-right font-medium text-slate-800" title={data.from}>
                  {from.address || from.name}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Idioma del correo</dt>
                <dd className="font-medium text-slate-800">{configuredLang === "ca" ? "Català" : "Español"}</dd>
              </div>
            </dl>
            {lang !== configuredLang && (
              <p className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[12px] leading-snug text-sky-900">
                Estás viendo la versión en {LANG_NAME[lang]}; el correo se enviará en {LANG_NAME[configuredLang]}, que es el
                idioma elegido en el formulario.
              </p>
            )}
            <p className="text-[11px] leading-relaxed text-slate-400">
              Las credenciales y los enlaces de acceso de la vista previa y de la prueba son de ejemplo. Los enlaces del
              mensaje se abren en una pestaña nueva para que puedas comprobarlos.
            </p>
          </Section>
        </aside>
      </div>
    </div>,
    document.body,
  );
}
