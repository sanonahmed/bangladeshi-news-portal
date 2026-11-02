import { db } from "@/db";
import { articles } from "@/db/schema/articles";
import { user } from "@/db/schema/auth";
import { articleCategories } from "@/db/schema/articles";
import { categories } from "@/db/schema/categories";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { CheckSquare, ExternalLink, Clock, CheckCircle2, RotateCcw } from "lucide-react";
import { formatBengaliDateTime, toBengaliDigits } from "@/lib/bengali-date";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "সম্পাদকীয় পর্যালোচনা ও অনুমোদন কিউ | দৈনিক বাংলাদেশ বার্তা অ্যাডমিন",
  description: "সাংবাদিকদের প্রেরিত খসড়া সংবাদ প্রকাশের পূর্বে সম্পাদনা ও অনুমোদন করুন",
};

export default async function AdminReviewsPage() {
  let pendingArticles: any[] = [];
  try {
    pendingArticles = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        status: articles.status,
        createdAt: articles.createdAt,
        authorName: user.name,
        categoryName: categories.name,
      })
      .from(articles)
      .leftJoin(user, eq(articles.authorId, user.id))
      .leftJoin(articleCategories, eq(articles.id, articleCategories.articleId))
      .leftJoin(categories, eq(articleCategories.categoryId, categories.id))
      .where(eq(articles.status, "pending_review"))
      .orderBy(desc(articles.createdAt));
  } catch (error) {
    console.error("Could not query pending articles:", error);
  }

  async function handleApprove(formData: FormData) {
    "use server";
    const articleId = formData.get("articleId") as string;
    if (articleId) {
      await db
        .update(articles)
        .set({
          status: "published",
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(articles.id, articleId));
      revalidatePath("/admin/reviews");
      revalidatePath("/admin/articles");
      revalidatePath("/");
    }
  }

  async function handleRejectToDraft(formData: FormData) {
    "use server";
    const articleId = formData.get("articleId") as string;
    if (articleId) {
      await db
        .update(articles)
        .set({
          status: "draft",
          updatedAt: new Date(),
        })
        .where(eq(articles.id, articleId));
      revalidatePath("/admin/reviews");
      revalidatePath("/admin/articles");
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="bengali-headline text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <CheckSquare size={24} className="text-[var(--color-primary)]" />
            সম্পাদকীয় পর্যালোচনা ও অনুমোদন কিউ
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            সাংবাদিকদের প্রেরিত খসড়া সংবাদ প্রকাশের পূর্বে সম্পাদনা, গুণগত মান যাচাই ও অনুমোদন
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded">
          অপেক্ষমান: {toBengaliDigits(pendingArticles.length)}টি সংবাদ
        </span>
      </div>

      <div className="border border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="p-4 border-b border-[var(--color-border)] font-bold text-xs uppercase tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
          <span>পর্যালোচনার কিউ তালিকা</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            লাইভ ডাটাবেজ
          </span>
        </div>

        {pendingArticles.length === 0 ? (
          <div className="p-12 text-center bg-[var(--color-bg)]">
            <CheckSquare size={44} className="mx-auto text-emerald-600 mb-3 opacity-60" />
            <h3 className="font-bold text-base text-[var(--color-text)]">
              বর্তমানে পর্যালোচনার অপেক্ষায় কোনো সংবাদ নেই
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-md mx-auto">
              সাংবাদিক বা লেখকরা নতুন কোনো সংবাদ পর্যালোচনার জন্য জমা দিলে এখানে সরাসরি অনুমোদনের জন্য প্রদর্শিত হবে।
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {pendingArticles.map((art) => (
              <div key={art.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--color-bg-secondary)] transition-colors">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-[var(--color-text)]">
                    {art.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-muted)]">
                    <span>বিভাগ: <b className="text-[var(--color-text)]">{art.categoryName || "জাতীয়"}</b></span>
                    <span>লেখক: <b className="text-[var(--color-text)]">{art.authorName || "নিজস্ব প্রতিবেদক"}</b></span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatBengaliDateTime(art.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link
                    href={`/admin/articles/${art.id}/edit`}
                    className="px-3 py-1.5 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-xs font-semibold text-[var(--color-text)] rounded transition-colors"
                  >
                    সম্পাদনা
                  </Link>

                  <form action={handleRejectToDraft}>
                    <input type="hidden" name="articleId" value={art.id} />
                    <button
                      type="submit"
                      className="px-3 py-1.5 border border-amber-300 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-xs font-semibold rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>খসড়ায় ফেরত</span>
                    </button>
                  </form>

                  <form action={handleApprove}>
                    <input type="hidden" name="articleId" value={art.id} />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 size={13} />
                      <span>প্রকাশ অনুমোদন</span>
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
