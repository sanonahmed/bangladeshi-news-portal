export interface SiteSettings {
  siteName: string;
  siteSlogan?: string;
  logoUrl?: string;
  faviconUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  epaper?: string;
  googleAnalyticsId?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  labelEn?: string;
  href: string;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
  openInNewTab: boolean;
  categoryId?: string | null;
  iconName?: string | null;
}

export interface BreakingNewsItem {
  id: string;
  headline: string;
  headlineEn?: string | null;
  url: string;
  isExternal: boolean;
  priority: number;
}

export interface ArticleCard {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImageUrl?: string | null;
  featuredImageAlt?: string | null;
  publishedAt?: Date | null;
  category?: { name: string; slug: string } | null;
  author?: { name: string; slug: string } | null;
  headlineB?: string | null;
  abTestStatus?: string | null;
  abTestStartedAt?: Date | null;
  abTestDurationMinutes?: number | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
