"use client";

import { useState } from "react";
import {
  ThumbsUp,
  MapPin,
  Pin,
  Sparkles,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { DebateArgument } from "@/db/schema/polls";
import { upvoteDebateArgument } from "@/actions/debates";
import { toBengaliDigits, formatBengaliDateTime } from "@/lib/bengali-date";

interface DebateArenaViewProps {
  pollId: string;
  forArguments: DebateArgument[];
  againstArguments: DebateArgument[];
  onOpenSubmitModal: (side: "for" | "against") => void;
  isActive: boolean;
}

export function DebateArenaView({
  pollId,
  forArguments,
  againstArguments,
  onOpenSubmitModal,
  isActive,
}: DebateArenaViewProps) {
  const [mobileTab, setMobileTab] = useState<"for" | "against">("for");
  const [upvotedMap, setUpvotedMap] = useState<Record<string, number>>({});
  const [upvotingId, setUpvotingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleUpvote = async (id: string, currentCount: number) => {
    if (upvotingId) return;
    setUpvotingId(id);

    try {
      const res = await upvoteDebateArgument(id);
      if (res.success && typeof res.newUpvotes === "number") {
        setUpvotedMap((prev) => ({ ...prev, [id]: res.newUpvotes! }));
        setToastMsg("যুক্তির সাথে আপনার সহমত রেকর্ড করা হয়েছে");
      } else {
        setToastMsg(res.error || "সহমত প্রকাশ সম্ভব হয়নি");
      }
    } catch {
      setToastMsg("ত্রুটি হয়েছে, পরে চেষ্টা করুন");
    } finally {
      setUpvotingId(null);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  const renderArgumentCard = (arg: DebateArgument, side: "for" | "against") => {
    const currentUpvotes: number = upvotedMap[arg.id] ?? arg.upvotes ?? 0;
    const isFor = side === "for";

    return (
      <div
        key={arg.id}
        className={`bg-[var(--color-bg)] border p-4.5 rounded-none shadow-xs transition-all relative ${
          arg.isPinned
            ? isFor
              ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20"
              : "border-red-500 bg-red-50/30 dark:bg-red-950/20"
            : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
        }`}
      >
        {/* Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {arg.isPinned && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-amber-500 text-white uppercase tracking-wider">
                <Pin className="w-2.5 h-2.5" />
                শীর্ষ যুক্তি
              </span>
            )}
            {arg.isEditorChoice && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-[var(--color-primary)] text-white uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5" />
                সম্পাদকীয় পছন্দ
              </span>
            )}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider ${
                isFor
                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                  : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400"
              }`}
            >
              {isFor ? "● পক্ষে" : "● বিপক্ষে"}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
            <Clock className="w-3 h-3" />
            <span>{formatBengaliDateTime(new Date(arg.createdAt))}</span>
          </div>
        </div>

        {/* Argument Text */}
        <p className="text-sm leading-relaxed text-[var(--color-text)] mb-4 font-normal whitespace-pre-line">
          {arg.argument}
        </p>

        {/* Author Details & Upvote */}
        <div className="border-t border-[var(--color-border)] pt-3 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-bold text-[var(--color-text)] truncate">{arg.authorName}</span>
            {arg.authorLocation && (
              <span className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-0.5 shrink-0">
                <MapPin className="w-3 h-3 text-[var(--color-primary)]" />
                {arg.authorLocation}
              </span>
            )}
          </div>

          <button
            onClick={() => handleUpvote(arg.id, currentUpvotes)}
            disabled={upvotingId === arg.id}
            title="এই যুক্তির সাথে একমত হলে ক্লিক করুন"
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold border transition-all ${
              upvotedMap[arg.id] !== undefined
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-[var(--color-bg-secondary)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${upvotedMap[arg.id] !== undefined ? "fill-white" : ""}`} />
            <span>সহমত</span>
            <span className="font-mono font-bold text-[11px]">
              ({toBengaliDigits(currentUpvotes)})
            </span>
          </button>
        </div>
      </div>
    );
  };

  const totalFor = forArguments.length;
  const totalAgainst = againstArguments.length;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white text-xs px-4 py-2.5 rounded shadow-2xl border border-zinc-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Arena Header & Stats */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-1">
              <MessageSquare className="w-4 h-4" />
              <span>লাইভ ডিসকাশন ও যুক্তি-পাল্টা যুক্তি এরিনা</span>
            </div>
            <h3 className="bengali-headline text-xl sm:text-2xl font-bold text-[var(--color-text)]">
              পাঠকদের মুক্ত বিতর্ক ও মতামত
            </h3>
          </div>

          {isActive && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenSubmitModal("for")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
              >
                <span>+ পক্ষে যুক্তি দিন</span>
              </button>
              <button
                onClick={() => onOpenSubmitModal("against")}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
              >
                <span>+ বিপক্ষে যুক্তি দিন</span>
              </button>
            </div>
          )}
        </div>

        {/* Ratio Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              পক্ষে মোট যুক্তি: {toBengaliDigits(totalFor)}
            </span>
            <span className="text-red-700 dark:text-red-400 flex items-center gap-1">
              বিপক্ষে মোট যুক্তি: {toBengaliDigits(totalAgainst)}
            </span>
          </div>
          <div className="h-2.5 w-full bg-zinc-200 dark:bg-zinc-800 flex overflow-hidden">
            <div
              className="bg-emerald-600 transition-all duration-500"
              style={{
                width: `${totalFor + totalAgainst > 0 ? (totalFor / (totalFor + totalAgainst)) * 100 : 50}%`,
              }}
            />
            <div
              className="bg-red-600 transition-all duration-500"
              style={{
                width: `${totalFor + totalAgainst > 0 ? (totalAgainst / (totalFor + totalAgainst)) * 100 : 50}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* MOBILE TABS SWITCHER */}
      <div className="md:hidden flex border-b border-[var(--color-border)]">
        <button
          onClick={() => setMobileTab("for")}
          className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition-colors ${
            mobileTab === "for"
              ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20"
              : "border-transparent text-[var(--color-text-muted)]"
          }`}
        >
          পক্ষে যুক্তি ({toBengaliDigits(totalFor)})
        </button>
        <button
          onClick={() => setMobileTab("against")}
          className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition-colors ${
            mobileTab === "against"
              ? "border-red-600 text-red-700 dark:text-red-400 bg-red-50/40 dark:bg-red-950/20"
              : "border-transparent text-[var(--color-text-muted)]"
          }`}
        >
          বিপক্ষে যুক্তি ({toBengaliDigits(totalAgainst)})
        </button>
      </div>

      {/* DESKTOP SPLIT VIEW & MOBILE TAB VIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* COLUMN 1: FOR ARGUMENTS (পক্ষে) */}
        <div
          className={`space-y-4 ${
            mobileTab === "against" ? "hidden md:block" : "block"
          }`}
        >
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-600 p-3 flex items-center justify-between">
            <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <span>🟢 পক্ষে যুক্তি ও মতবাদ</span>
              <span className="text-xs font-normal">({toBengaliDigits(totalFor)})</span>
            </h4>
            {isActive && (
              <button
                onClick={() => onOpenSubmitModal("for")}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
              >
                + যুক্তি দিন
              </button>
            )}
          </div>

          {forArguments.length === 0 ? (
            <div className="border border-dashed border-[var(--color-border)] p-8 text-center text-xs text-[var(--color-text-muted)]">
              এখনও কোনো পক্ষে যুক্তি জমা পড়েনি। প্রথম যুক্তিটি আপনিই দিন!
            </div>
          ) : (
            <div className="space-y-4">
              {forArguments.map((arg) => renderArgumentCard(arg, "for"))}
            </div>
          )}
        </div>

        {/* COLUMN 2: AGAINST ARGUMENTS (বিপক্ষে) */}
        <div
          className={`space-y-4 ${
            mobileTab === "for" ? "hidden md:block" : "block"
          }`}
        >
          <div className="bg-red-50 dark:bg-red-950/40 border-l-4 border-red-600 p-3 flex items-center justify-between">
            <h4 className="font-bold text-sm text-red-800 dark:text-red-300 flex items-center gap-1.5">
              <span>🔴 বিপক্ষে যুক্তি ও মতবাদ</span>
              <span className="text-xs font-normal">({toBengaliDigits(totalAgainst)})</span>
            </h4>
            {isActive && (
              <button
                onClick={() => onOpenSubmitModal("against")}
                className="text-xs font-bold text-red-700 dark:text-red-300 hover:underline"
              >
                + যুক্তি দিন
              </button>
            )}
          </div>

          {againstArguments.length === 0 ? (
            <div className="border border-dashed border-[var(--color-border)] p-8 text-center text-xs text-[var(--color-text-muted)]">
              এখনও কোনো বিপক্ষে যুক্তি জমা পড়েনি। প্রথম যুক্তিটি আপনিই দিন!
            </div>
          ) : (
            <div className="space-y-4">
              {againstArguments.map((arg) => renderArgumentCard(arg, "against"))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
