import { describe, it, expect } from "vitest";
import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";

const ArticleCreateSchema = z.object({
  title: z.string().min(1, "শিরোনাম আবশ্যক").max(500),
  titleEn: z.string().max(500).optional(),
  slug: z.string().min(1).max(200),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, "বিষয়বস্তু আবশ্যক"),
  featuredImageId: z.string().optional(),
  featuredImageAlt: z.string().max(200).optional(),
  categoryId: z.string().optional(),
  status: z
    .enum([
      "draft",
      "pending_review",
      "approved",
      "published",
      "unpublished",
      "archived",
      "rejected",
    ])
    .default("draft"),
  isFeatured: z.boolean().default(false),
  isBreaking: z.boolean().default(false),
  seoTitle: z.string().max(100).optional(),
  seoDescription: z.string().max(300).optional(),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
  language: z.enum(["bn", "en"]).default("bn"),
  newsLocation: z.string().max(100).optional(),
});

describe("Article Validation & Sanitization", () => {
  it("validates valid Bengali article input payload", () => {
    const payload = {
      title: "জাতীয় অর্থনৈতিক পরিষদের বৈঠকে গুরুত্বপূর্ণ সিদ্ধান্ত",
      slug: "ecnec-meeting-important-decisions",
      content: "<p>আজ সকালে শেরেবাংলা নগরে এনইসি সম্মেলন কক্ষে অনুষ্ঠিত বৈঠকে...</p>",
      excerpt: "বৈঠকে একাধিক বড় অবকাঠামো উন্নয়ন প্রকল্প পাস হয়েছে।",
      language: "bn" as const,
      isFeatured: true,
    };

    const parsed = ArticleCreateSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.title).toBe(payload.title);
      expect(parsed.data.status).toBe("draft");
      expect(parsed.data.isFeatured).toBe(true);
      expect(parsed.data.language).toBe("bn");
    }
  });

  it("fails validation when title or content is empty", () => {
    const emptyTitle = {
      title: "",
      slug: "empty-title",
      content: "<p>কিছু লেখা</p>",
    };
    const emptyContent = {
      title: "শিরোনাম আছে",
      slug: "has-title",
      content: "",
    };

    expect(ArticleCreateSchema.safeParse(emptyTitle).success).toBe(false);
    expect(ArticleCreateSchema.safeParse(emptyContent).success).toBe(false);
  });

  it("sanitizes dangerous XSS scripts while retaining valid journalistic HTML", () => {
    const dirtyHtml = `
      <p>নিরাপদ অনুচ্ছেদ <strong>বোল্ড টেক্সট</strong></p>
      <script>alert("hacked")</script>
      <img src="https://example.com/photo.jpg" onerror="alert('xss')" alt="ছবি" />
    `;

    const sanitized = DOMPurify.sanitize(dirtyHtml, {
      ALLOWED_TAGS: [
        "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "h4",
        "blockquote", "ul", "ol", "li", "a", "img", "figure", "figcaption",
      ],
      ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "class"],
    });

    expect(sanitized).not.toContain("<script>");
    expect(sanitized).not.toContain("alert(");
    expect(sanitized).not.toContain("onerror");
    expect(sanitized).toContain("<p>নিরাপদ অনুচ্ছেদ <strong>বোল্ড টেক্সট</strong></p>");
    expect(sanitized).toContain('src="https://example.com/photo.jpg"');
  });
});
