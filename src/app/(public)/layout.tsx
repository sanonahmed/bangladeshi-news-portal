import { SiteHeader } from "@/components/public/header/SiteHeader";
import { LiveMatchTickerBar } from "@/components/public/sports/LiveMatchTickerBar";
import { BreakingNewsTicker } from "@/components/public/breaking-news/BreakingNewsTicker";
import { FloatingBreakingAlert } from "@/components/public/notifications/FloatingBreakingAlert";
import { PublicNotificationPermissionPrompt } from "@/components/public/notifications/PublicNotificationPermissionPrompt";
import { SiteFooter } from "@/components/public/footer/SiteFooter";
import { SitePresenceTracker } from "@/components/public/SitePresenceTracker";
import { getBreakingNews } from "@/actions/breaking-news";
import { getNavigation } from "@/actions/navigation";
import { getSiteSettings } from "@/actions/settings";
import { getFeatureFlags } from "@/actions/features";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // These are server-fetched with caching
  const [breakingNews, navigation, settings, features] = await Promise.all([
    getBreakingNews(),
    getNavigation(),
    getSiteSettings(),
    getFeatureFlags(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <SitePresenceTracker />
      <SiteHeader navigation={navigation} settings={settings} features={features} />
      {features.live_score !== false && <LiveMatchTickerBar />}
      {features.breaking_ticker !== false && breakingNews.length > 0 && (
        <BreakingNewsTicker items={breakingNews} />
      )}
      <main className="flex-1">
        {children}
      </main>
      {features.push_notifications !== false && (
        <PublicNotificationPermissionPrompt enabled />
      )}
      {features.breaking_ticker !== false && <FloatingBreakingAlert />}
      <SiteFooter settings={settings} />
    </div>
  );
}
