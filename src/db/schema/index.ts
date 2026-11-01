// Auth
export {
  user,
  session,
  account,
  verification,
  users,
  sessions,
  accounts,
  verifications,
  userRelations,
  sessionRelations,
  accountRelations,
} from "./auth";
export type {
  User,
  NewUser,
  Session,
  NewSession,
  Account,
  NewAccount,
  Verification,
  NewVerification,
} from "./auth";

// Categories
export { categories, categoriesRelations } from "./categories";
export type { Category, NewCategory } from "./categories";

// Media (must come before articles since articles references mediaAssets)
export {
  mediaAssets,
  mediaGalleries,
  galleryImages,
  mediaAssetsRelations,
  mediaGalleriesRelations,
  galleryImagesRelations,
} from "./media";
export type {
  MediaAsset,
  NewMediaAsset,
  MediaGallery,
  NewMediaGallery,
  GalleryImage,
  NewGalleryImage,
} from "./media";

// Tags (exported before articles to avoid circular imports)
export { tags, articleTags, tagsRelations, articleTagsRelations } from "./tags";
export type { Tag, NewTag, ArticleTag, NewArticleTag } from "./tags";

// Articles
export {
  articleStatusEnum,
  type ArticleStatus,
  articleAuthorRoleEnum,
  editorialReviewStatusEnum,
  articles,
  articleRevisions,
  articleAuthors,
  articleCategories,
  editorialReviews,
  articlesRelations,
  articleRevisionsRelations,
  articleAuthorsRelations,
  articleCategoriesRelations,
  editorialReviewsRelations,
} from "./articles";
export type {
  Article,
  NewArticle,
  ArticleRevision,
  NewArticleRevision,
  ArticleAuthor,
  NewArticleAuthor,
  ArticleCategory,
  NewArticleCategory,
  EditorialReview,
  NewEditorialReview,
} from "./articles";

// Geography
export {
  divisions,
  districts,
  articleLocations,
  divisionsRelations,
  districtsRelations,
  articleLocationsRelations,
} from "./geography";
export type {
  Division,
  NewDivision,
  District,
  NewDistrict,
  ArticleLocation,
  NewArticleLocation,
} from "./geography";

// Breaking News
export { breakingNews, breakingNewsRelations } from "./breaking-news";
export type { BreakingNews, NewBreakingNews } from "./breaking-news";

// Navigation
export { navigationItems, navigationItemsRelations } from "./navigation";
export type { NavigationItem, NewNavigationItem } from "./navigation";

// Homepage
export {
  homepageSectionTypeEnum,
  homepageSections,
  homepageSectionsRelations,
} from "./homepage";
export type { HomepageSection, NewHomepageSection } from "./homepage";

// Advertisements
export {
  adPlacementEnum,
  adTypeEnum,
  adDeviceTargetEnum,
  advertisements,
  advertisementsRelations,
} from "./advertisements";
export type {
  AdPlacement,
  AdType,
  AdDeviceTarget,
  Advertisement,
  NewAdvertisement,
} from "./advertisements";

// Settings
export { siteSettings, siteSettingsRelations } from "./settings";
export type { SiteSetting, NewSiteSetting } from "./settings";

// Engagement
export {
  articleViewAggregates,
  bookmarks,
  newsletterSubscribers,
  articleViewAggregatesRelations,
  bookmarksRelations,
} from "./engagement";
export type {
  ArticleViewAggregate,
  NewArticleViewAggregate,
  Bookmark,
  NewBookmark,
  NewsletterSubscriber,
  NewNewsletterSubscriber,
} from "./engagement";

// Security
export { auditLogs, auditLogsRelations } from "./security";
export type { AuditLog, NewAuditLog } from "./security";

// Videos
export { videos } from "./videos";
export type { Video, NewVideo } from "./videos";

// Comments
export { comments, commentsRelations } from "./comments";
export type { Comment, NewComment } from "./comments";

// Polls & Debates
export {
  polls,
  pollVotes,
  debateArguments,
  pollsRelations,
  pollVotesRelations,
  debateArgumentsRelations,
} from "./polls";
export type {
  Poll,
  NewPoll,
  PollVote,
  NewPollVote,
  DebateArgument,
  NewDebateArgument,
} from "./polls";

// Authors & Reporters
export { authorProfiles, authorProfilesRelations } from "./authors";
export type { AuthorProfile, NewAuthorProfile } from "./authors";

// Push Notifications & Breaking Alerts
export {
  pushSubscriptions,
  breakingAlerts,
  breakingAlertsRelations,
} from "./notifications";
export type {
  PushSubscription,
  NewPushSubscription,
  BreakingAlert,
  NewBreakingAlert,
} from "./notifications";

// Fact-Check & Verification
export {
  factChecks,
  factChecksRelations,
  factCheckSubmissions,
} from "./fact-checks";
export type {
  FactCheck,
  NewFactCheck,
  FactCheckSubmission,
  NewFactCheckSubmission,
} from "./fact-checks";


