"use client";

import { useState } from "react";
import {
  updateCommentStatus,
  deleteComment,
  bulkUpdateCommentStatus,
  type ArticleCommentWithArticle,
} from "@/actions/comments";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Trash2,
  Search,
  ExternalLink,
  Clock,
  ThumbsUp,
  Filter,
  CheckSquare,
  Square,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface AdminCommentsClientProps {
  initialComments: ArticleCommentWithArticle[];
}

export function AdminCommentsClient({ initialComments }: AdminCommentsClientProps) {
  const [commentsList, setCommentsList] = useState<ArticleCommentWithArticle[]>(initialComments);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected" | "spam">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Counts
  const totalCount = commentsList.length;
  const pendingCount = commentsList.filter((c) => c.status === "pending").length;
  const approvedCount = commentsList.filter((c) => c.status === "approved").length;
  const rejectedCount = commentsList.filter((c) => c.status === "rejected").length;
  const spamCount = commentsList.filter((c) => c.status === "spam").length;

  // Filtered comments
  const filteredComments = commentsList.filter((c) => {
    if (activeTab !== "all" && c.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.userName.toLowerCase().includes(q);
      const matchEmail = c.userEmail?.toLowerCase().includes(q);
      const matchContent = c.content.toLowerCase().includes(q);
      const matchArticle = c.articleTitle?.toLowerCase().includes(q);
      return matchName || matchEmail || matchContent || matchArticle;
    }
    return true;
  });

  async function handleStatusChange(
    commentId: string,
    newStatus: "approved" | "rejected" | "spam" | "pending"
  ) {
    setActionLoadingId(commentId);
    setError("");
    setSuccess("");
    try {
      const res = await updateCommentStatus(commentId, newStatus);
      if (res.success) {
        setCommentsList((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, status: newStatus } : c))
        );
        const statusBengali =
          newStatus === "approved"
            ? "অনুমোদিত"
            : newStatus === "rejected"
            ? "বাতিল"
            : newStatus === "spam"
            ? "স্প্যাম"
            : "অপেক্ষমাণ";
        setSuccess(`মন্তব্যটি ${statusBengali} করা হয়েছে`);
      } else {
        setError(res.error || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      setError(err?.message || "সার্ভার এরর");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই মন্তব্যটি স্থায়ীভাবে মুছে ফেলতে চান?")) return;

    setActionLoadingId(commentId);
    setError("");
    setSuccess("");
    try {
      const res = await deleteComment(commentId);
      if (res.success) {
        setCommentsList((prev) => prev.filter((c) => c.id !== commentId));
        setSelectedIds((prev) => prev.filter((id) => id !== commentId));
        setSuccess("মন্তব্যটি সফলভাবে মুছে ফেলা হয়েছে");
      } else {
        setError(res.error || "মুছে ফেলা ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      setError(err?.message || "সার্ভার এরর");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleBulkAction(action: "approved" | "rejected" | "spam" | "delete") {
    if (selectedIds.length === 0) return;
    if (action === "delete" && !confirm(`নির্বাচিত ${selectedIds.length}টি মন্তব্য মুছে ফেলতে চান?`)) return;

    setIsBulkLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await bulkUpdateCommentStatus(selectedIds, action);
      if (res.success) {
        if (action === "delete") {
          setCommentsList((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
        } else {
          setCommentsList((prev) =>
            prev.map((c) => (selectedIds.includes(c.id) ? { ...c, status: action } : c))
          );
        }
        setSuccess(`${selectedIds.length}টি মন্তব্যের ক্ষেত্রে সফলভাবে প্রক্রিয়া সম্পন্ন হয়েছে`);
        setSelectedIds([]);
      } else {
        setError(res.error || "বাল্ক অপারেশন ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      setError(err?.message || "সার্ভার এরর");
    } finally {
      setIsBulkLoading(false);
    }
  }

  function toggleSelectAll() {
    if (selectedIds.length === filteredComments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredComments.map((c) => c.id));
    }
  }

  function toggleSelectOne(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="bengali-headline text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <MessageSquare size={24} className="text-[var(--color-primary)]" />
            <span>পাঠক প্রতিক্রিয়া ও মন্তব্য মডারেশন</span>
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            পাঠকদের প্রেরিত মন্তব্য পর্যালোচনা, অনুমোদন, স্প্যাম ফিল্টারিং ও পরিচালনা করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-[var(--color-text)]">
            মোট মন্তব্য: {totalCount} টি
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab("all")}
          className={`p-4 border rounded cursor-pointer transition-all ${
            activeTab === "all"
              ? "border-[var(--color-primary)] bg-red-50/50 dark:bg-red-950/20 shadow-xs"
              : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-zinc-400"
          }`}
        >
          <span className="text-xs font-bold text-[var(--color-text-muted)]">সর্বমোট মন্তব্য</span>
          <div className="text-2xl font-extrabold text-[var(--color-text)] mt-1">{totalCount}</div>
        </div>

        <div
          onClick={() => setActiveTab("pending")}
          className={`p-4 border rounded cursor-pointer transition-all ${
            activeTab === "pending"
              ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs"
              : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-zinc-400"
          }`}
        >
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <Clock size={13} /> অপেক্ষমাণ
          </span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount}</div>
        </div>

        <div
          onClick={() => setActiveTab("approved")}
          className={`p-4 border rounded cursor-pointer transition-all ${
            activeTab === "approved"
              ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs"
              : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-zinc-400"
          }`}
        >
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={13} /> অনুমোদিত
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{approvedCount}</div>
        </div>

        <div
          onClick={() => setActiveTab("spam")}
          className={`p-4 border rounded cursor-pointer transition-all ${
            activeTab === "spam"
              ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 shadow-xs"
              : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-zinc-400"
          }`}
        >
          <span className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1">
            <AlertOctagon size={13} /> স্প্যাম / বাতিল
          </span>
          <div className="text-2xl font-extrabold text-purple-600 mt-1">{spamCount + rejectedCount}</div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border-l-4 border-red-600 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-600 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter and Bulk Action Controls */}
      <div className="border border-[var(--color-border)] bg-[var(--color-bg)] p-3 rounded space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "সব মন্তব্য", count: totalCount },
              { id: "pending", label: "অপেক্ষমাণ", count: pendingCount },
              { id: "approved", label: "অনুমোদিত", count: approvedCount },
              { id: "rejected", label: "বাতিলকৃত", count: rejectedCount },
              { id: "spam", label: "স্প্যাম", count: spamCount },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] hover:bg-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute left-2.5 top-2.5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="মন্তব্য বা পাঠক খুঁজুন..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="pt-2 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-2 bg-red-50/50 dark:bg-red-950/20 p-2 rounded">
            <span className="text-xs font-bold text-[var(--color-primary)]">
              {selectedIds.length} টি মন্তব্য নির্বাচিত
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                disabled={isBulkLoading}
                onClick={() => handleBulkAction("approved")}
                className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 size={13} />
                <span>অনুমোদন করুন</span>
              </button>

              <button
                type="button"
                disabled={isBulkLoading}
                onClick={() => handleBulkAction("rejected")}
                className="px-2.5 py-1 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <XCircle size={13} />
                <span>বাতিল করুন</span>
              </button>

              <button
                type="button"
                disabled={isBulkLoading}
                onClick={() => handleBulkAction("spam")}
                className="px-2.5 py-1 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <AlertOctagon size={13} />
                <span>স্প্যাম</span>
              </button>

              <button
                type="button"
                disabled={isBulkLoading}
                onClick={() => handleBulkAction("delete")}
                className="px-2.5 py-1 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={13} />
                <span>মুছে ফেলুন</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comments List */}
      {filteredComments.length === 0 ? (
        <div className="border border-dashed border-[var(--color-border)] p-12 text-center rounded bg-[var(--color-bg)]">
          <MessageSquare size={40} className="mx-auto text-[var(--color-text-muted)] mb-2" />
          <h4 className="font-bold text-sm text-[var(--color-text)]">কোনো মন্তব্য পাওয়া যায়নি</h4>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            এই ফিল্টারের অধীনে বর্তমানে কোনো মন্তব্য নেই।
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select all header */}
          <div className="flex items-center gap-2 px-1 text-xs text-[var(--color-text-muted)] font-bold">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 hover:text-[var(--color-text)] cursor-pointer"
            >
              {selectedIds.length === filteredComments.length && filteredComments.length > 0 ? (
                <CheckSquare size={16} className="text-[var(--color-primary)]" />
              ) : (
                <Square size={16} />
              )}
              <span>সবগুলো নির্বাচন করুন</span>
            </button>
          </div>

          {filteredComments.map((comment) => {
            const isSelected = selectedIds.includes(comment.id);
            const isLoading = actionLoadingId === comment.id;

            return (
              <div
                key={comment.id}
                className={`border rounded p-4 bg-[var(--color-bg)] transition-all ${
                  isSelected
                    ? "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/20 shadow-xs"
                    : "border-[var(--color-border)] hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Selection Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleSelectOne(comment.id)}
                    className="mt-1 cursor-pointer text-zinc-400 hover:text-[var(--color-primary)] flex-shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare size={18} className="text-[var(--color-primary)]" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>

                  <div className="flex-1 space-y-2 min-w-0">
                    {/* Top Row: Author, Status Badge, Article link */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-[var(--color-text)]">
                          {comment.userName}
                        </span>

                        {comment.userEmail && (
                          <span className="text-xs text-[var(--color-text-muted)] font-mono">
                            ({comment.userEmail})
                          </span>
                        )}

                        <span className="text-zinc-400 text-xs">•</span>

                        <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 font-mono">
                          <Clock size={11} />
                          {new Date(comment.createdAt).toLocaleDateString("bn-BD", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            comment.status === "approved"
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                              : comment.status === "pending"
                              ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800"
                              : comment.status === "spam"
                              ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800"
                              : "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800"
                          }`}
                        >
                          {comment.status === "approved"
                            ? "✓ অনুমোদিত"
                            : comment.status === "pending"
                            ? "⏳ পর্যালোচনার অপেক্ষায়"
                            : comment.status === "spam"
                            ? "⚠ স্প্যাম"
                            : "✕ বাতিলকৃত"}
                        </span>
                      </div>

                      {/* Article reference */}
                      {comment.articleTitle && (
                        <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                          <span>সংবাদ:</span>
                          <Link
                            href={comment.articleSlug ? `/news/${comment.articleSlug}` : "#"}
                            target="_blank"
                            className="font-bold text-[var(--color-primary)] hover:underline truncate max-w-xs flex items-center gap-1"
                          >
                            <span>{comment.articleTitle}</span>
                            <ExternalLink size={11} />
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Comment Body */}
                    <div className="p-3 bg-[var(--color-bg-secondary)] border-l-2 border-[var(--color-primary)] text-sm text-[var(--color-text)] leading-relaxed rounded-r">
                      {comment.content}
                    </div>

                    {/* Reactions & Actions Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                      <div className="flex items-center gap-3 text-[var(--color-text-muted)] font-mono">
                        <span className="flex items-center gap-1">
                          <ThumbsUp size={12} /> {comment.likesCount} লাইক
                        </span>
                      </div>

                      {/* Moderation Action Buttons */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {comment.status !== "approved" && (
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleStatusChange(comment.id, "approved")}
                            className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 size={12} />
                            <span>অনুমোদন</span>
                          </button>
                        )}

                        {comment.status !== "rejected" && (
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleStatusChange(comment.id, "rejected")}
                            className="px-2.5 py-1 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <XCircle size={12} />
                            <span>বাতিল</span>
                          </button>
                        )}

                        {comment.status !== "spam" && (
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleStatusChange(comment.id, "spam")}
                            className="px-2.5 py-1 text-xs font-bold bg-purple-700 hover:bg-purple-600 text-white rounded transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <AlertOctagon size={12} />
                            <span>স্প্যাম</span>
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleDelete(comment.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer disabled:opacity-50"
                          title="স্থায়ীভাবে মুছে ফেলুন"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
