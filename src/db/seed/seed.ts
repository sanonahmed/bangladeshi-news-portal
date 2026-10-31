import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../schema";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || databaseUrl.includes("user:password@localhost")) {
    console.log("ℹ️  No real DATABASE_URL provided. Exiting seed script safely.");
    return;
  }

  console.log("🌱 Starting Bangladeshi News Portal database seeding...");
  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });

  // 1. Seed Site Settings
  console.log("⚙️  Seeding Site Settings...");
  const defaultSettings = [
    { key: "site_name", value: "দৈনিক বাংলাদেশ বার্তা", description: "পোর্টালের নাম", isPublic: true },
    { key: "site_name_en", value: "Daily Bangladesh Barta", description: "Site Name (English)", isPublic: true },
    { key: "site_slogan", value: "সত্য ও সাহসের পক্ষে অবিচল", description: "স্লোগান", isPublic: true },
    { key: "site_description", value: "বাংলাদেশের শীর্ষস্থানীয় বস্তুনিষ্ঠ অনলাইন জাতীয় সংবাদপত্র", description: "বিবরণ", isPublic: true },
    { key: "contact_email", value: "editor@bangladeshbarta.com", description: "যোগাযোগ ইমেইল", isPublic: true },
    { key: "editor_name", value: "আহমেদ রফিক", description: "সম্পাদক ও প্রকাশক", isPublic: true },
    { key: "office_address", value: "কাওরান বাজার, ঢাকা-১২১৫, বাংলাদেশ", description: "কার্যালয়ের ঠিকানা", isPublic: true },
    { key: "facebook_url", value: "https://facebook.com", description: "ফেসবুক লিংক", isPublic: true },
    { key: "twitter_url", value: "https://x.com", description: "টুইটার / এক্স লিংক", isPublic: true },
    { key: "youtube_url", value: "https://youtube.com", description: "ইউটিউব লিংক", isPublic: true },
    { key: "ga4_measurement_id", value: "G-DEMO123456", description: "Google Analytics 4 ID", isPublic: true },
  ];

  for (const setting of defaultSettings) {
    await db
      .insert(schema.siteSettings)
      .values(setting)
      .onConflictDoUpdate({
        target: schema.siteSettings.key,
        set: { value: setting.value, description: setting.description },
      });
  }

  // 2. Seed Divisions & Districts
  console.log("🗺️  Seeding Bangladesh Divisions & Districts...");
  const divisionsData = [
    {
      name: "ঢাকা",
      nameEn: "Dhaka",
      slug: "dhaka",
      sortOrder: 1,
      districts: [
        { name: "ঢাকা", nameEn: "Dhaka", slug: "dhaka-district", sortOrder: 1 },
        { name: "গাজীপুর", nameEn: "Gazipur", slug: "gazipur", sortOrder: 2 },
        { name: "নারায়ণগঞ্জ", nameEn: "Narayanganj", slug: "narayanganj", sortOrder: 3 },
        { name: "টাঙ্গাইল", nameEn: "Tangail", slug: "tangail", sortOrder: 4 },
        { name: "ফরিদপুর", nameEn: "Faridpur", slug: "faridpur", sortOrder: 5 },
      ],
    },
    {
      name: "চট্টগ্রাম",
      nameEn: "Chattogram",
      slug: "chattogram",
      sortOrder: 2,
      districts: [
        { name: "চট্টগ্রাম", nameEn: "Chattogram", slug: "chattogram-district", sortOrder: 1 },
        { name: "কক্সবাজার", nameEn: "Cox's Bazar", slug: "coxs-bazar", sortOrder: 2 },
        { name: "কুমিল্লা", nameEn: "Cumilla", slug: "cumilla", sortOrder: 3 },
        { name: "ব্রাহ্মণবাড়িয়া", nameEn: "Brahmanbaria", slug: "brahmanbaria", sortOrder: 4 },
        { name: "নোয়াখালী", nameEn: "Noakhali", slug: "noakhali", sortOrder: 5 },
      ],
    },
    {
      name: "রাজশাহী",
      nameEn: "Rajshahi",
      slug: "rajshahi",
      sortOrder: 3,
      districts: [
        { name: "রাজশাহী", nameEn: "Rajshahi", slug: "rajshahi-district", sortOrder: 1 },
        { name: "বগুড়া", nameEn: "Bogura", slug: "bogura", sortOrder: 2 },
        { name: "পাবনা", nameEn: "Pabna", slug: "pabna", sortOrder: 3 },
        { name: "সিরাজগঞ্জ", nameEn: "Sirajganj", slug: "sirajganj", sortOrder: 4 },
      ],
    },
    {
      name: "খুলনা",
      nameEn: "Khulna",
      slug: "khulna",
      sortOrder: 4,
      districts: [
        { name: "খুলনা", nameEn: "Khulna", slug: "khulna-district", sortOrder: 1 },
        { name: "যশোর", nameEn: "Jashore", slug: "jashore", sortOrder: 2 },
        { name: "কুষ্টিয়া", nameEn: "Kushtia", slug: "kushtia", sortOrder: 3 },
        { name: "বাগেরহাট", nameEn: "Bagerhat", slug: "bagerhat", sortOrder: 4 },
      ],
    },
    {
      name: "বরিশাল",
      nameEn: "Barishal",
      slug: "barishal",
      sortOrder: 5,
      districts: [
        { name: "বরিশাল", nameEn: "Barishal", slug: "barishal-district", sortOrder: 1 },
        { name: "পটুয়াখালী", nameEn: "Patuakhali", slug: "patuakhali", sortOrder: 2 },
        { name: "ভোলা", nameEn: "Bhola", slug: "bhola", sortOrder: 3 },
      ],
    },
    {
      name: "সিলেট",
      nameEn: "Sylhet",
      slug: "sylhet",
      sortOrder: 6,
      districts: [
        { name: "সিলেট", nameEn: "Sylhet", slug: "sylhet-district", sortOrder: 1 },
        { name: "মৌলভীবাজার", nameEn: "Moulvibazar", slug: "moulvibazar", sortOrder: 2 },
        { name: "হবিগঞ্জ", nameEn: "Habiganj", slug: "habiganj", sortOrder: 3 },
        { name: "সুনামগঞ্জ", nameEn: "Sunamganj", slug: "sunamganj", sortOrder: 4 },
      ],
    },
    {
      name: "রংপুর",
      nameEn: "Rangpur",
      slug: "rangpur",
      sortOrder: 7,
      districts: [
        { name: "রংপুর", nameEn: "Rangpur", slug: "rangpur-district", sortOrder: 1 },
        { name: "দিনাজপুর", nameEn: "Dinajpur", slug: "dinajpur", sortOrder: 2 },
        { name: "কুড়িগ্রাম", nameEn: "Kurigram", slug: "kurigram", sortOrder: 3 },
      ],
    },
    {
      name: "ময়মনসিংহ",
      nameEn: "Mymensingh",
      slug: "mymensingh",
      sortOrder: 8,
      districts: [
        { name: "ময়মনসিংহ", nameEn: "Mymensingh", slug: "mymensingh-district", sortOrder: 1 },
        { name: "জামালপুর", nameEn: "Jamalpur", slug: "jamalpur", sortOrder: 2 },
        { name: "নেত্রকোণা", nameEn: "Netrokona", slug: "netrokona", sortOrder: 3 },
      ],
    },
  ];

  for (const div of divisionsData) {
    const [insertedDiv] = await db
      .insert(schema.divisions)
      .values({
        name: div.name,
        nameEn: div.nameEn,
        slug: div.slug,
        sortOrder: div.sortOrder,
      })
      .onConflictDoUpdate({
        target: schema.divisions.slug,
        set: { name: div.name, nameEn: div.nameEn, sortOrder: div.sortOrder },
      })
      .returning();

    if (insertedDiv) {
      for (const dist of div.districts) {
        await db
          .insert(schema.districts)
          .values({
            name: dist.name,
            nameEn: dist.nameEn,
            slug: dist.slug,
            divisionId: insertedDiv.id,
            sortOrder: dist.sortOrder,
          })
          .onConflictDoUpdate({
            target: schema.districts.slug,
            set: { name: dist.name, nameEn: dist.nameEn, sortOrder: dist.sortOrder },
          });
      }
    }
  }

  // 3. Seed Editorial Categories
  console.log("📂 Seeding Newspaper Categories...");
  const categoriesList = [
    { name: "জাতীয়", nameEn: "National", slug: "national", sortOrder: 1 },
    { name: "রাজনীতি", nameEn: "Politics", slug: "politics", sortOrder: 2 },
    { name: "আন্তর্জাতিক", nameEn: "International", slug: "international", sortOrder: 3 },
    { name: "অর্থনীতি", nameEn: "Economy", slug: "economy", sortOrder: 4 },
    { name: "খেলাধুলা", nameEn: "Sports", slug: "sports", sortOrder: 5 },
    { name: "বিনোদন", nameEn: "Entertainment", slug: "entertainment", sortOrder: 6 },
    { name: "প্রযুক্তি", nameEn: "Technology", slug: "technology", sortOrder: 7 },
    { name: "শিক্ষা", nameEn: "Education", slug: "education", sortOrder: 8 },
    { name: "সারাদেশ", nameEn: "Countrywide", slug: "countrywide", sortOrder: 9 },
    { name: "মতামত", nameEn: "Opinion", slug: "opinion", sortOrder: 10 },
    { name: "জীবনযাপন", nameEn: "Lifestyle", slug: "lifestyle", sortOrder: 11 },
    { name: "ভিডিও", nameEn: "Videos", slug: "videos", sortOrder: 12 },
    { name: "ছবিঘর", nameEn: "Photo Gallery", slug: "photos", sortOrder: 13 },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesList) {
    const [inserted] = await db
      .insert(schema.categories)
      .values({
        name: cat.name,
        nameEn: cat.nameEn,
        slug: cat.slug,
        sortOrder: cat.sortOrder,
        isActive: true,
        showInNav: true,
      })
      .onConflictDoUpdate({
        target: schema.categories.slug,
        set: { name: cat.name, nameEn: cat.nameEn, sortOrder: cat.sortOrder },
      })
      .returning();
    if (inserted) {
      categoryMap.set(cat.slug, inserted.id);
    }
  }

  // 4. Seed Navigation Items
  console.log("🧭 Seeding Navigation Items...");
  const navItems = [
    { label: "প্রচ্ছদ", labelEn: "Home", href: "/", sortOrder: 0 },
    { label: "সর্বশেষ", labelEn: "Latest", href: "/latest", sortOrder: 1 },
    { label: "জাতীয়", labelEn: "National", href: "/category/national", sortOrder: 2 },
    { label: "রাজনীতি", labelEn: "Politics", href: "/category/politics", sortOrder: 3 },
    { label: "আন্তর্জাতিক", labelEn: "International", href: "/category/international", sortOrder: 4 },
    { label: "অর্থনীতি", labelEn: "Economy", href: "/category/economy", sortOrder: 5 },
    { label: "খেলাধুলা", labelEn: "Sports", href: "/category/sports", sortOrder: 6 },
    { label: "বিনোদন", labelEn: "Entertainment", href: "/category/entertainment", sortOrder: 7 },
    { label: "প্রযুক্তি", labelEn: "Technology", href: "/category/technology", sortOrder: 8 },
    { label: "সারাদেশ", labelEn: "Countrywide", href: "/category/countrywide", sortOrder: 9 },
    { label: "মতামত", labelEn: "Opinion", href: "/opinion", sortOrder: 10 },
    { label: "ভিডিও", labelEn: "Videos", href: "/videos", sortOrder: 11 },
  ];

  for (const item of navItems) {
    await db.insert(schema.navigationItems).values({
      label: item.label,
      labelEn: item.labelEn,
      href: item.href,
      sortOrder: item.sortOrder,
      isActive: true,
    });
  }

  // 5. Seed Initial Editorial User (Super Admin)
  console.log("👤 Seeding Editorial Super Admin...");
  const [adminUser] = await db
    .insert(schema.user)
    .values({
      name: "প্রধান বার্তা সম্পাদক",
      email: "editor@bangladeshbarta.com",
      role: "super_admin",
      emailVerified: true,
    })
    .onConflictDoUpdate({
      target: schema.user.email,
      set: { role: "super_admin" },
    })
    .returning();

  // 6. Seed Breaking News
  if (adminUser) {
    console.log("🚨 Seeding Breaking News Ticker...");
    const breakingItems = [
      {
        headline: "জাতীয় সংসদ নির্বাচনের তফসিল ঘোষণা আগামী সপ্তাহে, নির্বাচন কমিশনের ব্রিফিং",
        priority: 1,
      },
      {
        headline: "মিরপুর শেরেবাংলা স্টেডিয়ামে প্রথম ইনিংসে বাংলাদেশের শক্ত অবস্থান, শান্ত ও মিরাজের সেঞ্চুরি",
        priority: 2,
      },
      {
        headline: "বাংলাদেশ ব্যাংকের নতুন মুদ্রানীতি ঘোষণা: মূল্যস্ফীতি নিয়ন্ত্রণে সুদের হার অপরিবর্তিত",
        priority: 3,
      },
    ];

    for (const b of breakingItems) {
      await db.insert(schema.breakingNews).values({
        headline: b.headline,
        priority: b.priority,
        isActive: true,
        createdBy: adminUser.id,
      });
    }

    // 7. Seed Sample Rich Articles
    console.log("📰 Seeding Authentic Articles...");
    const articlesData = [
      {
        title: "ঢাকায় আধুনিক গণপরিবহন ব্যবস্থার সম্প্রসারণে নতুন প্রকল্প অনুমোদন",
        slug: "dhaka-public-transport-metro-expansion-approved",
        excerpt: "রাজধানীর ট্রাফিক সংকট নিরসনে নতুন মেট্রোরেল ও বিআরটি রুটের চূড়ান্ত অনুমোদন দিয়েছে একনেক।",
        content: "<p>রাজধানী ঢাকায় যানজট নিরসন এবং আধুনিক পরিবেশবান্ধব গণপরিবহন ব্যবস্থা গড়ে তোলার লক্ষ্যে নতুন প্রকল্প অনুমোদন দিয়েছে জাতীয় অর্থনৈতিক পরিষদের নির্বাহী কমিটি (একনেক)।</p><p>আজকের বৈঠকে অনুমোদিত প্রস্তাবনা অনুযায়ী রাজধানীর বিভিন্ন গুরুত্বপূর্ণ রুটে দ্রুতগামী যোগাযোগ ব্যবস্থা চালুর সময়সীমা নির্ধারণ করা হয়েছে।</p><p>প্রকল্পের আওতায় নতুন কোচ সংগ্রহ, স্টেশনগুলোর আধুনিকায়ন এবং পথচারী-বান্ধব অবকাঠামো নির্মাণ করা হবে বলে জানিয়েছেন পরিকল্পনা উপদেষ্টা।</p>",
        categorySlug: "national",
        isFeatured: true,
        featuredOrder: 1,
        newsLocation: "ঢাকা",
      },
      {
        title: "রপ্তানি আয়ে নতুন মাইলফলক: পোশাক খাতের পাশাপাশি বেড়েছে কৃষিজ পণ্যের চাহিদা",
        slug: "bangladesh-export-earnings-reach-new-milestone",
        excerpt: "চলতি অর্থবছরের প্রথম ছয় মাসে রপ্তানি আয়ে অভাবনীয় সাফল্য, ইউরোপ ও আমেরিকার বাজারে প্রবৃদ্ধি অব্যাহত।",
        content: "<p>বৈশ্বিক প্রতিকূল পরিস্থিতির মধ্যেও বাংলাদেশের রপ্তানি খাতে আশাব্যঞ্জক প্রবৃদ্ধি অর্জিত হয়েছে। তৈরি পোশাক খাতের পাশাপাশি হিমায়িত খাদ্য, পাটজাত পণ্য এবং কৃষিজাত সামগ্রী রপ্তানিতে উচ্চ প্রবৃদ্ধি দেখা গেছে।</p><p>রপ্তানি উন্নয়ন ব্যুরোর (ইপিবি) সর্বশেষ পরিসংখ্যানে এই তথ্য জানানো হয়েছে।</p>",
        categorySlug: "economy",
        isFeatured: false,
        featuredOrder: 2,
        newsLocation: "বাণিজ্য ভবন, ঢাকা",
      },
      {
        title: "টি-টোয়েন্টি বিশ্বকাপের আগে দারুণ প্রস্তুতি: সিরিজ জয়ে আত্মবিশ্বাসী বাংলাদেশ দল",
        slug: "bangladesh-cricket-team-series-win-preparation",
        excerpt: "ঘরের মাঠে দুর্দান্ত বোলিং ও ব্যাটিং পারফরম্যান্সে সিরিজ নিজেদের করে নিল বাংলাদেশ ক্রিকেট দল।",
        content: "<p>মিরপুর শেরেবাংলা জাতীয় ক্রিকেট স্টেডিয়ামে অনুষ্ঠিত রোমাঞ্চকর ফাইনালে সফরকারী দলকে হারিয়ে সিরিজ নিশ্চিত করেছে বাংলাদেশ টাইগার্স।</p><p>অধিনায়ক ম্যাচ শেষে সংবাদ সম্মেলনে জানান, দলের তরুণ ক্রিকেটারদের পারফরম্যান্স আন্তর্জাতিক অঙ্গনে দারুণ প্রেরণা জোগাবে।</p>",
        categorySlug: "sports",
        isFeatured: false,
        featuredOrder: 3,
        newsLocation: "মিরপুর, ঢাকা",
      },
      {
        title: "কৃত্রিম বুদ্ধিমত্তা ও বাংলা ভাষা প্রযুক্তি: বৈশ্বিক প্রতিযোগিতায় দেশের তরুণ প্রযুক্তিবিদরা",
        slug: "ai-bengali-language-technology-innovations",
        excerpt: "বাংলা ভাষার জন্য নতুন লার্জ ল্যাঙ্গুয়েজ মডেল উদ্ভাবন করে আন্তর্জাতিক পরিমণ্ডলে সুনাম কুড়িয়েছে দেশের একদল গবেষক।",
        content: "<p>কৃত্রিম বুদ্ধিমত্তা প্রযুক্তির প্রসারের সঙ্গে সঙ্গে বাংলা ভাষায় ন্যাচারাল ল্যাঙ্গুয়েজ প্রসেসিং (NLP) ও উন্নত ডেটাসেট তৈরির নতুন উদ্যোগ সফল হয়েছে।</p><p>বাংলাদেশের প্রকৌশলীরা তৈরি করেছেন ইউনিকোড-ভিত্তিক উচ্চমানের স্বয়ংক্রিয় অনুবাদ ও টেক্সট প্রসেসিং প্ল্যাটফর্ম।</p>",
        categorySlug: "technology",
        isFeatured: false,
        featuredOrder: 4,
        newsLocation: "আগারগাঁও, ঢাকা",
      },
    ];

    for (const a of articlesData) {
      const [art] = await db
        .insert(schema.articles)
        .values({
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt,
          content: a.content,
          authorId: adminUser.id,
          status: "published",
          publishedAt: new Date(),
          isFeatured: a.isFeatured,
          featuredOrder: a.featuredOrder,
          newsLocation: a.newsLocation,
          seoTitle: a.title,
          seoDescription: a.excerpt,
        })
        .onConflictDoUpdate({
          target: schema.articles.slug,
          set: {
            title: a.title,
            excerpt: a.excerpt,
            content: a.content,
            status: "published",
          },
        })
        .returning();

      if (art && a.categorySlug && categoryMap.has(a.categorySlug)) {
        const catId = categoryMap.get(a.categorySlug)!;
        await db
          .insert(schema.articleCategories)
          .values({
            articleId: art.id,
            categoryId: catId,
          })
          .onConflictDoNothing();
      }
    }

    // 8. Seed Advertisements Slots
    console.log("📢 Seeding Advertisement Slots...");
    const adPlacements: schema.AdPlacement[] = [
      "header_banner",
      "homepage_leaderboard",
      "sidebar",
      "between_sections",
      "article_inline",
      "footer",
    ];

    for (const placement of adPlacements) {
      await db.insert(schema.advertisements).values({
        name: `Default ${placement} Ad`,
        placement,
        type: "adsense",
        adCode: `<div class="w-full h-full flex flex-col items-center justify-center p-3 text-center"><span class="text-xs text-neutral-400 uppercase tracking-widest">বিজ্ঞাপন স্থান</span><p class="text-xs text-neutral-500 mt-1">Responsive Ad Slot (${placement})</p></div>`,
        isActive: true,
        deviceTarget: "all",
        createdBy: adminUser.id,
      });
    }
  }

  console.log("✅ Bangladeshi News Portal database seeding completed successfully!");
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
