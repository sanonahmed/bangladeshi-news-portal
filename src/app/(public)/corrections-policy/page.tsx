import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "সংশোধনী নীতি | বাংলা নিউজ",
  description: "বাংলা নিউজের ভুল সংশোধন ও স্বচ্ছতা রক্ষা বিষয়ক নীতিমালা।",
};

export default function CorrectionsPolicyPage() {
  return (
    <div className="max-w-[860px] mx-auto px-4 py-10 space-y-6">
      <div className="border-b-2 border-[var(--color-primary)] pb-3">
        <h1 className="bengali-serif-headline text-3xl font-extrabold text-[var(--color-text)]">
          সংশোধনী নীতি (Corrections Policy)
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          ভুল স্বীকার ও স্বচ্ছতা রক্ষার ক্ষেত্রে আমাদের সুস্পষ্ট অঙ্গীকার
        </p>
      </div>

      <div className="article-body text-base leading-relaxed space-y-4">
        <p>
          বাংলা নিউজ তথ্যের শতভাগ যথার্থতা নিশ্চিতে প্রতিশ্রুতিবদ্ধ। সাংবাদিকতার প্রক্রিয়ায় অনিচ্ছাকৃত কোনো তথ্যগত ত্রুটি বা ভুল পরিলক্ষিত হলে আমরা তা গোপন না করে দ্রুততম সময়ে সংশোধন ও স্বচ্ছতার সাথে পাঠকদের অবগত করি।
        </p>

        <h2>১. সংশোধন প্রকাশের পদ্ধতি</h2>
        <p>
          যদি কোনো প্রকাশিত প্রতিবেদনে তথ্যগত বা সংখ্যাগত ভুল থাকে, তবে তা সংশোধনের পর সংশ্লিষ্ট প্রতিবেদনের ঠিক শুরুতে বা শেষে একটি দৃশ্যমান <strong>&ldquo;সংশোধনী বিজ্ঞপ্তি&rdquo;</strong> সংযুক্ত করা হয়। সেখানে কি সংশোধন করা হয়েছে এবং সংশোধনের সুনির্দিষ্ট সময় উল্লেখ থাকে।
        </p>

        <h2>২. নিরব পরিবর্তন নিষিদ্ধ</h2>
        <p>
          আমাদের কোনো সম্পাদক বা সাংবাদিক পূর্ববর্তী প্রকাশিত প্রতিবেদনের মূল তথ্য নীরবে বা অগোচরে পরিবর্তন করতে পারবেন না। পাঠকের আস্থার স্বার্থে সংশোধন ইতিহাস অপরিবর্তনীয় ও উন্মুক্ত থাকে।
        </p>

        <h2>৩. ভুলের তথ্য জানানোর ঠিকানা</h2>
        <p>
          আমাদের প্রকাশিত কোনো সংবাদে ভুল দেখতে পেলে যেকোনো সচেতন পাঠক আমাদের বার্তা বিভাগে সরাসরি ইমেইল করতে পারেন: <code>corrections@banglanews.com</code>।
        </p>
      </div>
    </div>
  );
}
