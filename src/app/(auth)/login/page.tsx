"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

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
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md w-full bg-[var(--color-bg)] border border-[var(--color-border)] p-8 shadow-sm">
      {/* Newspaper Branding */}
      <div className="text-center mb-8 border-b border-[var(--color-border)] pb-6">
        <Link href="/" className="inline-block">
          <span
            className="text-3xl font-extrabold text-[var(--color-primary)]"
            style={{ fontFamily: "var(--font-noto-bengali, sans-serif)" }}
          >
            বাংলা নিউজ
          </span>
        </Link>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          সম্পাদকীয় ও বার্তা বিভাগীয় লগইন
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/40 border-l-4 border-red-600 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
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
              placeholder="editor@banglanews.com"
              className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
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
              className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
            />
            <Lock size={16} className="absolute left-3 top-2.5 text-[var(--color-text-muted)]" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-6"
        >
          {loading ? "যাচাই করা হচ্ছে..." : "প্রবেশ করুন"}
          <ArrowRight size={16} />
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)]">
        অ্যাকাউন্ট নেই?{" "}
        <Link href="/register" className="text-[var(--color-primary)] font-bold hover:underline">
          নিবন্ধন করুন
        </Link>
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
