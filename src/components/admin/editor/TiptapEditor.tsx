"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Youtube from "@tiptap/extension-youtube";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Video,
} from "lucide-react";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = "এখানে বিস্তারিত সংবাদ লিখুন...",
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[var(--color-primary)] underline",
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Youtube.configure({
        inline: false,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "article-body min-h-[300px] p-4 focus:outline-none focus:ring-0 text-base leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("লিঙ্কের URL লিখুন:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("ছবির সরাসরি URL লিখুন:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addYoutube = () => {
    const url = window.prompt("ইউটিউব ভিডিওর লিঙ্ক লিখুন:");
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  };

  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-bg)]">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs">
        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-[var(--color-border)] ${
            editor.isActive("heading", { level: 2 }) ? "bg-[var(--color-primary)] text-white" : ""
          }`}
          title="শিরোনাম ২"
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded hover:bg-[var(--color-border)] ${
            editor.isActive("heading", { level: 3 }) ? "bg-[var(--color-primary)] text-white" : ""
          }`}
          title="শিরোনাম ৩"
        >
          <Heading3 size={16} />
        </button>

        <span className="w-[1px] h-4 bg-[var(--color-border)] mx-1" />

        {/* Text Formats */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-[var(--color-border)] ${
            editor.isActive("bold") ? "bg-[var(--color-primary)] text-white" : ""
          }`}
          title="বোল্ড"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-[var(--color-border)] ${
            editor.isActive("italic") ? "bg-[var(--color-primary)] text-white" : ""
          }`}
          title="ইটালিক"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded hover:bg-[var(--color-border)] ${
            editor.isActive("underline") ? "bg-[var(--color-primary)] text-white" : ""
          }`}
          title="আন্ডারলাইন"
        >
          <UnderlineIcon size={16} />
        </button>

        <span className="w-[1px] h-4 bg-[var(--color-border)] mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-1.5 rounded hover:bg-[var(--color-border)] ${
            editor.isActive({ textAlign: "left" }) ? "bg-[var(--color-primary)] text-white" : ""
          }`}
          title="বামে সাজান"
        >
          <AlignLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-1.5 rounded hover:bg-[var(--color-border)] ${
            editor.isActive({ textAlign: "center" }) ? "bg-[var(--color-primary)] text-white" : ""
          }`}
          title="মাঝে সাজান"
        >
          <AlignCenter size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-1.5 rounded hover:bg-[var(--color-border)] ${
            editor.isActive({ textAlign: "right" }) ? "bg-[var(--color-primary)] text-white" : ""
          }`}
          title="ডানে সাজান"
        >
          <AlignRight size={16} />
        </button>

        <span className="w-[1px] h-4 bg-[var(--color-border)] mx-1" />

        {/* Lists & Quote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-[var(--color-border)] ${
            editor.isActive("bulletList") ? "bg-[var(--color-primary)] text-white" : ""
          }`}
          title="বুলেট তালিকা"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-[var(--color-border)] ${
            editor.isActive("orderedList") ? "bg-[var(--color-primary)] text-white" : ""
          }`}
          title="সংখ্যাতালিকা"
        >
          <ListOrdered size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-[var(--color-border)] ${
            editor.isActive("blockquote") ? "bg-[var(--color-primary)] text-white" : ""
          }`}
          title="উদ্ধৃতি (Blockquote)"
        >
          <Quote size={16} />
        </button>

        <span className="w-[1px] h-4 bg-[var(--color-border)] mx-1" />

        {/* Media */}
        <button
          type="button"
          onClick={setLink}
          className={`p-1.5 rounded hover:bg-[var(--color-border)] ${
            editor.isActive("link") ? "bg-[var(--color-primary)] text-white" : ""
          }`}
          title="লিঙ্ক যোগ করুন"
        >
          <LinkIcon size={16} />
        </button>
        <button
          type="button"
          onClick={addImage}
          className="p-1.5 rounded hover:bg-[var(--color-border)]"
          title="ছবি যোগ করুন"
        >
          <ImageIcon size={16} />
        </button>
        <button
          type="button"
          onClick={addYoutube}
          className="p-1.5 rounded hover:bg-[var(--color-border)]"
          title="ভিডিও এম্বেড"
        >
          <Video size={16} />
        </button>

        <span className="w-[1px] h-4 bg-[var(--color-border)] mx-1" />

        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-[var(--color-border)] disabled:opacity-40"
          title="পূর্বাবস্থায় ফেরান"
        >
          <Undo size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-[var(--color-border)] disabled:opacity-40"
          title="পুনরায় করুন"
        >
          <Redo size={16} />
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
