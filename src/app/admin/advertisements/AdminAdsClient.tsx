"use client";

import { useState } from "react";
import {
  createOrUpdateAd,
  toggleAdStatus,
  deleteAd,
} from "@/actions/advertisements";
import type { Advertisement } from "@/db/schema/advertisements";
import {
  DollarSign,
  PlusCircle,
  Trash2,
  Edit2,
  ExternalLink,
  Eye,
  MousePointerClick,
  Percent,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  Smartphone,
  Monitor,
  Globe,
} from "lucide-react";
import Image from "next/image";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

interface AdminAdsClientProps {
  initialAds: Advertisement[];
}

const STANDARD_SLOTS = [
  { id: "homepage_leaderboard", nameEn: "Homepage Leaderboard", nameBn: "হোমপেজ লিডারবোর্ড", size: "970 × 90", sizeBn: "৯৭০ × ৯০", width: 970, height: 90 },
  { id: "header_banner", nameEn: "Header Banner", nameBn: "হেডার ব্যানার", size: "728 × 90", sizeBn: "৭২৮ × ৯০", width: 728, height: 90 },
  { id: "sidebar", nameEn: "Article Sidebar", nameBn: "সংবাদ পার্শ্ববার", size: "300 × 250", sizeBn: "৩০০ × ২৫০", width: 300, height: 250 },
  { id: "between_sections", nameEn: "Between Sections Banner", nameBn: "সেকশন মধ্যবর্তী ব্যানার", size: "728 × 90", sizeBn: "৭২৮ × ৯০", width: 728, height: 90 },
  { id: "article_inline", nameEn: "Article Inline Ad", nameBn: "সংবাদের অভ্যন্তরস্থ বিজ্ঞাপন", size: "336 × 280", sizeBn: "৩৩৬ × ২৮০", width: 336, height: 280 },
  { id: "footer", nameEn: "Footer Banner", nameBn: "ফুটার ব্যানার", size: "728 × 90", sizeBn: "৭২৮ × ৯০", width: 728, height: 90 },
  { id: "mobile_slot", nameEn: "Mobile Banner", nameBn: "মোবাইল ব্যানার", size: "320 × 100", sizeBn: "৩২০ × ১০০", width: 320, height: 100 },
];

export function AdminAdsClient({ initialAds }: AdminAdsClientProps) {
  const { language, formatNumber } = useAdminLanguage();
  const isEn = language === "en";

  const [adsList, setAdsList] = useState<Advertisement[]>(initialAds);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [placement, setPlacement] = useState<string>("homepage_leaderboard");
  const [type, setType] = useState<"direct_image" | "adsense" | "sponsored">("direct_image");
  const [imageUrl, setImageUrl] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [adCode, setAdCode] = useState("");
  const [altText, setAltText] = useState("");
  const [deviceTarget, setDeviceTarget] = useState<"all" | "desktop" | "mobile">("all");
  const [isActive, setIsActive] = useState(true);

  // Overall metrics calculation
  const totalImpressions = adsList.reduce((acc, ad) => acc + (ad.impressions || 0), 0);
  const totalClicks = adsList.reduce((acc, ad) => acc + (ad.clicks || 0), 0);
  const overallCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

  function handleEdit(ad: Advertisement) {
    setEditingAdId(ad.id);
    setName(ad.name);
    setPlacement(ad.placement);
    setType(ad.type as any);
    setImageUrl(ad.imageUrl || "");
    setDestinationUrl(ad.destinationUrl || "");
    setAdCode(ad.adCode || "");
    setAltText(ad.altText || "");
    setDeviceTarget(ad.deviceTarget as any);
    setIsActive(ad.isActive);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingAdId(null);
    setName("");
    setImageUrl("");
    setDestinationUrl("");
    setAdCode("");
    setAltText("");
    setIsActive(true);
    setShowAddForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError(isEn ? "Ad name is required" : "বিজ্ঞাপনের নাম আবশ্যক");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createOrUpdateAd({
        id: editingAdId || undefined,
        name: name.trim(),
        placement: placement as any,
        type,
        imageUrl: imageUrl.trim() || undefined,
        destinationUrl: destinationUrl.trim() || undefined,
        adCode: adCode.trim() || undefined,
        altText: altText.trim() || undefined,
        deviceTarget,
        isActive,
      });

      if (!res.success || !res.ad) {
        setError(res.error || (isEn ? "Failed to save ad" : "সংরক্ষণ ব্যর্থ হয়েছে"));
      } else {
        setSuccess(
          editingAdId
            ? (isEn ? "Ad updated successfully!" : "বিজ্ঞাপন সফলভাবে আপডেট হয়েছে!")
            : (isEn ? "New ad created successfully!" : "নতুন বিজ্ঞাপন সফলভাবে যুক্ত হয়েছে!")
        );
        if (editingAdId) {
          setAdsList(adsList.map((a) => (a.id === editingAdId ? res.ad! : a)));
        } else {
          setAdsList([res.ad, ...adsList]);
        }
        resetForm();
      }
    } catch (err: any) {
      setError(err?.message || (isEn ? "Server error occurred" : "সার্ভার এরর ঘটেছে"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleStatus(id: string, currentStatus: boolean) {
    setActionLoadingId(id);
    try {
      const res = await toggleAdStatus(id, !currentStatus);
      if (res.success) {
        setAdsList(adsList.map((a) => (a.id === id ? { ...a, isActive: !currentStatus } : a)));
        setSuccess(isEn ? "Ad status updated" : "বিজ্ঞাপন স্ট্যাটাস পরিবর্তন হয়েছে");
      } else {
        setError(res.error || (isEn ? "Failed to change status" : "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে"));
      }
    } catch (err: any) {
      setError(err?.message || (isEn ? "Server error" : "সার্ভার এরর"));
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(isEn ? "Are you sure you want to delete this ad?" : "আপনি কি নিশ্চিতভাবে এই বিজ্ঞাপনটি মুছে ফেলতে চান?"))
      return;
    setActionLoadingId(id);
    try {
      const res = await deleteAd(id);
      if (res.success) {
        setAdsList(adsList.filter((a) => a.id !== id));
        setSuccess(isEn ? "Ad deleted successfully" : "বিজ্ঞাপন মুছে ফেলা হয়েছে");
      } else {
        setError(res.error || (isEn ? "Failed to delete ad" : "মুছে ফেলা ব্যর্থ হয়েছে"));
      }
    } catch (err: any) {
      setError(err?.message || (isEn ? "Server error" : "সার্ভার এরর"));
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2 tracking-tight">
            <DollarSign size={26} className="text-[var(--color-primary)]" />
            <span>{isEn ? "Advertisements & Sponsorship Slots Manager" : "বিজ্ঞাপন ব্যানার ও স্পন্সরশিপ স্লট ম্যানেজার"}</span>
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {isEn
              ? "Manage display banners, Google AdSense slots, direct sponsorships, impressions and link tracking"
              : "হোমপেজ ও সংবাদের ভিতরের বাণিজ্যিক ব্যানার, গুগল অ্যাডসেন্স, ইম্প্রেশন ও লিংক ট্র্যাকিং নিয়ন্ত্রণ করুন"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showAddForm) resetForm();
            else setShowAddForm(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-colors rounded shadow-xs cursor-pointer"
        >
          <PlusCircle size={15} />
          <span>{showAddForm ? (isEn ? "Close Form" : "ফর্ম বন্ধ করুন") : (isEn ? "Add New Advertisement" : "নতুন বিজ্ঞাপন যুক্ত করুন")}</span>
        </button>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 border border-[var(--color-border)] rounded bg-[var(--color-bg)]">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--color-text-muted)]">
            <span>{isEn ? "Active Ads" : "সক্রিয় বিজ্ঞাপন"}</span>
            <Globe size={15} className="text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--color-text)] mt-1">
            {formatNumber(adsList.filter((a) => a.isActive).length)} / {formatNumber(adsList.length)}
          </div>
        </div>

        <div className="p-4 border border-[var(--color-border)] rounded bg-[var(--color-bg)]">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--color-text-muted)]">
            <span>{isEn ? "Total Impressions" : "মোট ইম্প্রেশন (ভিউ)"}</span>
            <Eye size={15} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
            {formatNumber(totalImpressions)}
          </div>
        </div>

        <div className="p-4 border border-[var(--color-border)] rounded bg-[var(--color-bg)]">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--color-text-muted)]">
            <span>{isEn ? "Total Clicks" : "মোট ক্লিক"}</span>
            <MousePointerClick size={15} className="text-[var(--color-primary)]" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--color-primary)] mt-1 font-mono">
            {formatNumber(totalClicks)}
          </div>
        </div>

        <div className="p-4 border border-[var(--color-border)] rounded bg-[var(--color-bg)]">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--color-text-muted)]">
            <span>{isEn ? "Avg CTR" : "গড় সিটিআর (CTR)"}</span>
            <Percent size={15} className="text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600 mt-1 font-mono">
            {formatNumber(overallCtr)}%
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border-l-4 border-red-600 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-600 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Add / Edit Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="border border-[var(--color-border)] p-6 bg-[var(--color-bg)] rounded space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <h3 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
              <PlusCircle size={18} className="text-[var(--color-primary)]" />
              <span>{editingAdId ? (isEn ? "Edit Advertisement" : "বিজ্ঞাপন তথ্য সম্পাদনা করুন") : (isEn ? "New Advertisement" : "নতুন বিজ্ঞাপন তথ্য")}</span>
            </h3>
            <span className="text-xs text-[var(--color-text-muted)]">
              {isEn ? "Set banner image, destination URL and placement slot" : "ব্যানার ছবি, গন্তব্য লিংক ও স্লট নির্ধারণ করুন"}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-3">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                  {isEn ? "Campaign / Ad Name *" : "বিজ্ঞাপন বা ক্যাম্পেইনের নাম *"}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isEn ? "e.g. Bkash Special Cashback Campaign" : "যেমন: বিকাশ স্পেশাল ক্যাশব্যাক ক্যাম্পেইন"}
                  className="w-full p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm font-bold focus:outline-none focus:border-[var(--color-primary)] rounded"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                    {isEn ? "Placement Slot *" : "বিজ্ঞাপন স্লট (Placement Slot) *"}
                  </label>
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value)}
                    className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded font-semibold"
                  >
                    {STANDARD_SLOTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {isEn ? s.nameEn : s.nameBn} ({isEn ? s.size : s.sizeBn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                    {isEn ? "Ad Type" : "বিজ্ঞাপনের ধরন (Ad Type)"}
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded font-semibold"
                  >
                    <option value="direct_image">{isEn ? "Direct Image Banner" : "ডিরেক্ট ইমেজ ব্যানার (Direct Banner)"}</option>
                    <option value="sponsored">{isEn ? "Sponsored Content Banner" : "স্পন্সরড কন্টেন্ট ব্যানার (Sponsored)"}</option>
                    <option value="adsense">{isEn ? "Google AdSense / Custom HTML" : "গুগল অ্যাডসেন্স / এইচটিএমএল কোড"}</option>
                  </select>
                </div>
              </div>

              {type !== "adsense" ? (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-[var(--color-text-muted)]">
                        {isEn ? "Banner Image URL *" : "ব্যানার ইমেজ লিংক (Image URL) *"}
                      </label>
                    </div>
                    <input
                      type="url"
                      required
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://.../banner.png"
                      className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-mono focus:outline-none focus:border-[var(--color-primary)] rounded"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                        {isEn ? "Destination URL" : "গন্তব্য লিংক (Destination URL - ক্লিকে যেখানে যাবে)"}
                      </label>
                      <input
                        type="url"
                        value={destinationUrl}
                        onChange={(e) => setDestinationUrl(e.target.value)}
                        placeholder="https://www.example.com"
                        className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-mono focus:outline-none focus:border-[var(--color-primary)] rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                        {isEn ? "Alt Text" : "অল্টারনেটিভ টেক্সট (Alt Text)"}
                      </label>
                      <input
                        type="text"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        placeholder={isEn ? "Short description of banner" : "ব্যানারের সংক্ষিপ্ত বর্ণনা"}
                        className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                    {isEn ? "AdSense Script / HTML Code" : "অ্যাডসেন্স স্ক্রিপ্ট / এইচটিএমএল কোড (AdSense Code)"}
                  </label>
                  <textarea
                    rows={4}
                    value={adCode}
                    onChange={(e) => setAdCode(e.target.value)}
                    placeholder="<script async src='https://pagead2.googlesyndication.com/...'>...</script>"
                    className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-mono focus:outline-none focus:border-[var(--color-primary)] rounded"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                    {isEn ? "Device Target" : "ডিভাইস টার্গেটিং (Device Target)"}
                  </label>
                  <select
                    value={deviceTarget}
                    onChange={(e) => setDeviceTarget(e.target.value as any)}
                    className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
                  >
                    <option value="all">{isEn ? "All Devices (Desktop & Mobile)" : "সকল ডিভাইস (Desktop & Mobile)"}</option>
                    <option value="desktop">{isEn ? "Desktop Only" : "শুধু ডেস্কটপ"}</option>
                    <option value="mobile">{isEn ? "Mobile Only" : "শুধু মোবাইল"}</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-[var(--color-primary)]"
                    />
                    <span>{isEn ? "Keep advertisement active immediately" : "বিজ্ঞাপনটি অবিলম্বে সক্রিয় রাখুন"}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Live Preview Column */}
            <div className="lg:col-span-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-4 rounded flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
                {isEn ? "Live Banner Preview" : "লাইভ ব্যানার প্রিভিউ"}
              </span>

              {imageUrl ? (
                <div className="relative w-full aspect-video bg-zinc-900 border border-[var(--color-border)] rounded overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    onError={() => {}}
                  />
                </div>
              ) : (
                <div className="w-full aspect-video border border-dashed border-[var(--color-border)] rounded flex flex-col items-center justify-center text-[var(--color-text-muted)]">
                  <ImageIcon size={28} className="mb-1" />
                  <span className="text-xs">
                    {isEn ? "Provide image URL to see preview" : "ইমেজ লিংক দিলে প্রিভিউ প্রদর্শিত হবে"}
                  </span>
                </div>
              )}

              <p className="text-[10px] text-[var(--color-text-muted)] mt-2">
                {isEn ? "Slot size:" : "স্লট:"}{" "}
                {isEn
                  ? STANDARD_SLOTS.find((s) => s.id === placement)?.size
                  : STANDARD_SLOTS.find((s) => s.id === placement)?.sizeBn}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-[var(--color-border)] text-xs font-bold rounded hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer"
            >
              {isEn ? "Cancel" : "বাতিল"}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold rounded transition-colors shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  {isEn ? "Saving..." : "সংরক্ষণ হচ্ছে..."}
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  {editingAdId ? (isEn ? "Save Changes" : "আপডেট সংরক্ষণ করুন") : (isEn ? "Publish Advertisement" : "বিজ্ঞাপন প্রকাশ করুন")}
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Slots & Assigned Ads List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[var(--color-text)] border-b border-[var(--color-border)] pb-2 flex items-center justify-between">
          <span>{isEn ? "Standard Ad Slots & Current Performance" : "বিজ্ঞাপন স্লট ও বর্তমান পারফরম্যান্স তালিকা"}</span>
          <span className="text-xs text-[var(--color-text-muted)] font-normal">
            {isEn ? "Total 7 standard placements" : "মোট ৭টি আদর্শ স্লট"}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STANDARD_SLOTS.map((slot) => {
            const assignedAd = adsList.find((a) => a.placement === slot.id && a.isActive) || adsList.find((a) => a.placement === slot.id);
            const impressions = assignedAd?.impressions || 0;
            const clicks = assignedAd?.clicks || 0;
            const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : "0.00";
            const isLoading = assignedAd ? actionLoadingId === assignedAd.id : false;

            return (
              <div
                key={slot.id}
                className="border border-[var(--color-border)] rounded-md bg-[var(--color-bg)] p-4 space-y-3 shadow-xs hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                  <div>
                    <h4 className="font-bold text-sm text-[var(--color-text)]">
                      {isEn ? slot.nameEn : slot.nameBn}
                    </h4>
                    <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
                      {isEn ? `Slot: ${slot.id} (${slot.size})` : `স্লট: ${slot.id} (${slot.sizeBn})`}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      assignedAd?.isActive
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-300 dark:border-zinc-700"
                    }`}
                  >
                    {assignedAd?.isActive
                      ? (isEn ? "● Active Live" : "● লাইভ সক্রিয়")
                      : (isEn ? "○ Empty / Inactive" : "○ খালি / নিষ্ক্রিয়")}
                  </span>
                </div>

                {assignedAd ? (
                  <div className="space-y-2.5">
                    {/* Banner Image Preview */}
                    {assignedAd.imageUrl ? (
                      <div className="relative w-full h-24 bg-zinc-900 border border-[var(--color-border)] rounded overflow-hidden">
                        <Image
                          src={assignedAd.imageUrl}
                          alt={assignedAd.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="p-3 bg-[var(--color-bg-secondary)] text-center text-xs text-[var(--color-text-muted)] rounded font-mono">
                        {assignedAd.type === "adsense"
                          ? (isEn ? "Google AdSense script active" : "গুগল অ্যাডসেন্স স্ক্রিপ্ট অ্যাক্টিভ")
                          : (isEn ? "Custom HTML code slot" : "কাস্টম কোড স্লট")}
                      </div>
                    )}

                    <div className="space-y-1">
                      <h5 className="font-bold text-xs text-[var(--color-text)] line-clamp-1">
                        {assignedAd.name}
                      </h5>
                      {assignedAd.destinationUrl && (
                        <a
                          href={assignedAd.destinationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-[var(--color-primary)] hover:underline truncate max-w-xs flex items-center gap-1 font-mono"
                        >
                          <span>{assignedAd.destinationUrl}</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>

                    {/* Performance metrics pill */}
                    <div className="grid grid-cols-3 gap-2 bg-[var(--color-bg-secondary)] p-2 rounded text-center text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-[var(--color-text-muted)] block">
                          {isEn ? "Impressions" : "ইম্প্রেশন"}
                        </span>
                        <span className="font-bold text-[var(--color-text)]">{formatNumber(impressions)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--color-text-muted)] block">
                          {isEn ? "Clicks" : "ক্লিক"}
                        </span>
                        <span className="font-bold text-[var(--color-primary)]">{formatNumber(clicks)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--color-text-muted)] block">
                          {isEn ? "CTR" : "সিটিআর"}
                        </span>
                        <span className="font-bold text-purple-600">{formatNumber(ctr)}%</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleToggleStatus(assignedAd.id, assignedAd.isActive)}
                        className={`px-2.5 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                          assignedAd.isActive
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200"
                            : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200"
                        }`}
                      >
                        {assignedAd.isActive ? (isEn ? "Pause" : "পজ করুন") : (isEn ? "Activate" : "সক্রিয় করুন")}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(assignedAd)}
                          className="p-1.5 text-zinc-500 hover:text-[var(--color-primary)] rounded hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer"
                          title={isEn ? "Edit" : "সম্পাদনা করুন"}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleDelete(assignedAd.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                          title={isEn ? "Delete" : "মুছে ফেলুন"}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-[var(--color-text-muted)]">
                    <p>{isEn ? "No active advertisement in this slot" : "এই স্লটে কোনো সক্রিয় বিজ্ঞাপন নেই"}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setPlacement(slot.id);
                        setShowAddForm(true);
                      }}
                      className="mt-2 text-xs font-bold text-[var(--color-primary)] hover:underline cursor-pointer"
                    >
                      {isEn ? "+ Add Advertisement" : "+ বিজ্ঞাপন যুক্ত করুন"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
