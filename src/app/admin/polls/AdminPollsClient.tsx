"use client";

import { useState } from "react";
import {
  createPoll,
  deletePoll,
  togglePollStatus,
  togglePollFeatured,
} from "@/actions/polls";
import type { Poll } from "@/db/schema/polls";
import {
  Vote,
  PlusCircle,
  Trash2,
  Star,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Minus,
  RefreshCw,
  BarChart2,
} from "lucide-react";
import Link from "next/link";

interface AdminPollsClientProps {
  initialPolls: Poll[];
}

export function AdminPollsClient({ initialPolls }: AdminPollsClientProps) {
  const [pollsList, setPollsList] = useState<Poll[]>(initialPolls);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("জাতীয়");
  const [options, setOptions] = useState<string[]>([
    "পুরোপুরি সমর্থন করি",
    "কার্যকর হবে না",
    "কোনো মন্তব্য নেই",
  ]);
  const [isFeatured, setIsFeatured] = useState(true);

  // Preset Option buttons
  function applyPreset(presetType: "yes_no" | "support" | "agree") {
    if (presetType === "yes_no") {
      setOptions(["হ্যাঁ", "না", "মন্তব্য নেই"]);
    } else if (presetType === "support") {
      setOptions(["পুরোপুরি সমর্থন করি", "কিছুটা কার্যকর", "কার্যকর নয়", "কোনো মন্তব্য নেই"]);
    } else if (presetType === "agree") {
      setOptions(["একমত", "ভিন্নমত", "মন্তব্য নেই"]);
    }
  }

  function handleOptionChange(index: number, value: string) {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  }

  function addOption() {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  }

  function removeOption(index: number) {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!question.trim()) {
      setError("জরিপ প্রশ্ন আবশ্যক");
      return;
    }

    const validOptions = options.map((o) => o.trim()).filter(Boolean);
    if (validOptions.length < 2) {
      setError("কমপক্ষে ২টি উত্তরের বিকল্প দিন");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createPoll({
        question: question.trim(),
        description: description.trim() || undefined,
        category,
        options: validOptions,
        isFeatured,
      });

      if (!res.success || !res.poll) {
        setError(res.error || "জরিপ তৈরি ব্যর্থ হয়েছে");
      } else {
        setSuccess("নতুন জরিপ সফলভাবে প্রকাশিত হয়েছে!");
        if (isFeatured) {
          setPollsList([res.poll, ...pollsList.map((p) => ({ ...p, isFeatured: false }))]);
        } else {
          setPollsList([res.poll, ...pollsList]);
        }
        setQuestion("");
        setDescription("");
        setShowAddForm(false);
      }
    } catch (err: any) {
      setError(err?.message || "সার্ভার এরর ঘটেছে");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleFeatured(id: string, currentFeatured: boolean) {
    setActionLoadingId(id);
    try {
      const res = await togglePollFeatured(id, !currentFeatured);
      if (res.success) {
        setPollsList(
          pollsList.map((p) => ({
            ...p,
            isFeatured: p.id === id ? !currentFeatured : false,
          }))
        );
        setSuccess("হোমপেজ ফিচার্ড জরিপ আপডেট হয়েছে");
      } else {
        setError(res.error || "আপডেট ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      setError(err?.message || "সার্ভার এরর");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleToggleStatus(id: string, currentStatus: boolean) {
    setActionLoadingId(id);
    try {
      const res = await togglePollStatus(id, !currentStatus);
      if (res.success) {
        setPollsList(
          pollsList.map((p) => (p.id === id ? { ...p, isActive: !currentStatus } : p))
        );
      } else {
        setError(res.error || "আপডেট ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      setError(err?.message || "সার্ভার এরর");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই জরিপটি মুছে ফেলতে চান?")) return;
    setActionLoadingId(id);
    try {
      const res = await deletePoll(id);
      if (res.success) {
        setPollsList(pollsList.filter((p) => p.id !== id));
        setSuccess("জরিপ মুছে ফেলা হয়েছে");
      } else {
        setError(res.error || "মুছে ফেলা ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      setError(err?.message || "সার্ভার এরর");
    } finally {
      setActionLoadingId(null);
    }
  }

  const barColors = [
    "bg-emerald-600",
    "bg-red-600",
    "bg-amber-600",
    "bg-blue-600",
    "bg-zinc-500",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="bengali-headline text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <Vote size={26} className="text-[var(--color-primary)]" />
            অনলাইন ভোট ও পাঠক জরিপ ম্যানেজার
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            হোমপেজ ও আর্কাইভে প্রদর্শনের জন্য জনমত জরিপ তৈরি ও ফলাফল পর্যালোচনা করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/polls"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-secondary)] text-xs font-bold text-[var(--color-text)] transition-colors rounded"
          >
            <BarChart2 size={14} />
            পাবলিক আর্কাইভ দেখুন
          </Link>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-colors rounded shadow-xs cursor-pointer"
          >
            <PlusCircle size={15} />
            {showAddForm ? "ফর্ম বন্ধ করুন" : "নতুন জরিপ তৈরি করুন"}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border-l-4 border-red-600 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-600 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Add Poll Drawer Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="border border-[var(--color-border)] p-6 bg-[var(--color-bg)] rounded space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <h3 className="bengali-headline text-base font-bold text-[var(--color-text)] flex items-center gap-2">
              <PlusCircle size={18} className="text-[var(--color-primary)]" />
              নতুন পাঠক জরিপ তথ্য
            </h3>
            <span className="text-xs text-[var(--color-text-muted)]">
              প্রশ্ন ও উত্তরের বিকল্প নির্ধারণ করুন
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                জরিপ প্রশ্ন (বাংলা) *
              </label>
              <textarea
                required
                rows={2}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="যেমন: নিত্যপণ্যের বাজার নিয়ন্ত্রণে সরকারের সাম্প্রতিক পদক্ষেপকে আপনি কীভাবে দেখছেন?"
                className="w-full p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm font-bold focus:outline-none focus:border-[var(--color-primary)] bengali-headline rounded"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                পটভূমি / প্রাসঙ্গিক তথ্য (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="জরিপের প্রেক্ষাপট সম্পর্কে ১/২ লাইন লিখুন..."
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                  ক্যাটাগরি
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded font-semibold"
                >
                  <option value="জাতীয়">জাতীয়</option>
                  <option value="রাজনীতি">রাজনীতি</option>
                  <option value="অর্থনীতি">অর্থনীতি</option>
                  <option value="খেলাধুলা">খেলাধুলা</option>
                  <option value="আন্তর্জাতিক">আন্তর্জাতিক</option>
                  <option value="সমাজ ও পরিবেশ">সমাজ ও পরিবেশ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                  দ্রুত বিকল্প সেট (Preset Templates)
                </label>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => applyPreset("yes_no")}
                    className="px-2 py-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-primary)] text-xs rounded font-bold cursor-pointer"
                  >
                    হ্যাঁ / না / মন্তব্য নেই
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("support")}
                    className="px-2 py-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-primary)] text-xs rounded font-bold cursor-pointer"
                  >
                    সমর্থন / কার্যকর
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("agree")}
                    className="px-2 py-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-primary)] text-xs rounded font-bold cursor-pointer"
                  >
                    একমত / ভিন্নমত
                  </button>
                </div>
              </div>
            </div>

            {/* Options list */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[var(--color-text-muted)]">
                উত্তরের বিকল্পসমূহ (কমপক্ষে ২টি)
              </label>
              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 text-xs font-mono font-bold text-[var(--color-text-muted)] text-center">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`বিকল্প ${idx + 1}`}
                      className="flex-1 p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs rounded focus:outline-none focus:border-[var(--color-primary)]"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(idx)}
                        className="p-2 text-zinc-400 hover:text-red-600 cursor-pointer"
                        title="বাদ দিন"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {options.length < 6 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:underline cursor-pointer"
                >
                  <Plus size={13} />
                  <span>আরও একটি বিকল্প যোগ করুন</span>
                </button>
              )}
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-[var(--color-primary)]"
                />
                <span>হোমপেজের মূল জরিপ উইজেটে সরাসরি প্রদর্শন করুন (Featured)</span>
              </label>
            </div>

            <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-[var(--color-border)] text-xs font-bold rounded hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer"
              >
                বাতিল
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold rounded transition-colors shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    তৈরি হচ্ছে...
                  </>
                ) : (
                  <>
                    <Vote size={14} />
                    জরিপ প্রকাশ করুন
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Polls List */}
      <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded overflow-hidden shadow-sm">
        <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between">
          <h3 className="bengali-headline text-sm font-bold text-[var(--color-text)]">
            সকল অনলাইন জরিপ ({pollsList.length}টি)
          </h3>
          <span className="text-xs text-[var(--color-text-muted)]">
            স্টার আইকনে ক্লিক করে হোমপেজের প্রধান জরিপ নির্বাচন করুন
          </span>
        </div>

        {pollsList.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--color-text-muted)]">
            বর্তমানে কোনো জরিপ নেই।
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {pollsList.map((poll) => {
              const options = (poll.options as string[]) || [];
              const votes = (poll.votes as number[]) || [];
              const totalVotes = poll.totalVotes || 0;
              const isLoading = actionLoadingId === poll.id;

              return (
                <div key={poll.id} className="p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(poll.id, poll.isFeatured)}
                        disabled={isLoading}
                        className={`p-1.5 rounded transition-colors cursor-pointer ${
                          poll.isFeatured
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600"
                            : "text-zinc-400 hover:text-amber-500"
                        }`}
                        title={poll.isFeatured ? "প্রধান জরিপ থেকে সরান" : "হোমপেজের প্রধান জরিপ হিসেবে দেখান"}
                      >
                        <Star size={16} className={poll.isFeatured ? "fill-amber-500 text-amber-500" : ""} />
                      </button>

                      <span className="text-xs font-bold px-2 py-0.5 bg-red-100 dark:bg-red-950/70 text-[var(--color-primary)] rounded">
                        {poll.category}
                      </span>

                      {poll.isFeatured && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 rounded">
                          ★ হোমপেজে প্রদর্শিত
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          poll.isActive
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-300 dark:border-zinc-700"
                        }`}
                      >
                        {poll.isActive ? "সক্রিয়" : "বন্ধ"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] font-mono">
                      <Users size={12} />
                      <span>মোট ভোট: {totalVotes.toLocaleString("bn-BD")}</span>
                    </div>
                  </div>

                  <h4 className="bengali-headline text-base font-bold text-[var(--color-text)] leading-snug">
                    {poll.question}
                  </h4>

                  {/* Options & results breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                    {options.map((opt, idx) => {
                      const count = votes[idx] || 0;
                      const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                      const colorClass = barColors[idx % barColors.length];

                      return (
                        <div
                          key={idx}
                          className="p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span className="truncate max-w-[140px] text-[var(--color-text)]">{opt}</span>
                            <span className="font-mono font-bold text-[var(--color-text)]">
                              {percentage}% ({count})
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div className={`h-full ${colorClass}`} style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleToggleStatus(poll.id, poll.isActive)}
                      className={`px-2.5 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                        poll.isActive
                          ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200"
                          : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200"
                      }`}
                    >
                      {poll.isActive ? "জরিপ বন্ধ করুন" : "পুনরায় চালু করুন"}
                    </button>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleDelete(poll.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                      title="জরিপটি মুছে ফেলুন"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
