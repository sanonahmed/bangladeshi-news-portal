"use client";

import { useState } from "react";
import { X, Send, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";
import { submitFactCheckClaim } from "@/actions/fact-checks";

interface SubmitClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubmitClaimModal({ isOpen, onClose }: SubmitClaimModalProps) {
  const [claim, setClaim] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claim.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await submitFactCheckClaim({
        titleOrClaim: claim.trim(),
        sourceUrl: sourceUrl.trim() || undefined,
        description: description.trim() || undefined,
        submitterName: name.trim() || undefined,
        submitterEmail: email.trim() || undefined,
      });

      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        setClaim("");
        setSourceUrl("");
        setDescription("");
        setName("");
        setEmail("");
        setTimeout(() => {
          onClose();
          setFeedback(null);
        }, 2500);
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: "জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
              <ShieldAlert size={18} />
            </span>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text)]">
                গুজব রিপোর্ট বা দাবি যাচাইয়ের আবেদন
              </h3>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                সামাজিক মাধ্যমে দেখা যেকোনো সন্দেহজনক তথ্য আমাদের অনুসন্ধান ডেস্কে জানান
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-[var(--color-text)] mb-1">
              সন্দেহজনক দাবি বা সংবাদের শিরোনাম <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="সোশ্যাল মিডিয়ায় কী দাবি করা হচ্ছে সংক্ষেপে লিখুন..."
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--color-text)] mb-1">
              উৎস বা পোস্টের লিংক (Facebook / TikTok / YouTube ইত্যাদি)
            </label>
            <input
              type="url"
              placeholder="https://facebook.com/..."
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--color-text)] mb-1">
              অতিরিক্ত প্রেক্ষাপট বা বিস্তারিত (যদি থাকে)
            </label>
            <textarea
              rows={3}
              placeholder="কোথায় দেখেছেন বা কেন এটিকে গুজব বলে মনে হচ্ছে..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[var(--color-text)] mb-1">
                আপনার নাম (ঐচ্ছিক)
              </label>
              <input
                type="text"
                placeholder="নাম"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[var(--color-text)] mb-1">
                ইমেইল ঠিকানা (ঐচ্ছিক)
              </label>
              <input
                type="email"
                placeholder="ইমেইল"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 text-xs font-semibold ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-xs font-bold text-white shadow hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send size={13} />
              <span>{isSubmitting ? "জমা হচ্ছে..." : "আবেদন পাঠান"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
