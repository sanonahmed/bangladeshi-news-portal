import { getAllAdminBreakingNews } from "@/actions/breaking-news";
import { AdminBreakingClient } from "./AdminBreakingClient";
import { checkRoleAccess } from "@/lib/admin-guard";
import { AccessDeniedNotice } from "@/components/admin/AccessDeniedNotice";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ব্রেকিং নিউজ ব্যবস্থাপনা | অ্যাডমিন প্যানেল",
  description: "ওয়েবসাইটের শীর্ষ লাল টিকারে প্রদর্শিত জরুরি খবরের তালিকা ও তাৎক্ষণিক আপডেট।",
};

export default async function AdminBreakingNewsPage() {
  const { granted, currentUser } = await checkRoleAccess("editor");
  if (!granted) {
    return (
      <AccessDeniedNotice
        requiredRole="editor"
        currentRole={currentUser?.role}
        pageTitleBn="ব্রেকিং নিউজ ব্যবস্থাপনা"
        pageTitleEn="Breaking News Management"
      />
    );
  }

  const items = await getAllAdminBreakingNews();

  return <AdminBreakingClient initialItems={items} />;
}
