import { SiteHeader } from "@/components/public/header/SiteHeader";
import { LiveMatchTickerBar } from "@/components/public/sports/LiveMatchTickerBar";
import { BreakingNewsTicker } from "@/components/public/breaking-news/BreakingNewsTicker";
import { SiteFooter } from "@/components/public/footer/SiteFooter";
import { getBreakingNews } from "@/actions/breaking-news";
import { getNavigation } from "@/actions/navigation";
import { getSiteSettings } from "@/actions/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // These are server-fetched with caching
  const [breakingNews, navigation, settings] = await Promise.all([
    getBreakingNews(),
    getNavigation(),
    getSiteSettings(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader navigation={navigation} settings={settings} />
      <LiveMatchTickerBar />
      {breakingNews.length > 0 && (
        <BreakingNewsTicker items={breakingNews} />
      )}
      <main className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
