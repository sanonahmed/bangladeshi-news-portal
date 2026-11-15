"use client";

import { useRef, useState } from "react";
import {
  createOrUpdateAd,
  deleteAd,
  toggleAdStatus,
} from "@/actions/advertisements";
import type {
  Advertisement,
  AdDeviceTarget,
  AdPlacement,
  AdType,
} from "@/db/schema/advertisements";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Code2,
  ExternalLink,
  Image as ImageIcon,
  Layers2,
  Monitor,
  MousePointer2,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Smartphone,
  Trash2,
  X,
  LoaderCircle,
} from "lucide-react";
import Image from "next/image";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import styles from "./advertisements.module.css";

const STANDARD_SLOTS: {
  id: AdPlacement;
  nameEn: string;
  nameBn: string;
  width: number;
  height: number;
}[] = [
  {
    id: "homepage_leaderboard",
    nameEn: "Homepage leaderboard",
    nameBn: "হোমপেজ লিডারবোর্ড",
    width: 970,
    height: 90,
  },
  {
    id: "header_banner",
    nameEn: "Header banner",
    nameBn: "হেডার ব্যানার",
    width: 728,
    height: 90,
  },
  {
    id: "sidebar",
    nameEn: "Article sidebar",
    nameBn: "সংবাদ পার্শ্ববার",
    width: 300,
    height: 250,
  },
  {
    id: "between_sections",
    nameEn: "Between sections",
    nameBn: "সেকশন মধ্যবর্তী ব্যানার",
    width: 728,
    height: 90,
  },
  {
    id: "article_inline",
    nameEn: "Article inline",
    nameBn: "সংবাদের অভ্যন্তরস্থ বিজ্ঞাপন",
    width: 336,
    height: 280,
  },
  {
    id: "footer",
    nameEn: "Footer banner",
    nameBn: "ফুটার ব্যানার",
    width: 728,
    height: 90,
  },
  {
    id: "mobile_slot",
    nameEn: "Mobile banner",
    nameBn: "মোবাইল ব্যানার",
    width: 320,
    height: 100,
  },
];

function BannerPreview({
  src,
  alt,
  codeLabel,
}: {
  src: string | null;
  alt: string;
  codeLabel: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  let validSrc = false;
  try {
    validSrc = !!src && ["http:", "https:"].includes(new URL(src).protocol);
  } catch {
    /* Incomplete image URLs are expected while typing. */
  }
  return validSrc && src && failedSrc !== src ? (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      sizes="(max-width: 640px) 100vw, 400px"
      className={styles.bannerImage}
      onError={() => setFailedSrc(src)}
    />
  ) : (
    <div className={styles.previewPlaceholder}>
      {src ? (
        <ImageIcon size={24} strokeWidth={1.4} />
      ) : (
        <Code2 size={24} strokeWidth={1.4} />
      )}
      <span>{codeLabel}</span>
    </div>
  );
}

export function AdminAdsClient({
  initialAds,
}: {
  initialAds: Advertisement[];
}) {
  const { language, formatNumber } = useAdminLanguage();
  const isEn = language === "en";
  const text = (en: string, bn: string) => (isEn ? en : bn);
  const [adsList, setAdsList] = useState(initialAds);
  const [showEditor, setShowEditor] = useState(false);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [view, setView] = useState<"campaigns" | "placements">("campaigns");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [placementFilter, setPlacementFilter] = useState("all");
  const editorRef = useRef<HTMLElement>(null);
  const newButtonRef = useRef<HTMLButtonElement>(null);
  const [name, setName] = useState("");
  const [placement, setPlacement] = useState<AdPlacement>(
    "homepage_leaderboard",
  );
  const [type, setType] = useState<AdType>("direct_image");
  const [imageUrl, setImageUrl] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [adCode, setAdCode] = useState("");
  const [altText, setAltText] = useState("");
  const [deviceTarget, setDeviceTarget] = useState<AdDeviceTarget>("all");
  const [isActive, setIsActive] = useState(true);

  const activeCount = adsList.filter((ad) => ad.isActive).length;
  const occupiedCount = STANDARD_SLOTS.filter((slot) =>
    adsList.some((ad) => ad.placement === slot.id && ad.isActive),
  ).length;
  const totalImpressions = adsList.reduce((sum, ad) => sum + ad.impressions, 0);
  const totalClicks = adsList.reduce((sum, ad) => sum + ad.clicks, 0);
  const ctr = (impressions: number, clicks: number) =>
    formatNumber(
      impressions ? ((clicks / impressions) * 100).toFixed(2) : "0.00",
    );
  const selectedSlot = STANDARD_SLOTS.find((slot) => slot.id === placement)!;
  const slotName = (slot: typeof selectedSlot) =>
    isEn ? slot.nameEn : slot.nameBn;
  const slotSize = (slot: typeof selectedSlot) =>
    `${formatNumber(slot.width)} × ${formatNumber(slot.height)}`;
  const typeName = (adType: AdType) =>
    adType === "adsense"
      ? text("AdSense / HTML", "অ্যাডসেন্স / HTML")
      : adType === "sponsored"
        ? text("Sponsored", "স্পন্সরড")
        : text("Image banner", "ইমেজ ব্যানার");
  const filteredAds = adsList.filter((ad) => {
    const slot = STANDARD_SLOTS.find((item) => item.id === ad.placement)!;
    return (
      `${ad.name} ${slot.nameEn} ${slot.nameBn}`
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase()) &&
      (statusFilter === "all" || ad.isActive === (statusFilter === "active")) &&
      (placementFilter === "all" || ad.placement === placementFilter)
    );
  });

  function clearFeedback() {
    setError("");
    setSuccess("");
  }
  function resetForm() {
    setEditingAdId(null);
    setName("");
    setPlacement("homepage_leaderboard");
    setType("direct_image");
    setImageUrl("");
    setDestinationUrl("");
    setAdCode("");
    setAltText("");
    setDeviceTarget("all");
    setIsActive(true);
  }
  function openEditor(ad?: Advertisement, slot?: AdPlacement) {
    resetForm();
    clearFeedback();
    if (ad) {
      setEditingAdId(ad.id);
      setName(ad.name);
      setPlacement(ad.placement);
      setType(ad.type);
      setImageUrl(ad.imageUrl || "");
      setDestinationUrl(ad.destinationUrl || "");
      setAdCode(ad.adCode || "");
      setAltText(ad.altText || "");
      setDeviceTarget(ad.deviceTarget);
      setIsActive(ad.isActive);
    } else if (slot) setPlacement(slot);
    setShowEditor(true);
    requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
      editorRef.current
        ?.querySelector<HTMLInputElement>("input")
        ?.focus({ preventScroll: true });
    });
  }
  function closeEditor() {
    setShowEditor(false);
    resetForm();
    newButtonRef.current?.focus({ preventScroll: true });
  }
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    clearFeedback();
    setIsSubmitting(true);
    try {
      const result = await createOrUpdateAd({
        id: editingAdId || undefined,
        name: name.trim(),
        placement,
        type,
        imageUrl: type !== "adsense" ? imageUrl.trim() || undefined : undefined,
        destinationUrl: destinationUrl.trim() || undefined,
        adCode: type === "adsense" ? adCode.trim() || undefined : undefined,
        altText: altText.trim() || undefined,
        deviceTarget,
        isActive,
      });
      const savedAd = result.ad;
      if (!result.success || !savedAd) {
        setError(
          result.error ||
            text(
              "Unable to save advertisement.",
              "বিজ্ঞাপন সংরক্ষণ করা যায়নি।",
            ),
        );
        return;
      }
      setAdsList((current) => [
        savedAd,
        ...current.filter((ad) => ad.id !== savedAd.id),
      ]);
      setSuccess(
        text(
          "Advertisement saved successfully.",
          "বিজ্ঞাপন সফলভাবে সংরক্ষণ হয়েছে।",
        ),
      );
      closeEditor();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : text(
              "Unable to save advertisement.",
              "বিজ্ঞাপন সংরক্ষণ করা যায়নি।",
            ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  async function handleToggle(ad: Advertisement) {
    clearFeedback();
    setActionLoadingId(ad.id);
    try {
      const result = await toggleAdStatus(ad.id, !ad.isActive);
      if (!result.success) {
        setError(
          result.error ||
            text("Unable to update status.", "স্ট্যাটাস পরিবর্তন করা যায়নি।"),
        );
        return;
      }
      setAdsList((current) =>
        current.map((item) =>
          item.id === ad.id ? { ...item, isActive: !ad.isActive } : item,
        ),
      );
      setSuccess(
        text(
          "Advertisement status updated.",
          "বিজ্ঞাপনের স্ট্যাটাস পরিবর্তন হয়েছে।",
        ),
      );
    } catch {
      setError(
        text(
          "Unable to update status. Please try again.",
          "স্ট্যাটাস পরিবর্তন করা যায়নি। আবার চেষ্টা করুন।",
        ),
      );
    } finally {
      setActionLoadingId(null);
    }
  }
  async function handleDelete(ad: Advertisement) {
    if (
      !window.confirm(
        text(
          `Delete "${ad.name}"? This cannot be undone.`,
          `"${ad.name}" মুছে ফেলবেন? এটি আর ফিরিয়ে আনা যাবে না।`,
        ),
      )
    )
      return;
    clearFeedback();
    setActionLoadingId(ad.id);
    try {
      const result = await deleteAd(ad.id);
      if (!result.success) {
        setError(
          result.error ||
            text(
              "Unable to delete advertisement.",
              "বিজ্ঞাপন মুছে ফেলা যায়নি।",
            ),
        );
        return;
      }
      setAdsList((current) => current.filter((item) => item.id !== ad.id));
      if (editingAdId === ad.id) closeEditor();
      setSuccess(text("Advertisement deleted.", "বিজ্ঞাপন মুছে ফেলা হয়েছে।"));
    } catch {
      setError(
        text(
          "Unable to delete advertisement. Please try again.",
          "বিজ্ঞাপন মুছে ফেলা যায়নি। আবার চেষ্টা করুন।",
        ),
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className={styles.workspace}>
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>
            {text("Commercial desk", "বাণিজ্যিক ডেস্ক")}
            <span>/</span>
            {text("Advertising", "বিজ্ঞাপন")}
          </div>
          <h1>{text("Ad management", "বিজ্ঞাপন ব্যবস্থাপনা")}</h1>
          <p>
            {text(
              "Your campaigns, placements and performance. One workspace.",
              "ক্যাম্পেইন, বিজ্ঞাপন স্লট ও পারফরম্যান্স পরিচালনা করুন এক জায়গায়।",
            )}
          </p>
        </div>
        <button
          ref={newButtonRef}
          type="button"
          className={styles.primaryButton}
          onClick={() => openEditor()}
          disabled={isSubmitting}
        >
          <Plus size={17} />
          {text("New advertisement", "নতুন বিজ্ঞাপন")}
        </button>
      </header>
      <section
        className={styles.metrics}
        aria-label={text("Advertising overview", "বিজ্ঞাপনের সারসংক্ষেপ")}
      >
        {[
          {
            label: text("Active advertisements", "সক্রিয় বিজ্ঞাপন"),
            value: formatNumber(activeCount),
            note: `${formatNumber(adsList.length)} ${text("total campaigns", "মোট ক্যাম্পেইন")}`,
            icon: <span className={styles.liveDot} />,
          },
          {
            label: text("Total impressions", "মোট ইম্প্রেশন"),
            value: formatNumber(totalImpressions),
            note: text("Across all advertisements", "সকল বিজ্ঞাপন মিলিয়ে"),
            icon: <Layers2 size={16} />,
          },
          {
            label: text("Total clicks", "মোট ক্লিক"),
            value: formatNumber(totalClicks),
            note: text("Tracked link interactions", "ট্র্যাক করা লিংক ক্লিক"),
            icon: <MousePointer2 size={16} />,
          },
          {
            label: text("Click-through rate", "ক্লিক-থ্রু রেট"),
            value: `${ctr(totalImpressions, totalClicks)}%`,
            note: text("Clicks ÷ impressions", "ক্লিক ÷ ইম্প্রেশন"),
            icon: <ArrowUpRight size={17} />,
          },
        ].map((metric) => (
          <div className={styles.metric} key={metric.label}>
            <div className={styles.metricLabel}>
              {metric.label}
              {metric.icon}
            </div>
            <div className={styles.metricValue}>{metric.value}</div>
            <p>{metric.note}</p>
          </div>
        ))}
      </section>
      {(error || success) && (
        <div
          role={error ? "alert" : "status"}
          className={`${styles.notice} ${error ? styles.error : styles.success}`}
        >
          {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{error || success}</span>
          <button
            type="button"
            onClick={clearFeedback}
            aria-label={text("Dismiss notification", "বার্তা বন্ধ করুন")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {showEditor && (
        <section
          ref={editorRef}
          className={styles.editor}
          aria-labelledby="ad-editor-title"
        >
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.eyebrow}>
                {text("Campaign studio", "ক্যাম্পেইন স্টুডিও")}
              </div>
              <h2 id="ad-editor-title">
                {editingAdId
                  ? text("Edit advertisement", "বিজ্ঞাপন সম্পাদনা")
                  : text("Create an advertisement", "নতুন বিজ্ঞাপন তৈরি করুন")}
              </h2>
            </div>
            <button
              type="button"
              className={styles.iconButton}
              onClick={closeEditor}
              disabled={isSubmitting}
              aria-label={text("Close editor", "এডিটর বন্ধ করুন")}
            >
              <X size={19} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <fieldset disabled={isSubmitting} className={styles.editorGrid}>
              <div className={styles.formFields}>
                <div className={styles.formSection}>
                  <h3>
                    <span>01</span>
                    {text("Campaign details", "ক্যাম্পেইনের তথ্য")}
                  </h3>
                  <label className={styles.field} htmlFor="ad-name">
                    {text("Advertisement name", "বিজ্ঞাপনের নাম")}
                    <span className={styles.required}>*</span>
                    <input
                      id="ad-name"
                      required
                      minLength={2}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={text(
                        "e.g. Bkash cashback campaign",
                        "যেমন: বিকাশ ক্যাশব্যাক ক্যাম্পেইন",
                      )}
                    />
                  </label>
                  <div className={styles.fieldGrid}>
                    <label className={styles.field} htmlFor="ad-placement">
                      {text("Placement", "বিজ্ঞাপনের স্লট")}
                      <select
                        id="ad-placement"
                        value={placement}
                        onChange={(e) =>
                          setPlacement(e.target.value as AdPlacement)
                        }
                      >
                        {STANDARD_SLOTS.map((slot) => (
                          <option key={slot.id} value={slot.id}>
                            {slotName(slot)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={styles.field} htmlFor="ad-type">
                      {text("Format", "বিজ্ঞাপনের ধরন")}
                      <select
                        id="ad-type"
                        value={type}
                        onChange={(e) => setType(e.target.value as AdType)}
                      >
                        <option value="direct_image">
                          {text("Image banner", "ইমেজ ব্যানার")}
                        </option>
                        <option value="sponsored">
                          {text("Sponsored banner", "স্পন্সরড ব্যানার")}
                        </option>
                        <option value="adsense">
                          {text(
                            "AdSense / custom HTML",
                            "অ্যাডসেন্স / কাস্টম HTML",
                          )}
                        </option>
                      </select>
                    </label>
                  </div>
                </div>
                <div className={styles.formSection}>
                  <h3>
                    <span>02</span>
                    {text("Creative & destination", "ব্যানার ও গন্তব্য")}
                  </h3>
                  {type === "adsense" ? (
                    <label className={styles.field} htmlFor="ad-code">
                      {text("AdSense / HTML code", "অ্যাডসেন্স / HTML কোড")}
                      <span className={styles.required}>*</span>
                      <textarea
                        id="ad-code"
                        required
                        rows={6}
                        value={adCode}
                        onChange={(e) => setAdCode(e.target.value)}
                        placeholder={'<ins class="adsbygoogle" ...></ins>'}
                        spellCheck={false}
                      />
                      <small>
                        {text(
                          "Code is saved securely and is not executed in this preview.",
                          "কোড নিরাপদে সংরক্ষিত হয় এবং এই প্রিভিউতে চালানো হয় না।",
                        )}
                      </small>
                    </label>
                  ) : (
                    <>
                      <label className={styles.field} htmlFor="ad-image">
                        {text("Banner image URL", "ব্যানার ইমেজ লিংক")}
                        <span className={styles.required}>*</span>
                        <input
                          id="ad-image"
                          type="url"
                          required
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://example.com/banner.jpg"
                        />
                        <small>
                          {text("Recommended dimensions:", "প্রস্তাবিত মাপ:")}{" "}
                          {slotSize(selectedSlot)} px
                        </small>
                      </label>
                      <label className={styles.field} htmlFor="ad-alt">
                        {text("Image description", "ছবির বিবরণ")}
                        <span className={styles.optional}>
                          {text("Optional", "ঐচ্ছিক")}
                        </span>
                        <input
                          id="ad-alt"
                          value={altText}
                          onChange={(e) => setAltText(e.target.value)}
                          placeholder={text(
                            "Describe the banner for screen readers",
                            "স্ক্রিন রিডারের জন্য ব্যানারের বিবরণ",
                          )}
                        />
                      </label>
                    </>
                  )}
                  <label className={styles.field} htmlFor="ad-destination">
                    {text("Destination URL", "গন্তব্য লিংক")}
                    <span className={styles.optional}>
                      {text("Optional", "ঐচ্ছিক")}
                    </span>
                    <input
                      id="ad-destination"
                      type="url"
                      value={destinationUrl}
                      onChange={(e) => setDestinationUrl(e.target.value)}
                      placeholder="https://example.com/campaign"
                    />
                  </label>
                </div>
                <div className={styles.formSection}>
                  <h3>
                    <span>03</span>
                    {text("Delivery settings", "প্রদর্শন সেটিংস")}
                  </h3>
                  <label className={styles.field} htmlFor="ad-device">
                    {text("Target devices", "টার্গেট ডিভাইস")}
                    <select
                      id="ad-device"
                      value={deviceTarget}
                      onChange={(e) =>
                        setDeviceTarget(e.target.value as AdDeviceTarget)
                      }
                    >
                      <option value="all">
                        {text("All devices", "সকল ডিভাইস")}
                      </option>
                      <option value="desktop">
                        {text("Desktop only", "শুধু ডেস্কটপ")}
                      </option>
                      <option value="mobile">
                        {text("Mobile only", "শুধু মোবাইল")}
                      </option>
                    </select>
                  </label>
                  <label className={styles.activeSetting}>
                    <span>
                      <strong>
                        {text("Enable advertisement", "বিজ্ঞাপন সক্রিয় করুন")}
                      </strong>
                      <small>
                        {text(
                          "Allow this campaign to serve in its placement.",
                          "নির্ধারিত স্লটে এই ক্যাম্পেইন প্রদর্শনের অনুমতি দিন।",
                        )}
                      </small>
                    </span>
                    <input
                      type="checkbox"
                      role="switch"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                  </label>
                </div>
              </div>
              <aside className={styles.previewPanel}>
                <div className={styles.previewHeading}>
                  <span>{text("Creative preview", "ব্যানার প্রিভিউ")}</span>
                  <span className={styles.previewTag}>
                    {text("Preview", "প্রিভিউ")}
                  </span>
                </div>
                <div className={styles.previewCanvas}>
                  <div className={styles.browserFrame}>
                    <div className={styles.browserBar}>
                      <i />
                      <i />
                      <i />
                      <span>yesnews24.com</span>
                    </div>
                    <div className={styles.mockPage}>
                      <div className={styles.mockMasthead} />
                      <div className={styles.mockRule} />
                      <div
                        className={styles.creativeFrame}
                        style={{
                          aspectRatio: `${selectedSlot.width} / ${selectedSlot.height}`,
                        }}
                      >
                        {type === "adsense" ? (
                          <div className={styles.previewPlaceholder}>
                            <Code2 size={24} />
                            <span>
                              {text(
                                "AdSense / HTML creative",
                                "অ্যাডসেন্স / HTML বিজ্ঞাপন",
                              )}
                            </span>
                          </div>
                        ) : imageUrl ? (
                          <BannerPreview
                            src={imageUrl}
                            alt={
                              altText ||
                              name ||
                              text(
                                "Advertisement preview",
                                "বিজ্ঞাপনের প্রিভিউ",
                              )
                            }
                            codeLabel={text(
                              "Image unavailable",
                              "ছবি পাওয়া যায়নি",
                            )}
                          />
                        ) : (
                          <div className={styles.previewPlaceholder}>
                            <ImageIcon size={23} strokeWidth={1.4} />
                            <span>
                              {text(
                                "Your creative appears here",
                                "আপনার ব্যানার এখানে দেখা যাবে",
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className={styles.mockColumns}>
                        <div />
                        <div />
                        <div />
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.previewDetails}>
                  <strong>
                    {name ||
                      text("Untitled advertisement", "নামবিহীন বিজ্ঞাপন")}
                  </strong>
                  <dl>
                    <div>
                      <dt>{text("Placement", "স্লট")}</dt>
                      <dd>{slotName(selectedSlot)}</dd>
                    </div>
                    <div>
                      <dt>{text("Dimensions", "মাপ")}</dt>
                      <dd>{slotSize(selectedSlot)} px</dd>
                    </div>
                    <div>
                      <dt>{text("Format", "ধরন")}</dt>
                      <dd>{typeName(type)}</dd>
                    </div>
                  </dl>
                  <p>
                    <AlertCircle size={14} />
                    {text(
                      "Scaled preview. Actual display depends on the page and device.",
                      "এটি ছোট আকারের প্রিভিউ। পাতা ও ডিভাইস অনুযায়ী প্রদর্শন ভিন্ন হতে পারে।",
                    )}
                  </p>
                </div>
              </aside>
            </fieldset>
            <div className={styles.formFooter}>
              <span>
                {text(
                  "Fields marked * are required.",
                  "* চিহ্নিত ঘর পূরণ করা আবশ্যক।",
                )}
              </span>
              <div>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={closeEditor}
                  disabled={isSubmitting}
                >
                  {text("Cancel", "বাতিল")}
                </button>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <LoaderCircle size={16} className={styles.spinner} />
                  ) : (
                    <Check size={16} />
                  )}
                  {isSubmitting
                    ? text("Saving...", "সংরক্ষণ হচ্ছে...")
                    : editingAdId
                      ? text("Save changes", "পরিবর্তন সংরক্ষণ")
                      : text("Create advertisement", "বিজ্ঞাপন তৈরি করুন")}
                </button>
              </div>
            </div>
          </form>
        </section>
      )}
      <section
        className={styles.inventory}
        aria-label={text("Advertisement inventory", "বিজ্ঞাপনের তালিকা")}
      >
        <div className={styles.inventoryTop}>
          <div
            className={styles.tabs}
            aria-label={text("Inventory view", "তালিকার ধরন")}
          >
            <button
              type="button"
              aria-pressed={view === "campaigns"}
              className={view === "campaigns" ? styles.selectedTab : ""}
              onClick={() => setView("campaigns")}
            >
              {text("Campaigns", "ক্যাম্পেইন")}
              <span>{formatNumber(adsList.length)}</span>
            </button>
            <button
              type="button"
              aria-pressed={view === "placements"}
              className={view === "placements" ? styles.selectedTab : ""}
              onClick={() => setView("placements")}
            >
              {text("Placements", "বিজ্ঞাপনের স্লট")}
              <span>{formatNumber(STANDARD_SLOTS.length)}</span>
            </button>
          </div>
          <span className={styles.inventoryNote}>
            {text("Lifetime performance", "সর্বকালের পারফরম্যান্স")}
          </span>
        </div>
        {view === "campaigns" ? (
          <div>
            <div className={styles.toolbar}>
              <label className={styles.search}>
                <Search size={17} />
                <span className={styles.srOnly}>
                  {text("Search campaigns", "ক্যাম্পেইন খুঁজুন")}
                </span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={text(
                    "Search campaigns...",
                    "ক্যাম্পেইন খুঁজুন...",
                  )}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label={text("Clear search", "অনুসন্ধান মুছুন")}
                  >
                    <X size={14} />
                  </button>
                )}
              </label>
              <div className={styles.filters}>
                <select
                  aria-label={text(
                    "Filter by status",
                    "স্ট্যাটাস অনুযায়ী দেখুন",
                  )}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">
                    {text("All statuses", "সকল স্ট্যাটাস")}
                  </option>
                  <option value="active">{text("Active", "সক্রিয়")}</option>
                  <option value="paused">{text("Paused", "বিরত")}</option>
                </select>
                <select
                  aria-label={text(
                    "Filter by placement",
                    "স্লট অনুযায়ী দেখুন",
                  )}
                  value={placementFilter}
                  onChange={(e) => setPlacementFilter(e.target.value)}
                >
                  <option value="all">
                    {text("All placements", "সকল স্লট")}
                  </option>
                  {STANDARD_SLOTS.map((slot) => (
                    <option value={slot.id} key={slot.id}>
                      {slotName(slot)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {filteredAds.length ? (
              <>
                <div
                  className={styles.tableScroll}
                  tabIndex={0}
                  role="region"
                  aria-label={text(
                    "Campaign performance table",
                    "ক্যাম্পেইন পারফরম্যান্স তালিকা",
                  )}
                >
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th scope="col">{text("Advertisement", "বিজ্ঞাপন")}</th>
                        <th scope="col">
                          {text("Placement / device", "স্লট / ডিভাইস")}
                        </th>
                        <th scope="col">{text("Status", "স্ট্যাটাস")}</th>
                        <th scope="col" className={styles.numeric}>
                          {text("Impressions", "ইম্প্রেশন")}
                        </th>
                        <th scope="col" className={styles.numeric}>
                          {text("Clicks", "ক্লিক")}
                        </th>
                        <th scope="col" className={styles.numeric}>
                          {text("CTR", "সিটিআর")}
                        </th>
                        <th scope="col">
                          <span className={styles.srOnly}>
                            {text("Actions", "পদক্ষেপ")}
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAds.map((ad) => {
                        const slot = STANDARD_SLOTS.find(
                          (item) => item.id === ad.placement,
                        )!;
                        const DeviceIcon =
                          ad.deviceTarget === "mobile" ? Smartphone : Monitor;
                        const busy = actionLoadingId !== null || isSubmitting;
                        return (
                          <tr key={ad.id}>
                            <td>
                              <div className={styles.campaignCell}>
                                <div className={styles.thumbnail}>
                                  <BannerPreview
                                    src={
                                      ad.type === "adsense" ? null : ad.imageUrl
                                    }
                                    alt={ad.altText || ad.name}
                                    codeLabel=""
                                  />
                                </div>
                                <div className={styles.campaignIdentity}>
                                  <button
                                    type="button"
                                    className={styles.campaignName}
                                    onClick={() => openEditor(ad)}
                                    disabled={busy}
                                  >
                                    {ad.name}
                                  </button>
                                  <span>
                                    {typeName(ad.type)}
                                    {ad.destinationUrl && (
                                      <a
                                        href={ad.destinationUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={text(
                                          "Open destination",
                                          "গন্তব্য লিংক খুলুন",
                                        )}
                                        aria-label={`${text("Open destination for", "গন্তব্য লিংক খুলুন:")} ${ad.name}`}
                                      >
                                        <ExternalLink size={12} />
                                      </a>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className={styles.placementCell}>
                                <strong>{slotName(slot)}</strong>
                                <span>
                                  <DeviceIcon size={12} />
                                  {ad.deviceTarget === "mobile"
                                    ? text("Mobile", "মোবাইল")
                                    : ad.deviceTarget === "desktop"
                                      ? text("Desktop", "ডেস্কটপ")
                                      : text("All devices", "সকল ডিভাইস")}
                                  <span className={styles.dotSeparator}>·</span>
                                  {slotSize(slot)}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`${styles.status} ${ad.isActive ? styles.active : styles.paused}`}
                              >
                                <i />
                                {ad.isActive
                                  ? text("Active", "সক্রিয়")
                                  : text("Paused", "বিরত")}
                              </span>
                            </td>
                            <td className={styles.numeric}>
                              {formatNumber(ad.impressions)}
                            </td>
                            <td className={styles.numeric}>
                              {formatNumber(ad.clicks)}
                            </td>
                            <td className={styles.numeric}>
                              {ctr(ad.impressions, ad.clicks)}%
                            </td>
                            <td>
                              <div className={styles.rowActions}>
                                <button
                                  type="button"
                                  className={styles.iconButton}
                                  disabled={busy}
                                  onClick={() => handleToggle(ad)}
                                  title={
                                    ad.isActive
                                      ? text("Pause", "বিরতি দিন")
                                      : text("Activate", "সক্রিয় করুন")
                                  }
                                  aria-label={`${ad.isActive ? text("Pause", "বিরতি দিন:") : text("Activate", "সক্রিয় করুন:")} ${ad.name}`}
                                >
                                  {actionLoadingId === ad.id ? (
                                    <LoaderCircle
                                      size={15}
                                      className={styles.spinner}
                                    />
                                  ) : ad.isActive ? (
                                    <Pause size={15} />
                                  ) : (
                                    <Play size={15} />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  className={styles.iconButton}
                                  disabled={busy}
                                  onClick={() => openEditor(ad)}
                                  title={text("Edit", "সম্পাদনা")}
                                  aria-label={`${text("Edit", "সম্পাদনা:")} ${ad.name}`}
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  type="button"
                                  className={`${styles.iconButton} ${styles.deleteButton}`}
                                  disabled={busy}
                                  onClick={() => handleDelete(ad)}
                                  title={text("Delete", "মুছে ফেলুন")}
                                  aria-label={`${text("Delete", "মুছে ফেলুন:")} ${ad.name}`}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className={styles.tableFooter}>
                  <span>
                    {text("Showing", "দেখানো হচ্ছে")}{" "}
                    <strong>{formatNumber(filteredAds.length)}</strong>{" "}
                    {text("of", "/")} {formatNumber(adsList.length)}{" "}
                    {text("advertisements", "বিজ্ঞাপন")}
                  </span>
                  <span>
                    <span className={styles.liveDot} />
                    {formatNumber(activeCount)} {text("enabled", "সক্রিয়")}
                  </span>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  {adsList.length ? (
                    <Search size={25} strokeWidth={1.4} />
                  ) : (
                    <ImageIcon size={27} strokeWidth={1.4} />
                  )}
                </div>
                <h3>
                  {adsList.length
                    ? text("No matching campaigns", "কোনো ক্যাম্পেইন মেলেনি")
                    : text(
                        "Make room for your next campaign",
                        "আপনার প্রথম ক্যাম্পেইন শুরু করুন",
                      )}
                </h3>
                <p>
                  {adsList.length
                    ? text(
                        "Try a different search or adjust your filters.",
                        "ভিন্ন নামে খুঁজুন অথবা ফিল্টার পরিবর্তন করুন।",
                      )
                    : text(
                        "Create an advertisement, choose its placement and start tracking performance.",
                        "বিজ্ঞাপন তৈরি করুন, স্লট বেছে নিন এবং পারফরম্যান্স দেখুন।",
                      )}
                </p>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    if (adsList.length) {
                      setQuery("");
                      setStatusFilter("all");
                      setPlacementFilter("all");
                    } else openEditor();
                  }}
                >
                  {adsList.length ? <X size={15} /> : <Plus size={15} />}
                  {adsList.length
                    ? text("Clear filters", "ফিল্টার মুছুন")
                    : text(
                        "Create first advertisement",
                        "প্রথম বিজ্ঞাপন তৈরি করুন",
                      )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className={styles.placementSummary}>
              <div>
                <h2>
                  {text(
                    "Your advertising inventory",
                    "আপনার বিজ্ঞাপনের স্লটসমূহ",
                  )}
                </h2>
                <p>
                  {text(
                    "Seven standard placements across the publication.",
                    "পত্রিকার বিভিন্ন অংশে সাতটি নির্ধারিত বিজ্ঞাপনের স্লট।",
                  )}
                </p>
              </div>
              <span>
                <strong>{formatNumber(occupiedCount)}</strong> /{" "}
                {formatNumber(STANDARD_SLOTS.length)}{" "}
                {text("with enabled ads", "স্লটে সক্রিয় বিজ্ঞাপন")}
              </span>
            </div>
            <div className={styles.slotGrid}>
              {STANDARD_SLOTS.map((slot, index) => {
                const assigned = adsList.filter(
                  (ad) => ad.placement === slot.id,
                );
                const enabled = assigned.filter((ad) => ad.isActive).length;
                return (
                  <article key={slot.id} className={styles.slotCard}>
                    <div className={styles.slotCardTop}>
                      <span className={styles.slotIndex}>
                        {formatNumber(String(index + 1).padStart(2, "0"))}
                      </span>
                      <span
                        className={`${styles.status} ${enabled ? styles.active : styles.paused}`}
                      >
                        <i />
                        {enabled
                          ? text("Enabled", "সক্রিয়")
                          : text("Available", "খালি")}
                      </span>
                    </div>
                    <div className={styles.slotDiagram} aria-hidden="true">
                      <div
                        className={styles.pageDiagram}
                        data-placement={slot.id}
                      >
                        <div className={styles.diagramHeader} />
                        <div className={styles.diagramBanner} />
                        <div className={styles.diagramBody}>
                          <div />
                          <div />
                        </div>
                        <div className={styles.diagramFooter} />
                      </div>
                    </div>
                    <h3>{slotName(slot)}</h3>
                    <p className={styles.slotDimensions}>
                      {slotSize(slot)} <span>px</span>
                    </p>
                    <div className={styles.slotCardFooter}>
                      <span>
                        {formatNumber(assigned.length)}{" "}
                        {text("campaigns", "ক্যাম্পেইন")}
                        <small>
                          {formatNumber(enabled)} {text("enabled", "সক্রিয়")}
                        </small>
                      </span>
                      <button
                        type="button"
                        className={styles.iconButton}
                        disabled={isSubmitting}
                        onClick={() => openEditor(undefined, slot.id)}
                        aria-label={`${text("Add advertisement to", "বিজ্ঞাপন যুক্ত করুন:")} ${slotName(slot)}`}
                      >
                        <Plus size={19} />
                      </button>
                    </div>
                    {assigned.length > 0 && (
                      <button
                        type="button"
                        className={styles.slotViewButton}
                        onClick={() => {
                          setPlacementFilter(slot.id);
                          setStatusFilter("all");
                          setQuery("");
                          setView("campaigns");
                        }}
                      >
                        {text("View campaigns", "ক্যাম্পেইন দেখুন")}
                        <ArrowDownRight size={14} />
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>
      <footer className={styles.pageFooter}>
        <span>{text("Display advertising", "ডিসপ্লে বিজ্ঞাপন")}</span>
        <p>
          {text(
            "Metrics reflect recorded impressions and clicks, not revenue.",
            "পরিসংখ্যানে রেকর্ড করা ইম্প্রেশন ও ক্লিক দেখানো হয়, আয় নয়।",
          )}
        </p>
      </footer>
    </div>
  );
}
