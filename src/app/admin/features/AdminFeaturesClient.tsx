"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import {
  SlidersHorizontal,
  Zap,
  Split,
  MessageSquare,
  Headphones,
  Bell,
  Bookmark,
  Trophy,
  CloudSun,
  Vote,
  Scale,
  ShieldCheck,
  Newspaper,
  Landmark,
  Film,
  Image as ImageIcon,
  Flame,
  Sparkles,
  Search,
  DollarSign,
  ScrollText,
  CheckSquare,
  Shield,
  ShieldAlert,
  CheckCircle2,
  RotateCcw,
  Check,
  X,
  Settings,
  AlertCircle,
} from "lucide-react";
import {
  FEATURE_CATALOG,
  type FeatureDefinition,
  type FeatureFlags,
  type FeatureCategory,
} from "@/lib/features";
import {
  updateFeatureFlag,
  updateAllFeatureFlags,
  resetFeatureFlagsToDefault,
} from "@/actions/features";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

// Dynamic Icon Map
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Zap,
  Split,
  MessageSquare,
  Headphones,
  Bell,
  Bookmark,
  Trophy,
  CloudSun,
  Vote,
  Scale,
  ShieldCheck,
  Newspaper,
  Landmark,
  Film,
  Image: ImageIcon,
  Flame,
  Sparkles,
  Search,
  SlidersHorizontal,
  DollarSign,
  ScrollText,
  CheckSquare,
  Shield,
  ShieldAlert,
};

interface AdminFeaturesClientProps {
  initialFlags: FeatureFlags;
}

export function AdminFeaturesClient({ initialFlags }: AdminFeaturesClientProps) {
  const { language, formatNumber } = useAdminLanguage();
  const isEn = language === "en";

  const [flags, setFlags] = useState<FeatureFlags>(initialFlags);
  const [selectedCategory, setSelectedCategory] = useState<"all" | FeatureCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter features based on search query and category
  const filteredFeatures = useMemo(() => {
    return FEATURE_CATALOG.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.nameBn.toLowerCase().includes(q) ||
        item.nameEn.toLowerCase().includes(q) ||
        item.descriptionBn.toLowerCase().includes(q) ||
        item.descriptionEn.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Statistics
  const totalCount = FEATURE_CATALOG.length;
  const activeCount = FEATURE_CATALOG.filter((f) => flags[f.id] !== false).length;
  const inactiveCount = totalCount - activeCount;

  // Handle single toggle
  const handleToggle = async (feature: FeatureDefinition) => {
    const current = flags[feature.id] !== false;
    const nextVal = !current;
    setLoadingKey(feature.id);

    // Optimistic UI update
    setFlags((prev) => ({ ...prev, [feature.id]: nextVal }));

    try {
      const res = await updateFeatureFlag(feature.id, nextVal);
      if (res.success) {
        showToast(
          isEn
            ? `"${feature.nameEn}" is now ${nextVal ? "ENABLED" : "DISABLED"}!`
            : `"${feature.nameBn}" ফিচারটি সফলভাবে ${nextVal ? "চালু" : "বন্ধ"} করা হয়েছে!`
        );
      } else {
        // Revert on error
        setFlags((prev) => ({ ...prev, [feature.id]: current }));
        showToast(res.error || "Failed to update feature");
      }
    } catch {
      setFlags((prev) => ({ ...prev, [feature.id]: current }));
      showToast("Error updating feature");
    } finally {
      setLoadingKey(null);
    }
  };

  // Handle Enable All
  const handleEnableAll = () => {
    startTransition(async () => {
      const newFlags: FeatureFlags = {};
      for (const feat of FEATURE_CATALOG) {
        newFlags[feat.id] = true;
      }
      setFlags(newFlags);
      const res = await updateAllFeatureFlags(newFlags);
      if (res.success) {
        showToast(
          isEn
            ? "All portal features have been enabled!"
            : "সবগুলো ফিচার সফলভাবে চালু করা হয়েছে!"
        );
      } else {
        showToast("Failed to enable all features");
      }
    });
  };

  // Handle Reset to Default
  const handleResetDefaults = () => {
    startTransition(async () => {
      const res = await resetFeatureFlagsToDefault();
      if (res.success) {
        const defaults: FeatureFlags = {};
        for (const feat of FEATURE_CATALOG) {
          defaults[feat.id] = feat.defaultEnabled;
        }
        setFlags(defaults);
        showToast(
          isEn
            ? "Features reset to standard defaults."
            : "সবগুলো ফিচার স্ট্যান্ডার্ড ডিফল্টে রিস্টোর করা হয়েছে।"
        );
      } else {
        showToast("Failed to reset defaults");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Tabs Navigation */}
      <div className="border-b border-[var(--color-border)] pb-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--color-text)] flex items-center gap-2 tracking-tight">
              <span className="p-1.5 rounded-lg bg-[var(--color-primary)] text-white">
                <SlidersHorizontal size={20} />
              </span>
              <span>{isEn ? "Portal Features & Module Control" : "ফিচার সেটিংস ও মডিউল কন্ট্রোল"}</span>
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {isEn
                ? "Turn ON/OFF any public interactive section, reader widget or admin desk module across the entire portal in real time"
                : "পোর্টালের যেকোনো পাবলিক সেকশন, পাঠক উইজেট ও এডমিন টুল সরাসরি ডাটাবেজ থেকে চালু বা বন্ধ করুন"}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleEnableAll}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text)] transition-colors shadow-2xs cursor-pointer"
            >
              <Check size={14} className="text-emerald-600" />
              <span>{isEn ? "Enable All" : "সব চালু করুন"}</span>
            </button>
            <button
              type="button"
              onClick={handleResetDefaults}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>{isEn ? "Reset Defaults" : "ডিফল্ট রিস্টোর"}</span>
            </button>
          </div>
        </div>

        {/* Setting Navigation Tabs */}
        <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-border)]">
          <Link
            href="/admin/settings"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            <Settings size={14} />
            <span>{isEn ? "General Identity Settings" : "সাধারণ সেটিংস ও পরিচয়"}</span>
          </Link>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[var(--color-primary)] text-white shadow-xs">
            <SlidersHorizontal size={14} />
            <span>{isEn ? "Feature Toggles (Active)" : "ফিচার কন্ট্রোল (সক্রিয়)"}</span>
          </div>
        </div>
      </div>

      {/* Metrics & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Features */}
        <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs text-[var(--color-text-muted)] font-semibold block">
              {isEn ? "Total Configured Features" : "মোট সমর্থিত ফিচার"}
            </span>
            <span className="text-2xl font-black text-[var(--color-text)] font-mono">
              {formatNumber(totalCount)}
            </span>
          </div>
          <span className="p-2.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]">
            <SlidersHorizontal size={20} />
          </span>
        </div>

        {/* Active Features */}
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold block">
              {isEn ? "Active / Enabled Features" : "বর্তমানে সক্রিয় / চালু ফিচার"}
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {formatNumber(activeCount)}
            </span>
          </div>
          <span className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
            <Check size={20} />
          </span>
        </div>

        {/* Inactive Features */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-[var(--color-bg)] flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs text-[var(--color-text-muted)] font-semibold block">
              {isEn ? "Inactive / Disabled Features" : "নিষ্ক্রিয় / বন্ধ রাখা ফিচার"}
            </span>
            <span className="text-2xl font-black text-[var(--color-text)] font-mono">
              {formatNumber(inactiveCount)}
            </span>
          </div>
          <span className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <X size={20} />
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              selectedCategory === "all"
                ? "bg-[var(--color-primary)] text-white shadow-2xs"
                : "bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
            }`}
          >
            {isEn ? "All Features" : "সকল ফিচার"} ({formatNumber(totalCount)})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("news")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              selectedCategory === "news"
                ? "bg-[var(--color-primary)] text-white shadow-2xs"
                : "bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
            }`}
          >
            {isEn ? "News & Readers" : "নিউজ ও পাঠক"}
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("widgets")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              selectedCategory === "widgets"
                ? "bg-[var(--color-primary)] text-white shadow-2xs"
                : "bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
            }`}
          >
            {isEn ? "Public Widgets" : "উইজেট ও স্পেশাল কর্নার"}
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("admin")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              selectedCategory === "admin"
                ? "bg-[var(--color-primary)] text-white shadow-2xs"
                : "bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
            }`}
          >
            {isEn ? "Admin & Editorial" : "এডমিন ও সম্পাদকীয় টুলস"}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? "Search feature name or ID..." : "ফিচার বা মডিউল খুঁজুন..."}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFeatures.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-[var(--color-border)] rounded-xl bg-[var(--color-bg)] space-y-2">
            <AlertCircle size={28} className="mx-auto text-[var(--color-text-muted)] opacity-60" />
            <p className="text-xs font-bold text-[var(--color-text)]">
              {isEn ? "No matching features found" : "কোনো ফিচার খুঁজে পাওয়া যায়নি"}
            </p>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              {isEn ? "Try adjusting your search query or filter" : "সার্চ কোয়েরি বা ক্যাটাগরি ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন"}
            </p>
          </div>
        ) : (
          filteredFeatures.map((feature) => {
            const isEnabled = flags[feature.id] !== false;
            const Icon = ICON_MAP[feature.iconName] || SlidersHorizontal;
            const isLoading = loadingKey === feature.id;

            return (
              <div
                key={feature.id}
                className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-2xs ${
                  isEnabled
                    ? "bg-[var(--color-bg)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                    : "bg-[var(--color-bg-secondary)] border-zinc-200 dark:border-zinc-800 opacity-80"
                }`}
              >
                {/* Top Meta & Toggle */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isEnabled
                          ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                          : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      <Icon size={20} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-[var(--color-text)] leading-snug">
                          {isEn ? feature.nameEn : feature.nameBn}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isEnabled
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                              : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700"
                          }`}
                        >
                          {isEnabled ? (isEn ? "Active" : "সক্রিয়") : (isEn ? "Disabled" : "বন্ধ")}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--color-text-muted)] block mt-0.5">
                        ID: {feature.id}
                      </span>
                    </div>
                  </div>

                  {/* Accessible Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isEnabled}
                    disabled={isLoading}
                    onClick={() => handleToggle(feature)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 ${
                      isEnabled ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"
                    } ${isLoading ? "opacity-50 cursor-wait" : ""}`}
                    title={
                      isEnabled
                        ? isEn
                          ? "Click to disable this feature"
                          : "ফিচারটি বন্ধ করতে ক্লিক করুন"
                        : isEn
                        ? "Click to enable this feature"
                        : "ফিচারটি চালু করতে ক্লিক করুন"
                    }
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  {isEn ? feature.descriptionEn : feature.descriptionBn}
                </p>

                {/* Bottom Category Tag */}
                <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                  <span className="font-semibold">
                    {feature.category === "news"
                      ? isEn
                        ? "Category: News & Reader"
                        : "বিভাগ: নিউজ ও পাঠক"
                      : feature.category === "widgets"
                      ? isEn
                        ? "Category: Public Widget"
                        : "বিভাগ: উইজেট ও কর্নার"
                      : isEn
                      ? "Category: Admin Tool"
                      : "বিভাগ: এডমিন ও সম্পাদকীয়"}
                  </span>

                  <span className="text-[10px]">
                    {isEnabled ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                        {isEn ? "Online in Portal" : "পোর্টালজুড়ে সক্রিয়"}
                      </span>
                    ) : (
                      <span className="text-zinc-500 font-medium">
                        {isEn ? "Offline / Hidden" : "স্থগিত / লুকায়িত"}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
