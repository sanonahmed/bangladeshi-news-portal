import { getBreakingNews, createBreakingNews, deleteBreakingNews, toggleBreakingNews } from "@/actions/breaking-news";
import { Zap, Plus, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { safeRevalidateTag } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function AdminBreakingNewsPage() {
  const items = await getBreakingNews();

  async function handleAddBreakingNews(formData: FormData) {
    "use server";
    const headline = formData.get("headline") as string;
    const url = (formData.get("url") as string) || "#";
    const priority = parseInt((formData.get("priority") as string) || "5", 10);

    if (headline) {
      await createBreakingNews(
        {
          headline,
          url,
          isExternal: false,
          priority,
        },
        "admin-user"
      );
      safeRevalidateTag("breaking-news");
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="bengali-headline text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <Zap size={24} className="text-[var(--color-primary)]" />
          ব্রেকিং নিউজ ব্যবস্থাপনা
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          ওয়েবসাইটের শীর্ষ লাল টিকারে প্রদর্শিত জরুরি খবরের তালিকা ও অগ্রাধিকার
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Current Breaking Headlines: 8 Columns */}
        <div className="lg:col-span-8 border border-[var(--color-border)] bg-[var(--color-bg)]">
          <div className="p-4 border-b border-[var(--color-border)] font-bold text-xs uppercase tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
            <span>সক্রিয় ব্রেকিং নিউজ ({items.length}টি)</span>
            <span className="text-[10px] text-[var(--color-primary)]">অগ্রাধিকার অনুযায়ী সাজানো</span>
          </div>

          {items.length === 0 ? (
            <div className="p-12 text-center text-xs text-[var(--color-text-muted)]">
              বর্তমানে কোনো ব্রেকিং নিউজ সক্রিয় নেই।
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between hover:bg-[var(--color-bg-secondary)] transition-colors gap-4"
                >
                  <div className="space-y-1">
                    <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                      অগ্রাধিকার: {item.priority}
                    </span>
                    <h3 className="bengali-serif-headline text-sm font-bold text-[var(--color-text)] leading-snug">
                      {item.headline}
                    </h3>
                    <p className="text-[11px] text-[var(--color-text-muted)] truncate max-w-md font-mono">
                      লিঙ্ক: {item.url}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Breaking News: 4 Columns */}
        <div className="lg:col-span-4">
          <form action={handleAddBreakingNews} className="border border-[var(--color-border)] p-5 bg-[var(--color-bg)] space-y-4">
            <h2 className="font-bold text-sm text-[var(--color-text)] border-b border-[var(--color-border)] pb-2 flex items-center gap-1.5">
              <Plus size={16} />
              নতুন ব্রেকিং যোগ করুন
            </h2>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                ব্রেকিং শিরোনাম (বাংলা) *
              </label>
              <textarea
                name="headline"
                required
                rows={3}
                placeholder="যেমন: বঙ্গোপসাগরে ৩ নম্বর দূরবর্তী সতর্ক সংকেত জারি"
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                সংবাদের লিঙ্ক (URL)
              </label>
              <input
                type="text"
                name="url"
                defaultValue="/"
                placeholder="/news/cyclone-warning"
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                অগ্রাধিকার ক্রম (১ থেকে ১০)
              </label>
              <input
                type="number"
                name="priority"
                defaultValue={10}
                min={1}
                max={10}
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-colors shadow-sm"
            >
              টিকার-এ প্রকাশ করুন
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
