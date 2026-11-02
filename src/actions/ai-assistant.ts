"use server";

import { z } from "zod";

export interface AiHeadlineOption {
  id: string;
  style: "editorial" | "breaking" | "engaging" | "analytical";
  styleLabel: string;
  headline: string;
  headlineEn: string;
  slug: string;
  explanation: string;
}

export interface AiAssistanceResult {
  headlines: AiHeadlineOption[];
  excerpt: string;
  socialTeaser: string;
  suggestedTags: string[];
  detectedLocation?: {
    divisionName?: string;
    districtName?: string;
  } | null;
  keyTakeaways: string[];
  readingTimeMinutes: number;
  wordCount: number;
  isAiGenerated: boolean;
  modelUsed: string;
}

export interface ProofreadCorrection {
  before: string;
  after: string;
  reason: string;
}

export interface ProofreadResult {
  originalText: string;
  cleanedText: string;
  correctionsCount: number;
  corrections: ProofreadCorrection[];
}

// Bangladesh 64 Districts for Auto-Detection
const BD_DISTRICTS: Array<{ name: string; division: string; nameEn: string }> = [
  { name: "ঢাকা", division: "ঢাকা", nameEn: "Dhaka" },
  { name: "গাজীপুর", division: "ঢাকা", nameEn: "Gazipur" },
  { name: "নারায়ণগঞ্জ", division: "ঢাকা", nameEn: "Narayanganj" },
  { name: "টাঙ্গাইল", division: "ঢাকা", nameEn: "Tangail" },
  { name: "ফরিদপুর", division: "ঢাকা", nameEn: "Faridpur" },
  { name: "নরসিংদী", division: "ঢাকা", nameEn: "Narsingdi" },
  { name: "মানিকগঞ্জ", division: "ঢাকা", nameEn: "Manikganj" },
  { name: "মুন্সীগঞ্জ", division: "ঢাকা", nameEn: "Munshiganj" },
  { name: "কিশোরগঞ্জ", division: "ঢাকা", nameEn: "Kishoreganj" },
  { name: "চট্টগ্রাম", division: "চট্টগ্রাম", nameEn: "Chattogram" },
  { name: "কক্সবাজার", division: "চট্টগ্রাম", nameEn: "Cox's Bazar" },
  { name: "কুমিল্লা", division: "চট্টগ্রাম", nameEn: "Cumilla" },
  { name: "ব্রাহ্মণবাড়িয়া", division: "চট্টগ্রাম", nameEn: "Brahmanbaria" },
  { name: "নোয়াখালী", division: "চট্টগ্রাম", nameEn: "Noakhali" },
  { name: "ফেনী", division: "চট্টগ্রাম", nameEn: "Feni" },
  { name: "চাঁদপুর", division: "চট্টগ্রাম", nameEn: "Chandpur" },
  { name: "সিলেট", division: "সিলেট", nameEn: "Sylhet" },
  { name: "মৌলভীবাজার", division: "সিলেট", nameEn: "Moulvibazar" },
  { name: "হবিগঞ্জ", division: "সিলেট", nameEn: "Habiganj" },
  { name: "সুনামগঞ্জ", division: "সিলেট", nameEn: "Sunamganj" },
  { name: "রাজশাহী", division: "রাজশাহী", nameEn: "Rajshahi" },
  { name: "বগুড়া", division: "রাজশাহী", nameEn: "Bogura" },
  { name: "পাবনা", division: "রাজশাহী", nameEn: "Pabna" },
  { name: "সিরাজগঞ্জ", division: "রাজশাহী", nameEn: "Sirajganj" },
  { name: "খুলনা", division: "খুলনা", nameEn: "Khulna" },
  { name: "যশোর", division: "খুলনা", nameEn: "Jashore" },
  { name: "কুষ্টিয়া", division: "খুলনা", nameEn: "Kushtia" },
  { name: "সাতক্ষীরা", division: "খুলনা", nameEn: "Satkhira" },
  { name: "বরিশাল", division: "বরিশাল", nameEn: "Barishal" },
  { name: "পটুয়াখালী", division: "বরিশাল", nameEn: "Patuakhali" },
  { name: "ভোলা", division: "বরিশাল", nameEn: "Bhola" },
  { name: "রংপুর", division: "রংপুর", nameEn: "Rangpur" },
  { name: "দিনাজপুর", division: "রংপুর", nameEn: "Dinajpur" },
  { name: "পঞ্চগড়", division: "রংপুর", nameEn: "Panchagarh" },
  { name: "ময়মনসিংহ", division: "ময়মনসিংহ", nameEn: "Mymensingh" },
  { name: "জামালপুর", division: "ময়মনসিংহ", nameEn: "Jamalpur" },
];

// Common Bengali misspelling dictionary & standardizations
const BENGALI_CORRECTIONS_DICT: Array<{ pattern: RegExp; replacement: string; reason: string }> = [
  { pattern: /শৃংখলা/g, replacement: "শৃঙ্খলা", reason: "প্রমিত বাংলা বানানে 'শৃংখলা' নয়, 'শৃঙ্খলা' প্রযোজ্য।" },
  { pattern: /ধন্নবাদ/g, replacement: "ধন্যবাদ", reason: "'ধন্যবাদ' সঠিক প্রমিত রূপ।" },
  { pattern: /পরিক্ষা/g, replacement: "পরীক্ষা", reason: "'পরীক্ষা' দীর্ঘ-ঈ কার যুক্ত সঠিক রূপ।" },
  { pattern: /পোষ্ট/g, replacement: "পোস্ট", reason: "বিদেশি শব্দে মূর্ধন্য-ষ নয়, দন্ত্য-স ('স্ট') ব্যবহৃত হয়।" },
  { pattern: /ষ্টেশন/g, replacement: "স্টেশন", reason: "বিদেশি শব্দে 'স্ট' হবে (বাংলা একাডেমি নিয়ম)।" },
  { pattern: /রেজিষ্ট্রেশন/g, replacement: "রেজিস্ট্রেশন", reason: "বিদেশি শব্দে 'স্ট' হবে।" },
  { pattern: /মাষ্টার/g, replacement: "মাস্টার", reason: "বিদেশি শব্দে 'স্ট' হবে।" },
  { pattern: /পুরষ্কার/g, replacement: "পুরস্কার", reason: "সন্ধির নিয়মে 'পুরস্কার' (দন্ত্য-স)।" },
  { pattern: /তিরষ্কার/g, replacement: "তিরস্কার", reason: "সন্ধির নিয়মে 'তিরস্কার' (দন্ত্য-স)।" },
  { pattern: /মুহুর্ত/g, replacement: "মুহূর্ত", reason: "'মুহূর্ত' বানানে হ-এ দীর্ঘ-ঊ কার প্রযোজ্য।" },
  { pattern: /শ্রদ্ধাঞ্জলী/g, replacement: "শ্রদ্ধাঞ্জলি", reason: "'-অঞ্জলি' যুক্ত শব্দে হ্রস্ব-ই কার হয়।" },
  { pattern: /গীতাঞ্জলী/g, replacement: "গীতাঞ্জলি", reason: "'-অঞ্জলি' যুক্ত শব্দে হ্রস্ব-ই কার হয়।" },
  { pattern: /বুদ্ধিজীবি/g, replacement: "বুদ্ধিজীবী", reason: "'-জীবী' প্রত্যয়ে উভয়টিই দীর্ঘ-ঈ কার হয়।" },
  { pattern: /চাকুরিজীবি/g, replacement: "চাকরিজীবী", reason: "'চাকরিজীবী' সঠিক রূপ।" },
  { pattern: /মৎস\b/g, replacement: "মৎস্য", reason: "তৎসম বানানে 'মৎস্য'।" },
  { pattern: /দূরবস্থা/g, replacement: "দুরবস্থা", reason: "প্রমিত বানানে হ্রস্ব-উ কার ('দুরবস্থা')।" },
  { pattern: /ইতোমধ্যে/g, replacement: "ইতোমধ্যে", reason: "সঠিক রূপ।" },
  { pattern: /ইতিমধ্যে/g, replacement: "ইতোমধ্যে", reason: "সন্ধির নিয়মে 'ইতিমধ্যে' নয়, 'ইতোমধ্যে' শুদ্ধ।" },
];

// Helper: Strip HTML tags
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>?/gm, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// Helper: Generate clean English slug from string
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Proofread and normalize Bengali text (Unicode / Orthography)
 */
export async function proofreadBengaliText(text: string): Promise<ProofreadResult> {
  const original = text;
  let cleaned = text;
  const corrections: ProofreadCorrection[] = [];

  // Remove rogue zero-width non-joiner / joiner corruptions that break fonts
  cleaned = cleaned.replace(/\u200D\u200C|\u200C\u200D/g, "");

  // Apply dictionary replacements
  for (const item of BENGALI_CORRECTIONS_DICT) {
    if (item.pattern.test(cleaned)) {
      const matches = cleaned.match(item.pattern);
      if (matches && matches.length > 0) {
        corrections.push({
          before: matches[0],
          after: item.replacement,
          reason: item.reason,
        });
        cleaned = cleaned.replace(item.pattern, item.replacement);
      }
    }
  }

  // Clean double spaces and improper punctuation
  cleaned = cleaned.replace(/ {2,}/g, " ");

  return {
    originalText: original,
    cleanedText: cleaned,
    correctionsCount: corrections.length,
    corrections,
  };
}

/**
 * Generate Smart Bengali Headlines, Excerpt, Tags, and Summary
 */
export async function generateAiArticleAssistance(params: {
  title?: string;
  content: string;
  notes?: string;
}): Promise<AiAssistanceResult> {
  const rawText = stripHtml(params.content || "");
  const currentTitle = (params.title || "").trim();
  const notes = (params.notes || "").trim();

  const words = rawText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 160)); // ~160 words/min for Bengali

  // 1. Try Google Gemini API if API key exists in environment
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiApiKey && (rawText.length > 30 || currentTitle.length > 5)) {
    try {
      const prompt = `
তুমি একজন আন্তর্জাতিক মানের বাংলা জাতীয় সংবাদপত্রের প্রধান বার্তা সম্পাদক (Chief News Editor)।
নিচের সংবাদের খসড়া বা সারসংক্ষেপ বিশ্লেষণ করে সম্পাদকীয় দলের জন্য JSON ফরম্যাটে আউটপুট তৈরি করো।

সংবাদের শিরোনাম (যদি থাকে): ${currentTitle || "দেওয়া হয়নি"}
সম্পাদকীয় নোট (যদি থাকে): ${notes || "নেই"}
সংবাদের বিষয়বস্তু:
${rawText.slice(0, 3000)}

দয়া করে ঠিক এই JSON ফরম্যাটে উত্তর দাও (অন্য কোনো লেখা বা ব্যাকটিক ছাড়া শুধুমাত্র ভ্যালিড JSON):
{
  "headlines": [
    {
      "id": "h-1",
      "style": "editorial",
      "styleLabel": "বস্তুনিষ্ঠ সম্পাদকীয়",
      "headline": "...",
      "headlineEn": "...",
      "slug": "...",
      "explanation": "কেন এই শিরোনামটি নির্ভরযোগ্য"
    },
    {
      "id": "h-2",
      "style": "breaking",
      "styleLabel": "ব্রেকিং ও সংক্ষিপ্ত",
      "headline": "...",
      "headlineEn": "...",
      "slug": "...",
      "explanation": "জরুরি তথ্য প্রকাশের উপযুক্ত"
    },
    {
      "id": "h-3",
      "style": "engaging",
      "styleLabel": "নাগরিক দৃষ্টিকোণ ও প্রভাব",
      "headline": "...",
      "headlineEn": "...",
      "slug": "...",
      "explanation": "সাধারণ পাঠকের আগ্রহ সৃষ্টিকারী"
    },
    {
      "id": "h-4",
      "style": "analytical",
      "styleLabel": "বিশ্লেষণধর্মী অনুসন্ধান",
      "headline": "...",
      "headlineEn": "...",
      "slug": "...",
      "explanation": "গভীর তাৎপর্য নির্দেশক"
    }
  ],
  "excerpt": "সংবাদের মূল ১-২ বাক্যের ক্রিস্প সারাংশ (১২০-১৫০ অক্ষরের মধ্যে)",
  "socialTeaser": "ফেসবুক ও সোশ্যাল মিডিয়ার জন্য আকর্ষণীয় পোস্ট ক্যাপশন ও হ্যাশট্যাগ",
  "suggestedTags": ["ট্যাগ১", "ট্যাগ২", "ট্যাগ৩", "ট্যাগ৪"],
  "detectedDistrict": "যদি সংবাদের কোনো জেলা/স্থান পাওয়া যায় তার নাম, অন্যথায় null",
  "keyTakeaways": ["মূল তথ্য ১", "মূল তথ্য ২", "মূল তথ্য ৩"]
}
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          const locationMatch = BD_DISTRICTS.find(
            (d) => d.name === parsed.detectedDistrict || rawText.includes(d.name)
          );

          return {
            headlines: parsed.headlines || [],
            excerpt: parsed.excerpt || "",
            socialTeaser: parsed.socialTeaser || "",
            suggestedTags: parsed.suggestedTags || [],
            detectedLocation: locationMatch
              ? { districtName: locationMatch.name, divisionName: locationMatch.division }
              : null,
            keyTakeaways: parsed.keyTakeaways || [],
            readingTimeMinutes,
            wordCount,
            isAiGenerated: true,
            modelUsed: "Google Gemini 1.5 Flash",
          };
        }
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to built-in Bengali Journalistic Engine:", err);
    }
  }

  // 2. Intelligent Built-in Bengali Journalistic Engine (Zero dependency fallback)
  return generateHeuristicAssistance({
    rawText,
    currentTitle,
    notes,
    wordCount,
    readingTimeMinutes,
  });
}

/**
 * Built-in Intelligent Bengali Journalistic Engine
 */
function generateHeuristicAssistance(params: {
  rawText: string;
  currentTitle: string;
  notes: string;
  wordCount: number;
  readingTimeMinutes: number;
}): AiAssistanceResult {
  const { rawText, currentTitle, wordCount, readingTimeMinutes } = params;

  // Split into sentences using Bengali DARI (।) or newline or question mark
  const sentences = rawText
    .split(/[।?!;\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  const leadSentence = sentences[0] || currentTitle || "জাতীয় গুরুত্বপূর্ণ সংবাদ";
  const secondSentence = sentences[1] || "";

  // Base Subject Extraction
  let coreSubject = currentTitle;
  if (!coreSubject || coreSubject.length < 5) {
    const subjectWords = leadSentence.split(/\s+/).slice(0, 7).join(" ");
    coreSubject = subjectWords;
  }

  // Detect District
  let detectedDistrict: { districtName: string; divisionName: string } | null = null;
  for (const d of BD_DISTRICTS) {
    if (rawText.includes(d.name) || currentTitle.includes(d.name)) {
      detectedDistrict = { districtName: d.name, divisionName: d.division };
      break;
    }
  }

  // Construct 4 stylistic Bengali Headlines:
  // Style 1: Editorial (Balanced & Authoritative)
  const editorialHeadline = currentTitle
    ? currentTitle.endsWith("।") ? currentTitle.slice(0, -1) : currentTitle
    : `${leadSentence.slice(0, 65).trim()} সংক্রান্ত বিস্তারিত তথ্য`;

  // Style 2: Breaking / Alert (Concise & Punchy)
  const breakingHeadline = `ব্রেকিং: ${coreSubject.replace(/^(ব্রেকিং|জরুরি)[:\s]*/, "").slice(0, 50).trim()} নিয়ে নতুন সিদ্ধান্ত`;

  // Style 3: Citizen Perspective / Impact
  const engagingHeadline = `${coreSubject.slice(0, 48).trim()}: সাধারণ মানুষ ও সংশ্লিষ্টদের ওপর কী প্রভাব পড়বে?`;

  // Style 4: Analytical / Perspective
  const analyticalHeadline = `${coreSubject.slice(0, 48).trim()}: পেছনের মূল কারণ ও ভবিষ্যৎ দিকনির্দেশনা`;

  // Build headline options
  const headlines: AiHeadlineOption[] = [
    {
      id: "opt-1",
      style: "editorial",
      styleLabel: "বস্তুনিষ্ঠ সম্পাদকীয়",
      headline: editorialHeadline,
      headlineEn: "Government announces key policy directives on current national issue",
      slug: slugify(editorialHeadline) || `news-editorial-${Date.now()}`,
      explanation: "ভারসাম্যপূর্ণ, বস্তুনিষ্ঠ ও জাতীয় দৈনিকের প্রথম পাতার জন্য উপযোগী মানদণ্ড।",
    },
    {
      id: "opt-2",
      style: "breaking",
      styleLabel: "ব্রেকিং ও সংক্ষিপ্ত",
      headline: breakingHeadline,
      headlineEn: "Breaking news update on major national development",
      slug: slugify(breakingHeadline) || `breaking-update-${Date.now()}`,
      explanation: "সোশ্যাল মিডিয়া নোটিফিকেশন, স্ক্রলবার ও তাৎক্ষণিক ব্রেকিং অ্যালার্টের জন্য সর্বোত্তম।",
    },
    {
      id: "opt-3",
      style: "engaging",
      styleLabel: "নাগরিক দৃষ্টিকোণ ও প্রভাব",
      headline: engagingHeadline,
      headlineEn: "How the latest policy decision impacts citizens and businesses",
      slug: slugify(engagingHeadline) || `impact-analysis-${Date.now()}`,
      explanation: "ক্লিকবেটমুক্ত কিন্তু সাধারণ পাঠকের প্রত্যক্ষ স্বার্থ ও কৌতূহলকে প্রাধান্য দেয়।",
    },
    {
      id: "opt-4",
      style: "analytical",
      styleLabel: "বিশ্লেষণধর্মী দৃষ্টিভঙ্গি",
      headline: analyticalHeadline,
      headlineEn: "Deep dive analysis into background and future implications",
      slug: slugify(analyticalHeadline) || `analytical-view-${Date.now()}`,
      explanation: "সম্পাদকীয় পাতা, গভীর পর্যবেক্ষণ ও ফলোআপ প্রতিবেদনের জন্য মানানসই।",
    },
  ];

  // Excerpt generation: 1st sentence clean lead
  let excerpt = "";
  if (leadSentence) {
    excerpt = leadSentence.length > 150 ? `${leadSentence.slice(0, 145).trim()}...` : `${leadSentence}।`;
    if (secondSentence && excerpt.length < 90) {
      excerpt += ` ${secondSentence.slice(0, 60).trim()}।`;
    }
  } else {
    excerpt = "জাতীয় দৈনিক বাংলাদেশ বার্তার বিশেষ অনলাইন ও মুদ্রিত প্রতিবেদন। বিস্তারিত পড়ুন।";
  }

  // Social Teaser Caption
  const socialTeaser = `📌 ${editorialHeadline}\n\n${excerpt.slice(0, 120)}...\n\n👉 বিস্তারিত সংবাদ পড়ুন দৈনিক বাংলাদেশ বার্তায়। #BangladeshNews #BreakingNews`;

  // Suggested Tags
  const candidateTags = ["জাতীয়", "বাংলাদেশ বার্তা", "বিশেষ প্রতিবেদন"];
  if (detectedDistrict) {
    candidateTags.push(detectedDistrict.districtName);
  }
  if (/অর্থনীতি|ব্যাংক|টাকা|মূল্যস্ফীতি|ডলার|বাজেট/.test(rawText)) candidateTags.push("অর্থনীতি", "বাণিজ্য");
  if (/সরকার|প্রধানমন্ত্রী|উপদেষ্টা|মন্ত্রণালয়|আইন/.test(rawText)) candidateTags.push("রাজনীতি", "সরকার");
  if (/খেলা|ক্রিকেট|ফুটবল|রান|উইকেট|বিপিএল/.test(rawText)) candidateTags.push("খেলাধুলা", "ক্রিকেট");
  if (/পুলিশ|র‌্যাব|আদালত|মামলা|গ্রেপ্তার/.test(rawText)) candidateTags.push("আইন ও অপরাধ");
  if (/প্রযুক্তি|এআই|ইন্টারনেট|মোবাইল|ডিজিটাল/.test(rawText)) candidateTags.push("বিজ্ঞান ও প্রযুক্তি");

  const suggestedTags = Array.from(new Set(candidateTags)).slice(0, 6);

  // Key takeaways
  const keyTakeaways = sentences.slice(0, 3).map((s) => s.slice(0, 90).trim() + "।");
  if (keyTakeaways.length === 0) {
    keyTakeaways.push("প্রতিবেদনে সরকারের সামগ্রিক নীতিমালার বিস্তারিত বিশ্লেষণ তুলে ধরা হয়েছে।");
  }

  return {
    headlines,
    excerpt,
    socialTeaser,
    suggestedTags,
    detectedLocation: detectedDistrict,
    keyTakeaways,
    readingTimeMinutes,
    wordCount,
    isAiGenerated: false,
    modelUsed: "Bangla Journalistic Heuristic Engine v2.0",
  };
}
