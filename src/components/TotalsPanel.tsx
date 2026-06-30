/**
 * TotalsPanel — 大小球赔率 + 泊松模型 Edge 分析
 *
 * 数据来源：The Odds API（与 h2h 同一请求，零额外 credit 消耗）
 * 模型概率：基于泊松分布 P(total goals > line)
 */

import { fetchMatchOdds } from "@/lib/oddsApi";

interface Props {
  homeTeam: string;
  awayTeam: string;
  /** 泊松模型预期进球（主队） */
  xGoalsHome: number;
  /** 泊松模型预期进球（客队） */
  xGoalsAway: number;
}

// ─── 泊松工具 ─────────────────────────────────────────────────────────────────

/** P(X = k) for Poisson(λ) */
function poissonPMF(lambda: number, k: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let result = Math.exp(-lambda);
  for (let i = 1; i <= k; i++) result = (result * lambda) / i;
  return result;
}

/** P(total goals > line) — line 通常是 x.5，so P(> 2.5) = P(≥ 3) */
function overProbability(totalXG: number, line: number): number {
  const maxUnder = Math.floor(line); // 2.5 → 2
  let cumUnder = 0;
  for (let k = 0; k <= maxUnder; k++) cumUnder += poissonPMF(totalXG, k);
  return Math.max(0, Math.min(1, 1 - cumUnder));
}

// ─── 子组件 ───────────────────────────────────────────────────────────────────

function EdgeBadge({ edge }: { edge: number }) {
  const abs = Math.abs(edge);
  const color =
    edge >= 5  ? "var(--ft-green)" :
    edge >= 2  ? "rgba(0,92,56,0.75)" :
    edge <= -5 ? "#b01c1c" :
    edge <= -2 ? "rgba(176,28,28,0.75)" :
    "var(--ft-text-muted)";
  return (
    <span className="font-mono text-[11px] font-bold" style={{ color }}>
      {edge > 0 ? "+" : ""}{edge}%
      {abs >= 2 && (
        <span className="ml-1 text-[9px]">{edge >= 2 ? "▲" : "▼"}</span>
      )}
    </span>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

export default async function TotalsPanel({
  homeTeam,
  awayTeam,
  xGoalsHome,
  xGoalsAway,
}: Props) {
  const oddsData = await fetchMatchOdds(homeTeam, awayTeam);
  const totals = oddsData?.totals ?? null;

  const totalXG  = Math.round((xGoalsHome + xGoalsAway) * 100) / 100;

  const CARD   = { border: "1px solid var(--ft-border)" } as const;
  const HEADER = { borderBottom: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-section)" } as const;
  const PANEL  = { border: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-panel)" } as const;

  // ── 若无市场数据，仅展示模型 xG ──────────────────────────────────────────────
  if (!totals || !totals.consensus) {
    return (
      <div style={CARD}>
        <div className="flex items-center justify-between flex-wrap gap-2 px-5 py-3" style={HEADER}>
          <p className="ft-label">大小球 · Over / Under</p>
          <span className="ft-label text-[11px]" style={{ color: "var(--ft-text-dim)" }}>
            The Odds API · 盘口暂未上线
          </span>
        </div>
        <div className="px-5 py-5">
          <div
            className="flex items-center justify-between px-4 py-3"
            style={PANEL}
          >
            <div>
              <p className="ft-label mb-1">泊松模型预期总进球</p>
              <p className="font-mono text-2xl font-black" style={{ color: "var(--ft-navy)" }}>
                {totalXG}
              </p>
              <p className="ft-label text-[11px] mt-0.5">
                主 {xGoalsHome} + 客 {xGoalsAway}
              </p>
            </div>
            <div className="text-right">
              <p className="ft-label mb-1">P(Over 2.5)</p>
              <p className="font-mono text-2xl font-black" style={{ color: "var(--ft-navy)" }}>
                {Math.round(overProbability(totalXG, 2.5) * 100)}%
              </p>
              <p className="ft-label text-[11px] mt-0.5">泊松分布计算</p>
            </div>
          </div>
          <p className="ft-label mt-3 text-center" style={{ color: "var(--ft-text-dim)" }}>
            赛前 24–48h 市场赔率开放后将自动补全对比分析
          </p>
        </div>
      </div>
    );
  }

  const line = totals.line;
  const c    = totals.consensus;

  // 模型概率
  const modelOverProb  = overProbability(totalXG, line);
  const modelUnderProb = 1 - modelOverProb;

  // Edge（百分点，保留 1 位小数）
  const marketOverImplied  = c.overImplied  / 100;
  const marketUnderImplied = c.underImplied / 100;
  const edgeOver  = Math.round((modelOverProb  - marketOverImplied)  * 1000) / 10;
  const edgeUnder = Math.round((modelUnderProb - marketUnderImplied) * 1000) / 10;

  const hasOverEdge  = edgeOver  >= 2;
  const hasUnderEdge = edgeUnder >= 2;

  return (
    <div style={CARD}>
      {/* 标题 */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3" style={HEADER}>
        <p className="ft-label">大小球 · Over / Under {line}</p>
        <div className="flex items-center gap-3">
          <span className="ft-label hidden sm:inline">
            {totals.bookmakers.length} 家博彩
          </span>
          <span
            className="font-mono text-[9px] px-2 py-0.5 font-bold uppercase"
            style={{ backgroundColor: "rgba(0,92,56,0.08)", color: "var(--ft-green)", border: "1px solid rgba(0,92,56,0.2)" }}
          >
            LIVE
          </span>
        </div>
      </div>

      {/* Edge 说明 */}
      <div
        className="px-5 py-2"
        style={{ borderBottom: "1px solid var(--ft-divider)", backgroundColor: "var(--ft-bg-panel)" }}
      >
        <p className="ft-label text-[11px]">
          Edge = 泊松模型概率 − 市场隐含概率 · 绿色左边框 = 正期望（Edge ≥ 2%）
        </p>
      </div>

      {/* Over 行 */}
      <div
        className="px-5 py-4"
        style={{
          borderBottom: "1px solid var(--ft-divider)",
          borderLeft: hasOverEdge ? "3px solid var(--ft-green)" : "3px solid transparent",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <span className="text-[13px] font-semibold" style={{ color: "var(--ft-navy)" }}>
              Over {line}
            </span>
            <span className="ml-2 ft-label">大球 · 总进球超过 {line}</span>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="ft-label mb-0.5">泊松模型</p>
              <p className="font-mono text-sm font-bold" style={{ color: "var(--ft-navy)" }}>
                {Math.round(modelOverProb * 100)}%
              </p>
            </div>
            <div className="text-right">
              <p className="ft-label mb-0.5">市场隐含</p>
              <p className="font-mono text-sm font-bold" style={{ color: "var(--ft-text-muted)" }}>
                {c.overImplied}%
              </p>
            </div>
            <div className="text-right">
              <p className="ft-label mb-0.5">Edge</p>
              <EdgeBadge edge={edgeOver} />
            </div>
          </div>
        </div>
        {/* 各庄 Over 赔率 */}
        <div className="flex flex-wrap gap-2">
          {totals.bookmakers.map((b) => (
            <div
              key={b.bookmaker}
              className="flex items-center gap-1.5 px-2.5 py-1"
              style={{ border: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-panel)" }}
            >
              <span className="ft-label">{b.bookmaker}</span>
              <span className="font-mono text-[12px] font-bold" style={{ color: "var(--ft-navy)" }}>
                {b.overOdds.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Under 行 */}
      <div
        className="px-5 py-4"
        style={{
          borderBottom: "1px solid var(--ft-divider)",
          borderLeft: hasUnderEdge ? "3px solid var(--ft-green)" : "3px solid transparent",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <span className="text-[13px] font-semibold" style={{ color: "var(--ft-navy)" }}>
              Under {line}
            </span>
            <span className="ml-2 ft-label">小球 · 总进球不超过 {line}</span>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="ft-label mb-0.5">泊松模型</p>
              <p className="font-mono text-sm font-bold" style={{ color: "var(--ft-navy)" }}>
                {Math.round(modelUnderProb * 100)}%
              </p>
            </div>
            <div className="text-right">
              <p className="ft-label mb-0.5">市场隐含</p>
              <p className="font-mono text-sm font-bold" style={{ color: "var(--ft-text-muted)" }}>
                {c.underImplied}%
              </p>
            </div>
            <div className="text-right">
              <p className="ft-label mb-0.5">Edge</p>
              <EdgeBadge edge={edgeUnder} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {totals.bookmakers.map((b) => (
            <div
              key={b.bookmaker}
              className="flex items-center gap-1.5 px-2.5 py-1"
              style={{ border: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-panel)" }}
            >
              <span className="ft-label">{b.bookmaker}</span>
              <span className="font-mono text-[12px] font-bold" style={{ color: "var(--ft-navy)" }}>
                {b.underOdds.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 模型 xG 摘要 */}
      <div
        className="grid grid-cols-3 gap-px"
        style={{ backgroundColor: "var(--ft-border)", borderTop: "1px solid var(--ft-border)" }}
      >
        {[
          { label: "主队 xG",  value: xGoalsHome.toFixed(2), sub: "泊松期望" },
          { label: "总 xG",    value: totalXG.toFixed(2),    sub: `P(Over ${line}) = ${Math.round(modelOverProb * 100)}%` },
          { label: "客队 xG",  value: xGoalsAway.toFixed(2), sub: "泊松期望" },
        ].map((m) => (
          <div
            key={m.label}
            className="flex flex-col items-center gap-1 py-3"
            style={{ backgroundColor: "var(--ft-bg-section)" }}
          >
            <p className="ft-label text-[10px]">{m.label}</p>
            <p className="font-mono text-base font-bold" style={{ color: "var(--ft-navy)" }}>
              {m.value}
            </p>
            <p className="ft-label text-[10px] text-center">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* 底注 */}
      <div
        className="px-5 py-2"
        style={{ borderTop: "1px solid var(--ft-divider)", backgroundColor: "var(--ft-bg-section)" }}
      >
        <p className="ft-label" style={{ color: "var(--ft-text-dim)" }}>
          Data: The Odds API · EU · 30 min cache · Model: Poisson Distribution · Not betting advice
        </p>
      </div>
    </div>
  );
}
