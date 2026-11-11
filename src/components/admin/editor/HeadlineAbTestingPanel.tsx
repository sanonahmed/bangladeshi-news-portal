"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Zap,
  Trophy,
  Clock,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Users,
  MousePointerClick,
  Percent,
} from "lucide-react";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

interface HeadlineAbTestingPanelProps {
  headlineA: string;
  headlineB: string;
  onHeadlineBChange: (val: string) => void;
  isEnabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  durationMinutes: number;
  onDurationChange: (minutes: number) => void;
  // Live stats from database (for edit view)
  status?: "none" | "active" | "completed_a" | "completed_b";
  startedAt?: Date | string | null;
  impressionsA?: number;
  impressionsB?: number;
  clicksA?: number;
  clicksB?: number;
  onDeclareWinner?: (winner: "a" | "b") => Promise<void>;
  onResetTest?: () => Promise<void>;
  isReadOnly?: boolean;
}

export function HeadlineAbTestingPanel({
  headlineA,
  headlineB,
  onHeadlineBChange,
  isEnabled,
  onToggleEnabled,
  durationMinutes = 30,
  onDurationChange,
  status = "none",
  startedAt,
  impressionsA = 0,
  impressionsB = 0,
  clicksA = 0,
  clicksB = 0,
  onDeclareWinner,
  onResetTest,
  isReadOnly = false,
}: HeadlineAbTestingPanelProps) {
  const { language, formatNumber } = useAdminLanguage();
  const isEn = language === "en";

  const [declaring, setDeclaring] = useState<"a" | "b" | null>(null);
  const [resetting, setResetting] = useState(false);
  const [remainingTime, setRemainingTime] = useState<string>("");

  // Calculate CTRs
  const safeImpA = Math.max(impressionsA, clicksA, 0);
  const safeImpB = Math.max(impressionsB, clicksB, 0);
  const ctrA = safeImpA > 0 ? ((clicksA / safeImpA) * 100).toFixed(1) : "0.0";
  const ctrB = safeImpB > 0 ? ((clicksB / safeImpB) * 100).toFixed(1) : "0.0";

  const numCtrA = parseFloat(ctrA);
  const numCtrB = parseFloat(ctrB);

  // Time calculation & Countdown timer for active tests
  useEffect(() => {
    if (status !== "active" || !startedAt) {
      setRemainingTime("");
      return;
    }

    const updateTimer = () => {
      const startMs = new Date(startedAt).getTime();
      const endMs = startMs + durationMinutes * 60 * 1000;
      const diffMs = endMs - Date.now();

      if (diffMs <= 0) {
        setRemainingTime(isEn ? "Time elapsed (Awaiting evaluation)" : "সময় সমাপ্ত (মূল্যায়ন সম্পন্ন হবে)");
      } else {
        const mins = Math.floor(diffMs / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);
        setRemainingTime(
          isEn
            ? `${mins}m ${secs}s left`
            : `${formatNumber(mins)} মিনিট ${formatNumber(secs)} সেকেন্ড বাকি`
        );
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [status, startedAt, durationMinutes, isEn, formatNumber]);

  // Which variant is leading or won
  const isBLeading = numCtrB > numCtrA && safeImpB >= 5;
  const isALeading = numCtrA > numCtrB && safeImpA >= 5;

  async function handlePickWinner(winner: "a" | "b") {
    if (!onDeclareWinner) return;
    setDeclaring(winner);
    try {
      await onDeclareWinner(winner);
    } finally {
      setDeclaring(null);
    }
  }

  async function handleReset() {
    if (!onResetTest) return;
    if (
      !confirm(
        isEn
          ? "Are you sure you want to reset this A/B test? All impression and click counts will be cleared."
          : "আপনি কি নিশ্চিতভাবে এই এ/বি টেস্ট রিসেট করতে চান? সকল ক্লিক ও ইমপ্রেশন ডাটা মুছে যাবে।"
      )
    ) {
      return;
    }
    setResetting(true);
    try {
      await onResetTest();
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded-lg overflow-hidden shadow-2xs space-y-0">
      {/* Top Header */}
      <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
            <Zap size={16} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
              <span>{isEn ? "Headline A/B Testing Engine" : "শিরোনাম এ/বি টেস্টিং ইঞ্জিন"}</span>
              {status === "active" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  {isEn ? "Live Active" : "লাইভ চলমান"}
                </span>
              )}
              {status === "completed_b" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                  <Trophy size={11} />
                  {isEn ? "Variant B Won" : "বিকল্প B বিজয়ী"}
                </span>
              )}
              {status === "completed_a" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                  <Trophy size={11} />
                  {isEn ? "Variant A Won" : "মূল শিরোনাম A বিজয়ী"}
                </span>
              )}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {isEn
                ? "Serve 2 headline variants to initial readers. Highest CTR automatically becomes permanent."
                : "দুটি ভিন্ন শিরোনাম পাঠকদের ৫০/৫০ অনুপাতে দেখানো হবে। সর্বাধিক ক্লিক পাওয়া শিরোনাম স্বয়ংক্রিয়ভাবে বিজয়ী হবে।"}
            </p>
          </div>
        </div>

        {/* Enable / Disable Switch */}
        {!isReadOnly && status === "none" && (
          <label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text)] cursor-pointer bg-[var(--color-bg)] px-3 py-1.5 rounded border border-[var(--color-border)] shadow-2xs">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => onToggleEnabled(e.target.checked)}
              className="rounded text-[var(--color-primary)] cursor-pointer"
            />
            <span>{isEn ? "Enable A/B Test" : "এ/বি টেস্ট সক্রিয় করুন"}</span>
          </label>
        )}
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* If Not Enabled and status is none */}
        {!isEnabled && status === "none" && (
          <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)] border border-dashed border-[var(--color-border)] text-center space-y-2">
            <p className="text-xs text-[var(--color-text-muted)]">
              {isEn
                ? "Headline A/B testing is currently disabled for this story. Turn it on to test an alternate emotional or question-based headline."
                : "এই সংবাদের জন্য শিরোনাম এ/বি টেস্টিং বর্তমানে বন্ধ রয়েছে। আকর্ষণীয় বিকল্প কোনো শিরোনাম যাচাই করতে উপরের সুইচে টিক দিন।"}
            </p>
            <button
              type="button"
              onClick={() => onToggleEnabled(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-bold transition-colors cursor-pointer"
            >
              <Zap size={13} />
              <span>{isEn ? "Turn on A/B Testing" : "এ/বি টেস্টিং চালু করুন"}</span>
            </button>
          </div>
        )}

        {/* If Enabled or has Active/Completed status */}
        {(isEnabled || status !== "none") && (
          <div className="space-y-4">
            {/* Live Countdown & Duration bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-amber-500 flex-shrink-0" />
                <span className="font-semibold text-[var(--color-text)]">
                  {isEn ? "Test Window:" : "টেস্টের সময়সীমা:"}
                </span>
                {status === "none" ? (
                  <select
                    value={durationMinutes}
                    onChange={(e) => onDurationChange(Number(e.target.value))}
                    className="p-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-xs font-semibold"
                  >
                    <option value={15}>{isEn ? "15 Minutes (Fast Breaking)" : "১৫ মিনিট (দ্রুত ব্রেকিং নিউজ)"}</option>
                    <option value={30}>{isEn ? "30 Minutes (Recommended)" : "৩০ মিনিট (প্রস্তাবিত আদর্শ সময়)"}</option>
                    <option value={60}>{isEn ? "60 Minutes (Standard)" : "৬০ মিনিট (১ ঘণ্টা)"}</option>
                    <option value={120}>{isEn ? "120 Minutes (Deep Feature)" : "১২০ মিনিট (২ ঘণ্টা বিশেষ সংবাদ)"}</option>
                  </select>
                ) : (
                  <span className="font-bold font-mono">
                    {isEn ? `${durationMinutes} minutes` : `${formatNumber(durationMinutes)} মিনিট`}
                  </span>
                )}
              </div>

              {remainingTime && (
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold font-mono text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  <span>{remainingTime}</span>
                </div>
              )}
            </div>

            {/* Inputs: Variant A vs Variant B */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Variant A (Primary) */}
              <div
                className={`p-3.5 rounded-lg border space-y-2 transition-all ${
                  status === "completed_a"
                    ? "border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 ring-2 ring-blue-500/20"
                    : isALeading
                    ? "border-blue-300 dark:border-blue-800 bg-blue-50/20 dark:bg-blue-950/10"
                    : "border-[var(--color-border)] bg-[var(--color-bg)]"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-black">
                      A
                    </span>
                    <span>{isEn ? "Headline Variant A (Primary)" : "শিরোনাম ভ্যারিয়েন্ট A (মূল)"}</span>
                  </span>
                  {status === "completed_a" && (
                    <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                      <Trophy size={12} /> {isEn ? "Winner" : "বিজয়ী"}
                    </span>
                  )}
                  {isALeading && status === "active" && (
                    <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                      <TrendingUp size={12} /> {isEn ? "Leading" : "এগিয়ে আছে"}
                    </span>
                  )}
                </div>

                <div className="text-xs font-semibold text-[var(--color-text)] p-2 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] min-h-[42px] leading-relaxed">
                  {headlineA.trim() || (isEn ? "Headline A will match your story title" : "শিরোনাম A হবে আপনার সংবাদের মূল শিরোনাম")}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                  <span>{isEn ? `${headlineA.length} chars` : `${formatNumber(headlineA.length)} অক্ষর`}</span>
                  <span>{isEn ? "50% Initial Audience" : "৫০% প্রাথমিক পাঠক"}</span>
                </div>

                {/* Scorecard for Variant A */}
                {(status === "active" || status.startsWith("completed")) && (
                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[var(--color-border)] text-center text-[11px]">
                    <div className="p-1.5 rounded bg-[var(--color-bg-secondary)]">
                      <div className="text-[10px] text-[var(--color-text-muted)] flex items-center justify-center gap-1">
                        <Users size={11} /> {isEn ? "Views" : "প্রদর্শন"}
                      </div>
                      <div className="font-bold font-mono text-[var(--color-text)]">
                        {isEn ? safeImpA : formatNumber(safeImpA)}
                      </div>
                    </div>
                    <div className="p-1.5 rounded bg-[var(--color-bg-secondary)]">
                      <div className="text-[10px] text-[var(--color-text-muted)] flex items-center justify-center gap-1">
                        <MousePointerClick size={11} /> {isEn ? "Clicks" : "ক্লিক"}
                      </div>
                      <div className="font-bold font-mono text-[var(--color-text)]">
                        {isEn ? clicksA : formatNumber(clicksA)}
                      </div>
                    </div>
                    <div className="p-1.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                      <div className="text-[10px] flex items-center justify-center gap-0.5">
                        <Percent size={11} /> CTR
                      </div>
                      <div className="font-black font-mono">
                        {isEn ? `${ctrA}%` : `${formatNumber(ctrA)}%`}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Variant B (Challenger) */}
              <div
                className={`p-3.5 rounded-lg border space-y-2 transition-all ${
                  status === "completed_b"
                    ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20"
                    : isBLeading
                    ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10"
                    : "border-[var(--color-border)] bg-[var(--color-bg)]"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center font-black">
                      B
                    </span>
                    <span>{isEn ? "Headline Variant B (Challenger)" : "শিরোনাম ভ্যারিয়েন্ট B (বিকল্প)"}</span>
                  </span>
                  {status === "completed_b" && (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <Trophy size={12} /> {isEn ? "Winner" : "বিজয়ী"}
                    </span>
                  )}
                  {isBLeading && status === "active" && (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <TrendingUp size={12} /> {isEn ? "Leading (+CTR)" : "এগিয়ে আছে (+CTR)"}
                    </span>
                  )}
                </div>

                <textarea
                  rows={2}
                  value={headlineB}
                  onChange={(e) => onHeadlineBChange(e.target.value)}
                  disabled={isReadOnly || status !== "none"}
                  placeholder={
                    isEn
                      ? "Enter high-impact alternate headline (e.g. question-based or emotional hook)..."
                      : "বিকল্প আকর্ষণীয় শিরোনাম লিখুন (প্রশ্নবোধক বা তথ্যবহুল বিকল্প)..."
                  }
                  className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-xs focus:outline-none focus:border-[var(--color-primary)] font-semibold disabled:opacity-80"
                />

                <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                  <span>{isEn ? `${headlineB.length} chars` : `${formatNumber(headlineB.length)} অক্ষর`}</span>
                  <span>{isEn ? "50% Initial Audience" : "৫০% প্রাথমিক পাঠক"}</span>
                </div>

                {/* Scorecard for Variant B */}
                {(status === "active" || status.startsWith("completed")) && (
                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[var(--color-border)] text-center text-[11px]">
                    <div className="p-1.5 rounded bg-[var(--color-bg-secondary)]">
                      <div className="text-[10px] text-[var(--color-text-muted)] flex items-center justify-center gap-1">
                        <Users size={11} /> {isEn ? "Views" : "প্রদর্শন"}
                      </div>
                      <div className="font-bold font-mono text-[var(--color-text)]">
                        {isEn ? safeImpB : formatNumber(safeImpB)}
                      </div>
                    </div>
                    <div className="p-1.5 rounded bg-[var(--color-bg-secondary)]">
                      <div className="text-[10px] text-[var(--color-text-muted)] flex items-center justify-center gap-1">
                        <MousePointerClick size={11} /> {isEn ? "Clicks" : "ক্লিক"}
                      </div>
                      <div className="font-bold font-mono text-[var(--color-text)]">
                        {isEn ? clicksB : formatNumber(clicksB)}
                      </div>
                    </div>
                    <div className="p-1.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                      <div className="text-[10px] flex items-center justify-center gap-0.5">
                        <Percent size={11} /> CTR
                      </div>
                      <div className="font-black font-mono">
                        {isEn ? `${ctrB}%` : `${formatNumber(ctrB)}%`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Manual Override Controls for Editors */}
            {status === "active" && onDeclareWinner && (
              <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <HelpCircle size={14} className="text-blue-500 flex-shrink-0" />
                  <span>
                    {isEn
                      ? "Editorial Override: You can conclude the test early by picking a permanent winner now."
                      : "সম্পাদকীয় সিদ্ধান্ত: নির্ধারিত সময়ের আগেই আপনি যে কোনো ভ্যারিয়েন্টকে স্থায়ী বিজয়ী ঘোষণা করতে পারেন।"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePickWinner("a")}
                    disabled={declaring !== null}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {declaring === "a" ? "..." : isEn ? "Declare A as Winner" : "Variant A কে বিজয়ী করুন"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePickWinner("b")}
                    disabled={declaring !== null || !headlineB.trim()}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {declaring === "b" ? "..." : isEn ? "Declare B as Winner & Promote" : "Variant B কে বিজয়ী করুন"}
                  </button>

                  {onResetTest && (
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={resetting}
                      className="p-1.5 border border-[var(--color-border)] hover:bg-[var(--color-bg)] text-zinc-500 rounded text-xs transition-colors cursor-pointer"
                      title={isEn ? "Reset A/B Test" : "টেস্ট রিসেট করুন"}
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
