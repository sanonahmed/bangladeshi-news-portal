"use client";

import { useState } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Image as ImageIcon,
  Search,
  Copy,
  Check,
  AlertCircle,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { recordMediaAsset, deleteAdminMedia, type MediaItem } from "@/actions/media";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

interface AdminMediaClientProps {
  initialMedia: MediaItem[];
}

export function AdminMediaClient({ initialMedia }: AdminMediaClientProps) {
  const { language, formatNumber } = useAdminLanguage();
  const isEn = language === "en";

  const [mediaItems, setMediaItems] = useState<MediaItem[]>(initialMedia);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filteredMedia = mediaItems.filter(
    (item) =>
      item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.credit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    setUploading(true);

    try {
      // 1. Get presigned upload URL from server endpoint
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          fileSize: file.size,
        }),
      });

      if (!presignRes.ok) {
        const data = await presignRes.json();
        throw new Error(data.error || (isEn ? "Failed to obtain upload authorization" : "আপলোড অনুমতি পাওয়া যায়নি"));
      }

      const { uploadUrl, publicUrl, r2Key } = await presignRes.json();

      // 2. Upload directly to Cloudflare R2
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error(isEn ? "File upload to storage bucket failed" : "R2-তে ফাইল আপলোড ব্যর্থ হয়েছে");

      // 3. Record in PostgreSQL database
      const recordRes = await recordMediaAsset({
        filename: file.name,
        originalName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        r2Key: r2Key || `uploads/${file.name}`,
        publicUrl,
      });

      if (recordRes.success && recordRes.media) {
        setMediaItems((prev) => [recordRes.media!, ...prev]);
        setSuccess(
          isEn
            ? `'${file.name}' successfully uploaded and registered in database!`
            : `'${file.name}' সফলভাবে আপলোড ও ডাটাবেজে সংরক্ষিত হয়েছে!`
        );
      } else {
        // Fallback UI item if DB record had warning
        setMediaItems((prev) => [
          {
            id: `m-${Date.now()}`,
            url: publicUrl,
            filename: file.name,
            credit: isEn ? "Uploaded media" : "আপলোডকৃত মিডিয়া",
            fileSize: file.size,
            mimeType: file.type,
            date: isEn ? "Today" : "আজ",
          },
          ...prev,
        ]);
      }
    } catch (err: any) {
      setError(
        err.message?.includes("Forbidden") || err.message?.includes("Unauthorized")
          ? (isEn ? "Staff login with reporter or editor permissions is required to upload media." : "মিডিয়া আপলোডের জন্য সাংবাদিক বা সম্পাদক হিসেবে লগইন থাকা আবশ্যক।")
          : (isEn ? `Upload note: ${err.message}` : `আপলোড নোট: ${err.message}`)
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    const confirmMsg = isEn
      ? `Are you sure you want to permanently delete this media file?\n(${name})`
      : `আপনি কি নিশ্চিত যে এই ছবিটি মুছে ফেলতে চান?\n(${name})`;
    if (!confirm(confirmMsg)) {
      return;
    }

    try {
      const res = await deleteAdminMedia(id);
      if (res.success) {
        setMediaItems((prev) => prev.filter((m) => m.id !== id));
      } else {
        alert(res.error || (isEn ? "Failed to delete media asset" : "মিডিয়া মুছে ফেলতে সমস্যা হয়েছে"));
      }
    } catch (err) {
      alert(isEn ? "Server error occurred" : "সার্ভার এরর ঘটেছে");
    }
  }

  function copyToClipboard(url: string) {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2 tracking-tight">
            <ImageIcon size={24} className="text-[var(--color-primary)]" />
            <span>{isEn ? "Media Library & Photography Archive" : "মিডিয়া লাইব্রেরি ও ফটো আর্কাইভ"}</span>
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {isEn
              ? `Editorial photography and media assets stored in database (${formatNumber(mediaItems.length)} items)`
              : `ডাটাবেজে সংরক্ষিত ও সংবাদে ব্যবহৃত সকল আলোকচিত্র এবং মিডিয়া সম্পদ (${formatNumber(mediaItems.length)}টি ছবি)`}
          </p>
        </div>

        {/* Upload Trigger */}
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold cursor-pointer transition-colors shadow-sm self-start sm:self-auto rounded">
          <UploadCloud size={16} />
          <span>{uploading ? (isEn ? "Uploading..." : "আপলোড হচ্ছে...") : (isEn ? "Upload New Image" : "নতুন ছবি আপলোড করুন")}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Status Messages */}
      {success && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-600 text-xs text-emerald-800 dark:text-emerald-300">
          {success}
        </div>
      )}
      {error && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-600 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-2.5 text-[var(--color-text-muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isEn ? "Search images by filename or photographer credit..." : "ছবির নাম বা আলোকচিত্রীর নাম দিয়ে খুঁজুন..."}
          className="w-full pl-9 pr-4 py-2 border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] rounded"
        />
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="p-12 text-center text-xs text-[var(--color-text-muted)] border border-[var(--color-border)] bg-[var(--color-bg)] rounded">
          <ImageIcon size={40} className="mx-auto opacity-30 mb-2.5 text-sky-600" />
          <p className="font-semibold text-sm text-[var(--color-text)]">
            {isEn ? "No media assets found" : "কোনো মিডিয়া পাওয়া যায়নি"}
          </p>
          <p className="mt-1 text-[11px]">
            {searchQuery
              ? (isEn ? "No images matched your search query." : "অনুসন্ধানের সাথে মিল রেখে কোনো ছবি মেলেনি।")
              : (isEn ? 'Click "Upload New Image" above to upload photos to the storage bucket.' : "নতুন ছবি আপলোড করতে ওপরের 'নতুন ছবি আপলোড করুন' বাটন ব্যবহার করুন।")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="border border-[var(--color-border)] bg-[var(--color-bg)] p-3 space-y-2 group rounded shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video w-full overflow-hidden bg-[var(--color-bg-secondary)] rounded">
                  <Image
                    src={item.url}
                    alt={item.filename}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, 25vw"
                  />
                </div>
                <div className="text-xs space-y-1 mt-2">
                  <p
                    className="font-semibold text-[var(--color-text)] line-clamp-2 text-xs leading-tight"
                    title={item.filename}
                  >
                    {item.filename}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] pt-1">
                    <span className="truncate max-w-[140px]">{item.credit}</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(item.url)}
                  className="w-full py-1.5 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-[11px] font-semibold text-[var(--color-text)] flex items-center justify-center gap-1 transition-colors rounded cursor-pointer"
                >
                  {copiedUrl === item.url ? (
                    <>
                      <Check size={12} className="text-green-600" />
                      <span>{isEn ? "Link Copied!" : "লিঙ্ক কপি হয়েছে"}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>{isEn ? "Copy Link" : "লিঙ্ক কপি করুন"}</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[var(--color-border)]">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] flex items-center gap-0.5 text-[10px]"
                  >
                    <span>{isEn ? "Original File" : "মূল ছবি"}</span>
                    <ExternalLink size={10} />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.filename)}
                    className="text-red-500 hover:text-red-700 flex items-center gap-0.5 text-[10px] cursor-pointer"
                    title={isEn ? "Delete photo" : "ছবিটি মুছে ফেলুন"}
                  >
                    <Trash2 size={11} />
                    <span>{isEn ? "Delete" : "মুছুন"}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
