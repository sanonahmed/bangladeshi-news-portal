import { Shield } from "lucide-react";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AdminRolesPage() {
  const cookieStore = await cookies();
  const isEn = cookieStore.get("admin_lang")?.value !== "bn";

  const roles = [
    {
      id: "super_admin",
      titleEn: "Super Admin",
      titleBn: "সুপার অ্যাডমিন (Super Admin)",
      descEn: "Full system authority: database schema, settings, roles, security policies and user management.",
      descBn: "সিস্টেমের পূর্ণ নিয়ন্ত্রণ, সেটিংস, ব্যবহারকারী পরিচালনা ও অনুমোদন",
    },
    {
      id: "admin",
      titleEn: "Administrator",
      titleBn: "অ্যাডমিন (Admin)",
      descEn: "Manages newsroom publishing, desks, staff assignments, advertisements and moderation.",
      descBn: "নিউজ রুম কনটেন্ট, বিভাগ ও সাংবাদিকীয় কার্যক্রম পরিচালনা",
    },
    {
      id: "editor",
      titleEn: "Senior Editor",
      titleBn: "সম্পাদক (Editor)",
      descEn: "Reviews submissions, refines headlines, approves publications, schedules and manages retractions.",
      descBn: "সংবাদ পর্যালোচনা, পরিবর্তন, প্রকাশনা ও প্রত্যাহার",
    },
    {
      id: "journalist",
      titleEn: "Journalist / Correspondent",
      titleBn: "সাংবাদিক / প্রতিবেদক (Journalist)",
      descEn: "Drafts articles, uploads photojournalism assets and submits stories for editorial review.",
      descBn: "খসড়া তৈরি, মিডিয়া আপলোড ও অনুমোদনের জন্য সংবাদ জমা",
    },
    {
      id: "reader",
      titleEn: "Registered Reader",
      titleBn: "পাঠক (Reader)",
      descEn: "Standard authenticated public account: bookmarks, voting in polls and submitting verified comments.",
      descBn: "সাধারণ পাবলিক অ্যাকাউন্ট, বুকমার্ক ও প্রোফাইল",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2 tracking-tight">
          <Shield size={24} className="text-[var(--color-primary)]" />
          <span>{isEn ? "Roles & Permissions Matrix (RBAC)" : "ভূমিকা ও পারমিশন ম্যাট্রিক্স (RBAC)"}</span>
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          {isEn
            ? "Access control, authorization levels and security enforcement policies for each newsroom role"
            : "নিউজ রুমের প্রতিটি ভূমিকার অধিকার ও সার্ভার-সাইড নিরাপত্তা নীতি"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((r) => (
          <div key={r.id} className="border border-[var(--color-border)] p-5 bg-[var(--color-bg)] space-y-2 rounded">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[var(--color-text)]">
                {isEn ? r.titleEn : r.titleBn}
              </h3>
              <span className="font-mono text-[10px] bg-[var(--color-border)] px-1.5 py-0.5 rounded">
                {r.id}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              {isEn ? r.descEn : r.descBn}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
