"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, BellRing, CheckCheck, Sliders, Sparkles, ExternalLink, Volume2, ShieldAlert } from "lucide-react";
import { useNotifications, NOTIFICATION_CATEGORIES } from "@/lib/notifications-store";
import { toBengaliDigits, formatRelativeBengali } from "@/lib/bengali-date";
import type { AlertItem } from "@/actions/notifications";

interface NotificationBellMenuProps {
  initialAlerts?: AlertItem[];
}

export function NotificationBellMenu({ initialAlerts = [] }: NotificationBellMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    permission,
    alerts,
    unreadCount,
    readAlertIds,
    requestPermission,
    markAsRead,
    markAllAsRead,
    triggerTestAlert,
    isReady,
  } = useNotifications(initialAlerts);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!isReady) {
    return (
      <div className="text-[var(--color-text-muted)] flex items-center">
        <Bell size={13} className="opacity-50" />
      </div>
    );
  }

  const getCategoryColor = (catId: string) => {
    const c = NOTIFICATION_CATEGORIES.find((item) => item.id === catId);
    return c ? c.color : "bg-gray-500";
  };

  const getCategoryLabel = (catId: string) => {
    const c = NOTIFICATION_CATEGORIES.find((item) => item.id === catId);
    return c ? c.label : "সংবাদ";
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center p-1 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors focus:outline-none"
        aria-label="নোটিফিকেশন সেন্টার"
        title="ব্রেকিং নিউজ ও নোটিফিকেশন"
      >
        {unreadCount > 0 ? (
          <BellRing size={14} className="text-red-500 animate-bounce" />
        ) : (
          <Bell size={14} />
        )}

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-sm ring-1 ring-white dark:ring-stone-900">
            {toBengaliDigits(unreadCount > 9 ? "৯+" : unreadCount)}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-2xl z-50 overflow-hidden text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3.5 py-2.5">
            <div className="flex items-center gap-1.5 font-bold text-[var(--color-text)]">
              <Bell size={14} className="text-[var(--color-primary)]" />
              <span>ব্রেকিং ও জরুরি নোটিফিকেশন</span>
              {unreadCount > 0 && (
                <span className="ml-1 rounded-md bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 px-1.5 py-0.5 text-[10px] font-semibold">
                  {toBengaliDigits(unreadCount)} অপঠিত
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] font-medium transition-colors"
                title="সব পঠিত করুন"
              >
                <CheckCheck size={12} />
                <span>সব পঠিত</span>
              </button>
            )}
          </div>

          {/* Browser Notification Prompt if not granted */}
          {permission !== "granted" && (
            <div className="border-b border-amber-200/50 bg-amber-50/80 p-2.5 dark:border-amber-900/50 dark:bg-amber-950/40">
              <div className="flex items-start gap-2">
                <ShieldAlert size={14} className="mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-900 dark:text-amber-200 text-[11px]">
                    ব্রাউজার পুশ নোটিফিকেশন বন্ধ রয়েছে
                  </p>
                  <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                    গুরুত্বপূর্ণ ব্রেকিং নিউজ সরাসরি পর্দায় পেতে নোটিফিকেশন চালু করুন।
                  </p>
                  <button
                    type="button"
                    onClick={requestPermission}
                    className="mt-1.5 inline-flex items-center gap-1 rounded bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm hover:bg-amber-700 transition-colors"
                  >
                    <span>অনুমতি দিন (Allow)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notification List */}
          <div className="max-h-[320px] overflow-y-auto divide-y divide-[var(--color-border)]">
            {alerts.length === 0 ? (
              <div className="py-8 text-center text-[var(--color-text-muted)]">
                <Bell size={24} className="mx-auto mb-2 opacity-30" />
                <p>কোনো নতুন নোটিফিকেশন নেই</p>
              </div>
            ) : (
              alerts.slice(0, 6).map((item) => {
                const isRead = readAlertIds.includes(item.id);
                return (
                  <Link
                    key={item.id}
                    href={item.url || "/"}
                    onClick={() => {
                      markAsRead(item.id);
                      setIsOpen(false);
                    }}
                    className={`block p-3 transition-colors hover:bg-[var(--color-bg-secondary)] ${
                      !isRead ? "bg-red-50/40 dark:bg-red-950/20 font-medium" : "opacity-85"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold text-white ${getCategoryColor(
                          item.category
                        )}`}
                      >
                        {getCategoryLabel(item.category)}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        {formatRelativeBengali(new Date(item.createdAt))}
                      </span>
                    </div>
                    <h4 className="text-[12px] leading-snug font-bold text-[var(--color-text)] line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-[11px] text-[var(--color-text-muted)] line-clamp-2">
                      {item.message}
                    </p>
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer Controls */}
          <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-2.5 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => triggerTestAlert()}
              className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              title="পরীক্ষামূলকভাবে একটি ব্রেকিং নোটিফিকেশন ট্রাই করুন"
            >
              <Sparkles size={12} />
              <span>টেস্ট অ্যালার্ট</span>
            </button>

            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-primary)] hover:underline"
            >
              <Sliders size={12} />
              <span>সেটিংস ও প্রিফারেন্স</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
