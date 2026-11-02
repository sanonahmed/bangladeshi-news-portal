import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLiveSportsMatchById } from "@/lib/sports-data";
import { LiveMatchDetailClient } from "./LiveMatchDetailClient";

interface LiveMatchPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: LiveMatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const match = await getLiveSportsMatchById(id);

  if (!match) {
    return { title: "ম্যাচ পাওয়া যায়নি | দৈনিক বাংলাদেশ বার্তা" };
  }

  const siteName = "দৈনিক বাংলাদেশ বার্তা";
  const title = `${match.team1.name} বনাম ${match.team2.name} লাইভ স্কোর ও কমেন্ট্রি (${match.tournament}) | ${siteName}`;

  return {
    title,
    description: `${match.team1.name} বনাম ${match.team2.name} লাইভ বল-বাই-বল স্কোরবোর্ড, ধারাভাষ্য ও ওভার বিশ্লেষণ। ভেন্যু: ${match.venue}।`,
    openGraph: {
      title,
      description: match.statusNote,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function LiveMatchPage({ params }: LiveMatchPageProps) {
  const { id } = await params;
  const match = await getLiveSportsMatchById(id);

  if (!match) {
    notFound();
  }

  return <LiveMatchDetailClient initialMatch={match} />;
}
