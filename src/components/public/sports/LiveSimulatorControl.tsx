"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Play, Sparkles, CheckCircle2 } from "lucide-react";
import { toBengaliDigits } from "@/lib/bengali-date";

interface LiveSimulatorControlProps {
  onSimulateBall?: () => void;
  sport: "cricket" | "football";
  onRefresh: () => void;
}

export function LiveSimulatorControl({
  onSimulateBall,
  sport,
  onRefresh,
}: LiveSimulatorControlProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(15);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onRefresh();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, onRefresh]);

  const handleSimulate = () => {
    if (onSimulateBall) {
      onSimulateBall();
      setToastMsg(
        sport === "cricket"
          ? "নতুন বলের ধারাভাষ্য ও স্কোর লাইভ আপডেট হয়েছে!"
          : "মিনিটের নতুন আপডেট যুক্ত হয়েছে!"
      );
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  return (
    <div className="bg-zinc-900 text-white p-3 border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs px-4 py-2 rounded shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Auto Refresh Status */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded accent-[var(--color-primary)] cursor-pointer"
          />
          <span className="font-semibold text-zinc-300">
            অটো রিফ্রেশ {autoRefresh ? `(${toBengaliDigits(countdown)} সে.)` : "(বন্ধ)"}
          </span>
        </label>

        <button
          onClick={onRefresh}
          className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors p-1"
          title="ম্যানুয়ালি রিফ্রেশ করুন"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {/* Simulate Ball Button */}
      {onSimulateBall && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-400 hidden sm:inline">
            লাইভ ডেমো সিমুলেশন:
          </span>
          <button
            onClick={handleSimulate}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 font-bold rounded-none transition-colors flex items-center gap-1.5 shadow-sm text-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {sport === "cricket" ? "পরবর্তী বল সিমুলেট করুন" : "ম্যাচ আপডেট সিমুলেট"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
