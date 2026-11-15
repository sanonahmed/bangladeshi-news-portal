import { describe, expect, it } from "vitest";
import {
  readStoryDraft,
  resolvePublishingStatus,
  storyChecklist,
  storyDraftSchema,
  storySlug,
  storyWordCount,
} from "@/components/admin/editor/story-composer";

describe("story composer", () => {
  it("counts English and Bengali words without counting empty editor markup", () => {
    expect(storyWordCount("<p><br></p><p>&nbsp;&#160;&#xA0;\u200b</p>")).toBe(0);
    expect(storyWordCount("<h2>A story</h2><p>with <strong>four words</strong></p>")).toBe(5);
    expect(storyWordCount("<p>বাংলাদেশের নতুন সংবাদ</p>")).toBe(3);
    expect(storyWordCount("<img src='cover.jpg'>")).toBe(0);
  });

  it("generates a clean URL without creating partial timestamp slugs", () => {
    expect(storySlug("  Bangladesh Economy: What's Next?  ")).toBe("bangladesh-economy-whats-next");
    expect(storySlug("one___two---three")).toBe("one-two-three");
    expect(storySlug("বাংলাদেশের সংবাদ")).toBe("");
  });

  it("only offers direct publishing and scheduling to authorized users", () => {
    expect(resolvePublishingStatus("published", false)).toBe("pending_review");
    expect(resolvePublishingStatus("scheduled", false)).toBe("pending_review");
    expect(resolvePublishingStatus("approved", false)).toBe("pending_review");
    expect(resolvePublishingStatus("draft", false)).toBe("draft");
    expect(resolvePublishingStatus("published", true)).toBe("published");
    expect(resolvePublishingStatus("scheduled", true)).toBe("scheduled");
  });

  it("derives checklist completion from actual content including image alt text", () => {
    const draft = storyDraftSchema.parse({});
    expect(storyChecklist(draft).filter(item => item.complete)).toHaveLength(0);
    const complete = { ...draft, title: "Headline", content: "<p>Story</p>", categoryId: "national", excerpt: "Summary", featuredImageUrl: "https://example.com/image.jpg" };
    expect(storyChecklist(complete).filter(item => item.complete)).toHaveLength(4);
    expect(storyChecklist({ ...complete, featuredImageAlt: "People at an event" }).every(item => item.complete)).toBe(true);
    expect(storyChecklist({ ...draft, title: "  ", content: "<p>&nbsp;</p>" }).some(item => item.complete)).toBe(false);
  });

  it("restores old drafts with defaults for newly persisted geography fields", () => {
    const result = readStoryDraft(JSON.stringify({ title: "Existing story", content: "<p>Body</p>", savedAt: 123 }));
    expect(result?.draft.title).toBe("Existing story");
    expect(result?.draft.selectedDivisionId).toBe("");
    expect(result?.draft.abTestDurationMinutes).toBe(30);
    expect(result?.savedAt).toBe(123);
  });

  it("round-trips all story fields, including scheduling, flags and geography", () => {
    const draft = storyDraftSchema.parse({ title: "Saved story", selectedDivisionId: "dhaka", selectedDistrictId: "gazipur", status: "scheduled", scheduledAt: "2027-01-01T10:00", isBreaking: true, isFeatured: true, focusKeyword: "news", headlineB: "Alternative", isAbTestingEnabled: true });
    expect(readStoryDraft(JSON.stringify({ ...draft, savedAt: 123 }))?.draft).toEqual(draft);
  });

  it("ignores corrupt, empty or malformed local drafts safely", () => {
    for (const value of ["not-json", "null", "[]", "{}", '{"title":1,"savedAt":123}', '{"title":"Title","status":"invalid","savedAt":123}', '{"content":"<p>&nbsp;</p>","savedAt":123}']) {
      expect(readStoryDraft(value)).toBeNull();
    }
  });
});