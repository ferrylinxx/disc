"use client";

import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useTransition,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Avatar } from "@/components/dashboard/AdminWidgets";
import { removeOwnAvatar, uploadOwnAvatar, type AvatarResult } from "@/app/actions/profile";
import type { Dict } from "@/lib/i18n/dictionaries";

type Labels = Dict["profile"];

/** Tope del archivo original (la foto que se guarda es mucho menor: 400×400). */
const MAX_FILE_BYTES = 15 * 1024 * 1024;
/** Lado del visor de recorte y de la foto guardada, en px. */
const VIEW = 240;
const OUT = 400;
const MAX_ZOOM = 4;

const btnPrimary =
  "bg-brand inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-500/25 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-sky-500/30 disabled:opacity-60 disabled:hover:translate-y-0";
const btnSecondary =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-60";

function errorText(r: AvatarResult | null, t: Labels): string {
  if (r?.error === "too-big") return t.errPhotoBig;
  if (r?.error === "invalid") return t.errPhotoInvalid;
  return t.errGeneric;
}

/**
 * Foto de perfil del usuario: avatar grande con botón de cámara, arrastrar y
 * soltar, y un visor para encuadrar (mover, acercar y girar) antes de guardar.
 * La foto se recorta y se reduce aquí, en el navegador; al servidor solo llega
 * un cuadrado de 400 px. `children` va entre la foto y los botones (nombre, rol…).
 */
export function AvatarUploader({
  name,
  image: initialImage,
  superadmin = false,
  labels,
  children,
}: {
  name: string;
  image: string | null;
  superadmin?: boolean;
  labels: Labels;
  children?: ReactNode;
}) {
  const [image, setImage] = useState(initialImage);
  const [source, setSource] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [cropError, setCropError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  const choose = () => fileInput.current?.click();

  const pick = (file: File | undefined) => {
    setMsg(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) return setMsg({ ok: false, text: labels.errPhotoType });
    if (file.size > MAX_FILE_BYTES) return setMsg({ ok: false, text: labels.errPhotoHuge });
    setCropError(null);
    setSource(URL.createObjectURL(file));
  };

  const closeCrop = () => {
    if (source) URL.revokeObjectURL(source);
    setSource(null);
    setCropError(null);
  };

  const save = (dataUrl: string) =>
    startTransition(async () => {
      const r = await uploadOwnAvatar(dataUrl).catch(() => null);
      if (!r?.ok) return setCropError(errorText(r, labels));
      closeCrop();
      setImage(r.image ?? null);
      setMsg({ ok: true, text: labels.photoSaved });
    });

  const remove = () =>
    startTransition(async () => {
      const r = await removeOwnAvatar().catch(() => null);
      if (!r?.ok) return setMsg({ ok: false, text: errorText(r, labels) });
      setImage(null);
      setMsg({ ok: true, text: labels.photoRemoved });
    });

  const onDrag = (e: DragEvent, over: boolean) => {
    if (![...e.dataTransfer.types].includes("Files")) return;
    e.preventDefault();
    setDragging(over);
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="relative"
        onDragEnter={(e) => onDrag(e, true)}
        onDragOver={(e) => onDrag(e, true)}
        onDragLeave={(e) => onDrag(e, false)}
        onDrop={(e) => {
          onDrag(e, false);
          pick(e.dataTransfer.files[0]);
        }}
      >
        <span className={superadmin ? "inline-flex" : "inline-flex rounded-full shadow-lg shadow-slate-900/10 ring-4 ring-white"}>
          <Avatar name={name} image={image} superadmin={superadmin} size="lg" />
        </span>
        <button
          type="button"
          onClick={choose}
          disabled={pending}
          title={image ? labels.change : labels.upload}
          aria-label={image ? labels.change : labels.upload}
          className="bg-brand absolute -bottom-1 -right-1 z-[3] grid h-9 w-9 place-items-center rounded-full border-[3px] border-white text-white shadow-md transition hover:scale-105 disabled:opacity-60"
        >
          <CameraIcon />
        </button>
        {dragging && (
          <div className="pointer-events-none absolute -inset-2 z-[4] grid place-items-center rounded-full border-2 border-dashed border-sky-400 bg-sky-50/95 px-3 text-[11px] font-semibold leading-tight text-sky-700">
            {labels.dropHere}
          </div>
        )}
      </div>

      {children}

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={choose} disabled={pending} className={btnPrimary}>
          {image ? labels.change : labels.upload}
        </button>
        {image && (
          <button type="button" onClick={remove} disabled={pending} className={btnSecondary}>
            {labels.remove}
          </button>
        )}
      </div>
      <p className="mt-2 text-[11px] text-slate-400">
        {labels.dropHint} · JPG, PNG, WebP
      </p>
      {msg && (
        <p
          role="status"
          className={`mt-2 text-xs font-medium ${msg.ok ? "text-emerald-600" : "text-rose-600"}`}
        >
          {msg.text}
        </p>
      )}

      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/*"
        className="hidden"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {/* En un portal: las tarjetas animadas (transform) atraparían el fixed. */}
      {source &&
        createPortal(
          <CropDialog
            src={source}
            labels={labels}
            pending={pending}
            error={cropError}
            onCancel={closeCrop}
            onSave={save}
            onUnreadable={() => {
              closeCrop();
              setMsg({ ok: false, text: labels.errPhotoRead });
            }}
          />,
          document.body,
        )}
    </div>
  );
}

/** Visor de recorte: arrastrar para mover, rueda o control para acercar, botón para girar. */
function CropDialog({
  src,
  labels,
  pending,
  error,
  onCancel,
  onSave,
  onUnreadable,
}: {
  src: string;
  labels: Labels;
  pending: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (dataUrl: string) => void;
  onUnreadable: () => void;
}) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ id: number; x: number; y: number; from: { x: number; y: number } } | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const failed = useEffectEvent(() => onUnreadable());
  useEffect(() => {
    const el = new Image();
    el.onload = () => setImg(el);
    el.onerror = () => failed();
    el.src = src;
  }, [src]);

  useEffect(() => {
    panel.current?.focus();
  }, []);

  // Escala que hace que la foto (girada) cubra el visor entero, por el zoom.
  const turned = rotation % 180 !== 0;
  const w = img ? (turned ? img.naturalHeight : img.naturalWidth) : 1;
  const h = img ? (turned ? img.naturalWidth : img.naturalHeight) : 1;
  const scaleFor = (z: number) => (VIEW / Math.min(w, h)) * z;
  const scale = scaleFor(zoom);
  const clamp = (p: { x: number; y: number }, s = scale) => {
    const mx = Math.max(0, (w * s - VIEW) / 2);
    const my = Math.max(0, (h * s - VIEW) / 2);
    return { x: Math.min(mx, Math.max(-mx, p.x)), y: Math.min(my, Math.max(-my, p.y)) };
  };

  const zoomTo = (z: number) => {
    const next = Math.min(MAX_ZOOM, Math.max(1, z));
    const k = scaleFor(next) / scale;
    setZoom(next);
    setPos((p) => clamp({ x: p.x * k, y: p.y * k }, scaleFor(next)));
  };
  // Rueda para acercar: listener nativo y no pasivo, para que no se mueva la página.
  const onWheel = useEffectEvent((e: WheelEvent) => {
    e.preventDefault();
    zoomTo(zoom * Math.exp(-e.deltaY * 0.0015));
  });
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const handler = (e: WheelEvent) => onWheel(e);
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const rotate = () => {
    setRotation((r) => (r + 90) % 360);
    setPos({ x: 0, y: 0 });
  };

  const exportPhoto = () => {
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUT;
    canvas.height = OUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const r = OUT / VIEW;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, OUT, OUT);
    ctx.imageSmoothingQuality = "high";
    ctx.translate(OUT / 2 + pos.x * r, OUT / 2 + pos.y * r);
    ctx.rotate((rotation * Math.PI) / 180);
    const dw = img.naturalWidth * scale * r;
    const dh = img.naturalHeight * scale * r;
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    // WebP si el navegador sabe codificarlo (Safari antiguo devuelve PNG); si no, JPEG.
    const webp = canvas.toDataURL("image/webp", 0.9);
    onSave(webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", 0.9));
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 24 : 8;
    // La foto va hacia donde apunta la flecha, como al arrastrarla.
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    if (moves[e.key]) {
      e.preventDefault();
      const [dx, dy] = moves[e.key];
      setPos((p) => clamp({ x: p.x + dx, y: p.y + dy }));
    } else if (e.key === "+" || e.key === "=") {
      zoomTo(zoom + 0.2);
    } else if (e.key === "-") {
      zoomTo(zoom - 0.2);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !pending) onCancel();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-title"
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === "Escape" && !pending) onCancel();
        }}
        className="animate-scale-in w-full max-w-[22rem] rounded-3xl bg-white p-5 shadow-2xl shadow-slate-900/20 outline-none sm:p-6"
      >
        <h2 id="crop-title" className="text-base font-bold text-slate-900">
          {labels.cropTitle}
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">{labels.cropHint}</p>

        <div
          ref={viewport}
          tabIndex={0}
          aria-label={labels.cropHint}
          onKeyDown={onKeyDown}
          onPointerDown={(e) => {
            if (!img) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, from: pos };
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d || d.id !== e.pointerId) return;
            setPos(clamp({ x: d.from.x + e.clientX - d.x, y: d.from.y + e.clientY - d.y }));
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
          className="relative mx-auto mt-4 cursor-grab touch-none select-none overflow-hidden rounded-2xl bg-slate-900 outline-none focus-visible:ring-4 focus-visible:ring-sky-200 active:cursor-grabbing"
          style={{ width: VIEW, height: VIEW }}
        >
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute max-w-none"
              style={{
                left: VIEW / 2 + pos.x,
                top: VIEW / 2 + pos.y,
                width: img.naturalWidth * scale,
                height: img.naturalHeight * scale,
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              }}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          )}
          {/* Lo que queda fuera del círculo se ve atenuado: así se verá el avatar. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/90"
            style={{ boxShadow: "0 0 0 999px rgba(15, 23, 42, 0.55)" }}
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span aria-hidden className="text-slate-400">
            <ZoomIcon minus />
          </span>
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => zoomTo(Number(e.target.value))}
            aria-label={labels.zoom}
            disabled={!img}
            className="h-1.5 flex-1 cursor-pointer rounded-full accent-sky-500 outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
          />
          <span aria-hidden className="text-slate-400">
            <ZoomIcon />
          </span>
          <button
            type="button"
            onClick={rotate}
            disabled={!img}
            title={labels.rotate}
            aria-label={labels.rotate}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-50"
          >
            <RotateIcon />
          </button>
        </div>

        {error && <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={pending} className={btnSecondary}>
            {labels.cancel}
          </button>
          <button type="button" onClick={exportPhoto} disabled={!img || pending} className={btnPrimary}>
            {pending ? labels.saving : labels.savePhoto}
          </button>
        </div>
      </div>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l1.3-2h6l1.3 2h1.2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5Z" />
      <circle cx="12" cy="12.5" r="3.2" />
    </svg>
  );
}

function ZoomIcon({ minus = false }: { minus?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={minus ? "h-3.5 w-3.5" : "h-5 w-5"} aria-hidden>
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
      <path d="m7 16 3.5-4 2.5 2.8 1.8-2 2.2 3.2" />
    </svg>
  );
}

function RotateIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
      <path d="M20 11a8 8 0 1 0-2.3 5.7" />
      <path d="M20 4v7h-7" />
    </svg>
  );
}
