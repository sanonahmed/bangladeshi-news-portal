import { db } from "@/db";
import { auditLogs } from "@/db/schema/security";
import { user } from "@/db/schema/auth";
import { eq, desc } from "drizzle-orm";
import { ScrollText, ShieldCheck, Clock, User, Globe } from "lucide-react";
import { formatBengaliDateTime, toBengaliDigits } from "@/lib/bengali-date";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "প্রশাসনিক অডিট লগ | দৈনিক বাংলাদেশ বার্তা অ্যাডমিন",
  description: "নিউজ রুমের প্রতিটি সংবেদনশীল পরিবর্তন ও পদক্ষেপের নিরাপত্তা রেকর্ড",
};

export default async function AdminAuditLogsPage() {
  let logs: any[] = [];
  try {
    logs = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        metadata: auditLogs.metadata,
        ipAddress: auditLogs.ipAddress,
        createdAt: auditLogs.createdAt,
        userName: user.name,
        userEmail: user.email,
      })
      .from(auditLogs)
      .leftJoin(user, eq(auditLogs.userId, user.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(50);
  } catch (error) {
    console.error("Could not query audit_logs:", error);
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="bengali-headline text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <ScrollText size={24} className="text-[var(--color-primary)]" />
            প্রশাসনিক অডিট লগ (Audit Logs)
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            নিউজ রুমের প্রতিটি সংবেদনশীল পরিবর্তন, প্রকাশনা ও মুছে ফেলার অপরিবর্তনীয় নিরাপত্তা রেকর্ড
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded flex items-center gap-1.5 self-start sm:self-auto">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>মোট রেকর্ড: {toBengaliDigits(logs.length)}টি</span>
        </span>
      </div>

      <div className="border border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="p-4 border-b border-[var(--color-border)] font-bold text-xs uppercase tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
          <span>লাইভ নিরাপত্তা অডিট রেকর্ডসমূহ</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ডাটাবেজ কানেক্টেড
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="border border-[var(--color-border)] p-12 text-center bg-[var(--color-bg)] space-y-2">
            <ScrollText size={44} className="mx-auto text-[var(--color-text-faint)] mb-2 opacity-50" />
            <h3 className="font-bold text-base text-[var(--color-text)]">
              ডাটাবেজে এখনও কোনো অডিট লগ রেকর্ড হয়নি
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto">
              নিউজ রুমে কোনো সংবেদনশীল প্রশাসনিক পরিবর্তন (যেমন: পোস্ট মুছে ফেলা, ইউজার পারমিশন পরিবর্তন) সংঘটিত হলে তা <code>audit_logs</code> টেবিলে স্বয়ংক্রিয়ভাবে রেকর্ড হয়ে এখানে প্রদর্শিত হবে।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold">
                <tr>
                  <th className="p-3">পদক্ষেপ (Action)</th>
                  <th className="p-3">ব্যবহারকারী</th>
                  <th className="p-3">এনটিটি</th>
                  <th className="p-3">আইপি ঠিকানা</th>
                  <th className="p-3 text-right">তারিখ ও সময়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--color-bg-secondary)]">
                    <td className="p-3 font-mono font-bold text-[var(--color-text)]">
                      {log.action}
                    </td>
                    <td className="p-3 text-[var(--color-text)]">
                      {log.userName || log.userEmail || "সিস্টেম"}
                    </td>
                    <td className="p-3 font-mono text-[var(--color-text-muted)]">
                      {log.entityType}: {log.entityId}
                    </td>
                    <td className="p-3 font-mono text-[var(--color-text-muted)]">
                      {log.ipAddress || "—"}
                    </td>
                    <td className="p-3 text-right text-[var(--color-text-muted)]">
                      {formatBengaliDateTime(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
