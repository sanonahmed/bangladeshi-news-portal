"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Menu,
  X,
  Search,
  Home,
  ShieldCheck,
  Newspaper,
  Headphones,
  History,
  Scale,
  Bookmark,
  Bell,
  Lock,
  Calendar,
} from "lucide-react";
import type { NavigationItem } from "@/types";

interface NavBarProps {
  items: NavigationItem[];
}

export function NavBar({ items }: NavBarProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const headerHeight = 120; // approx height of TopBar + Masthead
      setIsSticky(window.scrollY > headerHeight);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu and dropdowns on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!activeDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  const topLevelItems = items
    .filter((i) => !i.parentId && i.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <nav
        ref={navRef}
        className={`bg-[#C8102E] text-white z-50 transition-shadow duration-200 border-b-2 border-[#B8860B] shadow-md ${
          isSticky ? "fixed top-0 left-0 right-0 shadow-xl" : "relative"
        }`}
        aria-label="প্রধান নেভিগেশন"
      >
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex items-center">
            {/* Desktop nav items */}
            <ul className="hidden lg:flex items-center overflow-x-auto no-scrollbar divide-x divide-white/10">
              {topLevelItems.map((item) => {
                const children = items
                  .filter((i) => i.parentId === item.id && i.isActive)
                  .sort((a, b) => a.sortOrder - b.sortOrder);

                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                const isHome = item.href === "/";

                return (
                  <li key={item.id} className="relative flex-shrink-0">
                    {children.length > 0 ? (
                      <button
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === item.id ? null : item.id
                          )
                        }
                        className={`flex items-center gap-1 px-3 py-2.5 text-[14px] font-bold whitespace-nowrap hover:bg-[#A50E26] transition-colors ${
                          isActive ? "bg-[#A50E26]" : ""
                        }`}
                        aria-expanded={activeDropdown === item.id}
                        aria-haspopup="true"
                      >
                        {isHome && <Home size={15} className="mr-1 inline-block" />}
                        {item.label}
                        <ChevronDown
                          size={12}
                          className={`transition-transform duration-150 ${
                            activeDropdown === item.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        target={item.openInNewTab ? "_blank" : undefined}
                        rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                        className={`flex items-center px-3 py-2.5 text-[14px] font-bold whitespace-nowrap hover:bg-[#A50E26] transition-colors ${
                          isActive ? "bg-[#A50E26]" : ""
                        }`}
                      >
                        {isHome && <Home size={15} className="mr-1 inline-block" />}
                        {item.label}
                      </Link>
                    )}

                    {/* Dropdown panel */}
                    {children.length > 0 && activeDropdown === item.id && (
                      <ul
                        className="absolute top-full left-0 bg-[var(--color-bg)] text-[var(--color-text)] shadow-lg min-w-[200px] z-50 border border-[var(--color-border)] py-1"
                        role="menu"
                      >
                        {children.map((child) => (
                          <li key={child.id} role="none">
                            <Link
                              href={child.href}
                              target={child.openInNewTab ? "_blank" : undefined}
                              rel={child.openInNewTab ? "noopener noreferrer" : undefined}
                              role="menuitem"
                              className="block px-4 py-2 text-sm hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-primary)] transition-colors"
                              onClick={() => setActiveDropdown(null)}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Right side: search + mobile hamburger */}
            <div className="ml-auto flex items-center gap-1 py-2">
              <Link
                href="/search"
                aria-label="অনুসন্ধান"
                className="p-2 hover:bg-[var(--color-primary-hover)] rounded transition-colors"
              >
                <Search size={16} />
              </Link>

              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                aria-label="মেনু খুলুন"
                aria-expanded={isMobileOpen}
                aria-controls="mobile-menu"
                className="lg:hidden p-2 hover:bg-[var(--color-primary-hover)] rounded transition-colors"
              >
                {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer so content doesn't jump when nav becomes sticky */}
      {isSticky && <div style={{ height: 44 }} aria-hidden="true" />}

      {/* Mobile menu overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity"
          aria-hidden="true"
          onClick={() => setIsMobileOpen(false)}
        >
          <div
            id="mobile-menu"
            className="absolute top-0 left-0 h-full w-[85%] max-w-[340px] bg-[var(--color-bg)] shadow-2xl flex flex-col overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="মোবাইল মেনু"
          >
            {/* Mobile menu header */}
            <div className="bg-[var(--color-primary)] px-4 py-3.5 flex items-center justify-between text-white shrink-0 shadow-sm">
              <div className="flex flex-col">
                <span className="font-black text-sm tracking-tight">দৈনিক বাংলাদেশ বার্তা</span>
                <span className="text-[10px] text-white/80">সত্য ও সাহসের পক্ষে অবিচল</span>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                aria-label="মেনু বন্ধ করুন"
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick search shortcut */}
            <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] shrink-0">
              <Link
                href="/search"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:border-[var(--color-primary)] transition-colors"
              >
                <Search size={14} className="text-[var(--color-primary)]" />
                <span>যেকোনো সংবাদ অনুসন্ধান করুন...</span>
              </Link>
            </div>

            {/* Special Services Grid */}
            <div className="p-3 border-b border-[var(--color-border)] shrink-0 bg-[var(--color-bg)]">
              <div className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                বিশেষ সেবা ও ফিচারসমূহ
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  href="/live-score"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 font-semibold hover:brightness-95 transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shrink-0" />
                  <span className="truncate">লাইভ স্কোর</span>
                </Link>
                <Link
                  href="/fact-check"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400 font-semibold hover:brightness-95 transition-all"
                >
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                  <span className="truncate">ফ্যাক্ট-চেক</span>
                </Link>
                <Link
                  href="/epaper"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-[var(--color-primary)] font-semibold hover:brightness-95 transition-all"
                >
                  <Newspaper size={14} className="shrink-0" />
                  <span className="truncate">ই-পেপার</span>
                </Link>
                <Link
                  href="/audio-news"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-semibold hover:brightness-95 transition-all"
                >
                  <Headphones size={14} className="text-indigo-600 shrink-0" />
                  <span className="truncate">অডিও নিউজ</span>
                </Link>
                <Link
                  href="/history"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-400 font-semibold hover:brightness-95 transition-all"
                >
                  <History size={14} className="text-amber-600 shrink-0" />
                  <span className="truncate">ইতিহাস ও ৭১</span>
                </Link>
                <Link
                  href="/debates"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40 text-sky-800 dark:text-sky-400 font-semibold hover:brightness-95 transition-all"
                >
                  <Scale size={14} className="text-sky-600 shrink-0" />
                  <span className="truncate">জনমত বিতর্ক</span>
                </Link>
                <Link
                  href="/bookmarks"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text)] font-semibold hover:border-[var(--color-primary)] transition-all"
                >
                  <Bookmark size={14} className="text-[var(--color-primary)] shrink-0" />
                  <span className="truncate">সংরক্ষিত খবর</span>
                </Link>
                <Link
                  href="/notifications"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text)] font-semibold hover:border-[var(--color-primary)] transition-all"
                >
                  <Bell size={14} className="text-[var(--color-primary)] shrink-0" />
                  <span className="truncate">নোটিফিকেশন</span>
                </Link>
              </div>
            </div>

            {/* Mobile nav items */}
            <div className="py-2 flex-1">
              <div className="px-4 py-1.5 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                সংবাদ বিভাগসমূহ
              </div>
              <ul>
                {topLevelItems.map((item) => {
                  const children = items
                    .filter((i) => i.parentId === item.id && i.isActive)
                    .sort((a, b) => a.sortOrder - b.sortOrder);

                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        target={item.openInNewTab ? "_blank" : undefined}
                        rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                        className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text)] font-medium text-sm"
                        onClick={() => setIsMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                      {children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.href}
                          target={child.openInNewTab ? "_blank" : undefined}
                          rel={child.openInNewTab ? "noopener noreferrer" : undefined}
                          className="flex items-center px-8 py-2 border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] text-xs"
                          onClick={() => setIsMobileOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Drawer footer utilities */}
            <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] shrink-0 flex items-center justify-between text-xs">
              <Link
                href="/admin"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-1.5 font-bold text-[var(--color-primary)] hover:underline"
              >
                <Lock size={13} />
                <span>অ্যাডমিন পোর্টাল</span>
              </Link>
              <Link
                href="/archive"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <Calendar size={13} />
                <span>পুরোনো সংখ্যা</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
