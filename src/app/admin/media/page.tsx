import { getAllAdminMedia } from "@/actions/media";
import { AdminMediaClient } from "./AdminMediaClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "মিডিয়া লাইব্রেরি ও ফটো আর্কাইভ | দৈনিক বাংলাদেশ বার্তা অ্যাডমিন",
  description: "ওয়েবসাইটে প্রকাশিত সকল উচ্চ রেজ্যুলেশনের সংবাদ ছবি ও চিত্রশালা ব্যবস্থাপনা।",
};

export default async function AdminMediaPage() {
  const mediaList = await getAllAdminMedia();

  return <AdminMediaClient initialMedia={mediaList} />;
}
