"use client";

import { useEffect, useState, useCallback } from "react";
import type { AlertItem } from "@/actions/notifications";

export interface NotificationPreferences {
  enabledCategories: string[];
  soundEnabled: boolean;
  floatingAlertsEnabled: boolean;
}

export const NOTIFICATION_CATEGORIES = [
  { id: "breaking", label: "ব্রেকিং ও জরুরি খবর", color: "bg-red-500", desc: "জরুরি জাতীয় দুর্যোগ, রাজনৈতিক ও তাৎক্ষণিক ঘটনা" },
  { id: "national", label: "জাতীয় সংবাদ", color: "bg-blue-600", desc: "সারাদেশের গুরুত্বপূর্ণ খবর ও সরকারি সিদ্ধান্ত" },
  { id: "sports", label: "খেলাধুলা ও লাইভ স্কোর", color: "bg-emerald-600", desc: "বাংলাদেশ ক্রিকেট, বিপিএল, ফুটবল ও ম্যাচ ফলাফল" },
  { id: "politics", label: "রাজনীতি", color: "bg-purple-600", desc: "নির্বাচন, রাজনৈতিক বিতর্ক ও দলীয় বিবৃতি" },
  { id: "business", label: "বাণিজ্য ও অর্থনীতি", color: "bg-amber-600", desc: "শেয়ারবাজার, ডলার রেট, বাজেট ও দ্রব্যমূল্য" },
  { id: "world", label: "আন্তর্জাতিক", color: "bg-cyan-600", desc: "বিশ্ব পরিস্থিতি, যুদ্ধ, কূটনীতি ও বৈশ্বিক সম্মেলন" },
  { id: "entertainment", label: "বিনোদন ও জীবনধারা", color: "bg-pink-600", desc: "চলচ্চিত্র, নাটক, সংস্কৃতি ও লাইফস্টাইল" },
];

const PREFS_STORAGE_KEY = "bd_barta_notification_prefs";
const READ_ALERTS_STORAGE_KEY = "bd_barta_read_alerts";
const DISMISSED_ALERTS_STORAGE_KEY = "bd_barta_dismissed_alerts";

const DEFAULT_PREFS: NotificationPreferences = {
  enabledCategories: ["breaking", "national", "sports"],
  soundEnabled: true,
  floatingAlertsEnabled: true,
};

/**
 * Plays a pleasant double-tone news alert chime using Web Audio API synthesis
 */
export function playAlertChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // First tone: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second tone: 880 Hz (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.16, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch (err) {
    // Autoplay or audio context permission restricted
  }
}

/**
 * Register Service Worker for push background handling
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    return reg;
  } catch (err) {
    console.warn("Service worker registration error:", err);
    return null;
  }
}

/**
 * Show native browser push notification
 */
export async function showNativeBrowserNotification(
  title: string,
  message: string,
  url: string = "/"
): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;

  try {
    // Try service worker showNotification first
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body: message,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          data: { url },
        });
        return true;
      }
    }

    // Direct Notification fallback
    const notification = new Notification(title, {
      body: message,
      icon: "/favicon.ico",
      data: { url },
    });

    notification.onclick = () => {
      window.focus();
      window.location.href = url;
    };
    return true;
  } catch (err) {
    console.warn("Error triggering native browser notification:", err);
    return false;
  }
}

/**
 * Custom React Hook for Managing Notification State & Preferences
 */
export function useNotifications(initialAlerts: AlertItem[] = []) {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [readAlertIds, setReadAlertIds] = useState<string[]>([]);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [activeFloatingAlert, setActiveFloatingAlert] = useState<AlertItem | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Sync state from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check browser notification support
    if (!("Notification" in window)) {
      setPermission("unsupported");
    } else {
      setPermission(Notification.permission);
    }

    // Load preferences
    try {
      const savedPrefs = localStorage.getItem(PREFS_STORAGE_KEY);
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
    } catch (e) {
      // ignore
    }

    // Load read alerts
    try {
      const savedRead = localStorage.getItem(READ_ALERTS_STORAGE_KEY);
      if (savedRead) {
        setReadAlertIds(JSON.parse(savedRead));
      }
    } catch (e) {
      // ignore
    }

    // Load dismissed alerts
    try {
      const savedDismissed = localStorage.getItem(DISMISSED_ALERTS_STORAGE_KEY);
      if (savedDismissed) {
        setDismissedAlertIds(JSON.parse(savedDismissed));
      }
    } catch (e) {
      // ignore
    }

    registerServiceWorker();
    setIsReady(true);
  }, []);

  // Update initial alerts if props change
  useEffect(() => {
    if (initialAlerts.length > 0) {
      setAlerts(initialAlerts);
    }
  }, [initialAlerts]);

  // Determine active floating alert (highest priority recent alert not dismissed)
  useEffect(() => {
    if (!isReady || !preferences.floatingAlertsEnabled) {
      setActiveFloatingAlert(null);
      return;
    }

    const urgentAlert = alerts.find(
      (a) =>
        (a.priority === "urgent" || a.category === "breaking") &&
        !dismissedAlertIds.includes(a.id) &&
        preferences.enabledCategories.includes(a.category)
    );

    setActiveFloatingAlert(urgentAlert || null);
  }, [alerts, dismissedAlertIds, preferences, isReady]);

  // Request browser permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission | "unsupported"> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return "unsupported";
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        if (preferences.soundEnabled) {
          playAlertChime();
        }
        await showNativeBrowserNotification(
          "দৈনিক বাংলাদেশ বার্তা",
          "পুশ নোটিফিকেশন সফলভাবে সক্রিয় হয়েছে। গুরুত্বপূর্ণ খবর এখন সবার আগে আপনার পর্দায় পৌঁছে যাবে।",
          "/notifications"
        );
      }
      return result;
    } catch (err) {
      console.warn("Permission request error:", err);
      return "denied";
    }
  }, [preferences.soundEnabled]);

  // Save Preferences
  const updatePreferences = useCallback((newPrefs: Partial<NotificationPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...newPrefs };
      try {
        localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  }, []);

  // Toggle Category
  const toggleCategory = useCallback((categoryId: string) => {
    setPreferences((prev) => {
      const exists = prev.enabledCategories.includes(categoryId);
      const newCategories = exists
        ? prev.enabledCategories.filter((c) => c !== categoryId)
        : [...prev.enabledCategories, categoryId];
      const updated = { ...prev, enabledCategories: newCategories };
      try {
        localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  }, []);

  // Mark an alert as read
  const markAsRead = useCallback((alertId: string) => {
    setReadAlertIds((prev) => {
      if (prev.includes(alertId)) return prev;
      const updated = [...prev, alertId];
      try {
        localStorage.setItem(READ_ALERTS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    const allIds = alerts.map((a) => a.id);
    setReadAlertIds(allIds);
    try {
      localStorage.setItem(READ_ALERTS_STORAGE_KEY, JSON.stringify(allIds));
    } catch (e) {
      // ignore
    }
  }, [alerts]);

  // Dismiss floating alert
  const dismissFloatingAlert = useCallback((alertId: string) => {
    setDismissedAlertIds((prev) => {
      const updated = [...prev, alertId];
      try {
        localStorage.setItem(DISMISSED_ALERTS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
    setActiveFloatingAlert(null);
  }, []);

  // Trigger test alert
  const triggerTestAlert = useCallback(async (customTitle?: string, customMessage?: string) => {
    const testTitle = customTitle || "জরুরি ব্রেকিং নিউজ: পদ্মার তীরে নতুন অর্থনৈতিক অঞ্চলের উদ্বোধন";
    const testMessage =
      customMessage || "বাণিজ্য ও বিনিয়োগ বৃদ্ধিতে নতুন অর্থনৈতিক অঞ্চলের আনুষ্ঠানিক উদ্বোধন করেছেন সংশ্লিষ্ট মন্ত্রণালয়।";

    const testItem: AlertItem = {
      id: `test-alert-${Date.now()}`,
      title: testTitle,
      message: testMessage,
      url: "/",
      category: "breaking",
      priority: "urgent",
      soundAlert: preferences.soundEnabled,
      clicksCount: 1,
      createdAt: new Date().toISOString(),
    };

    setAlerts((prev) => [testItem, ...prev]);

    if (preferences.soundEnabled) {
      playAlertChime();
    }

    if (permission === "granted") {
      await showNativeBrowserNotification(testTitle, testMessage, "/");
    }

    return testItem;
  }, [preferences.soundEnabled, permission]);

  // Unread count
  const unreadCount = alerts.filter(
    (a) => !readAlertIds.includes(a.id) && preferences.enabledCategories.includes(a.category)
  ).length;

  return {
    permission,
    preferences,
    alerts,
    unreadCount,
    readAlertIds,
    activeFloatingAlert,
    isReady,
    requestPermission,
    updatePreferences,
    toggleCategory,
    markAsRead,
    markAllAsRead,
    dismissFloatingAlert,
    triggerTestAlert,
  };
}
