"use client";

import { useEffect, useRef, useState } from "react";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminTopNav } from "@/components/admin/layout/AdminTopNav";
import { AdminLanguageProvider } from "@/contexts/AdminLanguageContext";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const sidebar = sidebarRef.current;
    sidebar?.querySelector<HTMLButtonElement>("button")?.focus();
    const main = document.querySelector<HTMLElement>(".admin-main-content");
    main?.setAttribute("inert", "");
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !sidebar) return;
      const focusable = Array.from(
        sidebar.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), input",
        ),
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !sidebar.contains(document.activeElement))
      ) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      main?.removeAttribute("inert");
      previousFocus?.focus();
    };
  }, [sidebarOpen]);

  function closeSidebar(returnFocus = false) {
    setSidebarOpen(false);
    if (returnFocus) menuButtonRef.current?.focus();
  }

  return (
    <AdminLanguageProvider>
      <div className="min-h-screen bg-[var(--color-bg-secondary)] text-[var(--color-text)] flex">
        {/* Sidebar */}
        <AdminSidebar
          isOpen={sidebarOpen}
          sidebarRef={sidebarRef}
          onClose={closeSidebar}
        />

        {/* Main Content Area */}
        <div className="admin-main-content min-w-0 flex-1 flex flex-col lg:pl-[272px]">
          <AdminTopNav
            ref={menuButtonRef}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
          <main className="admin-workspace @container mx-auto w-full max-w-[1560px] flex-1 p-4 sm:p-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className="fixed inset-0 z-40 cursor-default bg-slate-950/50 backdrop-blur-[2px] lg:hidden"
            onClick={() => closeSidebar(true)}
          />
        )}
      </div>
    </AdminLanguageProvider>
  );
}
