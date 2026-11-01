import Link from "next/link";
import Image from "next/image";
import { User, MapPin, ChevronRight, Mail } from "lucide-react";
import { FacebookIcon, TwitterXIcon } from "@/components/ui/icons";

interface AuthorBioCardProps {
  name: string;
  slug?: string | null;
  designation?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  bureau?: string | null;
  twitter?: string | null;
  facebook?: string | null;
}

export function AuthorBioCard({
  name,
  slug,
  designation,
  bio,
  avatarUrl,
  bureau,
  twitter,
  facebook,
}: AuthorBioCardProps) {
  const authorSlug = slug || "mahmudur-rahman";

  return (
    <div className="my-8 p-4 sm:p-5 border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 rounded-none shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Avatar */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full overflow-hidden border-2 border-[var(--color-primary)] bg-[var(--color-bg)]">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)]">
              <User className="w-8 h-8 text-[var(--color-text-faint)]" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950/60 text-[var(--color-primary)] px-2 py-0.5 rounded border border-red-200 dark:border-red-900/40">
              লেখক ও প্রতিবেদক
            </span>
            {bureau && (
              <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-0.5 font-medium">
                <MapPin className="w-2.5 h-2.5 text-red-500" />
                <span>{bureau}</span>
              </span>
            )}
          </div>

          <h4 className="bengali-headline text-base sm:text-lg font-bold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors">
            <Link href={`/author/${authorSlug}`}>
              {name}
            </Link>
          </h4>

          {designation && (
            <p className="text-xs font-semibold text-[var(--color-primary)] mt-0.5">
              {designation}
            </p>
          )}

          {bio && (
            <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mt-1.5 leading-relaxed">
              {bio}
            </p>
          )}

          {/* Social and Profile Button Row */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              {twitter && (
                <a
                  href={`https://twitter.com/${twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:text-[var(--color-primary)] transition-colors"
                  title="Twitter/X"
                >
                  <TwitterXIcon size={14} />
                </a>
              )}
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:text-[var(--color-primary)] transition-colors"
                  title="Facebook"
                >
                  <FacebookIcon size={14} />
                </a>
              )}
            </div>

            <Link
              href={`/author/${authorSlug}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:underline"
            >
              <span>এই প্রতিবেদকের সব সংবাদ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
