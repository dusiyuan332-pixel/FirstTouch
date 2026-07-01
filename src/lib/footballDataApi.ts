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
  venue?: string | null;   // Stadium name, e.g. "SoFi Stadium"
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
  | "Third Place"
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
  /** 场馆名称，来自 football-data.org API，可能为空 */
  venue?: string;
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
    THIRD_PLACE:    "Third Place",
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
    venue: match.venue ?? undefined,
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

// ── 世界杯射手榜 ──────────────────────────────────────────────────────────────

export interface WCScorer {
  rank: number;
  player: {
    id: number;
    name: string;
    nationality: string;
    position: string | null;
    shirtNumber: number | null;
  };
  team: {
    id: number;
    name: string;
    nameZh: string;
    tla: string;
    crest: string;
  };
  goals: number;
  assists: number;
  penalties: number;
  playedMatches: number;
}

interface FDScorersResponse {
  scorers: Array<{
    player: {
      id: number;
      name: string;
      nationality: string;
      position: string | null;
      shirtNumber: number | null;
    };
    team: FDTeam;
    goals: number;
    assists: number | null;
    penalties: number | null;
    playedMatches: number;
  }>;
}

/**
 * 获取世界杯射手榜（最多前20名，缓存 10 分钟）
 */
export async function fetchWC2026Scorers(limit = 20): Promise<WCScorer[]> {
  try {
    const data = await fdFetch<FDScorersResponse>(
      `/competitions/WC/scorers?limit=${limit}&season=2026`,
      600
    );
    return data.scorers.map((s, i) => ({
      rank: i + 1,
      player: s.player,
      team: {
        id: s.team.id,
        name: s.team.name,
        nameZh: ZH_NAME[s.team.tla] ?? s.team.shortName ?? s.team.name,
        tla: s.team.tla,
        crest: s.team.crest,
      },
      goals: s.goals,
      assists: s.assists ?? 0,
      penalties: s.penalties ?? 0,
      playedMatches: s.playedMatches,
    }));
  } catch {
    return [];
  }
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

// ── 赛事中心：从赛果推算小组积分 ─────────────────────────────────────────────

export interface GroupStandingEntry {
  team: DisplayTeam;
  played: number;
  won: number;
  draw: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export interface GroupStandings {
  group: string;
  teams: GroupStandingEntry[];
}

function emptyStanding(team: DisplayTeam): GroupStandingEntry {
  return { team, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
}

/** 根据已完赛的小组赛结果推算积分榜（无需额外 API） */
export function computeGroupStandings(matches: DisplayMatch[]): GroupStandings[] {
  const groupTeams = new Map<string, Map<string, GroupStandingEntry>>();

  for (const m of matches) {
    if (m.stage !== "Group Stage" || !m.group) continue;
    const g = groupTeams.get(m.group) ?? new Map();
    if (!g.has(m.homeTeam.code)) g.set(m.homeTeam.code, emptyStanding(m.homeTeam));
    if (!g.has(m.awayTeam.code)) g.set(m.awayTeam.code, emptyStanding(m.awayTeam));
    groupTeams.set(m.group, g);
  }

  for (const m of matches) {
    if (m.stage !== "Group Stage" || !m.group || m.status !== "finished" || !m.score) continue;
    const g = groupTeams.get(m.group);
    if (!g) continue;

    const home = g.get(m.homeTeam.code)!;
    const away = g.get(m.awayTeam.code)!;
    const { home: hg, away: ag } = m.score;

    home.played++; away.played++;
    home.gf += hg; home.ga += ag;
    away.gf += ag; away.ga += hg;

    if (hg > ag) {
      home.won++; home.points += 3;
      away.lost++;
    } else if (hg < ag) {
      away.won++; away.points += 3;
      home.lost++;
    } else {
      home.draw++; away.draw++;
      home.points++; away.points++;
    }
    home.gd = home.gf - home.ga;
    away.gd = away.gf - away.ga;
  }

  return [...groupTeams.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, teamMap]) => ({
      group,
      teams: [...teamMap.values()].sort(
        (a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf,
      ),
    }));
}

export interface TournamentProgress {
  stageLabel: string;
  groupFinished: number;
  groupTotal: number;
  knockoutFinished: number;
  knockoutTotal: number;
  totalFinished: number;
  totalMatches: number;
}

export function getTournamentProgress(matches: DisplayMatch[]): TournamentProgress {
  const group = matches.filter((m) => m.stage === "Group Stage");
  const knockout = matches.filter((m) => m.stage !== "Group Stage");
  const groupFinished = group.filter((m) => m.status === "finished").length;
  const knockoutFinished = knockout.filter((m) => m.status === "finished").length;

  let stageLabel = "小组赛";
  if (group.length > 0 && groupFinished === group.length && knockout.length > 0) {
    if (knockoutFinished === knockout.length) stageLabel = "赛事结束";
    else if (knockout.some((m) => m.stage === "Final")) stageLabel = "决赛阶段";
    else stageLabel = "淘汰赛";
  } else if (group.length === 0 && knockout.length > 0) {
    stageLabel = "淘汰赛";
  }

  return {
    stageLabel,
    groupFinished,
    groupTotal: group.length,
    knockoutFinished,
    knockoutTotal: knockout.length,
    totalFinished: matches.filter((m) => m.status === "finished").length,
    totalMatches: matches.length,
  };
}

/** 今日赛程；若今日无赛则返回最近下一个比赛日 */
export function getFocusMatchday(
  matches: DisplayMatch[],
  todayUtc: string,
): { date: string; label: string; isToday: boolean; matches: DisplayMatch[] } {
  const byDate = groupByDate(
    matches.filter((m) => m.status === "live" || m.status === "upcoming" || m.status === "finished"),
  );
  const dates = getUniqueDates([...byDate.values()].flat());

  const todayList = byDate.get(todayUtc) ?? [];
  if (todayList.length > 0) {
    return { date: todayUtc, label: "今日赛程", isToday: true, matches: todayList };
  }

  const nextDate = dates.find((d) => d >= todayUtc);
  if (nextDate) {
    return {
      date: nextDate,
      label: "下一比赛日",
      isToday: false,
      matches: byDate.get(nextDate) ?? [],
    };
  }

  const lastDate = dates[dates.length - 1];
  return {
    date: lastDate ?? todayUtc,
    label: "最近比赛日",
    isToday: false,
    matches: lastDate ? (byDate.get(lastDate) ?? []) : [],
  };
}

// ── 淘汰赛晋级树 ─────────────────────────────────────────────────────────────

export const KNOCKOUT_ROUND_META: {
  stage: MatchStage;
  label: string;
  labelEn: string;
}[] = [
  { stage: "Round of 32",   label: "三十二强", labelEn: "Round of 32" },
  { stage: "Round of 16",   label: "十六强",   labelEn: "Round of 16" },
  { stage: "Quarter-final", label: "八强",     labelEn: "Quarter-finals" },
  { stage: "Semi-final",    label: "半决赛",   labelEn: "Semi-finals" },
  { stage: "Final",         label: "决赛",     labelEn: "Final" },
];

export interface KnockoutRound {
  stage: MatchStage;
  label: string;
  labelEn: string;
  matches: DisplayMatch[];
}

/** 按轮次分组淘汰赛赛程（按日期排序） */
export function buildKnockoutRounds(matches: DisplayMatch[]): KnockoutRound[] {
  const knockout = matches.filter((m) => m.stage !== "Group Stage" && m.stage !== "Third Place");

  return KNOCKOUT_ROUND_META.map(({ stage, label, labelEn }) => ({
    stage,
    label,
    labelEn,
    matches: knockout
      .filter((m) => m.stage === stage)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || Number(a.id) - Number(b.id)),
  })).filter((r) => r.matches.length > 0);
}

export function getThirdPlaceMatch(matches: DisplayMatch[]): DisplayMatch | null {
  return matches.find((m) => m.stage === "Third Place") ?? null;
}

/** 从赛果推断胜者（点球大战 API 可能只给常规时间比分，平局时返回 null） */
export function getMatchWinner(match: DisplayMatch): DisplayTeam | null {
  if (!match.score || match.status !== "finished") return null;
  const { home, away } = match.score;
  if (home > away) return match.homeTeam;
  if (away > home) return match.awayTeam;
  return null;
}
