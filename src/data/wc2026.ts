// ─── 2026 世界杯量化预测数据库 ─────────────────────────────────────────────────
// 基础预测（PREDICTIONS）供赛程卡片使用
// 详细分析（DETAILED_ANALYSIS）供机构级报告页使用
// Key 格式：主队TLA-客队TLA（如 "ENG-MAR"）

import type { MatchPrediction } from "@/lib/footballDataApi";
export type { MatchPrediction };

// ─── 扩展类型：机构级详细分析 ─────────────────────────────────────────────────

export interface TeamFormStats {
  form: ("W" | "D" | "L")[];   // 近 5 场结果
  winRate5: number;              // 近 5 场胜率 (%)
  goalsFor: number;              // 场均进球
  goalsAgainst: number;          // 场均失球
  xGFor: number;                 // 场均预期进球 xG
  xGAgainst: number;             // 场均预期失球 xGA
  cleanSheets: number;           // 近 5 场零封场数
  avgPossession: number;         // 场均控球率 (%)
}

export interface DetailedAnalysis {
  // 市场隐含概率（用于计算边际 Edge）
  marketHomeWin: number;
  marketDraw: number;
  marketAwayWin: number;

  // 量化投资指标
  evPercent: number;        // 期望回报率 (Expected Value %)
  kellyFraction: number;    // Kelly 准则建议投注比例（半凯利）
  sharpeProxy: number;      // 夏普代理值（收益/风险比）

  // 球队近期数据
  homeStats: TeamFormStats;
  awayStats: TeamFormStats;

  // 历史交锋（H2H）
  h2h: { homeWins: number; draws: number; awayWins: number; totalGames: number };

  // 模型元信息
  modelVersion: string;
  dataAsOf: string;          // 数据截止时间（ISO date string）
}

// ─── 基础预测数据库 ───────────────────────────────────────────────────────────

export const PREDICTIONS: Record<string, MatchPrediction> = {
  "BRA-SUI": {
    homeWin: 72, draw: 18, awayWin: 10,
    xGoalsHome: 2.31, xGoalsAway: 0.74, confidenceScore: 84,
    rating: "STRONG_BUY", ratingTarget: "主胜 (让球 -1.5)",
    insight: "巴西主导进攻节奏，xG 优势明显，盘口低估主胜概率。",
  },
  "ARG-CRO": {
    homeWin: 65, draw: 20, awayWin: 15,
    xGoalsHome: 2.10, xGoalsAway: 0.95, confidenceScore: 77,
    rating: "BUY", ratingTarget: "主胜 (亚盘 -0.5)",
    insight: "卫冕冠军状态稳健，克罗地亚客场防守压力大。",
  },
  "FRA-SEN": {
    homeWin: 58, draw: 25, awayWin: 17,
    xGoalsHome: 1.87, xGoalsAway: 0.91, confidenceScore: 71,
    rating: "NEUTRAL", ratingTarget: "法国让球 -0.5 风险高",
    insight: "塞内加尔防反效率高，法国中场创造力不足，平局概率被低估。",
  },
  "USA-IRI": {
    homeWin: 52, draw: 28, awayWin: 20,
    xGoalsHome: 1.64, xGoalsAway: 0.98, confidenceScore: 66,
    rating: "BUY", ratingTarget: "主队获胜 (全场)",
    insight: "主场作战优势明显，伊朗本届杯赛防线多次失位，美国中路渗透有效。",
  },
  "MEX-ECU": {
    homeWin: 48, draw: 28, awayWin: 24,
    xGoalsHome: 1.55, xGoalsAway: 1.12, confidenceScore: 62,
    rating: "BUY", ratingTarget: "大球 (总进球 ≥ 3)",
    insight: "墨西哥主场氛围极强，两队场均进球合计 2.8，大球价值突出。",
  },
  "ENG-MAR": {
    homeWin: 55, draw: 24, awayWin: 21,
    xGoalsHome: 1.79, xGoalsAway: 1.05, confidenceScore: 73,
    rating: "BUY", ratingTarget: "英格兰让球 -0.5",
    insight: "摩洛哥防反犀利，但英格兰前场深度更佳，中路控制优势明显。",
  },
  "POR-URU": {
    homeWin: 46, draw: 30, awayWin: 24,
    xGoalsHome: 1.62, xGoalsAway: 1.18, confidenceScore: 68,
    rating: "NEUTRAL", ratingTarget: "平局风险高，建议观望",
    insight: "乌拉圭防线纪律性极强，葡萄牙整体节奏难破密集防守。",
  },
  "GER-JPN": {
    homeWin: 60, draw: 22, awayWin: 18,
    xGoalsHome: 2.05, xGoalsAway: 1.10, confidenceScore: 75,
    rating: "BUY", ratingTarget: "德国让球 -0.5",
    insight: "日本速度反击有威胁，但德国中场压制力更强，进球效率高。",
  },
  "ESP-KOR": {
    homeWin: 67, draw: 19, awayWin: 14,
    xGoalsHome: 2.24, xGoalsAway: 0.81, confidenceScore: 81,
    rating: "STRONG_BUY", ratingTarget: "西班牙让球 -1.5",
    insight: "西班牙传控体系成熟，韩国本届杯赛中场保护存在漏洞。",
  },
  "NED-COL": {
    homeWin: 50, draw: 27, awayWin: 23,
    xGoalsHome: 1.71, xGoalsAway: 1.25, confidenceScore: 65,
    rating: "NEUTRAL", ratingTarget: "双方均有进球 (GG)",
    insight: "哥伦比亚中锋状态爆棚，荷兰防线曾在欧冠中出现连续失误。",
  },
  "BEL-AUS": {
    homeWin: 61, draw: 23, awayWin: 16,
    xGoalsHome: 1.98, xGoalsAway: 0.88, confidenceScore: 78,
    rating: "BUY", ratingTarget: "比利时让球 -0.5",
    insight: "澳大利亚体能消耗大，比利时中场创造力充足，上半场开门红可期。",
  },
  "WAL-URU": {
    homeWin: 28, draw: 30, awayWin: 42,
    xGoalsHome: 0.98, xGoalsAway: 1.65, confidenceScore: 71,
    rating: "BUY", ratingTarget: "乌拉圭客胜",
    insight: "威尔士防线老化，乌拉圭中锋状态火热，客场取胜赔率有价值。",
  },
};

// ─── 机构级详细分析数据库 ─────────────────────────────────────────────────────
// 仅对已重点研究的对局提供完整数据，其余对局在页面展示简化版

export const DETAILED_ANALYSIS: Record<string, DetailedAnalysis> = {
  "ENG-MAR": {
    marketHomeWin: 47, marketDraw: 26, marketAwayWin: 27,
    evPercent: 14.2,
    kellyFraction: 0.048,
    sharpeProxy: 1.34,
    homeStats: {
      form: ["W", "W", "D", "W", "W"],
      winRate5: 80, goalsFor: 2.4, goalsAgainst: 0.8,
      xGFor: 1.79, xGAgainst: 0.81, cleanSheets: 3, avgPossession: 58,
    },
    awayStats: {
      form: ["W", "D", "W", "L", "W"],
      winRate5: 60, goalsFor: 1.4, goalsAgainst: 1.2,
      xGFor: 1.31, xGAgainst: 1.05, cleanSheets: 1, avgPossession: 44,
    },
    h2h: { homeWins: 4, draws: 1, awayWins: 1, totalGames: 6 },
    modelVersion: "v0.1-MVP",
    dataAsOf: "2026-06-28",
  },
  "GER-JPN": {
    marketHomeWin: 53, marketDraw: 24, marketAwayWin: 23,
    evPercent: 9.6,
    kellyFraction: 0.032,
    sharpeProxy: 1.08,
    homeStats: {
      form: ["W", "D", "W", "W", "D"],
      winRate5: 60, goalsFor: 2.1, goalsAgainst: 1.0,
      xGFor: 2.05, xGAgainst: 0.92, cleanSheets: 2, avgPossession: 61,
    },
    awayStats: {
      form: ["W", "L", "W", "W", "D"],
      winRate5: 60, goalsFor: 1.6, goalsAgainst: 1.4,
      xGFor: 1.41, xGAgainst: 1.10, cleanSheets: 1, avgPossession: 47,
    },
    h2h: { homeWins: 5, draws: 2, awayWins: 1, totalGames: 8 },
    modelVersion: "v0.1-MVP",
    dataAsOf: "2026-06-28",
  },
  "ESP-KOR": {
    marketHomeWin: 60, marketDraw: 22, marketAwayWin: 18,
    evPercent: 18.7,
    kellyFraction: 0.071,
    sharpeProxy: 1.82,
    homeStats: {
      form: ["W", "W", "W", "D", "W"],
      winRate5: 80, goalsFor: 2.8, goalsAgainst: 0.6,
      xGFor: 2.24, xGAgainst: 0.68, cleanSheets: 4, avgPossession: 67,
    },
    awayStats: {
      form: ["D", "W", "L", "D", "W"],
      winRate5: 40, goalsFor: 1.2, goalsAgainst: 1.6,
      xGFor: 1.04, xGAgainst: 1.31, cleanSheets: 0, avgPossession: 41,
    },
    h2h: { homeWins: 3, draws: 2, awayWins: 1, totalGames: 6 },
    modelVersion: "v0.1-MVP",
    dataAsOf: "2026-06-28",
  },
  "BRA-SUI": {
    marketHomeWin: 62, marketDraw: 21, marketAwayWin: 17,
    evPercent: 22.1,
    kellyFraction: 0.082,
    sharpeProxy: 2.04,
    homeStats: {
      form: ["W", "W", "W", "W", "D"],
      winRate5: 80, goalsFor: 2.6, goalsAgainst: 0.6,
      xGFor: 2.31, xGAgainst: 0.72, cleanSheets: 3, avgPossession: 59,
    },
    awayStats: {
      form: ["D", "W", "D", "L", "W"],
      winRate5: 40, goalsFor: 1.2, goalsAgainst: 1.0,
      xGFor: 1.08, xGAgainst: 0.95, cleanSheets: 2, avgPossession: 52,
    },
    h2h: { homeWins: 5, draws: 3, awayWins: 1, totalGames: 9 },
    modelVersion: "v0.1-MVP",
    dataAsOf: "2026-06-28",
  },
  "USA-IRI": {
    marketHomeWin: 45, marketDraw: 29, marketAwayWin: 26,
    evPercent: 10.3,
    kellyFraction: 0.038,
    sharpeProxy: 1.15,
    homeStats: {
      form: ["W", "D", "W", "L", "W"],
      winRate5: 60, goalsFor: 1.8, goalsAgainst: 1.2,
      xGFor: 1.64, xGAgainst: 1.01, cleanSheets: 1, avgPossession: 51,
    },
    awayStats: {
      form: ["L", "D", "W", "D", "L"],
      winRate5: 20, goalsFor: 1.0, goalsAgainst: 1.8,
      xGFor: 1.12, xGAgainst: 1.44, cleanSheets: 0, avgPossession: 42,
    },
    h2h: { homeWins: 2, draws: 1, awayWins: 1, totalGames: 4 },
    modelVersion: "v0.1-MVP",
    dataAsOf: "2026-06-28",
  },
};
