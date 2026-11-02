"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";

interface NavGroup {
  groupTitle: string;
  items: Array<{
    label: string;
    href: string;
    icon: any;
    exact?: boolean;
    badge?: string;
  }>;
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupTitle: "ওভারভিউ",
    items: [
      { label: "ড্যাশবোর্ড", href: "/admin", icon: LayoutDashboard, exact: true },
      { label: "পাঠক বিশ্লেষণ ও মেট্রিক্স", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    groupTitle: "নিউজ রুম ও প্রকাশনা",
    items: [
      { label: "সংবাদ ব্যবস্থাপনা", href: "/admin/articles", icon: FileText, exact: true },
      { label: "নতুন সংবাদ রচনা", href: "/admin/articles/new", icon: PlusCircle, exact: true },
      { label: "পর্যালোচনা ও অনুমোদন", href: "/admin/reviews", icon: CheckSquare },
      { label: "এআই সহকারী", href: "/admin/ai-assistant", icon: Sparkles },
    ],
  },
  {
    groupTitle: "লাইভ ও সম্প্রচার",
    items: [
      { label: "ব্রেকিং নিউজ টিকার", href: "/admin/breaking-news", icon: Zap },
      { label: "পুশ নোটিফিকেশন সেন্টার", href: "/admin/notifications", icon: Bell },
      { label: "সোশ্যাল কার্ড প্রিভিউ", href: "/admin/social-preview", icon: Share2 },
    ],
  },
  {
    groupTitle: "পাঠক ও এনগেজমেন্ট",
    items: [
      { label: "ফ্যাক্ট-চেক কর্নার", href: "/admin/fact-checks", icon: ShieldCheck },
      { label: "অনলাইন ভোট ও জরিপ", href: "/admin/polls", icon: Vote },
      { label: "মন্তব্য মডারেশন", href: "/admin/comments", icon: MessageSquare },
    ],
  },
  {
    groupTitle: "মিডিয়া হাব",
    items: [
      { label: "মিডিয়া লাইব্রেরি", href: "/admin/media", icon: ImageIcon },
      { label: "ভিডিও সংবাদ", href: "/admin/videos", icon: VideoIcon },
    ],
  },
  {
    groupTitle: "প্রশাসন ও কনফিগারেশন",
    items: [
      { label: "হোমপেজ বিন্যাস", href: "/admin/homepage", icon: Layers },
      { label: "বিভাগ ও ক্যাটাগরি", href: "/admin/categories", icon: FolderTree },
      { label: "ট্যাগসমূহ", href: "/admin/tags", icon: Tag },
      { label: "নেভিগেশন মেনু", href: "/admin/navigation", icon: Compass },
      { label: "ব্যবহারকারী ও সাংবাদিক", href: "/admin/users", icon: Users },
      { label: "রোল ও পারমিশন", href: "/admin/roles", icon: Shield },
      { label: "বিজ্ঞাপন ব্যবস্থাপনা", href: "/admin/advertisements", icon: DollarSign },
      { label: "ওয়েবসাইট সেটিংস", href: "/admin/settings", icon: Settings },
      { label: "অডিট লগ", href: "/admin/audit-logs", icon: ScrollText },
    ],
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter navigation items by search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return NAV_GROUPS;
    const q = searchQuery.toLowerCase().trim();

    return NAV_GROUPS.map((group) => {
      const matchedItems = group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.href.toLowerCase().includes(q) ||
          group.groupTitle.toLowerCase().includes(q)
      );
      return {
        ...group,
        items: matchedItems,
      };
    }).filter((group) => group.items.length > 0);
  }, [searchQuery]);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111317] text-zinc-200 flex flex-col border-r border-zinc-800 transition-transform duration-200 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Editorial Masthead */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-800/80 bg-[#0d0f12]">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded bg-[var(--color-primary)] text-white font-serif font-black flex items-center justify-center text-sm shadow-xs">
            বা
          </div>
          <div className="leading-tight">
            <span
              className="text-sm font-bold tracking-tight text-white block"
              style={{ fontFamily: "var(--font-noto-bengali, sans-serif)" }}
            >
              দৈনিক বাংলাদেশ বার্তা
            </span>
            <span className="text-[11px] text-zinc-400 block">
              সম্পাদকীয় ডেস্ক
            </span>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800"
            aria-label="মেনু বন্ধ করুন"
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
            placeholder="মেনু খুঁজুন..."
            className="w-full pl-8 pr-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
          />
        </div>
      </div>

      {/* Categorized Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs scrollbar-thin scrollbar-thumb-zinc-800">
        {filteredGroups.length === 0 ? (
          <div className="p-4 text-center text-xs text-zinc-500">
            &ldquo;{searchQuery}&rdquo; মেলেনি
          </div>
        ) : (
          filteredGroups.map((group, gIdx) => (
            <div key={gIdx} className={`space-y-1 ${gIdx > 0 ? "pt-2 border-t border-zinc-900" : ""}`}>
              <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                <span>{group.groupTitle}</span>
              </div>

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href ||
                      (item.href !== "/admin" && pathname.startsWith(item.href));
                  const Icon = item.icon;

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
                        <span className="truncate">{item.label}</span>
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
            <span>পত্রিকার মূল পাতা</span>
          </span>
          <ExternalLink size={12} className="text-zinc-400" />
        </Link>
      </div>
    </aside>
  );
}
