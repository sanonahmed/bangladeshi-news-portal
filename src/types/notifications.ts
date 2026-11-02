export interface AlertItem {
  id: string;
  title: string;
  message: string;
  url: string;
  category: string;
  priority: string;
  soundAlert: boolean;
  clicksCount: number;
  createdAt: string;
  isBroadcasted?: boolean;
}

export interface AdminSubscriberItem {
  id: string;
  endpoint: string;
  browser: string;
  device: string;
  categories: string[];
  isActive: boolean;
  createdAt: string;
  userAgent?: string | null;
}

export interface AdminNotificationStats {
  totalAlerts: number;
  activeSubscribers: number;
  totalClicks: number;
  avgCtr: string;
  urgentCount: number;
  categoryBreakdown: { category: string; label: string; count: number; clicks: number; color: string }[];
}

export const FALLBACK_ALERTS: AlertItem[] = [
  {
    id: "alert-weather-cyclone-warning",
    title: "জরুরি আবহাওয়া বার্তা: বঙ্গোপসাগরে গভীর নিম্নচাপ, ৩ নম্বর স্থানীয় সতর্ক সংকেত জারি",
    message: "উপকূলীয় এলাকায় ৫০-৬০ কিমি বেগে দমকা বা ঝড়ো হাওয়া বয়ে যেতে পারে। মাছ ধরার সকল ট্রলারসমূহকে নিরাপদ আশ্রয়ে থাকার নির্দেশ দিয়েছে আবহাওয়া অধিদপ্তর।",
    url: "/category/জাতীয়",
    category: "breaking",
    priority: "urgent",
    soundAlert: true,
    clicksCount: 1420,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    isBroadcasted: true,
  },
  {
    id: "alert-cricket-bangladesh-victory",
    title: "ক্রিকেট আপডেট: মিরপুর শেরেবাংলা স্টেডিয়ামে ভারতের বিপক্ষে বাংলাদেশের শ্বাসরুদ্ধকর জয়!",
    message: "শেষ ওভারে মোস্তাফিজুর রহমানের নিয়ন্ত্রিত আগুনে বোলিংয়ে ৫ রানের নাটকীয় জয় তুলে নিল বাংলাদেশ জাতীয় ক্রিকেট দল।",
    url: "/live-score/ban-vs-ind-3rd-odi",
    category: "sports",
    priority: "high",
    soundAlert: true,
    clicksCount: 3890,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    isBroadcasted: true,
  },
  {
    id: "alert-factcheck-fake-circular",
    title: "🛡️ ফ্যাক্ট-চেক সতর্কবার্তা: পদ্মা সেতুতে টোল বৃদ্ধির ভাইরাল প্রজ্ঞাপনটি সম্পূর্ণ ভুয়া",
    message: "সামাজিক মাধ্যমে প্রচারিত নোটিশটি ফটোশপে বিকৃত করে তৈরি করা হয়েছে বলে নিশ্চিত করেছে সেতু কর্তৃপক্ষ। সত্য অনুসন্ধান প্রতিবেদন পড়ুন।",
    url: "/fact-check/padma-bridge-toll-rate-fake-circular",
    category: "fact-check",
    priority: "high",
    soundAlert: true,
    clicksCount: 2450,
    createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    isBroadcasted: true,
  },
  {
    id: "alert-economy-forex-reserves",
    title: "অর্থনীতি ও বাণিজ্য: বাংলাদেশ ব্যাংকের বৈদেশিক মুদ্রার রিজার্ভ ২৫ বিলিয়ন ডলার অতিক্রম",
    message: "প্রবাসী আয় ও রপ্তানি আয়ের ধারাবাহিক ইতিবাচক প্রবৃদ্ধিতে বৈদেশিক মুদ্রার মোট গ্রস রিজার্ভ ২৫.২ বিলিয়ন ডলারে উন্নীত হয়েছে।",
    url: "/category/বাণিজ্য",
    category: "business",
    priority: "normal",
    soundAlert: false,
    clicksCount: 840,
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    isBroadcasted: true,
  },
  {
    id: "alert-election-commission-reform",
    title: "জাতীয় নির্বাচন কমিশন: নতুন রাজনৈতিক দল নিবন্ধনে স্বচ্ছতা নিশ্চিতে নতুন বিধিমালা খসড়া প্রকাশ",
    message: "সকল অংশীজন ও সাধারণ নাগরিকের কাছ থেকে মতামত ও সুপারিশ আহ্বান করে প্রজ্ঞাপন জারি করেছে নির্বাচন কমিশন সচিবালয়।",
    url: "/category/রাজনীতি",
    category: "politics",
    priority: "normal",
    soundAlert: false,
    clicksCount: 620,
    createdAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    isBroadcasted: true,
  },
  {
    id: "alert-dengue-prevention-drive",
    title: "জনস্বাস্থ্য সতর্কবার্তা: রাজধানীতে ডেঙ্গু প্রতিরোধে সিটি করপোরেশনের বিশেষ চিরুনি অভিযান",
    message: "বাসাবাড়ির ছাদ ও জমে থাকা স্বচ্ছ পানিতে এডিস মশার লার্ভা ধ্বংসে বিশেষ ভ্রাম্যমাণ আদালত পরিচালনার ঘোষণা।",
    url: "/category/জাতীয়",
    category: "breaking",
    priority: "urgent",
    soundAlert: true,
    clicksCount: 1190,
    createdAt: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
    isBroadcasted: true,
  },
];

export const FALLBACK_SUBSCRIBERS: AdminSubscriberItem[] = [
  {
    id: "sub-101",
    endpoint: "https://fcm.googleapis.com/fcm/send/dKj89-samsung-galaxy-a54",
    browser: "ক্রোম (Chrome Android)",
    device: "মোবাইল (Samsung Galaxy A54)",
    categories: ["breaking", "sports", "national"],
    isActive: true,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    userAgent: "Mozilla/5.0 (Linux; Android 14; SM-A546E) AppleWebKit/537.36 Chrome/124.0.0.0 Mobile Safari/537.36",
  },
  {
    id: "sub-102",
    endpoint: "https://updates.push.services.mozilla.com/wpush/v2/redmi-note-12",
    browser: "ফায়ারফক্স (Firefox Android)",
    device: "মোবাইল (Xiaomi Redmi Note 12)",
    categories: ["breaking", "fact-check", "national"],
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    userAgent: "Mozilla/5.0 (Android 13; Mobile; rv:125.0) Gecko/125.0 Firefox/125.0",
  },
  {
    id: "sub-103",
    endpoint: "https://fcm.googleapis.com/fcm/send/win11-chrome-desktop",
    browser: "ক্রোম (Chrome Windows)",
    device: "ডেস্কটপ (Windows 11 PC)",
    categories: ["breaking", "business", "politics"],
    isActive: true,
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
  },
  {
    id: "sub-104",
    endpoint: "https://web.push.apple.com/iphone15-safari-push",
    browser: "সাফারি (Safari iOS)",
    device: "মোবাইল (Apple iPhone 15)",
    categories: ["breaking", "sports"],
    isActive: true,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
  },
  {
    id: "sub-105",
    endpoint: "https://wns2-bl2p.notify.windows.com/w/?token=msedge-win10",
    browser: "এজ (Microsoft Edge)",
    device: "ডেস্কটপ (Windows 10 Workstation)",
    categories: ["breaking", "national", "sports", "business"],
    isActive: true,
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Edg/124.0.0.0 Safari/537.36",
  },
  {
    id: "sub-106",
    endpoint: "https://fcm.googleapis.com/fcm/send/vivo-v27-dhaka",
    browser: "ক্রোম (Chrome Android)",
    device: "মোবাইল (Vivo V27)",
    categories: ["breaking", "sports", "fact-check"],
    isActive: true,
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    userAgent: "Mozilla/5.0 (Linux; Android 13; V2231) AppleWebKit/537.36 Chrome/123.0.0.0 Mobile Safari/537.36",
  },
  {
    id: "sub-107",
    endpoint: "https://web.push.apple.com/macbook-safari-push",
    browser: "সাফারি (Safari macOS)",
    device: "ল্যাপটপ (MacBook Pro)",
    categories: ["breaking", "business", "world"],
    isActive: true,
    createdAt: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
  },
];
