import { revalidatePath, revalidateTag } from "next/cache";

export const CACHE_TAGS = {
  articles: "articles",
  article: (slug: string) => `article-${slug}`,
  category: (slug: string) => `category-${slug}`,
  homepage: "homepage",
  breakingNews: "breaking-news",
  navigation: "navigation",
  settings: "settings",
  popular: "popular",
  latest: "latest",
  author: (slug: string) => `author-${slug}`,
} as const;

export function safeRevalidateTag(tag: string) {
  try {
    (revalidateTag as any)(tag, { expire: 0 });
  } catch {
    // Graceful fallback
  }
}

export function revalidateArticle(
  slug: string,
  categorySlug?: string,
  authorSlug?: string
): void {
  safeRevalidateTag(CACHE_TAGS.articles);
  safeRevalidateTag(CACHE_TAGS.article(slug));
  safeRevalidateTag(CACHE_TAGS.homepage);
  safeRevalidateTag(CACHE_TAGS.latest);
  safeRevalidateTag(CACHE_TAGS.popular);

  if (categorySlug) {
    safeRevalidateTag(CACHE_TAGS.category(categorySlug));
  }
  if (authorSlug) {
    safeRevalidateTag(CACHE_TAGS.author(authorSlug));
  }

  revalidatePath("/");
  revalidatePath("/latest");
  revalidatePath(`/news/${slug}`);

  if (categorySlug) {
    revalidatePath(`/category/${categorySlug}`);
  }
  if (authorSlug) {
    revalidatePath(`/author/${authorSlug}`);
  }
}

export function revalidateHomepage(): void {
  safeRevalidateTag(CACHE_TAGS.homepage);
  safeRevalidateTag(CACHE_TAGS.articles);
  safeRevalidateTag(CACHE_TAGS.popular);
  safeRevalidateTag(CACHE_TAGS.latest);
  revalidatePath("/");
}

export function revalidateNavigation(): void {
  safeRevalidateTag(CACHE_TAGS.navigation);
  revalidatePath("/", "layout");
}

export function revalidateBreakingNews(): void {
  safeRevalidateTag(CACHE_TAGS.breakingNews);
  revalidatePath("/");
  revalidatePath("/", "layout");
}

export function revalidateSettings(): void {
  safeRevalidateTag(CACHE_TAGS.settings);
  revalidatePath("/", "layout");
}

export function revalidateCategory(categorySlug: string): void {
  safeRevalidateTag(CACHE_TAGS.category(categorySlug));
  safeRevalidateTag(CACHE_TAGS.articles);
  revalidatePath(`/category/${categorySlug}`);
}

export function revalidateAuthor(authorSlug: string): void {
  safeRevalidateTag(CACHE_TAGS.author(authorSlug));
  revalidatePath(`/author/${authorSlug}`);
}
