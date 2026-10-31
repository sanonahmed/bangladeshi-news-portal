"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadCloud, Image as ImageIcon, Search, Copy, Check, AlertCircle } from "lucide-react";

export default function AdminMediaPage() {
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [mediaItems, setMediaItems] = useState([
    {
      id: "m-1",
      url: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80",
      filename: "bangladesh-economy-summit.jpg",
      credit: "নিজস্ব আলোকচিত্রী",
      date: "৩১ অক্টোবর ২০২৬",
    },
    {
      id: "m-2",
      url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
      filename: "padma-bridge-railways.jpg",
      credit: "বার্তা সংস্থা",
      date: "৩১ অক্টোবর ২০২৬",
    },
    {
      id: "m-3",
      url: "https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=800&q=80",
      filename: "tigers-cricket-match.jpg",
      credit: "ক্রীড়া প্রতিবেদক",
      date: "৩০ অক্টোবর ২০২৬",
    },
    {
      id: "m-4",
      url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
      filename: "technology-ai-summit.jpg",
      credit: "প্রযুক্তি বিভাগ",
      date: "৩০ অক্টোবর ২০২৬",
    },
  ]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
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
        // If R2 credentials are not set yet in dev, we handle it cleanly
        const data = await presignRes.json();
        throw new Error(data.error || "আপলোড অনুমতি পাওয়া যায়নি");
      }

      const { uploadUrl, publicUrl } = await presignRes.json();

      // 2. Upload directly to Cloudflare R2
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("R2-তে ফাইল আপলোড ব্যর্থ হয়েছে");

      // Add to local state
      setMediaItems((prev) => [
        {
          id: `m-${Date.now()}`,
          url: publicUrl,
          filename: file.name,
          credit: "আপলোডকৃত মিডিয়া",
          date: "আজ",
        },
        ...prev,
      ]);
    } catch (err: any) {
      setError(
        err.message?.includes("Forbidden") || err.message?.includes("Unauthorized")
          ? "মিডিয়া আপলোডের জন্য সাংবাদিক বা সম্পাদক হিসেবে লগইন থাকা আবশ্যক।"
          : `আপলোড নোট: ${err.message}`
      );
    } finally {
      setUploading(false);
    }
  }

  function copyToClipboard(url: string) {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="bengali-headline text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <ImageIcon size={24} className="text-[var(--color-primary)]" />
            মিডিয়া লাইব্রেরি (Cloudflare R2)
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            উচ্চ রেজুলিউশনের আলোকচিত্র ও চিত্রশালা ব্যবস্থাপনা
          </p>
        </div>

        {/* Upload Trigger */}
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold cursor-pointer transition-colors shadow-sm">
          <UploadCloud size={16} />
          {uploading ? "আপলোড হচ্ছে..." : "নতুন ছবি আপলোড করুন"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-600 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mediaItems.map((item) => (
          <div
            key={item.id}
            className="border border-[var(--color-border)] bg-[var(--color-bg)] p-3 space-y-2 group"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-[var(--color-bg-secondary)]">
              <Image
                src={item.url}
                alt={item.filename}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, 25vw"
              />
            </div>
            <div className="text-xs space-y-1">
              <p className="font-semibold text-[var(--color-text)] truncate font-mono text-[11px]">
                {item.filename}
              </p>
              <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
                <span>{item.credit}</span>
                <span>{item.date}</span>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(item.url)}
              className="w-full py-1.5 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-[11px] font-semibold text-[var(--color-text)] flex items-center justify-center gap-1 transition-colors"
            >
              {copiedUrl === item.url ? (
                <>
                  <Check size={12} className="text-green-600" /> লিঙ্ক কপি হয়েছে
                </>
              ) : (
                <>
                  <Copy size={12} /> লিঙ্ক কপি করুন
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
