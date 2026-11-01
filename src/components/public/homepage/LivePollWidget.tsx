"use client";

import { useState, useEffect } from "react";
import { castVote } from "@/actions/polls";
import type { Poll } from "@/db/schema/polls";
import {
  Vote,
  CheckCircle2,
  BarChart2,
  Clock,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Users,
} from "lucide-react";
import Link from "next/link";

interface LivePollWidgetProps {
  initialPoll: Poll | null;
}

export function LivePollWidget({ initialPoll }: LivePollWidgetProps) {
  const [poll, setPoll] = useState<Poll | null>(initialPoll);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (poll) {
      if (typeof document !== "undefined") {
        const votedCookie = document.cookie.includes(`has_voted_poll_${poll.id}=true`);
        if (votedCookie) {
          setHasVoted(true);
        }
      }
    }
  }, [poll]);

  if (!poll) return null;

  const options = (poll.options as string[]) || [];
  const votes = (poll.votes as number[]) || [];
  const totalVotes = poll.totalVotes || 0;

  async function handleSubmitVote() {
    if (selectedOption === null) {
      setError("অনুগ্রহ করে একটি বিকল্প নির্বাচন করুন");
      return;
    }

    if (!poll) return;

    setIsSubmitting(true);
    setError("");
    try {
      const res = await castVote(poll.id, selectedOption);
      if (!res.success) {
        setError(res.error || "ভোট গ্রহণে সমস্যা হয়েছে");
      } else if (res.poll) {
        setPoll(res.poll);
        setHasVoted(true);
        setSuccess("আপনার মূল্যবান মতামত সফলভাবে গৃহীত হয়েছে!");
      }
    } catch (err: any) {
      setError(err?.message || "সার্ভার এরর");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Pre-defined color palettes for percentage bars
  const barColors = [
    "bg-emerald-600 dark:bg-emerald-500",
    "bg-red-600 dark:bg-red-500",
    "bg-amber-600 dark:bg-amber-500",
    "bg-blue-600 dark:bg-blue-500",
    "bg-zinc-500",
  ];

  return (
    <section className="bg-[var(--color-bg)] border-2 border-[var(--color-primary)] rounded-md p-5 sm:p-6 shadow-sm my-8">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[var(--color-border)] gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-red-100 dark:bg-red-950/70 text-[var(--color-primary)] rounded-full">
            <Vote size={20} className="text-[var(--color-primary)]" />
          </span>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-primary)]">
              অনলাইন জরিপ ও পাঠক ভোট
            </span>
            <h3 className="bengali-headline text-lg sm:text-xl font-extrabold text-[var(--color-text)]">
              আজকের নির্বাচিত প্রশ্ন
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-[var(--color-bg-secondary)] border border-[var(--color-border)] px-2.5 py-1 rounded text-[var(--color-text-muted)] font-mono flex items-center gap-1.5">
            <Users size={12} />
            <span>মোট ভোট: {totalVotes}</span>
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 bg-red-50 dark:bg-red-950/50 text-[var(--color-primary)] rounded border border-red-200 dark:border-red-900">
            {poll.category}
          </span>
        </div>
      </div>

      {/* Poll Question */}
      <div className="mb-5 space-y-2">
        <h4 className="bengali-headline text-base sm:text-lg font-bold text-[var(--color-text)] leading-snug">
          {poll.question}
        </h4>
        {poll.description && (
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
            {poll.description}
          </p>
        )}
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="mb-4 p-2.5 bg-red-50 dark:bg-red-950/40 border-l-4 border-red-600 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
          <AlertCircle size={15} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-600 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 size={15} className="flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Options or Results View */}
      {!hasVoted ? (
        <div className="space-y-4">
          <div className="space-y-2.5">
            {options.map((opt, idx) => (
              <label
                key={idx}
                className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-all ${
                  selectedOption === idx
                    ? "border-[var(--color-primary)] bg-red-50/50 dark:bg-red-950/30 ring-1 ring-[var(--color-primary)]/30 font-bold"
                    : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-zinc-400"
                }`}
              >
                <input
                  type="radio"
                  name={`poll-${poll.id}`}
                  checked={selectedOption === idx}
                  onChange={() => setSelectedOption(idx)}
                  className="w-4 h-4 text-[var(--color-primary)] accent-[var(--color-primary)] cursor-pointer"
                />
                <span className="bengali-headline text-sm text-[var(--color-text)]">{opt}</span>
              </label>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              disabled={isSubmitting || selectedOption === null}
              onClick={handleSubmitVote}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs sm:text-sm font-bold rounded transition-colors shadow cursor-pointer disabled:opacity-40"
            >
              <Vote size={16} />
              <span>{isSubmitting ? "ভোট নেওয়া হচ্ছে..." : "আপনার ভোট দিন"}</span>
            </button>

            <button
              type="button"
              onClick={() => setHasVoted(true)}
              className="text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-primary)] flex items-center gap-1 cursor-pointer"
            >
              <BarChart2 size={14} />
              <span>সরাসরি বর্তমান ফলাফল দেখুন</span>
            </button>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-3">
            {options.map((opt, idx) => {
              const count = votes[idx] || 0;
              const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
              const colorClass = barColors[idx % barColors.length];

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-[var(--color-text)] flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`}></span>
                      {opt}
                    </span>
                    <span className="font-mono font-bold text-[var(--color-text)]">
                      {percentage}% ({count.toLocaleString("bn-BD")} ভোট)
                    </span>
                  </div>

                  <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colorClass} transition-all duration-700 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 size={14} className="text-emerald-600" />
              আপনার ভোট বা মতামত নথিভুক্ত রয়েছে
            </span>
            <span className="font-mono text-[11px]">
              মোট অংশগ্রহণকারী: {totalVotes.toLocaleString("bn-BD")}
            </span>
          </div>
        </div>
      )}

      {/* Footer Link to /polls */}
      <div className="mt-5 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
        <span className="text-[var(--color-text-muted)] hidden sm:inline-block">
          প্রতিটি পাঠক ১টি মতামত প্রকাশ করতে পারেন
        </span>
        <Link
          href="/polls"
          className="text-[var(--color-primary)] font-bold hover:underline flex items-center gap-1"
        >
          <span>আগের সব জরিপ ও বিস্তারিত ফলাফল দেখুন</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  );
}
