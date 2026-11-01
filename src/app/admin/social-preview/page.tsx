import { getPublishedArticles } from "@/actions/articles";
import { AdminSocialPreviewClient } from "./AdminSocialPreviewClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "সোশ্যাল কার্ড ও ওপেন গ্রাফ প্রিভিউ | অ্যাডমিন প্যানেল",
  description: "ফেসবুক, টুইটার, হোয়াটসঅ্যাপ ও সোশ্যাল মিডিয়া শেয়ারিং প্রিভিউ জেনারেটর।",
};

export default async function AdminSocialPreviewPage() {
  const articlesResult = await getPublishedArticles({ pageSize: 15 });

  const simpleArticles = (articlesResult.data || []).map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    categoryName: a.category?.name || "জাতীয়",
    featuredImageUrl: a.featuredImageUrl,
    authorName: a.author?.name || "নিজস্ব প্রতিবেদক",
  }));

  return <AdminSocialPreviewClient articles={simpleArticles} />;
}
