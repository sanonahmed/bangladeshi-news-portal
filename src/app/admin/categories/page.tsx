import { getCategories, createCategory } from "@/actions/categories";
import { FolderTree, Plus, Trash2, Edit2 } from "lucide-react";
import { safeRevalidateTag } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
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
        <h1 className="bengali-headline text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <FolderTree size={24} className="text-[var(--color-primary)]" />
          বিভাগ ও ক্যাটাগরি ব্যবস্থাপনা
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          সংবাদের প্রধান বিভাগ এবং সাব-ক্যাটাগরি নিয়ন্ত্রণ করুন
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Categories List: 8 Columns */}
        <div className="lg:col-span-8 border border-[var(--color-border)] bg-[var(--color-bg)]">
          <div className="p-4 border-b border-[var(--color-border)] font-bold text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
            বিদ্যমান বিভাগসমূহ ({categoriesList.length}টি)
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {categoriesList.map((cat, idx) => (
              <div
                key={cat.id}
                className="p-4 flex items-center justify-between hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                <div>
                  <h3 className="bengali-headline text-sm font-bold text-[var(--color-text)]">
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)] mt-0.5">
                    <span>স্লাগ: <code className="font-mono bg-[var(--color-border)] px-1">{cat.slug}</code></span>
                    {cat.nameEn && <span>ইংরেজি: {cat.nameEn}</span>}
                    <span>ক্রম: {cat.sortOrder}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    সক্রিয়
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Category Form: 4 Columns */}
        <div className="lg:col-span-4">
          <form action={handleAddCategory} className="border border-[var(--color-border)] p-5 bg-[var(--color-bg)] space-y-4">
            <h2 className="font-bold text-sm text-[var(--color-text)] border-b border-[var(--color-border)] pb-2 flex items-center gap-1.5">
              <Plus size={16} />
              নতুন বিভাগ যোগ করুন
            </h2>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                বিভাগের নাম (বাংলা) *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="যেমন: পরিবেশ ও জলবায়ু"
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                ইংরেজি নাম (ঐচ্ছিক)
              </label>
              <input
                type="text"
                name="nameEn"
                placeholder="Environment"
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                name="slug"
                required
                placeholder="environment"
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-mono focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                বিবরণ
              </label>
              <textarea
                name="description"
                rows={2}
                placeholder="বিভাগীয় সারসংক্ষেপ"
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-colors shadow-sm"
            >
              সংরক্ষণ করুন
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
