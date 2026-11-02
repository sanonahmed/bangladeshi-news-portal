"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Wand2,
  Copy,
  Check,
  Send,
  SpellCheck,
  FileText,
  Clock,
  ArrowRight,
  RotateCcw,
  Tag,
  MapPin,
  Share2,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import {
  generateAiArticleAssistance,
  proofreadBengaliText,
  type AiAssistanceResult,
  type AiHeadlineOption,
  type ProofreadResult,
} from "@/actions/ai-assistant";

export function AiAssistantHubClient() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [proofreadLoading, setProofreadLoading] = useState(false);
  const [result, setResult] = useState<AiAssistanceResult | null>(null);
  const [proofreadResult, setProofreadResult] = useState<ProofreadResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"headlines" | "excerpt" | "tags" | "proofread">("headlines");

  async function handleAnalyze() {
    if (!content.trim() && !title.trim()) {
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await generateAiArticleAssistance({
        title,
        content,
        notes,
      });
      setResult(res);
      setActiveTab("headlines");
    } catch (err) {
      console.error("AI Assistant Error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleProofread() {
    if (!content.trim()) return;
    setProofreadLoading(true);
    try {
      const res = await proofreadBengaliText(content);
      setProofreadResult(res);
      setActiveTab("proofread");
    } catch (err) {
      console.error("Proofread Error:", err);
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

  function handleSendToNewArticle(opt?: AiHeadlineOption) {
    const selectedTitle = opt ? opt.headline : (result?.headlines[0]?.headline || title);
    const selectedTitleEn = opt ? opt.headlineEn : (result?.headlines[0]?.headlineEn || "");
    const selectedSlug = opt ? opt.slug : (result?.headlines[0]?.slug || "");
    const selectedExcerpt = result ? result.excerpt : "";

    const draftData = {
      title: selectedTitle,
      titleEn: selectedTitleEn,
      slug: selectedSlug,
      excerpt: selectedExcerpt,
      content: content,
      newsLocation: result?.detectedLocation?.districtName || "ঢাকা",
      savedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem("barta_draft_article_new", JSON.stringify(draftData));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }

    router.push("/admin/articles/new");
  }

  function handleApplyCleanedText() {
    if (proofreadResult) {
      setContent(proofreadResult.cleanedText);
    }
  }

  function loadSamplePressRelease() {
    setTitle("ব্যাংক সংস্কার ও মূল্যস্ফীতি নিয়ন্ত্রণে সরকারের নতুন রোডম্যাপ");
    setContent(
      "দেশের সামগ্রিক অর্থনীতিতে স্থিতিশীলতা ফেরাতে এবং সাধারণ মানুষের ওপর নিত্যপ্রয়োজনীয় পণ্যের চাপ কমাতে ১০ দফা অগ্রাধিকারমূলক কর্মপরিকল্পনা ঘোষণা করেছে অন্তর্বর্তী সরকার। এতে ব্যাংক খাতের কাঠামোগত সংস্কার, কর ব্যবস্থার আধুনিকায়ন এবং বৈদেশিক মুদ্রার রিজার্ভ সুসংহত করার বিষয়গুলো বিশেষ গুরুত্ব পেয়েছে। একইসঙ্গে শীর্ষ ঋণখেলাপিদের বিরুদ্ধে কঠোর আইনি ব্যবস্থা গ্রহণের সিদ্ধান্ত নেওয়া হয়েছে।"
    );
    setNotes("জাতীয় প্রথম পাতার উপযোগী আকর্ষণীয় শিরোনাম ও সংক্ষিপ্ত বুলেটিন");
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Title & Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Sparkles size={22} className="text-amber-300 animate-pulse" />
          </div>
          <div>
            <h1 className="bengali-headline text-2xl font-black text-[var(--color-text)]">
              এআই বাংলা সম্পাদকীয় ল্যাব ও সহকারী
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              আকর্ষণীয় বাংলা শিরোনাম, এসইও সারসংক্ষেপ, সোশ্যাল ক্যাপশন ও বানান শুদ্ধীকরণ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSamplePressRelease}
            className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text-muted)] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Lightbulb size={13} className="text-amber-500" />
            <span>ডেমো ড্রাফট লোড করুন</span>
          </button>

          <Link
            href="/admin/articles/new"
            className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <FileText size={14} />
            <span>নতুন সংবাদ লিখুন</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Input Column & Results Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input Workbench (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] flex items-center gap-1.5">
                <FileText size={14} className="text-purple-600" />
                <span>ড্রাফট ইনপুট ও নির্দেশনা</span>
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)]">
                {content.length} অক্ষর
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                প্রাথমিক শিরোনাম (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: মিরপুরে টেস্ট ম্যাচের তৃতীয় দিনের খেলা..."
                className="w-full p-2.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-semibold focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                সংবাদের খসড়া, প্রেস রিলিজ বা মূল বিষয়বস্তু *
              </label>
              <textarea
                rows={9}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="এখানে সংবাদের বিস্তারিত তথ্য, বক্তব্যের নোট বা প্রেস রিলিজের টেক্সট পেস্ট করুন..."
                className="w-full p-3 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs leading-relaxed focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                এআই-এর জন্য বিশেষ নোট (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="যেমন: অর্থনৈতিক গুরুত্ব প্রাধান্য দিন, সাধারণ মানুষের প্রতিক্রিয়া..."
                className="w-full p-2.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-purple-600"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading || (!content.trim() && !title.trim())}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <Wand2 size={15} className={loading ? "animate-spin" : ""} />
                <span>{loading ? "এআই বিশ্লেষণ করছে..." : "স্মার্ট শিরোনাম ও সারসংক্ষেপ তৈরি করুন"}</span>
              </button>

              <button
                type="button"
                onClick={handleProofread}
                disabled={proofreadLoading || !content.trim()}
                className="shrink-0 p-2.5 border border-purple-300 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 transition-colors flex items-center gap-1 cursor-pointer"
                title="বানান ও যুক্তাক্ষর প্রুফরিডার"
              >
                <SpellCheck size={16} className={proofreadLoading ? "animate-spin" : ""} />
                <span className="sm:hidden">প্রুফরিড</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Output Showcase (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Results Display */}
          {result ? (
            <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] space-y-5 shadow-xs animate-in fade-in duration-200">
              
              {/* Tabs */}
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("headlines")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === "headlines"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]"
                    }`}
                  >
                    স্মার্ট শিরোনাম ({result.headlines.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("excerpt")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === "excerpt"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]"
                    }`}
                  >
                    সারসংক্ষেপ ও সোশ্যাল
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tags")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === "tags"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]"
                    }`}
                  >
                    ট্যাগ ও জেলা
                  </button>
                  {proofreadResult && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("proofread")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === "proofread"
                          ? "bg-purple-600 text-white shadow-xs"
                          : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]"
                      }`}
                    >
                      প্রুফরিড ({proofreadResult.correctionsCount})
                    </button>
                  )}
                </div>

                <span className="text-[11px] text-purple-700 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                  {result.modelUsed}
                </span>
              </div>

              {/* Tab 1: Headlines */}
              {activeTab === "headlines" && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--color-text)]">
                      আপনার খসড়ার জন্য ৪টি স্টাইলের শিরোনাম বিকল্প:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSendToNewArticle()}
                      className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                    >
                      <span>নতুন সংবাদে নিয়ে যান</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {result.headlines.map((item) => {
                      const isCopied = copiedKey === item.id;
                      return (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-purple-400 dark:hover:border-purple-600 transition-all space-y-2 group"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                              {item.styleLabel}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleCopy(item.headline, item.id)}
                                className="text-xs text-[var(--color-text-muted)] hover:text-purple-600 flex items-center gap-1"
                              >
                                {isCopied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                <span>{isCopied ? "কপি হয়েছে" : "কপি"}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSendToNewArticle(item)}
                                className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                              >
                                <span>এটি দিয়ে সংবাদ তৈরি</span>
                                <ArrowRight size={11} />
                              </button>
                            </div>
                          </div>

                          <h3 className="text-sm sm:text-base font-bold text-[var(--color-text)] leading-snug font-serif">
                            {item.headline}
                          </h3>

                          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                            {item.explanation}
                          </p>

                          <div className="text-[11px] text-[var(--color-text-faint)] font-mono flex items-center gap-2 pt-1 border-t border-[var(--color-border)]/60">
                            <span className="text-[var(--color-text-muted)] font-sans">ইংরেজি:</span>
                            <span className="truncate">{item.headlineEn}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 2: Excerpt & Social */}
              {activeTab === "excerpt" && (
                <div className="space-y-4">
                  {/* Excerpt */}
                  <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--color-text)]">
                        সারসংক্ষেপ ও গুগল সার্চ লিড (Excerpt):
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(result.excerpt, "excerpt")}
                        className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                      >
                        {copiedKey === "excerpt" ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedKey === "excerpt" ? "কপি হয়েছে" : "কপি করুন"}</span>
                      </button>
                    </div>
                    <p className="text-xs text-[var(--color-text)] leading-relaxed p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                      {result.excerpt}
                    </p>
                  </div>

                  {/* Social Caption */}
                  <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-900/40 bg-sky-50/50 dark:bg-sky-950/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
                        <Share2 size={13} />
                        <span>সোশ্যাল মিডিয়া রেডি ক্যাপশন (Facebook & X)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(result.socialTeaser, "social")}
                        className="text-xs text-sky-700 dark:text-sky-400 hover:underline flex items-center gap-1"
                      >
                        {copiedKey === "social" ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedKey === "social" ? "কপি হয়েছে" : "কপি ক্যাপশন"}</span>
                      </button>
                    </div>
                    <pre className="text-xs text-[var(--color-text)] whitespace-pre-wrap font-sans bg-[var(--color-bg)] p-3 rounded-lg border border-sky-200 dark:border-sky-900/50">
                      {result.socialTeaser}
                    </pre>
                  </div>

                  {/* Key Takeaways */}
                  <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] space-y-2">
                    <span className="text-xs font-bold text-[var(--color-text)]">
                      সংবাদের মূল ৩টি তথ্য (Key Takeaways):
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
                  {result.detectedLocation && (
                    <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 flex items-center gap-3">
                      <MapPin size={18} className="text-amber-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                          শনাক্তকৃত সংবাদ এলাকা: {result.detectedLocation.districtName}
                        </p>
                        <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                          {result.detectedLocation.divisionName} বিভাগের অধীন
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] space-y-2">
                    <span className="text-xs font-bold text-[var(--color-text)]">
                      বিষয়ভিত্তিক প্রস্তাবিত ট্যাগ:
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {result.suggestedTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                        >
                          <Tag size={11} />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Proofread */}
              {activeTab === "proofread" && proofreadResult && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                        {proofreadResult.correctionsCount > 0
                          ? `${proofreadResult.correctionsCount}টি বানান ও ব্যাকরণ ত্রুটি সংশোধন করা হয়েছে!`
                          : "কোনো বানান ত্রুটি পাওয়া যায়নি!"}
                      </h4>
                      <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                        বাংলা একাডেমি প্রমিত বানানরীতি অনুসারী।
                      </p>
                    </div>

                    {proofreadResult.correctionsCount > 0 && (
                      <button
                        type="button"
                        onClick={handleApplyCleanedText}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                      >
                        ড্রাফটে প্রয়োগ করুন
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
          ) : (
            /* Blank state guide card */
            <div className="p-8 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
                <Sparkles size={24} />
              </div>
              <h3 className="text-sm font-bold text-[var(--color-text)]">
                বাম পাশের বক্সে খসড়া লিখে এআই বিশ্লেষণ শুরু করুন
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto leading-relaxed">
                আমাদের বাংলা নিউজরুম এআই আপনার সংবাদের জন্য ৪টি শৈলীর শিরোনাম (সম্পাদকীয়, ব্রেকিং, নাগরিক দৃষ্টিকোণ ও বিশ্লেষণ), গুগল এসইও সারসংক্ষেপ, সোশ্যাল পোস্ট ও যুক্তাক্ষর প্রুফরিড প্রস্তুত করবে।
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
