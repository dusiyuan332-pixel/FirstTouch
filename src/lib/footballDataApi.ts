// ─── football-data.org v4 API 接口层 ─────────────────────────────────────────
// 文档：https://www.football-data.org/documentation/quickstart

// ── 原始 API 类型 ─────────────────────────────────────────────────────────────

interface FDTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;       // 3字母代码，如 "BRA"
  crest: string;     // 队徽 URL
}

interface FDScore {
  winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
  duration: "REGULAR" | "EXTRA_TIME" | "PENALTY_SHOOTOUT";
  fullTime: { home: number | null; away: number | null };
  halfTime: { home: number | null; away: number | null };
}

interface FDMatch {
  id: number;
  utcDate: string;         // "2026-06-28T19:00:00Z"
  status: string;          // SCHEDULED | TIMED | IN_PLAY | PAUSED | FINISHED | ...
  minute?: number | null;  // current match minute (only present when IN_PLAY / PAUSED)
  matchday: number | null;
  stage: string;           // GROUP_STAGE | LAST_32 | LAST_16 | QUARTER_FINALS | SEMI_FINALS | FINAL
  group: string | null;    // "GROUP_A" | null
  homeTeam: FDTeam;
  awayTeam: FDTeam;
  score: FDScore;
}

interface FDMatchesResponse {
  resultSet: { count: number; first: string; last: string; played: number };
  matches: FDMatch[];
}

interface FDMatchResponse extends FDMatch {}

// ── 统一展示类型（供页面和组件消费）─────────────────────────────────────────

export type MatchStatus = "upcoming" | "live" | "finished";
export type MatchStage =
  | "Group Stage"
  | "Round of 32"
  | "Round of 16"
  | "Quarter-final"
  | "Semi-final"
  | "Final";
export type RatingType = "STRONG_BUY" | "BUY" | "NEUTRAL" | "AVOID";

export interface DisplayTeam {
  id: number;
  name: string;
  nameZh: string;
  crest: string;
  code: string;
}

export interface MatchPrediction {
  homeWin: number;
  draw: number;
  awayWin: number;
  xGoalsHome: number;
  xGoalsAway: number;
  confidenceScore: number;
  rating: RatingType;
  ratingTarget: string;
  insight: string;
}

export type LiveStatusDetail = "IN_PLAY" | "PAUSED";

export interface DisplayMatch {
  id: string;              // football-data.org match ID (字符串化)
  stage: MatchStage;
  group?: string;          // "Group A"
  homeTeam: DisplayTeam;
  awayTeam: DisplayTeam;
  date: string;            // "2026-06-28"
  time: string;            // "19:00"
  status: MatchStatus;
  /** 比赛当前分钟数（仅 live 时有值） */
  minute?: number;
  /** IN_PLAY = 上下半场进行中，PAUSED = 中场休息 */
  statusDetail?: LiveStatusDetail;
  score?: { home: number; away: number };
  prediction?: MatchPrediction;
}

// ── 中文球队名称映射（TLA → 中文）────────────────────────────────────────────

const ZH_NAME: Record<string, string> = {
  ARG: "阿根廷",   AUS: "澳大利亚", AUT: "奥地利",   BEL: "比利时",
  BRA: "巴西",     CAN: "加拿大",   CHI: "智利",     CHN: "中国",
  COL: "哥伦比亚", CRC: "哥斯达黎加",CRO: "克罗地亚", DEN: "丹麦",
  ECU: "厄瓜多尔", EGY: "埃及",     ENG: "英格兰",   ESP: "西班牙",
  FRA: "法国",     GER: "德国",     GHA: "加纳",     GRE: "希腊",
  HON: "洪都拉斯", HUN: "匈牙利",   IRI: "伊朗",     IRQ: "伊拉克",
  ISR: "以色列",   ITA: "意大利",   JAM: "牙买加",   JPN: "日本",
  KOR: "韩国",     KSA: "沙特阿拉伯",MAR: "摩洛哥",  MEX: "墨西哥",
  MLI: "马里",     NED: "荷兰",     NGA: "尼日利亚", NZL: "新西兰",
  PAR: "巴拉圭",   PER: "秘鲁",     POL: "波兰",     POR: "葡萄牙",
  QAT: "卡塔尔",   ROU: "罗马尼亚", RSA: "南非",     SEN: "塞内加尔",
  SRB: "塞尔维亚", SUI: "瑞士",     SVK: "斯洛伐克", SVN: "斯洛文尼亚",
  TUN: "突尼斯",   TUR: "土耳其",   UKR: "乌克兰",   URU: "乌拉圭",
  USA: "美国",     VEN: "委内瑞拉", WAL: "威尔士",
  NOR: "挪威",     SWE: "瑞典",     FIN: "芬兰",     SCO: "苏格兰",
  CIV: "科特迪瓦", CMR: "喀麦隆",   COD: "刚果",     ALG: "阿尔及利亚",
  PAN: "巴拿马",   BOL: "玻利维亚", PRK: "朝鲜",     IRN: "伊朗",
  // 部分球队名称可能不同
  "United States": "美国",
};

// ── 类型转换工具 ──────────────────────────────────────────────────────────────

function mapStatus(status: string): MatchStatus {
  if (["IN_PLAY", "PAUSED", "HALFTIME"].includes(status)) return "live";
  if (status === "FINISHED") return "finished";
  return "upcoming"; // SCHEDULED, TIMED, etc.
}

function mapStage(stage: string): MatchStage {
  const MAP: Record<string, MatchStage> = {
    GROUP_STAGE:    "Group Stage",
    LAST_32:        "Round of 32",
    LAST_16:        "Round of 16",
    QUARTER_FINALS: "Quarter-final",
    SEMI_FINALS:    "Semi-final",
    THIRD_PLACE:    "Semi-final",
    FINAL:          "Final",
  };
  return MAP[stage] ?? "Group Stage";
}

function mapGroup(group: string | null): string | undefined {
  if (!group) return undefined;
  // "GROUP_A" → "Group A"
  return group.replace("GROUP_", "Group ");
}

function mapTeam(team: FDTeam): DisplayTeam {
  return {
    id: team.id,
    name: team.name,
    nameZh: ZH_NAME[team.tla] ?? ZH_NAME[team.name] ?? team.shortName ?? team.name,
    crest: team.crest,
    code: team.tla,
  };
}

function fdMatchToDisplay(match: FDMatch, prediction?: MatchPrediction): DisplayMatch {
  const utc = new Date(match.utcDate);
  const date = match.utcDate.slice(0, 10); // "2026-06-28"
  const time = utc.toISOString().slice(11, 16); // "19:00"

  const score =
    match.score.fullTime.home !== null && match.score.fullTime.away !== null
      ? { home: match.score.fullTime.home, away: match.score.fullTime.away }
      : undefined;

  const statusDetail: LiveStatusDetail | undefined =
    match.status === "IN_PLAY" ? "IN_PLAY" :
    match.status === "PAUSED"  ? "PAUSED"  : undefined;

  return {
    id: String(match.id),
    stage: mapStage(match.stage),
    group: mapGroup(match.group),
    homeTeam: mapTeam(match.homeTeam),
    awayTeam: mapTeam(match.awayTeam),
    date,
    time,
    status: mapStatus(match.status),
    minute: match.minute ?? undefined,
    statusDetail,
    score,
    prediction,
  };
}

// ── 核心请求函数 ──────────────────────────────────────────────────────────────

async function fdFetch<T>(path: string, cacheSeconds = 300): Promise<T> {
  const key = process.env.FOOTBALL_DATA_KEY;
  if (!key) throw new Error("环境变量 FOOTBALL_DATA_KEY 未设置");

  const res = await fetch(`https://api.football-data.org/v4${path}`, {
    headers: { "X-Auth-Token": key },
    next: { revalidate: cacheSeconds },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`football-data.org 请求失败 (${res.status}): ${text.slice(0, 200)}`);
  }

  return res.json() as Promise<T>;
}

// ── 公开 API ──────────────────────────────────────────────────────────────────

/**
 * 获取 2026 世界杯所有赛程（缓存 5 分钟）
 * 返回按日期排序的比赛列表
 */
export async function fetchWC2026Matches(
  predictionMap: Record<string, MatchPrediction> = {}
): Promise<DisplayMatch[]> {
  const data = await fdFetch<FDMatchesResponse>(
    "/competitions/WC/matches?season=2026",
    60   // 60s：兼顾直播比分刷新与 API 配额
  );

  return data.matches
    .map((m) => {
      const key = `${m.homeTeam.tla}-${m.awayTeam.tla}`;
      return fdMatchToDisplay(m, predictionMap[key]);
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

/**
 * 获取单场比赛详情（缓存 2 分钟）
 */
export async function fetchMatchById(
  id: string,
  predictionMap: Record<string, MatchPrediction> = {}
): Promise<DisplayMatch | null> {
  try {
    const match = await fdFetch<FDMatchResponse>(`/matches/${id}`, 60);
    const key = `${match.homeTeam.tla}-${match.awayTeam.tla}`;
    return fdMatchToDisplay(match, predictionMap[key]);
  } catch {
    return null;
  }
}

// ── 五大联赛积分榜 ────────────────────────────────────────────────────────────

export interface LeagueTableRow {
  position: number;
  team: { id: number; name: string; shortName: string; tla: string; crest: string };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalDifference: number;
  form: string;
}

export interface LeagueStandings {
  competition: { name: string; code: string; emblem: string };
  nameZh: string;
  table: LeagueTableRow[];
}

interface FDStandingsResponse {
  competition: { id: number; name: string; code: string; emblem: string };
  standings: Array<{
    stage: string;
    type: string;
    table: LeagueTableRow[];
  }>;
}

const LEAGUE_META: Record<string, { nameZh: string }> = {
  PL:  { nameZh: "英超" },
  PD:  { nameZh: "西甲" },
  BL1: { nameZh: "德甲" },
  SA:  { nameZh: "意甲" },
  FL1: { nameZh: "法甲" },
};

/**
 * 获取单个联赛积分榜（赛季 2024 = 2024/25）
 * 赛季结束后数据不变，缓存 24 小时
 */
export async function fetchLeagueStandings(
  competitionCode: string
): Promise<LeagueStandings | null> {
  try {
    const data = await fdFetch<FDStandingsResponse>(
      `/competitions/${competitionCode}/standings?season=2025`,
      86400
    );
    const totalStandings = data.standings.find((s) => s.type === "TOTAL");
    return {
      competition: data.competition,
      nameZh: LEAGUE_META[competitionCode]?.nameZh ?? competitionCode,
      table: totalStandings?.table ?? [],
    };
  } catch {
    return null;
  }
}

/**
 * 并行获取五大联赛积分榜
 */
export async function fetchTopFiveLeagues(): Promise<LeagueStandings[]> {
  const codes = ["PL", "PD", "BL1", "SA", "FL1"];
  const results = await Promise.allSettled(codes.map(fetchLeagueStandings));
  return results
    .filter(
      (r): r is PromiseFulfilledResult<LeagueStandings> =>
        r.status === "fulfilled" && r.value !== null
    )
    .map((r) => r.value);
}

// ── 工具函数（供页面使用）────────────────────────────────────────────────────

export function groupByDate(matches: DisplayMatch[]): Map<string, DisplayMatch[]> {
  const map = new Map<string, DisplayMatch[]>();
  for (const m of matches) {
    const arr = map.get(m.date) ?? [];
    arr.push(m);
    map.set(m.date, arr);
  }
  return map;
}

export function getUniqueDates(matches: DisplayMatch[]): string[] {
  return [...new Set(matches.map((m) => m.date))].sort();
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("zh-CN", {
    month: "long", day: "numeric", weekday: "short", timeZone: "UTC",
  });
}
