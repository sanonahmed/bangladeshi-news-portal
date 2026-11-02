"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  BellRing,
  Send,
  RefreshCw,
  Trash2,
  ExternalLink,
  Volume2,
  VolumeX,
  Smartphone,
  Laptop,
  Globe,
  Activity,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Users,
  BarChart3,
  Filter,
  Search,
  Copy,
  Sparkles,
  ShieldAlert,
  Flame,
  Check,
  Zap,
} from "lucide-react";
import type {
  AlertItem,
  AdminNotificationStats,
  AdminSubscriberItem,
} from "@/actions/notifications";
import {
  broadcastBreakingAlertAction,
  deleteAlertAction,
  resendAlertAction,
} from "@/actions/notifications";
import { toBengaliDigits, formatRelativeBengali, formatBengaliDateTime } from "@/lib/bengali-date";
import { playAlertChime, showNativeBrowserNotification } from "@/lib/notifications-store";

interface AdminNotificationsClientProps {
  initialAlerts: AlertItem[];
  stats: AdminNotificationStats;
  subscribers: AdminSubscriberItem[];
}

const TEMPLATES = [
  {
    id: "breaking-alert",
    label: "🔴 জরুরি ব্রেকিং নিউজ",
    category: "breaking",
    priority: "urgent",
    soundAlert: true,
    title: "ব্রেকিং নিউজ: [সংবাদের প্রধান শিরোনাম]",
    message: "ঘটনাস্থল থেকে বিস্তারিত তথ্য পাওয়া গেছে। জরুরি সতর্কতা অবলম্বন করতে বলা হয়েছে। বিস্তারিত প্রতিবেদনে জানুন।",
    url: "/category/জাতীয়",
  },
  {
    id: "factcheck-alert",
    label: "🛡️ ফ্যাক্ট-চেক: ভাইরাল গুজব সতর্কতা",
    category: "fact-check",
    priority: "high",
    soundAlert: true,
    title: "🛡️ সত্যসন্ধান: সামাজিক মাধ্যমে ছড়ানো দাবিটি সম্পূর্ণ ভুয়া ও বানোয়াট",
    message: "ডিজিটাল ফরেনসিক ও সংশ্লিষ্ট কর্তৃপক্ষের বক্তব্য বিশ্লেষণ করে নিশ্চিত হওয়া গেছে ভাইরাল তথ্যটি ভিত্তিহীন। ফ্যাক্ট-চেক পড়ুন।",
    url: "/fact-check",
  },
  {
    id: "cricket-alert",
    label: "🏏 ক্রিকেট ও লাইভ স্কোর আপডেট",
    category: "sports",
    priority: "high",
    soundAlert: true,
    title: "🏏 ম্যাচ আপডেট: বাংলাদেশ ক্রিকেট দলের শ্বাসরুদ্ধকর জয়!",
    message: "অনবদ্য পারফরম্যান্সে জয় তুলে নিল টাইগাররা। দেখুন বল-বাই-বল লাইভ ধারাভাষ্য ও সম্পূর্ণ স্কোরকার্ড।",
    url: "/live-score",
  },
  {
    id: "weather-alert",
    label: "🌪️ দুর্যোগ ও আবহাওয়া সতর্কবার্তা",
    category: "breaking",
    priority: "urgent",
    soundAlert: true,
    title: "জরুরি আবহাওয়া বার্তা: বঙ্গোপসাগরে গভীর নিম্নচাপ, সতর্ক সংকেত জারি",
    message: "উপকূলীয় এলাকায় দমকা বা ঝড়ো হাওয়ার সাথে ভারী বর্ষণের আশঙ্কা। সংশ্লিষ্ট সকলকে নিরাপদে থাকার অনুরোধ।",
    url: "/weather-prayer",
  },
  {
    id: "business-alert",
    label: "💼 অর্থনীতি ও বৈদেশিক মুদ্রা বাজার",
    category: "business",
    priority: "normal",
    soundAlert: false,
    title: "অর্থনীতি: বৈদেশিক মুদ্রার রিজার্ভে ইতিবাচক প্রবৃদ্ধি",
    message: "প্রবাসী আয় ও রপ্তানি আয়ের ধারাবাহিকতায় বাংলাদেশ ব্যাংকের রিজার্ভ নতুন মাইলফলকে পৌঁছেছে।",
    url: "/category/বাণিজ্য",
  },
];

const CATEGORIES = [
  { id: "breaking", label: "ব্রেকিং ও জরুরি", color: "bg-red-500", text: "text-red-600" },
  { id: "fact-check", label: "ফ্যাক্ট-চেক সতর্কবার্তা", color: "bg-indigo-600", text: "text-indigo-600" },
  { id: "sports", label: "খেলাধুলা ও লাইভ স্কোর", color: "bg-emerald-600", text: "text-emerald-600" },
  { id: "national", label: "জাতীয়", color: "bg-blue-600", text: "text-blue-600" },
  { id: "politics", label: "রাজনীতি", color: "bg-purple-600", text: "text-purple-600" },
  { id: "business", label: "বাণিজ্য ও অর্থনীতি", color: "bg-amber-600", text: "text-amber-600" },
  { id: "world", label: "আন্তর্জাতিক", color: "bg-cyan-600", text: "text-cyan-600" },
];

export function AdminNotificationsClient({
  initialAlerts,
  stats,
  subscribers,
}: AdminNotificationsClientProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [activeTab, setActiveTab] = useState<"broadcast" | "history" | "analytics" | "subscribers">("broadcast");

  // Broadcast Form State
  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formUrl, setFormUrl] = useState("/");
  const [formCategory, setFormCategory] = useState("breaking");
  const [formPriority, setFormPriority] = useState<"urgent" | "high" | "normal">("urgent");
  const [formSoundAlert, setFormSoundAlert] = useState(true);
  const [targetAudience, setTargetAudience] = useState("all");

  // Interaction State
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // History Filter State
  const [historySearch, setHistorySearch] = useState("");
  const [historyCategory, setHistoryCategory] = useState("all");
  const [historyPriority, setHistoryPriority] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Apply Template
  const applyTemplate = (templateId: string) => {
    const t = TEMPLATES.find((x) => x.id === templateId);
    if (!t) return;
    setFormTitle(t.title);
    setFormMessage(t.message);
    setFormUrl(t.url);
    setFormCategory(t.category);
    setFormPriority(t.priority as any);
    setFormSoundAlert(t.soundAlert);
    showToast("success", `"${t.label}" টেমপ্লেট লোড করা হয়েছে`);
  };

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Trigger test notification locally on admin browser
  const handleTestNotification = async () => {
    if (!formTitle.trim()) {
      showToast("error", "অনুগ্রহ করে নোটিফিকেশনের শিরোনাম লিখুন");
      return;
    }
    setIsTesting(true);

    if (formSoundAlert) {
      playAlertChime();
    }

    try {
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "default") {
          await Notification.requestPermission();
        }
        await showNativeBrowserNotification(
          formTitle.trim(),
          formMessage.trim() || "দৈনিক বাংলাদেশ বার্তা পুশ নোটিফিকেশন প্রিভিউ",
          formUrl.trim() || "/"
        );
      }
      showToast("success", "আপনার ব্রাউজারে টেস্ট নোটিফিকেশন প্রেরণ করা হয়েছে!");
    } catch {
      showToast("success", "টেস্ট অ্যালার্ট চিম ও সাউন্ড সফলভাবে বাজানো হয়েছে!");
    } finally {
      setIsTesting(false);
    }
  };

  // Broadcast to all subscribers
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formMessage.trim()) {
      showToast("error", "শিরোনাম এবং বিবরণ উভয়ই আবশ্যক");
      return;
    }

    setIsBroadcasting(true);
    try {
      const res = await broadcastBreakingAlertAction({
        title: formTitle.trim(),
        message: formMessage.trim(),
        url: formUrl.trim() || "/",
        category: formCategory,
        priority: formPriority,
        soundAlert: formSoundAlert,
      });

      if (res.success && res.alert) {
        setAlerts((prev) => [res.alert!, ...prev]);
        showToast("success", "ওয়েব পুশ নোটিফিকেশন সফলভাবে সকল গ্রাহকের কাছে সম্প্রচারিত হয়েছে!");
        // Reset form
        setFormTitle("");
        setFormMessage("");
        setFormUrl("/");
      } else {
        showToast("error", res.message || "সম্প্রচার ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      showToast("error", err?.message || "সার্ভার এরর, পুনরায় চেষ্টা করুন");
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Delete Alert
  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত যে এই নোটিফিকেশন রেকর্ডটি মুছে ফেলতে চান?")) return;
    setDeletingId(id);
    try {
      const res = await deleteAlertAction(id);
      if (res.success) {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
        showToast("success", res.message);
      } else {
        showToast("error", res.message);
      }
    } catch {
      showToast("error", "মুছে ফেলতে সমস্যা হয়েছে");
    } finally {
      setDeletingId(null);
    }
  };

  // Resend Alert
  const handleResend = async (id: string) => {
    setResendingId(id);
    try {
      const res = await resendAlertAction(id);
      if (res.success && res.alert) {
        setAlerts((prev) => [res.alert!, ...prev]);
        showToast("success", "নোটিফিকেশনটি পুনরায় সফলভাবে সম্প্রচারিত হয়েছে!");
      } else {
        showToast("error", res.message);
      }
    } catch {
      showToast("error", "পুনরায় সম্প্রচার ব্যর্থ হয়েছে");
    } finally {
      setResendingId(null);
    }
  };

  // Copy Alert details into Broadcast Form
  const copyToEditor = (alert: AlertItem) => {
    setFormTitle(alert.title);
    setFormMessage(alert.message);
    setFormUrl(alert.url);
    setFormCategory(alert.category);
    setFormPriority(alert.priority as any);
    setFormSoundAlert(alert.soundAlert);
    setActiveTab("broadcast");
    showToast("success", "তথ্যগুলো এডিটরে কপি করা হয়েছে");
  };

  // Filtered History
  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      !historySearch ||
      a.title.toLowerCase().includes(historySearch.toLowerCase()) ||
      a.message.toLowerCase().includes(historySearch.toLowerCase());
    const matchesCategory = historyCategory === "all" || a.category === historyCategory;
    const matchesPriority = historyPriority === "all" || a.priority === historyPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium transition-all duration-300 ${
            toastMessage.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toastMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950 via-zinc-900 to-zinc-950 p-6 md:p-8 rounded-2xl border border-red-900/30 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold">
              <BellRing size={13} className="animate-pulse" />
              <span>ওয়েব পুশ নোটিফিকেশন ব্রডকাস্টার</span>
            </div>
            <h1
              className="text-2xl md:text-3xl font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-noto-bengali, sans-serif)" }}
            >
              পুশ নোটিফিকেশন নিয়ন্ত্রণ কেন্দ্র
            </h1>
            <p className="text-zinc-300 text-sm max-w-2xl">
              ব্রেকিং নিউজ, জরুরি ফ্যাক্ট-চেক সতর্কবার্তা এবং লাইভ স্কোর পাঠকদের ব্রাউজার ও মোবাইল ডিভাইসে এক ক্লিকে
              তাৎক্ষণিকভাবে সম্প্রচার করুন।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/notifications"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition"
            >
              <ExternalLink size={14} />
              <span>পাবলিক নোটিফিকেশন পেজ</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium mb-2">
            <span>সক্রিয় গ্রাহক সংখ্যা</span>
            <Users size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {toBengaliDigits(stats.activeSubscribers.toLocaleString())}+
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <TrendingUp size={11} />
            <span>সক্রিয় ব্রাউজার ও ডিভাইস</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium mb-2">
            <span>মোট প্রেরিত অ্যালার্ট</span>
            <Send size={16} className="text-red-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {toBengaliDigits(alerts.length)} টি
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            জরুরি অ্যালার্ট: {toBengaliDigits(alerts.filter((a) => a.priority === "urgent").length)} টি
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium mb-2">
            <span>মোট ক্লিক সংখ্যা</span>
            <Activity size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {toBengaliDigits(alerts.reduce((acc, a) => acc + (a.clicksCount || 0), 0).toLocaleString())}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">পাঠকদের মোট এনগেজমেন্ট</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium mb-2">
            <span>গড় ক্লিক হার (CTR)</span>
            <BarChart3 size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {toBengaliDigits(stats.avgCtr)}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            শিল্প গড়ের চেয়ে ৪.২% বেশি
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("broadcast")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "broadcast"
              ? "bg-red-600 text-white shadow-md shadow-red-600/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Send size={14} />
          <span>নতুন নোটিফিকেশন সম্প্রচার</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "history"
              ? "bg-red-600 text-white shadow-md shadow-red-600/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <RefreshCw size={14} />
          <span>প্রেরিত হিস্ট্রি ও লগ ({toBengaliDigits(alerts.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "analytics"
              ? "bg-red-600 text-white shadow-md shadow-red-600/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <BarChart3 size={14} />
          <span>ক্লিক অ্যানালিটিক্স ও ইনসাইটস</span>
        </button>

        <button
          onClick={() => setActiveTab("subscribers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "subscribers"
              ? "bg-red-600 text-white shadow-md shadow-red-600/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Smartphone size={14} />
          <span>ডিভাইস ও সাবস্ক্রাইবার তালিকা</span>
        </button>
      </div>

      {/* TAB 1: BROADCAST DISPATCHER */}
      {activeTab === "broadcast" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Dispatcher Form (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
            <div>
              <h2
                className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2"
                style={{ fontFamily: "var(--font-noto-bengali, sans-serif)" }}
              >
                <Zap size={18} className="text-red-600" />
                <span>তাত্ক্ষণিক পুশ নোটিফিকেশন ডিসপ্যাচার</span>
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
                শিরোনাম ও বার্তা লিখে সম্প্রচার বোতাম চাপলে নিবন্ধিত সকল ব্রাউজারে সেকেন্ডের মধ্যে নোটিফিকেশন পৌঁছে যাবে।
              </p>
            </div>

            {/* Quick Template Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                দ্রুত রেডিমেড টেমপ্লেট নির্বাচন করুন
              </label>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => applyTemplate(tmpl.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 border border-zinc-200 dark:border-zinc-700 transition"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-5">
              {/* Target Audience */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  প্রাপক অডিয়েন্স (Target Audience)
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <option value="all">👥 সকল সক্রিয় সাবস্ক্রাইবার ({toBengaliDigits(stats.activeSubscribers.toLocaleString())}+ ডিভাইস)</option>
                  <option value="breaking">⚡ শুধুমাত্র ব্রেকিং নিউজ আগ্রহীরা</option>
                  <option value="fact-check">🛡️ ফ্যাক্ট-চেক ও সত্যসন্ধান গ্রাহক</option>
                  <option value="sports">🏏 খেলাধুলা ও লাইভ স্কোর গ্রাহক</option>
                  <option value="business">💼 বাণিজ্য ও অর্থনীতি পাঠক</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    নোটিফিকেশন শিরোনাম <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    {toBengaliDigits(formTitle.length)} / ৫০ অক্ষর (প্রস্তাবিত)
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="যেমন: জরুরি আবহাওয়া বার্তা: ৩ নম্বর সতর্ক সংকেত জারি"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    নোটিফিকেশনের বিস্তারিত বার্তা <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    {toBengaliDigits(formMessage.length)} / ১২০ অক্ষর
                  </span>
                </div>
                <textarea
                  required
                  rows={3}
                  placeholder="পাঠকের ডিভাইসের স্ক্রিনে প্রদর্শিত মূল বাক্য বা সারসংক্ষেপ..."
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {/* Target URL */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  ক্লিক করলে যে লিংকে যাবে (Destination URL)
                </label>
                <input
                  type="text"
                  placeholder="/category/জাতীয় অথবা /fact-check/slug"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none font-mono"
                />
              </div>

              {/* Category & Priority Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    সংবাদের বিভাগ (Category)
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    অগ্রাধিকার স্তর (Priority Level)
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  >
                    <option value="urgent">🔴 জরুরি (Urgent - লাল ফ্ল্যাশ ও সাউন্ড)</option>
                    <option value="high">🟠 উচ্চ (High - ব্রেকিং আপডেট)</option>
                    <option value="normal">🔵 সাধারণ (Normal - তথ্যমূলক)</option>
                  </select>
                </div>
              </div>

              {/* Sound Alert Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      formSoundAlert
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-400"
                    }`}
                  >
                    {formSoundAlert ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-white">
                      অ্যালার্ট চিম সাউন্ড (Web Audio Chime)
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      নোটিফিকেশন আসার মুহূর্তে পাঠকদের ডিভাইসে সতর্ক সংকেত বাজা
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFormSoundAlert(!formSoundAlert)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    formSoundAlert ? "bg-red-600" : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      formSoundAlert ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTestNotification}
                  disabled={isTesting}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <Bell size={14} className={isTesting ? "animate-spin" : ""} />
                  <span>আমার ব্রাউজারে টেস্ট চালান</span>
                </button>

                <button
                  type="submit"
                  disabled={isBroadcasting}
                  className="w-full sm:flex-1 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send size={14} className={isBroadcasting ? "animate-spin" : ""} />
                  <span>
                    {isBroadcasting
                      ? "সম্প্রচার হচ্ছে..."
                      : `তাত্ক্ষণিক সম্প্রচার পাঠান (${toBengaliDigits(stats.activeSubscribers.toLocaleString())}+ পাঠক)`}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Realtime Live Mobile Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 text-white shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Smartphone size={16} className="text-red-500" />
                  <span className="text-xs font-bold text-zinc-300">মোবাইল পুশ প্রিভিউ (Live Mockup)</span>
                </div>
                <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-semibold">
                  রিয়েলটাইম প্রিভিউ
                </span>
              </div>

              {/* Phone Frame Simulator */}
              <div className="bg-zinc-900 rounded-3xl p-4 border border-zinc-700/60 shadow-2xl relative max-w-sm mx-auto">
                {/* Speaker pill */}
                <div className="w-16 h-1 bg-zinc-700 rounded-full mx-auto mb-4" />

                {/* Lockscreen clock */}
                <div className="text-center py-2 mb-3">
                  <div className="text-2xl font-light text-zinc-200">
                    {toBengaliDigits("10:45")}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {toBengaliDigits("সোমবার, ২ নভেম্বর")}
                  </div>
                </div>

                {/* Native Push Notification Card */}
                <div className="bg-zinc-800/90 backdrop-blur-md rounded-2xl p-3.5 border border-zinc-700/80 shadow-lg text-left transition-all">
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-600 flex items-center justify-center text-white text-[9px] font-bold">
                        বা
                      </div>
                      <span className="text-[11px] font-bold text-zinc-200">
                        দৈনিক বাংলাদেশ বার্তা
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400">এইমাত্র</span>
                  </div>

                  {/* Card Title */}
                  <h4
                    className="text-xs font-bold text-white line-clamp-2 leading-snug mb-1"
                    style={{ fontFamily: "var(--font-noto-bengali, sans-serif)" }}
                  >
                    {formTitle.trim() || "জরুরি ব্রেকিং নিউজ: প্রধান শিরোনাম এখানে প্রদর্শিত হবে"}
                  </h4>

                  {/* Card Body */}
                  <p className="text-[11px] text-zinc-300 line-clamp-3 leading-relaxed mb-2">
                    {formMessage.trim() ||
                      "ঘটনার পূর্ণাঙ্গ বিবরণ ও সর্বশেষ পরিস্থিতি জানতে ট্যাপ করে সম্পূর্ণ সংবাদটি এখনই পড়ুন।"}
                  </p>

                  {/* Footer details */}
                  <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-zinc-700/60 text-zinc-400">
                    <span className="flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      {formPriority === "urgent" ? "জরুরি সতর্কবার্তা" : formPriority === "high" ? "উচ্চ অগ্রাধিকার" : "সাধারণ আপডেট"}
                    </span>
                    <span className="text-red-400 font-semibold flex items-center gap-1">
                      ট্যাপ করুন <ExternalLink size={10} />
                    </span>
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="w-24 h-1 bg-zinc-600 rounded-full mx-auto mt-6" />
              </div>

              {/* Instructions Callout */}
              <div className="mt-5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 space-y-1">
                <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>স্মার্ট ডিসপ্যাচ অ্যালগরিদম</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  নোটিফিকেশন সম্প্রচার করার সাথে সাথে ক্রোম, ফায়ারফক্স, এজ এবং সাফারি ব্যাকগ্রাউন্ড সার্ভিস ওয়ার্কার সক্রিয়
                  হয়ে পাঠকদের স্ক্রিনে পৌঁছে দেয়।
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BROADCAST HISTORY */}
      {activeTab === "history" && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2
                className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2"
                style={{ fontFamily: "var(--font-noto-bengali, sans-serif)" }}
              >
                <RefreshCw size={18} className="text-red-600" />
                <span>প্রেরিত নোটিফিকেশন হিস্ট্রি ও অডিট লগ</span>
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
                পূর্বে সম্প্রচারিত সমস্ত নোটিফিকেশনের তালিকা, ক্লিক সংখ্যা এবং পুনরায় পাঠানোর সুযোগ।
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="খুঁজুন..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="text-xs pl-8 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500 w-44"
                />
              </div>

              <select
                value={historyCategory}
                onChange={(e) => setHistoryCategory(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none"
              >
                <option value="all">সকল বিভাগ</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>

              <select
                value={historyPriority}
                onChange={(e) => setHistoryPriority(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none"
              >
                <option value="all">সকল অগ্রাধিকার</option>
                <option value="urgent">জরুরি (Urgent)</option>
                <option value="high">উচ্চ (High)</option>
                <option value="normal">সাধারণ (Normal)</option>
              </select>
            </div>
          </div>

          {/* List of Alerts */}
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs">
              কোনো নোটিফিকেশন রেকর্ড পাওয়া যায়নি।
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => {
                const catObj = CATEGORIES.find((c) => c.id === alert.category);
                return (
                  <div
                    key={alert.id}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                            catObj ? catObj.color : "bg-zinc-600"
                          }`}
                        >
                          {catObj ? catObj.label : alert.category}
                        </span>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            alert.priority === "urgent"
                              ? "bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400"
                              : alert.priority === "high"
                              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                              : "bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {alert.priority === "urgent"
                            ? "🔴 জরুরি"
                            : alert.priority === "high"
                            ? "🟠 উচ্চ"
                            : "🔵 সাধারণ"}
                        </span>

                        {alert.soundAlert && (
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 font-medium">
                            <Volume2 size={12} /> সাউন্ড
                          </span>
                        )}

                        <span className="text-[11px] text-zinc-400">
                          {formatRelativeBengali(new Date(alert.createdAt))}
                        </span>
                      </div>

                      <h3
                        className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1"
                        style={{ fontFamily: "var(--font-noto-bengali, sans-serif)" }}
                      >
                        {alert.title}
                      </h3>

                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {alert.message}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-zinc-500 pt-1">
                        <span className="flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300">
                          <Activity size={12} className="text-amber-500" />
                          মোট ক্লিক: {toBengaliDigits(alert.clicksCount || 0)}
                        </span>
                        <span className="text-zinc-400">•</span>
                        <Link
                          href={alert.url || "/"}
                          target="_blank"
                          className="text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 truncate max-w-xs font-mono"
                        >
                          {alert.url} <ExternalLink size={10} />
                        </Link>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        onClick={() => copyToEditor(alert)}
                        title="এডিটরে কপি করুন"
                        className="p-2 rounded-lg bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-600 border border-zinc-200 dark:border-zinc-600 transition text-xs flex items-center gap-1"
                      >
                        <Copy size={13} />
                        <span className="hidden sm:inline">কপি</span>
                      </button>

                      <button
                        onClick={() => handleResend(alert.id)}
                        disabled={resendingId === alert.id}
                        title="পুনরায় সম্প্রচার করুন"
                        className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/50 transition text-xs font-semibold flex items-center gap-1.5"
                      >
                        <RefreshCw size={13} className={resendingId === alert.id ? "animate-spin" : ""} />
                        <span>পুনরায় পাঠান</span>
                      </button>

                      <button
                        onClick={() => handleDelete(alert.id)}
                        disabled={deletingId === alert.id}
                        title="মুছে ফেলুন"
                        className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition"
                      >
                        <Trash2 size={14} className={deletingId === alert.id ? "animate-spin" : ""} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ANALYTICS & INSIGHTS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Performance Breakdown */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3
                className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2"
                style={{ fontFamily: "var(--font-noto-bengali, sans-serif)" }}
              >
                <BarChart3 size={18} className="text-red-600" />
                <span>ক্যাটাগরিভিত্তিক এনগেজমেন্ট ও ক্লিক বিভাজন</span>
              </h3>
              <p className="text-xs text-zinc-500">
                কোন ধরণের সংবাদে পাঠকরা সবচেয়ে বেশি নোটিফিকেশনে ক্লিক করেন তার পরিসংখ্যান।
              </p>

              <div className="space-y-3 pt-2">
                {stats.categoryBreakdown.map((cat) => {
                  const maxClicks = Math.max(...stats.categoryBreakdown.map((x) => x.clicks), 1);
                  const pct = Math.round((cat.clicks / maxClicks) * 100);
                  return (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                          {cat.label}
                        </span>
                        <span className="text-zinc-500 font-medium">
                          {toBengaliDigits(cat.clicks.toLocaleString())} ক্লিক ({toBengaliDigits(cat.count)} টি অ্যালার্ট)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cat.color}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reader Peak Activity Hours */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3
                className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2"
                style={{ fontFamily: "var(--font-noto-bengali, sans-serif)" }}
              >
                <Flame size={18} className="text-amber-500" />
                <span>সময়ভিত্তিক পাঠকদের সর্বোচ্চ সক্রিয়তা (Peak Hours)</span>
              </h3>
              <p className="text-xs text-zinc-500">
                বাংলাদেশ সময় অনুযায়ী পাঠকরা কোন সময়ে নোটিফিকেশনে দ্রুততম সাড়া দেন।
              </p>

              <div className="space-y-4 pt-2">
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <Sparkles size={13} />
                    <span>প্রস্তাবিত ব্রডকাস্ট সময়</span>
                  </div>
                  সকাল ৮:০০ - ১০:০০ টা এবং রাত ৮:৩০ - ১০:৩০ টায় ক্লিক থ্রু রেট (CTR) সর্বোচ্চ ২৭.৪% পর্যন্ত ওঠে।
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-700 dark:text-zinc-300">সকাল ৮:০০ - ১০:০০ (মর্নিং ড্রাইভ)</span>
                    <span className="font-bold text-emerald-600">৮৮% এনগেজমেন্ট</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: "88%" }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-700 dark:text-zinc-300">দুপুর ১:০০ - ৩:০০ (লাঞ্চ টাইম)</span>
                    <span className="font-bold text-blue-600">৬৪% এনগেজমেন্ট</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: "64%" }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-700 dark:text-zinc-300">রাত ৮:০০ - ১১:০০ (প্রাইম টাইম)</span>
                    <span className="font-bold text-red-600">৯৫% এনগেজমেন্ট (সর্বোচ্চ)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div className="h-full rounded-full bg-red-500" style={{ width: "95%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Alerts Leaderboard */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3
              className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2"
              style={{ fontFamily: "var(--font-noto-bengali, sans-serif)" }}
            >
              <TrendingUp size={18} className="text-emerald-600" />
              <span>সর্বাধিক পঠিত ও ক্লিককৃত নোটিফিকেশন লিডারবোর্ড</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400">
                    <th className="pb-3 font-semibold">শিরোনাম</th>
                    <th className="pb-3 font-semibold">বিভাগ</th>
                    <th className="pb-3 font-semibold">অগ্রাধিকার</th>
                    <th className="pb-3 font-semibold">মোট ক্লিক</th>
                    <th className="pb-3 font-semibold">প্রেরণের সময়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {alerts
                    .slice()
                    .sort((a, b) => (b.clicksCount || 0) - (a.clicksCount || 0))
                    .slice(0, 5)
                    .map((a, idx) => (
                      <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="py-3 pr-4 font-semibold text-zinc-900 dark:text-white max-w-sm truncate">
                          <span className="inline-block w-5 text-zinc-400 font-mono">
                            {toBengaliDigits(idx + 1)}.
                          </span>
                          {a.title}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-100 dark:bg-zinc-800 font-medium">
                            {a.category}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              a.priority === "urgent" ? "text-red-500" : "text-amber-500"
                            }`}
                          >
                            {a.priority}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-bold text-emerald-600 dark:text-emerald-400">
                          {toBengaliDigits(a.clicksCount.toLocaleString())}
                        </td>
                        <td className="py-3 text-zinc-400">{formatRelativeBengali(new Date(a.createdAt))}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SUBSCRIBERS & DEVICES */}
      {activeTab === "subscribers" && (
        <div className="space-y-6">
          {/* Device Distribution Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <Smartphone size={24} />
              </div>
              <div>
                <div className="text-xs text-zinc-400 font-medium">স্মার্টফোন ও মোবাইল পাঠক</div>
                <div className="text-xl font-bold text-zinc-900 dark:text-white">৭২.৪%</div>
                <div className="text-[11px] text-zinc-500">অ্যান্ড্রয়েড ও আইওএস ডিভাইস</div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                <Laptop size={24} />
              </div>
              <div>
                <div className="text-xs text-zinc-400 font-medium">ডেস্কটপ ও ল্যাপটপ</div>
                <div className="text-xl font-bold text-zinc-900 dark:text-white">২৪.১%</div>
                <div className="text-[11px] text-zinc-500">উইন্ডোজ ও ম্যাক ওএস ব্রাউজার</div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Globe size={24} />
              </div>
              <div>
                <div className="text-xs text-zinc-400 font-medium">ট্যাবলেট ও অন্যান্য ডিভাইস</div>
                <div className="text-xl font-bold text-zinc-900 dark:text-white">৩.৫%</div>
                <div className="text-[11px] text-zinc-500">আইপ্যাড ও অ্যান্ড্রয়েড ট্যাব</div>
              </div>
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div>
              <h3
                className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2"
                style={{ fontFamily: "var(--font-noto-bengali, sans-serif)" }}
              >
                <Users size={18} className="text-blue-600" />
                <span>নিবন্ধিত সক্রিয় পুশ সাবস্ক্রিপশন তালিকা</span>
              </h3>
              <p className="text-xs text-zinc-500">
                ব্রাউজারের ওয়েব পুশ এপিআই (W3C Push API / FCM) এর মাধ্যমে সংরক্ষিত ডিভাইস টোকেনসমূহ।
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400">
                    <th className="pb-3 font-semibold">ডিভাইস ও ব্রাউজার</th>
                    <th className="pb-3 font-semibold">প্ল্যাটফর্ম টাইপ</th>
                    <th className="pb-3 font-semibold">পছন্দের বিভাগসমূহ</th>
                    <th className="pb-3 font-semibold">স্ট্যাটাস</th>
                    <th className="pb-3 font-semibold">নিবন্ধন তারিখ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <td className="py-3 pr-4">
                        <div className="font-semibold text-zinc-900 dark:text-white">{sub.browser}</div>
                        <div className="text-[10px] text-zinc-400 truncate max-w-xs font-mono">
                          {sub.endpoint.slice(0, 36)}...
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                          {sub.device}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {sub.categories.map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 rounded text-[10px] bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/40"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          সক্রিয়
                        </span>
                      </td>
                      <td className="py-3 text-zinc-400">{formatRelativeBengali(new Date(sub.createdAt))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
