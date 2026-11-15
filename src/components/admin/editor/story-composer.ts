import { z } from "zod";

export const STORY_DRAFT_KEY = "barta_draft_article_new";

const publishingStatus = z.enum(["draft", "pending_review", "approved", "published", "scheduled"]);

// Defaults also allow recovery of drafts saved by the previous composer.
export const storyDraftSchema = z.object({
  kicker: z.string().default(""),
  title: z.string().default(""),
  titleEn: z.string().default(""),
  slug: z.string().default(""),
  excerpt: z.string().default(""),
  content: z.string().default(""),
  categoryId: z.string().default(""),
  status: publishingStatus.default("published"),
  scheduledAt: z.string().default(""),
  featuredImageUrl: z.string().default(""),
  featuredImageAlt: z.string().default(""),
  newsLocation: z.string().default("ঢাকা"),
  selectedDivisionId: z.string().default(""),
  selectedDistrictId: z.string().default(""),
  isBreaking: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().default(""),
  seoDescription: z.string().default(""),
  focusKeyword: z.string().default(""),
  headlineB: z.string().default(""),
  isAbTestingEnabled: z.boolean().default(false),
  abTestDurationMinutes: z.number().positive().default(30),
});

export type StoryDraft = z.infer<typeof storyDraftSchema>;
export type PublishingStatus = StoryDraft["status"];

export function storyWordCount(html: string): number {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;|&#xA0;/gi, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
  return text ? text.split(/\s+/).length : 0;
}

export function storySlug(title: string): string {
  return title.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export function resolvePublishingStatus(status: PublishingStatus, canPublish: boolean): PublishingStatus {
  if (!canPublish && ["published", "scheduled", "approved"].includes(status)) return "pending_review";
  return status === "approved" ? "pending_review" : status;
}

export function storyChecklist(draft: StoryDraft) {
  return [
    { id: "headline", complete: !!draft.title.trim(), target: "story-title" },
    { id: "body", complete: storyWordCount(draft.content) > 0, target: "story-body" },
    { id: "desk", complete: !!draft.categoryId, target: "story-category" },
    { id: "summary", complete: !!draft.excerpt.trim(), target: "story-excerpt" },
    { id: "image", complete: !!draft.featuredImageUrl.trim() && !!draft.featuredImageAlt.trim(), target: "story-image-url" },
  ] as const;
}

export function readStoryDraft(value: string): { draft: StoryDraft; savedAt: number } | null {
  try {
    const parsed = z.object({ savedAt: z.number().finite() }).passthrough().parse(JSON.parse(value));
    const draft = storyDraftSchema.parse(parsed);
    return draft.title.trim() || storyWordCount(draft.content) ? { draft, savedAt: parsed.savedAt } : null;
  } catch {
    return null;
  }
}