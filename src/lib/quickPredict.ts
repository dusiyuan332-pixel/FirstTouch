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

  // λ = attack × (1 / opponent_defense) × avg
  const lh = home.attack * (1 / away.defense) * AVG_GOALS;
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
    insight: "基于攻防指数的量化模型预测（轻量版）",
  };
}
