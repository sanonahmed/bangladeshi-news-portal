import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে | বাংলা নিউজ",
  description: "বাংলা নিউজের লক্ষ্য, নীতি ও সাংগঠনিক পরিচিতি।",
};

export default function AboutPage() {
  return (
    <div className="max-w-[860px] mx-auto px-4 py-10 space-y-6">
      <div className="border-b-2 border-[var(--color-primary)] pb-3">
        <h1 className="bengali-serif-headline text-3xl font-extrabold text-[var(--color-text)]">
          আমাদের সম্পর্কে
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          সত্যনিষ্ঠ সাংবাদিকতার প্রত্যয়ে প্রতিষ্ঠিত জাতীয় অনলাইন সংবাদপত্র
        </p>
      </div>

      <div className="article-body text-base leading-relaxed space-y-4">
        <p>
          <strong>বাংলা নিউজ</strong> বাংলাদেশের একটি অগ্রণী, আধুনিক এবং বস্তুনিষ্ঠ অনলাইন সংবাদ মাধ্যম। আমরা সত্য, ন্যায় ও দায়িত্বশীল সাংবাদিকতায় বিশ্বাসী। দেশ ও বিদেশের সকল গুরুত্বপূর্ণ ঘটনা, রাজনীতি, অর্থনীতি, ক্রীড়া ও সংস্কৃতির তাৎক্ষণিক ও বিশ্লেষণধর্মী খবর সাধারণ মানুষের কাছে পৌঁছে দেওয়াই আমাদের মূল লক্ষ্য।
        </p>

        <h2>আমাদের সম্পাদকীয় লক্ষ্য</h2>
        <p>
          একটি প্রগতিশীল, গণতান্ত্রিক ও মানবিক বাংলাদেশ বিনির্মাণে মুক্ত গণমাধ্যম অপরিহার্য। আমরা কোনো রাজনৈতিক দল, গোষ্ঠী বা করপোরেট স্বার্থের পক্ষপাত না করে সর্বদা জনগণের স্বার্থে ও দেশের কল্যাণে সংবাদ পরিবেশন করে থাকি।
        </p>

        <h2>সাংগঠনিক কাঠামো</h2>
        <p>
          আমাদের দক্ষ ও পেশাদার সাংবাদিক, সম্পাদক ও প্রযুক্তিবিদ দল ২৪ ঘণ্টা সত্যনিষ্ঠ তথ্য যাচাই ও সংবাদ পরিবেশনে নিয়োজিত। রাজধানী ঢাকা থেকে শুরু করে দেশের প্রতিটি জেলা ও প্রত্যন্ত অঞ্চলে আমাদের নিজস্ব প্রতিনিধিরা কর্মরত আছেন।
        </p>

        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-6 my-6 space-y-2">
          <h3 className="font-bold text-lg text-[var(--color-text)]">কার্যালয়ের ঠিকানা ও যোগাযোগ</h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            প্রধান কার্যালয়: প্রগতি টাওয়ার, কারওয়ান বাজার, ঢাকা-১২১৫, বাংলাদেশ
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">
            ইমেইল: editor@banglanews.com | ফোন: +৮৮০ ১৭০০-০০০০০০
          </p>
        </div>
      </div>
    </div>
  );
}
