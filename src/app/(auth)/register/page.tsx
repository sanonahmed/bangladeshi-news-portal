"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Lock, Mail, User, AlertCircle, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("পাসওয়ার্ড ন্যূনতম ৮ অক্ষরের হতে হবে");
      return;
    }

    setLoading(true);
    try {
      const res = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (res.error) {
        setError(res.error.message || "নিবন্ধন সম্পন্ন করা যায়নি");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "নিবন্ধনে ত্রুটি হয়েছে");
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
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            নতুন পাঠক অ্যাকাউন্ট তৈরি করুন
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
              আপনার পূর্ণ নাম
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: মুহাম্মদ আরিফুল ইসলাম"
                className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
              />
              <User size={16} className="absolute left-3 top-2.5 text-[var(--color-text-muted)]" />
            </div>
          </div>

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
                placeholder="reader@example.com"
                className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
              />
              <Mail size={16} className="absolute left-3 top-2.5 text-[var(--color-text-muted)]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={8}
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
            {loading ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "নিবন্ধন করুন"}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)]">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
          <Link href="/login" className="text-[var(--color-primary)] font-bold hover:underline">
            লগইন করুন
          </Link>
        </div>
      </div>
    </div>
  );
}
