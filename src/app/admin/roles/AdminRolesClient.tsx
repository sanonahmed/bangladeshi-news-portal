"use client";

import { useState } from "react";
import {
  Shield,
  ShieldCheck,
  Check,
  Minus,
  Users,
  Lock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { PERMISSIONS, type Permission, type UserRole } from "@/lib/permissions";

interface AdminRolesClientProps {
  roleCounts: Record<string, number>;
}

interface PermissionGroup {
  groupNameEn: string;
  groupNameBn: string;
  items: {
    key: Permission;
    labelEn: string;
    labelBn: string;
    descriptionEn: string;
    descriptionBn: string;
  }[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    groupNameEn: "Newsroom Articles & Publishing",
    groupNameBn: "সংবাদ রচনা ও প্রকাশনা",
    items: [
      {
        key: "article:create",
        labelEn: "Draft New Story",
        labelBn: "নতুন খসড়া রচনা",
        descriptionEn: "Compose new news drafts in Tiptap editor",
        descriptionBn: "টিপট্যাপ এডিটরে নতুন খসড়া তৈরি",
      },
      {
        key: "article:edit_own",
        labelEn: "Edit Own Articles",
        labelBn: "নিজের সংবাদ সম্পাদনা",
        descriptionEn: "Modify articles drafted by oneself",
        descriptionBn: "নিজের তৈরি করা প্রতিবেদন পরিবর্তন",
      },
      {
        key: "article:edit_any",
        labelEn: "Edit Any Newsroom Story",
        labelBn: "যেকোনো সংবাদ সম্পাদনা",
        descriptionEn: "Modify articles drafted by other journalists",
        descriptionBn: "যেকোনো সাংবাদিকের ড্রাফট বা প্রতিবেদন পরিবর্তন",
      },
      {
        key: "article:publish",
        labelEn: "Direct Publish to Portal",
        labelBn: "সরাসরি প্রকাশনা",
        descriptionEn: "Publish stories directly without editorial queue",
        descriptionBn: "রিভিউ কিউ ছাড়াই তাৎক্ষণিক লাইভ প্রকাশনা",
      },
      {
        key: "article:schedule",
        labelEn: "Schedule Future Publication",
        labelBn: "ভবিষ্যত প্রকাশনা নির্ধারণ",
        descriptionEn: "Set publication date and automated release timer",
        descriptionBn: "নির্দিষ্ট সময়ে স্বয়ংক্রিয় প্রকাশের সময় নির্ধারণ",
      },
      {
        key: "article:delete",
        labelEn: "Delete Published News",
        labelBn: "সংবাদ মুছে ফেলা",
        descriptionEn: "Permanently delete news articles from database",
        descriptionBn: "ডাটাবেজ থেকে স্থায়ীভাবে সংবাদ ডিলিট করা",
      },
    ],
  },
  {
    groupNameEn: "Editorial Review & Live Tickers",
    groupNameBn: "সম্পাদকীয় রিভিউ ও ব্রেকিং নিউজ",
    items: [
      {
        key: "article:submit_review",
        labelEn: "Submit to Review Queue",
        labelBn: "অনুমোদনের জন্য জমা",
        descriptionEn: "Send drafted story to desk editors",
        descriptionBn: "রিপোর্ট সম্পাদকের পর্যালোচনায় পাঠানো",
      },
      {
        key: "article:approve",
        labelEn: "Approve Submitted Draft",
        labelBn: "ড্রাফট অনুমোদন",
        descriptionEn: "Accept and push submitted story to live portal",
        descriptionBn: "জমাকৃত প্রতিবেদন অনুমোদন ও লাইভ করা",
      },
      {
        key: "article:reject",
        labelEn: "Reject / Request Revisions",
        labelBn: "প্রত্যাখ্যান ও সংশোধন",
        descriptionEn: "Send back with editorial notes to author",
        descriptionBn: "সংশোধনের জন্য ড্রাফট ফেরত পাঠানো",
      },
      {
        key: "site:breaking_news",
        labelEn: "Manage Breaking News Ticker",
        labelBn: "ব্রেকিং নিউজ টিকার পরিচালনা",
        descriptionEn: "Add, activate, and set priority for red flash bar",
        descriptionBn: "হোমপেজের জরুরি লাল ফ্লাশ বার নিয়ন্ত্রণ",
      },
    ],
  },
  {
    groupNameEn: "Media Library & Digital Assets",
    groupNameBn: "মিডিয়া লাইব্রেরি ও সম্পদ",
    items: [
      {
        key: "media:upload",
        labelEn: "Upload Photojournalism Assets",
        labelBn: "ছবি ও মিডিয়া আপলোড",
        descriptionEn: "Upload files to Cloudflare R2 storage",
        descriptionBn: "ক্লাউড স্টোরেজে ছবি ও ফাইল আপলোড",
      },
      {
        key: "media:delete_own",
        labelEn: "Delete Own Uploads",
        labelBn: "নিজের মিডিয়া মোছা",
        descriptionEn: "Remove media uploaded by oneself",
        descriptionBn: "নিজের আপলোড করা ফাইল ডিলিট করা",
      },
      {
        key: "media:delete_any",
        labelEn: "Delete Any Media Asset",
        labelBn: "যেকোনো মিডিয়া ফাইল মোছা",
        descriptionEn: "Remove any asset across the media library",
        descriptionBn: "লাইব্রেরির যেকোনো ফাইল স্থায়ীভাবে মোছা",
      },
    ],
  },
  {
    groupNameEn: "Administration, Security & Users",
    groupNameBn: "প্রশাসন, নিরাপত্তা ও ব্যবহারকারী",
    items: [
      {
        key: "user:manage",
        labelEn: "View Staff & Journalists",
        labelBn: "কর্মী ও সাংবাদিক তালিকা দেখা",
        descriptionEn: "Access user list and editorial bureau directory",
        descriptionBn: "সাংবাদিকদের তালিকা ও ব্যুরো ডিরেক্টরি দেখা",
      },
      {
        key: "user:assign_role",
        labelEn: "Assign Roles & Promote Staff",
        labelBn: "ভূমিকা পরিবর্তন ও পদোন্নতি",
        descriptionEn: "Modify RBAC user role permissions",
        descriptionBn: "ইউজারের ভূমিকা ও এক্সেস লেভেল পরিবর্তন",
      },
      {
        key: "user:ban",
        labelEn: "Suspend / Ban Accounts",
        labelBn: "অ্যাকাউন্ট স্থগিত বা ব্যান",
        descriptionEn: "Revoke login and publishing privileges",
        descriptionBn: "লগইন ও প্রকাশনার ক্ষমতা সাময়িকভাবে প্রত্যাহার",
      },
      {
        key: "site:settings",
        labelEn: "Portal Identity & System Settings",
        labelBn: "পোর্টাল পরিচয় ও সিস্টেম সেটিংস",
        descriptionEn: "Modify newspaper name, slogans, logos and API keys",
        descriptionBn: "পত্রিকার নাম, স্লোগান, লোগো ও এপিআই সেটিংস",
      },
      {
        key: "site:homepage",
        labelEn: "Homepage Layout Builder",
        labelBn: "হোমপেজ লেআউট বিন্যাস",
        descriptionEn: "Reorder and configure homepage dynamic sections",
        descriptionBn: "হোমপেজের সেকশন বিন্যাস ও সক্রিয়তা নিয়ন্ত্রণ",
      },
      {
        key: "site:ads",
        labelEn: "Ad Slots & Monetization",
        labelBn: "বিজ্ঞাপন স্লট ও মনিটাইজেশন",
        descriptionEn: "Manage display ad banners and script placements",
        descriptionBn: "ব্যানার বিজ্ঞাপন ও স্ক্রিপ্ট স্লট পরিচালনা",
      },
      {
        key: "audit:view",
        labelEn: "Inspect Security Audit Logs",
        labelBn: "নিরাপত্তা অডিট লগ পর্যবেক্ষণ",
        descriptionEn: "View immutable audit records of sensitive operations",
        descriptionBn: "সকল সংবেদনশীল পরিবর্তনের নিরাপত্তা রেকর্ড নিরীক্ষা",
      },
    ],
  },
];

const ORDERED_ROLES: { id: UserRole; titleEn: string; titleBn: string; badgeColor: string }[] = [
  { id: "super_admin", titleEn: "Super Admin", titleBn: "সুপার অ্যাডমিন", badgeColor: "bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-300" },
  { id: "admin", titleEn: "Admin", titleBn: "অ্যাডমিন", badgeColor: "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-300" },
  { id: "editor", titleEn: "Editor", titleBn: "সম্পাদক", badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300" },
  { id: "journalist", titleEn: "Journalist", titleBn: "প্রতিবেদক", badgeColor: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300" },
  { id: "reader", titleEn: "Reader", titleBn: "পাঠক", badgeColor: "bg-zinc-100 text-zinc-900 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300" },
];

export function AdminRolesClient({ roleCounts }: AdminRolesClientProps) {
  const { isEn, formatNumber } = useAdminLanguage();
  const [activeTab, setActiveTab] = useState<"matrix" | "cards">("matrix");

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2 tracking-tight">
            <Shield size={26} className="text-[var(--color-primary)]" />
            <span>{isEn ? "Role-Based Access Control (RBAC) Matrix" : "ভূমিকা ও পারমিশন কন্ট্রোল ম্যাট্রিক্স"}</span>
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {isEn
              ? "Security policies, authority boundaries and access permissions enforced across the digital newsroom"
              : "নিউজ রুমের প্রতিটি স্তরের সার্ভার-সাইড নিরাপত্তা নীতি, অধিকার সীমা ও অনুমতি বিন্যাস"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold rounded shadow-sm transition-colors cursor-pointer"
          >
            <Users size={15} />
            <span>{isEn ? "Manage Users & Staff" : "কর্মী ও ব্যবহারকারী পরিচালনা"}</span>
          </Link>
        </div>
      </div>

      {/* Role Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ORDERED_ROLES.map((r) => {
          const count = roleCounts[r.id] || 0;

          return (
            <div
              key={r.id}
              className="border border-[var(--color-border)] p-3 bg-[var(--color-bg)] rounded-lg space-y-1 shadow-2xs hover:border-[var(--color-primary)] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${r.badgeColor}`}>
                  {isEn ? r.titleEn : r.titleBn}
                </span>
                <span className="font-mono text-xs font-bold text-[var(--color-text)]">
                  {formatNumber(count)} {isEn ? "members" : "জন"}
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)] font-mono">
                role: {r.id}
              </p>
            </div>
          );
        })}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("matrix")}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
            activeTab === "matrix"
              ? "bg-[var(--color-primary)] text-white"
              : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]"
          }`}
        >
          {isEn ? "Interactive Permissions Matrix" : "ইন্টারেক্টিভ পারমিশন ছক"}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("cards")}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
            activeTab === "cards"
              ? "bg-[var(--color-primary)] text-white"
              : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]"
          }`}
        >
          {isEn ? "Role Responsibility Cards" : "দায়িত্ব ও ভূমিকা পরিচিতি"}
        </button>
      </div>

      {/* TAB 1: Permissions Matrix Table */}
      {activeTab === "matrix" && (
        <div className="space-y-6">
          {PERMISSION_GROUPS.map((group, gIdx) => (
            <div
              key={gIdx}
              className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded-xl overflow-hidden shadow-2xs"
            >
              <div className="p-3 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] flex items-center justify-between">
                <h3 className="font-bold text-xs text-[var(--color-text)]">
                  {isEn ? group.groupNameEn : group.groupNameBn}
                </h3>
                <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                  {formatNumber(group.items.length)} {isEn ? "Rules" : "টি নিয়ম"}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[var(--color-bg-secondary)]/40 border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-bold text-[11px]">
                    <tr>
                      <th className="p-3 w-1/3">{isEn ? "Capability / Action" : "ক্ষমতা ও অ্যাকশন"}</th>
                      {ORDERED_ROLES.map((r) => (
                        <th key={r.id} className="p-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] border ${r.badgeColor}`}>
                            {isEn ? r.titleEn : r.titleBn}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {group.items.map((perm) => {
                      const allowedRoles = (PERMISSIONS[perm.key] as readonly string[]) || [];

                      return (
                        <tr key={perm.key} className="hover:bg-[var(--color-bg-secondary)]/40 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-[var(--color-text)]">
                              {isEn ? perm.labelEn : perm.labelBn}
                            </div>
                            <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                              {isEn ? perm.descriptionEn : perm.descriptionBn}
                            </div>
                            <span className="font-mono text-[9px] text-[var(--color-text-faint)]">
                              key: {perm.key}
                            </span>
                          </td>

                          {ORDERED_ROLES.map((r) => {
                            const isAllowed = allowedRoles.includes(r.id);

                            return (
                              <td key={r.id} className="p-3 text-center">
                                {isAllowed ? (
                                  <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mx-auto shadow-2xs">
                                    <Check size={14} className="stroke-[2.5]" />
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 mx-auto">
                                    <Minus size={13} />
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Role Responsibility Cards */}
      {activeTab === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ORDERED_ROLES.map((r) => {
            const count = roleCounts[r.id] || 0;

            const descriptions: Record<string, { en: string; bn: string; bulletsEn: string[]; bulletsBn: string[] }> = {
              super_admin: {
                en: "Absolute authority across the portal. Responsible for database migrations, platform settings, security configurations, and user role promotions.",
                bn: "সম্পূর্ণ পোর্টালের সর্বোচ্চ ক্ষমতা। ডাটাবেজ নিরাপত্তা, কনফিগারেশন, ইউজার পদোন্নতি ও সকল সংবেদনশীল অ্যাকশন নিয়ন্ত্রণ করেন।",
                bulletsEn: [
                  "Promote or demote user roles",
                  "Modify newspaper brand settings and logo",
                  "Permanently purge articles or media",
                  "Inspect immutable security audit logs",
                ],
                bulletsBn: [
                  "ইউজারদের পদোন্নতি ও ভূমিকা পরিবর্তন",
                  "সংবাদপত্রের স্লোগান, লোগো ও সিস্টেম কনফিগারেশন",
                  "স্থায়ীভাবে সংবাদ বা মিডিয়া অপসারণ",
                  "নিরাপত্তা অডিট লগ পর্যবেক্ষণ",
                ],
              },
              admin: {
                en: "Editorial Administrator managing the day-to-day operations of the newsroom, staff assignments, advertising campaigns, and section layouts.",
                bn: "দৈনন্দিন সম্পাদকীয় নিউজরুম ব্যবস্থাপক। কর্মী অ্যাসাইনমেন্ট, বিজ্ঞাপন ক্যাম্পেইন ও হোমপেজ সেকশন নিয়ন্ত্রণ করেন।",
                bulletsEn: [
                  "Publish and manage news across all desks",
                  "Manage ad slots and monetization metrics",
                  "Configure homepage layout sections",
                  "Assign journalists to bureaus and desks",
                ],
                bulletsBn: [
                  "সকল বিভাগের সংবাদ প্রকাশ ও নিয়ন্ত্রণ",
                  "বিজ্ঞাপন স্লট ও মনিটাইজেশন ব্যবস্থাপনা",
                  "হোমপেজ লেআউট ও বিন্যাস পরিবর্তন",
                  "ব্যুরো ও সাংবাদিকদের দায়িত্ব বণ্টন",
                ],
              },
              editor: {
                en: "Senior Editor with editorial authority to review reporter submissions, approve publications, push breaking news tickers, and manage public polls.",
                bn: "জ্যেষ্ঠ সম্পাদক যিনি সাংবাদিকদের ড্রাফট পর্যালোচনা, অনুমোদন, ব্রেকিং নিউজ ফ্ল্যাশ এবং জনমত জরিপ পরিচালনা করেন।",
                bulletsEn: [
                  "Approve or return submitted drafts with feedback",
                  "Publish breaking news alerts immediately",
                  "Curate lead stories and headlines",
                  "Moderate reader comments and discussions",
                ],
                bulletsBn: [
                  "প্রতিবেদন অনুমোদন বা সংশোধনের নির্দেশ প্রদান",
                  "জরুরি ব্রেকিং নিউজ সরাসরি প্রচার",
                  "প্রধান শিরোনাম ও লিড স্টোরি নির্ধারণ",
                  "পাঠক মন্তব্য ও আলোচনা মডারেশন",
                ],
              },
              journalist: {
                en: "Field Reporter and Staff Correspondent tasked with gathering intelligence, writing news reports, uploading photojournalism assets, and submitting for review.",
                bn: "মাঠ পর্যায়ের প্রতিবেদক ও সাংবাদিক যিনি তথ্য সংগ্রহ, সংবাদ রচনা, ছবি আপলোড এবং রিভিউয়ের জন্য জমা দেন।",
                bulletsEn: [
                  "Draft new articles in rich Tiptap editor",
                  "Upload photos to media library",
                  "Submit stories to editorial review desk",
                  "Assign geographic location (district/division)",
                ],
                bulletsBn: [
                  "রিচ এডিটরে নতুন সংবাদ রচনা",
                  "মিডিয়া লাইব্রেরিতে ছবি ও ফটো আপলোড",
                  "অনুমোদনের জন্য নিউজ ডেস্কে ড্রাফট পাঠানো",
                  "জেলা ও বিভাগভিত্তিক অবস্থান ট্যাগিং",
                ],
              },
              reader: {
                en: "Verified public reader account. Can engage in civic debate, vote in online polls, bookmark stories for offline reading, and post comments.",
                bn: "সাধারণ নিবন্ধিত পাঠক অ্যাকাউন্ট। জনমত জরিপে ভোটদান, সংবাদ বুকমার্ক ও যাচাইকৃত মন্তব্য করার সুযোগ পান।",
                bulletsEn: [
                  "Bookmark favorite news articles",
                  "Cast verified vote in online polls",
                  "Submit comments on published articles",
                  "Customized local district news feed",
                ],
                bulletsBn: [
                  "পছন্দের সংবাদ বুকমার্ক করে রাখা",
                  "অনলাইন জনমত জরিপে ভোট প্রদান",
                  "সংবাদের নিচে মন্তব্য প্রকাশ",
                  "নিজ জেলার বিশেষ সংবাদ ফিড গ্রহণ",
                ],
              },
            };

            const info = descriptions[r.id] || {
              en: "Standard system role.",
              bn: "স্ট্যান্ডার্ড সিস্টেম ভূমিকা।",
              bulletsEn: [],
              bulletsBn: [],
            };

            return (
              <div
                key={r.id}
                className="border border-[var(--color-border)] p-5 bg-[var(--color-bg)] rounded-xl space-y-3 shadow-2xs hover:border-[var(--color-primary)] transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded border ${r.badgeColor}`}>
                      {isEn ? r.titleEn : r.titleBn}
                    </span>
                    <span className="font-mono text-xs font-bold text-[var(--color-text)]">
                      {formatNumber(count)} {isEn ? "members" : "জন সক্রিয়"}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--color-text)] leading-relaxed">
                    {isEn ? info.en : info.bn}
                  </p>

                  <div className="pt-2 border-t border-[var(--color-border)]">
                    <span className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">
                      {isEn ? "Key Authority Rights:" : "প্রধান অধিকারসমূহ:"}
                    </span>
                    <ul className="text-xs text-[var(--color-text-muted)] space-y-1 list-disc list-inside">
                      {(isEn ? info.bulletsEn : info.bulletsBn).map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-[var(--color-text-faint)]">
                    role_id: {r.id}
                  </span>
                  <Link
                    href={`/admin/users?role=${r.id}`}
                    className="text-[var(--color-primary)] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>{isEn ? "View Members" : "সদস্য তালিকা দেখুন"}</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
