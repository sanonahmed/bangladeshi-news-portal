"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Camera,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  FileText,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Lock,
  Sparkles,
  RefreshCw,
  Globe,
  Share2,
  Briefcase,
  Layers,
} from "lucide-react";
import { FacebookIcon, TwitterXIcon, LinkedinIcon } from "@/components/ui/icons";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import {
  type MyProfileData,
  updateMyAuthorProfile,
  changeMyPassword,
} from "@/actions/profile";

interface AdminProfileClientProps {
  initialProfile: MyProfileData;
}

const BUREAUS = [
  "কেন্দ্রীয় বার্তা কক্ষ, ঢাকা",
  "ঢাকা ব্যুরো",
  "চট্টগ্রাম ব্যুরো",
  "সিলেট ব্যুরো",
  "রাজশাহী ব্যুরো",
  "খুলনা ব্যুরো",
  "বরিশাল ব্যুরো",
  "রংপুর ব্যুরো",
  "ময়মনসিংহ ব্যুরো",
  "বিশেষ আন্তর্জাতিক ডেস্ক",
];

const DEPARTMENTS = [
  "কেন্দ্রীয় বার্তা বিভাগ",
  "অনুসন্ধানী সেল",
  "জাতীয় ও রাজনীতি",
  "আন্তর্জাতিক ডেস্ক",
  "অর্থনীতি ও বাণিজ্য",
  "খেলাধুলা",
  "শিল্প, সাহিত্য ও সংস্কৃতি",
  "বিনোদন ও জীবনযাপন",
  "বিজ্ঞান ও তথ্যপ্রযুক্তি",
  "আইন ও অপরাধ",
  "মতামত ও সম্পাদকীয়",
];

const DESIGNATION_SUGGESTIONS = [
  "প্রধান বার্তা সম্পাদক ও প্রকাশক",
  "ভারপ্রাপ্ত সম্পাদক",
  "বার্তা সম্পাদক",
  "নির্বাহী সম্পাদক",
  "যুগ্ম বার্তা সম্পাদক",
  "বিশেষ প্রতিনিধি",
  "সিনিয়র স্টাফ রিপোর্টার",
  "স্টাফ রিপোর্টার",
  "জেলা প্রতিনিধি",
  "বিশেষ সংবাদদাতা",
  "সহ-সম্পাদক",
];

export function AdminProfileClient({ initialProfile }: AdminProfileClientProps) {
  const { language, isEn, formatDateString, formatNumber } = useAdminLanguage();

  const [profile, setProfile] = useState<MyProfileData>(initialProfile);
  const [activeTab, setActiveTab] = useState<"general" | "bio" | "social" | "security">("general");

  // Form states
  const [nameBangla, setNameBangla] = useState(initialProfile.nameBangla);
  const [nameEnglish, setNameEnglish] = useState(initialProfile.nameEnglish || "");
  const [slug, setSlug] = useState(initialProfile.slug);
  const [designation, setDesignation] = useState(initialProfile.designation);
  const [department, setDepartment] = useState(initialProfile.department);
  const [bureau, setBureau] = useState(initialProfile.bureau || "কেন্দ্রীয় বার্তা কক্ষ, ঢাকা");
  const [bio, setBio] = useState(initialProfile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl || "");
  const [twitterHandle, setTwitterHandle] = useState(initialProfile.twitterHandle || "");
  const [facebookUrl, setFacebookUrl] = useState(initialProfile.facebookUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(initialProfile.linkedinUrl || "");
  const [contactEmail, setContactEmail] = useState(initialProfile.email || "");
  const [phone, setPhone] = useState(initialProfile.phone || "");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdNotification, setPwdNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Status & Notification states
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Auto-slug generator from English name if desired
  function generateSlugFromName() {
    const base = nameEnglish || nameBangla;
    const clean = base
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (clean) setSlug(clean);
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setNotification(null);
    setLoading(true);

    try {
      const res = await updateMyAuthorProfile({
        nameBangla,
        nameEnglish: nameEnglish || null,
        slug,
        designation,
        department,
        bureau: bureau || null,
        bio: bio || null,
        avatarUrl: avatarUrl || null,
        twitterHandle: twitterHandle || null,
        facebookUrl: facebookUrl || null,
        linkedinUrl: linkedinUrl || null,
        email: contactEmail || null,
        phone: phone || null,
      });

      if (!res.success) {
        setNotification({ type: "error", message: res.error || "প্রোফাইল আপডেট করতে সমস্যা হয়েছে।" });
      } else {
        setNotification({
          type: "success",
          message: isEn
            ? "Your author profile has been updated successfully!"
            : "আপনার লেখক পরিচিতি ও প্রোফাইল সফলভাবে আপডেট করা হয়েছে!",
        });
        setProfile((prev) => ({
          ...prev,
          nameBangla,
          nameEnglish: nameEnglish || null,
          slug: res.slug || slug,
          designation,
          department,
          bureau,
          bio: bio || null,
          avatarUrl: avatarUrl || null,
          twitterHandle: twitterHandle || null,
          facebookUrl: facebookUrl || null,
          linkedinUrl: linkedinUrl || null,
          email: contactEmail || null,
          phone: phone || null,
        }));
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err?.message || "সার্ভার যোগাযোগে ত্রুটি ঘটেছে।" });
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwdNotification(null);

    if (newPassword !== confirmPassword) {
      setPwdNotification({ type: "error", message: "নতুন পাসওয়ার্ড ও নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।" });
      return;
    }

    if (newPassword.length < 8) {
      setPwdNotification({ type: "error", message: "নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।" });
      return;
    }

    setPwdLoading(true);
    try {
      const res = await changeMyPassword({ currentPassword, newPassword });
      if (!res.success) {
        setPwdNotification({ type: "error", message: res.error || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।" });
      } else {
        setPwdNotification({
          type: "success",
          message: isEn ? "Password updated successfully!" : "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      setPwdNotification({ type: "error", message: err?.message || "ত্রুটি ঘটেছে।" });
    } finally {
      setPwdLoading(false);
    }
  }

  const roleLabel =
    profile.userRole === "super_admin"
      ? (isEn ? "Super Admin" : "সুপার অ্যাডমিন")
      : profile.userRole === "admin"
      ? (isEn ? "Administrator" : "প্রশাসনিক সম্পাদক")
      : profile.userRole === "editor"
      ? (isEn ? "Senior Editor" : "সম্পাদক")
      : (isEn ? "Journalist / Reporter" : "প্রতিবেদক / সাংবাদিক");

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-2 border border-purple-200 dark:border-purple-900/50">
            <User size={13} />
            <span>{isEn ? "Staff & Author Profile" : "লেখক ও বার্তা কর্মী প্রোফাইল"}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--color-text)] tracking-tight">
            {isEn ? "Author & Editorial Profile Setup" : "আমার প্রোফাইল ও লেখক পরিচিতি"}
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-2xl leading-relaxed">
            {isEn
              ? "Manage your author photo, public bio, designation, desk, and contact links. These details are featured on your public author page and beneath your published stories."
              : "আপনার লেখক ছবি, পরিচিতি, পদবি, ডেস্ক ও সামাজিক যোগাযোগ তথ্য পরিচালনা করুন। এই তথ্যগুলো পাঠকরা আপনার প্রকাশিত সংবাদের নিচে এবং পাবলিক লেখক পাতায় দেখতে পাবেন।"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/author/${profile.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] rounded-lg hover:bg-[var(--color-bg)] transition-colors shadow-xs"
          >
            <ExternalLink size={14} className="text-purple-600 dark:text-purple-400" />
            <span>{isEn ? "View Public Profile" : "পাবলিক প্রোফাইল দেখুন"}</span>
          </Link>
          <button
            onClick={handleProfileSave}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{loading ? (isEn ? "Saving..." : "সংরক্ষণ হচ্ছে...") : (isEn ? "Save Changes" : "পরিবর্তন সংরক্ষণ করুন")}</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 border shadow-xs ${
            notification.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
              : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span className="font-semibold">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs font-bold hover:underline cursor-pointer"
          >
            {isEn ? "Dismiss" : "বন্ধ করুন"}
          </button>
        </div>
      )}

      {/* Main Grid: Left Hero Card + Right Edit Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Author Card Preview & Quick Stats (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Identity Card */}
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6 shadow-xs text-center relative overflow-hidden">
            {/* Top decorative gradient banner */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-purple-700 via-indigo-600 to-[var(--color-primary)] opacity-90"></div>

            {/* Avatar Photo with live preview */}
            <div className="relative mx-auto w-24 h-24 rounded-full border-4 border-[var(--color-bg)] bg-[var(--color-bg-secondary)] shadow-md overflow-hidden mt-6 mb-3 flex items-center justify-center">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={nameBangla}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center text-3xl font-extrabold select-none">
                  {nameBangla.charAt(0) || "স"}
                </div>
              )}
            </div>

            <h2 className="text-lg font-bold text-[var(--color-text)] tracking-tight">
              {nameBangla}
            </h2>
            {nameEnglish && (
              <p className="text-xs text-[var(--color-text-muted)] font-medium">
                {nameEnglish}
              </p>
            )}

            {/* Designation & Bureau */}
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mt-1">
              {designation}
            </p>
            <div className="inline-flex items-center gap-1 text-[11px] text-[var(--color-text-faint)] mt-1">
              <MapPin size={11} />
              <span>{bureau || "কেন্দ্রীয় বার্তা কক্ষ"}</span>
            </div>

            {/* Role Badge */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                <Shield size={10} />
                <span>{roleLabel}</span>
              </span>
              {profile.isBureauChief && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  <Briefcase size={10} />
                  <span>ব্যুরো প্রধান</span>
                </span>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-[var(--color-border)] text-left">
              <div className="bg-[var(--color-bg-secondary)] p-3 rounded-lg border border-[var(--color-border)]">
                <span className="text-[10px] uppercase font-bold text-[var(--color-text-faint)] tracking-wider block mb-1">
                  {isEn ? "Published Stories" : "প্রকাশিত সংবাদ"}
                </span>
                <span className="text-lg font-extrabold text-[var(--color-primary)] flex items-center gap-1.5">
                  <FileText size={16} />
                  <span>{formatNumber(profile.totalArticles)}</span>
                </span>
              </div>

              <div className="bg-[var(--color-bg-secondary)] p-3 rounded-lg border border-[var(--color-border)]">
                <span className="text-[10px] uppercase font-bold text-[var(--color-text-faint)] tracking-wider block mb-1">
                  {isEn ? "News Desk" : "বার্তা ডেস্ক"}
                </span>
                <span className="text-xs font-bold text-[var(--color-text)] truncate block" title={department}>
                  {department}
                </span>
              </div>
            </div>

            {/* System Details Box */}
            <div className="mt-4 p-3 bg-[var(--color-bg-secondary)] rounded-lg text-left text-xs space-y-1.5 border border-[var(--color-border)]">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[var(--color-text-faint)]">{isEn ? "System Email:" : "লগইন ইমেইল:"}</span>
                <span className="font-mono text-[var(--color-text)] font-semibold truncate max-w-[170px]" title={profile.systemEmail}>
                  {profile.systemEmail}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[var(--color-text-faint)]">{isEn ? "Public URL:" : "লেখক লিংক:"}</span>
                <Link
                  href={`/author/${slug}`}
                  target="_blank"
                  className="font-mono text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                >
                  <span>/{slug}</span>
                  <ExternalLink size={10} />
                </Link>
              </div>
            </div>
          </div>

          {/* Live Article Byline Card Preview */}
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--color-border)]">
              <span className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                <span>{isEn ? "Live Byline Box Preview" : "সংবাদ পাতায় লেখক পরিচিতি যেমন দেখাবে"}</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[var(--color-text-faint)]">
                Live
              </span>
            </div>

            <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)] space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-purple-700 text-white flex-shrink-0 flex items-center justify-center font-bold text-sm">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt={nameBangla} fill className="object-cover" unoptimized />
                  ) : (
                    <span>{nameBangla.charAt(0) || "স"}</span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--color-text)]">{nameBangla}</h4>
                  <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">{designation}</p>
                  <p className="text-[10px] text-[var(--color-text-faint)]">{bureau || "বাংলাদেশ বার্তা"}</p>
                </div>
              </div>

              <p className="text-xs text-[var(--color-text-muted)] line-clamp-3 leading-relaxed">
                {bio || "এখানে আপনার সংক্ষিপ্ত লেখক বায়ো প্রদর্শিত হবে যা পাঠকদের আপনার সাংবাদিকতা ও বিশেষজ্ঞতা সম্পর্কে অবহিত করে।"}
              </p>

              {(twitterHandle || facebookUrl || linkedinUrl) && (
                <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border)] text-zinc-500">
                  {facebookUrl && <FacebookIcon className="w-3.5 h-3.5 hover:text-blue-600" />}
                  {twitterHandle && <TwitterXIcon className="w-3.5 h-3.5 hover:text-black dark:hover:text-white" />}
                  {linkedinUrl && <LinkedinIcon className="w-3.5 h-3.5 hover:text-blue-700" />}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Settings Panels (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("general")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === "general"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
              }`}
            >
              <User size={14} />
              <span>{isEn ? "General & Editorial" : "১. সাধারণ ও সম্পাদকীয় তথ্য"}</span>
            </button>

            <button
              onClick={() => setActiveTab("bio")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === "bio"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
              }`}
            >
              <FileText size={14} />
              <span>{isEn ? "Author Bio & Credentials" : "২. লেখক পরিচিতি ও বায়ো"}</span>
            </button>

            <button
              onClick={() => setActiveTab("social")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === "social"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
              }`}
            >
              <Share2 size={14} />
              <span>{isEn ? "Contact & Social Media" : "৩. যোগাযোগ ও সামাজিক মাধ্যম"}</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === "security"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
              }`}
            >
              <Lock size={14} />
              <span>{isEn ? "Security & Password" : "৪. নিরাপত্তা ও পাসওয়ার্ড"}</span>
            </button>
          </div>

          {/* Tab 1: General & Editorial Info */}
          {activeTab === "general" && (
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6 shadow-xs space-y-6">
              <div className="border-b border-[var(--color-border)] pb-4">
                <h3 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
                  <User size={16} className="text-purple-600" />
                  <span>{isEn ? "Editorial Identity & Author Metadata" : "সম্পাদকীয় পরিচিতি ও মেটাডাটা"}</span>
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {isEn
                    ? "Enter your official name in Bengali, English, author slug and professional designation."
                    : "আপনার পূর্ণ নাম, পাবলিক লেখক স্লাগ, অফিশিয়াল পদবি ও বার্তা বিভাগ নির্ধারণ করুন।"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name Bangla */}
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">
                    {isEn ? "Full Name (Bengali) *" : "পূর্ণ নাম (বাংলায়) *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={nameBangla}
                    onChange={(e) => setNameBangla(e.target.value)}
                    placeholder="উদা: সাওন আহমেদ"
                    className="w-full px-3.5 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm rounded-lg focus:outline-none focus:border-purple-600 text-[var(--color-text)] font-semibold"
                  />
                  <span className="text-[11px] text-[var(--color-text-faint)] mt-1 block">
                    সংবাদের বাইলাইনে এবং পাবলিক সাইটে প্রদর্শিত মূল নাম।
                  </span>
                </div>

                {/* Name English */}
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">
                    {isEn ? "Full Name (English)" : "পূর্ণ নাম (ইংরেজিতে)"}
                  </label>
                  <input
                    type="text"
                    value={nameEnglish}
                    onChange={(e) => setNameEnglish(e.target.value)}
                    placeholder="e.g. Sawon Ahmed"
                    className="w-full px-3.5 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm rounded-lg focus:outline-none focus:border-purple-600 text-[var(--color-text)]"
                  />
                  <span className="text-[11px] text-[var(--color-text-faint)] mt-1 block">
                    ইংরেজি সংস্করণ ও আন্তর্জাতিক বাইলাইনের জন্য।
                  </span>
                </div>

                {/* Profile Photo URL */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">
                    {isEn ? "Author Photo / Avatar URL" : "প্রোফাইল ছবি / অবতার লিংক (URL)"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/photos/journalist.jpg"
                      className="flex-1 px-3.5 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm rounded-lg focus:outline-none focus:border-purple-600 text-[var(--color-text)] font-mono text-xs"
                    />
                    <Link
                      href="/admin/media"
                      target="_blank"
                      className="px-4 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] rounded-lg hover:bg-[var(--color-bg)] transition-colors flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Camera size={14} className="text-purple-600" />
                      <span>{isEn ? "Media Library" : "মিডিয়া লাইব্রেরি"}</span>
                    </Link>
                  </div>
                  <span className="text-[11px] text-[var(--color-text-faint)] mt-1 block">
                    মিডিয়া লাইব্রেরি থেকে আপলোড করে পাওয়া পাবলিক লিংক পেস্ট করতে পারেন অথবা যেকোনো সুরক্ষিত ইমেজ URL দিতে পারেন।
                  </span>
                </div>

                {/* Public URL Slug */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[var(--color-text)]">
                      {isEn ? "Author Page Slug (URL Path) *" : "লেখক পাতা স্লাগ (URL Path) *"}
                    </label>
                    <button
                      type="button"
                      onClick={generateSlugFromName}
                      className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold hover:underline cursor-pointer"
                    >
                      {isEn ? "Auto-generate from Name" : "নাম থেকে তৈরি করুন"}
                    </button>
                  </div>
                  <div className="flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden">
                    <span className="px-3.5 py-2.5 bg-[var(--color-bg-tertiary,rgba(0,0,0,0.03))] text-xs text-[var(--color-text-muted)] font-mono border-r border-[var(--color-border)] select-none">
                      /author/
                    </span>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      placeholder="sawon-ahmed"
                      className="flex-1 px-3.5 py-2.5 bg-transparent text-sm focus:outline-none text-[var(--color-text)] font-mono"
                    />
                  </div>
                  <span className="text-[11px] text-[var(--color-text-faint)] mt-1 block">
                    আপনার পাবলিক পোর্টফোলিও ঠিকানা: <code className="text-purple-600">/author/{slug || "slug"}</code>
                  </span>
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">
                    {isEn ? "Official Designation *" : "অফিশিয়াল পদবি *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="উদা: প্রধান বার্তা সম্পাদক ও প্রকাশক"
                    className="w-full px-3.5 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm rounded-lg focus:outline-none focus:border-purple-600 text-[var(--color-text)] font-semibold"
                  />
                  {/* Quick suggestion chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {DESIGNATION_SUGGESTIONS.slice(0, 4).map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setDesignation(sug)}
                        className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-purple-500 hover:text-purple-600 cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">
                    {isEn ? "Department / Desk *" : "বিভাগ / ডেস্ক *"}
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm rounded-lg focus:outline-none focus:border-purple-600 text-[var(--color-text)]"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bureau Location */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">
                    {isEn ? "Bureau / Workplace" : "কর্মস্থল / ব্যুরো কার্যালয়"}
                  </label>
                  <select
                    value={bureau}
                    onChange={(e) => setBureau(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm rounded-lg focus:outline-none focus:border-purple-600 text-[var(--color-text)]"
                  >
                    {BUREAUS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--color-border)] flex justify-end">
                <button
                  type="button"
                  onClick={handleProfileSave}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {loading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>{loading ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Bio & Credentials */}
          {activeTab === "bio" && (
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6 shadow-xs space-y-6">
              <div className="border-b border-[var(--color-border)] pb-4">
                <h3 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
                  <FileText size={16} className="text-purple-600" />
                  <span>{isEn ? "Author Biography & Credentials" : "লেখক পরিচিতি ও বায়োগ্রাফি"}</span>
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {isEn
                    ? "Provide a comprehensive journalistic bio. Highlight your beats, investigative awards, or field experience."
                    : "আপনার সাংবাদিকতা ক্যারিয়ার, বিশেষায়িত বিষয় (বিট), শিক্ষাগত বা পেশাগত অর্জন এবং সংক্ষিপ্ত জীবনবৃত্তান্ত লিখুন।"}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[var(--color-text)]">
                    {isEn ? "Detailed Biography (Bengali)" : "বিস্তারিত বায়ো ও পরিচিতি (বাংলায়)"}
                  </label>
                  <span className={`text-[11px] font-mono ${bio.length > 1800 ? "text-amber-600 font-bold" : "text-[var(--color-text-faint)]"}`}>
                    {bio.length} / ২০০০ অক্ষর
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="উদা: দুই দশকেরও বেশি সময় ধরে অনুসন্ধানী সাংবাদিকতায় যুক্ত। জাতীয় রাজনীতি, ভূরাজনীতি এবং অর্থনৈতিক সুশাসন নিয়ে নিয়মিত বিশ্লেষণ ও প্রতিবেদন প্রকাশ করে আসছেন..."
                  className="w-full px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm rounded-lg focus:outline-none focus:border-purple-600 text-[var(--color-text)] leading-relaxed"
                />
                <div className="flex items-center gap-2 mt-2 text-xs text-[var(--color-text-faint)] bg-purple-50/50 dark:bg-purple-950/20 p-3 rounded-lg border border-purple-100 dark:border-purple-950">
                  <Sparkles size={14} className="text-purple-600 flex-shrink-0" />
                  <span>
                    টিপস: ৩ থেকে ৫টি পরিচ্ছন্ন বাক্যে আপনার বিশেষায়িত জ্ঞান বা কাজের বিষয়বস্তু তুলে ধরলে তা সংবাদের সত্যতা ও পাঠকের আস্থা বৃদ্ধি করে।
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--color-border)] flex justify-end">
                <button
                  type="button"
                  onClick={handleProfileSave}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {loading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>{loading ? "সংরক্ষণ হচ্ছে..." : "বায়ো সংরক্ষণ করুন"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Social & Contact */}
          {activeTab === "social" && (
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6 shadow-xs space-y-6">
              <div className="border-b border-[var(--color-border)] pb-4">
                <h3 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
                  <Share2 size={16} className="text-purple-600" />
                  <span>{isEn ? "Public Contact & Social Links" : "পাবলিক যোগাযোগ ও সামাজিক মাধ্যম"}</span>
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {isEn
                    ? "Connect your official professional profiles and news desk contact channels."
                    : "পাঠক ও অন্যান্য সাংবাদিকদের যোগাযোগের জন্য অফিশিয়াল ইমেইল ও সোশ্যাল প্রোফাইল লিংক যুক্ত করুন।"}
                </p>
              </div>

              <div className="space-y-4">
                {/* Official Email */}
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">
                    {isEn ? "Public Editorial Email" : "পাবলিক ও সম্পাদকীয় ইমেইল"}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="sawon@bangladeshbarta.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm rounded-lg focus:outline-none focus:border-purple-600 text-[var(--color-text)] font-mono text-xs"
                    />
                    <Mail size={15} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">
                    {isEn ? "Phone / WhatsApp / Signal" : "ফোন / হোয়াটসঅ্যাপ / সিগন্যাল নম্বর"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+880 1712-XXXXXX"
                      className="w-full pl-9 pr-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm rounded-lg focus:outline-none focus:border-purple-600 text-[var(--color-text)] font-mono text-xs"
                    />
                    <Phone size={15} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
                  </div>
                </div>

                {/* X / Twitter */}
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">
                    {isEn ? "X (Twitter) Profile or Handle" : "X (Twitter) প্রোফাইল লিংক বা হ্যান্ডল"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                      placeholder="@username অথবা https://x.com/username"
                      className="w-full pl-9 pr-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm rounded-lg focus:outline-none focus:border-purple-600 text-[var(--color-text)] font-mono text-xs"
                    />
                    <div className="absolute left-3 top-3 text-[var(--color-text-muted)]">
                      <TwitterXIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Facebook */}
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">
                    {isEn ? "Facebook Profile / Page URL" : "ফেসবুক প্রোফাইল / পেজ লিংক"}
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/username"
                      className="w-full pl-9 pr-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm rounded-lg focus:outline-none focus:border-purple-600 text-[var(--color-text)] font-mono text-xs"
                    />
                    <div className="absolute left-3 top-3 text-[var(--color-text-muted)]">
                      <FacebookIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">
                    {isEn ? "LinkedIn Profile URL" : "লিঙ্কডইন প্রোফাইল লিংক"}
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full pl-9 pr-3 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm rounded-lg focus:outline-none focus:border-purple-600 text-[var(--color-text)] font-mono text-xs"
                    />
                    <div className="absolute left-3 top-3 text-[var(--color-text-muted)]">
                      <LinkedinIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--color-border)] flex justify-end">
                <button
                  type="button"
                  onClick={handleProfileSave}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {loading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>{loading ? "সংরক্ষণ হচ্ছে..." : "যোগাযোগ তথ্য সংরক্ষণ করুন"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: Security & Password */}
          {activeTab === "security" && (
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6 shadow-xs space-y-6">
              <div className="border-b border-[var(--color-border)] pb-4">
                <h3 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
                  <Lock size={16} className="text-purple-600" />
                  <span>{isEn ? "Account Security & Password" : "অ্যাকাউন্ট নিরাপত্তা ও পাসওয়ার্ড পরিবর্তন"}</span>
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {isEn
                    ? "Update your login password securely. A minimum of 8 characters is required."
                    : "আপনার অ্যাডমিন প্যানেল অ্যাকাউন্টের লগইন পাসওয়ার্ড পরিবর্তন করুন। পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।"}
                </p>
              </div>

              {pwdNotification && (
                <div
                  className={`p-3.5 rounded-lg text-xs flex items-center justify-between border ${
                    pwdNotification.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200"
                      : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {pwdNotification.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                    <span>{pwdNotification.message}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">
                    {isEn ? "Current Password *" : "বর্তমান পাসওয়ার্ড *"}
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm rounded-lg focus:outline-none focus:border-purple-600 text-[var(--color-text)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">
                    {isEn ? "New Password (min 8 characters) *" : "নতুন পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর) *"}
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm rounded-lg focus:outline-none focus:border-purple-600 text-[var(--color-text)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-1">
                    {isEn ? "Confirm New Password *" : "নতুন পাসওয়ার্ড নিশ্চিত করুন *"}
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm rounded-lg focus:outline-none focus:border-purple-600 text-[var(--color-text)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50 mt-2"
                >
                  {pwdLoading ? <RefreshCw size={14} className="animate-spin" /> : <Lock size={14} />}
                  <span>{pwdLoading ? "আপডেট হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন করুন"}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
