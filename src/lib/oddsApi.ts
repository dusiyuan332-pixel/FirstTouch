/**
 * The Odds API v4 客户端
 * ────────────────────────────────────────────────────────────────────────────
 * 文档：https://the-odds-api.com/liveapi/guides/v4/
 * 免费计划：500 credits/月（每次请求消耗 1 credit）
 * 服务端专用（ODDS_API_KEY 不暴露前端）
 */

const BASE = "https://api.the-odds-api.com/v4";
const API_KEY = process.env.ODDS_API_KEY ?? "";

// ─── 原始 API 类型 ─────────────────────────────────────────────────────────

interface OddsOutcome {
  name: string;      // "Brazil" | "Draw" | "Japan"
  price: number;     // Decimal odds，如 1.72
}

interface OddsMarket {
  key: string;       // "h2h"
  last_update: string;
  outcomes: OddsOutcome[];
}

interface OddsBookmaker {
  key: string;       // "bet365"
  title: string;     // "Bet365"
  last_update: string;
  markets: OddsMarket[];
}

interface OddsEvent {
  id: string;
  sport_key: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsBookmaker[];
}

// ─── 对外展示类型 ──────────────────────────────────────────────────────────

export interface BookmakerOdds {
  bookmaker: string;        // "Bet365"
  homeWin: number;          // Decimal odds
  draw: number;
  awayWin: number;
  homeImplied: number;      // 隐含概率 %
  drawImplied: number;
  awayImplied: number;
}

export interface MatchOdds {
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  bookmakers: BookmakerOdds[];
  consensus: {              // 多家均值
    homeWin: number;
    draw: number;
    awayWin: number;
    homeImplied: number;
    drawImplied: number;
    awayImplied: number;
  } | null;
  remainingCredits: number;
}

// ─── 辅助 ────────────────────────────────────────────────────────────────

function impliedProb(odds: number): number {
  return odds > 0 ? Math.round((1 / odds) * 1000) / 10 : 0;
}

// ─── 核心函数 ─────────────────────────────────────────────────────────────

/**
 * 按主客队名称搜索赔率（World Cup 赛事）
 * 返回 null 表示未找到该场比赛（可能尚未上线）
 */
export async function fetchMatchOdds(
  homeTeamName: string,
  awayTeamName: string,
): Promise<MatchOdds | null> {
  if (!API_KEY) return null;

  // 只请求 6 家主流庄家，减少数据量（credit 消耗不变，但响应更小）
  const TOP_BOOKMAKERS = "bet365,pinnacle,williamhill,betfair,unibet,betsson";
  const url =
    `${BASE}/sports/soccer_fifa_world_cup/odds` +
    `?apiKey=${API_KEY}&regions=eu&markets=h2h&oddsFormat=decimal&bookmakers=${TOP_BOOKMAKERS}`;

  let events: OddsEvent[];
  let remainingCredits = 0;

  try {
    const res = await fetch(url, {
      next: { revalidate: 1800 }, // 30 分钟缓存（盘口变化慢，节省 credits）
    });
    remainingCredits = Number(res.headers.get("x-requests-remaining") ?? 0);
    if (!res.ok) return null;
    events = await res.json() as OddsEvent[];
  } catch {
    return null;
  }

  // 模糊匹配主客队名（API 用英文全名，与 football-data.org 不一定完全一致）
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
  const normHome = normalize(homeTeamName);
  const normAway = normalize(awayTeamName);

  const event = events.find((e) => {
    const h = normalize(e.home_team);
    const a = normalize(e.away_team);
    return (
      (h.includes(normHome) || normHome.includes(h)) &&
      (a.includes(normAway) || normAway.includes(a))
    );
  });

  if (!event) return null;

  const bookmakers: BookmakerOdds[] = event.bookmakers
    .map((bk) => {
      const h2h = bk.markets.find((m) => m.key === "h2h");
      if (!h2h) return null;
      const homeOdds = h2h.outcomes.find((o) => normalize(o.name) === normHome)?.price ?? 0;
      const awayOdds = h2h.outcomes.find((o) => normalize(o.name) === normAway)?.price ?? 0;
      const drawOdds = h2h.outcomes.find((o) => o.name === "Draw")?.price ?? 0;
      if (!homeOdds || !awayOdds || !drawOdds) return null;
      return {
        bookmaker: bk.title,
        homeWin: homeOdds,
        draw: drawOdds,
        awayWin: awayOdds,
        homeImplied: impliedProb(homeOdds),
        drawImplied: impliedProb(drawOdds),
        awayImplied: impliedProb(awayOdds),
      } satisfies BookmakerOdds;
    })
    .filter(Boolean) as BookmakerOdds[];

  if (bookmakers.length === 0) return null;

  // 计算共识均值
  const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length;
  const consensus = {
    homeWin:     Math.round(avg(bookmakers.map((b) => b.homeWin)) * 100) / 100,
    draw:        Math.round(avg(bookmakers.map((b) => b.draw))    * 100) / 100,
    awayWin:     Math.round(avg(bookmakers.map((b) => b.awayWin)) * 100) / 100,
    homeImplied: Math.round(avg(bookmakers.map((b) => b.homeImplied)) * 10) / 10,
    drawImplied: Math.round(avg(bookmakers.map((b) => b.drawImplied)) * 10) / 10,
    awayImplied: Math.round(avg(bookmakers.map((b) => b.awayImplied)) * 10) / 10,
  };

  return {
    eventId: event.id,
    homeTeam: event.home_team,
    awayTeam: event.away_team,
    commenceTime: event.commence_time,
    bookmakers,
    consensus,
    remainingCredits,
  };
}

/**
 * 计算模型 Edge（量化价值差）
 * edge > 0 → 模型认为该结果被市场低估（存在正期望）
 */
export function calcEdge(
  modelProb: number,   // 模型概率 0-1
  marketOdds: number,  // 市场赔率 (decimal)
): number {
  if (marketOdds <= 1) return 0;
  const impliedProb = 1 / marketOdds;
  return Math.round((modelProb - impliedProb) * 1000) / 10; // 返回百分点
}
