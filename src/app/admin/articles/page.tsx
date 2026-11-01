import Link from "next/link";
import { db } from "@/db";
import { articles, articleCategories } from "@/db/schema/articles";
import { categories } from "@/db/schema/categories";
import { user } from "@/db/schema/auth";
import { eq, desc, and, count, ilike, or } from "drizzle-orm";
import { PlusCircle, Search, Filter, ExternalLink, Edit } from "lucide-react";
import { formatBengaliDateTime } from "@/lib/bengali-date";
import { deleteArticle } from "@/actions/articles";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

interface ArticlesPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminArticlesPage({ searchParams }: ArticlesPageProps) {
  const { q, status, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const pageSize = 15;
  const offset = (currentPage - 1) * pageSize;

  let articleList: any[] = [];
  let totalCount = 0;

  try {
    const conditions = [];
    if (status && status !== "all") {
      conditions.push(eq(articles.status, status as any));
    }
    if (q) {
      conditions.push(
        or(ilike(articles.title, `%${q}%`), ilike(articles.slug, `%${q}%`))
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalResult] = await Promise.all([
      db
        .select({
          id: articles.id,
          title: articles.title,
          slug: articles.slug,
          status: articles.status,
          publishedAt: articles.publishedAt,
          createdAt: articles.createdAt,
          authorName: user.name,
          categoryName: categories.name,
        })
        .from(articles)
        .leftJoin(user, eq(articles.authorId, user.id))
        .leftJoin(articleCategories, eq(articles.id, articleCategories.articleId))
        .leftJoin(categories, eq(articleCategories.categoryId, categories.id))
        .where(whereClause)
        .orderBy(desc(articles.createdAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: count() }).from(articles).where(whereClause),
    ]);

    articleList = rows;
    totalCount = Number(totalResult[0]?.count ?? 0);
  } catch (error) {
    console.warn("Could not query admin articles table, using fallback demo articles:", error);
  }

  if (articleList.length === 0) {
    articleList = [
      {
        id: "demo-art-1",
        title: "অর্থনৈতিক স্থিতিশীলতা ফিরিয়ে আনতে ১০ দফা রূপরেখা ঘোষণা সরকারের",
        slug: "economic-stability-ten-point-roadmap",
        status: "published",
        publishedAt: new Date(Date.now() - 1000 * 60 * 120),
        createdAt: new Date(Date.now() - 1000 * 60 * 240),
        authorName: "প্রধান বার্তা সম্পাদক",
        categoryName: "জাতীয়",
      },
      {
        id: "demo-art-2",
        title: "মিরপুরে দ্বিতীয় টেস্টের তৃতীয় দিনে ব্যাটিং বিপর্যয়ে সফরকারীরা",
        slug: "mirpur-test-day-three-bangladesh",
        status: "published",
        publishedAt: new Date(Date.now() - 1000 * 60 * 300),
        createdAt: new Date(Date.now() - 1000 * 60 * 360),
        authorName: "তানভীর হাসান",
        categoryName: "খেলাধুলা",
      },
      {
        id: "demo-art-3",
        title: "কৃত্রিম বুদ্ধিমত্তা ব্যবহারে নতুন জাতীয় দিকনির্দেশনা চূড়ান্ত করল তথ্যপ্রযুক্তি বিভাগ",
        slug: "national-ai-policy-guidelines-finalized",
        status: "pending_review",
        publishedAt: null,
        createdAt: new Date(Date.now() - 1000 * 60 * 45),
        authorName: "কায়সার মাহমুদ",
        categoryName: "প্রযুক্তি",
      },
      {
        id: "demo-art-4",
        title: "চট্টগ্রাম বন্দরে কনটেইনার জট নিরসনে নতুন ডিজিটাল অটোমেশন চালুর নির্দেশ",
        slug: "chattogram-port-digital-automation",
        status: "draft",
        publishedAt: null,
        createdAt: new Date(Date.now() - 1000 * 60 * 15),
        authorName: "ফারহানা হক",
        categoryName: "বাণিজ্য",
      },
    ];
    totalCount = articleList.length;
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  async function handleDelete(formData: FormData) {
    "use server";
    const articleId = formData.get("articleId") as string;
    if (articleId) {
      await deleteArticle(articleId);
      revalidatePath("/admin/articles");
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="bengali-headline text-2xl font-bold text-[var(--color-text)]">
            সংবাদ ও প্রতিবেদন ব্যবস্থাপনা
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            সকল খসড়া, পর্যালোচনার অপেক্ষায় থাকা ও প্রকাশিত সংবাদের তালিকা
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-colors shadow-sm"
        >
          <PlusCircle size={16} />
          নতুন সংবাদ তৈরি করুন
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <form method="GET" action="/admin/articles" className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="শিরোনাম বা স্লাগ লিখে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-[var(--color-text-muted)]" />
        </div>
        <select
          name="status"
          defaultValue={status ?? "all"}
          className="p-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
        >
          <option value="all">সকল অবস্থা (All Status)</option>
          <option value="published">প্রকাশিত (Published)</option>
          <option value="draft">খসড়া (Draft)</option>
          <option value="pending_review">পর্যালোচনাধীন (Pending Review)</option>
          <option value="archived">আর্কাইভকৃত (Archived)</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-zinc-800 text-white text-xs font-semibold hover:bg-zinc-700 transition-colors"
        >
          ফিল্টার করুন
        </button>
      </form>

      {/* Articles Table */}
      <div className="border border-[var(--color-border)] bg-[var(--color-bg)]">
        {articleList.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--color-text-muted)]">
            কোনো সংবাদ পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold">
                <tr>
                  <th className="p-3">শিরোনাম</th>
                  <th className="p-3">বিভাগ</th>
                  <th className="p-3">লেখক</th>
                  <th className="p-3">অবস্থা</th>
                  <th className="p-3">তারিখ</th>
                  <th className="p-3 text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {articleList.map((art) => (
                  <tr key={art.id} className="hover:bg-[var(--color-bg-secondary)]">
                    <td className="p-3 font-semibold text-[var(--color-text)] max-w-xs truncate">
                      {art.title}
                    </td>
                    <td className="p-3 text-[var(--color-text-muted)]">
                      {art.categoryName ?? "—"}
                    </td>
                    <td className="p-3 text-[var(--color-text-muted)]">
                      {art.authorName ?? "—"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          art.status === "published"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : art.status === "draft"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        }`}
                      >
                        {art.status}
                      </span>
                    </td>
                    <td className="p-3 text-[var(--color-text-muted)]">
                      {formatBengaliDateTime(art.publishedAt ?? art.createdAt)}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <Link
                        href={`/admin/articles/${art.id}/edit`}
                        className="text-[var(--color-primary)] hover:underline font-semibold"
                      >
                        সম্পাদনা
                      </Link>
                      {art.status === "published" && (
                        <Link
                          href={`/news/${art.slug}`}
                          target="_blank"
                          className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                          title="সংবাদটি দেখুন"
                        >
                          <ExternalLink size={12} className="inline ml-1" />
                        </Link>
                      )}
                      {!art.id.startsWith("demo-") && (
                        <form action={handleDelete} className="inline ml-2">
                          <input type="hidden" name="articleId" value={art.id} />
                          <button
                            type="submit"
                            className="text-red-600 hover:text-red-800 hover:underline cursor-pointer font-semibold ml-1"
                          >
                            মুছুন
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] pt-2">
          <span>মোট {totalCount} টি সংবাদ</span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={`/admin/articles?page=${currentPage - 1}${q ? `&q=${q}` : ""}${status ? `&status=${status}` : ""}`}
                className="px-3 py-1 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
              >
                &larr; পূর্ববর্তী
              </Link>
            )}
            <span className="px-2 py-1">পাতা {currentPage} / {totalPages}</span>
            {currentPage < totalPages && (
              <Link
                href={`/admin/articles?page=${currentPage + 1}${q ? `&q=${q}` : ""}${status ? `&status=${status}` : ""}`}
                className="px-3 py-1 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
              >
                পরবর্তী &rarr;
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
