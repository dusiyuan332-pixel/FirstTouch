import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import { fetchMatchById, type DisplayMatch, type RatingType } from "@/lib/footballDataApi";
import { PREDICTIONS, DETAILED_ANALYSIS, type DetailedAnalysis } from "@/data/wc2026";
import { PoissonPanel } from "@/components/PoissonPanel";
import OddsPanel from "@/components/OddsPanel";
import H2HPanel from "@/components/H2HPanel";
import { fetchH2H } from "@/lib/h2hApi";
import { checkAnalystAccess } from "@/components/PaywallGate";
import LiveRefresher from "@/components/LiveRefresher";

// ─── 设计令牌（白底） ──────────────────────────────────────────────────────────

const C_HOME  = "#0055a5";
const C_AWAY  = "#b01c1c";
const C_GREEN = "#005c38";

const RATING_META: Record<RatingType, { label: string; color: string; bg: string; border: string }> = {
  STRONG_BUY: { label: "强烈买入", color: "#005c38", bg: "rgba(0,92,56,0.07)",   border: "rgba(0,92,56,0.2)"  },
  BUY:        { label: "买入",     color: "#006644", bg: "rgba(0,102,68,0.06)",  border: "rgba(0,102,68,0.15)" },
  NEUTRAL:    { label: "中性",     color: "#7a5200", bg: "rgba(122,82,0,0.07)",  border: "rgba(122,82,0,0.2)"  },
  AVOID:      { label: "回避",     color: "#b01c1c", bg: "rgba(176,28,28,0.07)", border: "rgba(176,28,28,0.2)" },
};

const CARD = { border: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-card)" } as const;
const PANEL = { border: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-panel)" } as const;
const HEADER = { borderBottom: "1px solid var(--ft-divider)", backgroundColor: "var(--ft-bg-section)" } as const;

// ══════════════════════════════════════════════════════════════════════════════
// 报告头部
// ══════════════════════════════════════════════════════════════════════════════

function ReportHeader({ match, detail }: { match: DisplayMatch; detail: DetailedAnalysis | null }) {
  const now = new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";
  const isLive = match.status === "live";

  return (
    <div style={CARD}>
      {/* 顶栏 */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-6 py-3" style={HEADER}>
        <div className="flex items-center gap-3">
          <span className="ft-label">Match Analysis Report</span>
          <span style={{ color: "var(--ft-text-dim)" }}>·</span>
          <span className="ft-label">{detail?.modelVersion ?? "v0.1-MVP"}</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="ft-label">Generated {now}</span>
          <LiveRefresher isLive={isLive} />
        </div>
      </div>

      {/* 对阵区 */}
      <div className="px-4 md:px-6 py-6 md:py-8">
        <div className="mb-5 flex flex-wrap items-center gap-2 md:gap-3">
          <span
            className="font-mono text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1.5"
            style={{ backgroundColor: "var(--ft-navy)", color: "#fff" }}
          >
            FIFA World Cup 2026
          </span>
          <span className="ft-label">{match.group ?? match.stage}</span>
          <span className="ml-auto ft-label">{match.time} UTC · {match.date}</span>
        </div>

        <div className="flex items-center justify-center gap-6 md:gap-12">
          {([
            { team: match.homeTeam, label: "HOME", color: C_HOME },
            null,
            { team: match.awayTeam, label: "AWAY", color: C_AWAY },
          ] as const).map((item, i) => {
            if (!item) {
              return (
                <div key="score" className="flex shrink-0 flex-col items-center gap-2">
                  {match.score ? (
                    <span
                      className="font-mono text-3xl md:text-5xl font-black tracking-tight tabular-nums"
                      style={{ color: "var(--ft-navy)" }}
                    >
                      {match.score.home}
                      <span style={{ color: "var(--ft-text-dim)", margin: "0 10px" }}>–</span>
                      {match.score.away}
                    </span>
                  ) : (
                    <span className="font-mono text-2xl font-bold" style={{ color: "var(--ft-text-dim)" }}>VS</span>
                  )}
                </div>
              );
            }
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-3 md:gap-4 text-center">
                <div className="relative h-12 w-12 md:h-16 md:w-16">
                  {item.team.crest ? (
                    <Image src={item.team.crest} alt={item.team.name} fill className="object-contain" sizes="64px" />
                  ) : (
                    <div
                      className="h-12 w-12 md:h-16 md:w-16 flex items-center justify-center font-mono text-sm font-bold"
                      style={{ backgroundColor: "var(--ft-bg-panel)", color: item.color, border: `1px solid ${item.color}30` }}
                    >
                      {item.team.code}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-base font-semibold" style={{ color: "var(--ft-navy)" }}>
                    {item.team.nameZh || item.team.name}
                  </p>
                  <p className="ft-label mt-1" style={{ color: item.color }}>{item.team.code} · {item.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 执行摘要
// ══════════════════════════════════════════════════════════════════════════════

function ExecutiveSummary({ match, detail }: { match: DisplayMatch; detail: DetailedAnalysis | null }) {
  const pred = match.prediction!;
  const meta = RATING_META[pred.rating];

  return (
    <div style={{ ...CARD, borderLeft: `3px solid ${meta.color}` }}>
      <div className="flex items-center gap-2 px-5 py-3" style={HEADER}>
        <span className="ft-label">Executive Summary · 核心建议</span>
      </div>
      <div className="px-5 py-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div
              className="flex flex-col items-center justify-center px-5 py-4 min-w-[90px]"
              style={{ backgroundColor: meta.bg, border: `1px solid ${meta.border}` }}
            >
              <span className="font-mono text-lg font-black tracking-wide" style={{ color: meta.color }}>
                {meta.label}
              </span>
              <span className="ft-label mt-1">Rating</span>
            </div>
            <div>
              <p className="ft-label mb-1.5">投资标的</p>
              <p className="text-sm font-semibold" style={{ color: meta.color }}>{pred.ratingTarget}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed max-w-sm" style={{ color: "var(--ft-text-muted)" }}>
                {pred.insight}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 md:gap-8 shrink-0">
            {[
              { label: "模型置信度", value: `${pred.confidenceScore}`, unit: "/ 100" },
              { label: "期望回报率", value: detail ? `+${detail.evPercent}` : "—", unit: "%", accent: true },
              { label: "Kelly 建议", value: detail ? `${(detail.kellyFraction * 100).toFixed(1)}` : "—", unit: "%" },
              { label: "夏普代理",  value: detail ? detail.sharpeProxy.toFixed(2) : "—" },
            ].map((m) => (
              <div key={m.label} className="flex flex-col items-center gap-1">
                <span
                  className="font-mono text-2xl font-bold tabular-nums"
                  style={{ color: m.accent ? meta.color : "var(--ft-navy)" }}
                >
                  {m.value}
                  {m.unit && <span className="text-sm font-normal ml-0.5" style={{ color: "var(--ft-text-muted)" }}>{m.unit}</span>}
                </span>
                <span className="ft-label text-center">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 市场价值差分析
// ══════════════════════════════════════════════════════════════════════════════

function EdgeAnalysis({ match, detail }: { match: DisplayMatch; detail: DetailedAnalysis }) {
  const pred = match.prediction!;
  const rows = [
    { label: "主队胜", model: pred.homeWin, market: detail.marketHomeWin },
    { label: "平 局", model: pred.draw,    market: detail.marketDraw },
    { label: "客队胜", model: pred.awayWin, market: detail.marketAwayWin },
  ];

  return (
    <div style={CARD}>
      <div className="px-5 py-3" style={HEADER}>
        <span className="ft-label">Probability · Edge Analysis · 市场价值差</span>
      </div>
      <div className="px-5 py-5 space-y-4">
        {/* 概率条 */}
        <div className="flex h-1.5 overflow-hidden" style={{ backgroundColor: "var(--ft-bg-panel)" }}>
          <div style={{ width: `${pred.homeWin}%`, backgroundColor: C_HOME, transition: "width 0.6s" }} />
          <div style={{ width: `${pred.draw}%`, backgroundColor: "var(--ft-text-dim)" }} />
          <div style={{ width: `${pred.awayWin}%`, backgroundColor: C_AWAY, transition: "width 0.6s" }} />
        </div>

        {/* 对比表 */}
        <table className="w-full text-[13px]" style={{ borderTop: "1px solid var(--ft-border)" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--ft-divider)" }}>
              {["结果", "模型概率", "市场隐含", "价值差 Edge"].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left ft-label">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ label, model, market }) => {
              const edge = model - market;
              const eColor = edge > 3 ? C_GREEN : edge < -3 ? C_AWAY : "var(--ft-text-muted)";
              const eIcon  = edge > 3 ? "▲" : edge < -3 ? "▼" : "—";
              return (
                <tr key={label} className="ft-row-hover" style={{ borderBottom: "1px solid var(--ft-divider)" }}>
                  <td className="px-3 py-3 font-medium" style={{ color: "var(--ft-text-muted)" }}>{label}</td>
                  <td className="px-3 py-3 font-mono font-bold" style={{ color: "var(--ft-navy)" }}>{model}%</td>
                  <td className="px-3 py-3 font-mono" style={{ color: "var(--ft-text-muted)" }}>{market}%</td>
                  <td className="px-3 py-3 font-mono font-bold" style={{ color: eColor }}>
                    {eIcon} {edge > 0 ? "+" : ""}{edge}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p className="ft-label">价值差 &gt; +3% 视为正向边际。模型概率基于泊松回归 + 历史赔率校正。</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 球队情报对比
// ══════════════════════════════════════════════════════════════════════════════

function FormDot({ r }: { r: "W" | "D" | "L" }) {
  const bg = r === "W" ? "#005c38" : r === "D" ? "#7a5200" : C_AWAY;
  return (
    <span
      className="inline-block h-3 w-3"
      style={{ backgroundColor: bg }}
      title={r}
    />
  );
}

function TeamIntelligence({ match, detail }: { match: DisplayMatch; detail: DetailedAnalysis }) {
  const { homeStats: hs, awayStats: as_, h2h } = detail;

  const metrics = [
    { label: "近5场胜率",    home: `${hs.winRate5}%`, away: `${as_.winRate5}%`, homeWins: hs.winRate5 > as_.winRate5 },
    { label: "场均进球 GF",  home: hs.goalsFor,       away: as_.goalsFor,       homeWins: hs.goalsFor > as_.goalsFor },
    { label: "场均失球 GA",  home: hs.goalsAgainst,   away: as_.goalsAgainst,   homeWins: hs.goalsAgainst < as_.goalsAgainst },
    { label: "xG / 场",      home: hs.xGFor,          away: as_.xGFor,          homeWins: hs.xGFor > as_.xGFor },
    { label: "xGA / 场",     home: hs.xGAgainst,      away: as_.xGAgainst,      homeWins: hs.xGAgainst < as_.xGAgainst },
    { label: "零封场数",     home: hs.cleanSheets,    away: as_.cleanSheets,    homeWins: hs.cleanSheets > as_.cleanSheets },
    { label: "控球率",       home: `${hs.avgPossession}%`, away: `${as_.avgPossession}%`, homeWins: hs.avgPossession > as_.avgPossession },
  ];

  return (
    <div style={CARD}>
      <div className="px-5 py-3" style={HEADER}>
        <span className="ft-label">Team Intelligence · 球队情报对比</span>
      </div>
      <div className="px-5 py-5 space-y-5">
        {/* 近5场状态 */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { team: match.homeTeam, stats: hs, color: C_HOME },
            { team: match.awayTeam, stats: as_, color: C_AWAY },
          ].map(({ team, stats, color }) => (
            <div key={team.code} className="px-4 py-4" style={PANEL}>
              <div className="flex items-center gap-2 mb-3">
                {team.crest && (
                  <div className="relative h-5 w-5">
                    <Image src={team.crest} alt={team.name} fill className="object-contain" sizes="20px" />
                  </div>
                )}
                <span className="text-[13px] font-semibold" style={{ color: "var(--ft-navy)" }}>
                  {team.nameZh || team.name}
                </span>
                <span className="ft-label ml-auto" style={{ color }}>近5场</span>
              </div>
              <div className="flex gap-1.5">
                {stats.form.map((r, i) => <FormDot key={i} r={r} />)}
              </div>
            </div>
          ))}
        </div>

        {/* 指标表 */}
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--ft-border)" }}>
              <th className="px-3 py-2.5 text-left ft-label" style={{ color: C_HOME }}>
                {match.homeTeam.code}
              </th>
              <th className="px-3 py-2.5 text-center ft-label">指标</th>
              <th className="px-3 py-2.5 text-right ft-label" style={{ color: C_AWAY }}>
                {match.awayTeam.code}
              </th>
            </tr>
          </thead>
          <tbody>
            {metrics.map(({ label, home, away, homeWins }) => (
              <tr key={label} className="ft-row-hover" style={{ borderBottom: "1px solid var(--ft-divider)" }}>
                <td className="px-3 py-2.5 font-mono font-bold" style={{ color: homeWins ? C_GREEN : "var(--ft-navy)" }}>
                  {String(home)}
                </td>
                <td className="px-3 py-2.5 text-center ft-label">{label}</td>
                <td className="px-3 py-2.5 text-right font-mono font-bold" style={{ color: !homeWins ? C_GREEN : "var(--ft-navy)" }}>
                  {String(away)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* H2H */}
        <div className="flex items-center justify-between px-4 py-3" style={PANEL}>
          <span className="ft-label">
            Head-to-Head · 历史交锋（{h2h.totalGames} 场）
          </span>
          <div className="flex items-center gap-4 font-mono text-sm font-bold">
            <span style={{ color: C_HOME }}>{h2h.homeWins}W</span>
            <span style={{ color: "var(--ft-text-dim)" }}>{h2h.draws}D</span>
            <span style={{ color: C_AWAY }}>{h2h.awayWins}W</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Kelly + 风险指标
// ══════════════════════════════════════════════════════════════════════════════

function RiskPanel({ match, detail }: { match: DisplayMatch; detail: DetailedAnalysis }) {
  const pred = match.prediction!;
  const halfKelly = (detail.kellyFraction * 100 / 2).toFixed(1);
  const fullKelly  = (detail.kellyFraction * 100).toFixed(1);

  return (
    <div style={CARD}>
      <div className="px-5 py-3" style={HEADER}>
        <span className="ft-label">Risk Management · 风险控制 · Kelly Criterion</span>
      </div>
      <div className="px-5 py-5 space-y-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Kelly 仓位",  value: `${halfKelly}%`, sub: "半凯利（保守）",    note: `全凯利 ${fullKelly}%`,    color: C_HOME },
            { label: "期望回报率",  value: `+${detail.evPercent}%`, sub: "每单位投注", note: "基于市场赔率 vs 模型",    color: C_GREEN },
            { label: "夏普代理",   value: detail.sharpeProxy.toFixed(2), sub: "> 1.0 为优质", note: `置信 ${pred.confidenceScore}/100`, color: detail.sharpeProxy >= 1.5 ? C_GREEN : "var(--ft-amber)" },
            { label: "最大敞口",   value: `${Math.min(parseFloat(fullKelly) * 2, 10).toFixed(0)}%`, sub: "建议不超过此比例", note: "of Total Bankroll", color: "var(--ft-amber)" },
          ].map((m) => (
            <div key={m.label} className="px-4 py-4 space-y-2" style={{ ...PANEL, borderLeft: `3px solid ${m.color}` }}>
              <p className="ft-label">{m.label}</p>
              <p className="font-mono text-2xl font-black" style={{ color: m.color }}>{m.value}</p>
              <p className="ft-label">{m.sub}</p>
              <p className="font-mono text-[9px]" style={{ color: "var(--ft-text-dim)" }}>{m.note}</p>
            </div>
          ))}
        </div>
        <p className="ft-label" style={{ color: "var(--ft-text-dim)" }}>
          Kelly 准则假设长期最大化对数效用，建议使用 ½ Kelly 降低方差。以上均不构成任何财务或投注建议。
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Python 高级模型占位区
// ══════════════════════════════════════════════════════════════════════════════

function PythonModelPlaceholder({ match }: { match: DisplayMatch }) {
  const slots = [
    { label: "Feature Importance",   sub: "SHAP 值可视化 · 影响因子排行" },
    { label: "Backtest Report",       sub: "同类对局 3 年预测准确率与盈利曲线" },
    { label: "Odds Calibration",      sub: "贝叶斯校正 · 市场赔率融合先验" },
    { label: "Injury / Squad Impact", sub: "关键球员缺席对 xG 的量化影响" },
  ];

  return (
    <div style={{ ...CARD, opacity: 0.72, borderStyle: "dashed" }}>
      <div
        className="flex items-center justify-between flex-wrap gap-2 px-5 py-3"
        style={{ borderBottom: "1px dashed var(--ft-border)", backgroundColor: "var(--ft-bg-section)" }}
      >
        <span className="ft-label">Advanced Model · Python API Interface</span>
        <span
          className="font-mono text-[9px] px-2.5 py-1 uppercase tracking-wider"
          style={{ border: "1px solid var(--ft-border)", color: "var(--ft-text-dim)" }}
        >
          RESTRICTED · 算法研发中
        </span>
      </div>
      <div className="px-5 py-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {slots.map((s) => (
            <div key={s.label} className="px-4 py-3"
              style={{ border: "1px dashed var(--ft-border)", backgroundColor: "var(--ft-bg-section)" }}>
              <p className="text-[13px] font-medium" style={{ color: "var(--ft-text-muted)" }}>{s.label}</p>
              <p className="mt-0.5 ft-label">{s.sub}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 px-4 py-3" style={{ backgroundColor: "var(--ft-bg-panel)", border: "1px solid var(--ft-divider)" }}>
          <p className="font-mono text-[11px] leading-relaxed" style={{ color: "var(--ft-text-dim)" }}>
            {"# POST /api/model/v2/analyze"}
            {"\n"}
            {"{ matchId: "}{match.id}{", features: [xG, form, odds, ...] }"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 锁定页（超过 3 天的未来比赛）
// ══════════════════════════════════════════════════════════════════════════════

function LockedMatchPage({ match, daysLeft }: { match: DisplayMatch; daysLeft: number }) {
  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--ft-bg)" }}>
      <SiteNav activeSection="match" />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8 px-4 md:px-8 py-16 md:py-24 text-center">

        {/* 锁定标识 */}
        <div
          className="flex h-16 w-16 items-center justify-center"
          style={{ border: "2px solid var(--ft-border)", backgroundColor: "var(--ft-bg-section)" }}
        >
          <span className="font-mono text-[11px] font-bold" style={{ color: "var(--ft-text-dim)" }}>LOCK</span>
        </div>

        {/* 标题 */}
        <div>
          <h1 className="ft-heading text-2xl font-semibold" style={{ color: "var(--ft-navy)" }}>
            分析报告尚未开放
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed max-w-sm mx-auto" style={{ color: "var(--ft-text-muted)" }}>
            距本场比赛开球还有{" "}
            <span className="font-bold" style={{ color: "var(--ft-navy)" }}>{daysLeft} 天</span>。
            预测报告将在赛前 <span className="font-semibold">72 小时</span> 内自动解锁。
          </p>
        </div>

        {/* 比赛信息 */}
        <div style={{ ...PANEL, width: "100%", maxWidth: "420px" }}>
          <div className="flex items-center justify-center gap-8 px-6 py-5">
            <div className="flex flex-col items-center gap-2">
              {match.homeTeam.crest ? (
                <div className="relative h-10 w-10 grayscale opacity-50">
                  <Image src={match.homeTeam.crest} alt={match.homeTeam.name} fill className="object-contain" sizes="40px" />
                </div>
              ) : (
                <div className="h-10 w-10 flex items-center justify-center font-mono text-[10px] font-bold"
                  style={{ backgroundColor: "var(--ft-bg-hover)", color: "var(--ft-text-dim)", border: "1px solid var(--ft-border)" }}>
                  {match.homeTeam.code}
                </div>
              )}
              <span className="text-[12px] font-medium" style={{ color: "var(--ft-text-muted)" }}>
                {match.homeTeam.nameZh || match.homeTeam.code}
              </span>
            </div>
            <span className="font-mono text-lg font-black" style={{ color: "var(--ft-text-dim)" }}>VS</span>
            <div className="flex flex-col items-center gap-2">
              {match.awayTeam.crest ? (
                <div className="relative h-10 w-10 grayscale opacity-50">
                  <Image src={match.awayTeam.crest} alt={match.awayTeam.name} fill className="object-contain" sizes="40px" />
                </div>
              ) : (
                <div className="h-10 w-10 flex items-center justify-center font-mono text-[10px] font-bold"
                  style={{ backgroundColor: "var(--ft-bg-hover)", color: "var(--ft-text-dim)", border: "1px solid var(--ft-border)" }}>
                  {match.awayTeam.code}
                </div>
              )}
              <span className="text-[12px] font-medium" style={{ color: "var(--ft-text-muted)" }}>
                {match.awayTeam.nameZh || match.awayTeam.code}
              </span>
            </div>
          </div>
          <div
            className="px-6 py-3 text-center"
            style={{ borderTop: "1px solid var(--ft-divider)", backgroundColor: "var(--ft-bg-section)" }}
          >
            <p className="font-mono text-[11px]" style={{ color: "var(--ft-text-muted)" }}>
              {match.date} · {match.time} UTC · {match.group ?? match.stage}
            </p>
          </div>
        </div>

        <Link
          href="/worldcup"
          className="inline-block px-6 py-3 text-[13px] font-medium no-underline transition-colors"
          style={{ border: "1px solid var(--ft-border)", color: "var(--ft-navy)", backgroundColor: "var(--ft-bg-card)" }}
        >
          ← 返回世界杯赛程
        </Link>
      </main>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 主页面
// ══════════════════════════════════════════════════════════════════════════════

function daysUntilMatch(dateStr: string, timeStr: string): number {
  const matchTime = new Date(`${dateStr}T${timeStr.padStart(5, "0")}:00Z`).getTime();
  return Math.ceil((matchTime - Date.now()) / 86_400_000);
}

export default async function MatchAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await fetchMatchById(id, PREDICTIONS);
  if (!match) notFound();

  // 时间锁（>3天未来比赛）
  if (match.status === "upcoming") {
    const days = daysUntilMatch(match.date, match.time);
    if (days > 3) return <LockedMatchPage match={match} daysLeft={days} />;
  }

  // 鉴权：未登录/free 用户 → 付费墙
  const paywallNode = await checkAnalystAccess(match);
  if (paywallNode) return paywallNode;

  const key = `${match.homeTeam.code}-${match.awayTeam.code}`;
  const detail: DetailedAnalysis | null = DETAILED_ANALYSIS[key] ?? null;

  // H2H 数据（API-Football，缓存 24h，失败时静默降级）
  const h2hData = await fetchH2H(match.homeTeam.name, match.awayTeam.name).catch(() => null);

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--ft-bg)" }}>
      <SiteNav activeSection="match" />

      {/* 面包屑 */}
      <div style={{ borderBottom: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-section)" }}>
        <div className="mx-auto flex h-10 max-w-5xl items-center gap-2 px-4 md:px-8">
          <Link href="/" className="ft-label transition-colors hover:text-[color:var(--ft-navy)]">首页</Link>
          <span className="ft-label">/</span>
          <Link href="/worldcup" className="ft-label transition-colors hover:text-[color:var(--ft-navy)]">世界杯</Link>
          <span className="ft-label">/</span>
          <span className="ft-label" style={{ color: "var(--ft-text-muted)" }}>对局分析</span>
        </div>
      </div>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 md:px-8 py-6 md:py-8 space-y-4">
        {/* 1. 报告头部 */}
        <ReportHeader match={match} detail={detail} />

        {/* 2. 执行摘要 */}
        {match.prediction && <ExecutiveSummary match={match} detail={detail} />}

        {/* 3. 市场价值差 */}
        {match.prediction && detail && <EdgeAnalysis match={match} detail={detail} />}

        {/* 4. 实时盘口 + Edge 分析 */}
        <section>
          <div className="mb-3" style={{ borderLeft: "3px solid var(--ft-navy)", paddingLeft: "12px" }}>
            <p className="ft-label">Market Intelligence · 市场盘口</p>
          </div>
          <OddsPanel
            homeTeam={match.homeTeam.name}
            awayTeam={match.awayTeam.name}
            modelHomeProb={(match.prediction?.homeWin ?? 40) / 100}
            modelDrawProb={(match.prediction?.draw ?? 30) / 100}
            modelAwayProb={(match.prediction?.awayWin ?? 30) / 100}
          />
        </section>

        {/* 5. Python 泊松实时模型 */}
        <PoissonPanel match={match} />

        {/* 6. H2H 历史交锋 */}
        {h2hData && (
          <section>
            <div className="mb-3" style={{ borderLeft: "3px solid var(--ft-navy)", paddingLeft: "12px" }}>
              <p className="ft-label">Historical Context · 历史交锋</p>
            </div>
            <H2HPanel
              h2h={h2hData}
              currentHomeName={match.homeTeam.name}
              currentAwayName={match.awayTeam.name}
            />
          </section>
        )}

        {/* 7. 球队情报 */}
        {detail && <TeamIntelligence match={match} detail={detail} />}

        {/* 8. 风险管理 */}
        {detail && <RiskPanel match={match} detail={detail} />}

        {/* 9. 高级模型占位 */}
        <PythonModelPlaceholder match={match} />

        {/* 报告底部 */}
        <div className="px-5 py-4" style={{ ...PANEL, marginTop: "8px" }}>
          <p className="ft-label text-center leading-relaxed" style={{ color: "var(--ft-text-dim)" }}>
            DISCLAIMER · 以上内容由 FirstTouch 量化模型自动生成，仅供研究参考，
            不构成任何形式的财务、投资或博彩建议。过往表现不代表未来收益。
          </p>
          <p className="mt-1.5 ft-label text-center" style={{ color: "var(--ft-text-dim)", opacity: 0.6 }}>
            Data: football-data.org · Model: {detail?.modelVersion ?? "v0.1-MVP"} · {new Date().toISOString().slice(0,10)} · © 2026 FirstTouch Quantitative Research
          </p>
        </div>
      </main>
    </div>
  );
}
