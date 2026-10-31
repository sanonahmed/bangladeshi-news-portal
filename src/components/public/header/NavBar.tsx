"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X, Search } from "lucide-react";
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
        className={`bg-[var(--color-primary)] text-white z-50 transition-shadow duration-200 ${
          isSticky ? "fixed top-0 left-0 right-0 shadow-lg" : "relative"
        }`}
        aria-label="প্রধান নেভিগেশন"
      >
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex items-center">
            {/* Desktop nav items */}
            <ul className="hidden lg:flex items-center overflow-x-auto no-scrollbar">
              {topLevelItems.map((item) => {
                const children = items
                  .filter((i) => i.parentId === item.id && i.isActive)
                  .sort((a, b) => a.sortOrder - b.sortOrder);

                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <li key={item.id} className="relative flex-shrink-0">
                    {children.length > 0 ? (
                      <button
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === item.id ? null : item.id
                          )
                        }
                        className={`flex items-center gap-1 px-3 py-3 text-sm font-medium whitespace-nowrap hover:bg-[var(--color-primary-hover)] transition-colors ${
                          isActive ? "bg-[var(--color-primary-hover)]" : ""
                        }`}
                        aria-expanded={activeDropdown === item.id}
                        aria-haspopup="true"
                      >
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
                        className={`flex items-center px-3 py-3 text-sm font-medium whitespace-nowrap hover:bg-[var(--color-primary-hover)] transition-colors ${
                          isActive ? "bg-[var(--color-primary-hover)]" : ""
                        }`}
                      >
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
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          aria-hidden="true"
          onClick={() => setIsMobileOpen(false)}
        >
          <div
            id="mobile-menu"
            className="absolute top-0 left-0 h-full w-72 bg-[var(--color-bg)] shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="মোবাইল মেনু"
          >
            {/* Mobile menu header */}
            <div className="bg-[var(--color-primary)] px-4 py-3 flex items-center justify-between">
              <span className="text-white font-bold text-sm">মেনু</span>
              <button
                onClick={() => setIsMobileOpen(false)}
                aria-label="মেনু বন্ধ করুন"
                className="text-white hover:text-white/70 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile nav items */}
            <ul className="py-2">
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
                      className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text)] font-medium text-sm"
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
                        className="flex items-center px-8 py-2.5 border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] text-sm"
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
        </div>
      )}
    </>
  );
}
