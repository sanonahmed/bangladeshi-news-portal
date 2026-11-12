import Link from "next/link";
import { ShieldAlert, ArrowLeft, Lock, Shield, KeyRound } from "lucide-react";
import { type UserRole, getRoleLabel } from "@/lib/permissions";

interface AccessDeniedNoticeProps {
  requiredRole: UserRole;
  currentRole?: string | null;
  pageTitleBn?: string;
  pageTitleEn?: string;
}

export function AccessDeniedNotice({
  requiredRole,
  currentRole,
  pageTitleBn,
  pageTitleEn,
}: AccessDeniedNoticeProps) {
  const isUnauthenticated = !currentRole;
  const currentRoleStr = (currentRole as UserRole) || null;
  const currentLabelBn = currentRoleStr ? getRoleLabel(currentRoleStr) || currentRoleStr : "লগইন করা নেই (Not Signed In)";
  const requiredLabelBn = getRoleLabel(requiredRole) || requiredRole;

  return (
    <div className="min-h-[55vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-[var(--color-bg)] border border-red-200 dark:border-red-900/60 rounded-xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-900/80 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-5 shadow-xs">
          {isUnauthenticated ? <KeyRound size={32} /> : <ShieldAlert size={32} />}
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-semibold mb-3 border border-red-200 dark:border-red-900/50">
          <Lock size={12} />
          <span>{isUnauthenticated ? "সেশন অননুমোদিত • Session Required" : "অ্যাক্সেস সংরক্ষিত • Access Restricted"}</span>
        </div>

        <h2 className="text-xl font-extrabold text-[var(--color-text)] mb-2 tracking-tight">
          {isUnauthenticated
            ? "লগইন সেশন পাওয়া যায়নি"
            : pageTitleBn
            ? `${pageTitleBn} - প্রবেশের অনুমতি নেই`
            : "অননুমোদিত প্রবেশাধিকার"}
        </h2>

        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-6">
          {isUnauthenticated
            ? "এই অভ্যন্তরীণ বার্তা কক্ষ ও প্রশাসনিক মডিউলে প্রবেশের জন্য সক্রিয় লগইন সেশন প্রয়োজন। অনুগ্রহ করে সুপার অ্যাডমিন বা অনুমোদিত সাংবাদিক অ্যাকাউন্টে লগইন করুন।"
            : `এই বিভাগ বা সেটিংসে প্রবেশের জন্য আপনার অ্যাকাউন্টের নিরাপত্তা স্তর পর্যাপ্ত নয়। এই অংশটি শুধুমাত্র ${requiredLabelBn} বা তার ঊর্ধ্বতনের জন্য সংরক্ষিত।`}
        </p>

        {/* Roles Details Box */}
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg p-4 mb-6 text-left grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-faint)] tracking-wider block mb-1">
              আপনার অবস্থা (Current Status)
            </span>
            <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded border ${
              isUnauthenticated
                ? "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900"
                : "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900"
            }`}>
              <Shield size={12} />
              {currentLabelBn}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-faint)] tracking-wider block mb-1">
              প্রয়োজনীয় রোল (Required)
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-900">
              <Shield size={12} />
              {requiredLabelBn}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {isUnauthenticated ? (
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity shadow-xs"
            >
              <KeyRound size={14} />
              <span>বার্তা কক্ষে লগইন করুন (Sign In to Newsroom)</span>
            </Link>
          ) : (
            <>
              <Link
                href="/admin"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity shadow-xs"
              >
                <ArrowLeft size={14} />
                <span>অ্যাডমিন ড্যাশবোর্ডে ফিরুন</span>
              </Link>
              <Link
                href="/admin/articles"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] rounded-lg hover:bg-[var(--color-bg)] transition-colors"
              >
                <span>আমার সংবাদ ও খসড়া</span>
              </Link>
            </>
          )}
        </div>

        <p className="text-[11px] text-[var(--color-text-faint)] mt-6 border-t border-[var(--color-border)] pt-4">
          আপনার যদি এই সেকশনে কাজের প্রয়োজন হয়, তবে প্রধান বার্তা সম্পাদক (সুপার অ্যাডমিন)-এর সাথে যোগাযোগ করুন।
        </p>
      </div>
    </div>
  );
}
