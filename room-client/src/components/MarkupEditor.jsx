import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import "../styles/editor.css";
import { Extension } from "@tiptap/core";

export const CleanEmptyParagraph = Extension.create({
  name: "cleanEmptyParagraph",

  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { editor } = this;
        const { state, commands } = editor;

        // If current paragraph is empty, don't add new line
        const isEmpty = state.selection.$from.parent.textContent.trim() === "";
        if (isEmpty) {
          return true; // Prevent default
        }

        return false; // Allow default
      },
    };
  },
});

const MarkupEditor = () => {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: "<p>Hello Krish! Start typing here...</p>",
  });

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run();
  const toggleStrike = () => editor.chain().focus().toggleStrike().run();
  const toggleCodeBlock = () => editor.chain().focus().toggleCodeBlock().run();
  const toggleBlockquote = () => editor.chain().focus().toggleBlockquote().run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
  const toggleHeading = (level) => editor.chain().focus().toggleHeading({ level }).run();

  const isActive = (command) => editor.isActive(command);

  return (
    <div className="editor-wrapper">
      <div className="toolbar">
        <button onClick={toggleBold} className={isActive("bold") ? "active" : ""}>B</button>
        <button onClick={toggleItalic} className={isActive("italic") ? "active" : ""}>I</button>
        <button onClick={toggleUnderline} className={isActive("underline") ? "active" : ""}>U</button>
        <button onClick={toggleStrike} className={isActive("strike") ? "active" : ""}>S</button>
        <button onClick={toggleCodeBlock} className={isActive("codeBlock") ? "active" : ""}>{"</>"}</button>
        <button onClick={toggleBlockquote} className={isActive("blockquote") ? "active" : ""}>❝</button>
        <button onClick={toggleBulletList} className={isActive("bulletList") ? "active" : ""}>• List</button>
        <button onClick={() => toggleHeading(2)} className={isActive("heading", { level: 2 }) ? "active" : ""}>H2</button>
        <button onClick={() => toggleHeading(3)} className={isActive("heading", { level: 3 }) ? "active" : ""}>H3</button>
      </div>

      <EditorContent editor={editor} className="editor-area" />
    </div>
  );
};

export default MarkupEditor;
