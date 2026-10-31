import type { Metadata } from "next";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export const metadata: Metadata = {
  title: "যোগাযোগ | বাংলা নিউজ",
  description: "বাংলা নিউজ সম্পাদকীয় ও বার্তা বিভাগের সাথে যোগাযোগের মাধ্যম।",
};

export default function ContactPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-4 py-10">
      <div className="border-b-2 border-[var(--color-primary)] pb-3 mb-8">
        <h1 className="bengali-serif-headline text-3xl font-extrabold text-[var(--color-text)]">
          যোগাযোগ করুন
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          যেকোনো তথ্য, সংবাদের সূত্র, বিজ্ঞাপনী পরামর্শ বা মতামতের জন্য আমাদের লিখুন
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact info */}
        <div className="md:col-span-5 space-y-6">
          <div className="border border-[var(--color-border)] p-6 bg-[var(--color-bg-secondary)] space-y-4">
            <h2 className="font-bold text-lg text-[var(--color-text)] border-b border-[var(--color-border)] pb-2">
              ঠিকানা ও তথ্য
            </h2>
            <div className="flex items-start gap-3 text-sm">
              <MapPin size={18} className="text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
              <div>
                <strong>কার্যালয়:</strong>
                <p className="text-[var(--color-text-muted)] mt-0.5">
                  প্রগতি টাওয়ার, কারওয়ান বাজার, ঢাকা-১২১৫, বাংলাদেশ
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Phone size={18} className="text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
              <div>
                <strong>টেলিফোন:</strong>
                <p className="text-[var(--color-text-muted)] mt-0.5">+৮৮০ ১৭০০-০০০০০০</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Mail size={18} className="text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
              <div>
                <strong>ইমেইল:</strong>
                <p className="text-[var(--color-text-muted)] mt-0.5">newsdesk@banglanews.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="md:col-span-7">
          <form className="border border-[var(--color-border)] p-6 bg-[var(--color-bg)] space-y-4">
            <h2 className="font-bold text-lg text-[var(--color-text)] border-b border-[var(--color-border)] pb-2">
              বার্তা পাঠান
            </h2>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                আপনার নাম *
              </label>
              <input
                type="text"
                required
                className="w-full p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                placeholder="পূর্ণ নাম লিখুন"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                ইমেইল ঠিকানা *
              </label>
              <input
                type="email"
                required
                className="w-full p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                বিষয়
              </label>
              <input
                type="text"
                className="w-full p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                placeholder="বার্তার বিষয়বস্তু"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                বার্তা *
              </label>
              <textarea
                required
                rows={4}
                className="w-full p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                placeholder="আপনার বার্তা বিস্তারিত লিখুন..."
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Send size={16} />
              পাঠিয়ে দিন
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
