"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toBengaliDigits, formatBengaliDate, formatBengaliDateTime, formatBengaliDay } from "@/lib/bengali-date";

export type AdminLanguage = "bn" | "en";

interface AdminLanguageContextType {
  language: AdminLanguage;
  isEn: boolean;
  setLanguage: (lang: AdminLanguage) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  formatNumber: (n: number | string) => string;
  formatDateString: (d: Date | string | null | undefined) => string;
  formatDateTimeString: (d: Date | string | null | undefined) => string;
  formatDayString: (d: Date | string | null | undefined) => string;
}

const DICTIONARY: Record<string, { bn: string; en: string }> = {
  // Top Nav
  "nav.systemTitle": {
    bn: "বাংলা নিউজ ডিজিটাল পাবলিশিং ম্যানেজমেন্ট সিস্টেম",
    en: "Bangla News Digital Publishing Management System",
  },
  "nav.theme": { bn: "থিম পরিবর্তন", en: "Switch Theme" },
  "nav.logout": { bn: "লগআউট", en: "Sign out" },
  "nav.switchLanguage": { bn: "ভাষা পরিবর্তন করুন", en: "Switch Language" },
  "nav.lang.bn": { bn: "বাংলা (BN)", en: "Bangla (BN)" },
  "nav.lang.en": { bn: "English (EN)", en: "English (EN)" },

  // Sidebar Masthead & Footer
  "brand.title": { bn: "দৈনিক বাংলাদেশ বার্তা", en: "Daily Bangladesh Barta" },
  "brand.subtitle": { bn: "সম্পাদকীয় ডেস্ক", en: "Editorial Desk" },
  "brand.viewSite": { bn: "পত্রিকার মূল পাতা", en: "View Public Website" },
  "search.menu": { bn: "মেনু খুঁজুন...", en: "Search menu..." },
  "search.noMatch": { bn: "মেলেনি", en: "No matches found" },

  // Sidebar Groups
  "group.overview": { bn: "ওভারভিউ", en: "Overview" },
  "group.newsroom": { bn: "নিউজ রুম ও প্রকাশনা", en: "Newsroom & Publishing" },
  "group.live": { bn: "লাইভ ও সম্প্রচার", en: "Live & Broadcast" },
  "group.engagement": { bn: "পাঠক ও এনগেজমেন্ট", en: "Reader & Engagement" },
  "group.media": { bn: "মিডিয়া হাব", en: "Media Hub" },
  "group.system": { bn: "প্রশাসন ও কনফিগারেশন", en: "System & Settings" },

  // Sidebar Nav Items
  "menu.dashboard": { bn: "ড্যাশবোর্ড", en: "Dashboard" },
  "menu.analytics": { bn: "পাঠক বিশ্লেষণ ও মেট্রিক্স", en: "Reader Analytics & Metrics" },
  "menu.articles": { bn: "সংবাদ ব্যবস্থাপনা", en: "Article Management" },
  "menu.newArticle": { bn: "নতুন সংবাদ রচনা", en: "Create New Story" },
  "menu.reviews": { bn: "পর্যালোচনা ও অনুমোদন", en: "Review & Approval" },
  "menu.aiAssistant": { bn: "এআই সহকারী", en: "AI News Assistant" },
  "menu.breaking": { bn: "ব্রেকিং নিউজ টিকার", en: "Breaking News Ticker" },
  "menu.notifications": { bn: "পুশ নোটিফিকেশন সেন্টার", en: "Push Notification Center" },
  "menu.socialPreview": { bn: "সোশ্যাল কার্ড প্রিভিউ", en: "Social Card Preview" },
  "menu.factChecks": { bn: "ফ্যাক্ট-চেক কর্নার", en: "Fact-Check Desk" },
  "menu.polls": { bn: "অনলাইন ভোট ও জরিপ", en: "Polls & Public Opinion" },
  "menu.comments": { bn: "মন্তব্য মডারেশন", en: "Comment Moderation" },
  "menu.media": { bn: "মিডিয়া লাইব্রেরি", en: "Media Library" },
  "menu.videos": { bn: "ভিডিও সংবাদ", en: "Video Stories" },
  "menu.homepage": { bn: "হোমপেজ বিন্যাস", en: "Homepage Layout" },
  "menu.categories": { bn: "বিভাগ ও ক্যাটাগরি", en: "Categories & Desks" },
  "menu.tags": { bn: "ট্যাগসমূহ", en: "Tags & Keywords" },
  "menu.navigation": { bn: "নেভিগেশন মেনু", en: "Navigation Menu" },
  "menu.users": { bn: "ব্যবহারকারী ও সাংবাদিক", en: "Staff & Journalists" },
  "menu.roles": { bn: "রোল ও পারমিশন", en: "Roles & Permissions" },
  "menu.ads": { bn: "বিজ্ঞাপন ব্যবস্থাপনা", en: "Ad Management" },
  "menu.settings": { bn: "ওয়েবসাইট সেটিংস", en: "Site Settings" },
  "menu.auditLogs": { bn: "অডিট লগ", en: "Audit Logs" },

  // Dashboard Page
  "dash.title": { bn: "সম্পাদকীয় ড্যাশবোর্ড", en: "Editorial Dashboard" },
  "dash.bureau": { bn: "ঢাকা ব্যুরো", en: "Dhaka Bureau" },
  "dash.btnNewArticle": { bn: "নতুন সংবাদ", en: "New Story" },
  "dash.btnBreaking": { bn: "ব্রেকিং নিউজ", en: "Breaking News" },

  // Dashboard Stats
  "stat.published": { bn: "প্রকাশিত সংবাদ", en: "Published Stories" },
  "stat.pending": { bn: "পর্যালোচনার অপেক্ষায়", en: "Pending Review" },
  "stat.breaking": { bn: "চলমান ব্রেকিং নিউজ", en: "Active Breaking News" },
  "stat.polls": { bn: "সক্রিয় জনমত জরিপ", en: "Active Polls" },
  "stat.viewAll": { bn: "সব দেখুন", en: "View all" },
  "stat.approve": { bn: "অনুমোদন করুন", en: "Review" },
  "stat.manage": { bn: "ব্যবস্থাপনা", en: "Manage" },
  "stat.results": { bn: "ফলাফল", en: "Results" },
  "stat.updated": { bn: "হালনাগাদ", en: "Up to date" },

  // Dashboard Sections
  "section.pendingQueue": { bn: "অনুমোদনের অপেক্ষায় থাকা প্রতিবেদন", en: "Pending Reviews Queue" },
  "section.reviewAll": { bn: "সবগুলো পর্যালোচনা করুন →", en: "Review all submissions →" },
  "section.noPending": { bn: "বর্তমানে পর্যালোচনার জন্য কোনো প্রতিবেদন জমা নেই।", en: "No articles are currently pending review." },
  "section.recentArticles": { bn: "সাম্প্রতিক সংবাদ তালিকা", en: "Recent News Stories" },
  "section.viewAllArticles": { bn: "সকল সংবাদ দেখুন →", en: "View all stories →" },
  "section.noArticles": { bn: "কোনো সংবাদ পাওয়া যায়নি।", en: "No articles found." },

  // Table Headers & Statuses
  "th.title": { bn: "শিরোনাম", en: "Title" },
  "th.status": { bn: "অবস্থা", en: "Status" },
  "th.date": { bn: "তারিখ", en: "Date" },
  "th.action": { bn: "পদক্ষেপ", en: "Actions" },
  "status.published": { bn: "প্রকাশিত", en: "Published" },
  "status.draft": { bn: "খসড়া", en: "Draft" },
  "status.pending_review": { bn: "রিভিউ", en: "Review" },
  "action.edit": { bn: "সম্পাদনা", en: "Edit" },
  "action.review": { bn: "রিভিউ", en: "Review" },
  "action.viewPublic": { bn: "পাবলিক পেজ দেখুন", en: "View public page" },
  "label.submittedAt": { bn: "জমার সময়", en: "Submitted" },

  // Sidebar Widgets
  "widget.activeBreaking": { bn: "চলমান ব্রেকিং নিউজ", en: "Active Breaking News" },
  "widget.noBreaking": { bn: "বর্তমানে কোনো ব্রেকিং নিউজ চলমান নেই।", en: "No breaking news currently active." },
  "widget.priority": { bn: "অগ্রাধিকার ক্রম", en: "Priority" },
  "widget.activePoll": { bn: "সক্রিয় জনমত জরিপ", en: "Active Public Poll" },
  "widget.allPolls": { bn: "সবগুলো", en: "All polls" },
  "widget.noPolls": { bn: "কোনো সক্রিয় জরিপ নেই।", en: "No active polls." },
  "widget.totalVotes": { bn: "মোট ভোট", en: "Total Votes" },
  "widget.categories": { bn: "বিভাগভিত্তিক সংবাদ সংখ্যা", en: "Stories by Category" },
  "widget.categoryList": { bn: "বিভাগ তালিকা", en: "Category List" },
  "widget.quickTools": { bn: "নিয়মিত সরঞ্জাম", en: "Quick Tools" },
  "widget.push": { bn: "পুশ নোটিফিকেশন", en: "Push Notification" },
  "widget.ai": { bn: "এআই সহকারী", en: "AI Assistant" },
  "widget.factCheck": { bn: "ফ্যাক্ট-চেক", en: "Fact-Check" },
  "widget.comments": { bn: "মন্তব্য মডারেশন", en: "Comments" },
};

const AdminLanguageContext = createContext<AdminLanguageContextType | undefined>(undefined);

export function AdminLanguageProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [language, setLanguageState] = useState<AdminLanguage>("en");

  useEffect(() => {
    // 1. Try reading from localStorage
    const saved = localStorage.getItem("admin_lang") as AdminLanguage | null;
    if (saved === "bn" || saved === "en") {
      setLanguageState(saved);
      return;
    }

    // 2. Try reading from cookie
    const match = document.cookie.match(/(?:^|;\s*)admin_lang=([a-z]+)/);
    if (match && (match[1] === "bn" || match[1] === "en")) {
      setLanguageState(match[1] as AdminLanguage);
    } else {
      setLanguageState("en");
    }
  }, []);

  const setLanguage = (lang: AdminLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("admin_lang", lang);
      document.cookie = `admin_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
      router.refresh();
    } catch (e) {
      console.warn("Could not save admin language preference:", e);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "bn" ? "en" : "bn");
  };

  const t = (key: string, fallback?: string): string => {
    const entry = DICTIONARY[key];
    if (entry) {
      return entry[language] || fallback || key;
    }
    return fallback || key;
  };

  const formatNumber = (n: number | string): string => {
    if (language === "bn") {
      return toBengaliDigits(n);
    }
    return String(n);
  };

  const formatDateString = (d: Date | string | null | undefined): string => {
    if (!d) return "";
    const date = typeof d === "string" ? new Date(d) : d;
    if (isNaN(date.getTime())) return "";

    if (language === "bn") {
      return formatBengaliDate(date);
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTimeString = (d: Date | string | null | undefined): string => {
    if (!d) return "";
    const date = typeof d === "string" ? new Date(d) : d;
    if (isNaN(date.getTime())) return "";

    if (language === "bn") {
      return formatBengaliDateTime(date);
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDayString = (d: Date | string | null | undefined): string => {
    if (!d) return "";
    const date = typeof d === "string" ? new Date(d) : d;
    if (isNaN(date.getTime())) return "";

    if (language === "bn") {
      return formatBengaliDay(date);
    }
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  return (
    <AdminLanguageContext.Provider
      value={{
        language,
        isEn: language === "en",
        setLanguage,
        toggleLanguage,
        t,
        formatNumber,
        formatDateString,
        formatDateTimeString,
        formatDayString,
      }}
    >
      {children}
    </AdminLanguageContext.Provider>
  );
}

export function useAdminLanguage(): AdminLanguageContextType {
  const context = useContext(AdminLanguageContext);
  if (!context) {
    throw new Error("useAdminLanguage must be used within an AdminLanguageProvider");
  }
  return context;
}
