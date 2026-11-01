import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDebateBySlug } from "@/actions/debates";
import { DebateDetailClient } from "./DebateDetailClient";

interface DebatePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DebatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const debate = await getDebateBySlug(slug);

  if (!debate) {
    return { title: "বিতর্ক পাওয়া যায়নি | দৈনিক বাংলাদেশ বার্তা" };
  }

  const { poll } = debate;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bangladeshi-news-portal.onrender.com";
  const url = `${siteUrl}/debates/${slug}`;

  return {
    title: `${poll.question} | পাঠক মতামত ও বিতর্ক`,
    description:
      poll.description ||
      `দৈনিক বাংলাদেশ বার্তা সাপ্তাহিক জনমত জরিপ ও পাঠক বিতর্ক এরিনা। বিষয়: ${poll.category}।`,
    openGraph: {
      title: `${poll.question} | পাঠক মতামত ও বিতর্ক`,
      description: poll.description || undefined,
      url,
      type: "article",
    },
  };
}

export const dynamic = "force-dynamic";

export default async function DebateDetailPage({ params }: DebatePageProps) {
  const { slug } = await params;
  const debate = await getDebateBySlug(slug);

  if (!debate) {
    notFound();
  }

  return <DebateDetailClient initialData={debate} />;
}
