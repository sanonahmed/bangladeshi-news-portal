import { BookOpen, CheckCircle, AlertTriangle, Shield, FileText, Sparkles, Scale, Camera, Eye, HelpCircle } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "সাংবাদিক ও বার্তাকক্ষ নির্দেশিকা (Editorial Guidelines & SOP) | Admin",
  description: "Standard Operating Procedures, code of journalistic ethics and workflow guide for reporters and editors",
};

export default async function AdminGuidelinesPage() {
  const cookieStore = await cookies();
  const isEn = cookieStore.get("admin_lang")?.value === "bn" ? false : false; // Default Bengali for local newsroom

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-900 via-zinc-900 to-black text-white p-6 sm:p-8 rounded-xl shadow-md border border-red-800/40 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-200 text-xs font-semibold mb-3">
            <BookOpen size={14} />
            <span>বার্তা বিভাগ স্ট্যান্ডার্ড অপারেটিং প্রসিডিউর (SOP)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            সাংবাদিক ও বার্তাকক্ষ নির্দেশিকা এবং আচরণবিধি
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            দৈনিক বাংলাদেশ বার্তা-র সকল ব্যুরো প্রধান, বিশেষ প্রতিনিধি, জ্যেষ্ঠ প্রতিবেদক, সহ-সম্পাদক ও স্টাফ সাংবাদিকদের জন্য অবশ্য পালনীয় সম্পাদকীয় নীতিমালা, সংবাদ যাচাই প্রক্রিয়া ও ডিজিটাল পাবলিশিং নিয়মাবলী।
          </p>
        </div>
      </div>

      {/* Grid of Key Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-3">
            <Shield size={20} />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-text)] mb-1">১. শতভাগ সত্যতা ও নিরপেক্ষতা</h3>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            কোনো একক সূত্রের তথ্যে রিপোর্ট প্রকাশ নিষিদ্ধ। ন্যূনতম দুটি স্বাধীন ও নির্ভরযোগ্য সূত্র (Double Sourcing) নিশ্চিত করতে হবে।
          </p>
        </div>

        <div className="p-5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-3">
            <Scale size={20} />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-text)] mb-1">২. ভারসাম্য ও উভয় পক্ষের বক্তব্য</h3>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            অভিযোগ সংবলিত যেকোনো সংবাদের ক্ষেত্রে অভিযুক্ত ব্যক্তি বা প্রতিষ্ঠানের বক্তব্য নেওয়া বাধ্যতামূলক। যোগাযোগ ব্যর্থ হলে তা স্পষ্ট উল্লেখ করুন।
          </p>
        </div>

        <div className="p-5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mb-3">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-text)] mb-1">৩. ক্লিকবেট ও চটকদারিতা বর্জন</h3>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            শিরোনামে এমন কোনো শব্দ ব্যবহার করা যাবে না যা সংবাদের মূল ঘটনার সাথে সঙ্গতিপূর্ণ নয়। চটকদার ফাঁদ নয়, বস্তুনিষ্ঠ তথ্যই আমাদের অগ্রাধিকার।
          </p>
        </div>
      </div>

      {/* Chapter 1: News Writing Structure */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-[var(--color-border)] pb-4">
          <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
            <FileText className="text-[var(--color-primary)]" size={20} />
            <span>অধ্যায় ১: ডিজিটাল সংবাদ রচনা ও ফরম্যাটিং নিয়মাবলী</span>
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            টিপট্যাপ (Tiptap) এডিটরে সংবাদ ড্রাফট করার সময় নিচের কাঠামো অনুসরণ করুন
          </p>
        </div>

        <div className="space-y-4 text-xs leading-relaxed text-[var(--color-text)]">
          <div className="bg-[var(--color-bg-secondary)] p-4 rounded-lg border border-[var(--color-border)] space-y-2">
            <h4 className="font-bold text-sm text-[var(--color-text)] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-[10px] font-bold">ক</span>
              ইনভার্টেড পিরামিড ও ৫W+১H সূত্র
            </h4>
            <p className="text-[var(--color-text-muted)]">
              প্রতিটি সংবাদের প্রথম প্যারাগ্রাফ (Lead/Intro)-এ অবশ্যই সংবাদের মূল ৬টি প্রশ্নের উত্তর স্পষ্ট হতে হবে: <strong>কে (Who), কী (What), কখন (When), কোথায় (Where), কেন (Why) এবং কীভাবে (How)</strong>। সবচেয়ে গুরুত্বপূর্ণ তথ্য শুরুতে দিন, বিস্তারিত পটভূমি পরে আনুন।
            </p>
          </div>

          <div className="bg-[var(--color-bg-secondary)] p-4 rounded-lg border border-[var(--color-border)] space-y-2">
            <h4 className="font-bold text-sm text-[var(--color-text)] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-[10px] font-bold">খ</span>
              শিরোনামের সঠিক দৈর্ঘ্য ও এ/বি টেস্টিং
            </h4>
            <p className="text-[var(--color-text-muted)]">
              গুগল ও সোশ্যাল মিডিয়ায় সম্পূর্ণ দৃশ্যমানতার জন্য শিরোনাম <strong>৫০ থেকে ৬৫ অক্ষরের মধ্যে</strong> রাখা সর্বোত্তম। ৬০ অক্ষরের বেশি হলে গুগলে শিরোনাম কেটে যেতে পারে। এডিটরদের জন্য যদি বিকল্প কোনো আকর্ষক শিরোনাম থাকে, তবে <strong>শিরোনাম A/B স্প্লিট টেস্ট</strong> ইঞ্জিন ব্যবহার করে দুটি সংস্করণ জমা দিন।
            </p>
          </div>

          <div className="bg-[var(--color-bg-secondary)] p-4 rounded-lg border border-[var(--color-border)] space-y-2">
            <h4 className="font-bold text-sm text-[var(--color-text)] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-[10px] font-bold">গ</span>
              বাধ্যতামূলক ছবি ও অল্টারনেটিভ টেক্সট (Alt-Text)
            </h4>
            <p className="text-[var(--color-text-muted)]">
              প্রতিটি সংবাদের প্রধান ছবিতে অবশ্যই <strong>Alt-Text (ছবির বিবরণ)</strong> এবং ফটো ক্রেডিট (যেমন: নিজস্ব আলোকচিত্রী / সংগৃহীত / রয়টার্স) লিখতে হবে। ছবির Alt-Text ছাড়া এসইও স্কোর ৬০ এর নিচে নেমে যাবে এবং পাঠকের দৃষ্টিশক্তিহীনদের জন্য প্রবেশগম্য হবে না।
            </p>
          </div>

          <div className="bg-[var(--color-bg-secondary)] p-4 rounded-lg border border-[var(--color-border)] space-y-2">
            <h4 className="font-bold text-sm text-[var(--color-text)] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-[10px] font-bold">ঘ</span>
              ফোকাস কিওয়ার্ড ও মেটা বিবরণী (SEO Scorecard)
            </h4>
            <p className="text-[var(--color-text-muted)]">
              প্রতিবেদনের ডানে থাকা <strong>রিয়েল-টাইম SEO ও কোয়ালিটি স্কোরকার্ডে</strong> চোখ রাখুন। প্রকাশনার পূর্বে স্কোর ন্যূনতম <strong>৮০/১০০</strong> থাকা বাঞ্ছনীয়। ফোকাস কিওয়ার্ডটি শিরোনামে, প্রথম প্যারায় এবং মেটা বর্ণনায় স্বাভাবিকভাবে সন্নিবেশ করুন।
            </p>
          </div>
        </div>
      </div>

      {/* Chapter 2: Workflow Pipeline */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-[var(--color-border)] pb-4">
          <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
            <Sparkles className="text-purple-600" size={20} />
            <span>অধ্যায় ২: খসড়া জমা থেকে প্রকাশনা — ওয়ার্কফ্লো পাইপলাইন</span>
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            প্রতিটি সাংবাদিকের সংবাদ কীভাবে লাইভ ওয়েবসাইটে যায়
          </p>
        </div>

        <div className="relative pl-6 sm:pl-8 border-l-2 border-[var(--color-primary)]/40 space-y-6 text-xs">
          <div className="relative">
            <span className="absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-[10px]">
              ১
            </span>
            <h4 className="font-bold text-sm text-[var(--color-text)] mb-1">ধাপ ১: ড্রাফট রচনা ও সংরক্ষণ (Drafting)</h4>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              সাংবাদিক প্যানেল থেকে &apos;নতুন সংবাদ রচনা&apos;-য় গিয়ে শিরোনাম, বডি টেক্সট, ক্যাটাগরি, বিভাগ-জেলা এবং ট্যাগ যুক্ত করবেন। প্রয়োজন অনুযায়ী এআই অ্যাসিস্ট্যান্টের সাহায্য নিয়ে বানান ও বাক্য পরিমার্জন করতে পারেন।
            </p>
          </div>

          <div className="relative">
            <span className="absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
              ২
            </span>
            <h4 className="font-bold text-sm text-[var(--color-text)] mb-1">ধাপ ২: পর্যালোচনার জন্য জমা (Submit to Review Queue)</h4>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              সংবাদ লেখা শেষ হলে স্ট্যাটাস <strong>&apos;অনুমোদনের জন্য জমা&apos; (Pending Review)</strong> সিলেক্ট করে সেভ করুন। এটি সরাসরি সেন্ট্রাল এডিটোরিয়াল ডেস্কে চলে যাবে। সাংবাদিকরা সরাসরি পোর্টাল লাইভ করতে পারবেন না।
            </p>
          </div>

          <div className="relative">
            <span className="absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[10px]">
              ৩
            </span>
            <h4 className="font-bold text-sm text-[var(--color-text)] mb-1">ধাপ ৩: ডেস্ক এডিটরের ফ্যাক্ট-চেক ও পরিমার্জন</h4>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              শিফট ইন-চার্জ বা সহ-সম্পাদক সংবাদটি পড়ে তথ্য, ভাষা ও আইনি দিক যাচাই করবেন। কোনো অসংগতি থাকলে তিনি সংশোধন নোট (Revision Note) সহ ড্রাফটটি ফেরত পাঠাতে পারেন।
            </p>
          </div>

          <div className="relative">
            <span className="absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
              ৪
            </span>
            <h4 className="font-bold text-sm text-[var(--color-text)] mb-1">ধাপ ৪: লাইভ প্রকাশনা বা শিডিউলিং (Live Publish)</h4>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              সম্পাদক অনুমোদন দিলে সংবাদটি সঙ্গে সঙ্গে হোমপেজে লাইভ হবে, অথবা ভবিষ্যতের নির্ধারিত সময়ে স্বয়ংক্রিয় প্রকাশের টাইমার সেট করা হবে।
            </p>
          </div>
        </div>
      </div>

      {/* Chapter 3: Roles & Permission Boundaries */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-[var(--color-border)] pb-4">
          <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
            <Shield className="text-emerald-600" size={20} />
            <span>অধ্যায় ৩: বার্তাকক্ষ পদবী ও দায়িত্ব বণ্টন (RBAC Boundaries)</span>
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            কোন পদে কার কী ক্ষমতা ও সীমাবদ্ধতা রয়েছে
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[var(--color-border)]">
            <thead className="bg-[var(--color-bg-secondary)] text-[var(--color-text)] uppercase text-[10px] tracking-wider border-b border-[var(--color-border)]">
              <tr>
                <th className="p-3">ভূমিকা (Role)</th>
                <th className="p-3">অনুমোদিত সুবিধাসমূহ (Permitted)</th>
                <th className="p-3">সংরক্ষিত সীমাবদ্ধতা (Restricted)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text)]">
              <tr>
                <td className="p-3 font-bold text-purple-700 dark:text-purple-400">
                  সুপার অ্যাডমিন (প্রধান সম্পাদক)
                </td>
                <td className="p-3 text-[var(--color-text-muted)]">
                  সম্পূর্ণ সিস্টেম নিয়ন্ত্রণ, নতুন কর্মী যোগ, পদবী ও পারমিশন নির্ধারণ, ফিচার অন/অফ, ওয়েবসাইট সেটিংস, ডিলিট ও অডিট লগ দেখা।
                </td>
                <td className="p-3 text-emerald-600 font-semibold">কোনো সীমাবদ্ধতা নেই (সম্পূর্ণ কর্তৃত্ব)</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-blue-700 dark:text-blue-400">
                  অ্যাডমিনিস্ট্রেটর (বার্তা সমন্বয়ক)
                </td>
                <td className="p-3 text-[var(--color-text-muted)]">
                  সব সংবাদ প্রকাশ ও সম্পাদনা, ব্রেকিং নিউজ, ক্যাটাগরি, মিডিয়া, নেভিগেশন ও বিজ্ঞাপন পরিচালনা।
                </td>
                <td className="p-3 text-red-600 font-semibold">
                  সুপার অ্যাডমিন পদ পরিবর্তন করতে পারবেন না, মূল সিস্টেম সেটিংস ও ফিচার সুইচ নিয়ন্ত্রণের অনুমতি নেই।
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400">
                  সম্পাদক (ডেস্ক এডিটর)
                </td>
                <td className="p-3 text-[var(--color-text-muted)]">
                  যেকোনো সাংবাদিকের ড্রাফট অনুমোদন/প্রত্যাখ্যান, সরাসরি প্রকাশনা, ব্রেকিং নিউজ টিকার ও মন্তব্য মডারেশন।
                </td>
                <td className="p-3 text-red-600 font-semibold">
                  ব্যবহারকারী পরিচালনা, অডিট লগ, বিজ্ঞাপন বা সাইট কনফিগারেশনে প্রবেশের অনুমতি নেই।
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-amber-700 dark:text-amber-400">
                  সাংবাদিক / প্রতিবেদক (Reporter)
                </td>
                <td className="p-3 text-[var(--color-text-muted)]">
                  নতুন সংবাদ ড্রাফট রচনা, নিজের ড্রাফট পরিবর্তন, অনুমোদনের জন্য জমা, ছবি আপলোড ও এআই অ্যাসিস্ট্যান্ট ব্যবহার।
                </td>
                <td className="p-3 text-red-600 font-semibold">
                  সরাসরি লাইভ প্রকাশ নিষিদ্ধ, অন্যের সংবাদ দেখা/মোছা নিষিদ্ধ, ব্রেকিং বার বা সিস্টেম মেনুতে কোনো প্রবেশাধিকার নেই।
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Chapter 4: Legal Protection & Ethical Rules */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-[var(--color-border)] pb-4">
          <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
            <Scale className="text-red-600" size={20} />
            <span>অধ্যায় ৪: আইনি সুরক্ষা, স্পর্শকাতর বিষয় ও কপিরাইট</span>
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            আইনগত ঝামেলা ও প্রেস কাউন্সিলের অভিযোগ এড়াতে অবশ্য পালনীয়
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-lg space-y-1.5">
            <h4 className="font-bold text-red-800 dark:text-red-300 flex items-center gap-1.5">
              <Eye size={14} />
              ভিকটিম ও শিশুদের পরিচয় সুরক্ষা
            </h4>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              ধর্ষণ, যৌন নির্যাতন বা পারিবারিক সহিংসতার শিকার নারী ও শিশুদের নাম, ঠিকানা, ছবি বা স্কুল/কলেজের নাম প্রকাশ করা আইনত দণ্ডনীয় অপরাধ। পরিচয় সম্পূর্ণরূপে গোপন রাখুন।
            </p>
          </div>

          <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg space-y-1.5">
            <h4 className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <Camera size={14} />
              ছবি ও ভিডিও কপিরাইট
            </h4>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              ইন্টারনেট থেকে সরাসরি অন্য পত্রিকার জলছাপযুক্ত ছবি ডাউনলোড করে ব্যবহার করা যাবে না। কেবল অনুমোদিত সংবাদ সংস্থার ছবি অথবা নিজস্ব চিত্রগ্রাহকের ছবি ব্যবহার করুন।
            </p>
          </div>

          <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-lg space-y-1.5">
            <h4 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
              <AlertTriangle size={14} />
              আদালতের বিচারাধীন বিষয় (Sub-judice)
            </h4>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              আদালতে বিচারাধীন বিষয়ে এমন কোনো মন্তব্য বা রায় দেওয়া যাবে না যাতে আদালতের রায় প্রভাবিত হতে পারে। কেবল শুনানির বিবরণ ও আইনজীবীদের যুক্তি নিরপেক্ষভাবে তুলে ধরুন।
            </p>
          </div>

          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-lg space-y-1.5">
            <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle size={14} />
              ভুল স্বীকার ও সংশোধনী নীতি (Corrections)
            </h4>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              যদি কোনো তথ্যে অসাবধানতাবশত ভুল হয়ে থাকে, তবে তা গোপনে মুছে না ফেলে প্রতিবেদনের নিচে স্পষ্ট &apos;সংশোধনী&apos; (Correction Note) জুড়ে দিয়ে সত্য তথ্য তুলে ধরুন।
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Footer */}
      <div className="p-6 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-[var(--color-text)]">এখনই নতুন সংবাদ ড্রাফট করতে চান?</h4>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            নির্দেশিকা মেনে আপনার সংবাদের তথ্য সাজিয়ে টিপট্যাপ এডিটরে ড্রাফট করুন।
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white text-xs font-bold rounded-lg hover:opacity-90 shadow-xs"
        >
          <FileText size={15} />
          <span>নতুন সংবাদ ড্রাফট করুন</span>
        </Link>
      </div>
    </div>
  );
}
