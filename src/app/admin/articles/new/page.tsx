"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createArticle } from "@/actions/articles";
import { getCategories, type CategoryItem } from "@/actions/categories";
import { TiptapEditor } from "@/components/admin/editor/TiptapEditor";
import { ArrowLeft, Send, AlertCircle, CheckCircle2, Image as ImageIcon } from "lucide-react";

export default function NewArticlePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);
  const [status, setStatus] = useState<"draft" | "pending_review" | "published">("published");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [featuredImageAlt, setFeaturedImageAlt] = useState("");
  const [newsLocation, setNewsLocation] = useState("ঢাকা");
  const [isBreaking, setIsBreaking] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getCategories()
      .then((cats) => {
        setCategoriesList(cats);
        if (cats.length > 0 && cats[0]?.id) {
          setCategoryId(cats[0].id);
        }
      })
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slug) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated || `news-${Date.now()}`);
    }
  }

  function handleTitleEnChange(val: string) {
    setTitleEn(val);
    const generated = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (generated) {
      setSlug(generated);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("সংবাদের মূল শিরোনাম আবশ্যক");
      return;
    }
    if (!content.trim()) {
      setError("সংবাদের বিস্তারিত বিষয়বস্তু লিখুন");
      return;
    }

    setLoading(true);
    try {
      const finalSlug = slug.trim() || `barta-${Date.now()}`;
      const res = await createArticle({
        title: title.trim(),
        titleEn: titleEn.trim() || undefined,
        slug: finalSlug,
        excerpt: excerpt.trim() || undefined,
        content,
        categoryId: categoryId || undefined,
        status,
        featuredImageUrl: featuredImageUrl.trim() || undefined,
        featuredImageAlt: featuredImageAlt.trim() || undefined,
        newsLocation: newsLocation.trim() || undefined,
        isBreaking,
        isFeatured,
        seoTitle: seoTitle.trim() || title.trim(),
        seoDescription: seoDescription.trim() || excerpt.trim(),
        language: "bn",
      });

      if (!res.success) {
        setError(res.error || "সংবাদ সংরক্ষণ ব্যর্থ হয়েছে");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/articles");
          router.refresh();
        }, 1200);
      }
    } catch (err: any) {
      setError(err?.message || "সার্ভার এরর ঘটেছে");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="p-1.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="bengali-headline text-xl font-bold text-[var(--color-text)]">
              নতুন সংবাদ তৈরি করুন
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              জাতীয় ও আন্তর্জাতিক প্রতিবেদন রচনা ও সরাসরি প্রকাশনা
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setStatus("draft");
            }}
            className="px-4 py-2 border border-[var(--color-border)] text-xs font-semibold hover:bg-[var(--color-bg-secondary)]"
          >
            খসড়া হিসেবে রাখুন
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Send size={14} />
            {loading ? "সংরক্ষণ হচ্ছে..." : "সংবাদ প্রকাশ করুন"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border-l-4 border-red-600 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-600 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span>সংবাদ সফলভাবে প্রকাশিত হয়েছে! সংবাদ তালিকায় রিডাইরেক্ট করা হচ্ছে...</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Editor: 8 Columns */}
        <div className="lg:col-span-8 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              সংবাদের মূল শিরোনাম (বাংলা) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="আকর্ষণীয় ও বস্তুনিষ্ঠ শিরোনাম লিখুন..."
              className="w-full p-3 bg-[var(--color-bg)] border border-[var(--color-border)] text-base font-bold focus:outline-none focus:border-[var(--color-primary)] bengali-headline"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              ইংরেজি শিরোনাম (English Title / Slug Generator)
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => handleTitleEnChange(e.target.value)}
              placeholder="e.g. Bangladesh wins series opener at Mirpur..."
              className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              সংক্ষিপ্ত সারসংক্ষেপ (Excerpt)
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="সংবাদের মূল প্রতিপাদ্য ২/৩ লাইনে লিখুন..."
              className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              বিস্তারিত সংবাদ বিষয়বস্তু (Rich Article Body) *
            </label>
            <TiptapEditor
              content={content}
              onChange={(html) => setContent(html)}
              placeholder="এখানে বিস্তারিত সংবাদ লিখুন..."
            />
          </div>
        </div>

        {/* Sidebar Settings: 4 Columns */}
        <div className="lg:col-span-4 space-y-4">
          {/* Publishing Controls */}
          <div className="border border-[var(--color-border)] p-4 bg-[var(--color-bg)] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] border-b border-[var(--color-border)] pb-2">
              প্রকাশনা সেটিংস
            </h3>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                সংবাদ বিভাগ (Category) *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] font-medium"
              >
                {categoriesList.length === 0 ? (
                  <option value="">লোড হচ্ছে...</option>
                ) : (
                  categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.slug})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                অবস্থা (Status)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] font-medium"
              >
                <option value="published">সরাসরি প্রকাশ (Publish Now)</option>
                <option value="draft">খসড়া (Draft)</option>
                <option value="pending_review">অনুমোদনের জন্য জমা (Review)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                সংবাদের অবস্থান (Location)
              </label>
              <input
                type="text"
                value={newsLocation}
                onChange={(e) => setNewsLocation(e.target.value)}
                placeholder="ঢাকা / চট্টগ্রাম / সিলেট / রাজশাহী..."
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="pt-2 space-y-2 border-t border-[var(--color-border)]">
              <label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="rounded text-[var(--color-primary)]"
                />
                <span>ব্রেকিং নিউজ টিকার-এ দেখান</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-[var(--color-primary)]"
                />
                <span>হোমপেজের শীর্ষ খবর (Lead Story)</span>
              </label>
            </div>
          </div>

          {/* Featured Image */}
          <div className="border border-[var(--color-border)] p-4 bg-[var(--color-bg)] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] border-b border-[var(--color-border)] pb-2 flex items-center gap-1.5">
              <ImageIcon size={14} className="text-[var(--color-primary)]" />
              মূল ছবি (Featured Image)
            </h3>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                ছবির URL (Unsplash / CDN / R2 লিংক)
              </label>
              <input
                type="url"
                value={featuredImageUrl}
                onChange={(e) => setFeaturedImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            {featuredImageUrl && (
              <div className="relative aspect-[16/9] w-full rounded border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-secondary)]">
                <img
                  src={featuredImageUrl}
                  alt={featuredImageAlt || "সংবাদ ছবি প্রিভিউ"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                ছবির ক্যাপশন ও ক্রেডিট
              </label>
              <input
                type="text"
                value={featuredImageAlt}
                onChange={(e) => setFeaturedImageAlt(e.target.value)}
                placeholder="ছবি: নিজস্ব আলোকচিত্রী / সংগৃহীত"
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          {/* URL Slug & SEO */}
          <div className="border border-[var(--color-border)] p-4 bg-[var(--color-bg)] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] border-b border-[var(--color-border)] pb-2">
              এসইও ও ইউআরএল (SEO)
            </h3>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                ইউআরএল স্লাগ (URL Slug) *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. bd-economic-stability-roadmap"
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-mono focus:outline-none focus:border-[var(--color-primary)]"
              />
              <p className="text-[10px] text-[var(--color-text-faint)] mt-1">
                লিংক হবে: /news/{slug || "slug"}
              </p>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                এসইও শিরোনাম (SEO Title)
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="গুগল সার্চে প্রদর্শিত শিরোনাম"
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
