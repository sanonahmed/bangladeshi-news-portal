"use client";

import Image from "next/image";
import { ZoomIn, Eye, Sparkles } from "lucide-react";
import type { EpaperPage, EpaperStory } from "@/lib/epaper-data";

interface EpaperPageSpreadProps {
  page: EpaperPage;
  onSelectStory: (story: EpaperStory, pageNum: number) => void;
  scale?: number; // zoom percentage (e.g. 1, 1.25, 1.5)
}

export function EpaperPageSpread({
  page,
  onSelectStory,
  scale = 1,
}: EpaperPageSpreadProps) {
  const { headerBanner, leadStory, secondaryStory, gridStories, adSlot } = page;

  return (
    <div
      className="bg-[#fbfbf8] dark:bg-[#18191c] text-zinc-900 dark:text-zinc-100 border-2 border-[#d5ccb8] dark:border-zinc-800 shadow-2xl mx-auto transition-transform duration-200 select-none"
      style={{
        maxWidth: `${820 * scale}px`,
        width: "100%",
        fontFamily: "'Hind Siliguri', 'SolaimanLipi', serif",
      }}
    >
      {/* ==================================================== */}
      {/* 1. BROADSHEET NEWSPAPER MASTHEAD                     */}
      {/* ==================================================== */}
      <header className="border-b-4 border-black dark:border-zinc-300 p-4 sm:p-6 pb-2">
        {/* Top utility row: Price, edition, barcode simulation */}
        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-700 dark:text-zinc-400 border-b border-zinc-300 dark:border-zinc-800 pb-1.5 mb-2 uppercase tracking-wider">
          <div className="flex items-center gap-3">
            <span>{headerBanner.editionName}</span>
            <span>•</span>
            <span>{headerBanner.price}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{headerBanner.volNumber}</span>
            <span>•</span>
            <span>{headerBanner.issueNumber}</span>
          </div>
          <div className="font-mono text-[9px] bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 border border-zinc-300 dark:border-zinc-700">
            ||||||| | ||||| ||||||| 880193
          </div>
        </div>

        {/* Newspaper Title Masthead */}
        <div className="text-center py-2 sm:py-3">
          <h1 className="bengali-serif-headline text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-black dark:text-white leading-none">
            {headerBanner.paperName}
          </h1>
          <p className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 tracking-widest mt-1 font-semibold uppercase">
            সত্য ও সাহসের পক্ষে অবিচল • শীর্ষস্থানীয় জাতীয় অনলাইন ও মুদ্রিত দৈনিক
          </p>
        </div>

        {/* Date & Page label bar */}
        <div className="border-t-2 border-b-2 border-black dark:border-zinc-400 py-1 flex flex-wrap items-center justify-between text-[11px] font-bold text-zinc-800 dark:text-zinc-200 uppercase mt-2">
          <span>{headerBanner.bengaliDate}</span>
          <span className="text-[#b8860b] hidden sm:inline">{headerBanner.banglaCalendarDate}</span>
          <span>{headerBanner.pageLabel}</span>
        </div>
      </header>

      {/* ==================================================== */}
      {/* 2. BROADSHEET BODY CONTENT                           */}
      {/* ==================================================== */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* TOP SECTION: LEAD STORY + SECONDARY STORY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-b-2 border-zinc-300 dark:border-zinc-800 pb-6">
          {/* Main Lead Story (8 cols on lg) */}
          <article
            onClick={() => onSelectStory(leadStory, page.pageNumber)}
            className="lg:col-span-8 cursor-pointer group p-2 hover:bg-[#f3eedf] dark:hover:bg-zinc-800/60 transition-colors relative border border-transparent hover:border-dashed hover:border-[var(--color-primary)]"
            title="সম্পূর্ণ সংবাদ পড়তে ক্লিক করুন"
          >
            {/* Click to Read Pill */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-primary)] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-10 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>ক্লিপিং পড়ুন</span>
            </div>

            {leadStory.kicker && (
              <span className="inline-block text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-1">
                {leadStory.kicker}
              </span>
            )}

            <h2 className="bengali-serif-headline text-2xl sm:text-3xl font-black text-black dark:text-white leading-tight mb-2 group-hover:text-[var(--color-primary)] transition-colors">
              {leadStory.headline}
            </h2>

            {leadStory.byline && (
              <div className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-3 border-b border-zinc-200 dark:border-zinc-800 pb-1">
                — {leadStory.byline}
              </div>
            )}

            {leadStory.imageUrl && (
              <figure className="mb-3 border border-zinc-300 dark:border-zinc-700 p-1 bg-white dark:bg-zinc-900">
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={leadStory.imageUrl}
                    alt={leadStory.headline}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    sizes="(max-width: 800px) 100vw, 600px"
                  />
                </div>
                {leadStory.imageCaption && (
                  <figcaption className="text-[11px] text-zinc-600 dark:text-zinc-400 italic px-1 pt-1">
                    ছবি: {leadStory.imageCaption}
                  </figcaption>
                )}
              </figure>
            )}

            <p className="font-serif text-sm sm:text-base leading-relaxed text-zinc-800 dark:text-zinc-200 text-justify line-clamp-4">
              {leadStory.summary}
            </p>
          </article>

          {/* Secondary Story (4 cols on lg) */}
          {secondaryStory && (
            <article
              onClick={() => onSelectStory(secondaryStory, page.pageNumber)}
              className="lg:col-span-4 lg:border-l-2 border-zinc-300 dark:border-zinc-800 lg:pl-6 cursor-pointer group p-2 hover:bg-[#f3eedf] dark:hover:bg-zinc-800/60 transition-colors relative border border-transparent hover:border-dashed hover:border-[var(--color-primary)] flex flex-col justify-between"
              title="সম্পূর্ণ সংবাদ পড়তে ক্লিক করুন"
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-primary)] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-10 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>ক্লিপিং পড়ুন</span>
              </div>

              <div>
                {secondaryStory.kicker && (
                  <span className="inline-block text-[11px] font-bold text-[var(--color-primary)] uppercase tracking-wider mb-1">
                    {secondaryStory.kicker}
                  </span>
                )}

                <h3 className="bengali-serif-headline text-lg sm:text-xl font-bold text-black dark:text-white leading-snug mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                  {secondaryStory.headline}
                </h3>

                {secondaryStory.byline && (
                  <div className="text-[11px] text-zinc-500 mb-2 italic">
                    {secondaryStory.byline}
                  </div>
                )}

                <p className="font-serif text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 text-justify line-clamp-6">
                  {secondaryStory.summary}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-[var(--color-primary)]">
                বিস্তারিত পাতা {page.pageNumber}-এ পড়ুন &rarr;
              </div>
            </article>
          )}
        </div>

        {/* ==================================================== */}
        {/* 3. MULTI-COLUMN GRID STORIES                        */}
        {/* ==================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-zinc-300 dark:divide-zinc-800">
          {gridStories.map((story, idx) => (
            <article
              key={story.id}
              onClick={() => onSelectStory(story, page.pageNumber)}
              className={`pt-4 md:pt-0 ${
                idx > 0 ? "md:pl-6" : ""
              } cursor-pointer group hover:bg-[#f3eedf] dark:hover:bg-zinc-800/60 p-2 transition-colors relative border border-transparent hover:border-dashed hover:border-[var(--color-primary)]`}
              title="সম্পূর্ণ সংবাদ পড়তে ক্লিক করুন"
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-primary)] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-10 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>ক্লিপিং পড়ুন</span>
              </div>

              <span className="text-[10px] font-bold text-[#b8860b] uppercase tracking-wider block mb-1">
                ● {story.category}
              </span>

              <h4 className="bengali-serif-headline text-base sm:text-lg font-bold text-black dark:text-white leading-snug mb-1.5 group-hover:text-[var(--color-primary)] transition-colors">
                {story.headline}
              </h4>

              {story.byline && (
                <div className="text-[10px] text-zinc-500 mb-2 italic">
                  {story.byline}
                </div>
              )}

              <p className="font-serif text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 line-clamp-4 text-justify">
                {story.summary}
              </p>
            </article>
          ))}
        </div>

        {/* ==================================================== */}
        {/* 4. COMMERCIAL ADVERTISEMENT BANNER                  */}
        {/* ==================================================== */}
        {adSlot && (
          <div
            className={`mt-6 p-4 border-2 border-black dark:border-zinc-700 ${adSlot.bgColor} text-center shadow-xs`}
          >
            <span className="text-[9px] uppercase tracking-widest opacity-75 block mb-0.5">
              বিজ্ঞাপন • স্পন্সরড বার্তা
            </span>
            <div className="font-bold text-base sm:text-lg tracking-wide">
              {adSlot.brandName}
            </div>
            <div className="text-xs opacity-90 mt-0.5">
              {adSlot.tagline}
            </div>
            <div className="text-[10px] opacity-75 mt-1 font-mono">
              {adSlot.contactOrWeb}
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 5. PAGE FOOTER                                       */}
      {/* ==================================================== */}
      <footer className="border-t-2 border-black dark:border-zinc-400 p-3 bg-[#f4efe4] dark:bg-zinc-900 flex items-center justify-between text-[11px] font-bold text-zinc-700 dark:text-zinc-400">
        <span>দৈনিক বাংলাদেশ বার্তা • {headerBanner.editionName}</span>
        <span>{headerBanner.pageLabel}</span>
      </footer>
    </div>
  );
}
