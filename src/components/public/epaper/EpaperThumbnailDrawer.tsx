"use client";

import { toBengaliDigits } from "@/lib/bengali-date";
import type { EpaperPage } from "@/lib/epaper-data";

interface EpaperThumbnailDrawerProps {
  pages: EpaperPage[];
  currentPage: number;
  onSelectPage: (pageNum: number) => void;
}

export function EpaperThumbnailDrawer({
  pages,
  currentPage,
  onSelectPage,
}: EpaperThumbnailDrawerProps) {
  return (
    <div className="bg-[#18191c] border-t border-zinc-800 p-3 shadow-inner">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-2 px-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
          <span>পাতাসমূহের ভিজ্যুয়াল প্রিভিউ থাম্বনেইল</span>
          <span>মোট {toBengaliDigits(pages.length)} টি পাতা</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700">
          {pages.map((p) => {
            const isActive = p.pageNumber === currentPage;

            return (
              <button
                key={p.pageNumber}
                onClick={() => onSelectPage(p.pageNumber)}
                className={`flex-shrink-0 w-28 sm:w-32 text-left border-2 p-1.5 transition-all group ${
                  isActive
                    ? "border-[var(--color-primary)] bg-zinc-900 shadow-lg scale-[1.03]"
                    : "border-zinc-700 bg-zinc-800/80 hover:border-zinc-500 hover:bg-zinc-800 opacity-80 hover:opacity-100"
                }`}
              >
                {/* Simulated Newspaper Miniature Page */}
                <div className="aspect-[3/4] w-full bg-[#fbfbf8] text-zinc-900 p-1 flex flex-col justify-between overflow-hidden shadow-xs relative">
                  {/* Miniature Masthead */}
                  <div className="border-b border-zinc-400 pb-0.5 text-center">
                    <div className="text-[7px] font-black tracking-tighter truncate leading-none">
                      দৈনিক বাংলাদেশ বার্তা
                    </div>
                  </div>

                  {/* Miniature Columns */}
                  <div className="flex-1 py-1 space-y-1">
                    <div className="h-1.5 w-full bg-zinc-800 rounded-none" />
                    <div className="h-1 w-3/4 bg-zinc-400 rounded-none" />
                    <div className="grid grid-cols-2 gap-0.5 pt-1">
                      <div className="h-4 bg-zinc-300 border border-zinc-400" />
                      <div className="space-y-0.5">
                        <div className="h-1 bg-zinc-400" />
                        <div className="h-1 bg-zinc-300" />
                        <div className="h-1 bg-zinc-300" />
                      </div>
                    </div>
                  </div>

                  {/* Miniature Page Label */}
                  <div className="bg-zinc-200 text-zinc-800 text-[6px] font-bold text-center py-0.5 truncate">
                    পাতা {toBengaliDigits(p.pageNumber)}
                  </div>
                </div>

                {/* Caption under thumbnail */}
                <div className="mt-1.5 text-center">
                  <span
                    className={`block text-[11px] font-bold truncate ${
                      isActive ? "text-[var(--color-primary)]" : "text-zinc-300 group-hover:text-white"
                    }`}
                  >
                    পাতা {toBengaliDigits(p.pageNumber)}
                  </span>
                  <span className="block text-[9px] text-zinc-400 truncate">
                    {p.pageTitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
