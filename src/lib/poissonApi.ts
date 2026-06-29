/**
 * firsttouch-model 泊松预测服务客户端
 * ───────────────────────────────────────────────────────────
 * 本地开发时指向 http://localhost:8000
 * 生产环境通过 NEXT_PUBLIC_MODEL_API_URL 环境变量覆盖
 */

const MODEL_BASE_URL =
  process.env.NEXT_PUBLIC_MODEL_API_URL ?? "http://localhost:8000";

// ─── 请求类型 ────────────────────────────────────────────────────────────────

export interface TeamInput {
  name: string;
  attack_rating?: number;   // 默认 1.0
  defense_rating?: number;  // 默认 1.0
  is_home?: boolean;
}

export interface PoissonPredictRequest {
  home: TeamInput;
  away: TeamInput;
  league_avg_goals?: number;    // 默认 1.35
  home_advantage?: number;      // 默认 1.25（中立场传 1.0）
  market_home_odds?: number;
  market_away_odds?: number;
  dixon_coles?: boolean;
}

// ─── 响应类型 ────────────────────────────────────────────────────────────────

export interface ScoreProb {
  home: number;
  away: number;
  probability: number;
}

export interface PoissonPredictResponse {
  home_win: number;
  draw: number;
  away_win: number;
  lambda_home: number;
  lambda_away: number;
  most_likely_score: string;
  most_likely_score_prob: number;
  over_2_5: number;
  btts: number;
  implied_home_odds: number;
  implied_draw_odds: number;
  implied_away_odds: number;
  kelly_home: number;
  kelly_away: number;
  top_scores: ScoreProb[];
  score_matrix_5x5: number[][];   // 5×5，单位 %（0-100）
  rating: "STRONG_BUY" | "BUY" | "NEUTRAL" | "AVOID";
  confidence_score: number;
}

// ─── 主调用函数 ───────────────────────────────────────────────────────────────

/**
 * 调用本地泊松模型 API。
 * 应在 Next.js Server Component 或 Server Action 中调用（API key 不暴露客户端）。
 */
export async function fetchPoissonPrediction(
  req: PoissonPredictRequest
): Promise<PoissonPredictResponse> {
  const res = await fetch(`${MODEL_BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
    // Server Component 中不缓存（每次最新预测）
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "unknown error");
    throw new Error(`Poisson API error ${res.status}: ${detail}`);
  }

  return res.json() as Promise<PoissonPredictResponse>;
}

/**
 * 健康检查，用于在 UI 中显示模型服务状态。
 */
export async function checkModelHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${MODEL_BASE_URL}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000), // 2 秒超时
    });
    return res.ok;
  } catch {
    return false;
  }
}
