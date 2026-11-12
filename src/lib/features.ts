export type FeatureCategory = "news" | "widgets" | "admin";

export interface FeatureDefinition {
  id: string;
  nameBn: string;
  nameEn: string;
  descriptionBn: string;
  descriptionEn: string;
  category: FeatureCategory;
  defaultEnabled: boolean;
  iconName: string;
}

export const FEATURE_CATALOG: FeatureDefinition[] = [
  // ---------------------------------------------------------------------------
  // Category 1: Public News & Reader Experience
  // ---------------------------------------------------------------------------
  {
    id: "breaking_ticker",
    nameBn: "ব্রেকিং নিউজ টিকার ও অ্যালার্ট",
    nameEn: "Breaking News Ticker & Alerts",
    descriptionBn: "হেডার ও সাইটের শীর্ষে চলমান লাল ব্রেকিং নিউজ বার এবং ফ্লোটিং ফ্ল্যাশ বিজ্ঞপ্তি প্রদর্শন।",
    descriptionEn: "Live animated breaking news ticker and real-time floating alerts at the top of the portal.",
    category: "news",
    defaultEnabled: true,
    iconName: "Zap",
  },
  {
    id: "ab_testing",
    nameBn: "শিরোনাম এ/বি টেস্টিং ইঞ্জিন",
    nameEn: "Headline A/B Testing Engine",
    descriptionBn: "পাঠকদের ৫০/৫০ অনুপাতে দুই ভিন্ন শিরোনাম প্রদর্শন এবং সর্বোচ্চ CTR শিরোনাম স্বয়ংক্রিয়ভাবে বিজয়ী নির্ধারণ।",
    descriptionEn: "Dynamically serves variant headlines A vs B and tracks impressions/clicks to optimize readership.",
    category: "news",
    defaultEnabled: true,
    iconName: "Split",
  },
  {
    id: "article_comments",
    nameBn: "সংবাদের নিচে পাঠক মন্তব্য সেকশন",
    nameEn: "Article Reader Comments",
    descriptionBn: "সংবাদের শেষভাগে পাঠকদের উন্মুক্ত মন্তব্য প্রদান ও আলোচনায় অংশগ্রহণের সুযোগ।",
    descriptionEn: "Enables public discussion, commentary and reader feedback threads beneath published articles.",
    category: "news",
    defaultEnabled: true,
    iconName: "MessageSquare",
  },
  {
    id: "audio_news",
    nameBn: "অডিও সংবাদ ও পডকাস্ট হাব",
    nameEn: "Audio News & Podcast Hub",
    descriptionBn: "সংবাদ শোনার অডিও প্লেয়ার এবং অডিও নিউজ কর্নার সক্রিয় রাখা।",
    descriptionEn: "Provides text-to-speech audio listening player and dedicated audio bulletin archive.",
    category: "news",
    defaultEnabled: true,
    iconName: "Headphones",
  },
  {
    id: "push_notifications",
    nameBn: "ব্রাউজার পুশ নোটিফিকেশন",
    nameEn: "Web Push Notifications",
    descriptionBn: "গুরুত্বপূর্ণ সংবাদের তাত্ক্ষণিক নোটিফিকেশন পাঠকদের ডিভাইসে প্রেরণের অনুমতি অনুরোধ।",
    descriptionEn: "Allows visitors to subscribe to browser push alerts for breaking news.",
    category: "news",
    defaultEnabled: true,
    iconName: "Bell",
  },
  {
    id: "reader_bookmarks",
    nameBn: "সংবাদ বুকমার্ক ও সংরক্ষণ",
    nameEn: "Reader Bookmarks & Saved Stories",
    descriptionBn: "পাঠকদের পছন্দের সংবাদ পরবর্তীতে পড়ার জন্য সেভ করে রাখার সুবিধা।",
    descriptionEn: "Allows readers to bookmark stories for personal reading list.",
    category: "news",
    defaultEnabled: true,
    iconName: "Bookmark",
  },

  // ---------------------------------------------------------------------------
  // Category 2: Interactive Widgets & Public Corners
  // ---------------------------------------------------------------------------
  {
    id: "live_score",
    nameBn: "লাইভ ক্রিকেট ও স্পোর্টস স্কোর টিকার",
    nameEn: "Live Sports & Cricket Score Ticker",
    descriptionBn: "হেডারের নিচে লাইভ ক্রিকেট ও ফুটবল ম্যাচের রিয়েল-টাইম স্কোর ও ধারাভাষ্য বার।",
    descriptionEn: "Real-time cricket & football match scorecard ticker bar situated beneath the main header.",
    category: "widgets",
    defaultEnabled: true,
    iconName: "Trophy",
  },
  {
    id: "weather_prayer",
    nameBn: "আবহাওয়া ও নামাজের সময়সূচি বার",
    nameEn: "Weather & Prayer Times Widget",
    descriptionBn: "শীর্ষ বারে বিভিন্ন জেলার রিয়েল-টাইম আবহাওয়া ও পাঁচ ওয়াক্ত নামাজের সময়সূচি প্রদর্শন।",
    descriptionEn: "Real-time weather forecast and five-daily prayer timetable display across districts.",
    category: "widgets",
    defaultEnabled: true,
    iconName: "CloudSun",
  },
  {
    id: "public_polls",
    nameBn: "অনলাইন ভোট ও জনমত জরিপ",
    nameEn: "Public Opinion Polls & Voting",
    descriptionBn: "হোমপেজ ও জরিপ পাতায় পাঠকদের ভোট প্রদান ও তাৎক্ষণিক ফলাফল দেখার ব্যবস্থা।",
    descriptionEn: "Interactive reader polling questions with instant graphical percentage results.",
    category: "widgets",
    defaultEnabled: true,
    iconName: "Vote",
  },
  {
    id: "public_debates",
    nameBn: "উন্মুক্ত পাঠক বিতর্ক ও মতামত",
    nameEn: "Public Debates & Perspectives",
    descriptionBn: "জাতীয় গুরুত্বপূর্ণ বিষয়ে পক্ষে ও বিপক্ষে পাঠকদের যুক্তি উপস্থাপনের উন্মুক্ত মঞ্চ।",
    descriptionEn: "Two-sided civic deliberation arena where readers submit arguments for and against propositions.",
    category: "widgets",
    defaultEnabled: true,
    iconName: "Scale",
  },
  {
    id: "fact_checking",
    nameBn: "ফ্যাক্ট-চেক সত্যতা যাচাই কর্নার",
    nameEn: "Fact-Check Verification Desk",
    descriptionBn: "গুজব শনাক্তকরণ, দাবি যাচাই ও সত্য/মিথ্যা রেটিং সংবলিত ফ্যাক্ট-চেক পাতা ও সাবমিশন।",
    descriptionEn: "Fact-checking portal for disinformation debunking, rumor claims and claim submission.",
    category: "widgets",
    defaultEnabled: true,
    iconName: "ShieldCheck",
  },
  {
    id: "epaper",
    nameBn: "ডিজিটাল ই-পেপার সংস্করণ",
    nameEn: "Digital E-Paper Reader",
    descriptionBn: "কাগজের পত্রিকার আদলে পাতার পর পাতা পড়ার ডিজিটাল ই-পেপার সংস্করণ।",
    descriptionEn: "Interactive digital replica edition allowing readers to flip print pages and clip stories.",
    category: "widgets",
    defaultEnabled: true,
    iconName: "Newspaper",
  },
  {
    id: "history_archive",
    nameBn: "মুক্তিযুদ্ধ ও ইতিহাস আর্কাইভ",
    nameEn: "1971 Liberation War & History Archive",
    descriptionBn: "বীরশ্রেষ্ঠ, ১১টি সেক্টর এবং বাংলাদেশের ঐতিহাসিক ঘটনাবলির বিশেষ আর্কাইভ কর্নার।",
    descriptionEn: "Dedicated historical portal covering the 1971 Liberation War sectors and Bir Sreshtho heroes.",
    category: "widgets",
    defaultEnabled: true,
    iconName: "Landmark",
  },
  {
    id: "video_hub",
    nameBn: "ভিডিও হাব ও মাল্টিমিডিয়া",
    nameEn: "Video News Hub & Multimedia",
    descriptionBn: "ইউটিউব ও ফেসবুকের ভিডিও প্রতিবেদন সংবলিত মাল্টিমিডিয়া গ্যালারি।",
    descriptionEn: "Dedicated video stories page with embedded YouTube and Facebook video broadcasts.",
    category: "widgets",
    defaultEnabled: true,
    iconName: "Film",
  },
  {
    id: "photo_gallery",
    nameBn: "ফটো গ্যালারি ও চিত্রশালা",
    nameEn: "Photo Gallery & Picture Desk",
    descriptionBn: "সংবাদের আকর্ষণীয় ছবি ও ফটো স্টোরির জন্য নিবেদিত চিত্রশালা পেজ।",
    descriptionEn: "Curated press photo albums and visual storytelling gallery.",
    category: "widgets",
    defaultEnabled: true,
    iconName: "Image",
  },

  // ---------------------------------------------------------------------------
  // Category 3: Admin Panel & Editorial Tools
  // ---------------------------------------------------------------------------
  {
    id: "admin_velocity_radar",
    nameBn: "ড্যাশবোর্ড ট্র্যাফিক ভেলোসিটি রাডার",
    nameEn: "Dashboard Traffic Velocity Radar",
    descriptionBn: "এডমিন ড্যাশবোর্ডে লাইভ সক্রিয় পাঠক, ভেলোসিটি মিটার ও ১-ক্লিক হোমপেজ লিড পিন করার রাডার।",
    descriptionEn: "Chartbeat-style audience momentum radar with 1-click homepage lead pinning.",
    category: "admin",
    defaultEnabled: true,
    iconName: "Flame",
  },
  {
    id: "admin_ai_assistant",
    nameBn: "এআই সম্পাদকীয় সহকারী (AI Assistant)",
    nameEn: "AI Editorial Assistant",
    descriptionBn: "সংবাদের সারাংশ তৈরি, ব্যাকরণ সংশোধন ও শিরোনাম পরামর্শ প্রদানে জেমিনাই এআই টুল।",
    descriptionEn: "Generative AI assistant for story summarization, copyediting, and headline suggestions.",
    category: "admin",
    defaultEnabled: true,
    iconName: "Sparkles",
  },
  {
    id: "admin_seo_scorecard",
    nameBn: "রিয়েল-টাইম এসইও ও এসইআরপি প্রিভিউ",
    nameEn: "Real-Time SEO & SERP Scorecard",
    descriptionBn: "সংবাদ রচনার সময় গুগল, ফেসবুক ও এক্স কার্ড প্রিভিউ এবং কি-ওয়ার্ড ডেনসিটি অডিটর।",
    descriptionEn: "Live Google/FB SERP preview cards, character meters and focus keyword density checks.",
    category: "admin",
    defaultEnabled: true,
    iconName: "Search",
  },
  {
    id: "admin_ab_testing_panel",
    nameBn: "এডিটর এ/বি টেস্টিং কন্ট্রোল প্যানেল",
    nameEn: "Editor A/B Testing Control Panel",
    descriptionBn: "নিউজ এডিটরে বিকল্প শিরোনাম (Headline B) ইনপুট এবং লাইভ CTR তুলনা প্যানেল।",
    descriptionEn: "Headline A vs B input box in the article editor with duration and live CTR scorecards.",
    category: "admin",
    defaultEnabled: true,
    iconName: "SlidersHorizontal",
  },
  {
    id: "admin_ads_manager",
    nameBn: "বিজ্ঞাপন ও মনিটাইজেশন কন্ট্রোল",
    nameEn: "Advertisement Monetization Desk",
    descriptionBn: "পোর্টালের হেডার, সাইডবার ও নিউজের মধ্যকার বিজ্ঞাপন ব্যানার প্রদর্শন ও নিয়ন্ত্রণ।",
    descriptionEn: "Manages display banner advertisements, campaigns, and click-through impressions.",
    category: "admin",
    defaultEnabled: true,
    iconName: "DollarSign",
  },
  {
    id: "admin_audit_logs",
    nameBn: "সিকিউরিটি ও সিস্টেম অডিট লগ",
    nameEn: "Security & System Audit Logging",
    descriptionBn: "সাংবাদিক ও এডিটরদের প্রতিটি কর্মতৎপরতার টাইমস্ট্যাম্পযুক্ত ইতিহাস সংরক্ষণ।",
    descriptionEn: "Tracks all administrative actions, logins, status changes, and editorial modifications.",
    category: "admin",
    defaultEnabled: true,
    iconName: "ScrollText",
  },
  {
    id: "admin_polls_manager",
    nameBn: "পোল ও মতামত জরিপ ব্যবস্থাপনা",
    nameEn: "Polls & Surveys Administration",
    descriptionBn: "এডমিন প্যানেলে নতুন পোল তৈরি, ফলাফল অডিট ও সক্রিয়/নিষ্ক্রিয় করার মডিউল।",
    descriptionEn: "Full management suite for editorial opinion polls, voter tracking, and closures.",
    category: "admin",
    defaultEnabled: true,
    iconName: "CheckSquare",
  },
  {
    id: "admin_fact_check_manager",
    nameBn: "ফ্যাক্ট-চেক সাবমিশন ও রিভিউ ডেস্ক",
    nameEn: "Fact-Check Submissions & Review Desk",
    descriptionBn: "পাঠকদের পাঠানো দাবি পর্যালোচনা এবং নতুন ফ্যাক্ট-চেক রিপোর্ট প্রকাশের এডমিন টুল।",
    descriptionEn: "Admin desk for reviewing community tip-offs and publishing fact-check verdicts.",
    category: "admin",
    defaultEnabled: true,
    iconName: "Shield",
  },
  {
    id: "admin_comments_moderation",
    nameBn: "পাঠক মন্তব্য ফিল্টার ও মডারেশন",
    nameEn: "Comments Moderation Panel",
    descriptionBn: "পাঠকদের মন্তব্য পর্যালোচনা, অনুমোদন, হাইড বা ডিলিট করার এডমিন ইন্টারফেস।",
    descriptionEn: "Admin interface for approving, flagging spam, and moderating reader comments.",
    category: "admin",
    defaultEnabled: true,
    iconName: "ShieldAlert",
  },
];

export type FeatureFlags = Record<string, boolean>;

export function getDefaultFeatureFlags(): FeatureFlags {
  const defaults: FeatureFlags = {};
  for (const feat of FEATURE_CATALOG) {
    defaults[feat.id] = feat.defaultEnabled;
  }
  return defaults;
}
