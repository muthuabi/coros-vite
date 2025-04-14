import React, { useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Heading from "@tiptap/extension-heading";
import CodeBlock from "@tiptap/extension-code-block";
import Link from "@tiptap/extension-link"; // ✅ Add this
import "../styles/editor.css";

const MarkupEditor = () => {
  const fileInputRef = useRef();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      CodeBlock,
      Heading.configure({ levels: [1, 2, 3] }),
      Link.configure({
        openOnClick: true,
        autolink: true, // ✅ auto-detect URLs
        linkOnPaste: true,
      }),
    ],
    content: "<p>Hello Krish! Start writing...</p>",
    editorProps: {
      handleKeyDown(view, event) {
        if (event.key === "Tab") {
          event.preventDefault();
          view.dispatch(
            view.state.tr.insertText("    ") // 4 spaces for tab
          );
          return true;
        }
        return false;
      },
    },
  });

  const insertImageFromFile = (e) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onloadend = () => {
        editor.chain().focus().setImage({ src: reader.result }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  const insertURL = () => {
    const url = window.prompt("Enter the URL you want to share");
    if (url) {
      editor.chain().focus().setLink({ href: url }).insertContent(url).run();
    }
  };

  const toggleHeading = (level) => {
    const isAnyHeadingActive = [1, 2, 3].some((l) =>
      editor.isActive("heading", { level: l })
    );
    if (isAnyHeadingActive) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  if (!editor) return null;

  return (
    <div className="editor-wrapper">
      <div className="toolbar">
        <select
          onChange={(e) =>
            toggleHeading(Number(e.target.value))
          }
        >
          <option value="">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>

        <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? "active" : ""}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? "active" : ""}>I</button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive("underline") ? "active" : ""}>U</button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive("strike") ? "active" : ""}>S</button>
        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive("codeBlock") ? "active" : ""}>{"</>"}</button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive("bulletList") ? "active" : ""}>• List</button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive("orderedList") ? "active" : ""}>1. List</button>

        <button onClick={() => fileInputRef.current.click()}>📤 Upload Img</button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={insertImageFromFile}
          style={{ display: "none" }}
        />

        <button onClick={insertURL}>🌐 Share URL</button>
      </div>

      <EditorContent editor={editor} className="editor-area" />
    </div>
  );
};

export default MarkupEditor;
