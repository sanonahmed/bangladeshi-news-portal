import Link from "next/link";
import type { SiteSettings } from "@/types";

interface SiteFooterProps {
  settings: SiteSettings;
}

export function SiteFooter({ settings }: SiteFooterProps) {
  const year = new Date().getFullYear();

  const footerLinks = [
    { label: "আমাদের সম্পর্কে", href: "/about" },
    { label: "লাইভ স্পোর্টস স্কোরবোর্ড", href: "/live-score" },
    { label: "ডিজিটাল ই-পেপার", href: "/epaper" },
    { label: "ই-পেপার আর্কাইভ", href: "/epaper/archive" },
    { label: "মতামত জরিপ ও বিতর্ক ফোরাম", href: "/debates" },
    { label: "সংরক্ষিত সংবাদ (রিডিং লিস্ট)", href: "/bookmarks" },
    { label: "সাংবাদিক ও বার্তা দল", href: "/authors" },
    { label: "সারাদেশ সংবাদ হাব", href: "/saradesh" },
    { label: "আবহাওয়া ও নামাজের সময়সূচি", href: "/weather-prayer" },
    { label: "যোগাযোগ", href: "/contact" },
    { label: "সম্পাদকীয় নীতি", href: "/editorial-policy" },
    { label: "সংশোধনী নীতি", href: "/corrections-policy" },
    { label: "গোপনীয়তা নীতি", href: "/privacy-policy" },
    { label: "ব্যবহারের শর্তাবলী", href: "/terms" },
    { label: "বিজ্ঞাপন", href: "/advertise" },
  ];

  return (
    <footer className="bg-[var(--color-text)] text-white mt-12" role="contentinfo">
      <div className="max-w-[1400px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Editorial info */}
          <div className="md:col-span-2">
            <h2 className="bengali-headline text-2xl font-bold text-white mb-2">
              {settings.siteName}
            </h2>
            {settings.siteSlogan && (
              <p className="text-gray-400 text-sm mb-4">{settings.siteSlogan}</p>
            )}
            <div className="text-gray-400 text-sm space-y-1">
              <p>ভারপ্রাপ্ত সম্পাদক ও প্রকাশক: মোঃ আরিফুল ইসলাম</p>
              {settings.address && <p>ঠিকানা: {settings.address}</p>}
              {settings.contactEmail && (
                <p>
                  ইমেইল:{" "}
                  <a href={`mailto:${settings.contactEmail}`} className="hover:text-white underline">
                    {settings.contactEmail}
                  </a>
                </p>
              )}
              {settings.contactPhone && <p>ফোন: {settings.contactPhone}</p>}
            </div>
          </div>

          {/* Important Links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wide mb-3 text-gray-300">
              গুরুত্বপূর্ণ লিঙ্ক
            </h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* News Categories */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wide mb-3 text-gray-300">
              বিভাগসমূহ
            </h3>
            <ul className="space-y-2">
              {[
                { label: "জাতীয়", href: "/category/national" },
                { label: "রাজনীতি", href: "/category/politics" },
                { label: "আন্তর্জাতিক", href: "/category/international" },
                { label: "খেলাধুলা", href: "/category/sports" },
                { label: "বিনোদন", href: "/category/entertainment" },
                { label: "অর্থনীতি", href: "/category/economy" },
                { label: "প্রযুক্তি", href: "/category/technology" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {year} {settings.siteName}। সর্বস্বত্ব সংরক্ষিত।</p>
          <p>বাংলাদেশের অন্যতম নির্ভরযোগ্য জাতীয় অনলাইন দৈনিক</p>
        </div>
      </div>
    </footer>
  );
}
