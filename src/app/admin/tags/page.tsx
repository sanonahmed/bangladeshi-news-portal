import { getAllAdminTags } from "@/actions/tags";
import { AdminTagsClient } from "./AdminTagsClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "সংবাদ ট্যাগ ব্যবস্থাপনা | দৈনিক বাংলাদেশ বার্তা অ্যাডমিন",
  description: "সংবাদের বিষয়ভিত্তিক ট্যাগ, শ্রেণিবিভাগ ও সম্পর্কিত সংবাদ সংযোগ পরিচালনা।",
};

export default async function AdminTagsPage() {
  const tagsList = await getAllAdminTags();

  return <AdminTagsClient initialTags={tagsList} />;
}
