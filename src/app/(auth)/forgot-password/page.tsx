"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await (authClient as any).forgetPassword?.({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      }) ?? { error: null };

      if (res.error) {
        setError(res.error.message || "রিসেট লিঙ্ক পাঠানো সম্ভব হয়নি");
      } else {
        setSent(true);
      }
    } catch (err: any) {
      setError(err?.message || "ত্রুটি ঘটেছে");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-secondary)] px-4 py-12">
      <div className="max-w-md w-full bg-[var(--color-bg)] border border-[var(--color-border)] p-8 shadow-sm">
        <div className="text-center mb-8 border-b border-[var(--color-border)] pb-6">
          <Link href="/" className="inline-block">
            <span
              className="text-3xl font-extrabold text-[var(--color-primary)]"
              style={{ fontFamily: "var(--font-noto-bengali, sans-serif)" }}
            >
              বাংলা নিউজ
            </span>
          </Link>
          <h2 className="text-sm font-bold text-[var(--color-text)] mt-3">
            পাসওয়ার্ড পুনরুদ্ধার
          </h2>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={28} />
            </div>
            <h3 className="font-bold text-base text-[var(--color-text)]">
              রিসেট লিঙ্ক পাঠানো হয়েছে
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              আপনার ইমেইলে পাসওয়ার্ড রিসেট করার একটি গোপনীয় লিঙ্ক পাঠানো হয়েছে। ইমেইল ইনবক্স চেক করুন।
            </p>
            <div className="pt-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline"
              >
                <ArrowLeft size={14} />
                লগইন পাতায় ফিরে যান
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs border border-red-200">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                নিবন্ধিত ইমেইল ঠিকানা
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? "পাঠানো হচ্ছে..." : "রিসেট লিঙ্ক পাঠান"}
            </button>

            <div className="text-center pt-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
              >
                <ArrowLeft size={13} /> লগইনে ফিরে যান
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
