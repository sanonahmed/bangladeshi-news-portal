import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAuthorBySlug, getAuthorArticles } from "@/actions/authors";
import { formatRelativeBengali } from "@/lib/bengali-date";
import {
  User,
  MapPin,
  Newspaper,
  ChevronRight,
  Mail,
  Phone,
  Award,
  Building2,
  Calendar,
  Share2,
} from "lucide-react";
import { FacebookIcon, TwitterXIcon, LinkedinIcon } from "@/components/ui/icons";

export const revalidate = 60;

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);

  if (!author) {
    return { title: "প্রতিবেদক পাওয়া যায়নি | দৈনিক বাংলাদেশ বার্তা" };
  }

  return {
    title: `${author.nameBangla} - ${author.designation} | দৈনিক বাংলাদেশ বার্তা`,
    description: author.bio || `${author.nameBangla} এর প্রকাশিত প্রতিবেদন, নিবন্ধ ও বিশ্লেষণ।`,
  };
}

export default async function AuthorProfilePage({ params, searchParams }: AuthorPageProps) {
  const { slug } = await params;
  const sParams = await searchParams;
  const currentPage = Number(sParams?.page) || 1;

  const author = await getAuthorBySlug(slug);
  if (!author) {
    notFound();
  }

  const articlesResult = await getAuthorArticles(slug, { page: currentPage, pageSize: 12 });

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-8">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] pb-3">
        <Link href="/" className="hover:text-[var(--color-primary)]">প্রচ্ছদ</Link>
        <span>/</span>
        <Link href="/authors" className="hover:text-[var(--color-primary)]">সাংবাদিক ও বার্তা দল</Link>
        <span>/</span>
        <span className="text-[var(--color-text)] font-semibold">{author.nameBangla}</span>
      </div>

      {/* Hero Author Profile Card */}
      <div className="border border-[var(--color-border)] bg-[var(--color-bg)] p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
          {/* Avatar */}
          <div className="relative w-28 h-28 md:w-36 md:h-36 shrink-0 rounded-full overflow-hidden border-4 border-[var(--color-primary)] shadow-md bg-[var(--color-bg-secondary)]">
            {author.avatarUrl ? (
              <Image
                src={author.avatarUrl}
                alt={author.nameBangla}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 112px, 144px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--color-text-faint)]">
                <User className="w-16 h-16" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {author.isBureauChief && (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-500 text-white px-2.5 py-0.5 rounded shadow-sm">
                  <Award className="w-3 h-3" />
                  <span>ব্যুরো প্রধান</span>
                </span>
              )}
              <span className="text-xs font-semibold bg-[var(--color-bg-secondary)] text-[var(--color-primary)] px-2.5 py-0.5 border border-red-200 dark:border-red-900/40">
                {author.department}
              </span>
              {author.bureau && (
                <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 font-medium bg-[var(--color-bg-secondary)] px-2 py-0.5 border border-[var(--color-border)]">
                  <MapPin className="w-3 h-3 text-red-500" />
                  <span>{author.bureau}</span>
                </span>
              )}
            </div>

            <h1 className="bengali-headline text-2xl md:text-4xl font-extrabold text-[var(--color-text)]">
              {author.nameBangla}
            </h1>
            {author.nameEnglish && (
              <p className="text-sm text-[var(--color-text-muted)] font-sans mt-0.5">
                {author.nameEnglish}
              </p>
            )}

            <div className="text-sm md:text-base font-bold text-[var(--color-primary)] mt-1.5">
              {author.designation}
            </div>

            {author.bio && (
              <p className="text-sm text-[var(--color-text)] mt-3 leading-relaxed max-w-3xl">
                {author.bio}
              </p>
            )}

            {/* Social, Contact & Stats Strip */}
            <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {author.twitterHandle && (
                  <a
                    href={`https://twitter.com/${author.twitterHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border border-[var(--color-border)] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    title="Twitter/X"
                  >
                    <TwitterXIcon size={16} />
                  </a>
                )}
                {author.facebookUrl && (
                  <a
                    href={author.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border border-[var(--color-border)] hover:bg-blue-600 hover:text-white transition-colors"
                    title="Facebook"
                  >
                    <FacebookIcon size={16} />
                  </a>
                )}
                {author.linkedinUrl && (
                  <a
                    href={author.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border border-[var(--color-border)] hover:bg-blue-700 hover:text-white transition-colors"
                    title="LinkedIn"
                  >
                    <LinkedinIcon size={16} />
                  </a>
                )}
                {author.email && (
                  <a
                    href={`mailto:${author.email}`}
                    className="p-2 border border-[var(--color-border)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                    title="Email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
                {author.phone && (
                  <a
                    href={`tel:${author.phone}`}
                    className="p-2 border border-[var(--color-border)] hover:bg-green-600 hover:text-white transition-colors"
                    title="Phone"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="bg-red-50 dark:bg-red-950/40 text-[var(--color-primary)] px-3 py-1.5 border border-red-200 dark:border-red-900/40 font-mono">
                  মোট প্রকাশিত প্রতিবেদন: {author.totalArticles}টি
                </span>
                <Link
                  href="/authors"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] underline"
                >
                  সকল সাংবাদিক &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Author's Articles Archive Section */}
      <div>
        <div className="border-b-2 border-[var(--color-primary)] pb-3 mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="bengali-headline text-xl md:text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[var(--color-primary)] inline-block"></span>
            <span>{author.nameBangla} এর প্রকাশিত প্রতিবেদনসমূহ</span>
            <span className="text-xs bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] px-2 py-0.5 border border-[var(--color-border)] font-mono">
              {articlesResult.total}টি
            </span>
          </h2>
        </div>

        {articlesResult.data.length === 0 ? (
          <div className="text-center py-16 px-4 border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)]/40">
            <Newspaper className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-3 opacity-50" />
            <h3 className="bengali-headline text-lg font-bold text-[var(--color-text)]">
              বর্তমানে কোনো প্রতিবেদন পাওয়া যায়নি
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-md mx-auto">
              এই প্রতিবেদকের নতুন প্রতিবেদন প্রকাশের প্রক্রিয়া চলমান রয়েছে।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {articlesResult.data.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="group block border border-[var(--color-border)] p-3 bg-[var(--color-bg)] hover:border-[var(--color-primary)] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-[var(--color-bg-secondary)] mb-3">
                  {article.featuredImageUrl ? (
                    <Image
                      src={article.featuredImageUrl}
                      alt={article.featuredImageAlt ?? article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-text-faint)] text-xs">
                      ছবি নেই
                    </div>
                  )}
                  {article.category?.name && (
                    <span className="absolute top-2 left-2 bg-[var(--color-primary)] text-white text-[10px] font-bold px-2 py-0.5 rounded-none uppercase">
                      {article.category.name}
                    </span>
                  )}
                </div>

                <h3 className="bengali-headline text-sm font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-snug">
                  {article.title}
                </h3>

                {article.excerpt && (
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mt-1.5 leading-relaxed">
                    {article.excerpt}
                  </p>
                )}

                {article.publishedAt && (
                  <span className="text-[11px] text-[var(--color-text-faint)] mt-2.5 block border-t border-[var(--color-border)]/60 pt-1.5 font-sans">
                    {formatRelativeBengali(article.publishedAt)}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Pagination (if more than 1 page) */}
        {articlesResult.totalPages > 1 && (
          <div className="mt-8 pt-4 border-t border-[var(--color-border)] flex items-center justify-center gap-2">
            {Array.from({ length: articlesResult.totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/author/${author.slug}?page=${p}`}
                className={`w-8 h-8 flex items-center justify-center text-xs font-bold border transition-colors ${
                  p === currentPage
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                    : "bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
