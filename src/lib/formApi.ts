/**
 * formApi.ts — 球队近5场战绩 + 伤病/停赛报告
 * ─────────────────────────────────────────────────────────────────────────────
 * 数据源：API-Football v3 (api-sports.io)
 * 免费配额：100 requests/day
 *
 * 缓存策略（节省配额）：
 *   - 球队 ID 搜索：revalidate 24h（ID 不变，缓存命中率高）
 *   - 近5场战绩：revalidate 1h（比赛结束后更新）
 *   - 伤病报告：revalidate 2h（伤情变化较慢）
 *
 * 每场比赛首次加载消耗约 6 次配额；缓存命中后约 2 次（仅战绩+伤病）
 */

const BASE = "https://v3.football.api-sports.io";

// ─── 扩展 fetch 类型以支持 Next.js next 选项 ────────────────────────────────
type FetchInit = RequestInit & { next?: { revalidate?: number } };

// ─── 原始 API 类型 ─────────────────────────────────────────────────────────

interface ApiFTeam {
  id: number;
  name: string;
  logo: string;
  national?: boolean;
}

interface ApiFFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string };
  };
  league: { id: number; name: string; season: number };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
}

interface ApiFInjury {
  player: { id: number; name: string; photo: string };
  team: { id: number; name: string };
  type: string;    // "Injury" | "Suspension"
  reason: string;  // "Hamstring Injury" | "Accumulated Yellow Cards"
}

// ─── 对外类型 ──────────────────────────────────────────────────────────────

export interface FormMatch {
  date: string;           // "2026-06-15"
  competition: string;    // "FIFA World Cup"
  opponentName: string;
  opponentLogo: string;
  isHome: boolean;
  goalsFor: number;
  goalsAgainst: number;
  result: "W" | "D" | "L";
}

export interface InjuryRecord {
  playerName: string;
  playerPhoto: string;
  type: string;   // "Injury" | "Suspension"
  reason: string; // "Knee Ligament" / "Yellow Card Suspension"
}

export interface TeamFormData {
  teamId: number;
  teamName: string;
  teamLogo: string;
  form: FormMatch[];
  injuries: InjuryRecord[];
}

export interface DualFormData {
  home: TeamFormData;
  away: TeamFormData;
}

// ─── 工具函数 ──────────────────────────────────────────────────────────────

function getKey(): string {
  const k = process.env.API_FOOTBALL_KEY;
  if (!k) throw new Error("API_FOOTBALL_KEY 未配置");
  return k;
}

async function apiFetch<T>(path: string, init: FetchInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "x-apisports-key": getKey() },
    ...init,
  });
  if (!res.ok) throw new Error(`API-Football HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

/**
 * 通过球队英文名搜索 API-Football ID
 * revalidate: 24h — 球队 ID 永不变，缓存命中后不消耗配额
 */
async function searchTeamId(teamName: string): Promise<{ id: number; logo: string } | null> {
  try {
    const data = await apiFetch<{
      results: number;
      response: Array<{ team: ApiFTeam }>;
    }>(
      `/teams?search=${encodeURIComponent(teamName)}`,
      { next: { revalidate: 86400 } }
    );
    if (!data.response?.length) return null;
    // 优先匹配国家队（national: true）
    const hit = data.response.find((r) => r.team.national) ?? data.response[0];
    return { id: hit.team.id, logo: hit.team.logo };
  } catch {
    return null;
  }
}

// ─── 近5场战绩 ─────────────────────────────────────────────────────────────

async function fetchForm(
  teamId: number,
  teamName: string
): Promise<FormMatch[]> {
  const FINISHED = new Set(["FT", "AET", "PEN"]);
  try {
    const data = await apiFetch<{
      results: number;
      response: ApiFFixture[];
    }>(
      `/fixtures?team=${teamId}&last=8`,  // 多取几场，过滤掉未完成的
      { next: { revalidate: 3600 } }
    );

    const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
    const normName = norm(teamName);

    return (data.response ?? [])
      .filter((f) => FINISHED.has(f.fixture.status.short))
      .slice(0, 5)
      .map((f): FormMatch => {
        const isHome =
          norm(f.teams.home.name).includes(normName) ||
          normName.includes(norm(f.teams.home.name));

        const goalsFor     = isHome ? (f.goals.home ?? 0) : (f.goals.away ?? 0);
        const goalsAgainst = isHome ? (f.goals.away ?? 0) : (f.goals.home ?? 0);

        let result: "W" | "D" | "L";
        const teamWinner = isHome ? f.teams.home.winner : f.teams.away.winner;
        if (teamWinner === true)  result = "W";
        else if (teamWinner === false) result = "L";
        else result = "D";

        const opponent = isHome ? f.teams.away : f.teams.home;

        return {
          date:         f.fixture.date.slice(0, 10),
          competition:  f.league.name,
          opponentName: opponent.name,
          opponentLogo: opponent.logo,
          isHome,
          goalsFor,
          goalsAgainst,
          result,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date)); // 最近的在前
  } catch {
    return [];
  }
}

// ─── 伤病 / 停赛报告 ───────────────────────────────────────────────────────

async function fetchInjuries(teamId: number): Promise<InjuryRecord[]> {
  try {
    const data = await apiFetch<{
      results: number;
      response: ApiFInjury[];
    }>(
      `/injuries?team=${teamId}&season=2026`,
      { next: { revalidate: 7200 } }
    );

    return (data.response ?? []).map((inj): InjuryRecord => ({
      playerName:  inj.player.name,
      playerPhoto: inj.player.photo,
      type:        inj.type,
      reason:      inj.reason,
    }));
  } catch {
    return [];
  }
}

// ─── 主函数（两支球队并行请求）────────────────────────────────────────────

/**
 * 同时获取主客队的近5场战绩 + 伤病报告
 * 共消耗约 6 次配额（首次）/ 2 次（缓存命中后）
 */
export async function fetchDualTeamIntel(
  homeTeamName: string,
  awayTeamName: string
): Promise<DualFormData | null> {
  if (!process.env.API_FOOTBALL_KEY) return null;

  // 并行搜索两队 ID
  const [homeInfo, awayInfo] = await Promise.all([
    searchTeamId(homeTeamName),
    searchTeamId(awayTeamName),
  ]);

  if (!homeInfo || !awayInfo) return null;

  // 并行获取战绩 + 伤病（4 次请求）
  const [homeForm, awayForm, homeInj, awayInj] = await Promise.all([
    fetchForm(homeInfo.id, homeTeamName),
    fetchForm(awayInfo.id, awayTeamName),
    fetchInjuries(homeInfo.id),
    fetchInjuries(awayInfo.id),
  ]);

  return {
    home: {
      teamId:   homeInfo.id,
      teamName: homeTeamName,
      teamLogo: homeInfo.logo,
      form:     homeForm,
      injuries: homeInj,
    },
    away: {
      teamId:   awayInfo.id,
      teamName: awayTeamName,
      teamLogo: awayInfo.logo,
      form:     awayForm,
      injuries: awayInj,
    },
  };
}
