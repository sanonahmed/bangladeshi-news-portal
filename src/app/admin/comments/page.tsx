import { getAllAdminComments } from "@/actions/comments";
import { AdminCommentsClient } from "./AdminCommentsClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "পাঠক মন্তব্য ও প্রতিক্রিয়া মডারেশন | অ্যাডমিন প্যানেল",
  description: "ওয়েবসাইটে প্রকাশিত সংবাদের পাঠকদের মন্তব্য ও মতামত অনুমোদন ও ব্যবস্থাপনা।",
};

export default async function AdminCommentsPage() {
  const initialComments = await getAllAdminComments();

  return <AdminCommentsClient initialComments={initialComments} />;
}
