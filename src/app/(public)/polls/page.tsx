import type { Metadata } from "next";
import Link from "next/link";
import { getAllPolls } from "@/actions/polls";
import { Vote, Users, Calendar, ArrowLeft, CheckCircle2 } from "lucide-react";

export const revalidate = 60; // ISR 60s

export const metadata: Metadata = {
  title: "অনলাইন ভোট ও পাঠক জরিপ আর্কাইভ | দৈনিক বাংলাদেশ বার্তা",
  description: "জাতীয়, রাজনীতি, অর্থনীতি ও সামাজিক গুরুত্বপূর্ণ ইস্যুতে পাঠকদের মতামত ও জনমত জরিপের সার্বিক ফলাফল।",
};

export default async function PollsArchivePage() {
  const allPolls = await getAllPolls();

  const barColors = [
    "bg-emerald-600 dark:bg-emerald-500",
    "bg-red-600 dark:bg-red-500",
    "bg-amber-600 dark:bg-amber-500",
    "bg-blue-600 dark:bg-blue-500",
    "bg-zinc-500",
  ];

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="border-b-2 border-[var(--color-primary)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
            <Link href="/" className="hover:text-[var(--color-primary)]">
              প্রচ্ছদ
            </Link>
            <span>/</span>
            <span className="text-[var(--color-text)] font-semibold">অনলাইন জরিপ</span>
          </div>
          <h1 className="bengali-headline text-2xl md:text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-2">
            <Vote size={28} className="text-[var(--color-primary)]" />
            অনলাইন ভোট ও পাঠক জনমত আর্কাইভ
          </h1>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline"
        >
          <ArrowLeft size={14} />
          প্রচ্ছদে ফিরুন
        </Link>
      </div>

      {/* Polls List */}
      {allPolls.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[var(--color-border)] rounded bg-[var(--color-bg)]">
          <Vote size={40} className="mx-auto text-[var(--color-text-muted)] mb-2" />
          <h3 className="font-bold text-base text-[var(--color-text)]">বর্তমানে কোনো জরিপ পাওয়া যায়নি</h3>
        </div>
      ) : (
        <div className="space-y-6">
          {allPolls.map((poll) => {
            const options = (poll.options as string[]) || [];
            const votes = (poll.votes as number[]) || [];
            const totalVotes = poll.totalVotes || 0;

            return (
              <div
                key={poll.id}
                className="border border-[var(--color-border)] rounded-md p-5 sm:p-6 bg-[var(--color-bg)] shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-red-100 dark:bg-red-950/70 text-[var(--color-primary)] rounded">
                      {poll.category}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                        poll.isActive
                          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-300 dark:border-zinc-700"
                      }`}
                    >
                      {poll.isActive ? "● চলমান জরিপ" : "○ সম্পন্ন জরিপ"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)] font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(poll.createdAt).toLocaleDateString("bn-BD", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      মোট ভোট: {totalVotes.toLocaleString("bn-BD")}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h2 className="bengali-headline text-lg sm:text-xl font-bold text-[var(--color-text)] leading-snug">
                    {poll.question}
                  </h2>
                  {poll.description && (
                    <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                      {poll.description}
                    </p>
                  )}
                </div>

                {/* Progress bars */}
                <div className="space-y-3 pt-2">
                  {options.map((opt, idx) => {
                    const count = votes[idx] || 0;
                    const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    const colorClass = barColors[idx % barColors.length];

                    return (
                      <div key={idx} className="space-y-1">
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
                            className={`h-full ${colorClass} rounded-full`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-[var(--color-border)] pt-3 flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text-muted)]">
                    উন্মুক্ত মতামত ও পর্যালোচনা
                  </span>
                  <Link
                    href={poll.slug ? `/debates/${poll.slug}` : `/debates/${poll.id}`}
                    className="font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                  >
                    <span>এই প্রশ্নের পক্ষে-বিপক্ষে বিতর্ক ও যুক্তি দেখুন &rarr;</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
