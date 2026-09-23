"use client";

import { useEffect, useRef, useState } from "react";
import { Extension } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { EditorToolbar } from "./EditorToolbar";

/**
 * Campo de una sola línea con la misma barra de formato que el mensaje de
 * bienvenida (tipografía, tamaño, negrita, cursiva, subrayado, tachado, color
 * y resaltado), para el nombre del programa. Devuelve el HTML y el texto plano:
 * el cuerpo del correo usa el HTML; el asunto y la bandeja, el texto. El
 * servidor sanea el HTML (sanitizeInlineHtml), así que aquí no hace falta confiar en él.
 */

export interface InlineRichInputApi {
  setHtml: (html: string) => void;
}

/** Una sola línea: Intro no crea párrafos nuevos. */
const SingleLine = Extension.create({
  name: "singleLine",
  addKeyboardShortcuts() {
    return { Enter: () => true, "Shift-Enter": () => true, "Mod-Enter": () => true };
  },
});

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
        dropcursor: false,
        trailingNode: false,
      }),
      TextStyleKit.configure({ lineHeight: false }),
      SingleLine,
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: "min-w-0 overflow-x-auto whitespace-nowrap px-3.5 py-2.5 text-sm text-slate-900 outline-none [&_p]:m-0",
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
    <div className="rounded-xl border border-slate-200 bg-white transition focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100">
      {editor ? (
        <div className="overflow-visible rounded-t-xl [&>div]:rounded-t-xl">
          <EditorToolbar editor={editor} variant="inline" />
        </div>
      ) : (
        <div className="h-10 rounded-t-xl border-b border-slate-200 bg-slate-50/80" />
      )}
      <div className="relative" style={{ fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif" }}>
        {empty && (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-slate-400">
            {placeholder}
          </span>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
