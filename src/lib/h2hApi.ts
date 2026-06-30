/**
 * H2H (Head-to-Head) 历史战绩
 * ─────────────────────────────────────────────────────────────────────────────
 * 数据源：API-Football v3 (api-sports.io)
 * 免费配额：100 requests/day
 * 缓存策略：cache: "no-store" 避免 Next.js 缓存污染，
 *           依赖 Vercel Edge 和浏览器层缓存；每场比赛消耗 3 次配额。
 */

const BASE = "https://v3.football.api-sports.io";

// ─── 原始 API 类型 ─────────────────────────────────────────────────────────────

interface ApiFTeam {
  id: number;
  name: string;
  logo: string;
  national: boolean;
}

interface ApiFTeamsResponse {
  errors: unknown;
  results: number;
  response: Array<{ team: ApiFTeam; venue: unknown }>;
}

interface ApiFFixture {
  fixture: {
    id: number;
    date: string;          // ISO 8601
    status: { short: string };
  };
  league: {
    id: number;
    name: string;
    season: number;
    logo: string;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

interface ApiFH2HResponse {
  errors: unknown;
  results: number;
  response: ApiFFixture[];
}

// ─── 对外类型 ──────────────────────────────────────────────────────────────────

export interface H2HMatch {
  fixtureId: number;
  date: string;           // "2022-11-22"
  competition: string;    // "FIFA World Cup"
  season: number;
  homeTeamName: string;
  awayTeamName: string;
  homeLogo: string;
  awayLogo: string;
  homeGoals: number | null;
  awayGoals: number | null;
  status: string;         // "FT" | "AET" | "PEN" | "NS"
}

export interface H2HData {
  team1Name: string;      // 本场比赛主队名
  team2Name: string;      // 本场比赛客队名
  totalMatches: number;
  team1Wins: number;
  draws: number;
  team2Wins: number;
  avgGoals: number;
  matches: H2HMatch[];    // 最新 10 场，倒序
}

// ─── 工具函数 ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) throw new Error("API_FOOTBALL_KEY 未设置");

  const res = await fetch(`${BASE}${path}`, {
    headers: { "x-apisports-key": key },
    // 不使用 Next.js fetch 缓存，防止首次失败的结果被缓存 24h
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`API-Football 请求失败: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

/**
 * 通过球队英文名搜索其 API-Football 内部 ID
 * 优先返回 national=true 的国家队结果，缓存 24 小时
 */
async function searchTeamId(teamName: string): Promise<number | null> {
  try {
    const data = await apiFetch<ApiFTeamsResponse>(
      `/teams?search=${encodeURIComponent(teamName)}`
    );
    if (!data.response?.length) return null;
    // 优先匹配国家队（national: true），其次取第一条结果
    const national = data.response.find((r) => r.team.national);
    return (national ?? data.response[0]).team.id;
  } catch {
    return null;
  }
}

// ─── 主函数 ────────────────────────────────────────────────────────────────────

/**
 * 获取两支队伍的历史交锋数据（最近 10 场）
 * @param team1Name  本场比赛主队英文名（来自 football-data.org）
 * @param team2Name  本场比赛客队英文名
 */
export async function fetchH2H(
  team1Name: string,
  team2Name: string
): Promise<H2HData | null> {
  if (!process.env.API_FOOTBALL_KEY) return null;

  // 并行搜索两队 ID（各自 24h 缓存，实际重复访问不消耗额外配额）
  const [id1, id2] = await Promise.all([
    searchTeamId(team1Name),
    searchTeamId(team2Name),
  ]);
  if (!id1 || !id2) return null;

  // 获取最近 10 场历史交锋
  let fixtures: ApiFFixture[];
  try {
    const data = await apiFetch<ApiFH2HResponse>(
      `/fixtures/headtohead?h2h=${id1}-${id2}&last=10`
    );
    fixtures = data.response ?? [];
  } catch {
    return null;
  }

  if (!fixtures.length) return null;

  let team1Wins = 0;
  let team2Wins = 0;
  let draws = 0;
  let totalGoals = 0;
  let finishedCount = 0;

  const matches: H2HMatch[] = fixtures
    .map((f): H2HMatch => {
      const isTeam1Home = f.teams.home.id === id1;
      const hg = f.goals.home;
      const ag = f.goals.away;
      const finished = ["FT", "AET", "PEN"].includes(f.fixture.status.short);

      if (finished && hg !== null && ag !== null) {
        totalGoals += hg + ag;
        finishedCount++;
        if (hg === ag) {
          draws++;
        } else if (
          (isTeam1Home && hg > ag) ||
          (!isTeam1Home && ag > hg)
        ) {
          team1Wins++;
        } else {
          team2Wins++;
        }
      }

      return {
        fixtureId: f.fixture.id,
        date: f.fixture.date.slice(0, 10),
        competition: f.league.name,
        season: f.league.season,
        homeTeamName: f.teams.home.name,
        awayTeamName: f.teams.away.name,
        homeLogo: f.teams.home.logo,
        awayLogo: f.teams.away.logo,
        homeGoals: hg,
        awayGoals: ag,
        status: f.fixture.status.short,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return {
    team1Name,
    team2Name,
    totalMatches: fixtures.length,
    team1Wins,
    draws,
    team2Wins,
    avgGoals:
      finishedCount > 0
        ? Math.round((totalGoals / finishedCount) * 10) / 10
        : 0,
    matches,
  };
}
