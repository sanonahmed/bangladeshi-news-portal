import { ScrollText } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminAuditLogsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="bengali-headline text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <ScrollText size={24} className="text-[var(--color-primary)]" />
          প্রশাসনিক অডিট লগ (Audit Logs)
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          নিউজ রুমের প্রতিটি সংবেদনশীল পরিবর্তন ও পদক্ষেপের অপরিবর্তনীয় নিরাপত্তা রেকর্ড
        </p>
      </div>

      <div className="border border-[var(--color-border)] p-12 text-center bg-[var(--color-bg)]">
        <ScrollText size={44} className="mx-auto text-[var(--color-text-faint)] mb-3" />
        <h3 className="font-bold text-base text-[var(--color-text)]">
          নিরাপত্তা অডিট লগ সক্রিয়
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          সকল প্রকাশনা, অনুমোদন ও মুছে ফেলার ঘটনা ডাটাবেজের <code>audit_logs</code> টেবিলে রেকর্ড করা হচ্ছে।
        </p>
      </div>
    </div>
  );
}
