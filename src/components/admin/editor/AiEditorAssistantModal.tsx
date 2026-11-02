"use client";

import { useState } from "react";
import {
  Sparkles,
  X,
  Check,
  Copy,
  Clock,
  Send,
  Wand2,
  CheckCircle2,
  SpellCheck,
  ChevronRight,
  Share2,
  Tag,
  MapPin,
} from "lucide-react";
import {
  generateAiArticleAssistance,
  proofreadBengaliText,
  type AiAssistanceResult,
  type AiHeadlineOption,
  type ProofreadResult,
} from "@/actions/ai-assistant";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

interface AiEditorAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  currentContent: string;
  onApplyTitle: (title: string, titleEn?: string, slug?: string) => void;
  onApplyExcerpt: (excerpt: string) => void;
  onApplyLocation?: (districtName: string) => void;
  onApplyCleanedContent?: (cleanedContent: string) => void;
}

export function AiEditorAssistantModal({
  isOpen,
  onClose,
  currentTitle,
  currentContent,
  onApplyTitle,
  onApplyExcerpt,
  onApplyLocation,
  onApplyCleanedContent,
}: AiEditorAssistantModalProps) {
  const { isEn, formatNumber } = useAdminLanguage();
  const [activeTab, setActiveTab] = useState<"headlines" | "excerpt" | "tags" | "proofread">("headlines");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [proofreadLoading, setProofreadLoading] = useState(false);
  const [result, setResult] = useState<AiAssistanceResult | null>(null);
  const [proofreadResult, setProofreadResult] = useState<ProofreadResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [appliedKey, setAppliedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleGenerate() {
    setLoading(true);
    setResult(null);
    try {
      const res = await generateAiArticleAssistance({
        title: currentTitle,
        content: currentContent,
        notes,
      });
      setResult(res);
      setActiveTab("headlines");
    } catch (err) {
      console.error("AI Generation error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleProofread() {
    setProofreadLoading(true);
    try {
      const res = await proofreadBengaliText(currentContent);
      setProofreadResult(res);
      setActiveTab("proofread");
    } catch (err) {
      console.error("Proofread error:", err);
    } finally {
      setProofreadLoading(false);
    }
  }

  function handleCopy(text: string, key: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  }

  function handleSelectHeadline(opt: AiHeadlineOption) {
    onApplyTitle(opt.headline, opt.headlineEn, opt.slug);
    setAppliedKey(opt.id);
    setTimeout(() => setAppliedKey(null), 2500);
  }

  function handleSelectExcerpt(excerptText: string) {
    onApplyExcerpt(excerptText);
    setAppliedKey("excerpt");
    setTimeout(() => setAppliedKey(null), 2500);
  }

  function handleSelectDistrict(district: string) {
    if (onApplyLocation) {
      onApplyLocation(district);
      setAppliedKey("district");
      setTimeout(() => setAppliedKey(null), 2500);
    }
  }

  function handleApplyProofread() {
    if (proofreadResult && onApplyCleanedContent) {
      onApplyCleanedContent(proofreadResult.cleanedText);
      setAppliedKey("proofread");
      setTimeout(() => setAppliedKey(null), 2500);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[var(--color-bg)] border border-[var(--color-border)] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-[var(--color-primary)] p-4 sm:p-5 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles size={20} className="text-amber-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight flex items-center gap-2">
                <span>{isEn ? "AI Newsroom Copilot & Editorial Assistant" : "এআই বাংলা সম্পাদকীয় সহকারী"}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-wider">
                  AI Copilot
                </span>
              </h2>
              <p className="text-xs text-white/80">
                {isEn
                  ? "Multi-angle headlines, SEO lead summaries, social snippets & grammar proofreader"
                  : "স্মার্ট শিরোনাম, এসইও সারসংক্ষেপ, সোশ্যাল পোস্ট ও যুক্তাক্ষর প্রুফরিডার"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
            aria-label={isEn ? "Close" : "বন্ধ করুন"}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Box */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Generator Card */}
          <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-purple-900 dark:text-purple-300">
                {isEn
                  ? "Generate from current story draft or editorial notes:"
                  : "বর্তমান সংবাদের ড্রাফট বা নোটস দিয়ে জেনারেট করুন:"}
              </span>
              <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
                <Clock size={12} />
                <span>
                  {currentContent
                    ? isEn
                      ? `Draft Length: ${formatNumber(currentContent.length)} characters`
                      : `লেখার দৈর্ঘ্য: ${formatNumber(currentContent.length)} অক্ষর`
                    : isEn
                    ? "No content written yet"
                    : "কোনো কনটেন্ট লেখা হয়নি"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    isEn
                      ? "Editorial guidance (e.g., focus on economic angles, youth perspective, breaking alert)..."
                      : "অতিরিক্ত নির্দেশনা (যেমন: তরুণদের দৃষ্টিকোণ থেকে, বা ব্রেকিং নোটিফিকেশনের উপযোগী)..."
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:outline-none focus:border-purple-600"
                />
              </div>
              <div className="sm:col-span-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Wand2 size={14} className={loading ? "animate-spin" : ""} />
                  <span>
                    {loading
                      ? isEn
                        ? "Analyzing..."
                        : "বিশ্লেষণ হচ্ছে..."
                      : isEn
                      ? "Generate with AI"
                      : "এআই তৈরি করুন"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleProofread}
                  disabled={proofreadLoading}
                  className="shrink-0 p-2 border border-purple-300 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg text-xs font-bold text-purple-800 dark:text-purple-300 transition-colors cursor-pointer"
                  title={isEn ? "Proofread spelling & grammar" : "বানান ও যুক্তাক্ষর পরীক্ষা"}
                >
                  <SpellCheck size={16} className={proofreadLoading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>
          </div>

          {/* Result Tabs Bar */}
          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("headlines")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      activeTab === "headlines"
                        ? "bg-[var(--color-primary)] text-white shadow-xs"
                        : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]"
                    }`}
                  >
                    {isEn ? `Headlines (${formatNumber(result.headlines.length)})` : `স্মার্ট শিরোনাম (${formatNumber(result.headlines.length)})`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("excerpt")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      activeTab === "excerpt"
                        ? "bg-[var(--color-primary)] text-white shadow-xs"
                        : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]"
                    }`}
                  >
                    {isEn ? "Summary & Social" : "সারসংক্ষেপ ও সোশ্যাল"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tags")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      activeTab === "tags"
                        ? "bg-[var(--color-primary)] text-white shadow-xs"
                        : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]"
                    }`}
                  >
                    {isEn ? "Tags & District" : "ট্যাগ ও জেলা"}
                  </button>
                  {proofreadResult && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("proofread")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        activeTab === "proofread"
                          ? "bg-[var(--color-primary)] text-white shadow-xs"
                          : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]"
                      }`}
                    >
                      {isEn
                        ? `Proofread (${formatNumber(proofreadResult.correctionsCount)})`
                        : `প্রুফরিডার (${formatNumber(proofreadResult.correctionsCount)})`}
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-2">
                  <span className="font-semibold text-purple-700 dark:text-purple-400">
                    {isEn ? `Model: ${result.modelUsed}` : `মডেল: ${result.modelUsed}`}
                  </span>
                  <span>•</span>
                  <span>
                    {isEn
                      ? `Reading time: ~${formatNumber(result.readingTimeMinutes)} min`
                      : `পড়ার সময়: ~${formatNumber(result.readingTimeMinutes)} মিনিট`}
                  </span>
                </div>
              </div>

              {/* Tab 1: Headlines */}
              {activeTab === "headlines" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {result.headlines.map((item) => {
                    const isApplied = appliedKey === item.id;
                    const isCopied = copiedKey === item.id;

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-purple-400 dark:hover:border-purple-600 transition-all flex flex-col justify-between space-y-2.5 shadow-2xs group"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                              {item.styleLabel}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(item.headline, item.id)}
                              className="text-[var(--color-text-muted)] hover:text-purple-600 text-[11px] flex items-center gap-1 cursor-pointer"
                              title={isEn ? "Copy" : "কপি করুন"}
                            >
                              {isCopied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                              <span>
                                {isCopied
                                  ? isEn
                                    ? "Copied"
                                    : "কপি হয়েছে"
                                  : isEn
                                  ? "Copy"
                                  : "কপি"}
                              </span>
                            </button>
                          </div>

                          <h3 className="text-sm font-bold text-[var(--color-text)] leading-snug font-serif">
                            {item.headline}
                          </h3>

                          <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                            {item.explanation}
                          </p>

                          <div className="text-[10px] text-[var(--color-text-faint)] font-mono truncate">
                            English: {item.headlineEn}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectHeadline(item)}
                          className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isApplied
                              ? "bg-emerald-600 text-white"
                              : "bg-[var(--color-bg-secondary)] hover:bg-purple-600 hover:text-white text-[var(--color-text)] border border-[var(--color-border)] hover:border-purple-600"
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <CheckCircle2 size={13} />
                              <span>{isEn ? "Applied to Headline!" : "শিরোনাম হিসেবে প্রয়োগ করা হয়েছে!"}</span>
                            </>
                          ) : (
                            <>
                              <ChevronRight size={13} />
                              <span>{isEn ? "Use as Headline" : "শিরোনামে সেট করুন"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab 2: Excerpt & Social */}
              {activeTab === "excerpt" && (
                <div className="space-y-4">
                  {/* Lead Excerpt Card */}
                  <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {isEn ? "SEO & Lead Excerpt" : "এসইও ও লিড সারসংক্ষেপ (Excerpt)"}
                      </span>
                      <span className="text-[11px] text-[var(--color-text-muted)]">
                        {isEn
                          ? `${formatNumber(result.excerpt.length)} characters (120-160 optimal)`
                          : `${formatNumber(result.excerpt.length)} অক্ষর (১২০-১৬০ অক্ষরের আদর্শ মাপ)`}
                      </span>
                    </div>

                    <p className="text-sm text-[var(--color-text)] leading-relaxed p-3 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                      {result.excerpt}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectExcerpt(result.excerpt)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {appliedKey === "excerpt" ? (
                          <>
                            <Check size={13} />
                            <span>{isEn ? "Applied!" : "প্রয়োগ সম্পন্ন হয়েছে!"}</span>
                          </>
                        ) : (
                          <>
                            <Send size={13} />
                            <span>{isEn ? "Use as Excerpt" : "সারসংক্ষেপে সেট করুন"}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(result.excerpt, "excerpt")}
                        className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text-muted)] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "excerpt" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        <span>
                          {copiedKey === "excerpt"
                            ? isEn
                              ? "Copied"
                              : "কপি হয়েছে"
                            : isEn
                            ? "Copy"
                            : "কপি"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Social Media Post Teaser */}
                  <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-900/40 bg-sky-50/50 dark:bg-sky-950/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
                        <Share2 size={13} />
                        <span>{isEn ? "Social Media Post Caption (Facebook / X)" : "সোশ্যাল মিডিয়া পোস্ট ক্যাপশন (ফেসবুক / এক্স)"}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(result.socialTeaser, "social")}
                        className="text-xs text-sky-700 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "social" ? <Check size={12} /> : <Copy size={12} />}
                        <span>
                          {copiedKey === "social"
                            ? isEn
                              ? "Copied"
                              : "কপি হয়েছে"
                            : isEn
                            ? "Copy Caption"
                            : "কপি ক্যাপশন"}
                        </span>
                      </button>
                    </div>

                    <pre className="text-xs text-[var(--color-text)] whitespace-pre-wrap font-sans bg-[var(--color-bg)] p-3 rounded-lg border border-sky-200 dark:border-sky-900/50">
                      {result.socialTeaser}
                    </pre>
                  </div>

                  {/* Key Takeaways */}
                  <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] space-y-2">
                    <span className="text-xs font-bold text-[var(--color-text)]">
                      {isEn ? "Key Takeaways (Top 3 facts):" : "সংবাদের মূল ৩টি তথ্য (Key Takeaways):"}
                    </span>
                    <ul className="list-disc list-inside text-xs text-[var(--color-text-muted)] space-y-1">
                      {result.keyTakeaways.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab 3: Tags & Location */}
              {activeTab === "tags" && (
                <div className="space-y-4">
                  {/* Location card */}
                  {result.detectedLocation && (
                    <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs">
                        <MapPin size={16} className="text-amber-600 shrink-0" />
                        <div>
                          <span className="font-bold text-amber-900 dark:text-amber-200">
                            {isEn
                              ? `Detected District: ${result.detectedLocation.districtName}`
                              : `শনাক্তকৃত জেলা: ${result.detectedLocation.districtName}`}
                          </span>
                          <span className="text-[11px] text-amber-800/80 dark:text-amber-300/80 ml-2">
                            {isEn
                              ? `(${result.detectedLocation.divisionName} Division)`
                              : `(${result.detectedLocation.divisionName} বিভাগ)`}
                          </span>
                        </div>
                      </div>

                      {onApplyLocation && (
                        <button
                          type="button"
                          onClick={() => handleSelectDistrict(result.detectedLocation!.districtName!)}
                          className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer"
                        >
                          {appliedKey === "district"
                            ? isEn
                              ? "Applied!"
                              : "প্রয়োগ সম্পন্ন!"
                            : isEn
                            ? "Set as District"
                            : "জেলায় সেট করুন"}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Suggested Tags */}
                  <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] space-y-3">
                    <span className="text-xs font-bold text-[var(--color-text)]">
                      {isEn ? "Suggested Tags:" : "প্রস্তাবিত ট্যাগসমূহ (Suggested Tags):"}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {result.suggestedTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60"
                        >
                          <Tag size={11} />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Proofreader */}
              {activeTab === "proofread" && proofreadResult && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                        {proofreadResult.correctionsCount > 0
                          ? isEn
                            ? `${formatNumber(proofreadResult.correctionsCount)} spelling & typographic issues detected and resolved!`
                            : `${formatNumber(proofreadResult.correctionsCount)}টি বানান ও ব্যাকরণ ত্রুটি শনাক্ত ও সমাধান করা হয়েছে!`
                          : isEn
                          ? "No spelling or grammar errors detected. Excellent prose quality!"
                          : "কোনো বানান ত্রুটি পাওয়া যায়নি! আপনার লেখার মান চমৎকার।"}
                      </h4>
                      <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                        {isEn
                          ? "Standardized Bangla Academy orthography and Unicode ligature normalization."
                          : "বাংলা একাডেমি প্রমিত বানানরীতি এবং ইউনিকোড অসংগতি দূরীকরণ।"}
                      </p>
                    </div>

                    {proofreadResult.correctionsCount > 0 && onApplyCleanedContent && (
                      <button
                        type="button"
                        onClick={handleApplyProofread}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                      >
                        {appliedKey === "proofread"
                          ? isEn
                            ? "Applied!"
                            : "সংশোধন সম্পন্ন!"
                          : isEn
                          ? "Apply to Editor"
                          : "এডিটরে প্রয়োগ করুন"}
                      </button>
                    )}
                  </div>

                  {proofreadResult.corrections.length > 0 && (
                    <div className="border border-[var(--color-border)] rounded-xl divide-y divide-[var(--color-border)] overflow-hidden">
                      {proofreadResult.corrections.map((item, idx) => (
                        <div key={idx} className="p-3 text-xs flex items-center justify-between gap-3 bg-[var(--color-bg)]">
                          <div className="flex items-center gap-2">
                            <span className="line-through text-red-500 font-bold">{item.before}</span>
                            <span>➔</span>
                            <span className="text-emerald-600 font-bold">{item.after}</span>
                          </div>
                          <span className="text-[11px] text-[var(--color-text-muted)] italic">
                            {item.reason}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Initial Blank State Prompt */}
          {!result && !loading && (
            <div className="text-center py-8 space-y-2 text-[var(--color-text-muted)]">
              <Sparkles size={32} className="mx-auto text-purple-400 opacity-60" />
              <p className="text-xs font-semibold text-[var(--color-text)]">
                {isEn
                  ? 'Click "Generate with AI" button above'
                  : 'উপরে "এআই তৈরি করুন" বাটনে ক্লিক করুন'}
              </p>
              <p className="text-[11px] max-w-md mx-auto">
                {isEn
                  ? "AI will analyze your story draft and automatically produce 4 headline styles, search-friendly excerpts, and district tags."
                  : "আপনার খসড়া থেকে এআই স্বয়ংক্রিয়ভাবে ৪টি শৈলীর বাংলা শিরোনাম, সার্চ-ইঞ্জিন বান্ধব সারসংক্ষেপ ও জেলাভিত্তিক ট্যাগ প্রস্তুত করবে।"}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] shrink-0 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <span>{isEn ? "Bangladesh Barta • AI Newsroom Intelligence" : "দৈনিক বাংলাদেশ বার্তা • এআই নিউজরুম ইন্টেলিজেন্স"}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg)] font-semibold text-[var(--color-text)] cursor-pointer"
          >
            {isEn ? "Close" : "বন্ধ করুন"}
          </button>
        </div>
      </div>
    </div>
  );
}
