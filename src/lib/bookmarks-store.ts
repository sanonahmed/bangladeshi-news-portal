/**
 * Client-side Bookmarks & Category Preferences Store
 * Synchronizes with localStorage and dispatches window events
 */

export interface StoredBookmark {
  id: string;
  slug: string;
  title: string;
  categoryName?: string;
  featuredImageUrl?: string;
  savedAt: number;
}

const STORAGE_KEY = "barta_reader_bookmarks";
const PREFS_KEY = "barta_reader_favorite_categories";
const BOOKMARKS_EVENT = "barta:bookmarks_changed";
const PREFS_EVENT = "barta:category_prefs_changed";

export function getStoredBookmarks(): StoredBookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Error reading bookmarks:", err);
    return [];
  }
}

export function isArticleBookmarked(id: string): boolean {
  if (typeof window === "undefined") return false;
  const list = getStoredBookmarks();
  return list.some((b) => b.id === id);
}

export function toggleStoredBookmark(item: {
  id: string;
  slug: string;
  title: string;
  categoryName?: string;
  featuredImageUrl?: string;
}): boolean {
  if (typeof window === "undefined") return false;

  try {
    const list = getStoredBookmarks();
    const existingIndex = list.findIndex((b) => b.id === item.id);
    let isNowBookmarked = false;

    if (existingIndex >= 0) {
      list.splice(existingIndex, 1);
      isNowBookmarked = false;
    } else {
      list.unshift({
        id: item.id,
        slug: item.slug,
        title: item.title,
        categoryName: item.categoryName,
        featuredImageUrl: item.featuredImageUrl,
        savedAt: Date.now(),
      });
      isNowBookmarked = true;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(BOOKMARKS_EVENT, { detail: { count: list.length } }));
    return isNowBookmarked;
  } catch (err) {
    console.error("Error toggling bookmark:", err);
    return false;
  }
}

export function removeStoredBookmark(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = getStoredBookmarks().filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(BOOKMARKS_EVENT, { detail: { count: list.length } }));
  } catch (err) {
    console.error("Error removing bookmark:", err);
  }
}

export function clearAllStoredBookmarks(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(BOOKMARKS_EVENT, { detail: { count: 0 } }));
  } catch (err) {
    console.error("Error clearing bookmarks:", err);
  }
}

export function getFavoriteCategories(): string[] {
  if (typeof window === "undefined") return ["national", "politics", "economy", "sports"];
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return ["national", "politics", "economy", "sports"];
    return JSON.parse(raw);
  } catch {
    return ["national", "politics", "economy", "sports"];
  }
}

export function setFavoriteCategories(slugs: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(slugs));
    window.dispatchEvent(new CustomEvent(PREFS_EVENT, { detail: { slugs } }));
  } catch (err) {
    console.error("Error saving favorite categories:", err);
  }
}
