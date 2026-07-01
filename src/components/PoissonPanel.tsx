/**
 * PoissonPanel — 实时泊松预测面板（白底机构风）
 * 架构：<PoissonPanel> 包含 <Suspense> → <PoissonFetcher>（async Server Component）
 * 数据源：localhost:8000/predict（firsttouch-model FastAPI 服务）
 */

import { Suspense } from "react";
import { fetchPoissonPrediction, type PoissonPredictResponse } from "@/lib/poissonApi";
import { getRating } from "@/data/teamRatings";
import type { DisplayMatch } from "@/lib/footballDataApi";

// ─── 设计令牌（白底）────────────────────────────────────────────────────────────

const CARD_STYLE = {
  border: "1px solid var(--ft-border)",
  backgroundColor: "var(--ft-bg-card)",
} as const;

const HEADER_STYLE = {
  borderBottom: "1px solid var(--ft-divider)",
  backgroundColor: "var(--ft-bg-section)",
} as const;

const PANEL_STYLE = {
  backgroundColor: "var(--ft-bg-panel)",
  border: "1px solid var(--ft-border)",
} as const;

// 数据色（针对白底优化）
const C_HOME  = "#0055a5";   // 主队蓝（深）
const C_AWAY  = "#b01c1c";   // 客队红（深）
const C_GREEN = "#005c38";   // 正收益绿

// 热力图（白底）
function heatCell(pct: number): { bg: string; color: string } {
  if (pct >= 12) return { bg: "rgba(0, 92, 56, 0.10)",   color: "#005c38" };
  if (pct >= 7)  return { bg: "rgba(0, 85, 165, 0.10)",  color: "#0055a5" };
  if (pct >= 3)  return { bg: "rgba(0, 40, 85, 0.04)",   color: "#4a6278" };
  return { bg: "transparent", color: "#8a9eae" };
}

// ── 骨架屏 ────────────────────────────────────────────────────────────────────

export function PoissonSkeleton() {
  return (
    <div className="space-y-4">
      <div style={CARD_STYLE}>
        <div className="h-10 animate-pulse px-5 py-3" style={HEADER_STYLE} />
        <div className="px-5 py-4 space-y-4">
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-8 animate-pulse ${i === 2 ? "flex-1" : "w-14"}`}
                style={{ backgroundColor: "var(--ft-bg-panel)" }} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-16 animate-pulse"
                style={{ backgroundColor: "var(--ft-bg-panel)" }} />
            ))}
          </div>
          <div className="h-1.5 w-full animate-pulse" style={{ backgroundColor: "var(--ft-bg-panel)" }} />
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse"
                style={{ backgroundColor: "var(--ft-bg-panel)" }} />
            ))}
          </div>
        </div>
      </div>

      <div style={CARD_STYLE}>
        <div className="h-10 animate-pulse px-5 py-3" style={HEADER_STYLE} />
        <div className="px-5 py-4">
          <table className="w-full text-center text-xs border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="w-12" />
                {[0,1,2,3,4].map((a) => (
                  <th key={a} className="w-16">
                    <div className="mx-auto h-3 w-5 animate-pulse" style={{ backgroundColor: "var(--ft-bg-panel)" }} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[0,1,2,3,4].map((h) => (
                <tr key={h}>
                  <td className="pr-2">
                    <div className="ml-auto h-3 w-5 animate-pulse" style={{ backgroundColor: "var(--ft-bg-panel)" }} />
                  </td>
                  {[0,1,2,3,4].map((a) => (
                    <td key={a}>
                      <div className="h-9 animate-pulse"
                        style={{ backgroundColor: "var(--ft-bg-panel)", animationDelay: `${(h*5+a)*25}ms` }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── 错误视图 ──────────────────────────────────────────────────────────────────

function PoissonError({ message, homeCode, awayCode }: {
  message: string; homeCode: string; awayCode: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-14 text-center"
      style={{ border: "1px dashed var(--ft-border)", backgroundColor: "var(--ft-bg-section)" }}>
      <p className="text-sm font-semibold" style={{ color: "var(--ft-amber)" }}>
        Python 模型服务离线
      </p>
      <p className="max-w-sm text-[13px] leading-relaxed" style={{ color: "var(--ft-text-muted)" }}>
        {message}
      </p>
      <code className="px-3 py-2 font-mono text-[11px]"
        style={{ backgroundColor: "var(--ft-bg-panel)", color: "var(--ft-navy)", border: "1px solid var(--ft-border)" }}>
        cd ~/Projects/firsttouch-model && uvicorn main:app --reload --port 8000
      </code>
      <p className="ft-label">{homeCode} vs {awayCode} · ratings loaded, waiting for model</p>
    </div>
  );
}

// ── 评分来源徽章 ───────────────────────────────────────────────────────────────

function RatingBadge({ code, found }: { code: string; found: boolean }) {
  return (
    <span
      title={found ? `${code}：已命中预置评分库` : `${code}：使用默认评分 (atk 1.2 / def 1.2)`}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-[9px] font-semibold"
      style={{
        backgroundColor: found ? "rgba(0,92,56,0.08)" : "rgba(122,82,0,0.08)",
        color: found ? C_GREEN : "var(--ft-amber)",
        border: `1px solid ${found ? "rgba(0,92,56,0.15)" : "rgba(122,82,0,0.15)"}`,
      }}
    >
      {found ? "✓" : "~"} {code}
    </span>
  );
}

// ── 成功数据渲染 ──────────────────────────────────────────────────────────────

const RATING_META_LIGHT = {
  STRONG_BUY: { label: "强烈买入", color: C_GREEN },
  BUY:        { label: "买入",     color: C_GREEN },
  NEUTRAL:    { label: "中性",     color: "var(--ft-amber)" },
  AVOID:      { label: "回避",     color: C_AWAY },
} as const;

function PoissonResult({
  result, match, homeFound, awayFound,
}: {
  result: PoissonPredictResponse;
  match: DisplayMatch;
  homeFound: boolean;
  awayFound: boolean;
}) {
  const homeName = match.homeTeam.nameZh || match.homeTeam.code;
  const awayName = match.awayTeam.nameZh || match.awayTeam.code;
  const homeCode = match.homeTeam.code ?? "H";
  const awayCode = match.awayTeam.code ?? "A";

  const homeWinPct = Math.round(result.home_win * 100);
  const drawPct    = Math.round(result.draw * 100);
  const awayWinPct = Math.round(result.away_win * 100);
  const homeXG = result.lambda_home;
  const awayXG = result.lambda_away;
  const totalXG = homeXG + awayXG;
  const homeRatio = (homeXG / totalXG) * 100;

  const ratingMeta = RATING_META_LIGHT[result.rating as keyof typeof RATING_META_LIGHT]
    ?? RATING_META_LIGHT.NEUTRAL;

  return (
    <div className="space-y-4">
      {/* ── xG + 概率 ── */}
      <div style={CARD_STYLE}>
        <div className="flex items-center justify-between flex-wrap gap-2 px-5 py-3" style={HEADER_STYLE}>
          <span className="ft-label">xG · Expected Goals · Python Model</span>
          <div className="flex items-center gap-2">
            <RatingBadge code={homeCode} found={homeFound} />
            <RatingBadge code={awayCode} found={awayFound} />
            <span className="ft-label" style={{ color: C_GREEN }}>LIVE MODEL</span>
          </div>
        </div>

        <div className="px-3 md:px-5 py-4 md:py-6 space-y-5 md:space-y-6">
          {/* λ 值条 */}
          <div>
            <div className="flex items-center gap-4 mb-2">
              <span className="w-16 text-right font-mono text-2xl font-black tabular-nums"
                style={{ color: C_HOME }}>{homeXG.toFixed(2)}</span>
              <div className="flex h-1.5 flex-1 overflow-hidden"
                style={{ backgroundColor: "var(--ft-bg-panel)" }}>
                <div style={{ width: `${homeRatio}%`, backgroundColor: C_HOME, transition: "width 0.7s" }} />
                <div style={{ width: `${100 - homeRatio}%`, backgroundColor: C_AWAY, transition: "width 0.7s" }} />
              </div>
              <span className="w-16 font-mono text-2xl font-black tabular-nums"
                style={{ color: C_AWAY }}>{awayXG.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="ft-label" style={{ color: C_HOME }}>{homeName}</span>
              <span className="ft-label">Total {totalXG.toFixed(2)} xG</span>
              <span className="ft-label" style={{ color: C_AWAY }}>{awayName}</span>
            </div>
          </div>

          {/* 大球 / BTTS */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "总进球 ≥ 2.5",     value: `${Math.round(result.over_2_5 * 100)}%` },
              { label: "双方均进球 BTTS", value: `${Math.round(result.btts * 100)}%` },
            ].map((item) => (
              <div key={item.label} className="px-4 py-4 text-center" style={PANEL_STYLE}>
                <p className="font-mono text-xl font-bold" style={{ color: "var(--ft-navy)" }}>{item.value}</p>
                <p className="ft-label mt-1">{item.label}</p>
              </div>
            ))}
          </div>

          {/* 胜平负概率 */}
          <div style={{ borderTop: "1px solid var(--ft-divider)", paddingTop: "20px" }}>
            <div className="flex h-1.5 overflow-hidden mb-3"
              style={{ backgroundColor: "var(--ft-bg-panel)" }}>
              <div style={{ width: `${homeWinPct}%`, backgroundColor: C_HOME, transition: "width 0.7s" }} />
              <div style={{ width: `${drawPct}%`, backgroundColor: "var(--ft-text-dim)" }} />
              <div style={{ width: `${awayWinPct}%`, backgroundColor: C_AWAY, transition: "width 0.7s" }} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: homeCode, sub: "主胜", value: `${homeWinPct}%`, color: C_HOME },
                { label: "平局",   sub: "Draw",  value: `${drawPct}%`,   color: "var(--ft-text-muted)" },
                { label: awayCode, sub: "客胜", value: `${awayWinPct}%`, color: C_AWAY },
              ].map(({ label, sub, value, color }) => (
                <div key={label} className="py-4 text-center" style={PANEL_STYLE}>
                  <p className="font-mono text-2xl font-black tabular-nums" style={{ color }}>{value}</p>
                  <p className="ft-label mt-1">{label} · {sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 最可能比分 + 评级 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-4" style={PANEL_STYLE}>
            <div>
              <p className="ft-label mb-1.5">最可能比分</p>
              <p className="font-mono text-3xl font-black tabular-nums" style={{ color: "var(--ft-navy)" }}>
                {result.most_likely_score}
                <span className="ml-2 text-base font-normal" style={{ color: "var(--ft-text-muted)" }}>
                  ({(result.most_likely_score_prob * 100).toFixed(1)}%)
                </span>
              </p>
            </div>
            <div className="sm:text-right">
              <p className="ft-label mb-1.5">模型评级</p>
              <p className="font-mono text-xl font-bold" style={{ color: ratingMeta.color }}>
                {ratingMeta.label}
              </p>
              <p className="ft-label mt-0.5">置信度 {result.confidence_score.toFixed(1)} / 100</p>
            </div>
          </div>

          {/* Kelly 建议 */}
          {(result.kelly_home > 0 || result.kelly_away > 0) && (
            <div className="px-5 py-4" style={{ ...PANEL_STYLE, borderLeft: `3px solid ${C_GREEN}` }}>
              <p className="ft-label mb-3">Half-Kelly 仓位建议</p>
              <div className="flex gap-8">
                {result.kelly_home > 0 && (
                  <div>
                    <p className="font-mono text-lg font-bold" style={{ color: C_HOME }}>
                      {(result.kelly_home * 100).toFixed(1)}%
                    </p>
                    <p className="ft-label mt-0.5">主胜方向</p>
                  </div>
                )}
                {result.kelly_away > 0 && (
                  <div>
                    <p className="font-mono text-lg font-bold" style={{ color: C_AWAY }}>
                      {(result.kelly_away * 100).toFixed(1)}%
                    </p>
                    <p className="ft-label mt-0.5">客胜方向</p>
                  </div>
                )}
                <p className="ft-label ml-auto self-end">of Total Bankroll</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 比分概率矩阵 ── */}
      <div style={CARD_STYLE}>
        <div className="flex items-center justify-between px-5 py-3" style={HEADER_STYLE}>
          <span className="ft-label">Scoreline Probability Matrix · 比分概率矩阵</span>
          <span className="ft-label" style={{ color: C_GREEN }}>Poisson + Dixon-Coles</span>
        </div>
        <div className="px-3 md:px-5 py-4 md:py-5">
          <div className="overflow-x-auto -mx-3 md:mx-0 px-3 md:px-0">
            <table className="min-w-[320px] w-full text-center text-xs border-separate border-spacing-1">
              <thead>
                <tr>
                  <th className="w-12 text-right pr-2 ft-label">
                    {homeCode} ↓ / {awayCode} →
                  </th>
                  {[0,1,2,3,4].map((a) => (
                    <th key={a} className="w-16 font-mono text-[11px] font-semibold pb-2"
                      style={{ color: C_AWAY }}>{a}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.score_matrix_5x5.map((row, h) => (
                  <tr key={h}>
                    <td className="font-mono text-[11px] text-right pr-2 font-semibold"
                      style={{ color: C_HOME }}>{h}</td>
                    {row.map((pct, a) => {
                      const { bg, color } = heatCell(pct);
                      return (
                        <td key={a}
                          className="py-2 text-[11px] font-mono font-bold"
                          title={`${homeCode} ${h}-${a} ${awayCode}: ${pct.toFixed(2)}%`}
                          style={{ backgroundColor: bg, color }}>
                          {pct.toFixed(1)}%
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 ft-label text-center">
            深色格 = 高概率比分 · 世界杯中立场系数 1.0
          </p>
        </div>
      </div>
    </div>
  );
}

// WC2026 主办国享有本土主场加成
const HOST_NATIONS = new Set(["USA", "MEX", "CAN"]);

// ── 异步 fetcher ──────────────────────────────────────────────────────────────

async function PoissonFetcher({ match }: { match: DisplayMatch }) {
  const homeCode = match.homeTeam.code ?? "";
  const awayCode = match.awayTeam.code ?? "";
  const { rating: homeRating, found: homeFound } = getRating(homeCode);
  const { rating: awayRating,  found: awayFound  } = getRating(awayCode);

  // 主办国主场加成：美国/墨西哥/加拿大在 WC2026 享有真实主场效应
  const homeAdvantage = HOST_NATIONS.has(homeCode.toUpperCase()) ? 1.18 : 1.0;

  let result: PoissonPredictResponse | null = null;
  let error: string | null = null;

  try {
    result = await fetchPoissonPrediction({
      home: {
        name: match.homeTeam.name,
        attack_rating:  homeRating.attack,
        defense_rating: homeRating.defense,
      },
      away: {
        name: match.awayTeam.name,
        attack_rating:  awayRating.attack,
        defense_rating: awayRating.defense,
      },
      league_avg_goals: 1.1,
      home_advantage:   homeAdvantage,
    });
  } catch (e) {
    error = e instanceof Error ? e.message : "未知错误";
  }

  if (error || !result) {
    return <PoissonError message={error ?? "Python 模型服务未响应"} homeCode={homeCode} awayCode={awayCode} />;
  }

  return <PoissonResult result={result} match={match} homeFound={homeFound} awayFound={awayFound} />;
}

// ── 导出（带 Suspense）───────────────────────────────────────────────────────

export function PoissonPanel({ match }: { match: DisplayMatch }) {
  return (
    <Suspense fallback={<PoissonSkeleton />}>
      <PoissonFetcher match={match} />
    </Suspense>
  );
}
