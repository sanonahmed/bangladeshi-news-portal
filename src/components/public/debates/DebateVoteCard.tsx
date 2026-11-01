"use client";

import { useState } from "react";
import { Vote, CheckCircle2, Users, AlertCircle, BarChart3 } from "lucide-react";
import { castVote } from "@/actions/polls";
import { toBengaliDigits } from "@/lib/bengali-date";

interface DebateVoteCardProps {
  pollId: string;
  question: string;
  options: string[];
  initialVotes: number[];
  initialTotalVotes: number;
  isActive: boolean;
  userHasVoted?: boolean;
}

export function DebateVoteCard({
  pollId,
  question,
  options,
  initialVotes,
  initialTotalVotes,
  isActive,
  userHasVoted = false,
}: DebateVoteCardProps) {
  const [hasVoted, setHasVoted] = useState(userHasVoted);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [votes, setVotes] = useState<number[]>(initialVotes);
  const [totalVotes, setTotalVotes] = useState<number>(initialTotalVotes);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVoteSubmit = async () => {
    if (selectedOption === null || isLoading || !isActive) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await castVote(pollId, selectedOption);
      if (res.success && res.poll) {
        setVotes(res.poll.votes as number[]);
        setTotalVotes(res.poll.totalVotes);
        setHasVoted(true);
      } else {
        setErrorMsg(res.error || "ভোট প্রদান সম্ভব হয়নি");
      }
    } catch {
      setErrorMsg("সার্ভারে ত্রুটি হয়েছে, পরে চেষ্টা করুন");
    } finally {
      setIsLoading(false);
    }
  };

  const getPercentage = (voteCount: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((voteCount / totalVotes) * 100);
  };

  const optionColors = [
    { bar: "bg-emerald-600", border: "border-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
    { bar: "bg-red-600", border: "border-red-500", text: "text-red-700 dark:text-red-400" },
    { bar: "bg-amber-600", border: "border-amber-500", text: "text-amber-700 dark:text-amber-400" },
    { bar: "bg-blue-600", border: "border-blue-500", text: "text-blue-700 dark:text-blue-400" },
  ];

  return (
    <div className="bg-[var(--color-bg)] border-2 border-[var(--color-primary)] p-6 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4 mb-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
          <Vote className="w-4 h-4" />
          <span>অনলাইন ভোট গ্রহণ</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1 font-semibold text-[var(--color-text)]">
            <Users className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            মোট ভোট: {toBengaliDigits(totalVotes)}
          </span>
          <span className="border-l border-[var(--color-border)] pl-3">
            {isActive ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                চলমান
              </span>
            ) : (
              <span className="text-zinc-500 font-bold">সমাপ্ত</span>
            )}
          </span>
        </div>
      </div>

      <h3 className="bengali-serif-headline text-lg sm:text-xl font-bold text-[var(--color-text)] leading-snug mb-6">
        {question}
      </h3>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SHOW RESULTS IF VOTED OR CLOSED */}
      {hasVoted || !isActive ? (
        <div className="space-y-4">
          {hasVoted && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 border border-emerald-200 dark:border-emerald-800 mb-4">
              <CheckCircle2 className="w-4 h-4" />
              <span>আপনার মূল্যবান মতামত রেকর্ড করা হয়েছে। নিচের ফলাফল পর্যালোচনা করুন:</span>
            </div>
          )}

          {options.map((opt, idx) => {
            const count = votes[idx] || 0;
            const pct = getPercentage(count);
            const color = optionColors[idx % optionColors.length] ?? optionColors[0]!;

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-[var(--color-text)]">
                  <span>{opt}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-text-muted)]">
                      ({toBengaliDigits(count)} ভোট)
                    </span>
                    <span className="font-bold font-mono text-[var(--color-text)]">
                      {toBengaliDigits(pct)}%
                    </span>
                  </div>
                </div>
                <div className="h-3 w-full bg-[var(--color-bg-secondary)] overflow-hidden border border-[var(--color-border)]">
                  <div
                    className={`h-full ${color.bar} transition-all duration-700 ease-out`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VOTING FORM */
        <div className="space-y-4">
          <p className="text-xs text-[var(--color-text-muted)] font-medium mb-3">
            আপনার দৃষ্টিতে কোনটি সঠিক? যেকোনো একটি বিকল্প নির্বাচন করে ভোট দিন:
          </p>

          <div className="space-y-2.5">
            {options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <label
                  key={idx}
                  onClick={() => setSelectedOption(idx)}
                  className={`flex items-center justify-between p-3.5 border cursor-pointer transition-all ${
                    isSelected
                      ? "border-[var(--color-primary)] bg-red-50/60 dark:bg-red-950/20 text-[var(--color-text)] shadow-xs"
                      : "border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                          : "border-zinc-400"
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm font-bold">{opt}</span>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={handleVoteSubmit}
              disabled={selectedOption === null || isLoading}
              className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-6 py-2.5 text-xs font-bold hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Vote className="w-4 h-4" />
              <span>{isLoading ? "ভোট জমা হচ্ছে..." : "ভোট প্রদান করুন"}</span>
            </button>

            <button
              onClick={() => setHasVoted(true)}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] flex items-center gap-1 font-semibold"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>ভোট না দিয়ে ফলাফল দেখুন</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
