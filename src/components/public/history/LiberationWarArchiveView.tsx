"use client";

import { useState } from "react";
import Image from "next/image";
import { Flag, Shield, Award, MapPin, Compass, ChevronDown, ChevronUp, Flame, Star } from "lucide-react";
import { toBengaliDigits } from "@/lib/bengali-date";
import type { HistoricalEventItem, SectorItem, BirSreshthoItem } from "@/types/history";

interface LiberationWarArchiveViewProps {
  timelineEvents: HistoricalEventItem[];
  sectors: SectorItem[];
  birSreshthoList: BirSreshthoItem[];
}

export function LiberationWarArchiveView({
  timelineEvents,
  sectors,
  birSreshthoList,
}: LiberationWarArchiveViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"sectors" | "heroes" | "timeline">("sectors");
  const [expandedSector, setExpandedSector] = useState<number | null>(1);

  return (
    <div className="space-y-8">
      {/* Sub navigation bar */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3 overflow-x-auto scrollbar-none text-xs sm:text-sm">
        <button
          type="button"
          onClick={() => setActiveSubTab("sectors")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-all flex-shrink-0 ${
            activeSubTab === "sectors"
              ? "bg-[var(--color-primary)] text-white shadow-sm"
              : "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          <Compass size={15} />
          <span>১১টি সেক্টর ও কমান্ডারগণ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("heroes")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-all flex-shrink-0 ${
            activeSubTab === "heroes"
              ? "bg-[var(--color-primary)] text-white shadow-sm"
              : "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          <Award size={15} />
          <span>৭ জন বীরশ্রেষ্ঠ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("timeline")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-all flex-shrink-0 ${
            activeSubTab === "timeline"
              ? "bg-[var(--color-primary)] text-white shadow-sm"
              : "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          <Flame size={15} />
          <span>১৯৭১ গৌরবময় সময়রেখা</span>
        </button>
      </div>

      {/* SUB-TAB 1: 11 SECTORS */}
      {activeSubTab === "sectors" && (
        <section className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-extrabold text-[var(--color-text)] flex items-center gap-2">
              <Compass size={20} className="text-[var(--color-primary)]" />
              <span>১৯৭১ সালের ১১টি সেক্টর ও রণাঙ্গন বিন্যাস</span>
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              প্রধান সেনাপতি কর্নেল এম এ জি ওসমানীর নেতৃত্বে সমগ্র বাংলাদেশকে ১১টি ভৌগোলিক সেক্টরে বিভক্ত করে মুক্তিযুদ্ধ পরিচালিত হয়েছিল।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectors.map((sector) => {
              const isExpanded = expandedSector === sector.sectorNumber;
              return (
                <div
                  key={sector.sectorNumber}
                  className={`rounded-2xl border transition-all ${
                    isExpanded
                      ? "border-[var(--color-primary)] bg-[var(--color-bg)] shadow-md ring-1 ring-[var(--color-primary)]/40"
                      : "border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 hover:border-stone-400"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedSector(isExpanded ? null : sector.sectorNumber)
                    }
                    className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-red-600 text-white font-black text-sm shadow">
                        {toBengaliDigits(sector.sectorNumber)}
                      </span>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-[var(--color-text)] leading-snug">
                          {sector.title}
                        </h4>
                        <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-0.5">
                          কমান্ডার: {sector.commanders}
                        </p>
                      </div>
                    </div>

                    <span className="text-[var(--color-text-muted)] p-1">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 text-xs text-[var(--color-text)] space-y-2.5 border-t border-[var(--color-border)] mt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        <div className="rounded-lg bg-[var(--color-bg-secondary)] p-2.5 border border-[var(--color-border)]">
                          <span className="font-bold text-[var(--color-text-muted)] block text-[10px] uppercase">
                            হেডকোয়ার্টার:
                          </span>
                          <span className="font-semibold text-[var(--color-text)] mt-0.5 block">
                            📍 {sector.headquarters}
                          </span>
                        </div>
                        <div className="rounded-lg bg-[var(--color-bg-secondary)] p-2.5 border border-[var(--color-border)]">
                          <span className="font-bold text-[var(--color-text-muted)] block text-[10px] uppercase">
                            ভৌগোলিক পরিধি:
                          </span>
                          <span className="text-[var(--color-text)] mt-0.5 block leading-relaxed">
                            {sector.area}
                          </span>
                        </div>
                      </div>

                      {sector.keyOperations && (
                        <div className="rounded-lg bg-red-50/50 dark:bg-red-950/20 p-2.5 border border-red-200 dark:border-red-900/40">
                          <span className="font-bold text-red-600 dark:text-red-400 block text-[10px] uppercase">
                            ঐতিহাসিক সম্মুখ সমর ও অপারেশন:
                          </span>
                          <p className="mt-1 text-[var(--color-text)] leading-relaxed font-medium">
                            {sector.keyOperations}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SUB-TAB 2: SEVEN BIR SRESHTHO HEROES */}
      {activeSubTab === "heroes" && (
        <section className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-extrabold text-[var(--color-text)] flex items-center gap-2">
              <Award size={20} className="text-amber-500" />
              <span>স্বাধীনতার সর্বোচ্চ সামরিক খেতাবপ্রাপ্ত ৭ জন বীরশ্রেষ্ঠ</span>
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              ১৯৭১ সালের মুক্তিযুদ্ধে অসীম সাহস, চরম বীরত্ব ও সর্বোচ্চ আত্মত্যাগের স্বীকৃতিস্বরূপ বাংলাদেশ সরকারের সর্বোচ্চ সামরিক পদক 'বীরশ্রেষ্ঠ' প্রদান করা হয়।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {birSreshthoList.map((hero) => (
              <div
                key={hero.id}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-stone-900">
                    <img
                      src={hero.imageUrl}
                      alt={hero.name}
                      className="w-full h-full object-cover opacity-85"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="inline-flex items-center gap-1 rounded bg-amber-600 px-2 py-0.5 text-[10px] font-black text-white shadow">
                        <Star size={11} fill="currentColor" />
                        <span>বীরশ্রেষ্ঠ</span>
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 text-[10px] text-white/90 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded">
                      {hero.rank}
                    </div>
                  </div>

                  <div className="p-4">
                    <h4 className="text-base font-extrabold text-[var(--color-text)] leading-snug">
                      {hero.name}
                    </h4>

                    <div className="mt-2 space-y-1 text-xs text-[var(--color-text-muted)]">
                      <p>
                        <strong className="text-[var(--color-text)]">সেক্টর:</strong> {hero.sector}
                      </p>
                      <p>
                        <strong className="text-[var(--color-text)]">শাহাদাতের তারিখ:</strong>{" "}
                        <span className="text-red-600 dark:text-red-400 font-semibold">
                          {hero.martyrdomDate}
                        </span>
                      </p>
                      <p>
                        <strong className="text-[var(--color-text)]">স্থান:</strong> {hero.martyrdomPlace}
                      </p>
                    </div>

                    <div className="mt-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3 text-xs leading-relaxed text-[var(--color-text)]">
                      <span className="text-[10px] font-bold uppercase text-[var(--color-primary)] block mb-0.5">
                        অনন্য আত্মাহুতি ও বীরত্বগাথা:
                      </span>
                      <p className="italic text-[11px]">{hero.heroicDeed}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SUB-TAB 3: 1971 TIMELINE */}
      {activeSubTab === "timeline" && (
        <section className="space-y-6">
          <div className="mb-4">
            <h3 className="text-lg font-extrabold text-[var(--color-text)] flex items-center gap-2">
              <Flame size={20} className="text-red-500" />
              <span>১৯৭১ সালের ঐতিহাসিক দিনলিপি ও মুক্তিযুদ্ধের সময়রেখা</span>
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              মার্চের উত্তাল দিন থেকে শুরু করে ১৬ ডিসেম্বরের ঐতিহাসিক বিজয় পর্যন্ত গুরুত্বপূর্ণ ঘটনাপ্রবাহ।
            </p>
          </div>

          <div className="relative border-l-2 border-red-500/40 ml-4 pl-6 space-y-8">
            {timelineEvents.map((ev) => (
              <div key={ev.id} className="relative group">
                {/* Marker */}
                <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-red-500 bg-[var(--color-bg)] group-hover:bg-red-600 transition-colors" />

                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-black text-white">
                      {toBengaliDigits(ev.day)}/
                      {toBengaliDigits(ev.month)}/{toBengaliDigits(ev.year)}
                    </span>
                    <span className="rounded bg-[var(--color-bg-secondary)] px-2 py-0.5 text-xs font-bold text-[var(--color-primary)] border border-[var(--color-border)]">
                      {ev.category}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[var(--color-text)] leading-snug">
                    {ev.title}
                  </h4>

                  <p className="mt-2 text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                    {ev.description}
                  </p>

                  {ev.significance && (
                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50/50 p-3 dark:border-red-900/40 dark:bg-red-950/20 text-xs">
                      <strong className="text-red-600 dark:text-red-400 font-bold">
                        ঐতিহাসিক গুরুত্ব:{" "}
                      </strong>
                      <span className="text-[var(--color-text)]">{ev.significance}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
