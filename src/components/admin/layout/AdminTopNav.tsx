"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Menu, LogOut, User, Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface AdminTopNavProps {
  onToggleSidebar: () => void;
}

export function AdminTopNav({ onToggleSidebar }: AdminTopNavProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  const userName = session?.user?.name ?? "সম্পাদক";
  const userRole = (session?.user as any)?.role ?? "admin";

  return (
    <header className="h-16 bg-[var(--color-bg)] border-b border-[var(--color-border)] flex items-center justify-between px-4 lg:px-8 z-40 sticky top-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          aria-label="মেনু খুলুন"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:block text-xs font-semibold text-[var(--color-text-muted)]">
          বাংলা নিউজ ডিজিটাল পাবলিশিং ম্যানেজমেন্ট সিস্টেম
        </div>
      </div>

      <div className="flex items-center gap-3">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors rounded"
            aria-label="থিম পরিবর্তন"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        )}

        <div className="flex items-center gap-3 border-l border-[var(--color-border)] pl-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-xs">
              {userName.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-[var(--color-text)]">{userName}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">
                {userRole}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            title="লগআউট"
            className="p-2 text-zinc-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
