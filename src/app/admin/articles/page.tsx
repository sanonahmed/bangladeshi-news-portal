import { db } from "@/db";
import { articles, articleCategories } from "@/db/schema/articles";
import { categories } from "@/db/schema/categories";
import { user } from "@/db/schema/auth";
import { eq, desc, and, count, ilike, or } from "drizzle-orm";
import { deleteArticle, checkAndPublishScheduledArticles } from "@/actions/articles";
import { revalidatePath } from "next/cache";
import { AdminArticlesClient } from "./AdminArticlesClient";

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
          scheduledAt: articles.scheduledAt,
          createdAt: articles.createdAt,
          authorName: user.name,
          categoryName: categories.name,
          headlineB: articles.headlineB,
          abTestStatus: articles.abTestStatus,
          abTestImpressionsA: articles.abTestImpressionsA,
          abTestImpressionsB: articles.abTestImpressionsB,
          abTestClicksA: articles.abTestClicksA,
          abTestClicksB: articles.abTestClicksB,
          focusKeyword: articles.focusKeyword,
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
    console.error("Could not query admin articles table:", error);
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

  async function handleProcessScheduled() {
    "use server";
    await checkAndPublishScheduledArticles();
    revalidatePath("/admin/articles");
  }

  return (
    <AdminArticlesClient
      articleList={articleList}
      totalCount={totalCount}
      totalPages={totalPages}
      currentPage={currentPage}
      q={q}
      status={status}
      handleDelete={handleDelete}
      handleProcessScheduled={handleProcessScheduled}
    />
  );
}
