import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "গোপনীয়তা নীতি | বাংলা নিউজ",
  description: "ব্যবহারকারীদের ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষা বিষয়ক নীতিমালা।",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-[860px] mx-auto px-4 py-10 space-y-6">
      <div className="border-b-2 border-[var(--color-primary)] pb-3">
        <h1 className="bengali-serif-headline text-3xl font-extrabold text-[var(--color-text)]">
          গোপনীয়তা নীতি
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          আপনার তথ্যের সর্বোচ্চ নিরাপত্তা নিশ্চিতে আমরা প্রতিশ্রুতিবদ্ধ
        </p>
      </div>

      <div className="article-body text-base leading-relaxed space-y-4">
        <p>
          বাংলা নিউজ আপনার তথ্যের গোপনীয়তা রক্ষা করতে শ্রদ্ধাশীল। আমাদের পোর্টাল ব্যবহার করার মাধ্যমে আপনি এই গোপনীয়তা নীতিমালায় বর্ণিত শর্তাবলী মেনে নিচ্ছেন।
        </p>
        <h2>তথ্য সংগ্রহ ও ব্যবহার</h2>
        <p>
          পাঠক যখন আমাদের নিউজলেটার সাবস্ক্রাইব করেন বা অ্যাকাউন্ট তৈরি করেন, তখন আমরা নাম ও ইমেইল ঠিকানা সংগ্রহ করি। আমরা কখনোই আপনার ব্যক্তিগত তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রয় বা বাণিজ্যিক উদ্দেশ্যে হস্তান্তর করি না।
        </p>
        <h2>কুকিজ (Cookies)</h2>
        <p>
          ওয়েবসাইটের পাঠযোগ্যতা বৃদ্ধি, পাঠকসংখ্যা বিশ্লেষণ ও প্রাসঙ্গিক বিজ্ঞাপন প্রদর্শনের জন্য আমরা কুকিজ ব্যবহার করি। আপনি যেকোনো সময় আপনার ব্রাউজার সেটিংসে কুকিজ নিয়ন্ত্রণ বা নিষ্ক্রিয় করতে পারেন।
        </p>
      </div>
    </div>
  );
}
