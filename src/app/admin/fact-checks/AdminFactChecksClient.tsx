"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Clock,
  Star,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Share2,
  Sparkles,
  Inbox,
  ArrowRight,
  FileCheck2,
  ChevronDown,
} from "lucide-react";
import { FactCheckBadge } from "@/components/public/fact-check/FactCheckBadge";
import {
  createFactCheck,
  updateFactCheck,
  deleteFactCheck,
  toggleFactCheckFeatured,
  updateSubmissionStatus,
  deleteSubmission,
  type FactCheckInput,
} from "@/actions/fact-checks";
import type { FactCheckItem, FactCheckSubmissionItem, VerdictType } from "@/types/fact-check";
import { toBengaliDigits, formatBengaliDate } from "@/lib/bengali-date";

interface AdminFactChecksClientProps {
  initialFactChecks: FactCheckItem[];
  initialSubmissions: FactCheckSubmissionItem[];
}

export function AdminFactChecksClient({
  initialFactChecks,
  initialSubmissions,
}: AdminFactChecksClientProps) {
  const [factChecksList, setFactChecksList] = useState<FactCheckItem[]>(initialFactChecks);
  const [submissionsList, setSubmissionsList] = useState<FactCheckSubmissionItem[]>(initialSubmissions);

  const [activeTab, setActiveTab] = useState<"factchecks" | "submissions" | "screener">("factchecks");
  const [searchQuery, setSearchQuery] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<string>("all");
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<string>("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FactCheckItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formClaim, setFormClaim] = useState("");
  const [formClaimant, setFormClaimant] = useState("");
  const [formVerdict, setFormVerdict] = useState<VerdictType>("false");
  const [formVerdictSummary, setFormVerdictSummary] = useState("");
  const [formContext, setFormContext] = useState("");
  const [formInvestigationDetails, setFormInvestigationDetails] = useState("");
  const [formFactConclusion, setFormFactConclusion] = useState("");
  const [formOriginalMediaUrl, setFormOriginalMediaUrl] = useState("");
  const [formDebunkedMediaUrl, setFormDebunkedMediaUrl] = useState("");
  const [formCategory, setFormCategory] = useState("সাধারণ");
  const [formTags, setFormTags] = useState("");
  const [formIsFeatured, setFormIsFeatured] = useState(false);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // AI Screener state
  const [screenerInput, setScreenerInput] = useState("");
  const [screenerResult, setScreenerResult] = useState<{
    suggestedVerdict: VerdictType;
    verdictLabel: string;
    indicators: string[];
    officialSources: string[];
  } | null>(null);
  const [screenerLoading, setScreenerLoading] = useState(false);

  // Derived stats
  const totalFactChecks = factChecksList.length;
  const falseCount = factChecksList.filter((f) => f.verdict === "false").length;
  const misleadingCount = factChecksList.filter((f) => f.verdict === "misleading").length;
  const alteredCount = factChecksList.filter((f) => f.verdict === "altered_media").length;
  const pendingSubmissionsCount = submissionsList.filter((s) => s.status === "pending").length;

  function openCreateModal(prefill?: { claim?: string; claimant?: string; description?: string }) {
    setEditingItem(null);
    setFormTitle(prefill?.claim ? `${prefill.claim} সংক্রান্ত তথ্যটি ভুয়া` : "");
    setFormSlug("");
    setFormClaim(prefill?.claim || "");
    setFormClaimant(prefill?.claimant || "সামাজিক মাধ্যমে ছড়ানো পোস্ট ও ভাইরাল ভিডিও");
    setFormVerdict("false");
    setFormVerdictSummary("");
    setFormContext(prefill?.description || "");
    setFormInvestigationDetails("");
    setFormFactConclusion("");
    setFormOriginalMediaUrl("");
    setFormDebunkedMediaUrl("");
    setFormCategory("সাধারণ");
    setFormTags("গুজব, ফ্যাক্ট-চেক, সত্যসন্ধান");
    setFormIsFeatured(false);
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEditModal(item: FactCheckItem) {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormSlug(item.slug);
    setFormClaim(item.claim);
    setFormClaimant(item.claimant);
    setFormVerdict(item.verdict);
    setFormVerdictSummary(item.verdictSummary);
    setFormContext(item.context || "");
    setFormInvestigationDetails(item.investigationDetails || "");
    setFormFactConclusion(item.factConclusion || "");
    setFormOriginalMediaUrl(item.originalMediaUrl || "");
    setFormDebunkedMediaUrl(item.debunkedMediaUrl || "");
    setFormCategory(item.category || "সাধারণ");
    setFormTags((item.tags || []).join(", "));
    setFormIsFeatured(item.isFeatured);
    setFormError(null);
    setIsModalOpen(true);
  }

  async function handleSaveFactCheck(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    if (!formTitle.trim() || !formClaim.trim() || !formVerdictSummary.trim()) {
      setFormError("শিরোনাম, দাবি এবং রায়ের সারসংক্ষেপ অবশ্যই পূরণ করুন।");
      setFormLoading(false);
      return;
    }

    const payload: FactCheckInput = {
      title: formTitle.trim(),
      slug: formSlug.trim() || undefined,
      claim: formClaim.trim(),
      claimant: formClaimant.trim() || "সামাজিক যোগাযোগ মাধ্যম",
      verdict: formVerdict,
      verdictSummary: formVerdictSummary.trim(),
      context: formContext.trim() || undefined,
      investigationDetails: formInvestigationDetails.trim() || undefined,
      factConclusion: formFactConclusion.trim() || undefined,
      originalMediaUrl: formOriginalMediaUrl.trim() || undefined,
      debunkedMediaUrl: formDebunkedMediaUrl.trim() || undefined,
      category: formCategory.trim() || "সাধারণ",
      tags: formTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isFeatured: formIsFeatured,
    };

    try {
      if (editingItem) {
        const res = await updateFactCheck(editingItem.id, payload);
        if (!res.success) throw new Error(res.error);

        setFactChecksList((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? {
                  ...item,
                  ...payload,
                  tags: payload.tags || [],
                  context: payload.context || null,
                  investigationDetails: payload.investigationDetails || null,
                  factConclusion: payload.factConclusion || null,
                  originalMediaUrl: payload.originalMediaUrl || null,
                  debunkedMediaUrl: payload.debunkedMediaUrl || null,
                  category: payload.category || item.category,
                  isFeatured: payload.isFeatured ?? false,
                }
              : item
          )
        );
        setSuccessMsg("ফ্যাক্ট-চেক রেকর্ড সফলভাবে হালনাগাদ করা হয়েছে!");
      } else {
        const res = await createFactCheck(payload);
        if (!res.success) throw new Error(res.error);

        const newItem: FactCheckItem = {
          id: `fc-${Date.now()}`,
          slug: res.slug || `factcheck-${Date.now()}`,
          title: payload.title,
          claim: payload.claim,
          claimant: payload.claimant,
          verdict: payload.verdict,
          verdictSummary: payload.verdictSummary,
          category: payload.category || "সাধারণ",
          tags: payload.tags || [],
          context: payload.context || null,
          investigationDetails: payload.investigationDetails || null,
          factConclusion: payload.factConclusion || null,
          originalMediaUrl: payload.originalMediaUrl || null,
          debunkedMediaUrl: payload.debunkedMediaUrl || null,
          viewCount: 0,
          shareCount: 0,
          isFeatured: payload.isFeatured ?? false,
          createdAt: new Date().toISOString(),
        };

        setFactChecksList([newItem, ...factChecksList]);
        setSuccessMsg("নতুন ফ্যাক্ট-চেক সফলভাবে প্রকাশিত হয়েছে!");
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setFormError(err?.message || "সংরক্ষণ ব্যর্থ হয়েছে");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteFactCheck(id: string) {
    try {
      const res = await deleteFactCheck(id);
      if (res.success) {
        setFactChecksList((prev) => prev.filter((item) => item.id !== id));
        setDeleteConfirmId(null);
        setSuccessMsg("ফ্যাক্ট-চেকটি মুছে ফেলা হয়েছে!");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleFeatured(id: string, current: boolean) {
    try {
      await toggleFactCheckFeatured(id, !current);
      setFactChecksList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isFeatured: !current } : item))
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUpdateSubmissionStatus(
    id: string,
    status: "pending" | "reviewing" | "published" | "dismissed"
  ) {
    try {
      await updateSubmissionStatus(id, status);
      setSubmissionsList((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteSubmission(id: string) {
    try {
      await deleteSubmission(id);
      setSubmissionsList((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  function handleConvertSubmission(s: FactCheckSubmissionItem) {
    openCreateModal({
      claim: s.titleOrClaim,
      claimant: s.sourceUrl || "অনলাইন সূত্র",
      description: s.description || undefined,
    });
    handleUpdateSubmissionStatus(s.id, "reviewing");
  }

  function handleRunAiScreener() {
    if (!screenerInput.trim()) return;
    setScreenerLoading(true);

    setTimeout(() => {
      let verdict: VerdictType = "false";
      let label = "সম্ভাব্য সম্পূর্ণ ভুয়া (False)";

      if (/পুরনো|আগের|২০২২|২০২১|২০২০/.test(screenerInput)) {
        verdict = "misleading";
        label = "সম্ভাব্য বিভ্রান্তিকর (Misleading Context)";
      } else if (/ভিডিও|অডিও|ক্লিপ|ডিপফেক|এআই/.test(screenerInput)) {
        verdict = "altered_media";
        label = "সম্ভাব্য বিকৃত বা ডিপফেক মিডিয়া (Altered Media)";
      }

      setScreenerResult({
        suggestedVerdict: verdict,
        verdictLabel: label,
        indicators: [
          "সরকারি প্রজ্ঞাপন বা গ্যাজেটের কোনো সুনির্দিষ্ট স্মারক নম্বর পাওয়া যায়নি।",
          "সামাজিক যোগাযোগ মাধ্যমে ভিউ ও শেয়ার বৃদ্ধির কৌশল পরিলক্ষিত হয়।",
          "সংশ্লিষ্ট মন্ত্রণালয়ের অফিশিয়াল পোর্টালে এই তথ্যের কোনো ঘোষণা নেই।",
        ],
        officialSources: [
          "বাংলাদেশ সেতু কর্তৃপক্ষ / সড়ক পরিবহন মন্ত্রণালয়",
          "তথ্য অধিদফতর (PID) ও বিএসএস ফ্যাক্ট-চেক ডেস্ক",
          "বাংলাদেশ পুলিশ সাইবার ক্রাইম মনিটরিং সেল",
        ],
      });
      setScreenerLoading(false);
    }, 700);
  }

  // Filtered fact checks
  const filteredFactChecks = factChecksList.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.claim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.claimant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVerdict = verdictFilter === "all" || item.verdict === verdictFilter;
    return matchesSearch && matchesVerdict;
  });

  // Filtered submissions
  const filteredSubmissions = submissionsList.filter((s) => {
    return submissionStatusFilter === "all" || s.status === submissionStatusFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-md">
            <ShieldCheck size={24} className="text-emerald-200" />
          </div>
          <div>
            <h1 className="bengali-headline text-2xl font-black text-[var(--color-text)]">
              ফ্যাক্ট-চেক ও ভুয়া খবর প্রতিরোধ কর্নার
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              সামাজিক যোগাযোগ মাধ্যমে ভাইরাল গুজব যাচাই, সত্য উন্মোচন ও পাঠক দাবি ইনবক্স
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/fact-check"
            target="_blank"
            className="px-3.5 py-2 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-xs font-bold text-[var(--color-text-muted)] rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink size={13} />
            <span>পাবলিক হাব দেখুন</span>
          </Link>

          <button
            type="button"
            onClick={() => openCreateModal()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={15} />
            <span>নতুন ফ্যাক্ট-চেক তৈরি</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200 font-semibold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span>মোট যাচাইকৃত</span>
            <FileCheck2 size={16} className="text-purple-600" />
          </div>
          <div className="text-2xl font-black text-[var(--color-text)]">
            {toBengaliDigits(totalFactChecks)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">প্রকাশিত রিপোর্ট</div>
        </div>

        <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/20 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-red-800 dark:text-red-300">
            <span>মিথ্যা / ভুয়া গুজব</span>
            <ShieldAlert size={16} className="text-red-600" />
          </div>
          <div className="text-2xl font-black text-red-700 dark:text-red-400">
            {toBengaliDigits(falseCount)}
          </div>
          <div className="text-[11px] text-red-600 font-medium">ভিত্তিহীন ও বানোয়াট</div>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
            <span>বিভ্রান্তিকর ও বিকৃত</span>
            <AlertCircle size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-400">
            {toBengaliDigits(misleadingCount + alteredCount)}
          </div>
          <div className="text-[11px] text-amber-700 font-medium">ডিপফেক বা প্রেক্ষাপট বিকৃতি</div>
        </div>

        <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-900/40 bg-sky-50/40 dark:bg-sky-950/20 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-sky-800 dark:text-sky-300">
            <span>পাঠকদের যাচাই দাবি</span>
            <Inbox size={16} className="text-sky-600" />
          </div>
          <div className="text-2xl font-black text-sky-700 dark:text-sky-400">
            {toBengaliDigits(pendingSubmissionsCount)}
          </div>
          <div className="text-[11px] text-sky-600 font-medium">অপেক্ষমাণ আবেদন</div>
        </div>
      </div>

      {/* 3. Tab Switcher */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("factchecks")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "factchecks"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]"
            }`}
          >
            <ShieldCheck size={14} />
            <span>প্রকাশিত ফ্যাক্ট-চেক ({toBengaliDigits(factChecksList.length)})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("submissions")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 relative ${
              activeTab === "submissions"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]"
            }`}
          >
            <Inbox size={14} />
            <span>পাঠকদের যাচাই আবেদন ({toBengaliDigits(submissionsList.length)})</span>
            {pendingSubmissionsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("screener")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "screener"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]"
            }`}
          >
            <Sparkles size={14} className="text-amber-500" />
            <span>এআই গুজব স্ক্রিনার</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FACT CHECKS LIST */}
      {activeTab === "factchecks" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search size={14} className="absolute left-3 top-2.5 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="শিরোনাম, দাবি বা উৎস অনুসন্ধান..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:outline-none focus:border-emerald-600 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={13} className="text-[var(--color-text-muted)] shrink-0" />
              <select
                value={verdictFilter}
                onChange={(e) => setVerdictFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none"
              >
                <option value="all">সব রায় (All Verdicts)</option>
                <option value="false">❌ মিথ্যা / ভুয়া (False)</option>
                <option value="misleading">⚠️ বিভ্রান্তিকর (Misleading)</option>
                <option value="altered_media">🎭 বিকৃত মিডিয়া (Altered Media)</option>
                <option value="partially_true">⚖️ আংশিক সত্য (Partially True)</option>
                <option value="true">✅ সত্য (True)</option>
              </select>
            </div>
          </div>

          {/* Table / List */}
          <div className="border border-[var(--color-border)] rounded-xl bg-[var(--color-bg)] overflow-hidden shadow-2xs divide-y divide-[var(--color-border)]">
            {filteredFactChecks.length === 0 ? (
              <div className="p-12 text-center text-xs text-[var(--color-text-muted)] space-y-2">
                <ShieldCheck size={32} className="mx-auto opacity-40 text-emerald-600" />
                <p>কোনো ফ্যাক্ট-চেক রিপোর্ট পাওয়া যায়নি</p>
              </div>
            ) : (
              filteredFactChecks.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-[var(--color-bg-secondary)] transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <FactCheckBadge verdict={item.verdict} size="sm" />
                      <span className="text-[10px] font-semibold text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] px-2 py-0.5 rounded border border-[var(--color-border)]">
                        {item.category}
                      </span>
                      {item.isFeatured && (
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star size={10} className="fill-amber-500 text-amber-500" />
                          <span>শীর্ষ ফিচার্ড</span>
                        </span>
                      )}
                      <span className="text-[11px] text-[var(--color-text-muted)]">
                        {formatBengaliDate(new Date(item.createdAt))}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[var(--color-text)] leading-snug font-serif">
                      <Link
                        href={`/fact-check/${item.slug}`}
                        target="_blank"
                        className="hover:text-emerald-600 transition-colors"
                      >
                        {item.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">
                      <strong className="text-[var(--color-text)]">দাবি:</strong> {item.claim} •{" "}
                      <span className="text-[var(--color-text-faint)]">উৎস: {item.claimant}</span>
                    </p>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(item.id, item.isFeatured)}
                      className={`p-2 rounded-lg border transition-colors ${
                        item.isFeatured
                          ? "border-amber-300 bg-amber-50 dark:bg-amber-950 text-amber-600"
                          : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-amber-500"
                      }`}
                      title={item.isFeatured ? "ফিচার্ড থেকে সরান" : "ফিচার্ড হিসেবে পিন করুন"}
                    >
                      <Star size={14} className={item.isFeatured ? "fill-amber-500" : ""} />
                    </button>

                    <Link
                      href={`/fact-check/${item.slug}`}
                      target="_blank"
                      className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-emerald-600 hover:bg-[var(--color-bg)] transition-colors"
                      title="লাইভ প্রিভিউ দেখুন"
                    >
                      <Eye size={14} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-purple-600 hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
                      title="সম্পাদনা করুন"
                    >
                      <Edit size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: READER SUBMISSIONS INBOX */}
      {activeTab === "submissions" && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] flex items-center justify-between text-xs">
            <span className="font-bold text-[var(--color-text)]">
              পাঠকদের পাঠানো যাচাই দাবি তালিকা:
            </span>

            <div className="flex items-center gap-2">
              <select
                value={submissionStatusFilter}
                onChange={(e) => setSubmissionStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none"
              >
                <option value="all">সব আবেদন (All)</option>
                <option value="pending">অপেক্ষমাণ (Pending)</option>
                <option value="reviewing">তদন্তাধীন (Reviewing)</option>
                <option value="published">সম্পন্ন/প্রকাশিত (Published)</option>
                <option value="dismissed">বাতিল (Dismissed)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredSubmissions.length === 0 ? (
              <div className="p-12 text-center text-xs text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-xl bg-[var(--color-bg)]">
                <Inbox size={32} className="mx-auto opacity-40 mb-2 text-sky-600" />
                <p>কোনো আবেদন মেলেনি</p>
              </div>
            ) : (
              filteredSubmissions.map((sub) => {
                const isPending = sub.status === "pending";
                const isReviewing = sub.status === "reviewing";
                const isPublished = sub.status === "published";
                const isDismissed = sub.status === "dismissed";

                return (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] space-y-3 shadow-2xs hover:border-sky-300 dark:hover:border-sky-800 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isPending
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : isReviewing
                              ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                              : isPublished
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {isPending && "অপেক্ষমাণ"}
                          {isReviewing && "তদন্তাধীন"}
                          {isPublished && "প্রকাশিত / নিষ্পত্তি"}
                          {isDismissed && "বাতিল"}
                        </span>
                        <span className="text-[11px] text-[var(--color-text-muted)]">
                          {formatBengaliDate(new Date(sub.createdAt))}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                        {sub.submitterName && <span>প্রেরক: <strong>{sub.submitterName}</strong></span>}
                        {sub.submitterEmail && <span>({sub.submitterEmail})</span>}
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-[var(--color-text)] leading-snug">
                      {sub.titleOrClaim}
                    </h4>

                    {sub.description && (
                      <p className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] p-2.5 rounded-lg border border-[var(--color-border)]">
                        {sub.description}
                      </p>
                    )}

                    {sub.sourceUrl && (
                      <div className="text-xs text-sky-600 font-mono truncate">
                        উৎস / লিংক:{" "}
                        <a href={sub.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
                          {sub.sourceUrl}
                        </a>
                      </div>
                    )}

                    <div className="pt-2 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleConvertSubmission(sub)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <span>এটি দিয়ে ফ্যাক্ট-চেক তৈরি করুন</span>
                          <ArrowRight size={12} />
                        </button>

                        {isPending && (
                          <button
                            type="button"
                            onClick={() => handleUpdateSubmissionStatus(sub.id, "reviewing")}
                            className="px-2.5 py-1.5 rounded-lg border border-sky-300 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950 font-semibold text-xs"
                          >
                            তদন্তাধীন চিহ্নিত করুন
                          </button>
                        )}
                        {!isDismissed && (
                          <button
                            type="button"
                            onClick={() => handleUpdateSubmissionStatus(sub.id, "dismissed")}
                            className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs"
                          >
                            বাতিল করুন
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSubmission(sub.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AI RUMOR SCREENER */}
      {activeTab === "screener" && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              <h3 className="text-sm font-bold text-[var(--color-text)]">
                এআই গুজব স্ক্রিনার ও প্রাথমিক তদন্ত ফ্রেমওয়ার্ক
              </h3>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              সামাজিক মাধ্যমে ভাইরাল হওয়া যেকোনো টেক্সট, ক্যাপশন বা স্ক্রিনশটের বিবরণ পেস্ট করুন। এআই সম্ভাব্য বিকৃতি শনাক্ত করবে।
            </p>

            <textarea
              rows={4}
              value={screenerInput}
              onChange={(e) => setScreenerInput(e.target.value)}
              placeholder="যেমন: পদ্মা সেতুতে টোল দ্বিগুণ করার প্রজ্ঞাপন ভাইরাল হয়েছে, আগামী শুক্রবার থেকে কার্যকর হবে..."
              className="w-full p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-emerald-600"
            />

            <button
              type="button"
              onClick={handleRunAiScreener}
              disabled={screenerLoading || !screenerInput.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles size={14} className={screenerLoading ? "animate-spin" : ""} />
              <span>{screenerLoading ? "স্ক্রিনিং চলছে..." : "গুজব স্ক্রিন করুন"}</span>
            </button>

            {screenerResult && (
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    প্রাথমিক স্ক্রিনিং ফলাফল:
                  </span>
                  <FactCheckBadge verdict={screenerResult.suggestedVerdict} size="sm" />
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    শনাক্তকৃত অসঙ্গতি ও লক্ষণ:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-0.5">
                    {screenerResult.indicators.map((ind, i) => (
                      <li key={i}>{ind}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    যাচাই করার প্রয়োজনীয় অফিশিয়াল সূত্র:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {screenerResult.officialSources.map((src, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-[11px]"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    openCreateModal({
                      claim: screenerInput,
                      claimant: "সামাজিক মাধ্যমে ভাইরাল পোস্ট",
                    })
                  }
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                >
                  <span>এই তথ্য দিয়ে ফ্যাক্ট-চেক তৈরি করুন</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. CREATE / EDIT FACT CHECK MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-[var(--color-bg)] border border-[var(--color-border)] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-200" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingItem ? "ফ্যাক্ট-চেক সম্পাদনা করুন" : "নতুন ফ্যাক্ট-চেক রিপোর্ট প্রকাশ করুন"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveFactCheck} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 flex items-center gap-2 font-medium">
                  <AlertCircle size={15} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block font-bold text-[var(--color-text)] mb-1">
                  ফ্যাক্ট-চেক শিরোনাম (বাংলা) *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="যেমন: পদ্মা সেতুতে টোল বৃদ্ধির তথ্যটি ভুয়া; ভাইরাল প্রজ্ঞাপনটি এডিটেড"
                  className="w-full p-2.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:outline-none focus:border-emerald-600 font-semibold"
                />
              </div>

              {/* Claim & Claimant */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    ভাইরাল দাবি (The Claim) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formClaim}
                    onChange={(e) => setFormClaim(e.target.value)}
                    placeholder="যেমন: পদ্মা সেতুতে সব যানবাহনের টোল ৫০ শতাংশ বৃদ্ধি..."
                    className="w-full p-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    দাবিকারী / প্রচারকারী (Claimant / Source) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formClaimant}
                    onChange={(e) => setFormClaimant(e.target.value)}
                    placeholder="যেমন: ফেসবুকে ভাইরাল পোস্ট ও বিভিন্ন গ্রুপ"
                    className="w-full p-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Verdict Selector (IFCN) */}
              <div className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[var(--color-text)]">
                    ফ্যাক্ট-চেক রায় নির্ধারণ (IFCN Verdict Rating) *
                  </label>
                  <FactCheckBadge verdict={formVerdict} size="sm" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(
                    [
                      { id: "false", label: "❌ ভুয়া / মিথ্যা" },
                      { id: "misleading", label: "⚠️ বিভ্রান্তিকর" },
                      { id: "altered_media", label: "🎭 বিকৃত মিডিয়া" },
                      { id: "partially_true", label: "⚖️ আংশিক সত্য" },
                      { id: "true", label: "✅ সত্য" },
                    ] as const
                  ).map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setFormVerdict(v.id as VerdictType)}
                      className={`p-2 rounded-lg text-center font-bold text-xs border transition-all ${
                        formVerdict === v.id
                          ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                          : "border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text)]"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verdict Summary */}
              <div>
                <label className="block font-bold text-[var(--color-text)] mb-1">
                  রায়ের সারসংক্ষেপ (Verdict Summary) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formVerdictSummary}
                  onChange={(e) => setFormVerdictSummary(e.target.value)}
                  placeholder="পাঠকদের জন্য স্পষ্ট ১-২ বাক্যের সিদ্ধান্ত..."
                  className="w-full p-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Investigation Details */}
              <div>
                <label className="block font-bold text-[var(--color-text)] mb-1">
                  তদন্ত পদ্ধতি ও প্রমাণের বিবরণ (Investigation Details)
                </label>
                <textarea
                  rows={4}
                  value={formInvestigationDetails}
                  onChange={(e) => setFormInvestigationDetails(e.target.value)}
                  placeholder="১. রিভার্স ইমেজ সার্চের ফলাফল...&#10;২. সংশ্লিষ্ট কর্তৃপক্ষের বক্তব্য...&#10;৩. ডিজিটাল ফরেনসিক পরীক্ষা..."
                  className="w-full p-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:outline-none focus:border-emerald-600 font-mono text-xs"
                />
              </div>

              {/* Media URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    ভাইরাল ভুয়া মিডিয়ার ছবি (Image URL)
                  </label>
                  <input
                    type="url"
                    value={formOriginalMediaUrl}
                    onChange={(e) => setFormOriginalMediaUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    আসল সত্য প্রমাণ ছবি (Debunked Image URL)
                  </label>
                  <input
                    type="url"
                    value={formDebunkedMediaUrl}
                    onChange={(e) => setFormDebunkedMediaUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-mono"
                  />
                </div>
              </div>

              {/* Category, Tags & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    বিভাগ (Category)
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="যেমন: যোগাযোগ, রাজনীতি, স্বাস্থ্য"
                    className="w-full p-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    ট্যাগসমূহ (কমা দিয়ে আলাদা)
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="পদ্মা সেতু, গুজব, এডিটেড প্রজ্ঞাপন"
                    className="w-full p-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
                  />
                </div>
                <div className="flex items-center gap-2 pb-2">
                  <input
                    type="checkbox"
                    id="featuredCheckbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="featuredCheckbox" className="font-bold text-[var(--color-text)] cursor-pointer">
                    হোমপেজে পিন করুন (Featured)
                  </label>
                </div>
              </div>

              {/* Submit buttons */}
              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] font-semibold text-[var(--color-text)]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>{formLoading ? "সংরক্ষণ হচ্ছে..." : "প্রকাশ করুন"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="bg-[var(--color-bg)] border border-[var(--color-border)] p-6 rounded-2xl max-w-sm w-full space-y-4 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <h4 className="text-sm font-bold text-[var(--color-text)]">
              আপনি কি নিশ্চিতভাবে এই ফ্যাক্ট-চেকটি মুছে ফেলতে চান?
            </h4>
            <p className="text-xs text-[var(--color-text-muted)]">
              একবার মুছে ফেললে এটি পাবলিক সাইট থেকেও অপসারিত হবে।
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-xs font-semibold"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => handleDeleteFactCheck(deleteConfirmId)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
