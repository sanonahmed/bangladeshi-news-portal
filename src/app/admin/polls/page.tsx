import { getAllAdminPolls } from "@/actions/polls";
import { AdminPollsClient } from "./AdminPollsClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "অনলাইন ভোট ও পাঠক জরিপ | অ্যাডমিন প্যানেল",
  description: "ওয়েবসাইটে প্রকাশিত জনমত জরিপ তৈরি ও ফলাফল ব্যবস্থাপনা।",
};

export default async function AdminPollsPage() {
  const initialPolls = await getAllAdminPolls();

  return <AdminPollsClient initialPolls={initialPolls} />;
}
