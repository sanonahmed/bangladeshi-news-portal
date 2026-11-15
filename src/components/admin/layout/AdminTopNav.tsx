"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import {
  Menu,
  LogOut,
  Sun,
  Moon,
  Globe,
  Check,
  ChevronDown,
  Shield,
  Command,
  ArrowUpRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  useEffect,
  useState,
  useRef,
  useSyncExternalStore,
  type Ref,
} from "react";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

const subscribeToMount = () => () => {};

interface AdminTopNavProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  ref: Ref<HTMLButtonElement>;
}

export function AdminTopNav({
  onToggleSidebar,
  sidebarOpen,
  ref,
}: AdminTopNavProps) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useAdminLanguage();
  const mounted = useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dbUser, setDbUser] = useState<{
    name: string;
    role: string;
    image?: string | null;
  } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) setDbUser(data.user);
      })
      .catch(() => {});

    function refreshUser() {
      fetch("/api/auth/me")
        .then((r) => r.json())
        .then((data) => {
          if (data?.user) setDbUser(data.user);
        })
        .catch(() => {});
    }

    window.addEventListener("profile-updated", refreshUser);
    return () => window.removeEventListener("profile-updated", refreshUser);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    try {
      await authClient.signOut();
    } catch {}
    window.location.href = "/login";
  }

  const userName =
    dbUser?.name ??
    (language === "bn" ? "নিউজরুম ব্যবহারকারী" : "Newsroom User");
  const userRole = dbUser?.role ?? "reader";
  const userAvatar = dbUser?.image ?? null;

  return (
    <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* Left: Mobile Toggle & System Masthead */}
      <div className="flex items-center gap-2.5">
        <button
          ref={ref}
          aria-controls="admin-navigation"
          aria-expanded={sidebarOpen}
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)] lg:hidden"
          aria-label={language === "bn" ? "মেনু খুলুন" : "Open Menu"}
        >
          <Menu size={20} />
        </button>
        <Link href="/admin" className="flex items-center gap-2.5 lg:hidden">
          <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-[10px] font-black text-white">
            YN
          </span>
          <span className="hidden font-bold tracking-tight text-[var(--color-text)] xs:block">
            Yes News 24
          </span>
        </Link>
        <div className="hidden items-center gap-3 lg:flex">
          <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
            <Command size={15} />
          </span>
          <div>
            <p className="text-[11px] font-bold tracking-tight text-[var(--color-text)]">
              Yes News 24
            </p>
            <p className="text-[10px] text-slate-400">
              {language === "bn"
                ? "সম্পাদকীয় ওয়ার্কস্পেস"
                : "Editorial workspace"}
            </p>
          </div>
        </div>
        <Link
          href="/"
          target="_blank"
          className="ml-5 hidden items-center gap-1.5 text-[11px] font-semibold text-slate-400 transition-colors hover:text-indigo-600 lg:flex"
        >
          <span>{language === "bn" ? "পাবলিক পোর্টাল" : "Public portal"}</span>
          <ArrowUpRight size={12} />
        </Link>
      </div>

      {/* Right Controls: Language Selector, Theme, User */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Language Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1.5 text-xs font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg-secondary)] sm:px-2.5"
            title={t("nav.switchLanguage")}
            aria-expanded={langDropdownOpen}
            aria-haspopup="menu"
            aria-label={t("nav.switchLanguage")}
          >
            <Globe size={14} className="text-[var(--color-primary)]" />
            <span className="font-semibold">
              {language === "bn" ? "বাংলা" : "English"}
            </span>
            <ChevronDown
              size={12}
              className={`text-[var(--color-text-muted)] transition-transform ${langDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {langDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-36 bg-[var(--color-bg)] border border-[var(--color-border)] rounded shadow-lg py-1 z-50 text-xs">
              <button
                type="button"
                onClick={() => {
                  setLanguage("bn");
                  setLangDropdownOpen(false);
                }}
                className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer ${
                  language === "bn"
                    ? "font-bold text-[var(--color-primary)] bg-[var(--color-bg-secondary)]/50"
                    : "text-[var(--color-text)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🇧🇩</span>
                  <span>বাংলা</span>
                </div>
                {language === "bn" && <Check size={14} />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setLanguage("en");
                  setLangDropdownOpen(false);
                }}
                className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer ${
                  language === "en"
                    ? "font-bold text-[var(--color-primary)] bg-[var(--color-bg-secondary)]/50"
                    : "text-[var(--color-text)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🇬🇧</span>
                  <span>English</span>
                </div>
                {language === "en" && <Check size={14} />}
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors rounded cursor-pointer"
            aria-label={t("nav.theme")}
            title={t("nav.theme")}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        )}

        {/* User Identity & Logout */}
        <div className="ml-1 flex items-center gap-2 border-l border-[var(--color-border)] pl-2 sm:ml-2 sm:pl-3">
          <Link
            href="/admin/profile"
            title={
              language === "bn"
                ? "আমার প্রোফাইল ও পরিচিতি সম্পাদনা করুন"
                : "Edit My Profile"
            }
            className="flex items-center gap-2 group hover:opacity-90 transition-opacity"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-xs select-none group-hover:ring-2 group-hover:ring-purple-500 transition-all shrink-0">
              <span className="select-none font-bold text-xs">
                {userName.charAt(0)}
              </span>
              {userAvatar && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userAvatar}
                  alt={userName}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-[var(--color-text)] transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {userName}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                <Shield size={10} />
                <span>
                  {userRole === "super_admin"
                    ? language === "bn"
                      ? "সুপার অ্যাডমিন"
                      : "SUPER ADMIN"
                    : userRole === "admin"
                      ? language === "bn"
                        ? "অ্যাডমিন"
                        : "ADMIN"
                      : userRole === "editor"
                        ? language === "bn"
                          ? "সম্পাদক"
                          : "EDITOR"
                        : userRole === "journalist"
                          ? language === "bn"
                            ? "প্রতিবেদক"
                            : "JOURNALIST"
                          : userRole}
                </span>
              </p>
            </div>
          </Link>

          <button
            onClick={handleSignOut}
            title={t("nav.logout")}
            className="p-2 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer rounded hover:bg-[var(--color-bg-secondary)]"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
