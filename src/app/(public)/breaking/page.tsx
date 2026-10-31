import type { Metadata } from "next";
import Link from "next/link";
import { getBreakingNews } from "@/actions/breaking-news";
import { AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "ব্রেকিং নিউজ আর্কাইভ | বাংলা নিউজ",
  description: "জরুরি ও তাৎক্ষণিক ব্রেকিং সংবাদসমূহের তালিকা।",
};

export default async function BreakingPage() {
  const items = await getBreakingNews();

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-8">
      <div className="border-b-2 border-[var(--color-primary)] pb-3 mb-6 flex items-center justify-between">
        <h1 className="bengali-headline text-2xl md:text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-2">
          <AlertCircle size={28} className="text-[var(--color-primary)]" />
          ব্রেকিং নিউজ আর্কাইভ
        </h1>
        <Link href="/" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
          &larr; প্রচ্ছদে ফিরুন
        </Link>
      </div>

      <div className="divide-y divide-[var(--color-border)] border border-[var(--color-border)] bg-[var(--color-bg)]">
        {items.map((item) => (
          <div key={item.id} className="p-4 flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] mt-2 flex-shrink-0" />
            <div className="flex-1">
              <Link
                href={item.url}
                className="bengali-serif-headline text-lg font-bold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors leading-snug"
              >
                {item.headline}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
