import { neon } from "@neondatabase/serverless";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_5UR2YsILmoSE@ep-proud-mountain-b3kkn4fs-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(connectionString);

async function main() {
  console.log("🚀 Starting Debates & Opinion Poll Migration on Neon...");

  // 1. Alter polls table
  await sql`
    ALTER TABLE polls ADD COLUMN IF NOT EXISTS slug TEXT;
  `;
  await sql`
    ALTER TABLE polls ADD COLUMN IF NOT EXISTS topic_context TEXT;
  `;
  await sql`
    ALTER TABLE polls ADD COLUMN IF NOT EXISTS editorial_summary TEXT;
  `;
  await sql`
    ALTER TABLE polls ADD COLUMN IF NOT EXISTS is_weekly_debate BOOLEAN DEFAULT true;
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS polls_slug_idx ON polls(slug);
  `;
  console.log("✅ polls table updated with debate fields.");

  // 2. Create debate_arguments table
  await sql`
    CREATE TABLE IF NOT EXISTS debate_arguments (
      id TEXT PRIMARY KEY,
      poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
      side TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_location TEXT,
      argument TEXT NOT NULL,
      upvotes INTEGER NOT NULL DEFAULT 0,
      is_pinned BOOLEAN NOT NULL DEFAULT false,
      is_editor_choice BOOLEAN NOT NULL DEFAULT false,
      is_approved BOOLEAN NOT NULL DEFAULT true,
      user_id TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS debate_args_poll_id_idx ON debate_arguments(poll_id);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS debate_args_side_idx ON debate_arguments(side);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS debate_args_upvotes_idx ON debate_arguments(upvotes);
  `;
  console.log("✅ debate_arguments table created.");

  // 3. Seed Featured Editorial Debates
  const debatesData = [
    {
      slug: "evm-national-election-feasibility",
      question: "আসন্ন জাতীয় নির্বাচনে ইলেকট্রনিক ভোটিং মেশিনের (ইভিএম) ব্যবহার কি অবাধ, সুষ্ঠু ও গ্রহণযোগ্য নির্বাচনের জন্য ইতিবাচক ভূমিকা রাখবে?",
      description: "ইভিএম প্রযুক্তির আধুনিকায়ন ও দ্রুত ফলাফল বনাম রাজনৈতিক দলগুলোর আস্থা ও কারিগরি স্বচ্ছতা নিয়ে জাতীয় বিতর্ক।",
      topicContext: "বাংলাদেশ নির্বাচন কমিশন (ইসি) দীর্ঘদিন ধরে নির্বাচনে প্রযুক্তিবান্ধব ভোটগ্রহণের লক্ষ্যে ইভিএম ব্যবহারের পক্ষে অবস্থান নিয়ে আসছে। নির্বাচন কমিশনের দাবি, ইভিএমের মাধ্যমে জাল ভোট দেওয়া, ব্যালট বাক্স ছিনতাই কিংবা দেরিতে ফল ঘোষণার মতো ত্রুটি দূর করা সম্ভব। তবে অধিকাংশ বিরোধী রাজনৈতিক দল, প্রযুক্তি বিশেষজ্ঞ এবং সুশীল সমাজের একটি বড় অংশ যুক্তি দিচ্ছেন যে, ভিভিপ্যাট (Voter Verifiable Paper Audit Trail) বা প্রিন্টেড অডিট স্লিপ না থাকায় ভোটার নিজের প্রদত্ত ভোটের সঠিকতা যাচাই করতে পারেন না। এতে পুরো নির্বাচনী প্রক্রিয়ায় জনআস্থার ঘাটতি তৈরি হয়।",
      editorialSummary: "পাঠক ও বিশেষজ্ঞদের মতামতের বিশ্লেষণে প্রতীয়মান হয় যে, আধুনিক প্রযুক্তির কার্যকারিতা অনস্বীকার্য হলেও একটি অংশগ্রহণমূলক জাতীয় নির্বাচনের প্রধান ভিত্তি হলো সকল পক্ষের রাজনৈতিক ঐক্যমত ও অখণ্ড বিশ্বাস। ভিভিপ্যাট সংযোজন ব্যতীত ইভিএম বাস্তবায়ন জনসন্দেহ বাড়িয়ে তুলতে পারে বলে অধিকাংশ মত এসেছে।",
      category: "রাজনীতি",
      options: ["হ্যাঁ (যৌক্তিক)", "না (যৌক্তিক নয়)", "মতামত নেই"],
      votes: [1420, 2890, 185],
      totalVotes: 4495,
      isWeeklyDebate: true,
      isFeatured: true,
      isActive: true,
      arguments: [
        {
          side: "for",
          authorName: "ড. মাহতাব উদ্দিন",
          authorLocation: "ঢাকা বিশ্ববিদ্যালয়",
          argument: "আধুনিক ডিজিটাল যুগে নির্বাচন প্রক্রিয়ায় প্রযুক্তির ব্যবহার ব্যালট ছিনতাই ও বুথ দখলের সংস্কৃতি বন্ধে কার্যকর অস্ত্র। প্রচলিত ব্যালটের তুলনায় ইভিএমে ভোট গণনা নির্ভুল ও তাৎক্ষণিক ফলাফল সম্ভব। আমাদের উচিত প্রযুক্তি বর্জন না করে বরং কারিগরি নিরাপত্তা ও বায়োমেট্রিক নজরদারি জোরদার করা।",
          upvotes: 142,
          isPinned: true,
          isEditorChoice: true,
        },
        {
          side: "for",
          authorName: "তানভীর হাসান শুভ",
          authorLocation: "মিরপুর, ঢাকা",
          argument: "ইভিএমে একজন ভোটারের আঙ্গুলের ছাপ না মিললে কোনোভাবেই অন্য কেউ ভোট দিতে পারে না। এর ফলে দীর্ঘদিনের মৃত ব্যক্তি বা প্রবাসীদের নামে জাল ভোট দেওয়ার অপতৎপরতা শতভাগ বন্ধ হয়ে যায়। নির্বাচনকে আধুনিক করতে হলে আমাদের সামনে এগোতে হবে।",
          upvotes: 89,
          isPinned: false,
          isEditorChoice: false,
        },
        {
          side: "against",
          authorName: "ব্যারিস্টার ফারহানা আহমেদ",
          authorLocation: "সুপ্রিম কোর্ট, ঢাকা",
          argument: "গণতান্ত্রিক নির্বাচনে সবচেয়ে বড় সম্পদ হলো ভোটারের আস্থা। বিশ্বের অধিকাংশ উন্নত দেশ (যেমন জার্মানি ও নেদারল্যান্ডস) ইভিএম বাতিল করেছে কারণ এতে স্বাধীনভাবে পুনর্গণনা করার মতো পেপার ট্রেইল (VVPAT) থাকে না। যেখানে রাজনৈতিক আস্থা নেই, সেখানে অস্বচ্ছ মেশিনের উপর আস্থা রাখা আত্মঘাতী।",
          upvotes: 265,
          isPinned: true,
          isEditorChoice: true,
        },
        {
          side: "against",
          authorName: "কাজী শফিকুল ইসলাম",
          authorLocation: "চট্টগ্রাম ব্যুরো",
          argument: "মাঠ পর্যায়ের বাস্তবতায় অনেক ভোটারের (বিশেষ করে বয়স্ক ও শ্রমজীবী) ফিঙ্গারপ্রিন্ট মেলেনি। তখন প্রিজাইডিং অফিসারের বিশেষ ক্ষমতার ১% বা তার বেশি ভোট দেওয়ার সুযোগ থাকে, যা অপব্যবহারের ঝুঁকি বাড়ায়। তাই সার্বিক রাজনৈতিক ঐকমত্য ছাড়া এটি চাপিয়ে দেওয়া অনুচিত।",
          upvotes: 178,
          isPinned: false,
          isEditorChoice: false,
        },
      ],
    },
    {
      slug: "commodity-price-control-subsidies-vs-market-reforms",
      question: "নিত্যপ্রয়োজনীয় দ্রব্যমূল্য নিয়ন্ত্রণে ওএমএস ও টিসিবির মাধ্যমে ফ্যামিলি কার্ডে ভর্তুকি বিক্রি কি দীর্ঘমেয়াদে মূল্যস্ফীতি রোধে কার্যকর সমাধান?",
      description: "স্বল্পমেয়াদী সামাজিক সুরক্ষা বনাম সিন্ডিকেট দমন ও বাজার সরবরাহ শৃঙ্খল সংস্কার নিয়ে অর্থনৈতিক বিতর্ক।",
      topicContext: "আন্তর্জাতিক বাজারের অস্থিরতা এবং ডলারের বিনিময় হারের ঊর্ধ্বগতির কারণে চাল, ডাল, তেল ও পেঁয়াজসহ নিত্যপণ্যের দাম সাধারণ মানুষের নাগালের বাইরে চলে গেছে। সরকারের তরফে ওএমএস ট্রাক সেল ও টিসিবি ফ্যামিলি কার্ডে কমমূল্যে পণ্য সরবরাহ বাড়িয়ে দরিদ্র জনগোষ্ঠীর পাশে দাঁড়ানো হচ্ছে। কিন্তু অর্থনীতিবিদদের একাংশ মনে করেন, এটি কেবল উপসর্গভিত্তিক চিকিৎসা; স্থায়ী সমাধানের জন্য পাইকারি ও খুচরা বাজারের চাঁদাবাজি, মধ্যস্বত্বভোগী সিন্ডিকেট এবং কৃত্রিম সংকট সৃষ্টিকারীদের আইনের আওতায় আনতে হবে।",
      editorialSummary: "অর্থনৈতিক বিশ্লেষণে উঠে এসেছে যে, নিম্নবিত্তের জন্য ভর্তুকি মূল্যের খাদ্য সরবরাহ আপদকালীন সুরক্ষা হিসেবে অপরিহার্য। তবে সামগ্রিক মূল্যস্ফীতি রোধে জেলাভিত্তিক সংরক্ষণাগার, সরাসরি কৃষক-ভোক্তা সরবরাহ চেইন এবং কঠোর প্রতিযোগিতা কমিশন কার্যকর করার বিকল্প নেই।",
      category: "অর্থনীতি",
      options: ["হ্যাঁ (কার্যকর সমাধান)", "না (দীর্ঘমেয়াদে কার্যকর নয়)", "আংশিক কার্যকর"],
      votes: [870, 3120, 940],
      totalVotes: 4930,
      isWeeklyDebate: true,
      isFeatured: false,
      isActive: true,
      arguments: [
        {
          side: "for",
          authorName: "মোস্তফা কামাল",
          authorLocation: "যাত্রাবাড়ী, ঢাকা",
          argument: "হতদরিদ্র ও নিম্ন মধ্যবিত্ত পরিবারের জন্য টিসিবির ফ্যামিলি কার্ড আজ বেঁচে থাকার একমাত্র অবলম্বন। খোলাবাজারে যেখানে তেলের লিটার ১৯০ টাকা, সেখানে ১০০ টাকায় তেল পাওয়া এক কোটি পরিবারের জন্য সরাসরি লাইফলাইন। এটি বন্ধ হলে দেশে পুষ্টিহীনতা মারাত্মক রূপ নেবে।",
          upvotes: 115,
          isPinned: false,
          isEditorChoice: false,
        },
        {
          side: "against",
          authorName: "ড. সাজ্জাদ হোসাইন",
          authorLocation: "অর্থনীতি বিভাগ, রাবি",
          argument: "টিসিবি বা ওএমএস দিয়ে সর্বোচ্চ ৫-১০% চাহিদার জোগান দেওয়া যায়। বাকি ৯০% মানুষকে মূল বাজারের উচ্চমূল্যেই কিনতে হয়। সরকারি ভর্তুকির অর্থ জনগণের করের টাকা থেকেই যাচ্ছে। বাজার মনিটরিং, পাইকারি সিন্ডিকেট ভাঙা এবং আমদানি শুল্কের যৌক্তিকীকরণ ছাড়া বাজার নিয়ন্ত্রণ সম্ভব নয়।",
          upvotes: 230,
          isPinned: true,
          isEditorChoice: true,
        },
      ],
    },
    {
      slug: "mega-projects-foreign-debt-economic-risk",
      question: "মেগাপ্রকল্প বাস্তবায়নে নেওয়া বৈদেশিক ঋণ পরিশোধের চাপ কি বাংলাদেশের আগামী অর্থনীতির জন্য বড় ধরনের ঝুঁকি তৈরি করছে?",
      description: "অবকাঠামোগত উন্নয়ন ও ভবিষ্যৎ জিডিপি প্রবৃদ্ধি বনাম ডেট সার্ভিসিং ও বৈদেশিক মুদ্রার রিজার্ভের সংকট।",
      topicContext: "গত দেড় দশকে বাংলাদেশ পদ্মা সেতু, মেট্রোরেল, কর্ণফুলী টানেল, রূপপুর পারমাণবিক বিদ্যুৎ কেন্দ্র ও পায়রা গভীর সমুদ্র বন্দরের মতো বিশাল মেগাপ্রকল্প বাস্তবায়ন করেছে। এসব প্রকল্প দেশের লজিস্টিক সক্ষমতা এবং প্রবৃদ্ধির পথ সুগম করেছে। তবে অধিকাংশ প্রকল্পের জন্য চীন, রাশিয়া, জাইকা ও এডিবি থেকে চড়া শর্ত ও গ্রেস পিরিয়ড শেষে বড় অংকের বৈদেশিক ঋণ শোধের সময়সীমা ২০২৪-২৬ সালে শুরু হচ্ছে। রিজার্ভের টানাপোড়েনে এই ঋণ পরিশোধ কতটা সহনীয় থাকবে তা নিয়ে উত্তপ্ত বিতর্ক চলছে।",
      editorialSummary: "অবকাঠামোর অর্থনৈতিক সুফল ও রাজস্ব আয় যদি ঋণ পরিশোধের হারের চেয়ে ধীরগতির হয়, তবে অর্থনীতিতে তার চাপ তীব্র হতে পারে। মেগাপ্রকল্পের দ্রুত বাণিজ্যিক সদ্ব্যবহার ও উৎপাদনশীল খাতের বিকাশই এই ঝুঁকি মোকাবিলার মূল চাবিকাঠি।",
      category: "অর্থনীতি",
      options: ["হ্যাঁ (চরম ঝুঁকি তৈরি করছে)", "না (অর্থনীতি সামলে নিতে পারবে)", "সঠিক আর্থিক ব্যবস্থাপনার ওপর নির্ভরশীল"],
      votes: [2410, 1150, 1890],
      totalVotes: 5450,
      isWeeklyDebate: true,
      isFeatured: false,
      isActive: true,
      arguments: [
        {
          side: "for",
          authorName: "আহমেদ জিয়াউল করিম",
          authorLocation: "মতিঝিল, ঢাকা",
          argument: "অনেক প্রকল্পের সম্ভাব্যতা যাচাইয়ে বাস্তবতার চেয়ে অতিরঞ্জিত রিটার্ন দেখানো হয়েছে। যেমন কর্ণফুলী টানেলের দৈনিক টোল আদায় পরিচালন ব্যয়ের চেয়েও কম। রূপপুর ও রেল সংযোগের ঋণ পরিশোধ শুরু হলে আমাদের বৈদেশিক মুদ্রার রিজার্ভে বিশাল রক্তক্ষরণ হবে।",
          upvotes: 195,
          isPinned: true,
          isEditorChoice: true,
        },
        {
          side: "against",
          authorName: "ইঞ্জিনিয়ার শাহরিয়ার কবীর",
          authorLocation: "উত্তরা, ঢাকা",
          argument: "মেট্রোরেল ও ঢাকা-চট্টগ্রাম করিডোরের মতো অবকাঠামো না থাকলে শিল্পায়ন থমকে যেত। সময় ও পরিবহন খরচ সাশ্রয় হয়ে জাতীয় উৎপাদনে যে কোটি কোটি টাকা যুক্ত হচ্ছে, তা দীর্ঘমেয়াদে ঋণ পরিশোধের চেয়ে বহুগুণ বেশি মূল্য দেবে। ঋণ নিয়ে সম্পদ তৈরি হয়েছে, কোনো অপচয় হয়নি।",
          upvotes: 140,
          isPinned: false,
          isEditorChoice: false,
        },
      ],
    },
    {
      slug: "bcs-public-service-merit-quota-reform",
      question: "সরকারি চাকরিতে শতভাগ মেধাভিত্তিক নিয়োগ নিশ্চিত করতে কোটা ব্যবস্থার পুনর্বিন্যাস কি সময়োপযোগী?",
      description: "প্রশাসনে মেধা ও যোগ্যতার প্রাধান্য বনাম পিছিয়ে পড়া জনগোষ্ঠীর বিশেষ সাংবিধানিক সুযোগ।",
      topicContext: "সরকারি চাকরিতে নিয়োগ পরীক্ষা ও বিসিএসে মেধার সর্বোচ্চ মূল্যায়ন নিশ্চিত করার দাবিতে তরুণ শিক্ষার্থীদের আন্দোলন জাতীয় রাজনীতিতে গভীর আলোড়ন সৃষ্টি করেছে। সংবিধানের সমতা নীতির আলোকে মেধার প্রাধান্য নিশ্চিত করার দাবি যেমন জোরালো, তেমনি অনগ্রসর ও বিশেষ জনগোষ্ঠীর অন্তর্ভুক্তি নিশ্চিত করার প্রয়োজনীয়তা নিয়েও বিতর্ক চলছে।",
      editorialSummary: "একটি গতিশীল ও দুর্নীতিমুক্ত আধুনিক সিভিল সার্ভিস গড়ে তুলতে মেধার বিকল্প নেই। তবে সমতা ও সামাজিক সুবিচার নিশ্চিত করতে অতি সীমিত ও যৌক্তিক সমন্বয়ের মাধ্যমে ভারসাম্য বজায় রাখার পরামর্শ এসেছে অধিকাংশ বিশ্লেষক থেকে।",
      category: "জাতীয়",
      options: ["হ্যাঁ (শতভাগ মেধাভিত্তিক হওয়া উচিত)", "না (সীমিত বিশেষ কোটা থাকা জরুরি)", "মতামত নেই"],
      votes: [4120, 680, 110],
      totalVotes: 4910,
      isWeeklyDebate: true,
      isFeatured: false,
      isActive: false, // completed debate
      arguments: [
        {
          side: "for",
          authorName: "রাকিবুল হাসান",
          authorLocation: "জাহাঙ্গীরনগর বিশ্ববিদ্যালয়",
          argument: "মেধাবী তরুণরা বছরের পর বছর প্রস্তুতি নিয়েও যদি কোটার মারপ্যাঁচে বঞ্চিত হয়, তবে দেশে মেধা পাচার বেড়ে যাবে। একুশ শতকের দক্ষ প্রশাসন গড়তে শতভাগ মেধার ভিত্তিতেই সর্বোচ্চ প্রতিযোগিতামূলক নিয়োগ হওয়া উচিত।",
          upvotes: 310,
          isPinned: true,
          isEditorChoice: true,
        },
        {
          side: "against",
          authorName: "সানজিদা আক্তার",
          authorLocation: "সিলেট",
          argument: "ক্ষুদ্র নৃগোষ্ঠী এবং প্রান্তিক প্রতিবন্ধী নাগরিকদের এখনো পর্যাপ্ত সুযোগের অভাব রয়েছে। মেধার পাশাপাশি এই পিছিয়ে পড়া জনগোষ্ঠীকে মূলধারায় আনতে সংবিধানে উল্লেখিত ইতিবাচক বৈষম্যের (Affirmative action) নীতি বজায় রাখা মানবিক দায়িত্ব।",
          upvotes: 95,
          isPinned: false,
          isEditorChoice: false,
        },
      ],
    },
  ];

  for (const d of debatesData) {
    // Check if poll with question or slug exists
    const existing = await sql`
      SELECT id FROM polls WHERE slug = ${d.slug} OR question = ${d.question} LIMIT 1;
    `;

    let pollId;
    if (existing.length > 0) {
      pollId = existing[0].id;
      await sql`
        UPDATE polls
        SET
          slug = ${d.slug},
          topic_context = ${d.topicContext},
          editorial_summary = ${d.editorialSummary},
          is_weekly_debate = ${d.isWeeklyDebate},
          is_featured = ${d.isFeatured},
          votes = ${JSON.stringify(d.votes)},
          total_votes = ${d.totalVotes},
          is_active = ${d.isActive}
        WHERE id = ${pollId};
      `;
      console.log(`Updated debate poll: ${d.slug}`);
    } else {
      pollId = crypto.randomUUID();
      await sql`
        INSERT INTO polls (
          id, slug, question, description, topic_context, editorial_summary,
          is_weekly_debate, category, options, votes, total_votes, is_active, is_featured
        ) VALUES (
          ${pollId}, ${d.slug}, ${d.question}, ${d.description}, ${d.topicContext},
          ${d.editorialSummary}, ${d.isWeeklyDebate}, ${d.category},
          ${JSON.stringify(d.options)}, ${JSON.stringify(d.votes)},
          ${d.totalVotes}, ${d.isActive}, ${d.isFeatured}
        );
      `;
      console.log(`Created new debate poll: ${d.slug}`);
    }

    // Insert debate arguments
    for (const arg of d.arguments) {
      const argExists = await sql`
        SELECT id FROM debate_arguments
        WHERE poll_id = ${pollId} AND author_name = ${arg.authorName} LIMIT 1;
      `;
      if (argExists.length === 0) {
        await sql`
          INSERT INTO debate_arguments (
            id, poll_id, side, author_name, author_location, argument,
            upvotes, is_pinned, is_editor_choice, is_approved
          ) VALUES (
            ${crypto.randomUUID()}, ${pollId}, ${arg.side}, ${arg.authorName},
            ${arg.authorLocation}, ${arg.argument}, ${arg.upvotes},
            ${arg.isPinned}, ${arg.isEditorChoice}, true
          );
        `;
      }
    }
  }

  console.log("🎉 Migration and seeding of debates successfully finished!");
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
