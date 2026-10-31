import { NextResponse } from "next/server";
import { getPublishedArticles } from "@/actions/articles";

export const dynamic = "force-dynamic";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "বাংলা নিউজ";

  // Google News requires articles published in the last 48 hours
  const result = await getPublishedArticles({ pageSize: 50 });
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;

  const recentArticles = result.data.filter((a) => {
    if (!a.publishedAt) return false;
    return new Date(a.publishedAt).getTime() >= cutoff;
  });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;

  for (const article of recentArticles) {
    const pubDate = article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString();
    // Escape XML entities
    const safeTitle = article.title
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

    xml += `
  <url>
    <loc>${siteUrl}/news/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${siteName}</news:name>
        <news:language>bn</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${safeTitle}</news:title>
    </news:news>
  </url>`;
  }

  xml += `
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}
