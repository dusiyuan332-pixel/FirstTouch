/**
 * quickPredict.ts
 * ────────────────────────────────────────────────────────────────────────────
 * 服务端轻量级预测：不调用 Railway API，直接用 TEAM_RATINGS 在 Node.js 侧
 * 跑简化 Poisson，为赛程卡片生成评级徽章。
 *
 * 精度低于完整模型，但覆盖所有比赛、无网络延迟、部署不依赖 Railway。
 */

import { TEAM_RATINGS } from "@/data/teamRatings";
import type { MatchPrediction } from "@/lib/footballDataApi";

// ─── Poisson PMF（e^-λ * λ^k / k!）────────────────────────────────────────

function poissonPmf(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let logP = -lambda + k * Math.log(lambda);
  for (let i = 1; i <= k; i++) logP -= Math.log(i);
  return Math.exp(logP);
}

// WC2026 三个主办国在本土有真实主场优势
const HOST_NATIONS = new Set(["USA", "MEX", "CAN"]);

// ─── 动态 Insight 生成 ─────────────────────────────────────────────────────

function generateInsight(
  homeTla: string,
  awayTla: string,
  lh: number,
  la: number,
  homeWin: number,
  awayWin: number,
  draw: number,
  isHost: boolean,
): string {
  const xgDiff = lh - la;
  const homeWinPct  = Math.round(homeWin  * 100);
  const awayWinPct  = Math.round(awayWin  * 100);
  const drawPct     = Math.round(draw     * 100);

  if (xgDiff >= 0.8) {
    const hostNote = isHost ? "主场加成显著，" : "";
    return `${homeTla} xG 大幅领先（${lh.toFixed(2)} vs ${la.toFixed(2)}），${hostNote}主胜概率 ${homeWinPct}%。`;
  }
  if (xgDiff <= -0.8) {
    return `${awayTla} 进攻指数更高（xG ${la.toFixed(2)} vs ${lh.toFixed(2)}），客队具备主导实力，关注客胜赔率价值。`;
  }
  if (drawPct >= 32) {
    return `双方实力均衡，xG 差距仅 ${Math.abs(xgDiff).toFixed(2)}，平局概率 ${drawPct}% 不容忽视。`;
  }
  if (homeWinPct > awayWinPct + 12) {
    const hostNote = isHost ? "主场氛围加持，" : "";
    return `${homeTla} ${hostNote}进攻效率优于对手（xG ${lh.toFixed(2)} vs ${la.toFixed(2)}），主场优势明显。`;
  }
  if (awayWinPct > homeWinPct + 12) {
    return `${awayTla} 整体实力占优（xG ${la.toFixed(2)} vs ${lh.toFixed(2)}），量化模型倾向客队胜出。`;
  }
  return `势均力敌，xG ${lh.toFixed(2)} vs ${la.toFixed(2)}，建议结合实时盘口及状态综合研判。`;
}

// ─── 核心预测 ─────────────────────────────────────────────────────────────

export function computeQuickPrediction(
  homeTla: string,
  awayTla: string,
): MatchPrediction | null {
  const home = TEAM_RATINGS[homeTla];
  const away = TEAM_RATINGS[awayTla];
  if (!home || !away) return null;

  const AVG_GOALS = 1.1;   // 世界杯中立场均值
  const MAX_G = 6;

  // 主办国享有主场加成（WC2026：美国/墨西哥/加拿大）
  const isHost = HOST_NATIONS.has(homeTla.toUpperCase());
  const HOME_ADV = isHost ? 1.15 : 1.0;

  // λ = attack × (1 / opponent_defense) × avg × home_advantage
  const lh = home.attack * (1 / away.defense) * AVG_GOALS * HOME_ADV;
  const la = away.attack * (1 / home.defense) * AVG_GOALS;

  // 构建得分概率矩阵
  let homeWin = 0, draw = 0, awayWin = 0;
  for (let h = 0; h <= MAX_G; h++) {
    for (let a = 0; a <= MAX_G; a++) {
      const p = poissonPmf(h, lh) * poissonPmf(a, la);
      if (h > a) homeWin += p;
      else if (h === a) draw += p;
      else awayWin += p;
    }
  }

  // 归一化（截断矩阵损失的概率）
  const total = homeWin + draw + awayWin;
  homeWin /= total; draw /= total; awayWin /= total;

  // 评级：以主胜概率为主轴
  let rating: MatchPrediction["rating"];
  let ratingTarget: string;
  if (homeWin >= 0.55) {
    rating = "STRONG_BUY"; ratingTarget = "主胜";
  } else if (homeWin >= 0.45) {
    rating = "BUY"; ratingTarget = "主胜 (亚盘)";
  } else if (awayWin >= 0.45) {
    rating = "AVOID"; ratingTarget = "客胜";
  } else {
    rating = "NEUTRAL"; ratingTarget = "平局区间";
  }

  // 置信度：基于实力差
  const strengthDiff = Math.abs(
    (home.attack + home.defense) - (away.attack + away.defense)
  );
  const confidenceScore = Math.min(92, Math.round(58 + strengthDiff * 30));

  return {
    homeWin:  Math.round(homeWin  * 100),
    draw:     Math.round(draw     * 100),
    awayWin:  Math.round(awayWin  * 100),
    xGoalsHome: Math.round(lh * 100) / 100,
    xGoalsAway: Math.round(la * 100) / 100,
    confidenceScore,
    rating,
    ratingTarget,
    insight: generateInsight(homeTla, awayTla, lh, la, homeWin, awayWin, draw, isHost),
  };
}
