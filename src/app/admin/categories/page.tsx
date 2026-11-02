import { getCategories, createCategory } from "@/actions/categories";
import { FolderTree, Plus, Trash2, Edit2 } from "lucide-react";
import { safeRevalidateTag } from "@/lib/cache";
import { cookies } from "next/headers";
import { toBengaliDigits } from "@/lib/bengali-date";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const cookieStore = await cookies();
  const isEn = cookieStore.get("admin_lang")?.value !== "bn";
  const formatNum = (n: number | string) => (isEn ? String(n) : toBengaliDigits(n));

  const categoriesList = await getCategories();

  async function handleAddCategory(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const nameEn = formData.get("nameEn") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;

    if (name && slug) {
      await createCategory({
        name,
        nameEn,
        slug,
        description,
        sortOrder: categoriesList.length + 1,
      });
      safeRevalidateTag("categories");
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2 tracking-tight">
          <FolderTree size={24} className="text-[var(--color-primary)]" />
          <span>{isEn ? "Categories & Desks Management" : "বিভাগ ও ক্যাটাগরি ব্যবস্থাপনা"}</span>
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          {isEn
            ? "Manage primary newsroom desks, categories and sub-sections"
            : "সংবাদের প্রধান বিভাগ এবং সাব-ক্যাটাগরি নিয়ন্ত্রণ করুন"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Categories List: 8 Columns */}
        <div className="lg:col-span-8 border border-[var(--color-border)] bg-[var(--color-bg)] rounded overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)] font-bold text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
            {isEn
              ? `Existing Categories (${formatNum(categoriesList.length)})`
              : `বিদ্যমান বিভাগসমূহ (${formatNum(categoriesList.length)}টি)`}
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {categoriesList.map((cat) => (
              <div
                key={cat.id}
                className="p-4 flex items-center justify-between hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text)]">
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)] mt-0.5">
                    <span>
                      {isEn ? "Slug:" : "স্লাগ:"}{" "}
                      <code className="font-mono bg-[var(--color-border)] px-1">{cat.slug}</code>
                    </span>
                    {cat.nameEn && <span>{isEn ? "English:" : "ইংরেজি:"} {cat.nameEn}</span>}
                    <span>{isEn ? "Sort Order:" : "ক্রম:"} {formatNum(cat.sortOrder)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {isEn ? "Active" : "সক্রিয়"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Category Form: 4 Columns */}
        <div className="lg:col-span-4">
          <form action={handleAddCategory} className="border border-[var(--color-border)] p-5 bg-[var(--color-bg)] space-y-4 rounded">
            <h2 className="font-bold text-sm text-[var(--color-text)] border-b border-[var(--color-border)] pb-2 flex items-center gap-1.5">
              <Plus size={16} />
              <span>{isEn ? "Add New Category" : "নতুন বিভাগ যোগ করুন"}</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                {isEn ? "Category Name (Bangla) *" : "বিভাগের নাম (বাংলা) *"}
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder={isEn ? "e.g. পরিবেশ ও জলবায়ু" : "যেমন: পরিবেশ ও জলবায়ু"}
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                {isEn ? "English Name (Optional)" : "ইংরেজি নাম (ঐচ্ছিক)"}
              </label>
              <input
                type="text"
                name="nameEn"
                placeholder="Environment & Climate"
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                {isEn ? "URL Slug *" : "URL Slug *"}
              </label>
              <input
                type="text"
                name="slug"
                required
                placeholder="environment"
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-mono focus:outline-none focus:border-[var(--color-primary)] rounded"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                {isEn ? "Description" : "বিবরণ"}
              </label>
              <textarea
                name="description"
                rows={2}
                placeholder={isEn ? "Category scope and description" : "বিভাগীয় সারসংক্ষেপ"}
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-colors shadow-sm rounded cursor-pointer"
            >
              {isEn ? "Save Category" : "সংরক্ষণ করুন"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
