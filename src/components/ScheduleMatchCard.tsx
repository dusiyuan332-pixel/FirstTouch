import Image from "next/image";
import Link from "next/link";
import type { DisplayMatch } from "@/lib/footballDataApi";
import KickoffCountdown from "@/components/KickoffCountdown";

// ─── 辅助函数 ─────────────────────────────────────────────────────────────────

function daysUntilMatch(dateStr: string, timeStr: string): number {
  const matchDate = new Date(`${dateStr}T${timeStr}:00Z`);
  const now = new Date();
  const diffMs = matchDate.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function isAnalysisOpen(match: DisplayMatch): boolean {
  if (match.status === "finished" || match.status === "live") return true;
  const days = daysUntilMatch(match.date, match.time);
  return days <= 3;
}

// ─── 评级颜色 ─────────────────────────────────────────────────────────────────

const RATING_COLORS: Record<string, { color: string; bg: string }> = {
  STRONG_BUY: { color: "var(--ft-green)", bg: "var(--ft-green-bg)" },
  BUY:        { color: "var(--ft-green)", bg: "var(--ft-green-bg)" },
  NEUTRAL:    { color: "var(--ft-amber)", bg: "var(--ft-amber-bg)" },
  AVOID:      { color: "var(--ft-red)",   bg: "var(--ft-red-bg)"   },
};

const RATING_LABELS: Record<string, string> = {
  STRONG_BUY: "强烈买入", BUY: "买入", NEUTRAL: "中性", AVOID: "回避",
};

// ─── 队徽 ─────────────────────────────────────────────────────────────────────

function TeamCrest({ crest, code }: { crest?: string; code: string }) {
  if (crest) {
    return (
      <div className="relative h-9 w-9">
        <Image src={crest} alt={code} fill className="object-contain" sizes="36px" />
      </div>
    );
  }
  return (
    <div
      className="h-9 w-9 flex items-center justify-center font-mono text-[9px] font-bold"
      style={{
        backgroundColor: "var(--ft-bg-panel)",
        color: "var(--ft-text-muted)",
        border: "1px solid var(--ft-border)",
      }}
    >
      {code}
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

export default function ScheduleMatchCard({ match }: { match: DisplayMatch }) {
  const open = isAnalysisOpen(match);
  const pred = match.prediction;
  const days = daysUntilMatch(match.date, match.time);

  // 左侧边框颜色
  let accentColor = "var(--ft-border)";
  if (match.status === "live")     accentColor = "var(--ft-red)";
  else if (open && pred)           accentColor = "var(--ft-navy)";

  const ratingC = pred ? RATING_COLORS[pred.rating] ?? RATING_COLORS.NEUTRAL : null;
  const ratingL = pred ? RATING_LABELS[pred.rating] ?? "—" : null;

  const inner = (
    <div
      className="h-full flex flex-col transition-all duration-150"
      style={{
        border: "1px solid var(--ft-border)",
        backgroundColor: open ? "var(--ft-bg-card)" : "var(--ft-bg-section)",
        borderLeft: `3px solid ${accentColor}`,
        opacity: open ? 1 : 0.65,
      }}
    >
      {/* 顶部：小组 + 状态 */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: "1px solid var(--ft-divider)" }}
      >
        <span className="ft-label">{match.group ?? match.stage}</span>
        <div className="flex items-center gap-2">
          {match.status === "live" && (
            <span className="ft-label animate-pulse" style={{ color: "var(--ft-red)" }}>LIVE</span>
          )}
          {match.status === "finished" && (
            <span className="ft-label" style={{ color: "var(--ft-text-dim)" }}>FT</span>
          )}
          {match.status === "upcoming" && (
            <KickoffCountdown
              dateStr={match.date}
              timeStr={match.time}
              variant="badge"
            />
          )}
          {open && ratingC && ratingL && (
            <span
              className="font-mono text-[9px] font-semibold uppercase px-1.5 py-0.5"
              style={{ backgroundColor: ratingC.bg, color: ratingC.color }}
            >
              {ratingL}
            </span>
          )}
        </div>
      </div>

      {/* 主客队 */}
      <div className="flex items-center gap-3 px-4 py-4">
        {/* 主队 */}
        <div className="flex flex-1 items-center gap-2">
          <TeamCrest crest={match.homeTeam.crest} code={match.homeTeam.code} />
          <span className="text-[13px] font-semibold leading-tight" style={{ color: "var(--ft-navy)" }}>
            {match.homeTeam.nameZh || match.homeTeam.name}
          </span>
        </div>

        {/* 比分 / 时间 / 倒计时 */}
        <div className="shrink-0 text-center w-16">
          {match.score ? (
            <span className="font-mono text-base font-black tabular-nums" style={{ color: "var(--ft-navy)" }}>
              {match.score.home}
              <span style={{ color: "var(--ft-text-dim)", margin: "0 4px" }}>–</span>
              {match.score.away}
            </span>
          ) : (
            <KickoffCountdown
              dateStr={match.date}
              timeStr={match.time}
              variant="card"
              fallback={
                <span className="font-mono text-sm" style={{ color: "var(--ft-text-muted)" }}>
                  {match.time}<span className="block ft-label">UTC</span>
                </span>
              }
            />
          )}
        </div>

        {/* 客队 */}
        <div className="flex flex-1 flex-row-reverse items-center gap-2 text-right">
          <TeamCrest crest={match.awayTeam.crest} code={match.awayTeam.code} />
          <span className="text-[13px] font-semibold leading-tight" style={{ color: "var(--ft-navy)" }}>
            {match.awayTeam.nameZh || match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* 底部 */}
      <div
        className="mt-auto flex items-center justify-between px-4 py-2.5"
        style={{ borderTop: "1px solid var(--ft-divider)", backgroundColor: "var(--ft-bg-panel)" }}
      >
        {open ? (
          <>
            <span className="ft-label">
              {pred ? `置信 ${pred.confidenceScore}` : "点击查看分析"}
            </span>
            <span className="ft-label" style={{ color: "var(--ft-blue)" }}>
              查看报告 →
            </span>
          </>
        ) : (
          <span className="ft-label w-full text-center">
            {days} 天后开放分析
          </span>
        )}
      </div>
    </div>
  );

  if (!open) {
    return <div className="h-full">{inner}</div>;
  }

  return (
    <Link href={`/worldcup/match/${match.id}`} className="block h-full no-underline group">
      {inner}
    </Link>
  );
}
