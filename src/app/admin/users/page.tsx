import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { Users, Shield, Plus } from "lucide-react";
import { formatBengaliDateTime } from "@/lib/bengali-date";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  let userList: any[] = [];
  try {
    userList = await db.select().from(user);
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
            নিউজ রুমের সদস্য, সাংবাদিক, সহ-সম্পাদক ও প্রশাসনিক কর্মী
          </p>
        </div>
      </div>

      <div className="border border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold">
              <tr>
                <th className="p-3">নাম</th>
                <th className="p-3">ইমেইল</th>
                <th className="p-3">ভূমিকা (Role)</th>
                <th className="p-3">নিবন্ধন তারিখ</th>
                <th className="p-3">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {userList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--color-text-muted)]">
                    কোনো ব্যবহারকারী পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                userList.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--color-bg-secondary)]">
                    <td className="p-3 font-bold text-[var(--color-text)]">{u.name}</td>
                    <td className="p-3 text-[var(--color-text-muted)]">{u.email}</td>
                    <td className="p-3">
                      <span className="font-mono bg-[var(--color-border)] px-1.5 py-0.5 rounded text-[11px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-[var(--color-text-muted)]">
                      {formatBengaliDateTime(u.createdAt)}
                    </td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        সক্রিয়
                      </span>
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
