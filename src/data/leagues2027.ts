// ─── 五大联赛 2026/27 赛季静态赛程数据 ───────────────────────────────────────
// 赛季尚未开始，此为根据公开赛程安排整理的静态占位数据
// 球队名单基于 2025/26 赛季升降级结果推断，开赛后由 API 替换

export interface StaticFixture {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;   // "2026-08-15"
  time: string;   // "12:30"
  timezone: string;
  matchday: number;
}

export interface LeagueInfo {
  code: string;
  nameZh: string;
  nameEn: string;
  country: string;
  flag: string;
  openingDate: string;  // 开幕日
  fixtures: StaticFixture[];
}

export const LEAGUES_2027: LeagueInfo[] = [
  // ── 英超 Premier League ──────────────────────────────────────────────────
  {
    code: "PL",
    nameZh: "英超",
    nameEn: "Premier League",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    openingDate: "2026-08-15",
    fixtures: [
      { id: "pl-md1-1", homeTeam: "Arsenal",          awayTeam: "Leicester City",  date: "2026-08-15", time: "12:30", timezone: "UTC", matchday: 1 },
      { id: "pl-md1-2", homeTeam: "Chelsea",           awayTeam: "Manchester City", date: "2026-08-15", time: "15:00", timezone: "UTC", matchday: 1 },
      { id: "pl-md1-3", homeTeam: "Liverpool",         awayTeam: "Tottenham",       date: "2026-08-15", time: "17:30", timezone: "UTC", matchday: 1 },
      { id: "pl-md1-4", homeTeam: "Newcastle",         awayTeam: "Aston Villa",     date: "2026-08-16", time: "14:00", timezone: "UTC", matchday: 1 },
      { id: "pl-md1-5", homeTeam: "Manchester United", awayTeam: "West Ham",        date: "2026-08-16", time: "14:00", timezone: "UTC", matchday: 1 },
      { id: "pl-md1-6", homeTeam: "Brighton",          awayTeam: "Everton",         date: "2026-08-16", time: "14:00", timezone: "UTC", matchday: 1 },
      { id: "pl-md1-7", homeTeam: "Brentford",         awayTeam: "Wolves",          date: "2026-08-16", time: "14:00", timezone: "UTC", matchday: 1 },
      { id: "pl-md1-8", homeTeam: "Fulham",            awayTeam: "Crystal Palace",  date: "2026-08-16", time: "16:30", timezone: "UTC", matchday: 1 },
    ],
  },

  // ── 西甲 La Liga ──────────────────────────────────────────────────────────
  {
    code: "PD",
    nameZh: "西甲",
    nameEn: "La Liga",
    country: "Spain",
    flag: "🇪🇸",
    openingDate: "2026-08-21",
    fixtures: [
      { id: "pd-md1-1", homeTeam: "Real Madrid",    awayTeam: "Deportivo Alavés", date: "2026-08-21", time: "19:00", timezone: "UTC", matchday: 1 },
      { id: "pd-md1-2", homeTeam: "Barcelona",      awayTeam: "Athletic Club",    date: "2026-08-22", time: "19:00", timezone: "UTC", matchday: 1 },
      { id: "pd-md1-3", homeTeam: "Atletico Madrid",awayTeam: "Girona",           date: "2026-08-22", time: "17:00", timezone: "UTC", matchday: 1 },
      { id: "pd-md1-4", homeTeam: "Real Sociedad",  awayTeam: "Valencia",         date: "2026-08-21", time: "17:00", timezone: "UTC", matchday: 1 },
      { id: "pd-md1-5", homeTeam: "Villarreal",     awayTeam: "Sevilla",          date: "2026-08-22", time: "15:00", timezone: "UTC", matchday: 1 },
      { id: "pd-md1-6", homeTeam: "Real Betis",     awayTeam: "Rayo Vallecano",   date: "2026-08-21", time: "15:00", timezone: "UTC", matchday: 1 },
    ],
  },

  // ── 德甲 Bundesliga ───────────────────────────────────────────────────────
  {
    code: "BL1",
    nameZh: "德甲",
    nameEn: "Bundesliga",
    country: "Germany",
    flag: "🇩🇪",
    openingDate: "2026-08-21",
    fixtures: [
      { id: "bl1-md1-1", homeTeam: "Bayern Munich",     awayTeam: "Wolfsburg",       date: "2026-08-22", time: "18:30", timezone: "UTC", matchday: 1 },
      { id: "bl1-md1-2", homeTeam: "Borussia Dortmund", awayTeam: "RB Leipzig",      date: "2026-08-22", time: "15:30", timezone: "UTC", matchday: 1 },
      { id: "bl1-md1-3", homeTeam: "Bayer Leverkusen",  awayTeam: "Werder Bremen",   date: "2026-08-22", time: "15:30", timezone: "UTC", matchday: 1 },
      { id: "bl1-md1-4", homeTeam: "Eintracht Frankfurt",awayTeam: "Union Berlin",   date: "2026-08-21", time: "18:30", timezone: "UTC", matchday: 1 },
      { id: "bl1-md1-5", homeTeam: "Stuttgart",         awayTeam: "Freiburg",        date: "2026-08-22", time: "15:30", timezone: "UTC", matchday: 1 },
      { id: "bl1-md1-6", homeTeam: "Borussia M'gladbach",awayTeam: "Augsburg",       date: "2026-08-22", time: "13:30", timezone: "UTC", matchday: 1 },
    ],
  },

  // ── 意甲 Serie A ──────────────────────────────────────────────────────────
  {
    code: "SA",
    nameZh: "意甲",
    nameEn: "Serie A",
    country: "Italy",
    flag: "🇮🇹",
    openingDate: "2026-08-22",
    fixtures: [
      { id: "sa-md1-1", homeTeam: "Inter Milan",  awayTeam: "Venezia",        date: "2026-08-23", time: "18:45", timezone: "UTC", matchday: 1 },
      { id: "sa-md1-2", homeTeam: "AC Milan",     awayTeam: "Torino",         date: "2026-08-23", time: "20:45", timezone: "UTC", matchday: 1 },
      { id: "sa-md1-3", homeTeam: "Juventus",     awayTeam: "Cagliari",       date: "2026-08-22", time: "18:45", timezone: "UTC", matchday: 1 },
      { id: "sa-md1-4", homeTeam: "Napoli",       awayTeam: "Hellas Verona",  date: "2026-08-22", time: "20:45", timezone: "UTC", matchday: 1 },
      { id: "sa-md1-5", homeTeam: "Lazio",        awayTeam: "Udinese",        date: "2026-08-23", time: "18:45", timezone: "UTC", matchday: 1 },
      { id: "sa-md1-6", homeTeam: "Roma",         awayTeam: "Genoa",          date: "2026-08-24", time: "18:45", timezone: "UTC", matchday: 1 },
    ],
  },

  // ── 法甲 Ligue 1 ──────────────────────────────────────────────────────────
  {
    code: "FL1",
    nameZh: "法甲",
    nameEn: "Ligue 1",
    country: "France",
    flag: "🇫🇷",
    openingDate: "2026-08-21",
    fixtures: [
      { id: "fl1-md1-1", homeTeam: "PSG",       awayTeam: "Strasbourg",   date: "2026-08-22", time: "19:00", timezone: "UTC", matchday: 1 },
      { id: "fl1-md1-2", homeTeam: "Monaco",    awayTeam: "Toulouse",     date: "2026-08-22", time: "17:00", timezone: "UTC", matchday: 1 },
      { id: "fl1-md1-3", homeTeam: "Lyon",      awayTeam: "Rennes",       date: "2026-08-21", time: "19:00", timezone: "UTC", matchday: 1 },
      { id: "fl1-md1-4", homeTeam: "Marseille", awayTeam: "Montpellier",  date: "2026-08-21", time: "17:00", timezone: "UTC", matchday: 1 },
      { id: "fl1-md1-5", homeTeam: "Lens",      awayTeam: "Brest",        date: "2026-08-22", time: "15:00", timezone: "UTC", matchday: 1 },
      { id: "fl1-md1-6", homeTeam: "Nice",      awayTeam: "Auxerre",      date: "2026-08-21", time: "15:00", timezone: "UTC", matchday: 1 },
    ],
  },
];

// ─── 辅助：倒计时天数 ─────────────────────────────────────────────────────────

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + "T00:00:00Z");
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

// ─── 辅助：格式化赛程日期 ────────────────────────────────────────────────────

export function formatFixtureDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("zh-CN", {
    month: "numeric", day: "numeric", weekday: "short", timeZone: "UTC",
  });
}
