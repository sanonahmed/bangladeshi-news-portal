import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFactCheckBySlug, getFactChecks, incrementFactCheckViews } from "@/actions/fact-checks";
import { FactCheckDetailClient } from "@/components/public/fact-check/FactCheckDetailClient";

interface FactCheckDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: FactCheckDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getFactCheckBySlug(slug);

  if (!item) {
    return {
      title: "ফ্যাক্ট-চেক প্রতিবেদন পাওয়া যায়নি | দৈনিক বাংলাদেশ বার্তা",
    };
  }

  return {
    title: `${item.title} | দৈনিক বাংলাদেশ বার্তা সত্যসন্ধান`,
    description: item.verdictSummary,
    openGraph: {
      title: item.title,
      description: item.verdictSummary,
      images: item.originalMediaUrl ? [item.originalMediaUrl] : [],
    },
  };
}

export const revalidate = 60;

export default async function FactCheckDetailPage({
  params,
}: FactCheckDetailPageProps) {
  const { slug } = await params;
  const [item, allItems] = await Promise.all([
    getFactCheckBySlug(slug),
    getFactChecks(),
  ]);

  if (!item) {
    notFound();
  }

  // Increment view in background
  incrementFactCheckViews(slug).catch(() => {});

  const related = allItems.filter((i) => i.id !== item.id);

  return (
    <main className="min-h-screen bg-[var(--color-bg-secondary)]/30 py-4">
      <FactCheckDetailClient factCheck={item} relatedFactChecks={related} />
    </main>
  );
}
