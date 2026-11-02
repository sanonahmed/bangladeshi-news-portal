import { toBengaliDigits } from "@/lib/bengali-date";
import type { LiveMatch, SportType, MatchStatus, BallCommentary } from "./sports-data";

/**
 * Team and Country Localization Dictionary
 */
const TEAM_MAP: Record<string, { bn: string; short: string; flag: string }> = {
  // Bangladesh & National Teams
  bangladesh: { bn: "বাংলাদেশ", short: "BAN", flag: "🇧🇩" },
  "bangladesh a": { bn: "বাংলাদেশ 'এ'", short: "BAN-A", flag: "🇧🇩" },
  india: { bn: "ভারত", short: "IND", flag: "🇮🇳" },
  "india a": { bn: "ভারত 'এ'", short: "IND-A", flag: "🇮🇳" },
  australia: { bn: "অস্ট্রেলিয়া", short: "AUS", flag: "🇦🇺" },
  england: { bn: "ইংল্যান্ড", short: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "england lions": { bn: "ইংল্যান্ড লায়ন্স", short: "ENG-L", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  pakistan: { bn: "পাকিস্তান", short: "PAK", flag: "🇵🇰" },
  "new zealand": { bn: "নিউজিল্যান্ড", short: "NZ", flag: "🇳🇿" },
  "new zealand a": { bn: "নিউজিল্যান্ড 'এ'", short: "NZ-A", flag: "🇳🇿" },
  "south africa": { bn: "দক্ষিণ আফ্রিকা", short: "SA", flag: "🇿🇦" },
  "sri lanka": { bn: "শ্রীলঙ্কা", short: "SL", flag: "🇱🇰" },
  "west indies": { bn: "ওয়েস্ট ইন্ডিজ", short: "WI", flag: "🌴" },
  "west indies a": { bn: "ওয়েস্ট ইন্ডিজ 'এ'", short: "WI-A", flag: "🌴" },
  afghanistan: { bn: "আফগানিস্তান", short: "AFG", flag: "🇦🇫" },
  ireland: { bn: "আয়ারল্যান্ড", short: "IRE", flag: "🇮🇪" },
  netherlands: { bn: "নেদারল্যান্ডস", short: "NED", flag: "🇳🇱" },
  zimbabwe: { bn: "জিম্বাবুয়ে", short: "ZIM", flag: "🇿🇼" },
  nepal: { bn: "নেপাল", short: "NEP", flag: "🇳🇵" },
  oman: { bn: "ওমান", short: "OMA", flag: "🇴🇲" },
  scotland: { bn: "স্কটল্যান্ড", short: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  canada: { bn: "কানাডা", short: "CAN", flag: "🇨🇦" },
  usa: { bn: "যুক্তরাষ্ট্র", short: "USA", flag: "🇺🇸" },
  uae: { bn: "সংযুক্ত আরব আমিরাত", short: "UAE", flag: "🇦🇪" },
  maldives: { bn: "মালদ্বীপ", short: "MDV", flag: "🇲🇻" },

  // Bangladesh Domestic (National Cricket League - NCL)
  "sylhet division": { bn: "সিলেট বিভাগ", short: "SYL", flag: "🇧🇩" },
  "chattogram division": { bn: "চট্টগ্রাম বিভাগ", short: "CTG", flag: "🇧🇩" },
  "dhaka division": { bn: "ঢাকা বিভাগ", short: "DHK", flag: "🇧🇩" },
  "barishal division": { bn: "বরিশাল বিভাগ", short: "BAR", flag: "🇧🇩" },
  "khulna division": { bn: "খুলনা বিভাগ", short: "KHL", flag: "🇧🇩" },
  "rajshahi division": { bn: "রাজশাহী বিভাগ", short: "RAJ", flag: "🇧🇩" },
  "rangpur division": { bn: "রংপুর বিভাগ", short: "RAN", flag: "🇧🇩" },
  "mymensingh division": { bn: "ময়মনসিংহ বিভাগ", short: "MYM", flag: "🇧🇩" },
  "dhaka metropolis": { bn: "ঢাকা মেট্রোপলিস", short: "MET", flag: "🇧🇩" },

  // BPL Franchises
  "comilla victorians": { bn: "কুমিল্লা ভিক্টোরিয়ান্স", short: "CV", flag: "🏏" },
  "fortune barishal": { bn: "ফরচুন বরিশাল", short: "FB", flag: "🏏" },
  "rangpur riders": { bn: "রংপুর রাইডার্স", short: "RR", flag: "🏏" },
  "sylhet strikers": { bn: "সিলেট স্ট্রাইকার্স", short: "SS", flag: "🏏" },
  "chattogram challengers": { bn: "চট্টগ্রাম চ্যালেঞ্জার্স", short: "CC", flag: "🏏" },
  "dhaka dominators": { bn: "ঢাকা ডমিনেটর্স", short: "DD", flag: "🏏" },
  "khulna tigers": { bn: "খুলনা টাইগার্স", short: "KT", flag: "🏏" },

  // Australian Domestic (Sheffield Shield)
  queensland: { bn: "কুইন্সল্যান্ড", short: "QLD", flag: "🇦🇺" },
  victoria: { bn: "ভিক্টোরিয়া", short: "VIC", flag: "🇦🇺" },
  "new south wales": { bn: "নিউ সাউথ ওয়েলস", short: "NSW", flag: "🇦🇺" },
  "western australia": { bn: "ওয়েস্টার্ন অস্ট্রেলিয়া", short: "WA", flag: "🇦🇺" },
  "south australia": { bn: "সাউথ অস্ট্রেলিয়া", short: "SA", flag: "🇦🇺" },
  tasmania: { bn: "তাসমানিয়া", short: "TAS", flag: "🇦🇺" },

  // Football Clubs
  liverpool: { bn: "লিভারপুল", short: "LIV", flag: "🔴" },
  arsenal: { bn: "আর্সেনাল", short: "ARS", flag: "⚪" },
  "manchester city": { bn: "ম্যানচেস্টার সিটি", short: "MCI", flag: "🔵" },
  "manchester united": { bn: "ম্যান ইউনাইটেড", short: "MUN", flag: "🔴" },
  chelsea: { bn: "চেলসি", short: "CHE", flag: "🔵" },
  "tottenham hotspur": { bn: "টটেনহ্যাম", short: "TOT", flag: "⚪" },
  "real madrid": { bn: "রিয়াল মাদ্রিদ", short: "RMA", flag: "⚪" },
  barcelona: { bn: "বার্সেলোনা", short: "BAR", flag: "🔵🔴" },
  "atletico madrid": { bn: "অ্যাটলেটিকো মাদ্রিদ", short: "ATM", flag: "🔴⚪" },
  "bayern munich": { bn: "বায়ার্ন মিউনিখ", short: "BAY", flag: "🔴" },
  "borussia dortmund": { bn: "বরুসিয়া ডর্টমুন্ড", short: "DOR", flag: "🟡" },
  "paris saint-germain": { bn: "পিএসজি", short: "PSG", flag: "🔵🔴" },
  "inter milan": { bn: "ইন্টার মিলান", short: "INT", flag: "🔵⚫" },
  "ac milan": { bn: "এসি মিলান", short: "ACM", flag: "🔴⚫" },
  juventus: { bn: "য়্যুভেন্তাস", short: "JUV", flag: "⚪⚫" },
  galatasaray: { bn: "গালাতাসারাই", short: "GAL", flag: "🟡🔴" },
  "vfb stuttgart": { bn: "স্টুটগার্ট", short: "STU", flag: "⚪🔴" },
  sevilla: { bn: "সেভিয়া", short: "SEV", flag: "⚪" },
  getafe: { bn: "হেতাফে", short: "GET", flag: "🔵" },
  "mohun bagan": { bn: "মোহনবাগান", short: "MB", flag: "🟢🔴" },
  "bashundhara kings": { bn: "বসুন্ধরা কিংস", short: "BK", flag: "🇧🇩" },
};

const TOURNAMENT_MAP: Record<string, string> = {
  "national cricket league": "জাতীয় ক্রিকেট লিগ (NCL ২০২৬)",
  "sheffield shield": "শেফিল্ড শিল্ড ২০২৬",
  "ranji trophy": "রঞ্জি ট্রফি ২০২৬",
  "women's big bash league": "নারী বিগ ব্যাশ লিগ (WBBL)",
  "icc men's cricket world cup league 2": "আইসিসি ক্রিকেট বিশ্বকাপ লিগ ২",
  "india a tour of new zealand 2026/27": "ভারত 'এ' বনাম নিউজিল্যান্ড 'এ' সিরিজ",
  "england lions tour of west indies 2026/27": "ইংল্যান্ড লায়ন্স বনাম ওয়েস্ট ইন্ডিজ 'এ'",
  "nepal premier league": "নেপাল প্রিমিয়ার লিগ (NPL)",
  "english premier league": "ইংলিশ প্রিমিয়ার লিগ",
  "spanish laliga": "স্প্যানিশ লা লিগা",
  "uefa champions league": "উয়েফা চ্যাম্পিয়নস লিগ",
  "bpl 2026": "বাংলাদেশ প্রিমিয়ার লিগ (BPL)",
};

function translateTeam(rawName: string): { name: string; shortName: string; flag: string } {
  if (!rawName) return { name: "দল", shortName: "দল", flag: "🏏" };
  const lower = rawName.toLowerCase().trim();

  if (TEAM_MAP[lower]) {
    const item = TEAM_MAP[lower]!;
    return { name: item.bn, shortName: item.short, flag: item.flag };
  }

  for (const [key, val] of Object.entries(TEAM_MAP)) {
    if (lower.includes(key)) {
      return { name: val.bn, shortName: val.short, flag: val.flag };
    }
  }

  // Fallback: clean up English text
  const clean = rawName
    .replace(/\s*\(India\)/i, "")
    .replace(/\s*\(NPL\)/i, "")
    .trim();
  const short = clean.slice(0, 3).toUpperCase();
  return { name: clean, shortName: short, flag: "🏏" };
}

function translateTournament(name: string): string {
  if (!name) return "আন্তর্জাতিক টুর্নামেন্ট";
  const lower = name.toLowerCase().trim();
  for (const [k, v] of Object.entries(TOURNAMENT_MAP)) {
    if (lower.includes(k)) return v;
  }
  return name;
}

function translateStatusNote(note: string): string {
  if (!note) return "";
  let text = note;
  text = text.replace(/Stumps/gi, "দিনের খেলা সমাপ্ত (স্টাম্পস)");
  text = text.replace(/Tea/gi, "চা-বিরতি");
  text = text.replace(/Lunch/gi, "মধ্যাহ্নবিরতি");
  text = text.replace(/Innings Break/gi, "ইনিংস বিরতি");
  text = text.replace(/Match delayed - Rain/gi, "বৃষ্টির কারণে খেলা স্থগিত");
  text = text.replace(/Result/gi, "ম্যাচ সমাপ্ত");
  text = text.replace(/FT/gi, "ম্যাচ সমাপ্ত (Full Time)");
  text = text.replace(/Live/gi, "চলমান");
  text = text.replace(/Scheduled/gi, "আসন্ন ম্যাচ");
  text = text.replace(/lead by/gi, "এগিয়ে");
  text = text.replace(/trail by/gi, "পিছিয়ে");
  text = text.replace(/runs/gi, "রানে");
  text = text.replace(/wickets/gi, "উইকেটে");
  text = text.replace(/won by/gi, "ব্যবধানে জয়ী");
  text = text.replace(/ov/gi, "ওভার");
  text = text.replace(/target/gi, "লক্ষ্য");
  return toBengaliDigits(text);
}

function formatScoreToBengali(score?: string): string {
  if (!score) return "";
  let s = score;
  s = s.replace(/ov/gi, "ওভার");
  s = s.replace(/target/gi, "লক্ষ্য");
  return toBengaliDigits(s);
}

// In-memory cache to respect API rate limits
let cachedMatches: LiveMatch[] = [];
let lastFetchTime = 0;
const CACHE_TTL_MS = 25 * 1000; // 25 seconds

/**
 * Fetch and parse real live sports matches from ESPN's open APIs
 */
export async function fetchLiveSportsFromApi(): Promise<LiveMatch[]> {
  const now = Date.now();
  if (cachedMatches.length > 0 && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedMatches;
  }

  const results: LiveMatch[] = [];

  // 1. Fetch Real Cricket Matches (scorepanel)
  try {
    const res = await fetch(
      "https://site.web.api.espn.com/apis/site/v2/sports/cricket/scorepanel",
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) BangladeshiNewsPortal/1.0",
        },
        next: { revalidate: 30 },
      }
    );

    if (res.ok) {
      const data = await res.json();
      for (const s of data.scores || []) {
        const rawLeague = s.leagues?.[0]?.name || "আন্তর্জাতিক ক্রিকেট";
        const tournament = translateTournament(rawLeague);

        for (const ev of s.events || []) {
          const comp = ev.competitions?.[0];
          const competitors = comp?.competitors || [];
          if (competitors.length >= 2) {
            const c1 = competitors[0]!;
            const c2 = competitors[1]!;
            const state = comp?.status?.type?.state;
            const status: MatchStatus =
              state === "in" ? "live" : state === "pre" ? "upcoming" : "recent";

            const t1 = translateTeam(c1.team?.name || "");
            const t2 = translateTeam(c2.team?.name || "");

            const rawNote = comp?.status?.summary || comp?.status?.type?.description || "";
            const statusNote = translateStatusNote(rawNote);

            const matchItem: LiveMatch = {
              id: `cricket-${ev.id}`,
              sport: "cricket",
              status,
              tournament,
              matchLabel: ev.name || `${t1.name} বনাম ${t2.name}`,
              venue: comp?.venue?.fullName || "আন্তর্জাতিক স্টেডিয়াম",
              startTime: ev.date ? new Date(ev.date).toLocaleTimeString("bn-BD", { hour: "numeric", minute: "numeric" }) : "চলমান",
              statusNote,
              team1: {
                name: t1.name,
                shortName: t1.shortName,
                flag: t1.flag,
                score: formatScoreToBengali(c1.score),
              },
              team2: {
                name: t2.name,
                shortName: t2.shortName,
                flag: t2.flag,
                score: formatScoreToBengali(c2.score),
              },
            };

            results.push(matchItem);
          }
        }
      }
    }
  } catch (cricketErr) {
    console.warn("Failed to fetch live cricket API:", cricketErr);
  }

  // 2. Fetch Real Football Matches (Premier League, La Liga, Champions League)
  const soccerLeagues = [
    { code: "eng.1", name: "ইংলিশ প্রিমিয়ার লিগ" },
    { code: "esp.1", name: "স্প্যানিশ লা লিগা" },
    { code: "uefa.champions", name: "উয়েফা চ্যাম্পিয়নস লিগ" },
  ];

  for (const l of soccerLeagues) {
    try {
      const sRes = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/${l.code}/scoreboard`,
        {
          headers: {
            Accept: "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) BangladeshiNewsPortal/1.0",
          },
          next: { revalidate: 30 },
        }
      );

      if (sRes.ok) {
        const sData = await sRes.json();
        for (const ev of sData.events || []) {
          const comp = ev.competitions?.[0];
          const competitors = comp?.competitors || [];
          if (competitors.length >= 2) {
            const home = competitors.find((c: any) => c.homeAway === "home") || competitors[0]!;
            const away = competitors.find((c: any) => c.homeAway === "away") || competitors[1]!;

            const state = comp?.status?.type?.state;
            const status: MatchStatus =
              state === "in" ? "live" : state === "pre" ? "upcoming" : "recent";

            const t1 = translateTeam(home.team?.name || "");
            const t2 = translateTeam(away.team?.name || "");

            const rawNote = comp?.status?.type?.detail || comp?.status?.type?.description || "";
            const statusNote = translateStatusNote(rawNote);

            const matchItem: LiveMatch = {
              id: `football-${ev.id}`,
              sport: "football",
              status,
              tournament: l.name,
              matchLabel: `${t1.name} বনাম ${t2.name}`,
              venue: comp?.venue?.fullName || "স্টেডিয়াম",
              startTime: ev.date ? new Date(ev.date).toLocaleTimeString("bn-BD", { hour: "numeric", minute: "numeric" }) : "",
              statusNote,
              team1: {
                name: t1.name,
                shortName: t1.shortName,
                flag: t1.flag,
                score: toBengaliDigits(home.score || "0"),
              },
              team2: {
                name: t2.name,
                shortName: t2.shortName,
                flag: t2.flag,
                score: toBengaliDigits(away.score || "0"),
              },
            };

            results.push(matchItem);
          }
        }
      }
    } catch (socErr) {
      console.warn(`Failed to fetch soccer API (${l.code}):`, socErr);
    }
  }

  // 3. Sort intelligently:
  // - Priority 1: Bangladeshi domestic (NCL) or national matches
  // - Priority 2: Status === "live"
  // - Priority 3: Status === "upcoming"
  // - Priority 4: Status === "recent"
  results.sort((a, b) => {
    const isBdA = a.tournament.includes("NCL") || a.tournament.includes("বাংলাদেশ") || a.team1.flag === "🇧🇩" || a.team2.flag === "🇧🇩";
    const isBdB = b.tournament.includes("NCL") || b.tournament.includes("বাংলাদেশ") || b.team1.flag === "🇧🇩" || b.team2.flag === "🇧🇩";

    if (isBdA && !isBdB) return -1;
    if (!isBdA && isBdB) return 1;

    const statusWeight: Record<MatchStatus, number> = { live: 1, upcoming: 2, recent: 3 };
    return (statusWeight[a.status] || 3) - (statusWeight[b.status] || 3);
  });

  if (results.length > 0) {
    cachedMatches = results;
    lastFetchTime = now;
    return results;
  }

  return cachedMatches;
}
