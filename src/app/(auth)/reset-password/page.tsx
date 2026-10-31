"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("উভয় পাসওয়ার্ড এক হতে হবে");
      return;
    }
    if (password.length < 8) {
      setError("পাসওয়ার্ড ন্যূনতম ৮ অক্ষরের হতে হবে");
      return;
    }

    setLoading(true);
    try {
      const res = await (authClient as any).resetPassword?.({
        newPassword: password,
        token,
      });

      if (res?.error) {
        setError(res.error.message || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে");
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err?.message || "ত্রুটি ঘটেছে");
    } finally {
      setLoading(false);
    }
  }

  return (
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
          নতুন পাসওয়ার্ড নির্ধারণ করুন
        </h2>
      </div>

      {success ? (
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={28} />
          </div>
          <h3 className="font-bold text-base text-[var(--color-text)]">
            পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে
          </h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            এখন আপনি নতুন পাসওয়ার্ড দিয়ে অ্যাকাউন্টে প্রবেশ করতে পারবেন।
          </p>
          <div className="pt-4">
            <Link
              href="/login"
              className="inline-block px-6 py-2 bg-[var(--color-primary)] text-white text-xs font-bold hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              লগইন করুন
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs border border-red-200 flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              নতুন পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)
            </label>
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

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              পাসওয়ার্ড নিশ্চিত করুন
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
              />
              <Lock size={16} className="absolute left-3 top-2.5 text-[var(--color-text-muted)]" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? "পরিবর্তন করা হচ্ছে..." : "পাসওয়ার্ড সংরক্ষণ করুন"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-secondary)] px-4 py-12">
      <Suspense fallback={<div className="text-xs text-[var(--color-text-muted)]">লোড হচ্ছে...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
