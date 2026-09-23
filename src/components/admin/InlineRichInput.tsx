"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Extension } from "@tiptap/core";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color, TextStyle } from "@tiptap/extension-text-style";

/**
 * Campo de una sola línea con formato en línea (negrita, cursiva, subrayado y
 * color), para el nombre del programa. Devuelve el HTML y el texto plano: el
 * cuerpo del correo usa el HTML; el asunto y la bandeja, el texto. El servidor
 * sanea el HTML (sanitizeInlineHtml), así que aquí no hace falta confiar en él.
 */

export interface InlineRichInputApi {
  setHtml: (html: string) => void;
}

const COLORS = [
  { label: "Azul GESEM", value: "#00a1e0" },
  { label: "Azul oscuro", value: "#0369a1" },
  { label: "Negro", value: "#0f172a" },
  { label: "Verde", value: "#15803d" },
  { label: "Naranja", value: "#c2410c" },
  { label: "Rojo", value: "#b91c1c" },
  { label: "Morado", value: "#7e22ce" },
];

/** Una sola línea: Intro no crea párrafos nuevos. */
const SingleLine = Extension.create({
  name: "singleLine",
  addKeyboardShortcuts() {
    return { Enter: () => true, "Shift-Enter": () => true, "Mod-Enter": () => true };
  },
});

function MiniButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`grid h-7 w-7 place-items-center rounded-lg text-[13px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
        active ? "bg-sky-100 text-sky-800 ring-1 ring-sky-200" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

function MiniToolbar({ editor }: { editor: Editor }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      color: (e.getAttributes("textStyle").color as string | undefined) ?? "",
    }),
  });
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const run = () => editor.chain().focus();

  return (
    <div ref={ref} className="relative flex shrink-0 items-center gap-0.5 border-l border-slate-100 pl-1.5">
      <MiniButton active={s.bold} onClick={() => run().toggleBold().run()} title="Negrita (Ctrl+B)">
        <b>B</b>
      </MiniButton>
      <MiniButton active={s.italic} onClick={() => run().toggleItalic().run()} title="Cursiva (Ctrl+I)">
        <i className="font-serif">I</i>
      </MiniButton>
      <MiniButton active={s.underline} onClick={() => run().toggleUnderline().run()} title="Subrayado (Ctrl+U)">
        <u>U</u>
      </MiniButton>
      <MiniButton active={open || !!s.color} onClick={() => setOpen((v) => !v)} title="Color">
        <span className="flex flex-col items-center leading-none">
          <span className="text-[12px] font-bold">A</span>
          <span className="mt-0.5 h-[3px] w-3.5 rounded-sm" style={{ background: s.color || "#0f172a" }} />
        </span>
      </MiniButton>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-lg">
          <div className="flex gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  run().setColor(c.value).run();
                  setOpen(false);
                }}
                title={c.label}
                aria-label={c.label}
                className="h-5 w-5 rounded-md border border-black/10 transition hover:scale-110"
                style={{ background: c.value }}
              />
            ))}
          </div>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              run().unsetColor().run();
              setOpen(false);
            }}
            className="mt-2 w-full text-right text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Quitar color
          </button>
        </div>
      )}
    </div>
  );
}

export default function InlineRichInput({
  initialHtml,
  placeholder,
  ariaLabel,
  onChange,
  onReady,
}: {
  initialHtml: string;
  placeholder: string;
  ariaLabel: string;
  onChange: (html: string, text: string) => void;
  onReady?: (api: InlineRichInputApi) => void;
}) {
  const cb = useRef({ onChange, onReady });
  useEffect(() => {
    cb.current = { onChange, onReady };
  });
  const [empty, setEmpty] = useState(() => initialHtml.replace(/<[^>]*>/g, "").trim() === "");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        listKeymap: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        hardBreak: false,
        link: false,
        strike: false,
        dropcursor: false,
        trailingNode: false,
      }),
      TextStyle,
      Color,
      SingleLine,
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: "min-w-0 flex-1 overflow-x-auto whitespace-nowrap py-2 text-sm text-slate-900 outline-none [&_p]:m-0",
        "aria-label": ariaLabel,
        role: "textbox",
      },
      // Al pegar varias líneas, se juntan en una.
      transformPastedText: (text) => text.replace(/\s*\n+\s*/g, " "),
    },
    onUpdate: ({ editor: e }) => {
      setEmpty(e.isEmpty);
      // Varios párrafos (p. ej. al pegar HTML) se aplanan en una frase.
      const html = e.getHTML().replace(/<\/p>\s*<p>/g, " ").replace(/^<p>|<\/p>$/g, "");
      cb.current.onChange(html, e.getText({ blockSeparator: " " }).trim());
    },
  });

  useEffect(() => {
    if (!editor) return;
    cb.current.onReady?.({
      setHtml(html) {
        editor.commands.setContent(html, { emitUpdate: true });
      },
    });
  }, [editor]);

  return (
    <div className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white pl-3.5 pr-1.5 transition focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100">
      <div className="relative min-w-0 flex-1">
        {empty && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-sm text-slate-400">
            {placeholder}
          </span>
        )}
        <EditorContent editor={editor} />
      </div>
      {editor ? <MiniToolbar editor={editor} /> : <div className="h-9 w-[7.5rem]" />}
    </div>
  );
}
