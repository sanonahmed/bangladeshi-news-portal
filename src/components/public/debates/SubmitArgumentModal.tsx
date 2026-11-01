"use client";

import { useState } from "react";
import { X, Send, AlertCircle, CheckCircle2, MessageSquare } from "lucide-react";
import { submitDebateArgument } from "@/actions/debates";
import type { DebateArgument } from "@/db/schema/polls";

interface SubmitArgumentModalProps {
  pollId: string;
  initialSide: "for" | "against";
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newArg: DebateArgument) => void;
}

export function SubmitArgumentModal({
  pollId,
  initialSide,
  isOpen,
  onClose,
  onSuccess,
}: SubmitArgumentModalProps) {
  const [side, setSide] = useState<"for" | "against">(initialSide);
  const [authorName, setAuthorName] = useState("");
  const [authorLocation, setAuthorLocation] = useState("");
  const [argument, setArgument] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!authorName.trim() || authorName.trim().length < 2) {
      setErrorMsg("অনুগ্রহ করে আপনার সঠিক নাম লিখুন (কমপক্ষে ২ অক্ষর)");
      return;
    }

    if (!argument.trim() || argument.trim().length < 15) {
      setErrorMsg("আপনার যুক্তি আরও বিস্তারিতভাবে লিখুন (কমপক্ষে ১৫ অক্ষর)");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await submitDebateArgument({
        pollId,
        side,
        authorName: authorName.trim(),
        authorLocation: authorLocation.trim() || undefined,
        argument: argument.trim(),
      });

      if (res.success && res.argument) {
        onSuccess(res.argument);
        onClose();
      } else {
        setErrorMsg(res.error || "যুক্তি প্রকাশ সম্ভব হয়নি");
      }
    } catch {
      setErrorMsg("সার্ভারে সমস্যা হয়েছে, একটু পর পুনরায় চেষ্টা করুন");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-6 max-w-lg w-full shadow-2xl relative my-8 animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-4 border-b border-[var(--color-border)] pb-3">
          <MessageSquare className="w-5 h-5 text-[var(--color-primary)]" />
          <h3 className="bengali-headline text-lg sm:text-xl font-bold text-[var(--color-text)]">
            বিতর্কে আপনার যুক্তি ও মতামত প্রকাশ করুন
          </h3>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Side Selector */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
              আপনি কোন পক্ষে অবস্থান নিচ্ছেন? *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSide("for")}
                className={`py-2.5 px-3 border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  side === "for"
                    ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 shadow-xs"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]"
                }`}
              >
                <span>🟢 আমি পক্ষে বলছি</span>
              </button>
              <button
                type="button"
                onClick={() => setSide("against")}
                className={`py-2.5 px-3 border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  side === "against"
                    ? "border-red-600 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 shadow-xs"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]"
                }`}
              >
                <span>🔴 আমি বিপক্ষে বলছি</span>
              </button>
            </div>
          </div>

          {/* Name & Location Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] mb-1">
                আপনার নাম *
              </label>
              <input
                type="text"
                placeholder="যেমন: সাকিব চৌধুরী"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] mb-1">
                শহর / জেলা / প্রতিষ্ঠান
              </label>
              <input
                type="text"
                placeholder="যেমন: ঢাকা বিশ্ববিদ্যালয় / সিলেট"
                value={authorLocation}
                onChange={(e) => setAuthorLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>
          </div>

          {/* Argument Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[var(--color-text)]">
                আপনার মূল যুক্তি ও বিশ্লেষণ *
              </label>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                {argument.length} / ১৫০০ অক্ষর
              </span>
            </div>
            <textarea
              rows={5}
              placeholder="যৌক্তিক ও মার্জিত ভাষায় আপনার বক্তব্য তুলে ধরুন। কোনো অবান্তর বা আক্রমণাত্মক মন্তব্য গ্রহণযোগ্য নয়..."
              value={argument}
              onChange={(e) => setArgument(e.target.value)}
              required
              maxLength={1500}
              className="w-full p-3 text-xs leading-relaxed border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none resize-none"
            />
          </div>

          {/* Disclaimer & Submit */}
          <div className="text-[11px] text-[var(--color-text-muted)] leading-tight">
            * প্রকাশের পূর্বে আপনার যুক্তিটি আমাদের সামাজিক বিতর্ক নীতিমালার আওতায় পর্যালোচিত হতে পারে।
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text)]"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 text-xs font-bold text-white transition-colors flex items-center gap-1.5 ${
                side === "for" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
              } disabled:opacity-50`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "জমা হচ্ছে..." : "যুক্তি প্রকাশ করুন"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
