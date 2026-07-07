"use client";

import { useActionState, useRef, useState } from "react";
import {
  createOrganization,
  createProject,
  createTeam,
  extractRosterFromImage,
  type ActionState,
} from "@/app/actions/org";
import {
  bulkInviteParticipants,
  inviteParticipant,
} from "@/app/actions/participants";

const initial: ActionState = {};

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

/** Reescala una imagen a un ancho máximo y la devuelve como data URL JPEG (para no exceder el límite del server action). */
function fileToDataUrl(file: File, maxW = 1600, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("img"));
      img.onload = () => {
        const scale = Math.min(1, maxW / (img.width || maxW));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("ctx"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = String(reader.result ?? "");
    };
    reader.readAsDataURL(file);
  });
}

/** Caja de credenciales recién creadas con botón para copiarlas. */
function CredentialsBox({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const [copied, setCopied] = useState(false);
  const text = `Correo: ${email}\nContraseña: ${password}`;
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard no disponible */
    }
  }
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
      <div className="grid gap-0.5 font-mono text-xs text-slate-700">
        <div>
          <span className="text-slate-400">Correo:</span> {email}
        </div>
        <div>
          <span className="text-slate-400">Contraseña:</span> {password}
        </div>
      </div>
      <button
        type="button"
        onClick={copy}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
      >
        {copied ? "Copiado ✓" : "⎘ Copiar datos"}
      </button>
    </div>
  );
}

function Feedback({ state }: { state: ActionState }) {
  if (state.error)
    return (
      <p className="text-xs font-medium text-rose-600">{state.error}</p>
    );
  if (state.credentials)
    return (
      <div className="space-y-2">
        {state.message && (
          <p className="text-xs font-medium text-emerald-600">{state.message}</p>
        )}
        <CredentialsBox
          email={state.credentials.email}
          password={state.credentials.password}
        />
      </div>
    );
  if (state.message)
    return (
      <p className="text-xs font-medium text-emerald-600">{state.message}</p>
    );
  if (state.ok)
    return (
      <p className="text-xs font-medium text-emerald-600">Guardado ✓</p>
    );
  return null;
}

function Submit({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-brand rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Guardando…" : label}
    </button>
  );
}

/** Alta de organización (SUPERADMIN). */
export function CreateOrgForm() {
  const [state, action, pending] = useActionState(createOrganization, initial);
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input
        name="name"
        required
        placeholder="Nombre de la organización"
        className={`${inputCls} flex-1 min-w-[220px]`}
      />
      <Submit pending={pending} label="Crear organización" />
      <Feedback state={state} />
    </form>
  );
}

/** Alta de proyecto en una organización (ADMIN cliente). */
export function CreateProjectForm({ organizationId }: { organizationId: string }) {
  const [state, action, pending] = useActionState(createProject, initial);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="organizationId" value={organizationId} />
      <div className="flex flex-wrap items-center gap-2">
        <input
          name="name"
          required
          placeholder="Nombre del proyecto"
          className={`${inputCls} flex-1 min-w-[200px]`}
        />
        <input
          name="description"
          placeholder="Descripción (opcional)"
          className={`${inputCls} flex-1 min-w-[200px]`}
        />
        <Submit pending={pending} label="Añadir proyecto" />
      </div>
      <Feedback state={state} />
    </form>
  );
}

/** Alta de equipo dentro de un proyecto. */
export function CreateTeamForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(createTeam, initial);
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="projectId" value={projectId} />
      <input
        name="name"
        required
        placeholder="Nombre del equipo"
        className={`${inputCls} flex-1 min-w-[160px]`}
      />
      <Submit pending={pending} label="Añadir equipo" />
      <Feedback state={state} />
    </form>
  );
}

interface TeamOption {
  id: string;
  name: string;
  projectName: string;
}

/** Alta de participante + invitación por enlace. */
export function InviteParticipantForm({
  organizationId,
  teams,
}: {
  organizationId: string;
  teams: TeamOption[];
}) {
  const [state, action, pending] = useActionState(inviteParticipant, initial);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="organizationId" value={organizationId} />
      <div className="flex flex-wrap items-center gap-2">
        <input
          name="fullName"
          required
          placeholder="Nombre completo"
          className={`${inputCls} flex-1 min-w-[160px]`}
        />
        <input
          name="email"
          type="email"
          required
          placeholder="email@empresa.com"
          className={`${inputCls} flex-1 min-w-[180px]`}
        />
        <select name="teamId" className={`${inputCls} min-w-[160px]`}>
          <option value="">Sin equipo</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.projectName} · {t.name}
            </option>
          ))}
        </select>
        <select name="lang" className={`${inputCls} min-w-[120px]`} title="Idioma del correo" defaultValue="ca">
          <option value="ca">Correo: CAT</option>
          <option value="es">Correo: ESP</option>
        </select>
        <Submit pending={pending} label="Invitar" />
      </div>
      <Feedback state={state} />
    </form>
  );
}

/** Alta masiva de participantes pegando un listado CSV/Excel "Nombre, email". */
export function BulkInviteForm({
  organizationId,
  teams,
}: {
  organizationId: string;
  teams: TeamOption[];
}) {
  const [state, action, pending] = useActionState(
    bulkInviteParticipants,
    initial,
  );
  const rosterRef = useRef<HTMLTextAreaElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractMsg, setExtractMsg] = useState<string | null>(null);

  function onCsvSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (rosterRef.current) {
        rosterRef.current.value = String(reader.result ?? "");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // permite volver a subir el mismo archivo
  }

  async function onImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setExtractMsg(null);
    setExtracting(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const r = await extractRosterFromImage({ imageDataUrl: dataUrl });
      if (r.ok && r.roster && rosterRef.current) {
        const existing = rosterRef.current.value.trim();
        rosterRef.current.value = existing ? `${existing}\n${r.roster}` : r.roster;
        const n = r.roster.split("\n").filter(Boolean).length;
        setExtractMsg(`✓ ${n} ${n === 1 ? "persona añadida" : "personas añadidas"}. Revísalas antes de invitar.`);
      } else {
        setExtractMsg(r.error ?? "No se pudo extraer de la imagen.");
      }
    } catch {
      setExtractMsg("No se pudo leer la imagen.");
    } finally {
      setExtracting(false);
    }
  }

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="organizationId" value={organizationId} />

      <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-3.5 py-2.5 text-sm text-slate-600 transition hover:border-sky-400 hover:text-slate-900">
        <span>
          <span className="font-semibold text-sky-700">Subir CSV</span>
          {fileName ? ` · ${fileName}` : " (Nombre, email)"}
        </span>
        <span className="text-sky-600">↑</span>
        <input type="file" accept=".csv,text/csv,text/plain" onChange={onCsvSelected} className="hidden" />
      </label>

      <label
        className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-dashed border-sky-300 bg-sky-50/40 px-3.5 py-2.5 text-sm text-slate-600 transition hover:border-sky-400 ${
          extracting ? "pointer-events-none opacity-70" : ""
        }`}
      >
        <span>
          <span className="font-semibold text-sky-700">
            {extracting ? "Extrayendo con IA…" : "📷 Extraer de una foto (IA)"}
          </span>
          <span className="text-slate-400"> — sube una imagen de la tabla</span>
        </span>
        <span className="text-sky-600">✨</span>
        <input
          type="file"
          accept="image/*"
          onChange={onImageSelected}
          disabled={extracting}
          className="hidden"
        />
      </label>
      {extractMsg && (
        <p className="text-[11px] font-medium text-sky-700">{extractMsg}</p>
      )}

      <textarea
        ref={rosterRef}
        name="roster"
        required
        rows={4}
        placeholder={"Nombre Apellido, email@empresa.com\nOtra Persona, otra@empresa.com"}
        className={`${inputCls} font-mono text-xs`}
      />
      <div className="flex flex-wrap items-center gap-2">
        <select name="teamId" className={`${inputCls} min-w-[160px] flex-1`}>
          <option value="">Sin equipo</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.projectName} · {t.name}
            </option>
          ))}
        </select>
        <Submit pending={pending} label="Invitar a todos" />
      </div>
      <p className="text-[11px] text-slate-400">
        Sube un CSV o pega las filas: una persona por línea, nombre y email
        separados por coma. La primera fila de cabecera (Nombre, email) se ignora.
      </p>
      {state.message ? (
        <p className="text-xs font-medium text-emerald-600">{state.message}</p>
      ) : (
        <Feedback state={state} />
      )}
    </form>
  );
}
