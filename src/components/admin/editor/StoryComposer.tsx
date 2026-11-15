"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  CalendarDays,
  Check,
  Circle,
  Clock3,
  CloudCheck,
  Eye,
  FileText,
  Globe2,
  ImageIcon,
  Layers3,
  Loader2,
  MapPin,
  PenLine,
  Pin,
  RotateCcw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import type { createArticle } from "@/actions/articles";
import type { CategoryItem } from "@/actions/categories";
import type { DivisionWithDistricts } from "@/actions/geography";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { TiptapEditor } from "./TiptapEditor";
import { AiEditorAssistantModal } from "./AiEditorAssistantModal";
import { HeadlineAbTestingPanel } from "./HeadlineAbTestingPanel";
import { SeoQualityScorecard } from "./SeoQualityScorecard";
import {
  ComposerDisclosure,
  ComposerField,
  ComposerSection,
} from "./StoryComposerPrimitives";
import {
  readStoryDraft,
  resolvePublishingStatus,
  STORY_DRAFT_KEY,
  storyChecklist,
  storyDraftSchema,
  storySlug,
  storyWordCount,
  type StoryDraft,
} from "./story-composer";
import styles from "./StoryComposer.module.css";

interface StoryComposerProps {
  canPublish: boolean;
  loadCategories: () => Promise<CategoryItem[]>;
  loadDivisions: () => Promise<DivisionWithDistricts[]>;
  onSave: typeof createArticle;
  storageKey?: string;
}

export function StoryComposer({
  canPublish,
  loadCategories,
  loadDivisions,
  onSave,
  storageKey = STORY_DRAFT_KEY,
}: StoryComposerProps) {
  const router = useRouter();
  const { isEn, formatNumber } = useAdminLanguage();
  const [draft, setDraft] = useState<StoryDraft>(() =>
    storyDraftSchema.parse({}),
  );
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [divisions, setDivisions] = useState<DivisionWithDistricts[]>([]);
  const [metadataError, setMetadataError] = useState(false);
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [recovery, setRecovery] =
    useState<ReturnType<typeof readStoryDraft>>(null);
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const submitLock = useRef(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slugEdited = useRef(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const imageAltRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const snapshot = JSON.stringify(draft);
  const wordCount = storyWordCount(draft.content);
  const hasContent = !!draft.title.trim() || wordCount > 0;
  const isDirty = hasContent && snapshot !== savedSnapshot;
  const effectiveStatus = resolvePublishingStatus(draft.status, canPublish);
  const checklist = storyChecklist(draft);
  const completed = checklist.filter((item) => item.complete).length;
  const category = categories.find((item) => item.id === draft.categoryId);
  const districts =
    divisions.find((item) => item.id === draft.selectedDivisionId)?.districts ??
    [];
  const optional = isEn ? "Optional" : "ঐচ্ছিক";

  function update<K extends keyof StoryDraft>(key: K, value: StoryDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => {
    let active = true;
    loadCategories()
      .then((items) => {
        if (!active) return;
        setCategories(items);
        setDraft((current) => ({
          ...current,
          categoryId: current.categoryId || items[0]?.id || "",
        }));
      })
      .catch(() => {
        if (active) setMetadataError(true);
      });
    loadDivisions()
      .then((items) => {
        if (active) setDivisions(items);
      })
      .catch(() => {
        if (active) setMetadataError(true);
      });
    fetch("/api/features")
      .then((response) => response.json())
      .then((data) => {
        if (active) setFeatures(data);
      })
      .catch(() => {});
    // Read only once; switching the UI language must not reopen draft recovery.
    Promise.resolve().then(() => {
      if (!active) return;
      try {
        const stored = localStorage.getItem(storageKey);
        setRecovery(stored ? readStoryDraft(stored) : null);
      } catch {
        setStorageError(true);
      }
      setStorageReady(true);
    });
    return () => {
      active = false;
    };
  }, [loadCategories, loadDivisions, storageKey]);

  useEffect(() => {
    if (!storageReady || recovery || !isDirty || loading || success) return;
    const timer = setTimeout(() => {
      try {
        const savedAt = Date.now();
        localStorage.setItem(
          storageKey,
          JSON.stringify({ ...JSON.parse(snapshot), savedAt }),
        );
        setSavedSnapshot(snapshot);
        setLastSaved(savedAt);
        setStorageError(false);
      } catch {
        setStorageError(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [snapshot, isDirty, storageReady, recovery, loading, success, storageKey]);

  useEffect(() => {
    if (!isDirty || success) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty, success]);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  useEffect(
    () => () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    },
    [],
  );

  function restoreDraft() {
    if (!recovery) return;
    setDraft(recovery.draft);
    setSavedSnapshot(JSON.stringify(recovery.draft));
    setLastSaved(recovery.savedAt);
    slugEdited.current = !!recovery.draft.slug;
    setRecovery(null);
  }

  function discardRecovery() {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      setStorageError(true);
    }
    setRecovery(null);
  }

  function changeTitle(value: string, english = false) {
    setDraft((current) => ({
      ...current,
      [english ? "titleEn" : "title"]: value,
      slug: slugEdited.current
        ? current.slug
        : storySlug(english ? value : current.titleEn || value),
    }));
  }

  async function submitStory(saveAsDraft = false) {
    if (submitLock.current || success) return;
    setError("");
    if (!draft.title.trim()) {
      setError(
        isEn
          ? "Add a headline before saving your story."
          : "সংরক্ষণের আগে সংবাদের শিরোনাম লিখুন।",
      );
      titleRef.current?.focus();
      return;
    }
    if (wordCount === 0) {
      setError(
        isEn
          ? "Write the story body before saving."
          : "সংরক্ষণের আগে সংবাদের বিস্তারিত লিখুন।",
      );
      return;
    }
    const status = saveAsDraft ? "draft" : effectiveStatus;
    let scheduledAt: Date | undefined;
    if (status === "scheduled") {
      scheduledAt = new Date(draft.scheduledAt);
      if (
        !draft.scheduledAt ||
        !Number.isFinite(scheduledAt.getTime()) ||
        scheduledAt.getTime() <= Date.now()
      ) {
        setError(
          isEn
            ? "Choose a future date and time for publication."
            : "প্রকাশের জন্য ভবিষ্যতের একটি তারিখ ও সময় নির্বাচন করুন।",
        );
        return;
      }
    }
    submitLock.current = true;
    setLoading(true);
    try {
      const result = await onSave({
        title: draft.title.trim(),
        titleEn: draft.titleEn.trim() || undefined,
        slug: draft.slug.trim() || `barta-${Date.now()}`,
        excerpt: draft.excerpt.trim() || undefined,
        content: draft.content,
        categoryId: draft.categoryId || undefined,
        status: status === "scheduled" ? "approved" : status,
        scheduledAt,
        featuredImageUrl: draft.featuredImageUrl.trim() || undefined,
        featuredImageAlt: draft.featuredImageAlt.trim() || undefined,
        newsLocation: draft.newsLocation.trim() || undefined,
        divisionId: draft.selectedDivisionId || undefined,
        districtId: draft.selectedDistrictId || undefined,
        isBreaking: draft.isBreaking,
        isFeatured: draft.isFeatured,
        seoTitle: draft.seoTitle.trim() || draft.title.trim().slice(0, 100),
        seoDescription:
          draft.seoDescription.trim() || draft.excerpt.trim().slice(0, 250),
        language: "bn",
        focusKeyword: draft.focusKeyword.trim() || undefined,
        headlineB:
          draft.isAbTestingEnabled && draft.headlineB.trim()
            ? draft.headlineB.trim()
            : undefined,
        abTestStatus:
          draft.isAbTestingEnabled && draft.headlineB.trim()
            ? "active"
            : "none",
        abTestDurationMinutes: draft.abTestDurationMinutes,
      });
      if (!result.success) {
        setError(
          result.error ||
            (isEn
              ? "The story could not be saved. Please try again."
              : "সংবাদ সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।"),
        );
        return;
      }
      try {
        localStorage.removeItem(storageKey);
      } catch {
        /* The server save still succeeded. */
      }
      const savedStatus = result.status || status;
      setSuccess(
        savedStatus === "pending_review"
          ? isEn
            ? "Story submitted for editorial review."
            : "সংবাদটি সম্পাদকীয় পর্যালোচনার জন্য জমা হয়েছে।"
          : result.isScheduled
            ? isEn
              ? "Story scheduled successfully."
              : "সংবাদটি সফলভাবে শিডিউল করা হয়েছে।"
            : savedStatus === "draft"
              ? isEn
                ? "Draft saved to the newsroom."
                : "খসড়া নিউজরুমে সংরক্ষিত হয়েছে।"
              : isEn
                ? "Story published successfully."
                : "সংবাদ সফলভাবে প্রকাশিত হয়েছে।",
      );
      redirectTimer.current = setTimeout(() => {
        router.push("/admin/articles");
        router.refresh();
      }, 1400);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : isEn
            ? "Unable to save. Please try again."
            : "সংরক্ষণ সম্ভব হয়নি। আবার চেষ্টা করুন।",
      );
    } finally {
      setLoading(false);
      submitLock.current = false;
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitStory();
  }

  const publishLabel =
    effectiveStatus === "scheduled"
      ? isEn
        ? "Schedule story"
        : "শিডিউল করুন"
      : effectiveStatus === "draft"
        ? isEn
          ? "Save story draft"
          : "খসড়া সংরক্ষণ"
        : effectiveStatus === "pending_review"
          ? isEn
            ? "Submit for review"
            : "পর্যালোচনায় পাঠান"
          : isEn
            ? "Publish story"
            : "সংবাদ প্রকাশ করুন";
  const checklistLabels = {
    headline: isEn ? "Story headline" : "সংবাদের শিরোনাম",
    body: isEn ? "Story body" : "সংবাদের বিস্তারিত",
    desk: isEn ? "News desk selected" : "সংবাদ বিভাগ নির্বাচিত",
    summary: isEn ? "Summary added" : "সারসংক্ষেপ যুক্ত",
    image: isEn ? "Cover image & alt text" : "প্রচ্ছদ ছবি ও বর্ণনা",
  };

  const statusLabel =
    effectiveStatus === "published"
      ? isEn
        ? "Live on publish"
        : "সরাসরি প্রকাশ"
      : effectiveStatus === "scheduled"
        ? isEn
          ? "Scheduled"
          : "শিডিউলড"
        : effectiveStatus === "pending_review"
          ? isEn
            ? "Editorial review"
            : "সম্পাদকীয় পর্যালোচনা"
          : isEn
            ? "Private draft"
            : "ব্যক্তিগত খসড়া";
  const sections = [
    {
      id: "story-introduction",
      number: "01",
      label: isEn ? "Introduction" : "পরিচিতি",
    },
    {
      id: "story-body",
      number: "02",
      label: isEn ? "Story body" : "বিস্তারিত",
    },
    {
      id: "story-media",
      number: "03",
      label: isEn ? "Cover image" : "প্রচ্ছদ ছবি",
    },
    {
      id: "story-discovery",
      number: "04",
      label: isEn ? "Discovery" : "পাঠকের কাছে পৌঁছানো",
    },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={styles.composer}
      aria-label={isEn ? "Create new story" : "নতুন সংবাদ তৈরি করুন"}
    >
      <nav
        className={styles.breadcrumb}
        aria-label={isEn ? "Breadcrumb" : "অবস্থান"}
      >
        <Link href="/admin">{isEn ? "Newsroom" : "নিউজরুম"}</Link>
        <ChevronRight size={12} />
        <Link href="/admin/articles">{isEn ? "Stories" : "সংবাদ"}</Link>
        <ChevronRight size={12} />
        <span aria-current="page">
          {isEn ? "Create new story" : "নতুন সংবাদ"}
        </span>
      </nav>

      <header className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            {isEn ? "The editorial desk" : "সম্পাদকীয় ডেস্ক"}
          </span>
          <h1>{isEn ? "Create a new story" : "নতুন সংবাদ তৈরি করুন"}</h1>
          <p>
            {isEn
              ? "From the first fact to the final headline. A focused space for journalism that matters."
              : "প্রথম তথ্য থেকে চূড়ান্ত শিরোনাম। অর্থবহ সাংবাদিকতার জন্য একটি মনোযোগী কর্মক্ষেত্র।"}
          </p>
        </div>
        <div className={styles.edition}>
          <span className={styles.editionMark}>Y</span>
          <div>
            <small>{isEn ? "Editorial edition" : "সম্পাদকীয় সংস্করণ"}</small>
            <strong>{isEn ? "Bangla newsroom" : "বাংলা নিউজরুম"}</strong>
          </div>
          <Globe2 size={15} />
        </div>
      </header>

      <div className={styles.commandBar}>
        <div className={styles.saveState} role="status" aria-live="polite">
          <span className={styles.saveStateIcon}>
            {storageError ? (
              <AlertCircle size={17} />
            ) : (
              <CloudCheck size={17} />
            )}
          </span>
          <div>
            <strong>
              {storageError
                ? isEn
                  ? "Browser autosave unavailable"
                  : "ব্রাউজারে অটোসেভ সম্ভব নয়"
                : recovery
                  ? isEn
                    ? "A previous draft is waiting"
                    : "আগের একটি খসড়া রয়েছে"
                  : isDirty
                    ? isEn
                      ? "Saving changes in this browser…"
                      : "ব্রাউজারে পরিবর্তন সংরক্ষণ হচ্ছে…"
                    : lastSaved
                      ? isEn
                        ? "Saved in this browser"
                        : "এই ব্রাউজারে সংরক্ষিত"
                      : isEn
                        ? "Your next story starts here"
                        : "নতুন সংবাদ লেখা শুরু করুন"}
            </strong>
            {lastSaved && !isDirty
              ? new Date(lastSaved).toLocaleTimeString(
                  isEn ? "en-US" : "bn-BD",
                  { hour: "2-digit", minute: "2-digit" },
                )
              : isEn
                ? "Use Save draft to save to the newsroom."
                : "নিউজরুমে সংরক্ষণ করতে খসড়া সংরক্ষণ করুন।"}
          </div>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.quietButton}
            onClick={() => setAiOpen(true)}
          >
            <Sparkles size={15} />
            {isEn ? "AI assist" : "এআই সহায়তা"}
          </button>
          <button
            type="button"
            className={styles.button}
            disabled={loading || !!success}
            onClick={() => void submitStory(true)}
          >
            <Save size={15} />
            {isEn ? "Save draft" : "খসড়া সংরক্ষণ"}
          </button>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={loading || !!success}
          >
            {loading ? (
              <Loader2 size={15} className={styles.spin} />
            ) : (
              <Send size={15} />
            )}
            {loading ? (isEn ? "Saving…" : "সংরক্ষণ হচ্ছে…") : publishLabel}
          </button>
        </div>
      </div>

      {recovery && (
        <div className={styles.alert} role="status">
          <RotateCcw size={20} />
          <div>
            <strong>
              {isEn
                ? "Pick up where you left off"
                : "অসমাপ্ত সংবাদ লেখা চালিয়ে যান"}
            </strong>
            <p>
              {recovery.draft.title ||
                (isEn ? "Untitled story" : "শিরোনামহীন সংবাদ")}{" "}
              ·{" "}
              {new Date(recovery.savedAt).toLocaleString(
                isEn ? "en-US" : "bn-BD",
              )}
            </p>
          </div>
          <button
            type="button"
            className={styles.button}
            onClick={restoreDraft}
          >
            {isEn ? "Restore draft" : "খসড়া ফিরিয়ে আনুন"}
          </button>
          <button
            type="button"
            className={styles.textButton}
            onClick={discardRecovery}
          >
            {isEn ? "Discard" : "বাদ দিন"}
          </button>
        </div>
      )}
      {error && (
        <div
          ref={errorRef}
          tabIndex={-1}
          className={`${styles.alert} ${styles.error}`}
          role="alert"
        >
          <AlertCircle size={20} />
          <div>{error}</div>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label={isEn ? "Dismiss error" : "ত্রুটি বার্তা বন্ধ করুন"}
          >
            <X size={17} />
          </button>
        </div>
      )}
      {success && (
        <div className={`${styles.alert} ${styles.success}`} role="status">
          <CheckCircle2 size={20} />
          <div>{success}</div>
        </div>
      )}
      {metadataError && (
        <div className={styles.alert} role="alert">
          <AlertCircle size={18} />
          <div>
            {isEn
              ? "Some desk or location options could not be loaded. You can keep writing and save a draft."
              : "কিছু বিভাগ বা স্থানের তথ্য লোড হয়নি। লেখা চালিয়ে যেতে ও খসড়া সংরক্ষণ করতে পারেন।"}
          </div>
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.mainColumn}>
          <nav
            className={styles.sectionNav}
            aria-label={isEn ? "Story sections" : "সংবাদের অংশ"}
          >
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>
                <span>{section.number}</span>
                {section.label}
              </a>
            ))}
          </nav>
          <ComposerSection
            id="story-introduction"
            icon={PenLine}
            index="01"
            title={isEn ? "The introduction" : "সংবাদের পরিচিতি"}
            description={
              isEn
                ? "Lead with clarity. Give readers a reason to care."
                : "স্পষ্টতায় শুরু করুন। পাঠকের আগ্রহ তৈরি করুন।"
            }
            action={
              <span className={styles.sectionTag}>
                {isEn ? "Required" : "আবশ্যক"}
              </span>
            }
          >
            <ComposerField
              id="story-title"
              label={isEn ? "Story headline *" : "সংবাদের শিরোনাম *"}
            >
              <textarea
                id="story-title"
                ref={titleRef}
                className={`${styles.input} ${styles.headlineInput}`}
                placeholder={
                  isEn
                    ? "Give your story a powerful headline…"
                    : "সংবাদের একটি আকর্ষণীয় শিরোনাম লিখুন…"
                }
                value={draft.title}
                onChange={(event) => changeTitle(event.target.value)}
                maxLength={500}
                rows={2}
                required
              />
              <div className={styles.fieldFooter}>
                <span>
                  {isEn
                    ? "Be specific. Be accurate. Make it count."
                    : "সুনির্দিষ্ট ও নির্ভুল শিরোনাম লিখুন।"}
                </span>
                <span>
                  {formatNumber(draft.title.length)}/{formatNumber(500)}
                </span>
              </div>
            </ComposerField>
            <ComposerField
              id="story-title-en"
              label={isEn ? "English headline" : "ইংরেজি শিরোনাম"}
              optional={optional}
              hint={
                isEn
                  ? "Also helps generate a readable story URL."
                  : "সংবাদের সহজপাঠ্য ইউআরএল তৈরিতেও সহায়ক।"
              }
            >
              <input
                id="story-title-en"
                className={styles.input}
                placeholder="Add an English version of the headline"
                value={draft.titleEn}
                maxLength={500}
                onChange={(event) => changeTitle(event.target.value, true)}
                aria-describedby="story-title-en-hint"
              />
            </ComposerField>
            <div className={styles.summaryField}>
              <ComposerField
                id="story-excerpt"
                label={isEn ? "Story summary" : "সংবাদের সারসংক্ষেপ"}
                optional={optional}
              >
                <textarea
                  id="story-excerpt"
                  className={`${styles.input} ${styles.summaryInput}`}
                  placeholder={
                    isEn
                      ? "Set the scene in one or two sentences. What should readers know?"
                      : "এক বা দুই বাক্যে সংবাদের মূল বিষয় তুলে ধরুন।"
                  }
                  value={draft.excerpt}
                  onChange={(event) => update("excerpt", event.target.value)}
                  maxLength={500}
                  rows={3}
                />
                <div className={styles.fieldFooter}>
                  <span>
                    {isEn
                      ? "Shown on story cards and used as the default search description."
                      : "সংবাদ কার্ড ও সার্চের প্রাথমিক বিবরণে প্রদর্শিত হবে।"}
                  </span>
                  <span>
                    {formatNumber(draft.excerpt.length)}/{formatNumber(500)}
                  </span>
                </div>
              </ComposerField>
            </div>
          </ComposerSection>

          <ComposerSection
            id="story-body"
            icon={FileText}
            index="02"
            title={isEn ? "The full story" : "সংবাদের বিস্তারিত"}
            description={
              isEn
                ? "Bring the facts to life with context, evidence and a clear narrative."
                : "প্রেক্ষাপট, তথ্যপ্রমাণ ও স্পষ্ট বর্ণনায় সংবাদটিকে জীবন্ত করুন।"
            }
            action={
              <span className={styles.editorMode}>
                <span />
                {isEn ? "Writing" : "লিখুন"}
              </span>
            }
          >
            <div className={styles.editorCanvas}>
              <TiptapEditor
                content={draft.content}
                onChange={(value) => update("content", value)}
                placeholder={
                  isEn
                    ? "Start writing your story here…"
                    : "এখানে সংবাদ লেখা শুরু করুন…"
                }
              />
            </div>
            <div className={styles.editorFooter}>
              <span>
                <FileText size={13} />
                {formatNumber(wordCount)} {isEn ? "words" : "শব্দ"}
              </span>
              <span>
                <Clock3 size={13} />
                {formatNumber(wordCount ? Math.ceil(wordCount / 180) : 0)}{" "}
                {isEn ? "min read" : "মিনিট পড়ার সময়"}
              </span>
              <span>
                {isEn
                  ? "Supports images, links & video embeds"
                  : "ছবি, লিংক ও ভিডিও যুক্ত করা যাবে"}
              </span>
            </div>
          </ComposerSection>

          <ComposerSection
            id="story-media"
            icon={ImageIcon}
            index="03"
            title={isEn ? "A picture worth a thousand words" : "প্রচ্ছদ ছবি"}
            description={
              isEn
                ? "Choose a lead image that captures the moment and respects its context."
                : "মুহূর্ত ও প্রেক্ষাপটকে তুলে ধরে এমন প্রধান ছবি নির্বাচন করুন।"
            }
            action={<span className={styles.sectionTag}>16:9</span>}
          >
            <div className={styles.mediaLayout}>
              <div className={styles.imagePreview}>
                {draft.featuredImageUrl && !imageError ? (
                  <>
                    {/* Remote newsroom URLs are arbitrary; avoid an optimization allowlist. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={draft.featuredImageUrl}
                      alt={
                        draft.featuredImageAlt ||
                        (isEn ? "Story cover preview" : "প্রচ্ছদ ছবির প্রিভিউ")
                      }
                      onError={() => setImageError(true)}
                    />
                    <button
                      type="button"
                      className={styles.imageRemove}
                      aria-label={
                        isEn ? "Remove cover image" : "প্রচ্ছদ ছবি সরান"
                      }
                      onClick={() => {
                        update("featuredImageUrl", "");
                        setImageError(false);
                      }}
                    >
                      <X size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <ImageIcon size={32} strokeWidth={1.3} />
                    <strong>
                      {imageError
                        ? isEn
                          ? "Image could not be loaded"
                          : "ছবি লোড করা যায়নি"
                        : isEn
                          ? "Your story, in focus"
                          : "ছবিতে আপনার সংবাদ"}
                    </strong>
                    <span>
                      {imageError
                        ? isEn
                          ? "Check the image URL and try again."
                          : "ছবির ইউআরএল পরীক্ষা করুন।"
                        : isEn
                          ? "Add an image URL to see a preview"
                          : "প্রিভিউ দেখতে ছবির ইউআরএল দিন"}
                    </span>
                    <span>
                      {isEn
                        ? "Recommended: 1200 × 675 px"
                        : "প্রস্তাবিত: ১২০০ × ৬৭৫ পিক্সেল"}
                    </span>
                  </>
                )}
              </div>
              <div className={styles.mediaFields}>
                <ComposerField
                  id="story-image-url"
                  label={isEn ? "Image URL" : "ছবির ইউআরএল"}
                >
                  <input
                    id="story-image-url"
                    type="url"
                    className={styles.input}
                    placeholder="https://…"
                    value={draft.featuredImageUrl}
                    onChange={(event) => {
                      update("featuredImageUrl", event.target.value);
                      setImageError(false);
                    }}
                  />
                  <Link
                    href="/admin/media"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.textButton}
                  >
                    {isEn ? "Open media library" : "মিডিয়া লাইব্রেরি খুলুন"}
                    <ArrowUpRight size={12} />
                  </Link>
                </ComposerField>
                <ComposerField
                  id="story-image-alt"
                  label={isEn ? "Alternative text" : "ছবির বিকল্প বর্ণনা"}
                  hint={
                    isEn
                      ? "Describe the image for readers using screen readers."
                      : "স্ক্রিন রিডার ব্যবহারকারীদের জন্য ছবির বর্ণনা লিখুন।"
                  }
                >
                  <input
                    id="story-image-alt"
                    ref={imageAltRef}
                    className={styles.input}
                    placeholder={
                      isEn
                        ? "What does this image show?"
                        : "ছবিতে কী দেখা যাচ্ছে?"
                    }
                    value={draft.featuredImageAlt}
                    maxLength={200}
                    onChange={(event) =>
                      update("featuredImageAlt", event.target.value)
                    }
                    aria-describedby="story-image-alt-hint"
                  />
                </ComposerField>
              </div>
            </div>
          </ComposerSection>

          <ComposerSection
            id="story-discovery"
            icon={Search}
            index="04"
            title={isEn ? "Search & discovery" : "সার্চ ও পাঠকের কাছে পৌঁছানো"}
            description={
              isEn
                ? "Help the right readers find your reporting. Nothing more, nothing less."
                : "আপনার সংবাদ যেন সঠিক পাঠকের কাছে সহজে পৌঁছায়।"
            }
            action={
              <span className={styles.sectionTag}>
                {isEn ? "Search ready" : "সার্চ প্রস্তুত"}
              </span>
            }
          >
            <ComposerField
              id="story-slug"
              label={isEn ? "Story URL" : "সংবাদের ইউআরএল"}
              hint={`/news/${draft.slug || (isEn ? "generated-when-saved" : "সংরক্ষণের-সময়-তৈরি-হবে")}`}
            >
              <input
                id="story-slug"
                className={styles.input}
                placeholder="your-story-url"
                value={draft.slug}
                maxLength={200}
                onChange={(event) => {
                  slugEdited.current = true;
                  update("slug", event.target.value);
                }}
                aria-describedby="story-slug-hint"
              />
            </ComposerField>
            <div className={styles.twoColumns}>
              <ComposerField
                id="story-seo-title"
                label={isEn ? "Search title" : "সার্চ শিরোনাম"}
                optional={optional}
              >
                <input
                  id="story-seo-title"
                  className={styles.input}
                  value={draft.seoTitle}
                  maxLength={100}
                  onChange={(event) => update("seoTitle", event.target.value)}
                  placeholder={
                    isEn
                      ? "Uses your headline by default"
                      : "মূল শিরোনাম ব্যবহৃত হবে"
                  }
                />
              </ComposerField>
              <ComposerField
                id="story-keyword"
                label={isEn ? "Focus keyword" : "মূল কীওয়ার্ড"}
                optional={optional}
              >
                <input
                  id="story-keyword"
                  className={styles.input}
                  value={draft.focusKeyword}
                  maxLength={100}
                  onChange={(event) =>
                    update("focusKeyword", event.target.value)
                  }
                  placeholder={
                    isEn
                      ? "e.g. Bangladesh economy"
                      : "যেমন: বাংলাদেশের অর্থনীতি"
                  }
                />
              </ComposerField>
            </div>
            <ComposerField
              id="story-seo-description"
              label={isEn ? "Search description" : "সার্চ বিবরণ"}
              optional={optional}
            >
              <textarea
                id="story-seo-description"
                className={styles.input}
                value={draft.seoDescription}
                rows={2}
                maxLength={250}
                onChange={(event) =>
                  update("seoDescription", event.target.value)
                }
                placeholder={
                  isEn
                    ? "Uses your story summary by default"
                    : "সংবাদের সারসংক্ষেপ ব্যবহৃত হবে"
                }
              />
            </ComposerField>
            <div
              className={styles.searchPreview}
              aria-label={isEn ? "Search preview" : "সার্চ প্রিভিউ"}
            >
              <small>Yes News 24 · /news/{draft.slug || "your-story"}</small>
              <h3>
                {draft.seoTitle ||
                  draft.title ||
                  (isEn
                    ? "Your headline will appear here"
                    : "আপনার শিরোনাম এখানে দেখা যাবে")}
              </h3>
              <p>
                {draft.seoDescription ||
                  draft.excerpt ||
                  (isEn
                    ? "Add a summary to preview how your story may appear in search results."
                    : "সার্চ প্রিভিউ দেখতে সংবাদের সারসংক্ষেপ যোগ করুন।")}
              </p>
            </div>
          </ComposerSection>

          <ComposerDisclosure
            icon={ShieldCheck}
            title={
              isEn
                ? "SEO quality & social previews"
                : "এসইও মান ও সোশ্যাল প্রিভিউ"
            }
            description={
              isEn
                ? "Review search quality and preview Google, Facebook and X cards."
                : "সার্চের মান যাচাই করুন এবং গুগল, ফেসবুক ও এক্স কার্ড দেখুন।"
            }
          >
            <SeoQualityScorecard
              title={draft.title}
              seoTitle={draft.seoTitle}
              slug={draft.slug}
              excerpt={draft.excerpt}
              seoDescription={draft.seoDescription}
              content={draft.content}
              featuredImageUrl={draft.featuredImageUrl}
              featuredImageAlt={draft.featuredImageAlt}
              categoryName={category?.name}
              focusKeyword={draft.focusKeyword}
              onFocusKeywordChange={(value) => update("focusKeyword", value)}
              onApplySeoTitle={(value) => update("seoTitle", value)}
              onApplySeoDescription={(value) => update("seoDescription", value)}
              onJumpToImageAlt={() => imageAltRef.current?.focus()}
            />
          </ComposerDisclosure>
          {features["module.ab_testing"] !== false && (
            <ComposerDisclosure
              icon={Layers3}
              title={isEn ? "Headline experiments" : "শিরোনাম পরীক্ষা"}
              description={
                isEn
                  ? "Compare two headlines and discover what resonates with readers."
                  : "দুটি শিরোনাম তুলনা করে পাঠকের পছন্দ জানুন।"
              }
            >
              <HeadlineAbTestingPanel
                headlineA={draft.title}
                headlineB={draft.headlineB}
                onHeadlineBChange={(value) => update("headlineB", value)}
                isEnabled={draft.isAbTestingEnabled}
                onToggleEnabled={(value) => update("isAbTestingEnabled", value)}
                durationMinutes={draft.abTestDurationMinutes}
                onDurationChange={(value) =>
                  update("abTestDurationMinutes", value)
                }
              />
            </ComposerDisclosure>
          )}
        </div>

        <aside
          className={styles.sidebar}
          aria-label={isEn ? "Story settings" : "সংবাদের সেটিংস"}
        >
          <div className={styles.publishCard}>
            <ComposerSection
              icon={Send}
              title={isEn ? "Ready when you are" : "প্রস্তুত হলে প্রকাশ করুন"}
              description={
                isEn
                  ? "Choose the right moment to share your story."
                  : "সংবাদ প্রকাশের উপযুক্ত সময় নির্বাচন করুন।"
              }
              action={
                <span
                  className={styles.statusDot}
                  data-status={effectiveStatus}
                />
              }
            >
              <ComposerField
                id="story-status"
                label={isEn ? "Publishing status" : "প্রকাশনার অবস্থা"}
              >
                <select
                  id="story-status"
                  className={styles.input}
                  value={effectiveStatus}
                  onChange={(event) =>
                    update("status", event.target.value as StoryDraft["status"])
                  }
                >
                  {canPublish && (
                    <option value="published">
                      {isEn ? "Publish immediately" : "এখনই প্রকাশ করুন"}
                    </option>
                  )}
                  {canPublish && (
                    <option value="scheduled">
                      {isEn ? "Schedule for later" : "পরে প্রকাশের শিডিউল"}
                    </option>
                  )}
                  <option value="pending_review">
                    {isEn ? "Submit for review" : "পর্যালোচনার জন্য জমা"}
                  </option>
                  <option value="draft">
                    {isEn ? "Keep as draft" : "খসড়া হিসেবে রাখুন"}
                  </option>
                </select>
              </ComposerField>
              {effectiveStatus === "scheduled" && (
                <ComposerField
                  id="story-schedule"
                  label={
                    isEn ? "Publication date & time" : "প্রকাশের তারিখ ও সময়"
                  }
                  hint={
                    isEn
                      ? "Uses your device’s local time zone."
                      : "আপনার ডিভাইসের স্থানীয় সময় অঞ্চল ব্যবহৃত হবে।"
                  }
                >
                  <input
                    id="story-schedule"
                    type="datetime-local"
                    className={styles.input}
                    value={draft.scheduledAt}
                    onChange={(event) =>
                      update("scheduledAt", event.target.value)
                    }
                    aria-describedby="story-schedule-hint"
                  />
                </ComposerField>
              )}
              <div className={styles.publishNote}>
                <ShieldCheck size={15} />
                <span>
                  {effectiveStatus === "published"
                    ? isEn
                      ? "Publishing makes this story visible to everyone. Check your facts and image rights first."
                      : "প্রকাশের পর সংবাদটি সবাই দেখতে পাবেন। আগে তথ্য ও ছবির স্বত্ব যাচাই করুন।"
                    : effectiveStatus === "pending_review"
                      ? isEn
                        ? "An editor will review your story before it goes live."
                        : "প্রকাশের আগে সম্পাদক আপনার সংবাদ পর্যালোচনা করবেন।"
                      : effectiveStatus === "scheduled"
                        ? isEn
                          ? "Your story will go live at the selected date and time."
                          : "নির্বাচিত তারিখ ও সময়ে সংবাদ প্রকাশিত হবে।"
                        : isEn
                          ? "Drafts stay private in the newsroom until they are published."
                          : "প্রকাশের আগে খসড়া শুধু নিউজরুমেই থাকবে।"}
                </span>
              </div>
              <div className={styles.publishSummary}>
                <CalendarDays size={15} />
                <div>
                  <span>
                    {isEn ? "Publication plan" : "প্রকাশনা পরিকল্পনা"}
                  </span>
                  <strong>{statusLabel}</strong>
                </div>
                <Check size={15} />
              </div>
              <button
                type="submit"
                className={`${styles.primaryButton} ${styles.fullWidth}`}
                disabled={loading || !!success}
              >
                {loading ? (
                  <Loader2 size={15} className={styles.spin} />
                ) : (
                  <Send size={15} />
                )}
                {publishLabel}
              </button>
              <p className={styles.publishFootnote}>
                <ShieldCheck size={13} />
                {canPublish
                  ? isEn
                    ? "You have permission to publish."
                    : "আপনার প্রকাশের অনুমতি রয়েছে।"
                  : isEn
                    ? "An editor will make the final publishing decision."
                    : "চূড়ান্ত প্রকাশের সিদ্ধান্ত সম্পাদক নেবেন।"}
              </p>
            </ComposerSection>
          </div>

          <ComposerSection
            icon={CheckCircle2}
            title={isEn ? "Editorial essentials" : "সম্পাদকীয় প্রস্তুতি"}
            action={
              <span className={styles.checklistScore}>
                {formatNumber(completed)}/{formatNumber(checklist.length)}
              </span>
            }
          >
            <div className={styles.checklistHeader}>
              {isEn
                ? "Your story is taking shape"
                : "আপনার সংবাদ প্রস্তুত হচ্ছে"}
              <span>
                {formatNumber(Math.round((completed / checklist.length) * 100))}
                %
              </span>
            </div>
            <progress
              className={styles.progress}
              value={completed}
              max={checklist.length}
              aria-label={
                isEn ? "Story preparation progress" : "সংবাদ প্রস্তুতির অগ্রগতি"
              }
            />
            <ul className={styles.checklist}>
              {checklist.map((item) => (
                <li key={item.id} data-complete={item.complete}>
                  <a href={`#${item.target}`}>
                    {item.complete ? (
                      <CheckCircle2 size={15} aria-hidden="true" />
                    ) : (
                      <Circle size={15} aria-hidden="true" />
                    )}
                    <span>{checklistLabels[item.id]}</span>
                    <span className="sr-only">
                      {item.complete
                        ? isEn
                          ? "Complete"
                          : "সম্পন্ন"
                        : isEn
                          ? "Not added"
                          : "যুক্ত হয়নি"}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className={styles.hint}>
              {isEn
                ? "A helpful guide, not a publishing requirement. Always verify sources before publishing."
                : "এটি প্রস্তুতির সহায়ক তালিকা, প্রকাশের শর্ত নয়। প্রকাশের আগে তথ্যসূত্র যাচাই করুন।"}
            </p>
          </ComposerSection>

          <ComposerSection
            icon={MapPin}
            title={isEn ? "Desk & dateline" : "বিভাগ ও অবস্থান"}
            description={
              isEn
                ? "Every story has a place in the newsroom."
                : "প্রতিটি সংবাদের একটি বিভাগ ও স্থান রয়েছে।"
            }
          >
            <ComposerField
              id="story-category"
              label={isEn ? "News desk" : "সংবাদ বিভাগ"}
            >
              <select
                id="story-category"
                className={styles.input}
                value={draft.categoryId}
                onChange={(event) => update("categoryId", event.target.value)}
              >
                <option value="">
                  {isEn ? "Select a desk" : "বিভাগ নির্বাচন করুন"}
                </option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {isEn ? item.nameEn || item.name : item.name}
                  </option>
                ))}
              </select>
            </ComposerField>
            <ComposerField
              id="story-location"
              label={isEn ? "Byline location" : "সংবাদ প্রকাশের স্থান"}
            >
              <input
                id="story-location"
                className={styles.input}
                value={draft.newsLocation}
                maxLength={200}
                onChange={(event) => update("newsLocation", event.target.value)}
                placeholder={isEn ? "e.g. Dhaka" : "যেমন: ঢাকা"}
              />
            </ComposerField>
            <ComposerField
              id="story-division"
              label={isEn ? "Division" : "প্রশাসনিক বিভাগ"}
              optional={optional}
            >
              <select
                id="story-division"
                className={styles.input}
                value={draft.selectedDivisionId}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    selectedDivisionId: event.target.value,
                    selectedDistrictId: "",
                  }))
                }
              >
                <option value="">
                  {isEn ? "Select a division" : "বিভাগ নির্বাচন করুন"}
                </option>
                {divisions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {isEn ? item.nameEn || item.name : item.name}
                  </option>
                ))}
              </select>
            </ComposerField>
            <ComposerField
              id="story-district"
              label={isEn ? "District" : "জেলা"}
              optional={optional}
            >
              <select
                id="story-district"
                className={styles.input}
                disabled={!draft.selectedDivisionId}
                value={draft.selectedDistrictId}
                onChange={(event) =>
                  update("selectedDistrictId", event.target.value)
                }
              >
                <option value="">
                  {isEn ? "Select a district" : "জেলা নির্বাচন করুন"}
                </option>
                {districts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {isEn ? item.nameEn || item.name : item.name}
                  </option>
                ))}
              </select>
            </ComposerField>
          </ComposerSection>

          <ComposerSection
            icon={Pin}
            title={isEn ? "Editorial signals" : "সম্পাদকীয় গুরুত্ব"}
          >
            <label className={styles.toggle}>
              <Zap size={16} />
              <span>
                <strong>{isEn ? "Breaking news" : "ব্রেকিং নিউজ"}</strong>
                <small>
                  {isEn
                    ? "Mark this as an urgent developing story."
                    : "জরুরি ও চলমান সংবাদ হিসেবে চিহ্নিত করুন।"}
                </small>
              </span>
              <input
                type="checkbox"
                checked={draft.isBreaking}
                onChange={(event) => update("isBreaking", event.target.checked)}
                aria-label={isEn ? "Breaking news" : "ব্রেকিং নিউজ"}
              />
            </label>
            <label className={styles.toggle}>
              <Pin size={16} />
              <span>
                <strong>{isEn ? "Featured story" : "বিশেষ সংবাদ"}</strong>
                <small>
                  {isEn
                    ? "Make this story eligible for featured placement."
                    : "বিশেষ সংবাদ হিসেবে প্রদর্শনের জন্য নির্বাচন করুন।"}
                </small>
              </span>
              <input
                type="checkbox"
                checked={draft.isFeatured}
                onChange={(event) => update("isFeatured", event.target.checked)}
                aria-label={isEn ? "Featured story" : "বিশেষ সংবাদ"}
              />
            </label>
            <Link href="/admin/guidelines" className={styles.textButton}>
              {isEn ? "Editorial guidelines" : "সম্পাদকীয় নির্দেশিকা"}
              <ArrowUpRight size={12} />
            </Link>
          </ComposerSection>
        </aside>
      </div>

      <footer className={styles.footer}>
        <Link href="/admin/articles" className={styles.textButton}>
          <ArrowLeft size={14} />
          {isEn ? "Back to all stories" : "সব সংবাদে ফিরে যান"}
        </Link>
        <p>
          <Eye size={13} />
          {isEn
            ? "Accuracy first. Every story carries our reputation."
            : "সবার আগে নির্ভুলতা। প্রতিটি সংবাদ আমাদের সুনামের প্রতিফলন।"}
        </p>
        <span className={styles.footerMark}>
          YES NEWS 24 <span>·</span> THE NEWSROOM
        </span>
      </footer>
      <AiEditorAssistantModal
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        currentTitle={draft.title}
        currentContent={draft.content}
        onApplyTitle={(title, titleEn, slug) => {
          if (slug) slugEdited.current = true;
          setDraft((current) => ({
            ...current,
            title,
            titleEn: titleEn ?? current.titleEn,
            slug: slug ?? current.slug,
          }));
        }}
        onApplyExcerpt={(value) => update("excerpt", value)}
        onApplyCleanedContent={(value) => update("content", value)}
        onApplyLocation={(name) => {
          const division = divisions.find((item) =>
            item.districts.some((district) => district.name === name),
          );
          const district = division?.districts.find(
            (item) => item.name === name,
          );
          setDraft((current) => ({
            ...current,
            newsLocation: name,
            selectedDivisionId: division?.id || current.selectedDivisionId,
            selectedDistrictId: district?.id || current.selectedDistrictId,
          }));
        }}
      />
    </form>
  );
}
