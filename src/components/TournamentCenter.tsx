/**
 * TournamentCenter — 主页赛事中心
 * 定位：全局赛事进程 + 当日赛程（纯事实，无预测）
 */

import Link from "next/link";
import Image from "next/image";
import type { DisplayMatch, TournamentProgress } from "@/lib/footballDataApi";
import { formatDate } from "@/lib/footballDataApi";

const CARD = { border: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-card)" } as const;
const PANEL = { border: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-panel)" } as const;
const HEADER = { borderBottom: "1px solid var(--ft-divider)", backgroundColor: "var(--ft-bg-section)" } as const;

function ProgressBar({ progress }: { progress: TournamentProgress }) {
  const pct = progress.totalMatches > 0
    ? Math.round((progress.totalFinished / progress.totalMatches) * 100)
    : 0;

  return (
    <div className="px-5 py-4" style={PANEL}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <p className="ft-label mb-1">赛事阶段</p>
          <p className="text-sm font-semibold" style={{ color: "var(--ft-navy)" }}>
            {progress.stageLabel}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xl font-black tabular-nums" style={{ color: "var(--ft-navy)" }}>
            {progress.totalFinished}
            <span className="text-sm font-normal" style={{ color: "var(--ft-text-muted)" }}>
              {" "}/ {progress.totalMatches}
            </span>
          </p>
          <p className="ft-label">已完赛场次</p>
        </div>
      </div>

      <div className="h-1.5 overflow-hidden mb-2" style={{ backgroundColor: "var(--ft-bg-section)" }}>
        <div style={{ width: `${pct}%`, height: "100%", backgroundColor: "var(--ft-navy)", transition: "width 0.6s" }} />
      </div>

      <div className="flex flex-wrap gap-4 font-mono text-[11px]" style={{ color: "var(--ft-text-muted)" }}>
        {progress.groupTotal > 0 && (
          <span>小组赛 {progress.groupFinished}/{progress.groupTotal}</span>
        )}
        {progress.knockoutTotal > 0 && (
          <span>淘汰赛 {progress.knockoutFinished}/{progress.knockoutTotal}</span>
        )}
        <span className="ml-auto">{pct}% 完成</span>
      </div>
    </div>
  );
}

function CompactMatchRow({ match }: { match: DisplayMatch }) {
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  return (
    <Link
      href={`/worldcup/match/${match.id}`}
      className="flex items-center gap-3 px-4 py-3 no-underline transition-colors hover:bg-[color:var(--ft-bg-section)]"
      style={{ borderBottom: "1px solid var(--ft-divider)" }}
    >
      <div className="w-14 shrink-0 text-center">
        {isLive ? (
          <span className="font-mono text-[10px] font-bold animate-pulse" style={{ color: "var(--ft-red)" }}>LIVE</span>
        ) : isFinished ? (
          <span className="font-mono text-[10px] font-semibold" style={{ color: "var(--ft-text-dim)" }}>完场</span>
        ) : (
          <span className="font-mono text-[11px] font-bold tabular-nums" style={{ color: "var(--ft-navy)" }}>{match.time}</span>
        )}
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 min-w-0">
        <span className="text-[12px] font-medium truncate" style={{ color: "var(--ft-navy)" }}>
          {match.homeTeam.nameZh || match.homeTeam.code}
        </span>
        {match.homeTeam.crest && (
          <div className="relative h-5 w-5 shrink-0">
            <Image src={match.homeTeam.crest} alt="" fill className="object-contain" sizes="20px" />
          </div>
        )}
      </div>

      <div className="w-16 shrink-0 text-center font-mono text-sm font-black tabular-nums" style={{ color: "var(--ft-navy)" }}>
        {match.score ? <>{match.score.home} – {match.score.away}</> : (
          <span style={{ color: "var(--ft-text-dim)", fontSize: "11px" }}>VS</span>
        )}
      </div>

      <div className="flex flex-1 items-center gap-2 min-w-0">
        {match.awayTeam.crest && (
          <div className="relative h-5 w-5 shrink-0">
            <Image src={match.awayTeam.crest} alt="" fill className="object-contain" sizes="20px" />
          </div>
        )}
        <span className="text-[12px] font-medium truncate" style={{ color: "var(--ft-navy)" }}>
          {match.awayTeam.nameZh || match.awayTeam.code}
        </span>
      </div>

      <span className="hidden sm:block w-20 shrink-0 text-right font-mono text-[9px]" style={{ color: "var(--ft-text-dim)" }}>
        {match.group ?? match.stage}
      </span>
    </Link>
  );
}

interface TournamentCenterProps {
  featuredMatchIds: string[];
  focusMatchday: {
    date: string;
    label: string;
    isToday: boolean;
    matches: DisplayMatch[];
  };
  progress: TournamentProgress;
  liveCount: number;
}

export default function TournamentCenter({
  featuredMatchIds,
  focusMatchday,
  progress,
  liveCount,
}: TournamentCenterProps) {
  const featuredSet = new Set(featuredMatchIds);
  const scheduleMatches = focusMatchday.matches.filter((m) => !featuredSet.has(m.id));
  const featuredOnDay = focusMatchday.matches.filter((m) => featuredSet.has(m.id));

  return (
    <section>
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div style={{ borderLeft: "3px solid var(--ft-navy)", paddingLeft: "16px" }}>
          <p className="ft-label mb-2">TOURNAMENT CENTER · 赛事中心</p>
          <h2 className="ft-heading text-xl font-semibold">世界杯全局纵览</h2>
          <p className="mt-1 text-[13px]" style={{ color: "var(--ft-text-muted)" }}>
            赛事进程 · 当日赛程 · 不含预测信号
          </p>
        </div>
        <Link href="/worldcup" className="text-[13px] font-medium no-underline" style={{ color: "var(--ft-blue)" }}>
          完整赛程与晋级树 →
        </Link>
      </div>

      <ProgressBar progress={progress} />

      <div className="mt-4" style={CARD}>
        <div className="flex items-center justify-between px-4 py-3" style={HEADER}>
          <div>
            <span className="ft-label">{focusMatchday.label}</span>
            <p className="text-[12px] font-medium mt-0.5" style={{ color: "var(--ft-navy)" }}>
              {formatDate(focusMatchday.date)}
              {focusMatchday.isToday && liveCount > 0 && (
                <span className="ml-2 font-mono text-[10px] animate-pulse" style={{ color: "var(--ft-red)" }}>
                  · {liveCount} 场进行中
                </span>
              )}
            </p>
          </div>
          <span className="font-mono text-[10px]" style={{ color: "var(--ft-text-dim)" }}>
            {scheduleMatches.length} 场
          </span>
        </div>

        {scheduleMatches.length > 0 ? (
          scheduleMatches.map((m) => <CompactMatchRow key={m.id} match={m} />)
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-[13px]" style={{ color: "var(--ft-text-muted)" }}>
              {featuredOnDay.length > 0
                ? "本比赛日重点对局已在下方「量化精选」展示"
                : "暂无赛程数据"}
            </p>
          </div>
        )}

        {featuredOnDay.length > 0 && scheduleMatches.length > 0 && (
          <div className="px-4 py-2.5" style={{ borderTop: "1px solid var(--ft-divider)", backgroundColor: "var(--ft-bg-section)" }}>
            <p className="ft-label text-[10px]" style={{ color: "var(--ft-text-dim)" }}>
              {featuredOnDay.length} 场重点对局见下方「量化精选」
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
