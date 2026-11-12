"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Menu, LogOut, Sun, Moon, Globe, Check, ChevronDown, Shield } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

interface AdminTopNavProps {
  onToggleSidebar: () => void;
}

export function AdminTopNav({ onToggleSidebar }: AdminTopNavProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useAdminLanguage();
  const [mounted, setMounted] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session } = authClient.useSession();
  const [dbUser, setDbUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) setDbUser(data.user);
      })
      .catch(() => {});
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  const userName = dbUser?.name ?? session?.user?.name ?? (language === "bn" ? "সুপার অ্যাডমিন" : "Super Admin");
  const userRole = dbUser?.role ?? (session?.user as any)?.role ?? "super_admin";

  return (
    <header className="h-16 bg-[var(--color-bg)] border-b border-[var(--color-border)] flex items-center justify-between px-4 lg:px-8 z-40 sticky top-0">
      {/* Left: Mobile Toggle & System Masthead */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded hover:bg-[var(--color-bg-secondary)]"
          aria-label={language === "bn" ? "মেনু খুলুন" : "Open Menu"}
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:block text-xs font-semibold text-[var(--color-text-muted)]">
          {t("nav.systemTitle")}
        </div>
      </div>

      {/* Right Controls: Language Selector, Theme, User */}
      <div className="flex items-center gap-2.5">
        {/* Language Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-secondary)] text-xs font-medium text-[var(--color-text)] transition-colors cursor-pointer"
            title={t("nav.switchLanguage")}
            aria-expanded={langDropdownOpen}
          >
            <Globe size={14} className="text-[var(--color-primary)]" />
            <span className="font-semibold">{language === "bn" ? "বাংলা" : "English"}</span>
            <ChevronDown size={12} className={`text-[var(--color-text-muted)] transition-transform ${langDropdownOpen ? "rotate-180" : ""}`} />
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
                  language === "bn" ? "font-bold text-[var(--color-primary)] bg-[var(--color-bg-secondary)]/50" : "text-[var(--color-text)]"
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
                  language === "en" ? "font-bold text-[var(--color-primary)] bg-[var(--color-bg-secondary)]/50" : "text-[var(--color-text)]"
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
        <div className="flex items-center gap-3 border-l border-[var(--color-border)] pl-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-xs select-none">
              {userName.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-[var(--color-text)]">{userName}</p>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                <Shield size={10} />
                <span>
                  {userRole === "super_admin"
                    ? (language === "bn" ? "সুপার অ্যাডমিন" : "SUPER ADMIN")
                    : userRole === "admin"
                    ? (language === "bn" ? "অ্যাডমিন" : "ADMIN")
                    : userRole === "editor"
                    ? (language === "bn" ? "সম্পাদক" : "EDITOR")
                    : userRole === "journalist"
                    ? (language === "bn" ? "প্রতিবেদক" : "JOURNALIST")
                    : userRole}
                </span>
              </p>
            </div>
          </div>

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
