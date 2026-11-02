/**
 * Live Sports Scoreboard & Match Tracker Data Model
 * "দৈনিক বাংলাদেশ বার্তা" - লাইভ ক্রিকেট ও ফুটবল স্কোরবোর্ড
 */

export type SportType = "cricket" | "football";
export type MatchStatus = "live" | "upcoming" | "recent";

export interface CricketBatsman {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOnStrike: boolean;
  outStatus?: string;
}

export interface CricketBowler {
  name: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  isBowling: boolean;
}

export interface BallCommentary {
  id: string;
  over: string;
  ballType: "normal" | "four" | "six" | "wicket" | "milestone";
  eventText: string;
  commentary: string;
  timestamp: string;
}

export interface FootballGoalEvent {
  minute: number;
  player: string;
  team: "team1" | "team2";
  type: "goal" | "penalty" | "own_goal";
}

export interface MatchStatItem {
  label: string;
  team1Value: string | number;
  team2Value: string | number;
}

export interface LiveMatch {
  id: string;
  sport: SportType;
  status: MatchStatus;
  tournament: string;
  matchLabel: string;
  venue: string;
  startTime: string;
  tossInfo?: string;
  statusNote: string;
  target?: number;

  team1: {
    name: string;
    shortName: string;
    flag: string;
    score?: string;
    overs?: string;
  };
  team2: {
    name: string;
    shortName: string;
    flag: string;
    score?: string;
    overs?: string;
  };

  // Cricket details
  currentPartnership?: string;
  crr?: number;
  rrr?: number;
  recentBalls?: string[];
  currentBatsmen?: CricketBatsman[];
  currentBowlers?: CricketBowler[];
  battingScorecard?: {
    team1: CricketBatsman[];
    team2: CricketBatsman[];
  };
  bowlingScorecard?: {
    team1: CricketBowler[];
    team2: CricketBowler[];
  };
  commentary?: BallCommentary[];

  // Football details
  matchMinute?: number;
  footballGoals?: FootballGoalEvent[];
  footballStats?: MatchStatItem[];
}

export const INITIAL_MATCHES: LiveMatch[] = [
  // -------------------------------------------------------------------------
  // 1. CRICKET LIVE: BANGLADESH VS INDIA (3RD ODI)
  // -------------------------------------------------------------------------
  {
    id: "ban-vs-ind-3rd-odi",
    sport: "cricket",
    status: "live",
    tournament: "আন্তর্জাতিক ওয়ানডে সিরিজ ২০২৬",
    matchLabel: "৩য় ও নির্ণায়ক ওয়ানডে",
    venue: "শেরেবাংলা জাতীয় ক্রিকেট স্টেডিয়াম, মিরপুর, ঢাকা",
    startTime: "দুপুর ২:০০টা",
    tossInfo: "ভারত টসে জিতে প্রথমে ব্যাটিংয়ের সিদ্ধান্ত নিয়েছে",
    statusNote: "বাংলাদেশের জয়ের জন্য প্রয়োজন ২২ বলে ১৯ রান (লক্ষ্য ২৮৭)",
    target: 287,
    team1: {
      name: "ভারত",
      shortName: "IND",
      flag: "🇮🇳",
      score: "২৮৬/৯",
      overs: "(৫০.০)",
    },
    team2: {
      name: "বাংলাদেশ",
      shortName: "BAN",
      flag: "🇧🇩",
      score: "২৬৮/৫",
      overs: "(৪৬.২)",
    },
    currentPartnership: "৪৮ বলে ৬২ রান",
    crr: 5.78,
    rrr: 5.18,
    recentBalls: ["4", "1", "6", "0", "1", "2"],
    currentBatsmen: [
      {
        name: "নাজমুল হোসেন শান্ত (অধি.)",
        runs: 88,
        balls: 82,
        fours: 8,
        sixes: 2,
        strikeRate: 107.31,
        isOnStrike: true,
        outStatus: "অপরাজিত",
      },
      {
        name: "তাওহীদ হৃদয়",
        runs: 42,
        balls: 36,
        fours: 3,
        sixes: 1,
        strikeRate: 116.66,
        isOnStrike: false,
        outStatus: "অপরাজিত",
      },
    ],
    currentBowlers: [
      {
        name: "জসপ্রীত বুমরাহ",
        overs: "৮.২",
        maidens: 1,
        runs: 48,
        wickets: 2,
        economy: 5.76,
        isBowling: true,
      },
      {
        name: "কুলদীপ যাদব",
        overs: "১০.০",
        maidens: 0,
        runs: 54,
        wickets: 1,
        economy: 5.4,
        isBowling: false,
      },
    ],
    battingScorecard: {
      team1: [
        { name: "রোহিত শর্মা", runs: 64, balls: 58, fours: 7, sixes: 2, strikeRate: 110.3, isOnStrike: false, outStatus: "বোল্ড ব: তাসকিন" },
        { name: "শুভমান গিল", runs: 45, balls: 52, fours: 4, sixes: 0, strikeRate: 86.5, isOnStrike: false, outStatus: "ক্যাচ আ: শান্ত ব: মুস্তাফিজ" },
        { name: "বিরাট কোহলি", runs: 78, balls: 84, fours: 6, sixes: 1, strikeRate: 92.8, isOnStrike: false, outStatus: "এলবিডব্লিউ ব: মিরাজ" },
        { name: "কেএল রাহুল", runs: 32, balls: 30, fours: 3, sixes: 0, strikeRate: 106.6, isOnStrike: false, outStatus: "রানআউট" },
        { name: "হার্দিক পান্ডিয়া", runs: 28, balls: 22, fours: 2, sixes: 2, strikeRate: 127.2, isOnStrike: false, outStatus: "ক্যাচ আ: হৃদয় ব: শরিফুল" },
      ],
      team2: [
        { name: "লিটন দাস", runs: 38, balls: 40, fours: 5, sixes: 0, strikeRate: 95.0, isOnStrike: false, outStatus: "ক্যাচ আ: রাহুল ব: শামি" },
        { name: "তানজিদ হাসান তামিম", runs: 24, balls: 28, fours: 3, sixes: 1, strikeRate: 85.7, isOnStrike: false, outStatus: "বোল্ড ব: বুমরাহ" },
        { name: "নাজমুল হোসেন শান্ত (অধি.)", runs: 88, balls: 82, fours: 8, sixes: 2, strikeRate: 107.31, isOnStrike: true, outStatus: "অপরাজিত" },
        { name: "সাকিব আল হাসান", runs: 44, balls: 50, fours: 4, sixes: 0, strikeRate: 88.0, isOnStrike: false, outStatus: "ক্যাচ আ: কোহলি ব: জাদেজা" },
        { name: "মুশফিকুর রহিম", runs: 18, balls: 22, fours: 1, sixes: 0, strikeRate: 81.8, isOnStrike: false, outStatus: "বোল্ড ব: বুমরাহ" },
        { name: "তাওহীদ হৃদয়", runs: 42, balls: 36, fours: 3, sixes: 1, strikeRate: 116.66, isOnStrike: false, outStatus: "অপরাজিত" },
      ],
    },
    bowlingScorecard: {
      team1: [
        { name: "তাসকিন আহমেদ", overs: "১০.০", maidens: 1, runs: 52, wickets: 3, economy: 5.2, isBowling: false },
        { name: "শরিফুল ইসলাম", overs: "১০.০", maidens: 0, runs: 58, wickets: 2, economy: 5.8, isBowling: false },
        { name: "মুস্তাফিজুর রহমান", overs: "১০.০", maidens: 1, runs: 46, wickets: 2, economy: 4.6, isBowling: false },
        { name: "মেহেদী হাসান মিরাজ", overs: "১০.০", maidens: 0, runs: 62, wickets: 1, economy: 6.2, isBowling: false },
        { name: "সাকিব আল হাসান", overs: "১০.০", maidens: 0, runs: 64, wickets: 0, economy: 6.4, isBowling: false },
      ],
      team2: [
        { name: "জসপ্রীত বুমরাহ", overs: "৮.২", maidens: 1, runs: 48, wickets: 2, economy: 5.76, isBowling: true },
        { name: "মোহাম্মদ শামি", overs: "৯.০", maidens: 0, runs: 56, wickets: 1, economy: 6.22, isBowling: false },
        { name: "রবীন্দ্র জাদেজা", overs: "১০.০", maidens: 1, runs: 52, wickets: 1, economy: 5.2, isBowling: false },
        { name: "কুলদীপ যাদব", overs: "১০.০", maidens: 0, runs: 54, wickets: 1, economy: 5.4, isBowling: false },
        { name: "হার্দিক পান্ডিয়া", overs: "৯.০", maidens: 0, runs: 55, wickets: 0, economy: 6.11, isBowling: false },
      ],
    },
    commentary: [
      {
        id: "c-1",
        over: "৪৬.২",
        ballType: "four",
        eventText: "৪ রান!",
        commentary: "বুমরাহের শর্ট অফ লেন্থ ডেলিভারি! ব্যাকফুটে গিয়ে এক্সট্রা কভারের ওপর দিয়ে দুর্দান্ত পাঞ্চ শান্তর, সীমানা পেরিয়ে ৪ রান!",
        timestamp: "১ মিনিট আগে",
      },
      {
        id: "c-2",
        over: "৪৬.১",
        ballType: "normal",
        eventText: "১ রান",
        commentary: "প্যাডে লেগে মিড-উইকেটে বল, দ্রুত দৌড়ে ১ রান পূর্ণ করলেন হৃদয় ও শান্ত। দারুণ বোঝাপড়া দুই ব্যাটারের।",
        timestamp: "২ মিনিট আগে",
      },
      {
        id: "c-3",
        over: "৪৫.৬",
        ballType: "six",
        eventText: "বিশাল ছক্কা!",
        commentary: "মায়াবী ছক্কা! শামির ফুলটস বলকে লং অনের ওপর দিয়ে আছড়ে ফেললেন হৃদয়! গ্যালারিতে লাল-সবুজের বাঁধভাঙা উল্লাস!",
        timestamp: "৩ মিনিট আগে",
      },
      {
        id: "c-4",
        over: "৪৫.৫",
        ballType: "normal",
        eventText: "ডট বল",
        commentary: "গুড লেন্থ বল, সতর্কভাবে ডিফেন্ড করলেন হৃদয়। কোনো রান নয়।",
        timestamp: "৪ মিনিট আগে",
      },
      {
        id: "c-5",
        over: "৪৫.৪",
        ballType: "normal",
        eventText: "১ রান",
        commentary: "পয়েন্টের দিকে আলতো ঠেলে দিয়ে প্রান্ত বদল করলেন শান্ত। শান্ত এখন ৮৩ রানে অপরাজিত।",
        timestamp: "৫ মিনিট আগে",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 2. FOOTBALL LIVE: ARGENTINA VS BRAZIL (WORLD CUP QUALIFIER)
  // -------------------------------------------------------------------------
  {
    id: "arg-vs-bra-wcq",
    sport: "football",
    status: "live",
    tournament: "ফিফা বিশ্বকাপ বাছাইপর্ব ২০২৬",
    matchLabel: "সুপার ক্ল্যাসিকো লড়াই",
    venue: "এস্তাদিও মনুমেন্তাল, বুয়েনস আইরেস",
    startTime: "ভোর ৬:০০টা",
    statusNote: "দ্বিতীয়ার্ধের তীব্র প্রতিদ্বন্দ্বিতা চলছে (৭৮' মিনিট)",
    matchMinute: 78,
    team1: {
      name: "আর্জেন্টিনা",
      shortName: "ARG",
      flag: "🇦🇷",
      score: "২",
    },
    team2: {
      name: "ব্রাজিল",
      shortName: "BRA",
      flag: "🇧🇷",
      score: "১",
    },
    footballGoals: [
      { minute: 28, player: "লিওনেল মেসি", team: "team1", type: "goal" },
      { minute: 43, player: "ভিনিসিয়ুস জুনিয়র", team: "team2", type: "goal" },
      { minute: 68, player: "হুলিয়ান আলভারেজ", team: "team1", type: "goal" },
    ],
    footballStats: [
      { label: "বল দখল (Possession)", team1Value: "৫৪%", team2Value: "৪৬%" },
      { label: "অন টার্গেট শট", team1Value: 6, team2Value: 4 },
      { label: "মোট শট", team1Value: 12, team2Value: 9 },
      { label: "কর্নার কিক", team1Value: 5, team2Value: 3 },
      { label: "ফাউল", team1Value: 11, team2Value: 14 },
      { label: "হলুদ কার্ড", team1Value: 2, team2Value: 3 },
      { label: "অফসাইড", team1Value: 1, team2Value: 2 },
    ],
    commentary: [
      {
        id: "fc-1",
        over: "৭৮'",
        ballType: "normal",
        eventText: "চমৎকার সেভ!",
        commentary: "রদ্রিগোর দূরপাল্লার জোরালো শট ঝাঁপিয়ে পড়ে কর্নারের বিনিময়ে রক্ষা করলেন এমিলিয়ানো মার্টিনেজ!",
        timestamp: "১ মিনিট আগে",
      },
      {
        id: "fc-2",
        over: "৭২'",
        ballType: "normal",
        eventText: "ফাউল ও হলুদ কার্ড",
        commentary: "আলভারেজকে অবৈধভাবে টেনে ধরায় হলুদ কার্ড দেখলেন ব্রাজিলের মিডফিল্ডার ক্যাসেমিরো।",
        timestamp: "৭ মিনিট আগে",
      },
      {
        id: "fc-3",
        over: "৬৮'",
        ballType: "milestone",
        eventText: "গোলললল! আর্জেন্টিনা ২ - ১ ব্রাজিল",
        commentary: "মেসির জাদুকরী থ্রু পাস বক্সের ভেতরে নিয়ন্ত্রণে নিয়ে অ্যালিসনকে পরাস্ত করে জালে পাঠালেন হুলিয়ান আলভারেজ!",
        timestamp: "১১ মিনিট আগে",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 3. CRICKET LIVE: BPL T20 (DHAKA VS SYLHET)
  // -------------------------------------------------------------------------
  {
    id: "bpl-dhaka-vs-sylhet",
    sport: "cricket",
    status: "live",
    tournament: "বাংলাদেশ প্রিমিয়ার লিগ (BPL ২০২৬)",
    matchLabel: "১৮তম ম্যাচ • সান্ধ্যকালীন পর্ব",
    venue: "জহুর আহমেদ চৌধুরী স্টেডিয়াম, চট্টগ্রাম",
    startTime: "সন্ধ্যা ৬:৩০টা",
    tossInfo: "সিলেট স্ট্রাইকার্স টসে জিতে ব্যাটিংয়ের সিদ্ধান্ত নেয়",
    statusNote: "ঢাকার জয়ের জন্য ২৬ বলে ৩৮ রান প্রয়োজন",
    target: 183,
    team1: {
      name: "সিলেট স্ট্রাইকার্স",
      shortName: "SYL",
      flag: "🏏",
      score: "১৮২/৬",
      overs: "(২০.০)",
    },
    team2: {
      name: "ঢাকা ডমিনেটর্স",
      shortName: "DHK",
      flag: "🏏",
      score: "১৪৫/৩",
      overs: "(১৫.৪)",
    },
    crr: 9.25,
    rrr: 8.76,
    recentBalls: ["1", "6", "4", "1", "0", "2"],
    currentBatsmen: [
      {
        name: "সাকিব আল হাসান",
        runs: 56,
        balls: 34,
        fours: 4,
        sixes: 3,
        strikeRate: 164.7,
        isOnStrike: true,
        outStatus: "অপরাজিত",
      },
      {
        name: "মোসাদ্দেক হোসেন",
        runs: 18,
        balls: 12,
        fours: 1,
        sixes: 1,
        strikeRate: 150.0,
        isOnStrike: false,
        outStatus: "অপরাজিত",
      },
    ],
    currentBowlers: [
      {
        name: "তানজিম হাসান সাকিব",
        overs: "৩.৪",
        maidens: 0,
        runs: 38,
        wickets: 1,
        economy: 10.36,
        isBowling: true,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 4. CRICKET RECENT: BANGLADESH VS SRI LANKA (2ND ODI)
  // -------------------------------------------------------------------------
  {
    id: "ban-vs-sl-2nd-odi",
    sport: "cricket",
    status: "recent",
    tournament: "দ্বিপাক্ষিক ওয়ানডে সিরিজ",
    matchLabel: "২য় ওয়ানডে",
    venue: "শেরেবাংলা জাতীয় স্টেডিয়াম, মিরপুর",
    startTime: "দুপুর ২:০০টা",
    statusNote: "বাংলাদেশ ৬ উইকেটে জয়ী (২৯ বল বাকি থাকতে)",
    team1: {
      name: "শ্রীলঙ্কা",
      shortName: "SL",
      flag: "🇱🇰",
      score: "২৪৫",
      overs: "(৪৮.৪)",
    },
    team2: {
      name: "বাংলাদেশ",
      shortName: "BAN",
      flag: "🇧🇩",
      score: "২৪৮/৪",
      overs: "(৪৫.১)",
    },
  },

  // -------------------------------------------------------------------------
  // 5. FOOTBALL UPCOMING: BANGLADESH VS MALDIVES (SAFF CUP)
  // -------------------------------------------------------------------------
  {
    id: "ban-vs-mdv-saff",
    sport: "football",
    status: "upcoming",
    tournament: "সাফ চ্যাম্পিয়নশিপ ২০২৬",
    matchLabel: "গ্রুপ পর্ব • রাউন্ড ২",
    venue: "বসুন্ধরা কিংস এরিনা, ঢাকা",
    startTime: "আজ রাত ৮:০০টা",
    statusNote: "ম্যাচ শুরু হতে বাকি ১ ঘণ্টা ২০ মিনিট",
    team1: {
      name: "বাংলাদেশ",
      shortName: "BAN",
      flag: "🇧🇩",
    },
    team2: {
      name: "মালদ্বীপ",
      shortName: "MDV",
      flag: "🇲🇻",
    },
  },
];

/**
 * Get all live, upcoming, and recent matches (synchronous fallback)
 */
export function getAllMatches(sport?: SportType, status?: MatchStatus): LiveMatch[] {
  let list = [...INITIAL_MATCHES];
  if (sport) {
    list = list.filter((m) => m.sport === sport);
  }
  if (status) {
    list = list.filter((m) => m.status === status);
  }
  return list;
}

/**
 * Get single match detail by ID (synchronous fallback)
 */
export function getMatchById(id: string): LiveMatch | null {
  return INITIAL_MATCHES.find((m) => m.id === id) || null;
}

/**
 * Fetch real-time live matches from Open Sports API with in-memory caching
 */
export async function getLiveSportsMatches(sport?: SportType, status?: MatchStatus): Promise<LiveMatch[]> {
  try {
    const { fetchLiveSportsFromApi } = await import("./real-sports-api");
    const liveApiMatches = await fetchLiveSportsFromApi();
    let list = liveApiMatches.length > 0 ? liveApiMatches : [...INITIAL_MATCHES];

    if (sport) {
      list = list.filter((m) => m.sport === sport);
    }
    if (status) {
      list = list.filter((m) => m.status === status);
    }
    return list;
  } catch (err) {
    console.warn("getLiveSportsMatches error, using fallback:", err);
    return getAllMatches(sport, status);
  }
}

/**
 * Fetch single real-time live match by ID
 */
export async function getLiveSportsMatchById(id: string): Promise<LiveMatch | null> {
  try {
    const { fetchLiveSportsFromApi } = await import("./real-sports-api");
    const liveApiMatches = await fetchLiveSportsFromApi();
    const found = liveApiMatches.find((m) => m.id === id);
    if (found) return found;
  } catch (err) {
    // fallback
  }
  return getMatchById(id);
}
