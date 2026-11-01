"use client";

import { useState } from "react";
import Image from "next/image";
import {
  X,
  Printer,
  Share2,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { FacebookIcon, TwitterXIcon, WhatsAppIcon } from "@/components/ui/icons";
import type { EpaperStory } from "@/lib/epaper-data";

interface EpaperClipModalProps {
  story: EpaperStory | null;
  pageNumber: number;
  editionName: string;
  dateFormatted: string;
  onClose: () => void;
}

export function EpaperClipModal({
  story,
  pageNumber,
  editionName,
  dateFormatted,
  onClose,
}: EpaperClipModalProps) {
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [copied, setCopied] = useState(false);

  if (!story) return null;

  const fontClasses = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${story.headline}\n\n${story.fullText}\n\n- দৈনিক বাংলাদেশ বার্তা (${editionName})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#fffef9] dark:bg-zinc-900 border-2 border-[#b8860b] dark:border-zinc-700 max-w-2xl w-full shadow-2xl relative my-8 animate-in zoom-in-95 duration-150 text-zinc-900 dark:text-zinc-100 flex flex-col max-h-[90vh]">
        {/* Top Newspaper Cut-out Header */}
        <div className="bg-[#f4efe4] dark:bg-zinc-800 border-b border-[#dcd4c0] dark:border-zinc-700 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
            <span className="font-bold text-xs uppercase tracking-wider text-[var(--color-primary)]">
              দৈনিক বাংলাদেশ বার্তা • সংবাদ ক্লিপিং
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Font Size Adjusters */}
            <div className="hidden sm:flex items-center gap-1 border border-[#ccc4b0] dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded text-xs">
              <button
                onClick={() => setFontSize("sm")}
                className={`px-1.5 py-0.5 font-bold ${fontSize === "sm" ? "text-[var(--color-primary)]" : "text-zinc-500"}`}
                title="ছোট ফন্ট"
              >
                A-
              </button>
              <span className="text-zinc-300">|</span>
              <button
                onClick={() => setFontSize("base")}
                className={`px-1.5 py-0.5 font-bold ${fontSize === "base" ? "text-[var(--color-primary)]" : "text-zinc-500"}`}
                title="স্বাভাবিক ফন্ট"
              >
                A
              </button>
              <span className="text-zinc-300">|</span>
              <button
                onClick={() => setFontSize("lg")}
                className={`px-1.5 py-0.5 font-bold ${fontSize === "lg" ? "text-[var(--color-primary)]" : "text-zinc-500"}`}
                title="বড় ফন্ট"
              >
                A+
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="p-1.5 border border-[#ccc4b0] dark:border-zinc-600 hover:bg-white dark:hover:bg-zinc-900 transition-colors"
              title="এই ক্লিপিংটি প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 border border-[#ccc4b0] dark:border-zinc-600 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Story Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
          {/* Metadata pill */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400 border-b border-[#e8e1cd] dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="bg-[#b8860b] text-white font-bold px-2 py-0.5 text-[10px] uppercase">
                {story.category}
              </span>
              <span>{editionName} • পাতা {pageNumber}</span>
            </div>
            <span>{dateFormatted}</span>
          </div>

          {/* Kicker */}
          {story.kicker && (
            <div className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wide">
              {story.kicker}
            </div>
          )}

          {/* Headline */}
          <h2 className="bengali-serif-headline text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight">
            {story.headline}
          </h2>

          {/* Byline */}
          {story.byline && (
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 italic">
              ✍️ {story.byline}
            </div>
          )}

          {/* Featured Image */}
          {story.imageUrl && (
            <div className="my-4 border border-[#e0d6be] dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1.5">
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src={story.imageUrl}
                  alt={story.headline}
                  fill
                  className="object-cover"
                />
              </div>
              {story.imageCaption && (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic mt-1.5 px-1">
                  ছবি: {story.imageCaption}
                </p>
              )}
            </div>
          )}

          {/* Full Article Text */}
          <div
            className={`font-serif leading-relaxed text-zinc-800 dark:text-zinc-200 space-y-3 whitespace-pre-line ${fontClasses[fontSize]}`}
          >
            {story.fullText}
          </div>
        </div>

        {/* Bottom Action & Share Bar */}
        <div className="bg-[#f8f5ec] dark:bg-zinc-800/80 border-t border-[#dcd4c0] dark:border-zinc-700 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              শেয়ার করুন:
            </span>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 border border-[#ccc4b0] dark:border-zinc-600 hover:text-[#1877F2] transition-colors"
              title="ফেসবুকে শেয়ার করুন"
            >
              <FacebookIcon size={13} />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(story.headline)}&url=${encodeURIComponent(currentUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 border border-[#ccc4b0] dark:border-zinc-600 hover:text-black dark:hover:text-white transition-colors"
              title="এক্স (টুইটার)-এ শেয়ার করুন"
            >
              <TwitterXIcon size={13} />
            </a>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(story.headline + " - " + currentUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 border border-[#ccc4b0] dark:border-zinc-600 hover:text-[#25D366] transition-colors"
              title="হোয়াটসঅ্যাপে শেয়ার করুন"
            >
              <WhatsAppIcon size={13} />
            </a>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold border border-[#ccc4b0] dark:border-zinc-600 hover:bg-white dark:hover:bg-zinc-900 transition-colors"
              title="খবরটি কপি করুন"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "কপি হয়েছে!" : "কপি"}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[var(--color-primary)] text-white text-xs font-bold hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            ই-পেপারে ফিরুন
          </button>
        </div>
      </div>
    </div>
  );
}
