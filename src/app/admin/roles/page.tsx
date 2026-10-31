import { Shield } from "lucide-react";
import { PERMISSIONS } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default function AdminRolesPage() {
  const roles = [
    {
      id: "super_admin",
      title: "সুপার অ্যাডমিন (Super Admin)",
      desc: "সিস্টেমের পূর্ণ নিয়ন্ত্রণ, সেটিংস, ব্যবহারকারী পরিচালনা ও অনুমোদন",
    },
    {
      id: "admin",
      title: "অ্যাডমিন (Admin)",
      desc: "নিউজ রুম কনটেন্ট, বিভাগ ও সাংবাদিকীয় কার্যক্রম পরিচালনা",
    },
    {
      id: "editor",
      title: "সম্পাদক (Editor)",
      desc: "সংবাদ পর্যালোচনা, পরিবর্তন, প্রকাশনা ও প্রত্যাহার",
    },
    {
      id: "journalist",
      title: "সাংবাদিক / প্রতিবেদক (Journalist)",
      desc: "খসড়া তৈরি, মিডিয়া আপলোড ও অনুমোদনের জন্য সংবাদ জমা",
    },
    {
      id: "reader",
      title: "পাঠক (Reader)",
      desc: "সাধারণ পাবলিক অ্যাকাউন্ট, বুকমার্ক ও প্রোফাইল",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="bengali-headline text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <Shield size={24} className="text-[var(--color-primary)]" />
          ভূমিকা ও পারমিশন ম্যাট্রিক্স (RBAC)
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          নিউজ রুমের প্রতিটি ভূমিকার অধিকার ও সার্ভার-সাইড নিরাপত্তা নীতি
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((r) => (
          <div key={r.id} className="border border-[var(--color-border)] p-5 bg-[var(--color-bg)] space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[var(--color-text)]">{r.title}</h3>
              <span className="font-mono text-[10px] bg-[var(--color-border)] px-1.5 py-0.5 rounded">
                {r.id}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
