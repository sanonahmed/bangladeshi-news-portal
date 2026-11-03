"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Youtube from "@tiptap/extension-youtube";
import { Node } from "@tiptap/core";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
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
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { detectVideoPlatform, getFacebookEmbedUrl } from "@/lib/video-embed";

// Custom Iframe extension for rich Facebook and multimedia embeds
const IframeExtension = Node.create({
  name: "iframe",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      frameborder: {
        default: 0,
      },
      allowfullscreen: {
        default: "true",
      },
      allow: {
        default:
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
      },
      class: {
        default: "w-full aspect-video rounded my-4 border-0",
      },
      style: {
        default: "border:none;overflow:hidden",
      },
      scrolling: {
        default: "no",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "iframe",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["iframe", HTMLAttributes];
  },
});

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function TiptapEditor({
  content,
  onChange,
  placeholder,
}: TiptapEditorProps) {
  const { isEn } = useAdminLanguage();
  const defaultPlaceholder = isEn ? "Write detailed article content here..." : "এখানে বিস্তারিত সংবাদ লিখুন...";

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
        placeholder: placeholder || defaultPlaceholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Youtube.configure({
        inline: false,
      }),
      IframeExtension,
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
    const url = window.prompt(isEn ? "Enter link URL:" : "লিঙ্কের URL লিখুন:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt(isEn ? "Enter image URL:" : "ছবির সরাসরি URL লিখুন:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // Embed video (YouTube or Facebook)
  const embedVideo = () => {
    const url = window.prompt(
      isEn
        ? "Enter YouTube or Facebook video URL:\n(e.g., https://youtube.com/watch?v=... or https://facebook.com/.../videos/... or https://fb.watch/...)"
        : "ইউটিউব বা ফেসবুক ভিডিওর লিংক দিন:\n(যেমন: https://youtube.com/... বা https://facebook.com/... বা https://fb.watch/...)"
    );
    if (!url || !url.trim()) return;

    const trimmed = url.trim();
    const platform = detectVideoPlatform(trimmed);

    if (platform === "youtube") {
      editor.commands.setYoutubeVideo({ src: trimmed });
    } else if (platform === "facebook") {
      const embedSrc = getFacebookEmbedUrl(trimmed, false);
      (editor.chain().focus() as any)
        .insertContent({
          type: "iframe",
          attrs: {
            src: embedSrc,
            class: "w-full aspect-video rounded my-4 border-0",
            allowfullscreen: "true",
            style: "border:none;overflow:hidden",
            scrolling: "no",
            allow: "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share",
          },
        })
        .run();
    } else {
      window.alert(
        isEn
          ? "Please provide a valid YouTube or Facebook video URL."
          : "অনুগ্রহ করে একটি বৈধ ইউটিউব বা ফেসবুক ভিডিওর লিংক দিন।"
      );
    }
  };

  // Quick Direct Facebook Video Embed
  const embedFacebookVideo = () => {
    const url = window.prompt(
      isEn
        ? "Enter Facebook video URL (e.g. https://facebook.com/.../videos/... or https://fb.watch/...):"
        : "ফেসবুক ভিডিওর লিংক লিখুন (যেমন: https://facebook.com/.../videos/... বা https://fb.watch/...):"
    );
    if (!url || !url.trim()) return;

    const embedSrc = getFacebookEmbedUrl(url.trim(), false);
    (editor.chain().focus() as any)
      .insertContent({
        type: "iframe",
        attrs: {
          src: embedSrc,
          class: "w-full aspect-video rounded my-4 border-0",
          allowfullscreen: "true",
          style: "border:none;overflow:hidden",
          scrolling: "no",
          allow: "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share",
        },
      })
      .run();
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
          title={isEn ? "Heading 2" : "শিরোনাম ২"}
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded hover:bg-[var(--color-border)] ${
            editor.isActive("heading", { level: 3 }) ? "bg-[var(--color-primary)] text-white" : ""
          }`}
          title={isEn ? "Heading 3" : "শিরোনাম ৩"}
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
          title={isEn ? "Bold" : "বোল্ড"}
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-[var(--color-border)] ${
            editor.isActive("italic") ? "bg-[var(--color-primary)] text-white" : ""
          }`}
          title={isEn ? "Italic" : "ইটালিক"}
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded hover:bg-[var(--color-border)] ${
            editor.isActive("underline") ? "bg-[var(--color-primary)] text-white" : ""
          }`}
          title={isEn ? "Underline" : "আন্ডারলাইন"}
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
          title={isEn ? "Align Left" : "বামে সাজান"}
        >
          <AlignLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-1.5 rounded hover:bg-[var(--color-border)] ${
            editor.isActive({ textAlign: "center" }) ? "bg-[var(--color-primary)] text-white" : ""
          }`}
          title={isEn ? "Align Center" : "মাঝে সাজান"}
        >
          <AlignCenter size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-1.5 rounded hover:bg-[var(--color-border)] ${
            editor.isActive({ textAlign: "right" }) ? "bg-[var(--color-primary)] text-white" : ""
          }`}
          title={isEn ? "Align Right" : "ডানে সাজান"}
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
          title={isEn ? "Bullet List" : "বুলেট তালিকা"}
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-[var(--color-border)] ${
            editor.isActive("orderedList") ? "bg-[var(--color-primary)] text-white" : ""
          }`}
          title={isEn ? "Numbered List" : "সংখ্যাতালিকা"}
        >
          <ListOrdered size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-[var(--color-border)] ${
            editor.isActive("blockquote") ? "bg-[var(--color-primary)] text-white" : ""
          }`}
          title={isEn ? "Blockquote" : "উদ্ধৃতি (Blockquote)"}
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
          title={isEn ? "Add Link" : "লিঙ্ক যোগ করুন"}
        >
          <LinkIcon size={16} />
        </button>
        <button
          type="button"
          onClick={addImage}
          className="p-1.5 rounded hover:bg-[var(--color-border)]"
          title={isEn ? "Insert Image" : "ছবি যোগ করুন"}
        >
          <ImageIcon size={16} />
        </button>

        {/* Unified Video Embed Button (YouTube & Facebook) */}
        <button
          type="button"
          onClick={embedVideo}
          className="p-1.5 rounded hover:bg-[var(--color-border)] text-[var(--color-text)] hover:text-[var(--color-primary)] flex items-center gap-1"
          title={isEn ? "Embed Video (YouTube & Facebook)" : "ভিডিও এম্বেড (ইউটিউব ও ফেসবুক)"}
        >
          <Video size={16} />
        </button>

        {/* Direct Facebook Video Embed Button */}
        <button
          type="button"
          onClick={embedFacebookVideo}
          className="p-1.5 rounded hover:bg-[var(--color-border)] text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-0.5"
          title={isEn ? "Embed Facebook Video" : "ফেসবুক ভিডিও এম্বেড"}
        >
          <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black leading-none">
            f
          </span>
        </button>

        <span className="w-[1px] h-4 bg-[var(--color-border)] mx-1" />

        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-[var(--color-border)] disabled:opacity-40"
          title={isEn ? "Undo" : "পূর্বাবস্থায় ফেরান"}
        >
          <Undo size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-[var(--color-border)] disabled:opacity-40"
          title={isEn ? "Redo" : "পুনরায় করুন"}
        >
          <Redo size={16} />
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
