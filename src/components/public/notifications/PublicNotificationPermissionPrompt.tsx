"use client";

import { useState, useSyncExternalStore } from "react";
import { Bell, X } from "lucide-react";
import { registerServiceWorker } from "@/lib/notifications-store";

interface PublicNotificationPermissionPromptProps {
  enabled: boolean;
}

type BrowserNotificationPermission = NotificationPermission | "unsupported" | "loading";

function subscribeToNotificationPermission() {
  return () => {};
}

function getNotificationPermission(): BrowserNotificationPermission {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

function getServerNotificationPermission(): BrowserNotificationPermission {
  return "loading";
}

export function PublicNotificationPermissionPrompt({ enabled }: PublicNotificationPermissionPromptProps) {
  const browserPermission = useSyncExternalStore(
    subscribeToNotificationPermission,
    getNotificationPermission,
    getServerNotificationPermission
  );
  const [permissionOverride, setPermissionOverride] = useState<NotificationPermission | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const permission = permissionOverride ?? browserPermission;

  if (!enabled || isDismissed || permission === "loading" || permission === "unsupported" || permission === "granted") {
    return null;
  }

  async function handleEnableNotifications() {
    if (!("Notification" in window)) {
      setPermissionOverride(null);
      return;
    }

    setIsRequesting(true);
    try {
      const result = await Notification.requestPermission();
      setPermissionOverride(result);
      if (result === "granted") {
        setIsDismissed(true);
        await registerServiceWorker();
      }
    } catch (error) {
      console.warn("Notification permission request failed:", error);
    } finally {
      setIsRequesting(false);
    }
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-[60] w-[calc(100vw-2rem)] max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 text-[var(--color-text)] shadow-2xl"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <Bell size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-sm font-bold">ব্রেকিং নিউজ নোটিফিকেশন চালু করুন</h2>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              aria-label="নোটিফিকেশন অনুরোধ বন্ধ করুন"
              className="-mr-1 -mt-1 rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]"
            >
              <X size={16} />
            </button>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
            গুরুত্বপূর্ণ খবর প্রকাশিত হলে ব্রাউজারে নোটিফিকেশন পেতে অনুমতি দিন।
          </p>
          {permission === "denied" ? (
            <p className="mt-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
              আপনার ব্রাউজারে নোটিফিকেশন বন্ধ আছে। চালু করতে ব্রাউজারের Site settings থেকে এই সাইটের Notifications অনুমতি দিন।
            </p>
          ) : (
            <button
              type="button"
              onClick={handleEnableNotifications}
              disabled={isRequesting}
              className="mt-3 rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
            >
              {isRequesting ? "অনুমতির অপেক্ষায়…" : "নোটিফিকেশন চালু করুন"}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
