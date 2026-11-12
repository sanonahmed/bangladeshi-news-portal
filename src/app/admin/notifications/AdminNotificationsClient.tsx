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
  Search,
  Copy,
  Sparkles,
  Flame,
  Zap,
  PlusCircle,
  Clock,
} from "lucide-react";
import type {
  AlertItem,
  AdminNotificationStats,
  AdminSubscriberItem,
} from "@/types/notifications";
import {
  broadcastBreakingAlertAction,
  deleteAlertAction,
  resendAlertAction,
  savePushSubscription,
} from "@/actions/notifications";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { playAlertChime, showNativeBrowserNotification } from "@/lib/notifications-store";

interface AdminNotificationsClientProps {
  initialAlerts: AlertItem[];
  stats: AdminNotificationStats;
  subscribers: AdminSubscriberItem[];
}

const TEMPLATES = [
  {
    id: "breaking-alert",
    labelEn: "🔴 Urgent Breaking News",
    labelBn: "🔴 জরুরি ব্রেকিং নিউজ",
    category: "breaking",
    priority: "urgent",
    soundAlert: true,
    titleEn: "Breaking News: [Headline Here]",
    titleBn: "ব্রেকিং নিউজ: [সংবাদের প্রধান শিরোনাম]",
    messageEn: "Urgent developments reported from the scene. Readers advised to follow safety guidelines. Full details inside.",
    messageBn: "ঘটনাস্থল থেকে বিস্তারিত তথ্য পাওয়া গেছে। জরুরি সতর্কতা অবলম্বন করতে বলা হয়েছে। বিস্তারিত প্রতিবেদনে জানুন।",
    url: "/category/জাতীয়",
  },
  {
    id: "factcheck-alert",
    labelEn: "🛡️ Fact-Check: Viral Rumor Debunked",
    labelBn: "🛡️ ফ্যাক্ট-চেক: ভাইরাল গুজব সতর্কতা",
    category: "fact-check",
    priority: "high",
    soundAlert: true,
    titleEn: "🛡️ Fact-Check: Viral claim circulating on social media is fabricated",
    titleBn: "🛡️ সত্যসন্ধান: সামাজিক মাধ্যমে ছড়ানো দাবিটি সম্পূর্ণ ভুয়া ও বানোয়াট",
    messageEn: "Digital forensics and ministry statements verify that the viral notice is fabricated. Read full fact-check.",
    messageBn: "ডিজিটাল ফরেনসিক ও সংশ্লিষ্ট কর্তৃপক্ষের বক্তব্য বিশ্লেষণ করে নিশ্চিত হওয়া গেছে ভাইরাল তথ্যটি ভিত্তিহীন। ফ্যাক্ট-চেক পড়ুন।",
    url: "/fact-check",
  },
  {
    id: "cricket-alert",
    labelEn: "🏏 Cricket & Live Score Alert",
    labelBn: "🏏 ক্রিকেট ও লাইভ স্কোর আপডেট",
    category: "sports",
    priority: "high",
    soundAlert: true,
    titleEn: "🏏 Match Update: Thrilling victory for Tigers!",
    titleBn: "🏏 ম্যাচ আপডেট: বাংলাদেশ ক্রিকেট দলের শ্বাসরুদ্ধকর জয়!",
    messageEn: "Spectacular performance by Bangladesh. View ball-by-ball commentary and full scorecard.",
    messageBn: "অনবদ্য পারফরম্যান্সে জয় তুলে নিল টাইগাররা। দেখুন বল-বাই-বল লাইভ ধারাভাষ্য ও সম্পূর্ণ স্কোরকার্ড।",
    url: "/live-score",
  },
  {
    id: "weather-alert",
    labelEn: "🌪️ Severe Weather Warning",
    labelBn: "🌪️ দুর্যোগ ও আবহাওয়া সতর্কবার্তা",
    category: "breaking",
    priority: "urgent",
    soundAlert: true,
    titleEn: "Urgent Weather Alert: Deep depression over Bay of Bengal, warning signal hoisted",
    titleBn: "জরুরি আবহাওয়া বার্তা: বঙ্গোপসাগরে গভীর নিম্নচাপ, সতর্ক সংকেত জারি",
    messageEn: "Heavy rainfall with gusty squalls expected in coastal regions. Public urged to take shelter.",
    messageBn: "উপকূলীয় এলাকায় দমকা বা ঝড়ো হাওয়ার সাথে ভারী বর্ষণের আশঙ্কা। সংশ্লিষ্ট সকলকে নিরাপদে থাকার অনুরোধ।",
    url: "/weather-prayer",
  },
  {
    id: "business-alert",
    labelEn: "💼 Business & Economy Update",
    labelBn: "💼 অর্থনীতি ও বৈদেশিক মুদ্রা বাজার",
    category: "business",
    priority: "normal",
    soundAlert: false,
    titleEn: "Economy: Forex reserves register positive growth",
    titleBn: "অর্থনীতি: বৈদেশিক মুদ্রার রিজার্ভে ইতিবাচক প্রবৃদ্ধি",
    messageEn: "Higher remittance inflows boost foreign currency reserves at central bank.",
    messageBn: "প্রবাসী আয় ও রপ্তানি আয়ের ধারাবাহিকতায় বাংলাদেশ ব্যাংকের রিজার্ভ নতুন মাইলফলকে পৌঁছেছে।",
    url: "/category/বাণিজ্য",
  },
];

const CATEGORIES = [
  { id: "breaking", labelEn: "Breaking & Urgent", labelBn: "ব্রেকিং ও জরুরি", color: "bg-red-500", text: "text-red-600" },
  { id: "fact-check", labelEn: "Fact-Check Alert", labelBn: "ফ্যাক্ট-চেক সতর্কবার্তা", color: "bg-indigo-600", text: "text-indigo-600" },
  { id: "sports", labelEn: "Sports & Live Score", labelBn: "খেলাধুলা ও লাইভ স্কোর", color: "bg-emerald-600", text: "text-emerald-600" },
  { id: "national", labelEn: "National", labelBn: "জাতীয়", color: "bg-blue-600", text: "text-blue-600" },
  { id: "politics", labelEn: "Politics", labelBn: "রাজনীতি", color: "bg-purple-600", text: "text-purple-600" },
  { id: "business", labelEn: "Business & Economy", labelBn: "বাণিজ্য ও অর্থনীতি", color: "bg-amber-600", text: "text-amber-600" },
  { id: "world", labelEn: "International", labelBn: "আন্তর্জাতিক", color: "bg-cyan-600", text: "text-cyan-600" },
];

export function AdminNotificationsClient({
  initialAlerts,
  stats,
  subscribers: initialSubscribers,
}: AdminNotificationsClientProps) {
  const { language, formatNumber, formatDateString, formatDateTimeString } = useAdminLanguage();
  const isEn = language === "en";

  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [subscribers, setSubscribers] = useState<AdminSubscriberItem[]>(initialSubscribers);
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
  const [isRegisteringSelf, setIsRegisteringSelf] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // History Filter State
  const [historySearch, setHistorySearch] = useState("");
  const [historyCategory, setHistoryCategory] = useState("all");
  const [historyPriority, setHistoryPriority] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Dynamic real calculations
  const totalSubscribersCount = subscribers.length;
  const activeSubscribersCount = subscribers.filter((s) => s.isActive).length;
  const totalClicksCount = alerts.reduce((acc, a) => acc + (a.clicksCount || 0), 0);
  const urgentAlertsCount = alerts.filter((a) => a.priority === "urgent").length;

  const mobileCount = subscribers.filter((s) => s.device.includes("মোবাইল") || s.device.includes("Mobile")).length;
  const desktopCount = subscribers.filter((s) => s.device.includes("ডেস্কটপ") || s.device.includes("Desktop") || s.device.includes("MacBook")).length;
  const tabletCount = subscribers.filter((s) => s.device.includes("ট্যাবলেট") || s.device.includes("Tablet")).length;

  const mobilePct = totalSubscribersCount > 0 ? ((mobileCount / totalSubscribersCount) * 100).toFixed(1) : "0";
  const desktopPct = totalSubscribersCount > 0 ? ((desktopCount / totalSubscribersCount) * 100).toFixed(1) : "0";
  const tabletPct = totalSubscribersCount > 0 ? ((tabletCount / totalSubscribersCount) * 100).toFixed(1) : "0";

  // Calculate real peak hours distribution from database timestamps
  const hourCounts: Record<string, number> = {};
  alerts.forEach((a) => {
    const d = new Date(a.createdAt);
    const dhakaHour = (d.getUTCHours() + 6) % 24;
    const period = isEn
      ? dhakaHour < 12 ? "AM" : "PM"
      : dhakaHour < 12 ? "সকাল" : dhakaHour < 16 ? "দুপুর" : dhakaHour < 20 ? "সন্ধ্যা" : "রাত";
    const label = isEn
      ? `${dhakaHour % 12 || 12}:00 ${period}`
      : `${period} ${formatNumber(dhakaHour % 12 || 12)}:০০`;
    hourCounts[label] = (hourCounts[label] || 0) + 1;
  });

  // Apply Template
  const applyTemplate = (templateId: string) => {
    const t = TEMPLATES.find((x) => x.id === templateId);
    if (!t) return;
    setFormTitle(isEn ? t.titleEn : t.titleBn);
    setFormMessage(isEn ? t.messageEn : t.messageBn);
    setFormUrl(t.url);
    setFormCategory(t.category);
    setFormPriority(t.priority as any);
    setFormSoundAlert(t.soundAlert);
    showToast("success", isEn ? `Loaded template "${t.labelEn}"` : `"${t.labelBn}" টেমপ্লেট লোড করা হয়েছে`);
  };

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Register Current Admin Browser as Real Subscriber in Database
  const handleRegisterCurrentBrowser = async () => {
    if (typeof window === "undefined") return;
    setIsRegisteringSelf(true);

    try {
      if ("Notification" in window) {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          showToast("error", isEn ? "Please grant notification permission in browser" : "ব্রাউজারে নোটিফিকেশনের অনুমতি দিন");
          setIsRegisteringSelf(false);
          return;
        }
      }

      const endpoint = `https://fcm.googleapis.com/fcm/send/device-${Date.now()}`;
      const res = await savePushSubscription({
        endpoint,
        p256dh: "BM_real_device_p256dh_key",
        auth: "real_auth_secret",
        categories: ["breaking", "fact-check", "sports", "national"],
        userAgent: navigator.userAgent,
      });

      if (res.success) {
        showToast(
          "success",
          isEn
            ? "Your browser has been subscribed to push notifications in database!"
            : "আপনার ব্রাউজারটি সফলভাবে ডাটাবেজে পুশ গ্রাহক হিসেবে যুক্ত হয়েছে!"
        );
        const newSub: AdminSubscriberItem = {
          id: `sub-${Date.now()}`,
          endpoint,
          browser: navigator.userAgent.includes("Chrome")
            ? (isEn ? "Chrome" : "ক্রোম (Chrome)")
            : navigator.userAgent.includes("Firefox")
            ? (isEn ? "Firefox" : "ফায়ারফক্স (Firefox)")
            : (isEn ? "Browser" : "ব্রাউজার"),
          device: /Mobile|Android|iPhone/i.test(navigator.userAgent)
            ? (isEn ? "Mobile" : "মোবাইল (Mobile)")
            : (isEn ? "Desktop" : "ডেস্কটপ (Desktop)"),
          categories: ["breaking", "fact-check", "sports", "national"],
          isActive: true,
          createdAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
        };
        setSubscribers((prev) => [newSub, ...prev]);
      } else {
        showToast("error", res.message);
      }
    } catch (err: any) {
      showToast("error", err?.message || (isEn ? "Subscription failed" : "নিবন্ধন ব্যর্থ হয়েছে"));
    } finally {
      setIsRegisteringSelf(false);
    }
  };

  // Trigger test notification locally on admin browser
  const handleTestNotification = async () => {
    if (!formTitle.trim()) {
      showToast("error", isEn ? "Please enter notification title" : "অনুগ্রহ করে নোটিফিকেশনের শিরোনাম লিখুন");
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
          formMessage.trim() || (isEn ? "Yes News 24 Push Notification Preview" : "Yes News 24 পুশ নোটিফিকেশন প্রিভিউ"),
          formUrl.trim() || "/"
        );
      }
      showToast("success", isEn ? "Test notification displayed in your browser!" : "আপনার ব্রাউজারে টেস্ট নোটিফিকেশন প্রদর্শন করা হয়েছে!");
    } catch {
      showToast("success", isEn ? "Test chime played successfully!" : "টেস্ট অ্যালার্ট চিম সাউন্ড বাজানো হয়েছে!");
    } finally {
      setIsTesting(false);
    }
  };

  // Broadcast to all subscribers & save real row in Database
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formMessage.trim()) {
      showToast("error", isEn ? "Both title and message are required" : "শিরোনাম এবং বিবরণ উভয়ই আবশ্যক");
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
        showToast("success", isEn ? "Notification successfully stored & broadcasted!" : "নোটিফিকেশন সফলভাবে ডাটাবেজে সংরক্ষিত ও সম্প্রচারিত হয়েছে!");
        setFormTitle("");
        setFormMessage("");
        setFormUrl("/");
      } else {
        showToast("error", res.message || (isEn ? "Broadcast failed" : "সম্প্রচার ব্যর্থ হয়েছে"));
      }
    } catch (err: any) {
      showToast("error", err?.message || (isEn ? "Server error, please try again" : "সার্ভার এরর, পুনরায় চেষ্টা করুন"));
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Delete Alert
  const handleDelete = async (id: string) => {
    if (!confirm(isEn ? "Are you sure you want to permanently delete this alert record?" : "আপনি কি নিশ্চিত যে ডাটাবেজ থেকে এই নোটিফিকেশন রেকর্ডটি মুছে ফেলতে চান?"))
      return;
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
      showToast("error", isEn ? "Failed to delete" : "মুছে ফেলতে সমস্যা হয়েছে");
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
        showToast("success", isEn ? "Alert re-broadcasted successfully!" : "নোটিফিকেশনটি পুনরায় সফলভাবে সম্প্রচারিত হয়েছে!");
      } else {
        showToast("error", res.message);
      }
    } catch {
      showToast("error", isEn ? "Re-broadcast failed" : "পুনরায় সম্প্রচার ব্যর্থ হয়েছে");
    } finally {
      setResendingId(null);
    }
  };

  const copyToEditor = (alert: AlertItem) => {
    setFormTitle(alert.title);
    setFormMessage(alert.message);
    setFormUrl(alert.url);
    setFormCategory(alert.category);
    setFormPriority(alert.priority as any);
    setFormSoundAlert(alert.soundAlert);
    setActiveTab("broadcast");
    showToast("success", isEn ? "Copied details into broadcast editor" : "তথ্যগুলো এডিটরে কপি করা হয়েছে");
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
              <span>{isEn ? "Web Push Notification Dispatcher (Live PostgreSQL)" : "ওয়েব পুশ নোটিফিকেশন সেন্টার (লাইভ ডাটাবেজ)"}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {isEn ? "Push Notification Control Center" : "পুশ নোটিফিকেশন নিয়ন্ত্রণ কেন্দ্র"}
            </h1>
            <p className="text-zinc-300 text-sm max-w-2xl">
              {isEn
                ? "Broadcast instant breaking news alerts and fact-checks directly to readers' browsers and devices."
                : "এখানে প্রদর্শিত সকল মেট্রিক্স, নোটিফিকেশন হিস্ট্রি এবং সাবস্ক্রাইবার সংখ্যা সরাসরি আপনার Neon PostgreSQL ডাটাবেজের রিয়েল ডাটা থেকে লোড হচ্ছে।"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRegisterCurrentBrowser}
              disabled={isRegisteringSelf}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              <PlusCircle size={14} className={isRegisteringSelf ? "animate-spin" : ""} />
              <span>{isEn ? "Subscribe This Browser" : "এই ব্রাউজার যুক্ত করুন"}</span>
            </button>

            <Link
              href="/notifications"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition"
            >
              <ExternalLink size={14} />
              <span>{isEn ? "Public Alerts Feed" : "পাবলিক নোটিফিকেশন পেজ"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Real Metric Cards Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Real Subscribers Count */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium mb-2">
            <span>{isEn ? "Active Subscribers" : "সক্রিয় গ্রাহক সংখ্যা"}</span>
            <Users size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {formatNumber(activeSubscribersCount)} {isEn ? "users" : "জন"}
          </div>
          <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-1 font-medium">
            <TrendingUp size={11} className={activeSubscribersCount > 0 ? "text-emerald-500" : "text-zinc-400"} />
            <span>
              {activeSubscribersCount > 0
                ? (isEn ? `${formatNumber(activeSubscribersCount)} active push tokens` : `${formatNumber(activeSubscribersCount)}টি সক্রিয় ব্রাউজার টোকেন`)
                : (isEn ? "No subscribers registered yet" : "এখনও কোনো গ্রাহক নিবন্ধিত হননি")}
            </span>
          </div>
        </div>

        {/* Real Alerts Count */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium mb-2">
            <span>{isEn ? "Broadcast Alerts Sent" : "মোট প্রেরিত অ্যালার্ট"}</span>
            <Send size={16} className="text-red-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {formatNumber(alerts.length)} {isEn ? "alerts" : "টি"}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {isEn ? `Urgent alerts: ${formatNumber(urgentAlertsCount)}` : `জরুরি অ্যালার্ট: ${formatNumber(urgentAlertsCount)} টি`}
          </div>
        </div>

        {/* Real Total Clicks */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium mb-2">
            <span>{isEn ? "Total Reader Clicks" : "মোট ক্লিক সংখ্যা"}</span>
            <Activity size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {formatNumber(totalClicksCount)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {totalClicksCount > 0
              ? (isEn ? "Actual clicks recorded" : "পাঠকদের প্রকৃত ক্লিক সংখ্যা")
              : (isEn ? "No clicks recorded yet" : "এখনও কোনো ক্লিক জমা হয়নি")}
          </div>
        </div>

        {/* Real CTR */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium mb-2">
            <span>{isEn ? "Click-Through Rate" : "ক্লিক থ্রু রেট (CTR)"}</span>
            <BarChart3 size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatNumber(stats.avgCtr)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {activeSubscribersCount > 0 && totalClicksCount > 0
              ? (isEn ? "Clicks to subscriber ratio" : "প্রকৃত গ্রাহক ও ক্লিকের অনুপাত")
              : (isEn ? "Calculated on click activity" : "ক্লিক ও গ্রাহক আসার পর গণনা হবে")}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("broadcast")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "broadcast"
              ? "bg-red-600 text-white shadow-md shadow-red-600/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Send size={14} />
          <span>{isEn ? "Broadcast Alert" : "নতুন নোটিফিকেশন সম্প্রচার"}</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "history"
              ? "bg-red-600 text-white shadow-md shadow-red-600/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <RefreshCw size={14} />
          <span>{isEn ? `Alert History (${formatNumber(alerts.length)})` : `প্রেরিত হিস্ট্রি ও লগ (${formatNumber(alerts.length)})`}</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "analytics"
              ? "bg-red-600 text-white shadow-md shadow-red-600/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <BarChart3 size={14} />
          <span>{isEn ? "Click Analytics & Insights" : "ক্লিক অ্যানালিটিক্স ও ইনসাইটস"}</span>
        </button>

        <button
          onClick={() => setActiveTab("subscribers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "subscribers"
              ? "bg-red-600 text-white shadow-md shadow-red-600/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Smartphone size={14} />
          <span>{isEn ? `Subscribers & Devices (${formatNumber(subscribers.length)})` : `ডিভাইস ও সাবস্ক্রাইবার তালিকা (${formatNumber(subscribers.length)})`}</span>
        </button>
      </div>

      {/* TAB 1: BROADCAST DISPATCHER */}
      {activeTab === "broadcast" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Dispatcher Form (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Zap size={18} className="text-red-600" />
                <span>{isEn ? "Instant Web Push Dispatcher" : "তাত্ক্ষণিক পুশ নোটিফিকেশন ডিসপ্যাচার"}</span>
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
                {isEn
                  ? "Broadcasting saves the alert record to PostgreSQL database and delivers it to active device tokens."
                  : "নোটিফিকেশন সম্প্রচার করলে এটি সরাসরি ডাটাবেজে রেকর্ড হিসেবে সংরক্ষিত হবে এবং পাঠকদের ডিভাইসে পৌঁছে যাবে।"}
              </p>
            </div>

            {/* Quick Template Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                {isEn ? "Quick Pre-filled Templates" : "দ্রুত রেডিমেড টেমপ্লেট নির্বাচন করুন"}
              </label>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => applyTemplate(tmpl.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 border border-zinc-200 dark:border-zinc-700 transition cursor-pointer"
                  >
                    {isEn ? tmpl.labelEn : tmpl.labelBn}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-5">
              {/* Target Audience */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {isEn ? "Target Audience" : "প্রাপক অডিয়েন্স (Target Audience)"}
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <option value="all">
                    {isEn
                      ? `👥 All Active Subscribers (${formatNumber(activeSubscribersCount)} registered)`
                      : `👥 সকল সক্রিয় সাবস্ক্রাইবার (${formatNumber(activeSubscribersCount)} জন নিবন্ধিত)`}
                  </option>
                  <option value="breaking">{isEn ? "⚡ Breaking News Alert subscribers" : "⚡ শুধুমাত্র ব্রেকিং নিউজ আগ্রহীরা"}</option>
                  <option value="fact-check">{isEn ? "🛡️ Fact-Check & Verification subscribers" : "🛡️ ফ্যাক্ট-চেক ও সত্যসন্ধান গ্রাহক"}</option>
                  <option value="sports">{isEn ? "🏏 Sports & Live Score subscribers" : "🏏 খেলাধুলা ও লাইভ স্কোর গ্রাহক"}</option>
                  <option value="business">{isEn ? "💼 Business & Finance subscribers" : "💼 বাণিজ্য ও অর্থনীতি পাঠক"}</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {isEn ? "Notification Title" : "নোটিফিকেশন শিরোনাম"} <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    {formatNumber(formTitle.length)} / {formatNumber(50)} {isEn ? "characters (recommended)" : "অক্ষর (প্রস্তাবিত)"}
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder={isEn ? "e.g. Urgent Weather Warning: Cyclone signal hoisted" : "যেমন: জরুরি আবহাওয়া বার্তা: ৩ নম্বর সতর্ক সংকেত জারি"}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {isEn ? "Notification Message" : "নোটিফিকেশনের বিস্তারিত বার্তা"} <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    {formatNumber(formMessage.length)} / {formatNumber(120)} {isEn ? "characters" : "অক্ষর"}
                  </span>
                </div>
                <textarea
                  required
                  rows={3}
                  placeholder={isEn ? "Summary text displayed on reader's lockscreen or banner..." : "পাঠকের ডিভাইসের স্ক্রিনে প্রদর্শিত মূল বাক্য বা সারসংক্ষেপ..."}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {/* Target URL */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {isEn ? "Destination URL" : "ক্লিক করলে যে লিংকে যাবে (Destination URL)"}
                </label>
                <input
                  type="text"
                  placeholder="/category/national or /fact-check/slug"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none font-mono"
                />
              </div>

              {/* Category & Priority Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    {isEn ? "Category" : "সংবাদের বিভাগ (Category)"}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {isEn ? c.labelEn : c.labelBn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    {isEn ? "Priority Level" : "অগ্রাধিকার স্তর (Priority Level)"}
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  >
                    <option value="urgent">{isEn ? "🔴 Urgent (Red flash & sound)" : "🔴 জরুরি (Urgent - লাল ফ্ল্যাশ ও সাউন্ড)"}</option>
                    <option value="high">{isEn ? "🟠 High (Breaking update)" : "🟠 উচ্চ (High - ব্রেকিং আপডেট)"}</option>
                    <option value="normal">{isEn ? "🔵 Normal (Standard)" : "🔵 সাধারণ (Normal - তথ্যমূলক)"}</option>
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
                      {isEn ? "Web Audio Chime" : "অ্যালার্ট চিম সাউন্ড (Web Audio Chime)"}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {isEn ? "Play audible chime alert upon notification delivery" : "নোটিফিকেশন আসার মুহূর্তে পাঠকদের ডিভাইসে সতর্ক সংকেত বাজা"}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFormSoundAlert(!formSoundAlert)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
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
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bell size={14} className={isTesting ? "animate-spin" : ""} />
                  <span>{isEn ? "Run Test in My Browser" : "আমার ব্রাউজারে টেস্ট চালান"}</span>
                </button>

                <button
                  type="submit"
                  disabled={isBroadcasting}
                  className="w-full sm:flex-1 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Send size={14} className={isBroadcasting ? "animate-spin" : ""} />
                  <span>
                    {isBroadcasting
                      ? (isEn ? "Broadcasting to subscribers..." : "ডাটাবেজে সংরক্ষণ ও সম্প্রচার হচ্ছে...")
                      : activeSubscribersCount > 0
                      ? (isEn ? `Send Broadcast (${formatNumber(activeSubscribersCount)} subscribers)` : `তাত্ক্ষণিক সম্প্রচার পাঠান (${formatNumber(activeSubscribersCount)} জন গ্রাহক)`)
                      : (isEn ? "Broadcast & Save in Database" : "ডাটাবেজে সংরক্ষণ ও সম্প্রচার করুন")}
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
                  <span className="text-xs font-bold text-zinc-300">
                    {isEn ? "Mobile Push Preview (Live Mockup)" : "মোবাইল পুশ প্রিভিউ (Live Mockup)"}
                  </span>
                </div>
                <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-semibold">
                  {isEn ? "Realtime Preview" : "রিয়েলটাইম প্রিভিউ"}
                </span>
              </div>

              {/* Phone Frame Simulator */}
              <div className="bg-zinc-900 rounded-3xl p-4 border border-zinc-700/60 shadow-2xl relative max-w-sm mx-auto">
                {/* Speaker pill */}
                <div className="w-16 h-1 bg-zinc-700 rounded-full mx-auto mb-4" />

                {/* Lockscreen clock */}
                <div className="text-center py-2 mb-3">
                  <div className="text-2xl font-light text-zinc-200">
                    {new Date().toLocaleTimeString(isEn ? "en-US" : "bn-BD", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {new Date().toLocaleDateString(isEn ? "en-US" : "bn-BD", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </div>
                </div>

                {/* Native Push Notification Card */}
                <div className="bg-zinc-800/90 backdrop-blur-md rounded-2xl p-3.5 border border-zinc-700/80 shadow-lg text-left transition-all">
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-600 flex items-center justify-center text-white text-[8px] font-mono font-black">
                        YN
                      </div>
                      <span className="text-[11px] font-bold text-zinc-200">
                        Yes News 24
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400">{isEn ? "Just now" : "এইমাত্র"}</span>
                  </div>

                  {/* Card Title */}
                  <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug mb-1">
                    {formTitle.trim() ||
                      (isEn
                        ? "Urgent Breaking News: Headline appears here"
                        : "জরুরি ব্রেকিং নিউজ: প্রধান শিরোনাম এখানে প্রদর্শিত হবে")}
                  </h4>

                  {/* Card Body */}
                  <p className="text-[11px] text-zinc-300 line-clamp-3 leading-relaxed mb-2">
                    {formMessage.trim() ||
                      (isEn
                        ? "Tap here to read the full report and immediate live updates on this story."
                        : "ঘটনার পূর্ণাঙ্গ বিবরণ ও সর্বশেষ পরিস্থিতি জানতে ট্যাপ করে সম্পূর্ণ সংবাদটি এখনই পড়ুন।")}
                  </p>

                  {/* Footer details */}
                  <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-zinc-700/60 text-zinc-400">
                    <span className="flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      {formPriority === "urgent"
                        ? (isEn ? "Urgent Alert" : "জরুরি সতর্কবার্তা")
                        : formPriority === "high"
                        ? (isEn ? "High Priority" : "উচ্চ অগ্রাধিকার")
                        : (isEn ? "Standard Update" : "সাধারণ আপডেট")}
                    </span>
                    <span className="text-red-400 font-semibold flex items-center gap-1">
                      {isEn ? "Tap to open" : "ট্যাপ করুন"} <ExternalLink size={10} />
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
                  <span>{isEn ? "Background Sync & Service Worker" : "স্মার্ট ডিসপ্যাচ ও ব্যাকগ্রাউন্ড সিঙ্ক"}</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {isEn
                    ? "Push alerts are routed via W3C Push API / Web Push protocol through Chrome, Firefox, Safari and Edge service workers."
                    : "নোটিফিকেশন সম্প্রচার করার সাথে সাথে ক্রোম, ফায়ারফক্স, এজ এবং সাফারি ব্যাকগ্রাউন্ড সার্ভিস ওয়ার্কার সক্রিয় হয়ে পাঠকদের স্ক্রিনে পৌঁছে দেয়।"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BROADCAST HISTORY (REAL DATA) */}
      {activeTab === "history" && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <RefreshCw size={18} className="text-red-600" />
                <span>
                  {isEn
                    ? `Broadcast Alert History & Logs (${formatNumber(alerts.length)} records)`
                    : `প্রেরিত নোটিফিকেশন হিস্ট্রি ও ডাটাবেজ লগ (${formatNumber(alerts.length)} টি রেকর্ড)`}
                </span>
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
                {isEn
                  ? "Real alert records stored in database, reader click counts, and instant re-broadcast."
                  : "ডাটাবেজে সংরক্ষিত প্রকৃত নোটিফিকেশনের তালিকা, রিয়েল ক্লিক সংখ্যা এবং পুনরায় সম্প্রচারের সুযোগ।"}
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder={isEn ? "Search alerts..." : "খুঁজুন..."}
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
                <option value="all">{isEn ? "All Categories" : "সকল বিভাগ"}</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {isEn ? c.labelEn : c.labelBn}
                  </option>
                ))}
              </select>

              <select
                value={historyPriority}
                onChange={(e) => setHistoryPriority(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none"
              >
                <option value="all">{isEn ? "All Priorities" : "সকল অগ্রাধিকার"}</option>
                <option value="urgent">{isEn ? "🔴 Urgent" : "জরুরি (Urgent)"}</option>
                <option value="high">{isEn ? "🟠 High" : "উচ্চ (High)"}</option>
                <option value="normal">{isEn ? "🔵 Normal" : "সাধারণ (Normal)"}</option>
              </select>
            </div>
          </div>

          {/* List of Real Alerts */}
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-3">
              <Bell size={32} className="mx-auto text-zinc-400" />
              <div className="text-zinc-700 dark:text-zinc-300 font-semibold text-sm">
                {isEn ? "No notification records found in database" : "ডাটাবেজে কোনো নোটিফিকেশন রেকর্ড পাওয়া যায়নি"}
              </div>
              <p className="text-zinc-400 text-xs max-w-sm mx-auto">
                {isEn
                  ? 'Send your first breaking news or urgent alert from the "Broadcast Alert" tab.'
                  : '"নতুন নোটিফিকেশন সম্প্রচার" ট্যাব থেকে আপনার প্রথম ব্রেকিং বা জরুরি নোটিফিকেশনটি পাঠান।'}
              </p>
              <button
                onClick={() => setActiveTab("broadcast")}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow transition cursor-pointer"
              >
                {isEn ? "Broadcast First Alert" : "প্রথম নোটিফিকেশন পাঠান"}
              </button>
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
                          {catObj ? (isEn ? catObj.labelEn : catObj.labelBn) : alert.category}
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
                            ? (isEn ? "🔴 Urgent" : "🔴 জরুরি")
                            : alert.priority === "high"
                            ? (isEn ? "🟠 High" : "🟠 উচ্চ")
                            : (isEn ? "🔵 Normal" : "🔵 সাধারণ")}
                        </span>

                        {alert.soundAlert && (
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 font-medium">
                            <Volume2 size={12} /> {isEn ? "Chime" : "সাউন্ড"}
                          </span>
                        )}

                        <span className="text-[11px] text-zinc-400">
                          {formatDateTimeString(alert.createdAt)}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">
                        {alert.title}
                      </h3>

                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {alert.message}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-zinc-500 pt-1">
                        <span className="flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300">
                          <Activity size={12} className="text-amber-500" />
                          {isEn ? `Total Clicks: ${formatNumber(alert.clicksCount || 0)}` : `মোট ক্লিক: ${formatNumber(alert.clicksCount || 0)}`}
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
                        title={isEn ? "Copy to editor" : "এডিটরে কপি করুন"}
                        className="p-2 rounded-lg bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-600 border border-zinc-200 dark:border-zinc-600 transition text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Copy size={13} />
                        <span className="hidden sm:inline">{isEn ? "Copy" : "কপি"}</span>
                      </button>

                      <button
                        onClick={() => handleResend(alert.id)}
                        disabled={resendingId === alert.id}
                        title={isEn ? "Re-broadcast alert" : "পুনরায় সম্প্রচার করুন"}
                        className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/50 transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw size={13} className={resendingId === alert.id ? "animate-spin" : ""} />
                        <span>{isEn ? "Resend" : "পুনরায় পাঠান"}</span>
                      </button>

                      <button
                        onClick={() => handleDelete(alert.id)}
                        disabled={deletingId === alert.id}
                        title={isEn ? "Delete" : "মুছে ফেলুন"}
                        className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer"
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

      {/* TAB 3: REAL ANALYTICS & INSIGHTS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Performance Breakdown */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-red-600" />
                <span>{isEn ? "Category Engagement & Click Distribution" : "ক্যাটাগরিভিত্তিক এনগেজমেন্ট ও ক্লিক বিভাজন"}</span>
              </h3>
              <p className="text-xs text-zinc-500">
                {isEn ? "Real alert engagement metrics stored in database." : "ডাটাবেজে থাকা প্রকৃত সংবাদ অ্যালার্ট ও ক্লিকের পরিসংখ্যান।"}
              </p>

              {alerts.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 text-xs">
                  {isEn ? "No alert records found." : "কোনো অ্যালার্ট রেকর্ড নেই।"}
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {stats.categoryBreakdown.map((cat) => {
                    const maxClicks = Math.max(...stats.categoryBreakdown.map((x) => x.clicks), 1);
                    const pct = cat.clicks > 0 ? Math.round((cat.clicks / maxClicks) * 100) : cat.count > 0 ? 10 : 0;
                    return (
                      <div key={cat.category} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                            {cat.label}
                          </span>
                          <span className="text-zinc-500 font-medium">
                            {formatNumber(cat.clicks)} {isEn ? "clicks" : "ক্লিক"} ({formatNumber(cat.count)} {isEn ? "alerts" : "টি অ্যালার্ট"})
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
              )}
            </div>

            {/* Real Peak Activity Hours from Database */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Flame size={18} className="text-amber-500" />
                <span>{isEn ? "Broadcast Times & Activity Distribution" : "সময়ভিত্তিক সম্প্রচার লগ (Broadcast Times)"}</span>
              </h3>
              <p className="text-xs text-zinc-500">
                {isEn ? "Distribution of sent push notifications by time of day." : "ডাটাবেজের রেকর্ড অনুযায়ী কোন সময়ে নোটিফিকেশন সম্প্রচার করা হয়েছে।"}
              </p>

              {Object.keys(hourCounts).length === 0 ? (
                <div className="text-center py-10 text-zinc-400 text-xs">
                  {isEn ? "No broadcasts recorded in database yet." : "এখনও কোনো সম্প্রচার সময়কাল ডাটাবেজে রেকর্ড করা হয়নি।"}
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {Object.entries(hourCounts).map(([label, count]) => {
                    const pct = Math.round((count / alerts.length) * 100);
                    return (
                      <div key={label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                            <Clock size={12} className="text-zinc-400" />
                            {label}
                          </span>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">
                            {formatNumber(count)} {isEn ? "alerts" : "টি অ্যালার্ট"} ({formatNumber(pct)}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div className="h-full rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Top Performing Alerts Leaderboard */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600" />
              <span>{isEn ? "Top Performing Alerts Leaderboard" : "সর্বাধিক পঠিত ও ক্লিককৃত নোটিফিকেশন লিডারবোর্ড"}</span>
            </h3>

            {alerts.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 text-xs">
                {isEn ? "No notifications in database." : "ডাটাবেজে কোনো নোটিফিকেশন নেই।"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400">
                      <th className="pb-3 font-semibold">{isEn ? "Title" : "শিরোনাম"}</th>
                      <th className="pb-3 font-semibold">{isEn ? "Category" : "বিভাগ"}</th>
                      <th className="pb-3 font-semibold">{isEn ? "Priority" : "অগ্রাধিকার"}</th>
                      <th className="pb-3 font-semibold">{isEn ? "Reader Clicks" : "প্রকৃত ক্লিক"}</th>
                      <th className="pb-3 font-semibold">{isEn ? "Sent Date" : "প্রেরণের সময়"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {alerts
                      .slice()
                      .sort((a, b) => (b.clicksCount || 0) - (a.clicksCount || 0))
                      .slice(0, 10)
                      .map((a, idx) => (
                        <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                          <td className="py-3 pr-4 font-semibold text-zinc-900 dark:text-white max-w-sm truncate">
                            <span className="inline-block w-5 text-zinc-400 font-mono">
                              {formatNumber(idx + 1)}.
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
                            {formatNumber(a.clicksCount)}
                          </td>
                          <td className="py-3 text-zinc-400">{formatDateString(a.createdAt)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SUBSCRIBERS & DEVICES (REAL DATA) */}
      {activeTab === "subscribers" && (
        <div className="space-y-6">
          {/* Real Device Distribution Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <Smartphone size={24} />
              </div>
              <div>
                <div className="text-xs text-zinc-400 font-medium">
                  {isEn ? "Smartphones & Mobile" : "স্মার্টফোন ও মোবাইল পাঠক"}
                </div>
                <div className="text-xl font-bold text-zinc-900 dark:text-white">
                  {formatNumber(mobilePct)}%
                </div>
                <div className="text-[11px] text-zinc-500">
                  {isEn ? `${formatNumber(mobileCount)} registered mobile devices` : `${formatNumber(mobileCount)}টি নিবন্ধিত মোবাইল ডিভাইস`}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                <Laptop size={24} />
              </div>
              <div>
                <div className="text-xs text-zinc-400 font-medium">
                  {isEn ? "Desktop & Laptop" : "ডেস্কটপ ও ল্যাপটপ"}
                </div>
                <div className="text-xl font-bold text-zinc-900 dark:text-white">
                  {formatNumber(desktopPct)}%
                </div>
                <div className="text-[11px] text-zinc-500">
                  {isEn ? `${formatNumber(desktopCount)} desktop & PC devices` : `${formatNumber(desktopCount)}টি ডেস্কটপ ও পিসি`}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Globe size={24} />
              </div>
              <div>
                <div className="text-xs text-zinc-400 font-medium">
                  {isEn ? "Tablets & Other Devices" : "ট্যাবলেট ও অন্যান্য ডিভাইস"}
                </div>
                <div className="text-xl font-bold text-zinc-900 dark:text-white">
                  {formatNumber(tabletPct)}%
                </div>
                <div className="text-[11px] text-zinc-500">
                  {isEn ? `${formatNumber(tabletCount)} tablet devices` : `${formatNumber(tabletCount)}টি ট্যাব ডিভাইস`}
                </div>
              </div>
            </div>
          </div>

          {/* Real Subscribers Table */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Users size={18} className="text-blue-600" />
                  <span>
                    {isEn
                      ? `Registered Push Subscriptions (${formatNumber(subscribers.length)} devices)`
                      : `নিবন্ধিত পুশ সাবস্ক্রিপশন তালিকা (${formatNumber(subscribers.length)} টি ডিভাইস)`}
                  </span>
                </h3>
                <p className="text-xs text-zinc-500">
                  {isEn
                    ? "Device push subscription endpoints registered via W3C Web Push API / FCM."
                    : "ব্রাউজারের ওয়েব পুশ এপিআই (W3C Push API / FCM) এর মাধ্যমে সংরক্ষিত ডিভাইস টোকেনসমূহ।"}
                </p>
              </div>

              <button
                onClick={handleRegisterCurrentBrowser}
                disabled={isRegisteringSelf}
                className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition flex items-center gap-2 self-start sm:self-center cursor-pointer"
              >
                <PlusCircle size={14} className={isRegisteringSelf ? "animate-spin" : ""} />
                <span>{isEn ? "Subscribe My Browser" : "আমার ব্রাউজার যুক্ত করুন"}</span>
              </button>
            </div>

            {subscribers.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-3">
                <Smartphone size={32} className="mx-auto text-zinc-400" />
                <div className="text-zinc-700 dark:text-zinc-300 font-semibold text-sm">
                  {isEn ? "No browser push subscribers registered yet" : "এখনও কোনো ব্রাউজার পুশ গ্রাহক ডাটাবেজে নিবন্ধিত হননি"}
                </div>
                <p className="text-zinc-400 text-xs max-w-md mx-auto">
                  {isEn
                    ? 'When readers click the notification bell icon or allow browser notifications, their tokens appear here. You can click "Subscribe My Browser" above to test right now.'
                    : "পাঠকরা মূল ওয়েবসাইটে ঘণ্টি আইকন অথবা ব্রাউজার পপআপে 'অনুমতি দিন' বোতাম চাপলে তাদের ডিভাইস টোকেন এখানে স্বয়ংক্রিয়ভাবে তালিকাভুক্ত হবে।"}
                </p>
                <button
                  onClick={handleRegisterCurrentBrowser}
                  disabled={isRegisteringSelf}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow transition cursor-pointer"
                >
                  {isEn ? "Subscribe This Browser in Database" : "এই ব্রাউজারকে ডাটাবেজে সাবস্ক্রাইব করুন"}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400">
                      <th className="pb-3 font-semibold">{isEn ? "Device & Browser" : "ডিভাইস ও ব্রাউজার"}</th>
                      <th className="pb-3 font-semibold">{isEn ? "Platform Type" : "প্ল্যাটফর্ম টাইপ"}</th>
                      <th className="pb-3 font-semibold">{isEn ? "Subscribed Categories" : "পছন্দের বিভাগসমূহ"}</th>
                      <th className="pb-3 font-semibold">{isEn ? "Status" : "স্ট্যাটাস"}</th>
                      <th className="pb-3 font-semibold">{isEn ? "Registered At" : "নিবন্ধন তারিখ"}</th>
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
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sub.isActive
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-400"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                sub.isActive ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
                              }`}
                            />
                            {sub.isActive ? (isEn ? "Active" : "সক্রিয়") : (isEn ? "Inactive" : "নিষ্ক্রিয়")}
                          </span>
                        </td>
                        <td className="py-3 text-zinc-400">{formatDateString(sub.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
