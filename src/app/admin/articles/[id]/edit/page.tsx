import { db } from "@/db";
import { articles } from "@/db/schema/articles";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { notFound } from "next/navigation";
import { revalidateArticle } from "@/lib/cache";

export const dynamic = "force-dynamic";

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;

  let article = null;
  try {
    const [row] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
    article = row;
  } catch (error) {
    console.warn("Could not query article for edit:", error);
  }

  if (!article) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/articles"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-primary)] font-semibold"
        >
          <ArrowLeft size={14} /> সকল সংবাদে ফিরে যান
        </Link>
        <div className="p-8 border border-[var(--color-border)] bg-[var(--color-bg)] text-center text-xs text-[var(--color-text-muted)]">
          সংবাদটি পাওয়া যায়নি বা ইতিমধ্যে অপসারিত হয়েছে।
        </div>
      </div>
    );
  }

  async function handleUpdate(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const excerpt = formData.get("excerpt") as string;
    const correctionNote = formData.get("correctionNote") as string;

    await db
      .update(articles)
      .set({
        title,
        excerpt,
        correctionNote: correctionNote || undefined,
        correctionAt: correctionNote ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, id));

    revalidateArticle(article!.slug);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="p-1.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="bengali-headline text-xl font-bold text-[var(--color-text)]">
              সংবাদ সম্পাদনা
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              স্লাগ: <code className="font-mono">{article.slug}</code>
            </p>
          </div>
        </div>
      </div>

      <form action={handleUpdate} className="border border-[var(--color-border)] p-6 bg-[var(--color-bg)] space-y-4">
        <div>
          <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
            শিরোনাম (বাংলা) *
          </label>
          <input
            type="text"
            name="title"
            defaultValue={article.title}
            required
            className="w-full p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm font-bold focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
            সারসংক্ষেপ
          </label>
          <textarea
            name="excerpt"
            defaultValue={article.excerpt ?? ""}
            rows={3}
            className="w-full p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
            সংশোধনী বিজ্ঞপ্তি (Correction Note)
          </label>
          <input
            type="text"
            name="correctionNote"
            defaultValue={article.correctionNote ?? ""}
            placeholder="পূর্ববর্তী তথ্যের কোনো অসঙ্গতি সংশোধন করা হলে তা এখানে লিখুন"
            className="w-full p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
          />
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
            সংশোধনী যুক্ত করলে সংবাদ পৃষ্ঠায় সময়সহ একটি স্বচ্ছ নোটিশ প্রদর্শিত হবে।
          </p>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Save size={14} />
          পরিবর্তন সংরক্ষণ করুন
        </button>
      </form>
    </div>
  );
}
