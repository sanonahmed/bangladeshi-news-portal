import type { Metadata } from "next";
import { Mail, Phone, BarChart2 } from "lucide-react";

export const metadata: Metadata = {
  title: "বিজ্ঞাপন | বাংলা নিউজ",
  description: "বাংলা নিউজে বিজ্ঞাপন প্রচারের মাধ্যমে লাখো পাঠকের কাছে আপনার ব্র্যান্ড পৌঁছে দিন।",
};

export default function AdvertisePage() {
  return (
    <div className="max-w-[860px] mx-auto px-4 py-10 space-y-6">
      <div className="border-b-2 border-[var(--color-primary)] pb-3">
        <h1 className="bengali-serif-headline text-3xl font-extrabold text-[var(--color-text)]">
          বিজ্ঞাপন ও বিপণন
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          বিশ্বজুড়ে বাংলাভাষী কোটি পাঠকের কাছে আপনার ব্যবসা ও সেবা তুলে ধরুন
        </p>
      </div>

      <div className="article-body text-base leading-relaxed space-y-4">
        <p>
          বাংলা নিউজ দেশ-বিদেশের অন্যতম জনপ্রিয় ও বিশ্বস্ত ডিজিটাল সংবাদ মাধ্যম। প্রতিদিন লক্ষাধিক উচ্চশিক্ষিত, সচেতন ও সিদ্ধান্ত গ্রহণকারী পাঠক আমাদের প্ল্যাটফর্মে যুক্ত থাকেন। আপনার পণ্যের সঠিক প্রচারের জন্য আমাদের রয়েছে বৈচিত্র্যময় বিজ্ঞাপনী সমাধান।
        </p>

        <h2>বিজ্ঞাপনের ধরনসমূহ</h2>
        <ul>
          <li><strong>হেডার ও লিডারবোর্ড ব্যানার (Leaderboard):</strong> হোমপেজ ও সকল অভ্যন্তরীণ পাতার শীর্ষে সর্বোচ্চ দৃশ্যমানতা।</li>
          <li><strong>ইন-আর্টিকেল ব্যানার (In-article Ads):</strong> সংবাদের মূল পাঠের ভেতরে পাঠকদের আকর্ষণের কেন্দ্রবিন্দুতে।</li>
          <li><strong>স্পন্সরড কনটেন্ট ও স্পেশাল ফিচার:</strong> আপনার ব্র্যান্ডের বিস্তারিত গল্প ও উদ্ভাবন তুলে ধরতে কাস্টম আর্টিকেল।</li>
          <li><strong>ভিডিও স্পন্সরশিপ:</strong> আমাদের জনপ্রিয় ভিডিও প্রতিবেদনের শুরুতে বা মাঝে প্রি-রোল বিজ্ঞাপন।</li>
        </ul>

        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-6 my-6 space-y-3">
          <h3 className="font-bold text-lg text-[var(--color-text)]">বিজ্ঞাপন বিভাগের সাথে সরাসরি যোগাযোগ</h3>
          <p className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
            <Mail size={16} className="text-[var(--color-primary)]" />
            ইমেইল: ads@banglanews.com
          </p>
          <p className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
            <Phone size={16} className="text-[var(--color-primary)]" />
            ফোন / হোয়াটসঅ্যাপ: +৮৮০ ১৭০০-০০০০০১
          </p>
        </div>
      </div>
    </div>
  );
}
