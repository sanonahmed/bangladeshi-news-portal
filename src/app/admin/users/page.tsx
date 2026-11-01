import { db } from "@/db";
import { user, authorProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Users, Shield, Plus, ExternalLink, Award, MapPin } from "lucide-react";
import { formatBengaliDateTime } from "@/lib/bengali-date";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  let userList: any[] = [];
  try {
    userList = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        banned: user.banned,
        slug: authorProfiles.slug,
        designation: authorProfiles.designation,
        bureau: authorProfiles.bureau,
        isBureauChief: authorProfiles.isBureauChief,
      })
      .from(user)
      .leftJoin(authorProfiles, eq(user.id, authorProfiles.userId))
      .orderBy(user.createdAt);
  } catch (error) {
    console.warn("Could not query users:", error);
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="bengali-headline text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <Users size={24} className="text-[var(--color-primary)]" />
            ব্যবহারকারী ও সাংবাদিক দল
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            নিউজ রুমের সদস্য, ব্যুরো প্রধান, বিশেষ প্রতিবেদক ও প্রশাসনিক কর্মী
          </p>
        </div>

        <Link
          href="/authors"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[var(--color-primary)] text-white px-3.5 py-2 hover:bg-[var(--color-primary)]/90 transition-colors"
        >
          <span>পাবলিক সাংবাদিক ডিরেক্টরি</span>
          <ExternalLink size={14} />
        </Link>
      </div>

      <div className="border border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold">
              <tr>
                <th className="p-3">নাম</th>
                <th className="p-3">পদবী ও ব্যুরো</th>
                <th className="p-3">ইমেইল</th>
                <th className="p-3">ভূমিকা (Role)</th>
                <th className="p-3">প্রোফাইল লিংক</th>
                <th className="p-3">নিবন্ধন তারিখ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {userList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--color-text-muted)]">
                    কোনো ব্যবহারকারী পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                userList.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--color-bg-secondary)]">
                    <td className="p-3">
                      <div className="font-bold text-[var(--color-text)]">{u.name}</div>
                      {u.isBureauChief && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.2 rounded mt-0.5">
                          <Award className="w-2.5 h-2.5" />
                          <span>ব্যুরো প্রধান</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-[var(--color-text-muted)]">
                      {u.designation ? (
                        <div>
                          <div className="font-medium text-[var(--color-text)]">{u.designation}</div>
                          {u.bureau && (
                            <div className="text-[10px] text-red-500 flex items-center gap-0.5">
                              <MapPin size={10} />
                              <span>{u.bureau}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[var(--color-text-faint)]">-</span>
                      )}
                    </td>
                    <td className="p-3 text-[var(--color-text-muted)]">{u.email}</td>
                    <td className="p-3">
                      <span className="font-mono bg-[var(--color-border)] px-1.5 py-0.5 rounded text-[11px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      {u.slug ? (
                        <Link
                          href={`/author/${u.slug}`}
                          target="_blank"
                          className="text-[var(--color-primary)] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>বায়ো পেজ</span>
                          <ExternalLink size={12} />
                        </Link>
                      ) : (
                        <span className="text-[var(--color-text-faint)]">প্রোফাইল নেই</span>
                      )}
                    </td>
                    <td className="p-3 text-[var(--color-text-muted)]">
                      {formatBengaliDateTime(u.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
