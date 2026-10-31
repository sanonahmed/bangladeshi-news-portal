import { NextResponse } from "next/server";
import { getPublishedArticles } from "@/actions/articles";
import { getCategories } from "@/actions/categories";

export const dynamic = "force-dynamic";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const [articlesResult, categoriesList] = await Promise.all([
    getPublishedArticles({ pageSize: 100 }),
    getCategories(),
  ]);

  const staticUrls = [
    "",
    "/latest",
    "/popular",
    "/breaking",
    "/search",
    "/videos",
    "/photos",
    "/opinion",
    "/archive",
    "/about",
    "/contact",
    "/editorial-policy",
    "/corrections-policy",
    "/privacy-policy",
    "/terms",
    "/advertise",
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Static URLs
  for (const path of staticUrls) {
    xml += `
  <url>
    <loc>${siteUrl}${path}</loc>
    <changefreq>daily</changefreq>
    <priority>${path === "" ? "1.0" : "0.7"}</priority>
  </url>`;
  }

  // Category URLs
  for (const cat of categoriesList) {
    xml += `
  <url>
    <loc>${siteUrl}/category/${cat.slug}</loc>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  // Article URLs
  for (const article of articlesResult.data) {
    const lastmod = article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString();
    xml += `
  <url>
    <loc>${siteUrl}/news/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.9</priority>
  </url>`;
  }

  xml += `
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
