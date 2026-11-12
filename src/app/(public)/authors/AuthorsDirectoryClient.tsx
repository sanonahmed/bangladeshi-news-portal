"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { AuthorDirectoryItem } from "@/actions/authors";
import {
  User,
  MapPin,
  Newspaper,
  ChevronRight,
  Mail,
  Phone,
  Building2,
  Users,
  Award,
} from "lucide-react";
import { FacebookIcon, TwitterXIcon, LinkedinIcon } from "@/components/ui/icons";

interface AuthorsDirectoryClientProps {
  authors: AuthorDirectoryItem[];
}

function DirectoryAuthorAvatar({ src, name }: { src?: string | null; name: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[var(--color-bg-secondary)] text-[var(--color-primary)] font-bold text-xl select-none">
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      fill
      unoptimized
      className="object-cover"
      sizes="64px"
      onError={() => setHasError(true)}
    />
  );
}

export function AuthorsDirectoryClient({ authors }: AuthorsDirectoryClientProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const bureauChiefsCount = authors.filter((a) => a.isBureauChief).length;
  const totalArticles = authors.reduce((acc, a) => acc + (a.totalArticles || 0), 0);

  const filteredAuthors = authors.filter((a) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "bureau_chief") return a.isBureauChief;
    if (selectedFilter === "central") return a.bureau?.includes("ঢাকা") || a.bureau?.includes("কেন্দ্রীয়");
    if (selectedFilter === "regional") return a.bureau?.includes("ব্যুরো") && !a.bureau?.includes("ঢাকা");
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-zinc-900 via-neutral-900 to-black text-white p-6 md:p-8 border-b-4 border-[var(--color-primary)]">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 text-xs font-semibold mb-3 border border-white/10">
            <Users className="w-3.5 h-3.5 text-red-400" />
            <span>দৈনিক বাংলাদেশ বার্তা সাংবাদিক পরিবার</span>
          </div>
          <h1 className="bengali-headline text-2xl md:text-4xl font-extrabold tracking-tight">
            আমাদের সাংবাদিক ও ব্যুরো প্রধানদের তালিকা
          </h1>
          <p className="text-sm md:text-base text-zinc-300 mt-2 leading-relaxed">
            বস্তুনিষ্ঠ সাংবাদিকতা ও তৃণমূলের সত্য উদঘাটনে নিবেদিত আমাদের পেশাদার বার্তা দল, আঞ্চলিক ব্যুরো প্রধান ও বিশেষজ্ঞ করেসপন্ডেন্টবৃন্দ।
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-mono">{authors.length} জন</div>
                <div className="text-xs text-zinc-400">বার্তাকক্ষ ও প্রতিবেদক</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-mono">{bureauChiefsCount}টি</div>
                <div className="text-xs text-zinc-400">আঞ্চলিক ব্যুরো প্রধান</div>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <Newspaper className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-mono">{totalArticles}টি</div>
                <div className="text-xs text-zinc-400">প্রকাশিত প্রতিবেদন</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-[var(--color-border)]">
        <button
          onClick={() => setSelectedFilter("all")}
          className={`px-4 py-2 text-xs font-bold transition-all whitespace-nowrap border ${
            selectedFilter === "all"
              ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
              : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] border-transparent hover:border-[var(--color-border)]"
          }`}
        >
          সকল সাংবাদিক ({authors.length})
        </button>
        <button
          onClick={() => setSelectedFilter("bureau_chief")}
          className={`px-4 py-2 text-xs font-bold transition-all whitespace-nowrap border ${
            selectedFilter === "bureau_chief"
              ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
              : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] border-transparent hover:border-[var(--color-border)]"
          }`}
        >
          আঞ্চলিক ব্যুরো প্রধান ({bureauChiefsCount})
        </button>
        <button
          onClick={() => setSelectedFilter("central")}
          className={`px-4 py-2 text-xs font-bold transition-all whitespace-nowrap border ${
            selectedFilter === "central"
              ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
              : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] border-transparent hover:border-[var(--color-border)]"
          }`}
        >
          কেন্দ্রীয় বার্তা কক্ষ
        </button>
        <button
          onClick={() => setSelectedFilter("regional")}
          className={`px-4 py-2 text-xs font-bold transition-all whitespace-nowrap border ${
            selectedFilter === "regional"
              ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
              : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] border-transparent hover:border-[var(--color-border)]"
          }`}
        >
          বিভাগীয় ব্যুরোসমূহ
        </button>
      </div>

      {/* Authors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAuthors.map((author) => (
          <div
            key={author.id}
            className="flex flex-col justify-between border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-primary)] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-lg p-5 group"
          >
            <div>
              {/* Card Top: Avatar & Bureau Badges */}
              <div className="flex items-start gap-4 mb-4">
                <Link
                  href={`/author/${author.slug}`}
                  className="relative w-16 h-16 shrink-0 rounded-full overflow-hidden border-2 border-[var(--color-primary)] bg-[var(--color-bg-secondary)] block group-hover:scale-105 transition-transform"
                >
                  <DirectoryAuthorAvatar src={author.avatarUrl} name={author.nameBangla} />
                </Link>

                <div className="flex-1 min-w-0">
                  {author.isBureauChief ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded shadow-sm">
                      <Award className="w-2.5 h-2.5" />
                      <span>ব্যুরো প্রধান</span>
                    </span>
                  ) : (
                    <span className="inline-block text-[10px] font-semibold bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] px-2 py-0.5 border border-[var(--color-border)]">
                      {author.department}
                    </span>
                  )}

                  {author.bureau && (
                    <div className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1 mt-1 font-medium">
                      <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                      <span className="truncate">{author.bureau}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Name & Designation */}
              <h3 className="bengali-headline text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors leading-snug">
                <Link href={`/author/${author.slug}`}>
                  {author.nameBangla}
                </Link>
              </h3>
              {author.nameEnglish && (
                <div className="text-xs text-[var(--color-text-muted)] font-sans mb-1">
                  {author.nameEnglish}
                </div>
              )}
              <div className="text-xs font-semibold text-[var(--color-primary)] mt-1 mb-2">
                {author.designation}
              </div>

              {/* Bio */}
              {author.bio && (
                <p className="text-xs text-[var(--color-text-muted)] line-clamp-3 leading-relaxed mb-4">
                  {author.bio}
                </p>
              )}
            </div>

            {/* Bottom: Article count & Profile Link */}
            <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between mt-auto">
              <span className="text-[11px] font-mono font-bold text-[var(--color-text-muted)] flex items-center gap-1">
                <Newspaper className="w-3 h-3 text-[var(--color-primary)]" />
                <span>{author.totalArticles}টি প্রতিবেদন</span>
              </span>

              <Link
                href={`/author/${author.slug}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] group-hover:underline"
              >
                <span>প্রোফাইল</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
