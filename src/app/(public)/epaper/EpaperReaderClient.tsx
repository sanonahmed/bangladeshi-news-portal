"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EpaperToolbar } from "@/components/public/epaper/EpaperToolbar";
import { EpaperPageSpread } from "@/components/public/epaper/EpaperPageSpread";
import { EpaperThumbnailDrawer } from "@/components/public/epaper/EpaperThumbnailDrawer";
import { EpaperClipModal } from "@/components/public/epaper/EpaperClipModal";
import {
  getEpaperEdition,
  type EpaperEdition,
  type EpaperStory,
} from "@/lib/epaper-data";
import { toBengaliDigits } from "@/lib/bengali-date";

interface EpaperReaderClientProps {
  initialEdition: EpaperEdition;
  initialPageNumber: number;
}

export function EpaperReaderClient({
  initialEdition,
  initialPageNumber,
}: EpaperReaderClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [edition, setEdition] = useState<EpaperEdition>(initialEdition);
  const [currentPage, setCurrentPage] = useState<number>(initialPageNumber || 1);
  const [scale, setScale] = useState<number>(1);
  const [isDoubleSpread, setIsDoubleSpread] = useState<boolean>(false);
  const [currentEditionKey, setCurrentEditionKey] = useState<"dhaka" | "chattogram" | "national">(
    initialEdition.editionKey
  );
  const [selectedDate, setSelectedDate] = useState<string>(initialEdition.dateStr);
  const [activeStory, setActiveStory] = useState<{
    story: EpaperStory;
    pageNum: number;
  } | null>(null);

  // Sync state when date or edition changes
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const updated = getEpaperEdition(newDate, currentEditionKey);
    setEdition(updated);
    setCurrentPage(1);
    router.replace(`/epaper?date=${newDate}&page=1&edition=${currentEditionKey}`, { scroll: false });
  };

  const handleEditionChange = (newEd: "dhaka" | "chattogram" | "national") => {
    setCurrentEditionKey(newEd);
    const updated = getEpaperEdition(selectedDate, newEd);
    setEdition(updated);
    router.replace(`/epaper?date=${selectedDate}&page=${currentPage}&edition=${newEd}`, { scroll: false });
  };

  const handlePageChange = useCallback(
    (newPage: number) => {
      const bounded = Math.max(1, Math.min(edition.totalPages, newPage));
      setCurrentPage(bounded);
      router.replace(`/epaper?date=${selectedDate}&page=${bounded}&edition=${currentEditionKey}`, {
        scroll: false,
      });
      window.scrollTo({ top: 120, behavior: "smooth" });
    },
    [edition.totalPages, selectedDate, currentEditionKey, router]
  );

  // Keyboard navigation: Left/Right Arrow to flip pages
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeStory) {
        if (e.key === "Escape") setActiveStory(null);
        return;
      }

      if (e.key === "ArrowRight") {
        handlePageChange(currentPage + 1);
      } else if (e.key === "ArrowLeft") {
        handlePageChange(currentPage - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, handlePageChange, activeStory]);

  const primaryPage = edition.pages[currentPage - 1] || edition.pages[0]!;
  const spreadPage =
    isDoubleSpread && currentPage < edition.totalPages
      ? edition.pages[currentPage]
      : null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="bg-[#121316] min-h-screen text-white flex flex-col justify-between">
      {/* 1. TOP CONTROL TOOLBAR */}
      <EpaperToolbar
        currentPage={currentPage}
        totalPages={edition.totalPages}
        onPageChange={handlePageChange}
        scale={scale}
        onScaleChange={setScale}
        isDoubleSpread={isDoubleSpread}
        onToggleSpread={() => setIsDoubleSpread((prev) => !prev)}
        currentEdition={currentEditionKey}
        onEditionChange={handleEditionChange}
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        onPrint={handlePrint}
      />

      {/* 2. MAIN READING SPREAD CANVAS */}
      <main className="flex-1 py-8 px-2 sm:px-4 flex items-center justify-center overflow-x-auto">
        <div className="w-full flex justify-center items-start gap-4">
          {/* Page 1 (or Left Page in Double Spread) */}
          <div className="flex-1 max-w-full flex justify-center">
            <EpaperPageSpread
              page={primaryPage}
              onSelectStory={(story, pageNum) => setActiveStory({ story, pageNum })}
              scale={scale}
            />
          </div>

          {/* Page 2 (Right Page in Double Spread Mode) */}
          {spreadPage && (
            <div className="hidden md:flex flex-1 max-w-full justify-center">
              <EpaperPageSpread
                page={spreadPage}
                onSelectStory={(story, pageNum) => setActiveStory({ story, pageNum })}
                scale={scale}
              />
            </div>
          )}
        </div>
      </main>

      {/* 3. BOTTOM THUMBNAIL DRAWER */}
      <div className="print:hidden">
        <EpaperThumbnailDrawer
          pages={edition.pages}
          currentPage={currentPage}
          onSelectPage={handlePageChange}
        />
      </div>

      {/* 4. INTERACTIVE NEWS CLIPPING MODAL */}
      {activeStory && (
        <EpaperClipModal
          story={activeStory.story}
          pageNumber={activeStory.pageNum}
          editionName={edition.editionTitle}
          dateFormatted={primaryPage.headerBanner.bengaliDate}
          onClose={() => setActiveStory(null)}
        />
      )}
    </div>
  );
}
