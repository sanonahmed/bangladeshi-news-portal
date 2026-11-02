"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
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
} from "lucide-react";

const NAV_ITEMS = [
  { label: "ড্যাশবোর্ড", href: "/admin", icon: LayoutDashboard },
  { label: "সংবাদ ব্যবস্থাপনা", href: "/admin/articles", icon: FileText },
  { label: "এআই সহকারী", href: "/admin/ai-assistant", icon: Sparkles },
  { label: "ফ্যাক্ট-চেক কর্নার", href: "/admin/fact-checks", icon: ShieldCheck },
  { label: "পর্যালোচনা ও অনুমোদন", href: "/admin/reviews", icon: CheckSquare },
  { label: "পাঠক মন্তব্য মডারেশন", href: "/admin/comments", icon: MessageSquare },
  { label: "অনলাইন ভোট ও জরিপ", href: "/admin/polls", icon: Vote },
  { label: "বিভাগ ও ক্যাটাগরি", href: "/admin/categories", icon: FolderTree },
  { label: "ট্যাগসমূহ", href: "/admin/tags", icon: Tag },
  { label: "মিডিয়া লাইব্রেরি", href: "/admin/media", icon: ImageIcon },
  { label: "ভিডিও সংবাদ", href: "/admin/videos", icon: VideoIcon },
  { label: "ব্যবহারকারী ও সাংবাদিক", href: "/admin/users", icon: Users },
  { label: "রোল ও পারমিশন", href: "/admin/roles", icon: Shield },
  { label: "হোমপেজ সেকশন", href: "/admin/homepage", icon: Layers },
  { label: "নেভিগেশন মেনু", href: "/admin/navigation", icon: Compass },
  { label: "ব্রেকিং নিউজ", href: "/admin/breaking-news", icon: Zap },
  { label: "বিজ্ঞাপন ব্যবস্থাপনা", href: "/admin/advertisements", icon: DollarSign },
  { label: "সোশ্যাল কার্ড প্রিভিউ", href: "/admin/social-preview", icon: Share2 },
  { label: "পাঠক বিশ্লেষণ ও মেট্রিক্স", href: "/admin/analytics", icon: BarChart3 },
  { label: "ওয়েবসাইট সেটিংস", href: "/admin/settings", icon: Settings },
  { label: "অডিট লগ", href: "/admin/audit-logs", icon: ScrollText },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 text-zinc-100 flex flex-col border-r border-zinc-800 transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Brand Masthead */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[var(--color-primary)]"></span>
          <span
            className="text-xl font-bold tracking-tight text-white"
            style={{ fontFamily: "var(--font-noto-bengali, sans-serif)" }}
          >
            সম্পাদকীয় প্যানেল
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-zinc-400 hover:text-white">
            ✕
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                isActive
                  ? "bg-[var(--color-primary)] text-white font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Portal Quick Link */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
        <Link
          href="/"
          target="_blank"
          className="block text-center text-xs text-zinc-400 hover:text-white py-1.5 border border-zinc-700 rounded transition-colors"
        >
          পত্রিকা ওয়েবসাইট দেখুন &rarr;
        </Link>
      </div>
    </aside>
  );
}
