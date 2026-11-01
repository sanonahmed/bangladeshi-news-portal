"use client";

import { useState } from "react";
import {
  createBreakingNews,
  deleteBreakingNews,
  toggleBreakingNews,
  updateBreakingNewsPriority,
} from "@/actions/breaking-news";
import type { BreakingNews } from "@/db/schema/breaking-news";
import {
  Zap,
  Plus,
  Trash2,
  Clock,
  Eye,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Search,
} from "lucide-react";
import Link from "next/link";

interface AdminBreakingClientProps {
  initialItems: BreakingNews[];
}

export function AdminBreakingClient({ initialItems }: AdminBreakingClientProps) {
  const [items, setItems] = useState<BreakingNews[]>(initialItems);
  const [headline, setHeadline] = useState("");
  const [url, setUrl] = useState("/");
  const [priority, setPriority] = useState(10);
  const [isExternal, setIsExternal] = useState(false);
  const [expiresHours, setExpiresHours] = useState<number | "0">(6);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const activeItems = items.filter((item) => item.isActive);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!headline.trim()) {
      setError("ব্রেকিং সংবাদের শিরোনাম আবশ্যক");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createBreakingNews({
        headline: headline.trim(),
        url: url.trim() || "#",
        priority,
        isExternal,
        expiresHours: expiresHours === "0" || Number(expiresHours) === 0 ? null : Number(expiresHours),
      });

      if (!res.success || !res.item) {
        setError(res.error || "ব্রেকিং নিউজ তৈরি ব্যর্থ হয়েছে");
      } else {
        setSuccess("ব্রেকিং নিউজ সফলভাবে টিকার-এ প্রকাশ করা হয়েছে!");
        setItems([res.item, ...items]);
        setHeadline("");
        setUrl("/");
        setPriority(10);
      }
    } catch (err: any) {
      setError(err?.message || "সার্ভার এরর ঘটেছে");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggle(id: string, currentStatus: boolean) {
    setActionLoadingId(id);
    try {
      const res = await toggleBreakingNews(id, !currentStatus);
      if (res.success) {
        setItems(
          items.map((item) => (item.id === id ? { ...item, isActive: !currentStatus } : item))
        );
      } else {
        setError(res.error || "অবস্থা পরিবর্তন ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      setError(err?.message || "সার্ভার এরর");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই ব্রেকিং সংবাদটি মুছে ফেলতে চান?")) return;
    setActionLoadingId(id);
    try {
      const res = await deleteBreakingNews(id);
      if (res.success) {
        setItems(items.filter((item) => item.id !== id));
        setSuccess("ব্রেকিং সংবাদ মুছে ফেলা হয়েছে");
      } else {
        setError(res.error || "মুছে ফেলা ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      setError(err?.message || "সার্ভার এরর");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handlePriorityChange(id: string, newPriority: number) {
    if (newPriority < 1 || newPriority > 10) return;
    try {
      const res = await updateBreakingNewsPriority(id, newPriority);
      if (res.success) {
        setItems(
          items
            .map((item) => (item.id === id ? { ...item, priority: newPriority } : item))
            .sort((a, b) => b.priority - a.priority)
        );
      }
    } catch (err: any) {
      console.error("Priority update error:", err);
    }
  }

  const filteredItems = items.filter((item) =>
    item.headline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="bengali-headline text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <Zap size={26} className="text-[#C8102E] fill-[#C8102E]" />
            ব্রেকিং নিউজ ও স্ক্রলিং নোটিশ টিকটিকি বার
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            ওয়েবসাইটের শীর্ষে লাল টিকারে তাৎক্ষণিক জরুরি আপডেট ও নোটিশ নিয়ন্ত্রণ করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/breaking"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-secondary)] text-xs font-bold text-[var(--color-text)] transition-colors rounded"
          >
            <Eye size={14} />
            পাবলিক আর্কাইভ দেখুন
          </Link>
        </div>
      </div>

      {/* Live Ticker Bar Simulator / Preview */}
      <div className="border border-red-300 dark:border-red-900 rounded overflow-hidden shadow-sm">
        <div className="px-3 py-1.5 bg-zinc-900 text-white text-[11px] font-mono flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            লাইভ টিকার প্রিভিউ (পাঠকরা যেমন দেখতে পাবেন)
          </span>
          <span className="text-zinc-400">মোট সক্রিয়: {activeItems.length} টি</span>
        </div>

        <div className="bg-[#C8102E] text-white flex items-center h-10 px-3 overflow-hidden select-none">
          <div className="flex-shrink-0 bg-black/30 px-2.5 py-1 font-bold text-xs flex items-center gap-1.5 rounded mr-3">
            <Zap size={13} className="fill-yellow-300 text-yellow-300" />
            <span>ব্রেকিং নিউজ</span>
          </div>

          <div className="flex-1 overflow-hidden relative">
            {activeItems.length === 0 ? (
              <span className="text-xs text-white/80 italic">বর্তমানে কোনো ব্রেকিং নিউজ সক্রিয় নেই</span>
            ) : (
              <div
                className="flex items-center gap-6 whitespace-nowrap"
                style={{
                  animation: `ticker-scroll ${Math.max(20, activeItems.length * 8)}s linear infinite`,
                }}
              >
                {[...activeItems, ...activeItems].map((item, idx) => (
                  <span key={`${item.id}-${idx}`} className="flex items-center gap-2 text-xs font-semibold">
                    <span className="text-yellow-300 text-[10px]">◆</span>
                    <span>{item.headline}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
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

      {/* Main Grid: Form on Left/Right, List on the other */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Add Breaking News Form: 5 Columns */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleCreate}
            className="border border-[var(--color-border)] p-5 bg-[var(--color-bg)] rounded space-y-4 shadow-sm"
          >
            <div className="border-b border-[var(--color-border)] pb-2 flex items-center justify-between">
              <h2 className="bengali-headline text-base font-bold text-[var(--color-text)] flex items-center gap-1.5">
                <Plus size={18} className="text-[#C8102E]" />
                নতুন ব্রেকিং বা জরুরি নোটিশ প্রকাশ
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                ব্রেকিং শিরোনাম (বাংলা) *
              </label>
              <textarea
                required
                rows={3}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="যেমন: বঙ্গোপসাগরে ৩ নম্বর সতর্ক সংকেত জারি, উপকূলীয় এলাকায় বৃষ্টি..."
                className="w-full p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm font-semibold focus:outline-none focus:border-[#C8102E] rounded bengali-headline"
              />
              <div className="flex justify-between text-[11px] text-[var(--color-text-muted)] mt-1">
                <span>স্পষ্ট ও সংক্ষিপ্ত শিরোনাম রাখুন</span>
                <span>{headline.length} / ৩০০ অক্ষর</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                সংবাদের লিঙ্ক (URL বা স্ল্যাগ)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="/news/cyclone-warning বা পূর্ণ লিংক"
                className="w-full p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-mono focus:outline-none focus:border-[#C8102E] rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                  অগ্রাধিকার (Priority)
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[#C8102E] rounded font-bold"
                >
                  <option value={10}>১০ - রেড এলার্ট / শীর্ষ ব্রেকিং</option>
                  <option value={8}>৮ - অতি গুরুত্বপূর্ণ বুলেটিন</option>
                  <option value={5}>৫ - সাধারণ ব্রেকিং নিউজ</option>
                  <option value={3}>৩ - সাধারণ নোটিশ / বার্তা</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                  মেয়াদ (Auto-expire)
                </label>
                <select
                  value={expiresHours}
                  onChange={(e) => setExpiresHours(e.target.value === "0" ? "0" : Number(e.target.value))}
                  className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[#C8102E] rounded"
                >
                  <option value={1}>১ ঘণ্টা পর স্বয়ংক্রিয় বন্ধ</option>
                  <option value={3}>৩ ঘণ্টা পর বন্ধ</option>
                  <option value={6}>৬ ঘণ্টা পর বন্ধ</option>
                  <option value={12}>১২ ঘণ্টা পর বন্ধ</option>
                  <option value={24}>২৪ ঘণ্টা (১ দিন)</option>
                  <option value="0">স্থায়ী (যতক্ষণ না সরানো হয়)</option>
                </select>
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isExternal}
                  onChange={(e) => setIsExternal(e.target.checked)}
                  className="rounded text-[#C8102E]"
                />
                <span>এক্সটার্নাল লিংক (নতুন ট্যাবে ওপেন হবে)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#C8102E] hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm rounded flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  প্রকাশ হচ্ছে...
                </>
              ) : (
                <>
                  <Zap size={14} className="fill-white" />
                  টিকার-এ সরাসরি প্রকাশ করুন
                </>
              )}
            </button>
          </form>
        </div>

        {/* Existing Breaking Headlines List: 7 Columns */}
        <div className="lg:col-span-7 space-y-3">
          <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded overflow-hidden shadow-sm">
            <div className="p-3 border-b border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--color-bg-secondary)]">
              <div className="flex items-center gap-2">
                <h3 className="bengali-headline text-sm font-bold text-[var(--color-text)]">
                  সকল ব্রেকিং নিউজ তালিকা ({items.length}টি)
                </h3>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  placeholder="খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-2 py-1 text-xs bg-[var(--color-bg)] border border-[var(--color-border)] rounded focus:outline-none focus:border-[#C8102E]"
                />
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="p-10 text-center text-xs text-[var(--color-text-muted)]">
                কোনো ব্রেকিং সংবাদ পাওয়া যায়নি।
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {filteredItems.map((item) => {
                  const isUrgent = item.priority >= 8;
                  const isLoading = actionLoadingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 transition-colors ${
                        item.isActive
                          ? "bg-[var(--color-bg)]"
                          : "bg-zinc-50 dark:bg-zinc-900/30 opacity-70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                                isUrgent
                                  ? "bg-red-600 text-white shadow-xs"
                                  : "bg-blue-600 text-white"
                              }`}
                            >
                              অগ্রাধিকার: {item.priority}
                            </span>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                item.isActive
                                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-300 dark:border-zinc-700"
                              }`}
                            >
                              {item.isActive ? "● লাইভ সক্রিয়" : "○ বন্ধ"}
                            </span>

                            {item.expiresAt && (
                              <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1 font-mono">
                                <Clock size={11} />
                                মেয়াদ: {new Date(item.expiresAt).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>

                          <h4 className="bengali-headline text-sm font-bold text-[var(--color-text)] leading-snug">
                            {item.headline}
                          </h4>

                          <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
                            <span className="truncate max-w-xs font-mono">{item.url}</span>
                            {item.isExternal && (
                              <span className="flex items-center gap-0.5 text-[#C8102E]">
                                <ExternalLink size={10} /> এক্সটার্নাল
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center gap-1.5 flex-shrink-0">
                          {/* Priority adjusters */}
                          <div className="flex flex-col items-center border border-[var(--color-border)] rounded bg-[var(--color-bg-secondary)]">
                            <button
                              type="button"
                              onClick={() => handlePriorityChange(item.id, item.priority + 1)}
                              disabled={item.priority >= 10}
                              className="p-1 hover:text-[#C8102E] disabled:opacity-30 cursor-pointer"
                              title="অগ্রাধিকার বাড়ান"
                            >
                              <ChevronUp size={12} />
                            </button>
                            <span className="text-[10px] font-mono font-bold px-1">{item.priority}</span>
                            <button
                              type="button"
                              onClick={() => handlePriorityChange(item.id, item.priority - 1)}
                              disabled={item.priority <= 1}
                              className="p-1 hover:text-[#C8102E] disabled:opacity-30 cursor-pointer"
                              title="অগ্রাধিকার কমান"
                            >
                              <ChevronDown size={12} />
                            </button>
                          </div>

                          {/* Toggle active switch */}
                          <button
                            type="button"
                            onClick={() => handleToggle(item.id, item.isActive)}
                            disabled={isLoading}
                            className={`px-2.5 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                              item.isActive
                                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200"
                                : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200"
                            }`}
                          >
                            {item.isActive ? "পজ করুন" : "সক্রিয় করুন"}
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            disabled={isLoading}
                            className="p-1.5 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
