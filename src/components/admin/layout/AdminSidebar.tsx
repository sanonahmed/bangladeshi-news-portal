"use client";

import { useState, useMemo, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  CheckSquare,
  FolderTree,
  Tag,
  Image as ImageIcon,
  Users,
  Shield,
  Layers,
  Compass,
  Zap,
  DollarSign,
  BarChart3,
  Settings,
  ScrollText,
  Video as VideoIcon,
  MessageSquare,
  Vote,
  Share2,
  Sparkles,
  ShieldCheck,
  Bell,
  Search,
  ExternalLink,
  X,
  Newspaper,
  SlidersHorizontal,
  BookOpen,
  LogOut,
  UserCircle,
} from "lucide-react";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { authClient } from "@/lib/auth-client";
import type { LucideIcon } from "lucide-react";

const isMobileViewport = () => window.matchMedia("(max-width: 1023px)").matches;
const subscribeToMobile = (listener: () => void) => {
  const query = window.matchMedia("(max-width: 1023px)");
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};

import { type UserRole, isRoleAtLeast } from "@/lib/permissions";

interface NavItemDef {
  key: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: string;
}

interface NavGroupDef {
  groupKey: string;
  items: NavItemDef[];
}

const NAV_GROUPS: NavGroupDef[] = [
  {
    groupKey: "group.overview",
    items: [
      {
        key: "menu.dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        exact: true,
      },
      { key: "menu.analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    groupKey: "group.newsroom",
    items: [
      {
        key: "menu.articles",
        href: "/admin/articles",
        icon: FileText,
        exact: true,
      },
      {
        key: "menu.newArticle",
        href: "/admin/articles/new",
        icon: PlusCircle,
        exact: true,
      },
      {
        key: "menu.profile",
        href: "/admin/profile",
        icon: UserCircle,
        exact: true,
      },
      { key: "menu.guidelines", href: "/admin/guidelines", icon: BookOpen },
      { key: "menu.reviews", href: "/admin/reviews", icon: CheckSquare },
      { key: "menu.aiAssistant", href: "/admin/ai-assistant", icon: Sparkles },
    ],
  },
  {
    groupKey: "group.live",
    items: [
      { key: "menu.breaking", href: "/admin/breaking-news", icon: Zap },
      { key: "menu.notifications", href: "/admin/notifications", icon: Bell },
      {
        key: "menu.socialPreview",
        href: "/admin/social-preview",
        icon: Share2,
      },
    ],
  },
  {
    groupKey: "group.engagement",
    items: [
      { key: "menu.factChecks", href: "/admin/fact-checks", icon: ShieldCheck },
      { key: "menu.polls", href: "/admin/polls", icon: Vote },
      { key: "menu.comments", href: "/admin/comments", icon: MessageSquare },
    ],
  },
  {
    groupKey: "group.media",
    items: [
      { key: "menu.media", href: "/admin/media", icon: ImageIcon },
      { key: "menu.videos", href: "/admin/videos", icon: VideoIcon },
    ],
  },
  {
    groupKey: "group.system",
    items: [
      { key: "menu.homepage", href: "/admin/homepage", icon: Layers },
      { key: "menu.categories", href: "/admin/categories", icon: FolderTree },
      { key: "menu.tags", href: "/admin/tags", icon: Tag },
      { key: "menu.navigation", href: "/admin/navigation", icon: Compass },
      { key: "menu.users", href: "/admin/users", icon: Users },
      { key: "menu.roles", href: "/admin/roles", icon: Shield },
      { key: "menu.ads", href: "/admin/advertisements", icon: DollarSign },
      {
        key: "menu.features",
        href: "/admin/features",
        icon: SlidersHorizontal,
      },
      { key: "menu.settings", href: "/admin/settings", icon: Settings },
      { key: "menu.auditLogs", href: "/admin/audit-logs", icon: ScrollText },
    ],
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose?: (returnFocus?: boolean) => void;
  sidebarRef: React.RefObject<HTMLElement | null>;
}

export function AdminSidebar({
  isOpen,
  onClose,
  sidebarRef,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const isMobile = useSyncExternalStore(
    subscribeToMobile,
    isMobileViewport,
    () => false,
  );
  const isInvisibleToA11y = !isOpen && isMobile;
  const { t, language } = useAdminLanguage();
  const [dbRole, setDbRole] = useState<UserRole | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/features")
      .then((res) => res.json())
      .then((data) => setFeatureFlags(data))
      .catch(() => {});

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.role) {
          setDbRole(data.user.role as UserRole);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const userRole: UserRole = dbRole || "reader";

  async function handleSignOut() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    try {
      await authClient.signOut();
    } catch {}
    window.location.href = "/login";
  }

  const ROUTE_ROLE_MAP: Record<string, UserRole> = useMemo(
    () => ({
      "/admin/settings": "super_admin",
      "/admin/features": "super_admin",
      "/admin/roles": "super_admin",
      "/admin/users": "admin",
      "/admin/audit-logs": "admin",
      "/admin/homepage": "admin",
      "/admin/categories": "admin",
      "/admin/tags": "admin",
      "/admin/navigation": "admin",
      "/admin/advertisements": "admin",
      "/admin/reviews": "editor",
      "/admin/breaking-news": "editor",
      "/admin/notifications": "editor",
      "/admin/social-preview": "editor",
      "/admin/fact-checks": "editor",
      "/admin/polls": "editor",
      "/admin/comments": "editor",
      "/admin/profile": "journalist",
    }),
    [],
  );

  const ROUTE_FEATURE_MAP: Record<string, string> = useMemo(
    () => ({
      "/admin/ai-assistant": "admin_ai_assistant",
      "/admin/advertisements": "admin_ads_manager",
      "/admin/audit-logs": "admin_audit_logs",
      "/admin/polls": "admin_polls_manager",
      "/admin/fact-checks": "admin_fact_check_manager",
      "/admin/comments": "admin_comments_moderation",
    }),
    [],
  );

  // Filter navigation items by search query, active feature flags, and role permissions
  const filteredGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return NAV_GROUPS.map((group) => {
      const groupLabel = t(group.groupKey).toLowerCase();
      const matchedItems = group.items.filter((item) => {
        // Role permission filter: hide items beyond user privilege level
        const requiredRole = ROUTE_ROLE_MAP[item.href];
        if (requiredRole && !isRoleAtLeast(userRole, requiredRole)) {
          return false;
        }

        // Feature flag filter: hide if feature flag is explicitly turned off
        const requiredFlag = ROUTE_FEATURE_MAP[item.href];
        if (requiredFlag && featureFlags[requiredFlag] === false) {
          return false;
        }

        if (!q) return true;

        const itemLabel = t(item.key).toLowerCase();
        return (
          itemLabel.includes(q) ||
          item.href.toLowerCase().includes(q) ||
          groupLabel.includes(q)
        );
      });
      return {
        ...group,
        items: matchedItems,
      };
    }).filter((group) => group.items.length > 0);
  }, [
    searchQuery,
    t,
    featureFlags,
    ROUTE_FEATURE_MAP,
    ROUTE_ROLE_MAP,
    userRole,
  ]);

  return (
    <aside
      ref={sidebarRef}
      id="admin-navigation"
      aria-label={language === "bn" ? "প্রশাসন নেভিগেশন" : "Admin navigation"}
      aria-modal={isOpen ? true : undefined}
      role={isOpen ? "dialog" : undefined}
      inert={isInvisibleToA11y ? true : undefined}
      className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-white/[0.06] bg-[#111827] text-slate-300 shadow-2xl transition-transform duration-300 ease-out lg:translate-x-0 lg:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Editorial Masthead */}
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/[0.06] px-5">
        <Link href="/admin" className="group flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-[11px] font-black tracking-wide text-white shadow-[0_5px_15px_-5px_rgba(99,102,241,0.65)]">
            YN
          </div>
          <div className="leading-tight">
            <span className="block text-[15px] font-bold tracking-tight text-white">
              {t("brand.title")}
            </span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t("brand.subtitle")}
            </span>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={() => onClose?.(true)}
            className="lg:hidden text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800"
            aria-label="Close menu"
          >
            <X size={17} />
          </button>
        )}
      </div>

      {/* Navigation search */}
      <div className="shrink-0 border-b border-white/[0.06] p-4 pb-5">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search.menu")}
            aria-label={t("search.menu")}
            className="w-full rounded-lg border border-white/[0.06] bg-[#0b1220] py-2.5 pl-8 pr-2.5 text-xs text-slate-200 outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
          />
        </div>
      </div>

      {/* Categorized Navigation Links */}
      <nav className="admin-nav-scroll flex-1 space-y-5 overflow-y-auto px-4 py-5 text-xs">
        {filteredGroups.length === 0 ? (
          <div className="p-4 text-center text-xs text-zinc-500">
            &ldquo;{searchQuery}&rdquo; {t("search.noMatch")}
          </div>
        ) : (
          filteredGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <div className="group-label mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                <span>{t(group.groupKey)}</span>
              </div>

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href ||
                      (item.href !== "/admin" &&
                        pathname.startsWith(item.href));
                  const Icon = item.icon;
                  const label = t(item.key);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onClose?.()}
                      className={`flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors ${
                        isActive
                          ? "bg-indigo-500/[0.13] font-semibold text-white ring-1 ring-inset ring-indigo-400/15"
                          : "text-slate-400 hover:bg-white/[0.045] hover:text-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          size={15}
                          className={`flex-shrink-0 ${
                            isActive ? "text-indigo-400" : "text-slate-500"
                          }`}
                        />
                        <span className="truncate">{label}</span>
                      </div>

                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-zinc-800 text-zinc-400">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </nav>

      {/* Portal & Sign Out Footer */}
      <div className="shrink-0 space-y-1 border-t border-white/[0.06] bg-[#0d1422] p-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between rounded-lg px-3 py-2 text-xs text-slate-400 transition-colors hover:bg-white/[0.045] hover:text-white"
        >
          <span className="flex items-center gap-2">
            <Newspaper size={14} className="text-zinc-400" />
            <span>{t("brand.viewSite")}</span>
          </span>
          <ExternalLink size={12} className="text-zinc-400" />
        </Link>

        <button
          onClick={handleSignOut}
          className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-rose-300 transition-colors hover:bg-rose-400/10 hover:text-rose-200"
        >
          <span className="flex items-center gap-2">
            <LogOut size={14} className="text-red-400" />
            <span>
              {language === "bn" ? "বার্তা কক্ষ থেকে প্রস্থান" : "Sign Out"}
            </span>
          </span>
        </button>
      </div>
    </aside>
  );
}
