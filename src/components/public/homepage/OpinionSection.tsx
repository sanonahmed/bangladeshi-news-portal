import Link from "next/link";
import Image from "next/image";

interface ColumnistArticle {
  id: string;
  columnistName: string;
  columnistImage?: string;
  columnistDesignation?: string;
  articleTitle: string;
  slug: string;
}

const DEMO_OPINIONS: ColumnistArticle[] = [
  {
    id: "op-1",
    columnistName: "ড. কামাল উদ্দিন",
    columnistDesignation: "অর্থনীতিবিদ ও গবেষক",
    columnistImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80",
    articleTitle: "অর্থনৈতিক পুনর্গঠনে প্রাতিষ্ঠানিক জবাবদিহিতার গুরুত্ব",
    slug: "institutional-accountability-economic-reforms",
  },
  {
    id: "op-2",
    columnistName: "সুলতানা রহমান",
    columnistDesignation: "আইনজীবী ও অধিকারকর্মী",
    columnistImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80",
    articleTitle: "বিচার বিভাগের স্বাধীনতা ও নাগরিক অধিকার নিশ্চিতকরণ",
    slug: "judicial-independence-civil-rights",
  },
  {
    id: "op-3",
    columnistName: "প্রফেসর রফিকুল আলম",
    columnistDesignation: "শিক্ষাবিদ",
    columnistImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80",
    articleTitle: "শিক্ষাব্যবস্থার আধুনিকায়ন ও চতুর্থ শিল্প বিপ্লবের প্রস্তুতি",
    slug: "modernizing-education-fourth-industrial-revolution",
  },
  {
    id: "op-4",
    columnistName: "তানজিলা আনজুম",
    columnistDesignation: "পরিবেশ গবেষক",
    columnistImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80",
    articleTitle: "নদী দখল ও দূষণমুক্ত করতে সমন্বিত জাতীয় উদ্যোগ জরুরি",
    slug: "river-protection-pollution-control-national-initiative",
  },
];

export function OpinionSection() {
  return (
    <section className="mt-8 border-t-2 border-[var(--color-primary)] pt-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="bengali-headline text-xl md:text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[var(--color-primary)] inline-block"></span>
          মতামত ও সম্পাদকীয়
        </h2>
        <Link
          href="/opinion"
          className="text-xs md:text-sm font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
        >
          সব মতামত &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEMO_OPINIONS.map((item) => (
          <Link
            key={item.id}
            href={`/news/${item.slug}`}
            className="group block border border-[var(--color-border)] p-4 bg-[var(--color-bg)] hover:border-[var(--color-primary)] transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[var(--color-bg-secondary)] flex-shrink-0 border border-[var(--color-border)]">
                {item.columnistImage ? (
                  <Image
                    src={item.columnistImage}
                    alt={item.columnistName}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[var(--color-text-muted)]">
                    লেখক
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="bengali-headline text-sm font-bold text-[var(--color-text)] truncate">
                  {item.columnistName}
                </h4>
                {item.columnistDesignation && (
                  <p className="text-[11px] text-[var(--color-text-muted)] truncate">
                    {item.columnistDesignation}
                  </p>
                )}
              </div>
            </div>
            <h3 className="bengali-serif-headline text-base font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-3 leading-snug">
              &ldquo;{item.articleTitle}&rdquo;
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
