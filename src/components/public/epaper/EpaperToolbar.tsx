"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  RotateCcw,
  Printer,
  Download,
  Calendar,
  Layers,
  Archive,
  BookOpen,
} from "lucide-react";
import { toBengaliDigits } from "@/lib/bengali-date";
import { EDITIONS_LIST } from "@/lib/epaper-data";

interface EpaperToolbarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  scale: number;
  onScaleChange: (newScale: number) => void;
  isDoubleSpread: boolean;
  onToggleSpread: () => void;
  currentEdition: "dhaka" | "chattogram" | "national";
  onEditionChange: (ed: "dhaka" | "chattogram" | "national") => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onPrint: () => void;
}

export function EpaperToolbar({
  currentPage,
  totalPages,
  onPageChange,
  scale,
  onScaleChange,
  isDoubleSpread,
  onToggleSpread,
  currentEdition,
  onEditionChange,
  selectedDate,
  onDateChange,
  onPrint,
}: EpaperToolbarProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleZoomIn = () => {
    if (scale < 1.75) onScaleChange(Math.round((scale + 0.15) * 100) / 100);
  };

  const handleZoomOut = () => {
    if (scale > 0.8) onScaleChange(Math.round((scale - 0.15) * 100) / 100);
  };

  const handleResetZoom = () => {
    onScaleChange(1);
  };

  return (
    <div className="bg-[#1f2024] text-white p-3 border-y border-zinc-700 sticky top-0 z-40 shadow-lg">
      <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* LEFT: Edition & Date Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Edition Selector */}
          <div className="relative">
            <select
              value={currentEdition}
              onChange={(e) => onEditionChange(e.target.value as any)}
              className="bg-zinc-800 border border-zinc-600 text-white text-xs px-2.5 py-1.5 rounded-none font-semibold focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
            >
              {EDITIONS_LIST.map((ed) => (
                <option key={ed.key} value={ed.key}>
                  {ed.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-600 px-2 py-1">
            <Calendar className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
            />
          </div>

          <Link
            href="/epaper/archive"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-600 transition-colors"
            title="বিগত দিনের ই-পেপার আর্কাইভ"
          >
            <Archive className="w-3.5 h-3.5 text-[#b8860b]" />
            <span>আর্কাইভ</span>
          </Link>
        </div>

        {/* CENTER: Page Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed border border-zinc-600 transition-colors"
            title="পূর্ববর্তী পাতা"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-700 font-mono font-bold">
            <span className="text-[var(--color-primary)]">পাতা {toBengaliDigits(currentPage)}</span>
            <span className="text-zinc-500">/</span>
            <span className="text-zinc-400">{toBengaliDigits(totalPages)}</span>
          </div>

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed border border-zinc-600 transition-colors"
            title="পরবর্তী পাতা"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* RIGHT: View Modes & Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* Double Spread Mode Toggle */}
          <button
            onClick={onToggleSpread}
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 border text-xs font-semibold transition-colors ${
              isDoubleSpread
                ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                : "bg-zinc-800 border-zinc-600 text-zinc-300 hover:text-white"
            }`}
            title="জোড়া পাতা (দুই পাতা পাশাপাশি) প্রদর্শন"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isDoubleSpread ? "এক পাতা" : "জোড়া পাতা"}</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-zinc-800 border border-zinc-600 px-1 py-0.5">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 0.8}
              className="p-1 hover:text-[var(--color-primary)] disabled:opacity-30"
              title="জুম আউট"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] font-bold px-1 text-zinc-300 min-w-[38px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={scale >= 1.75}
              className="p-1 hover:text-[var(--color-primary)] disabled:opacity-30"
              title="জুম ইন"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 text-zinc-400 hover:text-white"
              title="জুম রিসেট"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Print button */}
          <button
            onClick={onPrint}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-300 hover:text-white transition-colors"
            title="বর্তমান পাতা প্রিন্ট বা PDF হিসেবে সংরক্ষণ করুন"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-300 hover:text-white transition-colors"
            title="ফুলস্ক্রিন মোড"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
