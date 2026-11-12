"use client";

import { useState, useMemo, useEffect } from "react";
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
  Newspaper,
  SlidersHorizontal,
  BookOpen,
} from "lucide-react";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { authClient } from "@/lib/auth-client";
import { type UserRole, isRoleAtLeast } from "@/lib/permissions";

interface NavItemDef {
  key: string;
  href: string;
  icon: any;
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
      { key: "menu.dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
      { key: "menu.analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    groupKey: "group.newsroom",
    items: [
      { key: "menu.articles", href: "/admin/articles", icon: FileText, exact: true },
      { key: "menu.newArticle", href: "/admin/articles/new", icon: PlusCircle, exact: true },
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
      { key: "menu.socialPreview", href: "/admin/social-preview", icon: Share2 },
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
      { key: "menu.features", href: "/admin/features", icon: SlidersHorizontal },
      { key: "menu.settings", href: "/admin/settings", icon: Settings },
      { key: "menu.auditLogs", href: "/admin/audit-logs", icon: ScrollText },
    ],
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { t, language } = useAdminLanguage();
  const { data: session } = authClient.useSession();
  const userRole: UserRole = ((session?.user as any)?.role as UserRole) || "admin";
  const [searchQuery, setSearchQuery] = useState("");
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/features")
      .then((res) => res.json())
      .then((data) => setFeatureFlags(data))
      .catch(() => {});
  }, [pathname]);

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
    }),
    []
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
    []
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
  }, [searchQuery, t, featureFlags, ROUTE_FEATURE_MAP, ROUTE_ROLE_MAP, userRole]);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111317] text-zinc-200 flex flex-col border-r border-zinc-800 transition-transform duration-200 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Editorial Masthead */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-800/80 bg-[#0d0f12]">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded bg-[var(--color-primary)] text-white font-serif font-black flex items-center justify-center text-sm shadow-xs select-none">
            {language === "bn" ? "বা" : "BB"}
          </div>
          <div className="leading-tight">
            <span
              className="text-sm font-bold tracking-tight text-white block truncate max-w-[150px]"
              style={language === "bn" ? { fontFamily: "var(--font-noto-bengali, sans-serif)" } : undefined}
            >
              {t("brand.title")}
            </span>
            <span className="text-[11px] text-zinc-400 block">
              {t("brand.subtitle")}
            </span>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800"
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>

      {/* Clean Search Input */}
      <div className="p-3 border-b border-zinc-800/60 bg-[#111317]">
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
            className="w-full pl-8 pr-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
          />
        </div>
      </div>

      {/* Categorized Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs scrollbar-thin scrollbar-thumb-zinc-800">
        {filteredGroups.length === 0 ? (
          <div className="p-4 text-center text-xs text-zinc-500">
            &ldquo;{searchQuery}&rdquo; {t("search.noMatch")}
          </div>
        ) : (
          filteredGroups.map((group, gIdx) => (
            <div key={gIdx} className={`space-y-1 ${gIdx > 0 ? "pt-2 border-t border-zinc-900" : ""}`}>
              <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                <span>{t(group.groupKey)}</span>
              </div>

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href ||
                      (item.href !== "/admin" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  const label = t(item.key);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-2.5 py-2 rounded transition-colors ${
                        isActive
                          ? "bg-zinc-800 text-white font-semibold border-l-2 border-[var(--color-primary)]"
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          size={15}
                          className={`flex-shrink-0 ${
                            isActive ? "text-[var(--color-primary)]" : "text-zinc-400"
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

      {/* Portal Link */}
      <div className="p-3 border-t border-zinc-800/80 bg-[#0d0f12]">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between text-xs text-zinc-400 hover:text-white py-1.5 px-2.5 rounded hover:bg-zinc-800/80 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Newspaper size={14} className="text-zinc-400" />
            <span>{t("brand.viewSite")}</span>
          </span>
          <ExternalLink size={12} className="text-zinc-400" />
        </Link>
      </div>
    </aside>
  );
}
