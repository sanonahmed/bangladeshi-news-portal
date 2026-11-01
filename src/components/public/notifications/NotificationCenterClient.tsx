"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Sliders,
  Check,
  CheckCheck,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Send,
  RefreshCw,
  Info,
} from "lucide-react";
import {
  useNotifications,
  NOTIFICATION_CATEGORIES,
  playAlertChime,
} from "@/lib/notifications-store";
import { toBengaliDigits, formatRelativeBengali } from "@/lib/bengali-date";
import { broadcastBreakingAlertAction, type AlertItem } from "@/actions/notifications";

interface NotificationCenterClientProps {
  initialAlerts: AlertItem[];
}

export function NotificationCenterClient({ initialAlerts }: NotificationCenterClientProps) {
  const {
    permission,
    preferences,
    alerts,
    readAlertIds,
    requestPermission,
    updatePreferences,
    toggleCategory,
    markAsRead,
    markAllAsRead,
    triggerTestAlert,
    isReady,
  } = useNotifications(initialAlerts);

  // Category filter state for history tab
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  // Simulator Form State
  const [simTitle, setSimTitle] = useState("");
  const [simMessage, setSimMessage] = useState("");
  const [simCategory, setSimCategory] = useState("breaking");
  const [simPriority, setSimPriority] = useState("urgent");
  const [simUrl, setSimUrl] = useState("/");
  const [simSound, setSimSound] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [broadcastFeedback, setBroadcastFeedback] = useState<string | null>(null);

  if (!isReady) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="flex items-center gap-2 text-stone-500 text-sm">
          <RefreshCw className="animate-spin" size={18} />
          <span>নোটিফিকেশন সেন্টার প্রস্তুত হচ্ছে...</span>
        </div>
      </div>
    );
  }

  // Handle select all / deselect all categories
  const handleSelectAllCategories = () => {
    const allIds = NOTIFICATION_CATEGORIES.map((c) => c.id);
    updatePreferences({ enabledCategories: allIds });
  };

  const handleDeselectAllCategories = () => {
    updatePreferences({ enabledCategories: ["breaking"] }); // keep breaking at minimum
  };

  // Handle broadcast simulator submission
  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simTitle.trim() || !simMessage.trim()) return;

    setIsSubmitting(true);
    setBroadcastFeedback(null);

    try {
      const res = await broadcastBreakingAlertAction({
        title: simTitle.trim(),
        message: simMessage.trim(),
        url: simUrl.trim() || "/",
        category: simCategory,
        priority: simPriority,
        soundAlert: simSound,
      });

      if (res.success) {
        setBroadcastFeedback("ব্রেকিং অ্যালার্ট সফলভাবে সম্প্রচারিত হয়েছে!");
        // Trigger local test simulation
        await triggerTestAlert(simTitle.trim(), simMessage.trim());
        setSimTitle("");
        setSimMessage("");
      } else {
        setBroadcastFeedback(res.message);
      }
    } catch (err: any) {
      setBroadcastFeedback("সম্প্রচার ব্যর্থ হয়েছে: " + (err?.message || "ত্রুটি"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered alerts
  const filteredAlerts = alerts.filter((a) => {
    if (selectedCategoryFilter === "all") return true;
    return a.category === selectedCategoryFilter;
  });

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      {/* Page Title & Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-2">
          <Link href="/" className="hover:text-[var(--color-primary)]">
            হোম
          </Link>
          <span>/</span>
          <span className="text-[var(--color-text)] font-semibold">নোটিফিকেশন সেন্টার</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-md">
                <BellRing size={20} />
              </span>
              <span>পুশ নোটিফিকেশন ও ব্রেকিং অ্যালার্ট</span>
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              জাতীয় জরুরি সংবাদ, নির্বাচন, ক্রিকেট লাইভ স্কোর ও গুরুত্বপূর্ণ খবর সরাসরি আপনার ব্রাউজার ও ডিভাইসে গ্রহণ করুন।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => triggerTestAlert()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs font-bold text-[var(--color-text)] shadow-sm hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
              title="একটি পরীক্ষামূলক নোটিফিকেশন টেস্ট করুন"
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>টেস্ট নোটিফিকেশন</span>
            </button>
            <button
              type="button"
              onClick={playAlertChime}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs font-bold text-[var(--color-text)] shadow-sm hover:border-[var(--color-primary)] transition-all"
              title="অডিও সতর্কতা ধ্বনি বাজিয়ে শুনুন"
            >
              <Volume2 size={14} className="text-blue-500" />
              <span>ধ্বনি শুনুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Settings & Categories */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Browser Permission Status Banner */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                {permission === "granted" ? (
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <ShieldCheck size={22} />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                    <ShieldAlert size={22} />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[var(--color-text)]">
                      ব্রাউজার পুশ স্ট্যাটাস:
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        permission === "granted"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : permission === "denied"
                          ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {permission === "granted"
                        ? "সক্রিয় (Active)"
                        : permission === "denied"
                        ? "ব্লকড (Blocked)"
                        : "অনুমতি অপেক্ষমাণ"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {permission === "granted"
                      ? "আপনার ডিভাইসে ব্রেকিং নোটিফিকেশন সফলভাবে সক্রিয় রয়েছে।"
                      : permission === "denied"
                      ? "ব্রাউজারে নোটিফিকেশন পারমিশন ব্লক করা আছে। ব্রাউজার সেটিংসে গিয়ে এলাউ করুন।"
                      : "ব্রাউজার পারমিশন নিশ্চিত করলে সাইট বন্ধ থাকলেও ব্রেকিং নিউজ সরাসরি স্ক্রিনে আসবে।"}
                  </p>
                </div>
              </div>

              {permission !== "granted" && (
                <button
                  type="button"
                  onClick={requestPermission}
                  className="flex-shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-red-700 transition-colors"
                >
                  <Bell size={14} />
                  <span>নোটিফিকেশন সক্রিয় করুন</span>
                </button>
              )}
            </div>
          </div>

          {/* Card 2: Delivery & Sound Preferences */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 shadow-sm">
            <h3 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2 mb-3">
              <Sliders size={18} className="text-[var(--color-primary)]" />
              <span>ডেলিভারি ও সতর্কতা মাধ্যম</span>
            </h3>

            <div className="space-y-4 divide-y divide-[var(--color-border)]">
              {/* Sound Chime Toggle */}
              <div className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[var(--color-bg-secondary)] text-[var(--color-primary)] mt-0.5">
                    {preferences.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-text)]">
                      ব্রেকিং অডিও সতর্কতা ধ্বনি (News Alert Chime)
                    </h4>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      নতুন কোনো জরুরি ব্রেকিং নিউজ এলে আধুনিক দুই-সুরের অডিও সংকেত বাজবে।
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.soundEnabled}
                    onChange={(e) => updatePreferences({ soundEnabled: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]" />
                </label>
              </div>

              {/* Floating Alert Toggle */}
              <div className="pt-3 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[var(--color-bg-secondary)] text-red-500 mt-0.5">
                    <Radio size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-text)]">
                      পর্দায় ভাসমান ব্রেকিং ব্যানার (Floating Alert Banner)
                    </h4>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      ওয়েবসাইট পড়ার সময় অতি জরুরি খবরের ক্ষেত্রে স্ক্রিনের নিচে সুন্দর ভাসমান কার্ড প্রদর্শিত হবে।
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.floatingAlertsEnabled}
                    onChange={(e) =>
                      updatePreferences({ floatingAlertsEnabled: e.target.checked })
                    }
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]" />
                </label>
              </div>
            </div>
          </div>

          {/* Card 3: Topic & Category Subscriptions */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
                  <Bell size={18} className="text-[var(--color-primary)]" />
                  <span>পছন্দের ক্যাটাগরি ও বিষয় নির্বাচন</span>
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  যেসব ক্যাটাগরির নোটিফিকেশন পেতে চান সেগুলো সিলেক্ট করে রাখুন।
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllCategories}
                  className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
                >
                  সবগুলো নির্বাচন
                </button>
                <span className="text-[var(--color-border)]">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAllCategories}
                  className="text-xs font-semibold text-[var(--color-text-muted)] hover:underline"
                >
                  রিসেট
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {NOTIFICATION_CATEGORIES.map((cat) => {
                const isSelected = preferences.enabledCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 ring-1 ring-[var(--color-primary)]"
                        : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] opacity-75 hover:opacity-100"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded mt-0.5 text-white ${
                        isSelected ? "bg-[var(--color-primary)]" : "border border-stone-400 bg-transparent"
                      }`}
                    >
                      {isSelected && <Check size={13} strokeWidth={3} />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                        <h4 className="text-xs font-bold text-[var(--color-text)]">
                          {cat.label}
                        </h4>
                      </div>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 line-clamp-1">
                        {cat.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 4: Recent Alerts Archive */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
                  <Radio size={18} className="text-red-500 animate-pulse" />
                  <span>সম্প্রতি সম্প্রচারিত ব্রেকিং অ্যালার্টসমূহ</span>
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  গত ৪৮ ঘণ্টার গুরুত্বপূর্ণ নোটিফিকেশন ইতিহাস।
                </p>
              </div>

              {alerts.length > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:underline self-start sm:self-auto"
                >
                  <CheckCheck size={14} />
                  <span>সবগুলো পঠিত চিহ্নিত করুন</span>
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter("all")}
                className={`rounded-full px-3 py-1 font-semibold transition-colors flex-shrink-0 ${
                  selectedCategoryFilter === "all"
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                সব নোটিফিকেশন ({toBengaliDigits(alerts.length)})
              </button>
              {NOTIFICATION_CATEGORIES.map((cat) => {
                const count = alerts.filter((a) => a.category === cat.id).length;
                if (count === 0) return null;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={`rounded-full px-3 py-1 font-semibold transition-colors flex-shrink-0 ${
                      selectedCategoryFilter === cat.id
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    {cat.label} ({toBengaliDigits(count)})
                  </button>
                );
              })}
            </div>

            {/* List */}
            <div className="space-y-3">
              {filteredAlerts.length === 0 ? (
                <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">
                  এই ক্যাটাগরিতে কোনো নোটিফিকেশন নেই।
                </div>
              ) : (
                filteredAlerts.map((item) => {
                  const isRead = readAlertIds.includes(item.id);
                  const catItem = NOTIFICATION_CATEGORIES.find((c) => c.id === item.category);

                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border p-4 transition-all ${
                        !isRead
                          ? "border-red-300/80 bg-red-50/30 dark:border-red-900/40 dark:bg-red-950/20"
                          : "border-[var(--color-border)] bg-[var(--color-bg)]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold text-white ${
                              catItem?.color || "bg-stone-600"
                            }`}
                          >
                            {catItem?.label || item.category}
                          </span>
                          {item.priority === "urgent" && (
                            <span className="rounded bg-red-600/90 text-white px-1.5 py-0.5 text-[10px] font-bold">
                              জরুরি
                            </span>
                          )}
                          {!isRead && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                          )}
                        </div>
                        <span className="text-[11px] text-[var(--color-text-muted)]">
                          {formatRelativeBengali(new Date(item.createdAt))}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[var(--color-text)] leading-snug">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)] leading-relaxed">
                        {item.message}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-[var(--color-border)] flex items-center justify-between gap-2 text-xs">
                        <span className="text-[11px] text-[var(--color-text-muted)]">
                          {item.clicksCount > 0
                            ? `${toBengaliDigits(item.clicksCount)} বার পঠিত`
                            : "নতুন অ্যালার্ট"}
                        </span>
                        <Link
                          href={item.url || "/"}
                          onClick={() => markAsRead(item.id)}
                          className="inline-flex items-center gap-1 font-bold text-[var(--color-primary)] hover:underline"
                        >
                          <span>সংবাদটি পড়ুন</span>
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Live Simulator & Guidelines */}
        <div className="space-y-6">
          {/* Card: Live Alert Simulator */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white">
                <Send size={15} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text)]">
                  লাইভ অ্যালার্ট সিমুলেটর
                </h3>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  ব্রেকিং নিউজ সম্প্রচার ও তাৎক্ষণিক টেস্ট করুন
                </p>
              </div>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[var(--color-text)] mb-1">
                  শিরোনাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: জরুরি ব্রেকিং নিউজ..."
                  value={simTitle}
                  onChange={(e) => setSimTitle(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--color-text)] mb-1">
                  বিবরণ / সারসংক্ষেপ <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="সংক্ষিপ্ত বিবরণ লিখুন যা নোটিফিকেশনে ভেসে উঠবে..."
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[var(--color-text)] mb-1">
                    ক্যাটাগরি
                  </label>
                  <select
                    value={simCategory}
                    onChange={(e) => setSimCategory(e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2.5 py-2 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                  >
                    {NOTIFICATION_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--color-text)] mb-1">
                    অগ্রাধিকার
                  </label>
                  <select
                    value={simPriority}
                    onChange={(e) => setSimPriority(e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2.5 py-2 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                  >
                    <option value="urgent">জরুরি (Urgent)</option>
                    <option value="high">উচ্চ (High)</option>
                    <option value="normal">স্বাভাবিক (Normal)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--color-text)] mb-1">
                  সংবাদের লিংক (URL)
                </label>
                <input
                  type="text"
                  placeholder="/"
                  value={simUrl}
                  onChange={(e) => setSimUrl(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="simSoundCheck"
                  checked={simSound}
                  onChange={(e) => setSimSound(e.target.checked)}
                  className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <label htmlFor="simSoundCheck" className="text-xs text-[var(--color-text-muted)] cursor-pointer">
                  অডিও সংকেত ধ্বনি সক্রিয় রাখুন
                </label>
              </div>

              {broadcastFeedback && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-semibold ${
                    broadcastFeedback.includes("সফল")
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300"
                  }`}
                >
                  {broadcastFeedback}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  <Send size={14} />
                )}
                <span>তাৎক্ষণিক অ্যালার্ট সম্প্রচার করুন</span>
              </button>
            </form>
          </div>

          {/* Card: Push Notification Guide */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 text-xs space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-[var(--color-text)]">
              <Info size={15} className="text-[var(--color-primary)]" />
              <span>ওয়েব পুশ নোটিফিকেশন তথ্য</span>
            </div>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              • <strong>সার্ভিস ওয়ার্কার সাপোর্ট:</strong> এই পোর্টালটি ব্যাকগ্রাউন্ড সার্ভিস ওয়ার্কার (`/sw.js`) এবং আধুনিক W3C Push API সমর্থন করে।
            </p>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              • <strong>প্রাইভেসি বান্ধব:</strong> কোনো ব্যক্তিগত তথ্য ট্র্যাক করা হয় না; আপনার নির্বাচিত ক্যাটাগরির উপর ভিত্তি করে ডিভাইস ব্রাউজারে নোটিফিকেশন প্রদর্শিত হয়।
            </p>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              • <strong>মোবাইল অপ্টিমাইজড:</strong> অ্যান্ড্রয়েড ক্রোম ও সাফারি ব্যবহারকারীরা নোটিফিকেশনে ট্যাপ করে তাৎক্ষণিক লাইভ স্কোর বা খবরের বিস্তারিত দেখতে পারবেন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
