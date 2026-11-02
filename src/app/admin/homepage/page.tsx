import { db } from "@/db";
import { homepageSections } from "@/db/schema/homepage";
import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Layers, CheckCircle2, XCircle } from "lucide-react";
import { toBengaliDigits } from "@/lib/bengali-date";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Homepage Layout Builder | Admin",
  description: "Configure homepage layout, section ordering and visibility",
};

export default async function AdminHomepageBuilderPage() {
  const cookieStore = await cookies();
  const isEn = cookieStore.get("admin_lang")?.value !== "bn";
  const formatNum = (n: number | string) => (isEn ? String(n) : toBengaliDigits(n));

  let sections: any[] = [];
  try {
    sections = await db
      .select()
      .from(homepageSections)
      .orderBy(asc(homepageSections.sortOrder));
  } catch (error) {
    console.error("Could not query homepage_sections from DB:", error);
  }

  async function toggleSectionActive(formData: FormData) {
    "use server";
    const sectionId = formData.get("sectionId") as string;
    const currentActive = formData.get("currentActive") === "true";

    if (sectionId) {
      await db
        .update(homepageSections)
        .set({ isActive: !currentActive, updatedAt: new Date() })
        .where(eq(homepageSections.id, sectionId));
      revalidatePath("/admin/homepage");
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2 tracking-tight">
          <Layers size={24} className="text-[var(--color-primary)]" />
          <span>{isEn ? "Homepage Layout & Section Builder" : "হোমপেজ লেআউট ও সেকশন বিল্ডার"}</span>
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          {isEn
            ? "Configure live sections, display ordering and visibility across the digital portal homepage"
            : "ডাটাবেজের লাইভ সেকশন রেকর্ড, ক্রম ও সক্রিয়তা নিয়ন্ত্রণ"}
        </p>
      </div>

      <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] font-bold text-xs uppercase tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
          <span>
            {isEn
              ? `Homepage Sections (${formatNum(sections.length)})`
              : `হোমপেজে সক্রিয় সেকশনসমূহ (${formatNum(sections.length)}টি)`}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {isEn ? "Live Database" : "রিয়েল ডাটাবেজ"}
          </span>
        </div>

        {sections.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--color-text-muted)]">
            {isEn ? "No homepage sections found in database." : "ডাটাবেজে কোনো হোমপেজ সেকশন পাওয়া যায়নি।"}
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                className="p-4 flex items-center justify-between hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-[var(--color-text-faint)] w-8">
                    #{formatNum(idx + 1)}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--color-text)]">
                      {isEn && sec.titleEn ? sec.titleEn : sec.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-[var(--color-text-muted)] font-mono">
                        {isEn ? "Type:" : "ধরন:"} {sec.sectionType}
                      </span>
                      {sec.titleEn && !isEn && (
                        <span className="text-[10px] text-[var(--color-text-faint)]">
                          ({sec.titleEn})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <form action={toggleSectionActive}>
                  <input type="hidden" name="sectionId" value={sec.id} />
                  <input type="hidden" name="currentActive" value={sec.isActive ? "true" : "false"} />
                  <button
                    type="submit"
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      sec.isActive
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {sec.isActive ? (
                      <>
                        <CheckCircle2 size={11} />
                        <span>{isEn ? "Active" : "সক্রিয়"}</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={11} />
                        <span>{isEn ? "Inactive" : "নিষ্ক্রিয়"}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
