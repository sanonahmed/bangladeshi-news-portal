import { getNavigation } from "@/actions/navigation";
import { Compass, Plus } from "lucide-react";
import { cookies } from "next/headers";
import { toBengaliDigits } from "@/lib/bengali-date";
import { checkRoleAccess } from "@/lib/admin-guard";
import { AccessDeniedNotice } from "@/components/admin/AccessDeniedNotice";

export const dynamic = "force-dynamic";

export default async function AdminNavigationPage() {
  const { granted, currentUser } = await checkRoleAccess("admin");
  if (!granted) {
    return (
      <AccessDeniedNotice
        requiredRole="admin"
        currentRole={currentUser?.role}
        pageTitleBn="নেভিগেশন ও মেনু ব্যবস্থাপনা"
        pageTitleEn="Navigation & Menu Management"
      />
    );
  }

  const cookieStore = await cookies();
  const isEn = cookieStore.get("admin_lang")?.value !== "bn";
  const formatNum = (n: number | string) => (isEn ? String(n) : toBengaliDigits(n));

  const items = await getNavigation();

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2 tracking-tight">
          <Compass size={24} className="text-[var(--color-primary)]" />
          <span>{isEn ? "Navigation & Menu Management" : "নেভিগেশন ও মেনু ব্যবস্থাপনা"}</span>
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          {isEn
            ? "Configure main header navigation bar links, ordering and desktop/mobile menu structure"
            : "প্রধান হেডার নেভিগেশন বার ও সাব-মেনুর লিংক নিয়ন্ত্রণ করুন"}
        </p>
      </div>

      <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] font-bold text-xs uppercase tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
          <span>
            {isEn
              ? `Active Navigation Items (${formatNum(items.length)})`
              : `সক্রিয় নেভিগেশন আইটেম (${formatNum(items.length)}টি)`}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {isEn ? "Live Portal Menu" : "লাইভ পোর্টাল মেনু"}
          </span>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {items.map((item) => (
            <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-[var(--color-bg-secondary)]">
              <div>
                <span className="font-bold text-sm text-[var(--color-text)] mr-2">{item.label}</span>
                <span className="text-xs font-mono text-[var(--color-text-muted)]">{item.href}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {isEn ? `Active (Order: ${formatNum(item.sortOrder)})` : `সক্রিয় (ক্রম: ${formatNum(item.sortOrder)})`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
