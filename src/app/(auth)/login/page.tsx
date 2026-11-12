"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Lock, Mail, AlertCircle, ArrowRight, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

function getSafeCallbackUrl(raw: string | null): string {
  if (!raw) return "/admin";
  const trimmed = raw.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
    return trimmed;
  }
  return "/admin";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));
  const noticeParam = searchParams.get("notice");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authClient.signIn.email({
        email,
        password,
      });

      if (res.error) {
        setError(res.error.message || "ইমেইল বা পাসওয়ার্ড সঠিক নয়");
      } else {
        window.location.href = callbackUrl || "/admin";
      }
    } catch (err: any) {
      setError(err?.message || "লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md w-full bg-[var(--color-bg)] border border-[var(--color-border)] p-8 shadow-sm rounded-lg">
      {/* Newspaper Branding */}
      <div className="text-center mb-8 border-b border-[var(--color-border)] pb-6">
        <Link href="/" className="inline-block">
          <span
            className="text-3xl font-extrabold text-[var(--color-primary)]"
            style={{ fontFamily: "var(--font-noto-bengali, sans-serif)" }}
          >
            দৈনিক বাংলাদেশ বার্তা
          </span>
        </Link>
        <p className="text-xs text-[var(--color-text-muted)] mt-1 font-medium">
          সম্পাদকীয় ও বার্তা বিভাগীয় অভ্যন্তরীণ পোর্টাল
        </p>
      </div>

      {noticeParam === "registration_disabled" && (
        <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-600 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300 rounded-r">
          <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
          <span>অনলাইন উন্মুক্ত নিবন্ধন বন্ধ আছে। বার্তা কক্ষের অ্যাকাউন্ট কেবল সুপার অ্যাডমিন দ্বারা প্রস্তুত করা হয়।</span>
        </div>
      )}

      {noticeParam === "staff_only" && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/40 border-l-4 border-red-600 flex items-start gap-2 text-xs text-red-800 dark:text-red-300 rounded-r">
          <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
          <span>অ্যাডমিন প্যানেলে প্রবেশাধিকার শুধুমাত্র অনুমোদিত সাংবাদিক ও স্টাফদের জন্য সংরক্ষিত।</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/40 border-l-4 border-red-600 flex items-center gap-2 text-xs text-red-700 dark:text-red-300 rounded-r">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            ইমেইল ঠিকানা
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="journalist@example.com"
              className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm rounded focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text)]"
            />
            <Mail size={16} className="absolute left-3 top-2.5 text-[var(--color-text-muted)]" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              পাসওয়ার্ড
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] text-[var(--color-primary)] hover:underline"
            >
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
          </div>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm rounded focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text)]"
            />
            <Lock size={16} className="absolute left-3 top-2.5 text-[var(--color-text-muted)]" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-6 shadow-xs cursor-pointer"
        >
          {loading ? "যাচাই করা হচ্ছে..." : "বার্তা কক্ষে প্রবেশ করুন"}
          <ArrowRight size={16} />
        </button>
      </form>

      {/* Security notice regarding no public registration */}
      <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)] space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[var(--color-text-muted)] text-[11px] font-semibold border border-[var(--color-border)]">
          <ShieldAlert size={13} className="text-amber-600 dark:text-amber-400" />
          <span>নিবন্ধন সংরক্ষিত • Restricted Access</span>
        </div>
        <p className="text-[11px] leading-relaxed text-[var(--color-text-faint)]">
          বার্তা কক্ষ ও অ্যাডমিন প্যানেলের সকল স্টাফ ও সাংবাদিক অ্যাকাউন্ট কেবল সুপার অ্যাডমিন কর্তৃক সরাসরি প্যানেল থেকে তৈরি ও বিতরণ করা হয়। উন্মুক্ত রেজিস্ট্রেশন সম্পূর্ণ বন্ধ।
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-secondary)] px-4 py-12">
      <Suspense fallback={<div className="text-xs text-[var(--color-text-muted)]">লোড হচ্ছে...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
