export type VerdictType = "false" | "misleading" | "partially_true" | "true" | "altered_media";

export interface FactCheckItem {
  id: string;
  slug: string;
  title: string;
  claim: string;
  claimant: string;
  verdict: VerdictType;
  verdictSummary: string;
  context: string | null;
  investigationDetails: string | null;
  factConclusion: string | null;
  originalMediaUrl: string | null;
  debunkedMediaUrl: string | null;
  category: string;
  viewCount: number;
  shareCount: number;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
}

export const FALLBACK_FACT_CHECKS: FactCheckItem[] = [
  {
    id: "fc-padma-bridge-toll",
    slug: "padma-bridge-toll-rate-fake-circular",
    title: "পদ্মা সেতুতে সব ধরনের যানবাহনের টোল বৃদ্ধির তথ্যটি ভুয়া; ভাইরাল প্রজ্ঞাপনটি এডিটেড",
    claim: "পদ্মা সেতুতে কার, বাস ও ট্রাকের টোল ৫০ শতাংশ বাড়িয়ে আগামী ১ তারিখ থেকে কার্যকর হচ্ছে",
    claimant: "ফেসবুকে বিভিন্ন পেইজ ও গ্রুপে ছড়ানো ভুয়া প্রজ্ঞাপন",
    verdict: "false",
    verdictSummary:
      "বাংলাদেশ সেতু কর্তৃপক্ষ নিশ্চিত করেছে যে পদ্মা সেতুর টোল বাড়ানোর কোনো সিদ্ধান্ত নেওয়া হয়নি। সামাজিক মাধ্যমে প্রচারিত প্রজ্ঞাপনের স্মারক নম্বর ও ফন্ট বিশ্লেষণ করে প্রমাণিত হয় এটি ২০২২ সালের পুরনো সার্কুলার ডিজিটাল সফটওয়্যারে পরিবর্তন করে তৈরি করা হয়েছে।",
    context:
      "গত দুই দিন ধরে ফেসবুকের একাধিক গ্রুপে বাংলাদেশ সেতু কর্তৃপক্ষের প্যাড সদৃশ একটি নোটিশের ছবি ছড়িয়ে পড়ে। এতে দাবি করা হয় মোটরসাইকেল ও ব্যক্তিগত গাড়ির টোল ২০০ টাকা থেকে বাড়িয়ে ৩০০ টাকা এবং বাসের টোল ১০০০ টাকা থেকে বাড়িয়ে ১৫০০ টাকা করা হয়েছে।",
    investigationDetails:
      "১. স্মারক নম্বর যাচাই: ভাইরাল প্রজ্ঞাপনে উল্লেখিত স্মারক নম্বর সেতু কর্তৃপক্ষের মূল রেকর্ডের সাথে মেলেনি।\n২. সেতু কর্তৃপক্ষের বক্তব্য: পদ্মা সেতু প্রকল্পের পরিচালক সমমনা গণমাধ্যমকে জানান, টোল বৃদ্ধির কোনো প্রস্তাবনা মন্ত্রণালয়ে পাঠানো হয়নি।\n৩. ডিজিটাল ফরেনসিক পরীক্ষা: ফটো ফরেনসিক ইএলএ (ELA) পরীক্ষায় দেখা গেছে 'টাকার অংক' ও 'তারিখ' অংশের পিক্সেলে অসঙ্গতি রয়েছে, যা স্পষ্টত ফটোশপ বা পিকসআর্টে এডিট করা হয়েছে।",
    factConclusion:
      "সুতরাং, পদ্মা সেতুতে টোল বৃদ্ধির দাবিটি সম্পূর্ণ ভিত্তিহীন ও বানোয়াট। জনমনে বিভ্রান্তি ছড়াতে স্বার্থান্বেষী মহল পুরনো সরকারি সার্কুলার এডিট করে প্রচার করেছে।",
    category: "যোগাযোগ ও অর্থনীতি",
    originalMediaUrl:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
    debunkedMediaUrl:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80",
    isFeatured: true,
    viewCount: 4890,
    shareCount: 620,
    tags: ["পদ্মা সেতু", "টোল বৃদ্ধি", "ফেসবুক গুজব", "সেতু কর্তৃপক্ষ"],
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: "fc-cyclone-tidal-wave",
    slug: "cyclone-tidal-wave-old-tsunami-video",
    title: "বঙ্গোপসাগরের ঘূর্ণিঝড়ের দৃশ্য দাবি করে জাপানের পুরনো সুনামির ভিডিও প্রচার; দাবি বিভ্রান্তিকর",
    claim: "ঘূর্ণিঝড়ের প্রভাবে কক্সবাজার সৈকতে দৈত্যাকার জলোচ্ছ্বাসের ভিডিও",
    claimant: "টিকটক ও ফেসবুক রিলসে ভাইরাল ভিডিও ক্লিপ",
    verdict: "misleading",
    verdictSummary:
      "ভিডিওটি বাংলাদেশের কোনো উপকূলের নয়। রিভার্স ভিডিও সার্চে দেখা গেছে এটি ২০১১ সালে জাপানের তোহোকু সুনামির সময় মোবাইল ক্যামেরায় ধারণকৃত ঐতিহাসিক ফুটেজ।",
    context:
      "বঙ্গোপসাগরে নিম্নচাপ সৃষ্টির খবরের মধ্যে টিকটকে একটি ভিডিও লক্ষাধিক ভিউ পায়, যেখানে দেখা যায় বিশাল ঢেউ তীরের ভবনগুলো ডুবিয়ে দিচ্ছে। ক্যাপশনে লেখা হয়: 'কক্সবাজারে মারাত্মক জলোচ্ছ্বাস শুরু, এখনই সতর্ক হোন'।",
    investigationDetails:
      "১. কি-ফ্রেম এক্সট্রাকশন: ভিডিওটি ফ্রেম বাই ফ্রেম বিশ্লেষণ করে ইয়ানডেক্স ও গুগল লেন্সে রিভার্স ইমেজ সার্চ করা হয়।\n২. মূল সূত্র আবিষ্কার: ২০১১ সালের ১১ মার্চ জাপানের ফুকুশিমা/সেন্ডাই উপকূলে আঘাত হানা সুনামির ফুটেজের সাথে অবিকল মিলে যায়।\n৩. আবহাওয়া অফিসের সাথে যোগাযোগ: কক্সবাজার আবহাওয়া কার্যালয় নিশ্চিত করেছে যে সৈকতে স্বাভাবিক জোয়ারের চেয়ে বড় কোনো অস্বাভাবিক জলোচ্ছ্বাস ঘটেনি।",
    factConclusion:
      "পুরনো জাপানি সুনামির ভিডিওকে বঙ্গোপসাগরের ঘূর্ণিঝড়ের দৃশ্য হিসেবে প্রচার করে উপকূলের জনসাধারণের মাঝে আতঙ্ক সৃষ্টির অপচেষ্টা চালানো হয়েছে।",
    category: "পরিবেশ ও দুর্যোগ",
    originalMediaUrl:
      "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&auto=format&fit=crop&q=80",
    debunkedMediaUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
    isFeatured: false,
    viewCount: 3410,
    shareCount: 395,
    tags: ["ঘূর্ণিঝড়", "জলোচ্ছ্বাস", "কক্সবাজার", "জাপান সুনামি", "ভিডিও বিভ্রান্তি"],
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
  },
  {
    id: "fc-ai-cricket-statement",
    slug: "ai-generated-deepfake-cricket-statement",
    title: "অধিনায়কত্ব নিয়ে সাকিব আল হাসানের নামে ভাইরাল অডিও বার্তাটি ডিপফেক ও এআই ক্লোন",
    claim: "বিসিবির বিরুদ্ধে ক্ষোভ প্রকাশ করে দল ছাড়ার ঘোষণা দিচ্ছেন সাকিব আল হাসান",
    claimant: "ইউটিউব শর্টস ও সোশাল মিডিয়া পেজ",
    verdict: "altered_media",
    verdictSummary:
      "অডিও ক্লিপটি মানুষের আসল কণ্ঠস্বর নয়; আধুনিক ভয়েস ক্লোনিং এআই টুলের মাধ্যমে তৈরি কৃত্রিম ডিপফেক অডিও।",
    context:
      "জাতীয় ক্রিকেট দলের সাম্প্রতিক বৈঠকের পর ইউটিউবে ৫০ সেকেন্ডের একটি অডিও ক্লিপ ভাইরাল হয়। সেখানে কথিত সাকিবের কণ্ঠে অশ্রাব্য ভাষায় বোর্ড কর্তাদের সমালোচনা করতে শোনা যায়।",
    investigationDetails:
      "১. স্পেকট্রোগ্রাম ফ্রিকোয়েন্সি টেস্ট: অডিও ফাইলটি স্পিচ সিন্থেসিস ডিটেক্টরে পরীক্ষা করে ৯০% এর বেশি কৃত্রিম এআই জেনারেটেড প্যাটার্ন নিশ্চিত করা হয়।\n২. শব্দশৈলী ও নিঃশ্বাসের ফাঁক: কৃত্রিম কণ্ঠে স্বাভাবিক মানুষের নিঃশ্বাস ও আবেগের মাইক্রো-ভ্যারিয়েশন সম্পূর্ণ অনুপস্থিত ছিল।\n৩. খেলোয়াড়ের আনুষ্ঠানিক অবস্থান: সাকিবের মিডিয়া সমন্বয়ক নিশ্চিত করেছেন তিনি এমন কোনো অডিও রেকর্ড করেননি এবং সাইবার ক্রাইম ইউনিটে অভিযোগ দায়ের করা হয়েছে।",
    factConclusion:
      "অডিওটি কৃত্রিম বুদ্ধিমত্তা (AI Voice Clone) ব্যবহার করে উদ্দেশ্যপ্রণোদিতভাবে দেশের ক্রীড়াঙ্গনে অস্থিরতা সৃষ্টির জন্য তৈরি করা হয়েছে।",
    category: "খেলাধুলা ও প্রযুক্তি",
    originalMediaUrl:
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80",
    debunkedMediaUrl:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
    isFeatured: false,
    viewCount: 6240,
    shareCount: 880,
    tags: ["সাকিব আল হাসান", "বিসিবি", "ডিপফেক", "এআই অডিও", "ক্রিকেট গুজব"],
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
  },
  {
    id: "fc-primary-school-exam",
    slug: "primary-school-exam-abolished-partially-true",
    title: "প্রাথমিকে সব পরীক্ষা বাতিল সংক্রান্ত তথ্যটি আংশিক সত্য; নতুন মূল্যায়ন পদ্ধতিতে পরীক্ষা সীমিত",
    claim: "প্রাথমিক বিদ্যালয়ে ১ম থেকে ৫ম শ্রেণি পর্যন্ত সব পরীক্ষা চিরতরে তুলে দেওয়া হয়েছে",
    claimant: "বিভিন্ন অনলাইন পোর্টাল ও ফেসবুক পোস্ট",
    verdict: "partially_true",
    verdictSummary:
      "১ম থেকে ৩য় শ্রেণি পর্যন্ত প্রচলিত লিখিত বার্ষিক পরীক্ষা নেই এবং ধারাবাহিক মূল্যায়ন হবে। তবে ৪র্থ ও ৫ম শ্রেণিতে বার্ষিক পরীক্ষা ও অর্ধবার্ষিক মূল্যায়ন বলবৎ রয়েছে।",
    context:
      "নতুন শিক্ষাক্রমের আলোকে প্রাথমিক শিক্ষার মূল্যায়ন পদ্ধতি নিয়ে অভিভাবক ও শিক্ষার্থীদের মধ্যে ব্যাপক বিভ্রান্তি তৈরি হয়। অনেক পেজে দাবি করা হয় কোনো শ্রেণিতেই আর কখনোই পরীক্ষা হবে না।",
    investigationDetails:
      "১. জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) এর নীতিমালা: প্রাথমিকে শিখনকালীন মূল্যায়ন এবং সামষ্টিক মূল্যায়নের সমন্বয় করা হয়েছে।\n২. প্রাথমিক ও গণশিক্ষা মন্ত্রণালয়ের প্রজ্ঞাপন: ১ম থেকে ৩য় শ্রেণি পর্যন্ত শতভাগ শিখনকালীন মূল্যায়ন এবং ৪র্থ-৫ম শ্রেণিতে ৬০% শিখনকালীন ও ৪০% লিখিত পরীক্ষা বহাল থাকবে।",
    factConclusion:
      "প্রাথমিকে পরীক্ষা পুরোপুরি তুলে দেওয়া হয়নি, বরং প্রাথমিক স্তরের একাংশে মূল্যায়ন পদ্ধতি সংস্কার করা হয়েছে। তাই দাবিটি আংশিক সত্য ও সামগ্রিক অর্থে বিভ্রান্তিকর।",
    category: "শিক্ষা ও প্রশাসন",
    originalMediaUrl:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80",
    debunkedMediaUrl:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
    isFeatured: false,
    viewCount: 2980,
    shareCount: 240,
    tags: ["প্রাথমিক শিক্ষা", "পরীক্ষা বাতিল", "শিক্ষাক্রম", "আংশিক সত্য"],
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

export interface FactCheckSubmissionItem {
  id: string;
  titleOrClaim: string;
  sourceUrl: string | null;
  description: string | null;
  submitterName: string | null;
  submitterEmail: string | null;
  status: "pending" | "reviewing" | "published" | "dismissed";
  createdAt: string;
}

export const FALLBACK_SUBMISSIONS: FactCheckSubmissionItem[] = [
  {
    id: "sub-1",
    titleOrClaim: "ফেসবুকে ছড়িয়ে পড়া দাবি: আগামী শুক্রবার থেকে ৩ দিন গ্যাস সরবরাহ সম্পূর্ণ বন্ধ থাকবে",
    sourceUrl: "https://facebook.com/groups/dhaka-updates/posts/102938472",
    description: "একাধিক গ্রুপে একটি গ্রাফিক কার্ড শেয়ার করে বলা হচ্ছে জাতীয় গ্রিডে সংস্কারের জন্য সারাদেশে গ্যাস থাকবে না। এটি যাচাই করা দরকার।",
    submitterName: "তানভীর আহমেদ",
    submitterEmail: "tanvir.ahmed@gmail.com",
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: "sub-2",
    titleOrClaim: "টিকটকে ভাইরাল ভিডিও: সেন্টমার্টিন দ্বীপে নাকি বিদেশি নৌবাহিনীর জাহাজ মোতায়েন করা হয়েছে",
    sourceUrl: "https://tiktok.com/@banglanews_viral/video/7283918231",
    description: "ভিডিওতে একটি যুদ্ধজাহাজের দৃশ্য দেখিয়ে বলা হচ্ছে সেন্টমার্টিন নিয়ন্ত্রণ নেওয়া হয়েছে। তবে জাহাজটির পতাকা স্পষ্ট নয়।",
    submitterName: "রফিকুল ইসলাম",
    submitterEmail: "rafiq.ctg@yahoo.com",
    status: "reviewing",
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
  {
    id: "sub-3",
    titleOrClaim: "হোয়াটসঅ্যাপে ফরোয়ার্ড করা অডিও: বেসরকারি এক্স ব্যাংকের গ্রাহকদের টাকা তুলে নেওয়ার আহ্বান",
    sourceUrl: "WhatsApp Voice Note (Forwarded Many Times)",
    description: "একটি অডিও ক্লিপে বলা হচ্ছে ব্যাংকটির তারল্য সংকট চরম আকার ধারণ করেছে। গ্রাহকদের মধ্যে আতঙ্ক ছড়িয়ে পড়েছে।",
    submitterName: "নাজমুল হাসান",
    submitterEmail: "nazmul.hasan@outlook.com",
    status: "published",
    createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
];
