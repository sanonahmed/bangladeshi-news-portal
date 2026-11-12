import { getSiteSettings, updateSiteSettings } from "@/actions/settings";
import { Settings, Save, CheckCircle2, SlidersHorizontal } from "lucide-react";
import { safeRevalidateTag } from "@/lib/cache";
import { cookies } from "next/headers";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const cookieStore = await cookies();
  const isEn = cookieStore.get("admin_lang")?.value !== "bn";

  const settings = await getSiteSettings();

  async function handleSaveSettings(formData: FormData) {
    "use server";
    const updates: Record<string, string> = {
      site_name: formData.get("siteName") as string,
      site_slogan: formData.get("siteSlogan") as string,
      logo_url: formData.get("logoUrl") as string,
      contact_email: formData.get("contactEmail") as string,
      contact_phone: formData.get("contactPhone") as string,
      address: formData.get("address") as string,
      facebook_url: formData.get("facebookUrl") as string,
      twitter_url: formData.get("twitterUrl") as string,
      youtube_url: formData.get("youtubeUrl") as string,
      ga_measurement_id: formData.get("gaMeasurementId") as string,
    };

    await updateSiteSettings(updates);
    safeRevalidateTag("settings");
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2 tracking-tight">
          <Settings size={24} className="text-[var(--color-primary)]" />
          <span>{isEn ? "Portal Settings & System Configuration" : "ওয়েবসাইট সেটিংস ও কনফিগারেশন"}</span>
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          {isEn
            ? "Configure publication name, logo, editorial slogan, contact details and analytics credentials"
            : "সংবাদপত্রের নাম, লোগো, স্লোগান ও যোগাযোগের সার্বিক সেটিংস"}
        </p>

        {/* Setting Navigation Tabs */}
        <div className="flex items-center gap-2 pt-3 border-t border-[var(--color-border)] mt-4">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[var(--color-primary)] text-white shadow-xs">
            <Settings size={14} />
            <span>{isEn ? "General Identity Settings" : "সাধারণ সেটিংস ও পরিচয়"}</span>
          </div>
          <Link
            href="/admin/features"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors border border-transparent hover:border-[var(--color-border)]"
          >
            <SlidersHorizontal size={14} />
            <span>{isEn ? "Feature Toggles & Controls" : "ফিচার কন্ট্রোল ও সুইচ"}</span>
          </Link>
        </div>
      </div>

      <form action={handleSaveSettings} className="space-y-6">
        {/* Newspaper Identity */}
        <div className="border border-[var(--color-border)] p-5 bg-[var(--color-bg)] space-y-4 rounded">
          <h2 className="text-sm font-bold text-[var(--color-text)] border-b border-[var(--color-border)] pb-2">
            {isEn ? "Publication Brand Identity" : "সংবাদপত্রের পরিচিতি"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                {isEn ? "Publication Name *" : "সংবাদপত্রের নাম *"}
              </label>
              <input
                type="text"
                name="siteName"
                defaultValue={settings.siteName}
                required
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] font-bold rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                {isEn ? "Editorial Slogan" : "স্লোগান"}
              </label>
              <input
                type="text"
                name="siteSlogan"
                defaultValue={settings.siteSlogan}
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
              {isEn ? "Logo Image URL (R2 / CDN Link)" : "লোগো URL (R2 বা ইমেজ লিঙ্ক)"}
            </label>
            <input
              type="text"
              name="logoUrl"
              defaultValue={settings.logoUrl}
              placeholder="https://..."
              className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="border border-[var(--color-border)] p-5 bg-[var(--color-bg)] space-y-4 rounded">
          <h2 className="text-sm font-bold text-[var(--color-text)] border-b border-[var(--color-border)] pb-2">
            {isEn ? "Editorial Office & Contact" : "যোগাযোগ ও কার্যালয়"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                {isEn ? "Editorial Desk Email" : "সম্পাদকীয় ইমেইল"}
              </label>
              <input
                type="email"
                name="contactEmail"
                defaultValue={settings.contactEmail}
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                {isEn ? "Newsroom Phone" : "ফোন নম্বর"}
              </label>
              <input
                type="text"
                name="contactPhone"
                defaultValue={settings.contactPhone}
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
              {isEn ? "Bureau Headquarters Address" : "কার্যালয়ের ঠিকানা"}
            </label>
            <input
              type="text"
              name="address"
              defaultValue={settings.address}
              className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="border border-[var(--color-border)] p-5 bg-[var(--color-bg)] space-y-4 rounded">
          <h2 className="text-sm font-bold text-[var(--color-text)] border-b border-[var(--color-border)] pb-2">
            {isEn ? "Social Networks & Analytics" : "সামাজিক যোগাযোগ মাধ্যম ও অ্যানালিটিক্স"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                Facebook URL
              </label>
              <input
                type="url"
                name="facebookUrl"
                defaultValue={settings.facebookUrl}
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                X (Twitter) URL
              </label>
              <input
                type="url"
                name="twitterUrl"
                defaultValue={settings.twitterUrl}
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                YouTube URL
              </label>
              <input
                type="url"
                name="youtubeUrl"
                defaultValue={settings.youtubeUrl}
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
              Google Analytics 4 Measurement ID
            </label>
            <input
              type="text"
              name="gaMeasurementId"
              defaultValue={settings.googleAnalyticsId}
              placeholder="G-XXXXXXXXXX"
              className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-mono focus:outline-none focus:border-[var(--color-primary)] rounded"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-sm rounded cursor-pointer"
        >
          <Save size={16} />
          <span>{isEn ? "Save Configuration" : "সেটিংস সংরক্ষণ করুন"}</span>
        </button>
      </form>
    </div>
  );
}
