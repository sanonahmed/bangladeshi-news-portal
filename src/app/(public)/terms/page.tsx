import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ব্যবহারের শর্তাবলী | বাংলা নিউজ",
  description: "বাংলা নিউজ পোর্টাল ব্যবহারের নিয়ম ও শর্তাবলী।",
};

export default function TermsPage() {
  return (
    <div className="max-w-[860px] mx-auto px-4 py-10 space-y-6">
      <div className="border-b-2 border-[var(--color-primary)] pb-3">
        <h1 className="bengali-serif-headline text-3xl font-extrabold text-[var(--color-text)]">
          ব্যবহারের শর্তাবলী (Terms of Service)
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          বাংলা নিউজ ওয়েবসাইট ও সেবা ব্যবহারের সার্বিক নিয়মাবলী
        </p>
      </div>

      <div className="article-body text-base leading-relaxed space-y-4">
        <h2>১. মেধা স্বত্বাধিকার</h2>
        <p>
          বাংলা নিউজে প্রকাশিত সকল সংবাদ, আলোকচিত্র, ভিডিওচিত্র, গ্রাফিক্স ও লোগো আমাদের নিজস্ব বা অনুমোদিত মেধা সম্পদ। কর্তৃপক্ষের লিখিত অনুমতি ব্যতীত কোনো লেখা, ছবি বা ভিডিও পুনঃপ্রকাশ বা বাণিজ্যিক উদ্দেশ্যে ব্যবহার কপিরাইট আইনের লঙ্ঘন বলে গণ্য হবে।
        </p>
        <h2>২. পাঠকদের মন্তব্য ও আচরণ</h2>
        <p>
          আমাদের প্রতিবেদনে পাঠকদের মতামতের সুযোগ রয়েছে। তবে অশ্লীল, মানহানিকর, জাতিগত বা ধর্মীয় বিদ্বেষমূলক কোনো মন্তব্য প্রচারের সুযোগ দেওয়া হয় না এবং সংশ্লিষ্ট অ্যাকাউন্ট স্থগিত করার অধিকার কর্তৃপক্ষ সংরক্ষণ করে।
        </p>
      </div>
    </div>
  );
}
