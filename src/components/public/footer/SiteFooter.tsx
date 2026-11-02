"use client";

import Link from "next/link";
import {
  ArrowUp,
  Phone,
  Mail,
  MapPin,
  Newspaper,
  ShieldCheck,
  Activity,
  Headphones,
  History,
  Scale,
  Bookmark,
  Bell,
  CloudSun,
  Compass,
  Lock,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import {
  FacebookIcon,
  TwitterXIcon,
  YoutubeIcon,
  WhatsAppIcon,
  LinkedinIcon,
} from "@/components/ui/icons";
import { toBengaliDigits } from "@/lib/bengali-date";
import type { SiteSettings } from "@/types";

interface SiteFooterProps {
  settings: SiteSettings;
}

export function SiteFooter({ settings }: SiteFooterProps) {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const specialServices = [
    {
      label: "লাইভ স্কোর",
      href: "/live-score",
      icon: Activity,
      badge: "LIVE",
      badgeColor: "bg-red-600 text-white animate-pulse",
      accent: "text-red-400 group-hover:text-red-300",
    },
    {
      label: "ফ্যাক্ট-চেক কর্নার",
      href: "/fact-check",
      icon: ShieldCheck,
      badge: "সত্যসন্ধান",
      badgeColor: "bg-emerald-600 text-white",
      accent: "text-emerald-400 group-hover:text-emerald-300",
    },
    {
      label: "ডিজিটাল ই-পেপার",
      href: "/epaper",
      icon: Newspaper,
      accent: "text-rose-400 group-hover:text-rose-300",
    },
    {
      label: "অডিও নিউজ প্লেলিস্ট",
      href: "/audio-news",
      icon: Headphones,
      accent: "text-indigo-400 group-hover:text-indigo-300",
    },
    {
      label: "ইতিহাস ও ৭১ আর্কাইভ",
      href: "/history",
      icon: History,
      accent: "text-amber-400 group-hover:text-amber-300",
    },
    {
      label: "জনমত বিতর্ক ও জরিপ",
      href: "/debates",
      icon: Scale,
      accent: "text-sky-400 group-hover:text-sky-300",
    },
    {
      label: "সংরক্ষিত সংবাদ",
      href: "/bookmarks",
      icon: Bookmark,
      accent: "text-pink-400 group-hover:text-pink-300",
    },
    {
      label: "নোটিফিকেশন সেন্টার",
      href: "/notifications",
      icon: Bell,
      accent: "text-amber-400 group-hover:text-amber-300",
    },
    {
      label: "আবহাওয়া ও নামাজের সময়",
      href: "/weather-prayer",
      icon: CloudSun,
      accent: "text-teal-400 group-hover:text-teal-300",
    },
    {
      label: "সারাদেশ সংবাদ হাব",
      href: "/saradesh",
      icon: Compass,
      accent: "text-orange-400 group-hover:text-orange-300",
    },
  ];

  const categories = [
    { label: "জাতীয়", href: "/category/national" },
    { label: "রাজনীতি", href: "/category/politics" },
    { label: "আন্তর্জাতিক", href: "/category/international" },
    { label: "অর্থনীতি ও বাণিজ্য", href: "/category/economy" },
    { label: "খেলাধুলা", href: "/category/sports" },
    { label: "বিনোদন", href: "/category/entertainment" },
    { label: "বিজ্ঞান ও তথ্যপ্রযুক্তি", href: "/category/technology" },
    { label: "মতামত ও সম্পাদকীয়", href: "/opinion" },
    { label: "ভিডিও প্রতিবেদন", href: "/videos" },
    { label: "ছবি গ্যালারি", href: "/photos" },
  ];

  const aboutAndPolicies = [
    { label: "আমাদের সম্পর্কে", href: "/about" },
    { label: "যোগাযোগ ও ঠিকানা", href: "/contact" },
    { label: "বিজ্ঞাপন মূল্যতালিকা", href: "/advertise" },
    { label: "সাংবাদিক ও বার্তা দল", href: "/authors" },
    { label: "সম্পাদকীয় নীতিমালা", href: "/editorial-policy" },
    { label: "তথ্য সংশোধনী নীতি", href: "/corrections-policy" },
    { label: "গোপনীয়তা নীতি", href: "/privacy-policy" },
    { label: "ব্যবহারের শর্তাবলী", href: "/terms" },
    { label: "পুরোনো সংখ্যা আর্কাইভ", href: "/archive" },
    { label: "ই-পেপার আর্কাইভ", href: "/epaper/archive" },
  ];

  return (
    <footer
      className="bg-[#0F141C] text-gray-300 border-t-4 border-[#C8102E] mt-12 transition-colors selection:bg-[#C8102E] selection:text-white"
      role="contentinfo"
    >
      {/* 1. Top Bar: Brand Banner & Back to Top Button */}
      <div className="border-b border-gray-800/80 bg-[#0A0D13]">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span className="font-bold text-white text-sm">
              {settings.siteName || "দৈনিক বাংলাদেশ বার্তা"}
            </span>
            <span className="text-gray-600 hidden sm:inline">•</span>
            <span className="text-gray-400 hidden sm:inline text-[11px]">
              {settings.siteSlogan || "সত্য ও সাহসের পক্ষে অবিচল"}
            </span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800/80 hover:bg-[#C8102E] text-gray-300 hover:text-white text-xs font-semibold transition-all border border-gray-700/60 hover:border-[#C8102E] shadow-xs active:scale-95"
            aria-label="পৃষ্ঠার শীর্ষে ফিরে যান"
            title="পৃষ্ঠার শীর্ষে ফিরে যান"
          >
            <span>উপরে যান</span>
            <ArrowUp size={13} />
          </button>
        </div>
      </div>

      {/* 2. Main Footer Body */}
      <div className="max-w-[1400px] mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Brand, Publisher & Contact Card (lg: col 1-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-1">
                {settings.siteName || "দৈনিক বাংলাদেশ বার্তা"}
              </h2>
              <p className="text-xs text-[#B8860B] font-medium">
                জাতীয় দৈনিক সংবাদপত্র ও ডিজিটাল সংস্করণ
              </p>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              {settings.siteSlogan || "সত্য ও সাহসের পক্ষে অবিচল"}। নিরপেক্ষ সাংবাদিকতা ও বস্তুনিষ্ঠ সংবাদ পরিবেশনে দেশের শীর্ষস্থানীয় গণমাধ্যম।
            </p>

            {/* Quick Contact Micro-Cards (Ideal for Mobile Tapping) */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-gray-900/60 border border-gray-800/80">
                <MapPin size={15} className="text-[#C8102E] shrink-0 mt-0.5" />
                <div className="text-[11px] text-gray-300">
                  <p className="font-semibold text-white">প্রধান কার্যালয়:</p>
                  <p className="text-gray-400">{settings.address || "প্রগতি সরণি, বারিধারা, ঢাকা-১২১২, বাংলাদেশ"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {settings.contactPhone && (
                  <a
                    href={`tel:${settings.contactPhone}`}
                    className="flex items-center gap-2 p-2 rounded-lg bg-gray-900/60 border border-gray-800/80 hover:border-[#C8102E] text-[11px] text-gray-300 hover:text-white transition-colors"
                  >
                    <Phone size={13} className="text-emerald-500 shrink-0" />
                    <span className="truncate">{settings.contactPhone}</span>
                  </a>
                )}
                {settings.contactEmail && (
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="flex items-center gap-2 p-2 rounded-lg bg-gray-900/60 border border-gray-800/80 hover:border-[#C8102E] text-[11px] text-gray-300 hover:text-white transition-colors"
                  >
                    <Mail size={13} className="text-sky-400 shrink-0" />
                    <span className="truncate">{settings.contactEmail}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Social Follow Strip */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                সামাজিক মাধ্যমে যুক্ত থাকুন
              </p>
              <div className="flex items-center gap-2">
                {settings.facebookUrl && (
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#1877F2] text-gray-300 hover:text-white flex items-center justify-center transition-all shadow-xs"
                    title="ফেসবুক পেজ"
                  >
                    <FacebookIcon size={14} />
                  </a>
                )}
                {settings.twitterUrl && (
                  <a
                    href={settings.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X (Twitter)"
                    className="w-8 h-8 rounded-full bg-gray-800 hover:bg-black text-gray-300 hover:text-white flex items-center justify-center transition-all shadow-xs border border-transparent hover:border-gray-700"
                    title="টুইটার / এক্স হ্যান্ডেল"
                  >
                    <TwitterXIcon size={14} />
                  </a>
                )}
                {settings.youtubeUrl && (
                  <a
                    href={settings.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#FF0000] text-gray-300 hover:text-white flex items-center justify-center transition-all shadow-xs"
                    title="ইউটিউব চ্যানেল"
                  >
                    <YoutubeIcon size={14} />
                  </a>
                )}
                <a
                  href="https://whatsapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#25D366] text-gray-300 hover:text-white flex items-center justify-center transition-all shadow-xs"
                  title="হোয়াটসঅ্যাপ চ্যানেল"
                >
                  <WhatsAppIcon size={14} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#0A66C2] text-gray-300 hover:text-white flex items-center justify-center transition-all shadow-xs"
                  title="লিঙ্কডইন পেজ"
                >
                  <LinkedinIcon size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Special Services Column (lg: col 5-8) - Mobile 2-col interactive grid */}
          <div className="lg:col-span-4">
            <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-200">
                বিশেষ সেবা ও ফিচারসমূহ
              </h3>
              <span className="text-[10px] text-[#C8102E] font-bold">১০টি ফিচার</span>
            </div>

            {/* Mobile: 2-column touch-friendly cards. Desktop: 2-column compact list */}
            <div className="grid grid-cols-2 gap-2">
              {specialServices.map((service) => {
                const Icon = service.icon;
                return (
                  <Link
                    key={service.href}
                    href={service.href}
                    className="group flex items-center justify-between p-2 rounded-lg bg-gray-900/50 hover:bg-gray-800/80 border border-gray-800/80 hover:border-gray-700 transition-all text-xs"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Icon size={14} className={`${service.accent} shrink-0 transition-transform group-hover:scale-110`} />
                      <span className="truncate text-gray-300 group-hover:text-white font-medium text-[11px] sm:text-xs">
                        {service.label}
                      </span>
                    </div>
                    {service.badge && (
                      <span className={`text-[8px] font-bold px-1 py-0.2 rounded-full shrink-0 ml-1 ${service.badgeColor}`}>
                        {service.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Categories & Policies Columns (lg: col 9-12) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-6">
            
            {/* News Categories */}
            <div>
              <div className="mb-3 border-b border-gray-800 pb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-200">
                  বিভাগসমূহ
                </h3>
              </div>
              <ul className="space-y-1.5">
                {categories.map((cat) => (
                  <li key={cat.href}>
                    <Link
                      href={cat.href}
                      className="group flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      <ChevronRight size={11} className="text-gray-600 group-hover:text-[#C8102E] transition-colors" />
                      <span>{cat.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* About & Policies */}
            <div>
              <div className="mb-3 border-b border-gray-800 pb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-200">
                  নীতিমালা ও যোগাযোগ
                </h3>
              </div>
              <ul className="space-y-1.5">
                {aboutAndPolicies.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      <ChevronRight size={11} className="text-gray-600 group-hover:text-[#C8102E] transition-colors" />
                      <span className="truncate">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* 3. Editorial & Management Credentials Strip */}
        <div className="mt-8 pt-6 border-t border-gray-800/80 bg-gray-900/30 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-400 text-center md:text-left">
            <div>
              <p className="text-gray-300 font-semibold">ভারপ্রাপ্ত সম্পাদক ও প্রকাশক</p>
              <p className="text-white font-bold">মোঃ আরিফুল ইসলাম</p>
            </div>
            <div>
              <p className="text-gray-300 font-semibold">বার্তা ও বাণিজ্যিক কার্যালয়</p>
              <p className="text-gray-400 truncate">{settings.address || "প্রগতি সরণি, বারিধারা, ঢাকা-১২১২"}</p>
            </div>
            <div className="md:text-right">
              <p className="text-gray-300 font-semibold">নিবন্ধন ও সংস্করণ</p>
              <p className="text-gray-400">অনলাইন ও জাতীয় মুদ্রণ সংস্করণ</p>
            </div>
          </div>
        </div>

        {/* 4. Bottom Copyright & Admin Link */}
        <div className="mt-6 pt-4 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 text-center sm:text-left">
          <p>
            © {toBengaliDigits(currentYear)} {settings.siteName || "দৈনিক বাংলাদেশ বার্তা"}। সর্বস্বত্ব সংরক্ষিত।
          </p>

          <div className="flex items-center gap-3 text-[11px]">
            <Link
              href="/privacy-policy"
              className="hover:text-gray-300 transition-colors"
            >
              গোপনীয়তা
            </Link>
            <span>•</span>
            <Link
              href="/terms"
              className="hover:text-gray-300 transition-colors"
            >
              শর্তাবলী
            </Link>
            <span>•</span>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors font-medium"
            >
              <Lock size={11} />
              <span>অ্যাডমিন লগইন</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
