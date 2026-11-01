"use client";

import { useState } from "react";
import { submitComment, likeComment } from "@/actions/comments";
import type { Comment } from "@/db/schema/comments";
import {
  MessageSquare,
  ThumbsUp,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";

interface ArticleCommentsSectionProps {
  articleId: string;
  articleTitle: string;
  initialComments: Comment[];
}

export function ArticleCommentsSection({
  articleId,
  articleTitle,
  initialComments,
}: ArticleCommentsSectionProps) {
  const [commentsList, setCommentsList] = useState<Comment[]>(initialComments);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!userName.trim()) {
      setError("আপনার নাম লিখুন");
      return;
    }
    if (!content.trim() || content.trim().length < 3) {
      setError("কমপক্ষে ৩ অক্ষরের গঠনমূলক মন্তব্য লিখুন");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitComment({
        articleId,
        userName: userName.trim(),
        userEmail: userEmail.trim() || undefined,
        content: content.trim(),
      });

      if (!res.success || !res.comment) {
        setError(res.error || "মন্তব্য প্রকাশে সমস্যা হয়েছে");
      } else {
        setSuccess("আপনার মন্তব্যটি সফলভাবে যোগ করা হয়েছে!");
        setCommentsList([res.comment, ...commentsList]);
        setContent("");
      }
    } catch (err: any) {
      setError(err?.message || "সার্ভার এরর ঘটেছে");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLike(commentId: string) {
    if (likedMap[commentId]) return;

    setLikedMap((prev) => ({ ...prev, [commentId]: true }));
    setCommentsList((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likesCount: c.likesCount + 1 } : c))
    );

    try {
      await likeComment(commentId);
    } catch (err) {
      console.error("Like error:", err);
    }
  }

  function formatTimeAgo(dateInput: Date | string) {
    const d = new Date(dateInput);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return "কিছুক্ষণ আগে";
    if (diff < 3600) return `${Math.floor(diff / 60)} মিনিট আগে`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ঘণ্টা আগে`;
    return d.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
  }

  return (
    <section className="border-t-2 border-[var(--color-primary)] pt-8 mt-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <h3 className="bengali-headline text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <MessageSquare size={22} className="text-[var(--color-primary)]" />
          <span>পাঠক প্রতিক্রিয়া ও মন্তব্য</span>
          <span className="text-xs bg-red-100 dark:bg-red-950/70 text-[var(--color-primary)] font-bold px-2.5 py-0.5 rounded-full border border-red-200 dark:border-red-900">
            {commentsList.length} টি
          </span>
        </h3>
        <span className="text-xs text-[var(--color-text-muted)] hidden sm:inline-block">
          মতামত পাঠকদের নিজস্ব, এর দায়ভার দৈনিক বাংলাদেশ বার্তার নয়
        </span>
      </div>

      {/* Comment Submission Form */}
      <form
        onSubmit={handleSubmit}
        className="border border-[var(--color-border)] p-4 sm:p-5 bg-[var(--color-bg-secondary)] rounded space-y-4"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)]">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>আপনার মতামত জানান</span>
        </div>

        <div>
          <textarea
            required
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="সংবাদটি সম্পর্কে আপনার যুক্তিযুক্ত ও গঠনমূলক মতামত লিখুন..."
            className="w-full p-3 bg-[var(--color-bg)] border border-[var(--color-border)] text-sm rounded focus:outline-none focus:border-[var(--color-primary)] transition-colors leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="আপনার পূর্ণ নাম *"
              className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-xs rounded focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="ইমেইল ঠিকানা (প্রকাশ করা হবে না, ঐচ্ছিক)"
              className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-xs rounded focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>

        {error && (
          <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border-l-4 border-red-600 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-600 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 size={15} className="flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <p className="text-[11px] text-[var(--color-text-muted)] italic">
            * কোনো প্রকার আক্রমণাত্মক, কুরুচিপূর্ণ বা বিভ্রান্তিকর মন্তব্য গ্রহণযোগ্য নয়।
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold rounded transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Send size={13} />
            <span>{isSubmitting ? "প্রকাশ হচ্ছে..." : "মন্তব্য প্রকাশ করুন"}</span>
          </button>
        </div>
      </form>

      {/* Approved Comments List */}
      <div className="space-y-4">
        {commentsList.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-[var(--color-border)] rounded bg-[var(--color-bg)]">
            <MessageSquare size={32} className="mx-auto text-[var(--color-text-muted)] mb-2" />
            <p className="text-sm font-semibold text-[var(--color-text-muted)]">
              এখনও কোনো মন্তব্য করা হয়নি।
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              এই প্রতিবেদনে আপনার মতামত দিয়ে প্রথম আলোচনা শুরু করুন!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)] border border-[var(--color-border)] rounded bg-[var(--color-bg)]">
            {commentsList.map((comment) => {
              const isLiked = likedMap[comment.id];

              return (
                <div key={comment.id} className="p-4 sm:p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/80 text-[var(--color-primary)] font-bold text-xs flex items-center justify-center border border-red-200 dark:border-red-900 select-none">
                        {comment.userName.charAt(0) || "প"}
                      </div>
                      <div>
                        <h4 className="bengali-headline text-sm font-bold text-[var(--color-text)]">
                          {comment.userName}
                        </h4>
                        <span className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1 font-mono">
                          <Clock size={11} />
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLike(comment.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer ${
                        isLiked
                          ? "bg-red-50 dark:bg-red-950/50 text-[var(--color-primary)] border-red-200 dark:border-red-900"
                          : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                      }`}
                      title="ভালো লেগেছে"
                    >
                      <ThumbsUp size={13} className={isLiked ? "fill-[var(--color-primary)]" : ""} />
                      <span className="font-mono text-xs">{comment.likesCount}</span>
                    </button>
                  </div>

                  <p className="text-sm text-[var(--color-text)] leading-relaxed pl-10">
                    {comment.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
