/**
 * OddsPanel — 实时盘口数据 + Edge 分析面板
 * Server Component（直接调用 oddsApi，API key 不暴露）
 */

import { fetchMatchOdds, calcEdge } from "@/lib/oddsApi";

interface OddsPanelProps {
  homeTeam: string;
  awayTeam: string;
  modelHomeProb: number;  // 模型主胜概率 0-1
  modelDrawProb: number;
  modelAwayProb: number;
}

function EdgeBadge({ edge }: { edge: number }) {
  const color =
    edge >= 5  ? "var(--ft-green)" :
    edge >= 2  ? "rgba(0,92,56,0.7)" :
    edge <= -5 ? "var(--ft-red)" :
    "var(--ft-text-muted)";
  const label = edge >= 2 ? `+${edge}%` : `${edge}%`;
  return (
    <span className="font-mono text-[11px] font-bold" style={{ color }}>
      {label}
    </span>
  );
}

function OddsRow({
  label,
  modelProb,
  consensusOdds,
  bookmakerRows,
}: {
  label: string;
  modelProb: number;
  consensusOdds: number;
  bookmakerRows: { name: string; odds: number }[];
}) {
  const edge = calcEdge(modelProb, consensusOdds);
  const hasEdge = edge >= 2;

  return (
    <div
      className="px-5 py-4"
      style={{
        borderBottom: "1px solid var(--ft-divider)",
        borderLeft: hasEdge ? "3px solid var(--ft-green)" : "3px solid transparent",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-semibold" style={{ color: "var(--ft-navy)" }}>
          {label}
        </span>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="ft-label mb-0.5">模型概率</p>
            <p className="font-mono text-sm font-bold" style={{ color: "var(--ft-navy)" }}>
              {Math.round(modelProb * 100)}%
            </p>
          </div>
          <div className="text-right">
            <p className="ft-label mb-0.5">市场隐含</p>
            <p className="font-mono text-sm font-bold" style={{ color: "var(--ft-text-muted)" }}>
              {Math.round((1 / consensusOdds) * 100)}%
            </p>
          </div>
          <div className="text-right">
            <p className="ft-label mb-0.5">Edge</p>
            <EdgeBadge edge={edge} />
          </div>
        </div>
      </div>

      {/* 各庄赔率 */}
      <div className="flex flex-wrap gap-2">
        {bookmakerRows.map(({ name, odds }) => (
          <div
            key={name}
            className="flex items-center gap-1.5 px-2.5 py-1"
            style={{ border: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-panel)" }}
          >
            <span className="ft-label">{name}</span>
            <span className="font-mono text-[12px] font-bold" style={{ color: "var(--ft-navy)" }}>
              {odds.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 主组件（async Server Component）─────────────────────────────────────────

export default async function OddsPanel({
  homeTeam,
  awayTeam,
  modelHomeProb,
  modelDrawProb,
  modelAwayProb,
}: OddsPanelProps) {
  const odds = await fetchMatchOdds(homeTeam, awayTeam);

  if (!odds) {
    return (
      <div
        className="px-5 py-6 text-center"
        style={{ border: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-section)" }}
      >
        <p className="ft-label">实时盘口暂未上线</p>
        <p className="mt-1 text-[12px]" style={{ color: "var(--ft-text-dim)" }}>
          赛前 24–48 小时赔率通常开放 · 由 The Odds API 提供
        </p>
      </div>
    );
  }

  const { consensus, bookmakers } = odds;
  if (!consensus) return null;

  const rows = [
    {
      label: `主胜 · ${homeTeam}`,
      modelProb: modelHomeProb,
      consensusOdds: consensus.homeWin,
      bookmakerRows: bookmakers.map((b) => ({ name: b.bookmaker, odds: b.homeWin })),
    },
    {
      label: "平局",
      modelProb: modelDrawProb,
      consensusOdds: consensus.draw,
      bookmakerRows: bookmakers.map((b) => ({ name: b.bookmaker, odds: b.draw })),
    },
    {
      label: `客胜 · ${awayTeam}`,
      modelProb: modelAwayProb,
      consensusOdds: consensus.awayWin,
      bookmakerRows: bookmakers.map((b) => ({ name: b.bookmaker, odds: b.awayWin })),
    },
  ];

  return (
    <div style={{ border: "1px solid var(--ft-border)" }}>
      {/* 面板标题 */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-section)" }}
      >
        <p className="ft-label">MARKET ODDS · 实时盘口</p>
        <div className="flex items-center gap-3">
          <span className="ft-label">
            {bookmakers.length} 家博彩 · {odds.remainingCredits} credits 剩余
          </span>
          <span
            className="font-mono text-[9px] px-2 py-0.5 font-bold uppercase"
            style={{ backgroundColor: "rgba(0,92,56,0.08)", color: "var(--ft-green)", border: "1px solid rgba(0,92,56,0.2)" }}
          >
            LIVE
          </span>
        </div>
      </div>

      {/* Edge 说明条 */}
      <div
        className="px-5 py-2.5 flex items-center gap-2"
        style={{ borderBottom: "1px solid var(--ft-divider)", backgroundColor: "var(--ft-bg-panel)" }}
      >
        <span className="ft-label">
          Edge = 模型概率 − 市场隐含概率 · 绿色左边框 = 正期望机会（Edge ≥ 2%）
        </span>
      </div>

      {rows.map((r) => <OddsRow key={r.label} {...r} />)}

      <div className="px-5 py-2.5"
        style={{ backgroundColor: "var(--ft-bg-section)", borderTop: "1px solid var(--ft-divider)" }}>
        <p className="ft-label" style={{ color: "var(--ft-text-dim)" }}>
          Data: The Odds API · EU region · 30 min cache · Not betting advice
        </p>
      </div>
    </div>
  );
}
