"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { TextAlign } from "@tiptap/extension-text-align";
import { EditorToolbar } from "./EditorToolbar";

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

/** Estilos del área de escritura: se parecen a cómo se verá en el correo. */
const CONTENT_CLS = [
  "min-h-[180px] max-h-[480px] overflow-y-auto px-3.5 py-3 text-[15px] leading-relaxed text-slate-600 outline-none",
  "[&_p]:mb-3 [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-slate-900",
  "[&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-900",
  "[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li_p]:mb-1",
  "[&_blockquote]:mb-3 [&_blockquote]:rounded-lg [&_blockquote]:border-l-4 [&_blockquote]:border-sky-500 [&_blockquote]:bg-sky-50 [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote_p]:mb-1",
  "[&_hr]:my-4 [&_hr]:border-slate-200 [&_a]:text-sky-600 [&_a]:underline",
].join(" ");

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
      {editor ? <EditorToolbar editor={editor} /> : <div className="h-10 border-b border-slate-200 bg-slate-50/80" />}
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
