import { db } from "@/db";
import { auditLogs } from "@/db/schema/security";
import { user } from "@/db/schema/auth";
import { eq, desc } from "drizzle-orm";
import { ScrollText, ShieldCheck, Clock, User, Globe } from "lucide-react";
import { formatBengaliDateTime, toBengaliDigits } from "@/lib/bengali-date";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Audit Logs | Admin",
  description: "Immutable administrative and security audit trail",
};

export default async function AdminAuditLogsPage() {
  const cookieStore = await cookies();
  const isEn = cookieStore.get("admin_lang")?.value !== "bn";
  const formatNum = (n: number | string) => (isEn ? String(n) : toBengaliDigits(n));
  const formatDateTime = (d: Date | null) => {
    if (!d) return "";
    return isEn
      ? d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : formatBengaliDateTime(d);
  };

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
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2 tracking-tight">
            <ScrollText size={24} className="text-[var(--color-primary)]" />
            <span>{isEn ? "Administrative Security Audit Logs" : "প্রশাসনিক অডিট লগ (Audit Logs)"}</span>
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {isEn
              ? "Immutable security audit records tracking sensitive actions, publications and role updates"
              : "নিউজ রুমের প্রতিটি সংবেদনশীল পরিবর্তন, প্রকাশনা ও মুছে ফেলার অপরিবর্তনীয় নিরাপত্তা রেকর্ড"}
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded flex items-center gap-1.5 self-start sm:self-auto">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>{isEn ? `Total Records: ${formatNum(logs.length)}` : `মোট রেকর্ড: ${formatNum(logs.length)}টি`}</span>
        </span>
      </div>

      <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] font-bold text-xs uppercase tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
          <span>{isEn ? "Live Security Audit Trail" : "লাইভ নিরাপত্তা অডিট রেকর্ডসমূহ"}</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {isEn ? "PostgreSQL Connected" : "ডাটাবেজ কানেক্টেড"}
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="border border-[var(--color-border)] p-12 text-center bg-[var(--color-bg)] space-y-2">
            <ScrollText size={44} className="mx-auto text-[var(--color-text-faint)] mb-2 opacity-50" />
            <h3 className="font-bold text-base text-[var(--color-text)]">
              {isEn ? "No audit log entries recorded in database yet" : "ডাটাবেজে এখনও কোনো অডিট লগ রেকর্ড হয়নি"}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto">
              {isEn
                ? "When sensitive administrative changes (such as article deletions or permission modifications) take place, they will automatically be recorded in the audit_logs table."
                : "নিউজ রুমে কোনো সংবেদনশীল প্রশাসনিক পরিবর্তন (যেমন: পোস্ট মুছে ফেলা, ইউজার পারমিশন পরিবর্তন) সংঘটিত হলে তা audit_logs টেবিলে স্বয়ংক্রিয়ভাবে রেকর্ড হয়ে এখানে প্রদর্শিত হবে।"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold">
                <tr>
                  <th className="p-3">{isEn ? "Action" : "পদক্ষেপ (Action)"}</th>
                  <th className="p-3">{isEn ? "User / Staff" : "ব্যবহারকারী"}</th>
                  <th className="p-3">{isEn ? "Entity Target" : "এনটিটি"}</th>
                  <th className="p-3">{isEn ? "IP Address" : "আইপি ঠিকানা"}</th>
                  <th className="p-3 text-right">{isEn ? "Timestamp" : "তারিখ ও সময়"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--color-bg-secondary)]">
                    <td className="p-3 font-mono font-bold text-[var(--color-text)]">
                      {log.action}
                    </td>
                    <td className="p-3 text-[var(--color-text)]">
                      {log.userName || log.userEmail || (isEn ? "System" : "সিস্টেম")}
                    </td>
                    <td className="p-3 font-mono text-[var(--color-text-muted)]">
                      {log.entityType}: {log.entityId}
                    </td>
                    <td className="p-3 font-mono text-[var(--color-text-muted)]">
                      {log.ipAddress || "—"}
                    </td>
                    <td className="p-3 text-right text-[var(--color-text-muted)]">
                      {formatDateTime(log.createdAt)}
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
