// ─── 共用类型定义 ─────────────────────────────────────────────────────────────

export interface TeamStanding {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  form: string;
  /** 仅世界杯等分组赛制有此字段，如 "Group A" */
  group: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  description: string | null;
}

interface StandingsApiResponse {
  errors: Record<string, string> | unknown[];
  results: number;
  response: Array<{
    league: {
      id: number;
      name: string;
      country: string;
      logo: string;
      season: number;
      standings: TeamStanding[][];
    };
  }>;
}

// ─── 内部工厂：复用 fetch + 错误处理 ─────────────────────────────────────────

async function fetchStandings(
  leagueId: number,
  season: number
): Promise<TeamStanding[][]> {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    throw new Error("环境变量 API_FOOTBALL_KEY 未设置");
  }

  const url = `https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season}`;

  const res = await fetch(url, {
    headers: {
      "x-apisports-key": apiKey,
    },
    // 每小时重新验证一次，节省 API 配额
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`API-Football 请求失败: HTTP ${res.status}`);
  }

  const data: StandingsApiResponse = await res.json();

  // errors 可能是对象 {} 或数组 []，统一判断是否有内容
  const hasErrors =
    data.errors &&
    (Array.isArray(data.errors)
      ? data.errors.length > 0
      : Object.keys(data.errors).length > 0);

  if (hasErrors) {
    throw new Error(`API 返回错误: ${JSON.stringify(data.errors)}`);
  }

  const allGroups = data.response?.[0]?.league?.standings;

  if (!allGroups || allGroups.length === 0) {
    throw new Error("API 返回数据结构异常：standings 为空");
  }

  return allGroups;
}

// ─── 英超积分榜（联赛 ID: 39，赛季: 2024）────────────────────────────────────

export async function fetchPremierLeagueStandings(): Promise<TeamStanding[]> {
  const groups = await fetchStandings(39, 2024);
  // 英超是单组联赛，取第一个（也是唯一一个）数组
  return groups[0];
}

// ─── 世界杯分组积分榜（League ID: 1）────────────────────────────────────────
// 优先尝试 2026 赛季（需付费账号），失败则自动降级到 2022 历史数据
// 返回值：groups 二维数组 + actualSeason（实际拉到哪一年）

export interface WorldCupResult {
  groups: TeamStanding[][];
  season: number;
  isPaidDataUnavailable: boolean; // true = 降级到了历史数据
}

export async function fetchWorldCupStandings(): Promise<WorldCupResult> {
  // 先尝试当前赛季
  try {
    const groups = await fetchStandings(1, 2026);
    return { groups, season: 2026, isPaidDataUnavailable: false };
  } catch {
    // 2026 失败（无权限或数据未就绪），降级到 2022
  }

  const groups = await fetchStandings(1, 2022);
  return { groups, season: 2022, isPaidDataUnavailable: true };
}
