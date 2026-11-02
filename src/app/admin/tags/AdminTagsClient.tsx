"use client";

import { useState } from "react";
import { Tag as TagIcon, Plus, Trash2, Search, Hash, AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { createAdminTag, deleteAdminTag, type TagWithArticleCount } from "@/actions/tags";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

interface AdminTagsClientProps {
  initialTags: TagWithArticleCount[];
}

export function AdminTagsClient({ initialTags }: AdminTagsClientProps) {
  const { language, formatNumber } = useAdminLanguage();
  const isEn = language === "en";

  const [tagsList, setTagsList] = useState<TagWithArticleCount[]>(initialTags);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filteredTags = tagsList.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.nameEn && t.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTaggedArticles = tagsList.reduce((acc, t) => acc + t.count, 0);

  async function handleCreateTag(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError(isEn ? "Tag name is required" : "ট্যাগের নাম আবশ্যক");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createAdminTag({
        name: name.trim(),
        nameEn: nameEn.trim() || undefined,
        slug: slug.trim() || undefined,
      });

      if (!res.success || !res.tag) {
        setError(res.error || (isEn ? "Failed to create tag" : "ট্যাগ তৈরি ব্যর্থ হয়েছে"));
      } else {
        setSuccess(
          isEn
            ? `Tag '#${res.tag.name}' created successfully`
            : `'#${res.tag.name}' ট্যাগ সফলভাবে তৈরি হয়েছে`
        );
        setTagsList((prev) => [
          {
            id: res.tag!.id,
            name: res.tag!.name,
            nameEn: res.tag!.nameEn,
            slug: res.tag!.slug,
            count: 0,
            createdAt: new Date(),
          },
          ...prev,
        ]);
        setName("");
        setNameEn("");
        setSlug("");
        setShowAddForm(false);
      }
    } catch (err: any) {
      setError(err?.message || (isEn ? "Server error occurred" : "সার্ভার এরর ঘটেছে"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(tagId: string, tagName: string) {
    const confirmMsg = isEn
      ? `Are you sure you want to permanently delete '#${tagName}'?`
      : `আপনি কি নিশ্চিত যে '#${tagName}' ট্যাগটি মুছে ফেলতে চান?`;
    if (!confirm(confirmMsg)) {
      return;
    }

    try {
      const res = await deleteAdminTag(tagId);
      if (res.success) {
        setTagsList((prev) => prev.filter((t) => t.id !== tagId));
      } else {
        alert(res.error || (isEn ? "Failed to delete tag" : "ট্যাগ মুছে ফেলতে সমস্যা হয়েছে"));
      }
    } catch (err) {
      alert(isEn ? "Server error occurred" : "সার্ভার এরর ঘটেছে");
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2 tracking-tight">
            <TagIcon size={24} className="text-[var(--color-primary)]" />
            <span>{isEn ? "Article Tags & Keywords Management" : "সংবাদ ট্যাগ ব্যবস্থাপনা"}</span>
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {isEn
              ? "Manage live database keywords and topic tags to interlink related news stories"
              : "সম্পর্কিত সংবাদগুলোকে সহজে খুঁজে পেতে ও একত্র করতে ডাটাবেজের লাইভ ট্যাগ কন্ট্রোল"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-3.5 py-2 rounded transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus size={15} />
          <span>{showAddForm ? (isEn ? "Close Form" : "ফর্ম বন্ধ করুন") : (isEn ? "Add New Tag" : "নতুন ট্যাগ যুক্ত করুন")}</span>
        </button>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-[var(--color-border)] p-4 bg-[var(--color-bg)] flex items-center gap-3 rounded">
          <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/40 text-[var(--color-primary)] flex items-center justify-center font-bold text-lg">
            <Hash size={20} />
          </div>
          <div>
            <div className="text-[11px] text-[var(--color-text-muted)] font-medium">
              {isEn ? "Total Active Tags" : "মোট সক্রিয় ট্যাগ"}
            </div>
            <div className="text-xl font-bold text-[var(--color-text)]">
              {formatNumber(tagsList.length)}
            </div>
          </div>
        </div>

        <div className="border border-[var(--color-border)] p-4 bg-[var(--color-bg)] flex items-center gap-3 rounded">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-lg">
            <FileText size={20} />
          </div>
          <div>
            <div className="text-[11px] text-[var(--color-text-muted)] font-medium">
              {isEn ? "Tagged Story Connections" : "ট্যাগযুক্ত সংবাদের সংযোগ"}
            </div>
            <div className="text-xl font-bold text-[var(--color-text)]">
              {formatNumber(totalTaggedArticles)}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-600 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border-l-4 border-red-600 text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Tag Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateTag}
          className="border border-[var(--color-border)] p-5 bg-[var(--color-bg)] space-y-4 rounded"
        >
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
            <h3 className="font-bold text-sm text-[var(--color-text)] flex items-center gap-1.5">
              <Plus size={16} className="text-[var(--color-primary)]" />
              <span>{isEn ? "Create New Tag" : "নতুন ট্যাগ তৈরি করুন"}</span>
            </h3>
            <span className="text-[11px] text-[var(--color-text-muted)]">
              {isEn ? "Saves directly to database" : "ডাটাবেজে যুক্ত হবে"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                {isEn ? "Tag Name (Bangla) *" : "ট্যাগের নাম (বাংলায়) *"}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isEn ? "e.g. বিশ্বকাপ ২০২৬" : "যেমন: বিশ্বকাপ ২০২৬"}
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] rounded"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                {isEn ? "English Name (Optional)" : "ইংরেজি নাম (ঐচ্ছিক)"}
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. World Cup 2026"
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] rounded"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                {isEn ? "URL Slug (Optional)" : "ইউআরএল স্লাগ (ঐচ্ছিক)"}
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. world-cup-2026"
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-bg)] text-xs font-mono text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] rounded"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] rounded cursor-pointer"
            >
              {isEn ? "Cancel" : "বাতিল"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-colors disabled:opacity-50 rounded cursor-pointer"
            >
              {isSubmitting ? (isEn ? "Saving..." : "সংরক্ষণ হচ্ছে...") : (isEn ? "Save Tag" : "ট্যাগ সংরক্ষণ করুন")}
            </button>
          </div>
        </form>
      )}

      {/* Tags Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-2.5 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? "Search tags by name or slug..." : "ট্যাগ নাম বা স্লাগ দিয়ে খুঁজুন..."}
            className="w-full pl-9 pr-4 py-2 border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] rounded"
          />
        </div>
      </div>

      {/* Live Tags Table */}
      <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] font-bold text-xs uppercase tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
          <span>
            {isEn ? `Live Tags in Database (${formatNumber(filteredTags.length)})` : `ডাটাবেজের লাইভ ট্যাগ তালিকা (${formatNumber(filteredTags.length)}টি)`}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {isEn ? "PostgreSQL Live" : "রিয়েল ডাটাবেজ"}
          </span>
        </div>

        {filteredTags.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--color-text-muted)]">
            <TagIcon size={36} className="mx-auto opacity-30 mb-2 text-red-500" />
            <p className="font-semibold text-sm text-[var(--color-text)]">
              {isEn ? "No tags found" : "কোনো ট্যাগ পাওয়া যায়নি"}
            </p>
            <p className="mt-1 text-[11px]">
              {searchQuery
                ? (isEn ? "No tags matched your search query." : "অনুসন্ধানের সাথে মিল রেখে কোনো ট্যাগ মেলেনি।")
                : (isEn ? 'Click "Add New Tag" above to create tags.' : "উপরের বাটন চেপে ডাটাবেজে নতুন ট্যাগ যুক্ত করুন।")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold">
                <tr>
                  <th className="p-3">{isEn ? "Tag Name" : "ট্যাগের নাম"}</th>
                  <th className="p-3">{isEn ? "English Name" : "ইংরেজি নাম"}</th>
                  <th className="p-3">{isEn ? "URL Slug" : "স্লাগ (URL)"}</th>
                  <th className="p-3 text-center">{isEn ? "Tagged Stories" : "সংবাদের সংখ্যা"}</th>
                  <th className="p-3 text-right">{isEn ? "Actions" : "পদক্ষেপ"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredTags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                    <td className="p-3 font-bold text-[var(--color-text)] flex items-center gap-1.5">
                      <span className="text-[var(--color-primary)]">#</span>
                      <span>{tag.name}</span>
                    </td>
                    <td className="p-3 text-[var(--color-text-muted)]">
                      {tag.nameEn || "—"}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-[var(--color-text-muted)]">
                      {tag.slug}
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-border)] text-[var(--color-text)]">
                        {isEn ? `${formatNumber(tag.count)} stories` : `${formatNumber(tag.count)}টি সংবাদ`}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(tag.id, tag.name)}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors cursor-pointer"
                        title={isEn ? "Delete tag" : "ট্যাগটি মুছে ফেলুন"}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
