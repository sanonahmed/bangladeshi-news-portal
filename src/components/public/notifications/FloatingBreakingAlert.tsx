"use client";

import Link from "next/link";
import { Radio, X, ExternalLink, Volume2, ShieldAlert } from "lucide-react";
import { useNotifications, NOTIFICATION_CATEGORIES } from "@/lib/notifications-store";
import type { AlertItem } from "@/actions/notifications";

interface FloatingBreakingAlertProps {
  initialAlerts?: AlertItem[];
}

export function FloatingBreakingAlert({ initialAlerts = [] }: FloatingBreakingAlertProps) {
  const {
    activeFloatingAlert,
    preferences,
    dismissFloatingAlert,
    markAsRead,
    isReady,
  } = useNotifications(initialAlerts);

  if (!isReady || !preferences.floatingAlertsEnabled || !activeFloatingAlert) {
    return null;
  }

  const categoryItem = NOTIFICATION_CATEGORIES.find(
    (c) => c.id === activeFloatingAlert.category
  );
  const catLabel = categoryItem ? categoryItem.label : "জরুরি সংবাদ";

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-4 right-4 z-50 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] rounded-xl border-2 border-red-500/80 bg-[var(--color-bg)] p-3.5 shadow-2xl backdrop-blur-md dark:border-red-600/80 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white animate-pulse">
            <Radio size={14} />
          </span>
          <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
            ব্রেকিং অ্যালার্ট
          </span>
          <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">
            • {catLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={() => dismissFloatingAlert(activeFloatingAlert.id)}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors p-1"
          aria-label="নোটিফিকেশন বন্ধ করুন"
          title="বন্ধ করুন"
        >
          <X size={15} />
        </button>
      </div>

      <div className="mt-2">
        <h3 className="text-sm font-bold leading-snug text-[var(--color-text)]">
          {activeFloatingAlert.title}
        </h3>
        <p className="mt-1 text-xs text-[var(--color-text-muted)] line-clamp-2">
          {activeFloatingAlert.message}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-[var(--color-border)]">
        <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
          <ShieldAlert size={11} className="text-red-500" />
          <span>দৈনিক বাংলাদেশ বার্তা লাইভ ডেস্ক</span>
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => dismissFloatingAlert(activeFloatingAlert.id)}
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] px-2 py-1 font-medium transition-colors"
          >
            পরে দেখুন
          </button>
          <Link
            href={activeFloatingAlert.url || "/"}
            onClick={() => {
              markAsRead(activeFloatingAlert.id);
              dismissFloatingAlert(activeFloatingAlert.id);
            }}
            className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1 text-xs font-bold text-white shadow hover:bg-red-700 transition-colors"
          >
            <span>এখনই পড়ুন</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
