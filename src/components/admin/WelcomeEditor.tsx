"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { TextAlign } from "@tiptap/extension-text-align";

/**
 * Editor con formato del mensaje de bienvenida del correo de invitación
 * (como un procesador de textos: negrita, títulos, colores, tipografía…).
 * Devuelve HTML; el servidor lo sanea antes de guardarlo y al pintar el
 * correo (src/lib/email/rich-text.ts), así que aquí no hace falta confiar en él.
 */

export interface WelcomeEditorApi {
  /** Inserta texto donde esté el cursor (p. ej. una variable {{nombre}}). */
  insertText: (text: string) => void;
  /** Sustituye todo el contenido (p. ej. con lo que devuelve la IA). */
  setHtml: (html: string) => void;
}

/** Tipografías seguras en correo: están en Windows, macOS y los webmails. */
const FONTS = [
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Trebuchet", value: "'Trebuchet MS', Helvetica, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Courier", value: "'Courier New', Courier, monospace" },
];
const SIZES = [
  { label: "Pequeño", value: "13px" },
  { label: "Grande", value: "18px" },
  { label: "Muy grande", value: "22px" },
];
const COLORS = [
  { label: "Azul GESEM", value: "#00a1e0" },
  { label: "Azul oscuro", value: "#0369a1" },
  { label: "Negro", value: "#0f172a" },
  { label: "Gris", value: "#64748b" },
  { label: "Verde", value: "#15803d" },
  { label: "Naranja", value: "#c2410c" },
  { label: "Rojo", value: "#b91c1c" },
  { label: "Morado", value: "#7e22ce" },
];
const HIGHLIGHTS = [
  { label: "Amarillo", value: "#fef08a" },
  { label: "Azul claro", value: "#e0f2fe" },
  { label: "Verde claro", value: "#dcfce7" },
  { label: "Rosa", value: "#fce7f3" },
];

/** Estilos del área de escritura: se parecen a cómo se verá en el correo. */
const CONTENT_CLS = [
  "min-h-[180px] max-h-[480px] overflow-y-auto px-3.5 py-3 text-[15px] leading-relaxed text-slate-600 outline-none",
  "[&_p]:mb-3 [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-slate-900",
  "[&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-900",
  "[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li_p]:mb-1",
  "[&_blockquote]:mb-3 [&_blockquote]:rounded-lg [&_blockquote]:border-l-4 [&_blockquote]:border-sky-500 [&_blockquote]:bg-sky-50 [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote_p]:mb-1",
  "[&_hr]:my-4 [&_hr]:border-slate-200 [&_a]:text-sky-600 [&_a]:underline",
].join(" ");

/** Normaliza lo que se escribe como enlace: web, correo o dirección completa. */
function toHref(raw: string): string {
  const v = raw.trim();
  if (/^(https?:\/\/|mailto:)/i.test(v)) return v;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return `mailto:${v}`;
  return `https://${v}`;
}

function ToolButton({
  active = false,
  disabled = false,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      // Sin esto, el clic quitaría el foco del editor y se perdería la selección.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-sm transition disabled:opacity-35 ${
        active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

const Sep = () => <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />;
const selectCls =
  "h-8 rounded-md border border-transparent bg-transparent px-1.5 text-xs font-semibold text-slate-600 outline-none transition hover:bg-slate-100 focus:border-sky-300";

type Panel = "color" | "highlight" | "link" | null;

function Toolbar({ editor }: { editor: Editor }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      block: e.isActive("heading", { level: 2 }) ? "h2" : e.isActive("heading", { level: 3 }) ? "h3" : "p",
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      align: (["center", "right", "justify"] as const).find((a) => e.isActive({ textAlign: a })) ?? "left",
      color: (e.getAttributes("textStyle").color as string | undefined) ?? "",
      highlight: (e.getAttributes("textStyle").backgroundColor as string | undefined) ?? "",
      font: (e.getAttributes("textStyle").fontFamily as string | undefined) ?? "",
      size: (e.getAttributes("textStyle").fontSize as string | undefined) ?? "",
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const [panel, setPanel] = useState<Panel>(null);
  const [href, setHref] = useState("");
  const barRef = useRef<HTMLDivElement>(null);

  // Cierra el panel abierto (colores o enlace) al hacer clic fuera de la barra.
  useEffect(() => {
    if (!panel) return;
    const close = (e: MouseEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setPanel(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [panel]);

  const run = () => editor.chain().focus();
  const toggle = (p: Exclude<Panel, null>) => setPanel((cur) => (cur === p ? null : p));

  function openLink() {
    setHref((editor.getAttributes("link").href as string | undefined) ?? "");
    toggle("link");
  }
  function applyLink() {
    const v = href.trim();
    if (v) run().extendMarkRange("link").setLink({ href: toHref(v) }).run();
    else run().extendMarkRange("link").unsetLink().run();
    setPanel(null);
  }

  return (
    <div ref={barRef} className="relative flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50/80 px-1.5 py-1">
      <select
        value={s.block}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "p") run().setParagraph().run();
          else run().setHeading({ level: v === "h2" ? 2 : 3 }).run();
        }}
        className={selectCls}
        title="Tipo de texto"
        aria-label="Tipo de texto"
      >
        <option value="p">Párrafo</option>
        <option value="h2">Título</option>
        <option value="h3">Subtítulo</option>
      </select>
      <select
        value={FONTS.some((f) => f.value === s.font) ? s.font : ""}
        onChange={(e) => {
          const v = e.target.value;
          if (v) run().setFontFamily(v).run();
          else run().unsetFontFamily().run();
        }}
        className={`${selectCls} max-w-[7.5rem]`}
        title="Tipografía (selecciona todo con Ctrl+A para cambiar el mensaje entero)"
        aria-label="Tipografía"
      >
        <option value="">Tipografía</option>
        {FONTS.map((f) => (
          <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
            {f.label}
          </option>
        ))}
      </select>
      <select
        value={SIZES.some((z) => z.value === s.size) ? s.size : ""}
        onChange={(e) => {
          const v = e.target.value;
          if (v) run().setFontSize(v).run();
          else run().unsetFontSize().run();
        }}
        className={selectCls}
        title="Tamaño del texto"
        aria-label="Tamaño del texto"
      >
        <option value="">Normal</option>
        {SIZES.map((z) => (
          <option key={z.value} value={z.value}>
            {z.label}
          </option>
        ))}
      </select>
      <Sep />
      <ToolButton active={s.bold} onClick={() => run().toggleBold().run()} title="Negrita (Ctrl+B)">
        <b>B</b>
      </ToolButton>
      <ToolButton active={s.italic} onClick={() => run().toggleItalic().run()} title="Cursiva (Ctrl+I)">
        <i className="font-serif">I</i>
      </ToolButton>
      <ToolButton active={s.underline} onClick={() => run().toggleUnderline().run()} title="Subrayado (Ctrl+U)">
        <u>U</u>
      </ToolButton>
      <ToolButton active={s.strike} onClick={() => run().toggleStrike().run()} title="Tachado">
        <s>S</s>
      </ToolButton>
      <ToolButton active={panel === "color" || !!s.color} onClick={() => toggle("color")} title="Color del texto">
        <span className="flex flex-col items-center leading-none">
          <span className="text-[13px] font-bold">A</span>
          <span className="mt-0.5 h-1 w-4 rounded-sm" style={{ background: s.color || "#0f172a" }} />
        </span>
      </ToolButton>
      <ToolButton active={panel === "highlight" || !!s.highlight} onClick={() => toggle("highlight")} title="Resaltar">
        <span className="rounded px-1 text-[13px] font-bold" style={{ background: s.highlight || "#fef08a" }}>
          ab
        </span>
      </ToolButton>
      <Sep />
      <ToolButton active={s.align === "left"} onClick={() => run().unsetTextAlign().run()} title="Alinear a la izquierda">
        <AlignIcon kind="left" />
      </ToolButton>
      <ToolButton active={s.align === "center"} onClick={() => run().setTextAlign("center").run()} title="Centrar">
        <AlignIcon kind="center" />
      </ToolButton>
      <ToolButton active={s.align === "right"} onClick={() => run().setTextAlign("right").run()} title="Alinear a la derecha">
        <AlignIcon kind="right" />
      </ToolButton>
      <ToolButton active={s.align === "justify"} onClick={() => run().setTextAlign("justify").run()} title="Justificar">
        <AlignIcon kind="justify" />
      </ToolButton>
      <Sep />
      <ToolButton active={s.bullet} onClick={() => run().toggleBulletList().run()} title="Lista con viñetas">
        <span className="text-base leading-none">•≡</span>
      </ToolButton>
      <ToolButton active={s.ordered} onClick={() => run().toggleOrderedList().run()} title="Lista numerada">
        <span className="text-xs font-bold">1.</span>
      </ToolButton>
      <ToolButton active={s.quote} onClick={() => run().toggleBlockquote().run()} title="Destacado (recuadro azul)">
        <span className="text-lg leading-none">❝</span>
      </ToolButton>
      <ToolButton onClick={() => run().setHorizontalRule().run()} title="Línea separadora">
        <span className="text-xs font-bold">—</span>
      </ToolButton>
      <ToolButton active={s.link || panel === "link"} onClick={openLink} title="Enlace">
        <span className="text-sm">🔗</span>
      </ToolButton>
      <Sep />
      <ToolButton onClick={() => run().unsetAllMarks().clearNodes().run()} title="Quitar formato">
        <span className="text-xs font-bold">T<sub>×</sub></span>
      </ToolButton>
      <ToolButton disabled={!s.canUndo} onClick={() => run().undo().run()} title="Deshacer (Ctrl+Z)">
        ↶
      </ToolButton>
      <ToolButton disabled={!s.canRedo} onClick={() => run().redo().run()} title="Rehacer (Ctrl+Y)">
        ↷
      </ToolButton>

      {(panel === "color" || panel === "highlight") && (
        <div className="absolute left-1.5 top-full z-20 mt-1 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {panel === "color" ? "Color del texto" : "Resaltado"}
          </p>
          <div className="grid grid-cols-8 gap-1.5">
            {(panel === "color" ? COLORS : HIGHLIGHTS).map((c) => (
              <button
                key={c.value}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (panel === "color") run().setColor(c.value).run();
                  else run().setBackgroundColor(c.value).run();
                  setPanel(null);
                }}
                title={c.label}
                aria-label={c.label}
                className="h-5 w-5 rounded-md border border-black/10 transition hover:scale-110"
                style={{ background: c.value }}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            {panel === "color" && (
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-500">
                <input
                  type="color"
                  value={s.color.startsWith("#") && s.color.length === 7 ? s.color : "#0f172a"}
                  onChange={(e) => run().setColor(e.target.value).run()}
                  className="h-5 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                Otro…
              </label>
            )}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (panel === "color") run().unsetColor().run();
                else run().unsetBackgroundColor().run();
                setPanel(null);
              }}
              className="ml-auto text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Quitar
            </button>
          </div>
        </div>
      )}

      {panel === "link" && (
        <div className="absolute left-1.5 top-full z-20 mt-1 flex w-[min(24rem,calc(100%-0.75rem))] items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          <input
            autoFocus
            value={href}
            onChange={(e) => setHref(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              } else if (e.key === "Escape") setPanel(null);
            }}
            placeholder="https://… o correo@empresa.com"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-sky-400"
          />
          <button
            type="button"
            onClick={applyLink}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
          >
            {href.trim() ? "Aplicar" : "Quitar"}
          </button>
        </div>
      )}
    </div>
  );
}

function AlignIcon({ kind }: { kind: "left" | "center" | "right" | "justify" }) {
  const lines = { left: [14, 10, 14, 8], center: [14, 10, 14, 8], right: [14, 10, 14, 8], justify: [14, 14, 14, 14] }[kind];
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" aria-hidden>
      {lines.map((w, i) => {
        const x = kind === "center" ? (16 - w) / 2 : kind === "right" ? 16 - w : 1;
        return <rect key={i} x={x} y={1 + i * 3.4} width={w} height="1.6" rx="0.8" fill="currentColor" />;
      })}
    </svg>
  );
}

export default function WelcomeEditor({
  initialHtml,
  onChange,
  onFocus,
  onReady,
}: {
  initialHtml: string;
  /** HTML y texto plano en cada cambio. */
  onChange: (html: string, text: string) => void;
  onFocus?: () => void;
  onReady?: (api: WelcomeEditorApi) => void;
}) {
  // Callbacks en refs: el editor se crea una sola vez y siempre llama a la versión actual.
  const cb = useRef({ onChange, onFocus, onReady });
  useEffect(() => {
    cb.current = { onChange, onFocus, onReady };
  });
  // Para el texto de ayuda: se calcula al cargar y en cada cambio del editor.
  const [empty, setEmpty] = useState(() => initialHtml.replace(/<[^>]*>/g, "").trim() === "");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: { target: null, rel: null },
        },
      }),
      TextStyleKit.configure({ lineHeight: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: { class: CONTENT_CLS, "aria-label": "Mensaje de bienvenida", role: "textbox", "aria-multiline": "true" },
    },
    onUpdate: ({ editor: e }) => {
      setEmpty(e.isEmpty);
      cb.current.onChange(e.getHTML(), e.getText());
    },
    onFocus: () => cb.current.onFocus?.(),
  });

  useEffect(() => {
    if (!editor) return;
    cb.current.onReady?.({
      insertText(text) {
        // Separa la variable de la palabra anterior, como en el campo del asunto.
        const { from } = editor.state.selection;
        const before = editor.state.doc.textBetween(Math.max(0, from - 1), from);
        const space = before && !/[\s(¡¿"'«]/.test(before) ? " " : "";
        editor.chain().focus().insertContent(space + text).run();
      },
      setHtml(html) {
        editor.commands.setContent(html, { emitUpdate: true });
      },
    });
  }, [editor]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100">
      {editor ? <Toolbar editor={editor} /> : <div className="h-10 border-b border-slate-200 bg-slate-50/80" />}
      <div className="relative" style={{ fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif" }}>
        {empty && (
          <p className="pointer-events-none absolute left-3.5 top-3 text-sm text-slate-400">
            Si lo dejas vacío se usa un texto por defecto.
          </p>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
