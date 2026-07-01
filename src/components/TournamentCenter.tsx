/**
 * TournamentCenter — 主页赛事中心
 * 定位：全局赛事进程（赛程 / 积分 / 进度），不含预测信号
 * 与上方 Quant Picks 区分：Quant = 深度推荐，Center = 事实纵览
 */

import Link from "next/link";
import Image from "next/image";
import type { DisplayMatch, GroupStandings, TournamentProgress, WCScorer } from "@/lib/footballDataApi";
import { formatDate } from "@/lib/footballDataApi";

const CARD = { border: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-card)" } as const;
const PANEL = { border: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-panel)" } as const;
const HEADER = { borderBottom: "1px solid var(--ft-divider)", backgroundColor: "var(--ft-bg-section)" } as const;

// ─── 赛事进度条 ───────────────────────────────────────────────────────────────

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
        <div
          style={{ width: `${pct}%`, height: "100%", backgroundColor: "var(--ft-navy)", transition: "width 0.6s" }}
        />
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

// ─── 紧凑赛程行（纯事实，无预测）────────────────────────────────────────────

function CompactMatchRow({ match }: { match: DisplayMatch }) {
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  return (
    <Link
      href={`/worldcup/match/${match.id}`}
      className="flex items-center gap-3 px-4 py-3 no-underline transition-colors hover:bg-[color:var(--ft-bg-section)]"
      style={{ borderBottom: "1px solid var(--ft-divider)" }}
    >
      {/* 时间 / 状态 */}
      <div className="w-14 shrink-0 text-center">
        {isLive ? (
          <span className="font-mono text-[10px] font-bold animate-pulse" style={{ color: "var(--ft-red)" }}>
            LIVE
          </span>
        ) : isFinished ? (
          <span className="font-mono text-[10px] font-semibold" style={{ color: "var(--ft-text-dim)" }}>
            完场
          </span>
        ) : (
          <span className="font-mono text-[11px] font-bold tabular-nums" style={{ color: "var(--ft-navy)" }}>
            {match.time}
          </span>
        )}
      </div>

      {/* 主队 */}
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

      {/* 比分 / VS */}
      <div className="w-16 shrink-0 text-center font-mono text-sm font-black tabular-nums" style={{ color: "var(--ft-navy)" }}>
        {match.score ? (
          <>{match.score.home} – {match.score.away}</>
        ) : (
          <span style={{ color: "var(--ft-text-dim)", fontSize: "11px" }}>VS</span>
        )}
      </div>

      {/* 客队 */}
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

      {/* 小组标签 */}
      <span className="hidden sm:block w-16 shrink-0 text-right font-mono text-[9px]" style={{ color: "var(--ft-text-dim)" }}>
        {match.group ?? match.stage}
      </span>
    </Link>
  );
}

// ─── 迷你小组积分榜 ───────────────────────────────────────────────────────────

function MiniGroupTable({ group }: { group: GroupStandings }) {
  const letter = group.group.replace("Group ", "");

  return (
    <div style={PANEL}>
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: "1px solid var(--ft-divider)" }}>
        <span className="font-mono text-[11px] font-bold" style={{ color: "var(--ft-navy)" }}>
          {group.group}
        </span>
        <span
          className="font-mono text-[9px] px-1.5 py-0.5"
          style={{ backgroundColor: "var(--ft-bg-section)", color: "var(--ft-text-dim)" }}
        >
          {letter}
        </span>
      </div>
      <table className="w-full text-[11px]">
        <tbody>
          {group.teams.map((row, i) => {
            const advancing = i < 2 && row.played > 0;
            return (
              <tr
                key={row.team.code}
                style={{
                  borderBottom: i < group.teams.length - 1 ? "1px solid var(--ft-divider)" : undefined,
                  backgroundColor: advancing ? "rgba(0,92,56,0.04)" : undefined,
                }}
              >
                <td className="pl-2 py-1.5 w-5 font-mono font-bold" style={{ color: advancing ? "var(--ft-green)" : "var(--ft-text-dim)" }}>
                  {i + 1}
                </td>
                <td className="py-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {row.team.crest && (
                      <div className="relative h-4 w-4 shrink-0">
                        <Image src={row.team.crest} alt="" fill className="object-contain" sizes="16px" />
                      </div>
                    )}
                    <span className="font-medium truncate" style={{ color: "var(--ft-navy)" }}>
                      {row.team.code}
                    </span>
                  </div>
                </td>
                <td className="pr-2 py-1.5 text-right font-mono tabular-nums" style={{ color: "var(--ft-text-muted)" }}>
                  {row.played}
                </td>
                <td className="pr-2 py-1.5 text-right font-mono font-bold tabular-nums w-8" style={{ color: "var(--ft-navy)" }}>
                  {row.points}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── 射手榜迷你条 ─────────────────────────────────────────────────────────────

function MiniScorers({ scorers }: { scorers: WCScorer[] }) {
  if (scorers.length === 0) return null;
  const maxGoals = scorers[0]?.goals ?? 1;

  return (
    <div style={CARD}>
      <div className="px-4 py-2.5" style={HEADER}>
        <span className="ft-label">Top Scorers · 射手榜</span>
      </div>
      <div className="divide-y" style={{ borderColor: "var(--ft-divider)" }}>
        {scorers.slice(0, 5).map((s) => (
          <div key={s.player.id} className="flex items-center gap-3 px-4 py-2.5">
            <span className="font-mono text-[11px] font-bold w-4 tabular-nums" style={{ color: "var(--ft-text-dim)" }}>
              {s.rank}
            </span>
            {s.team.crest && (
              <div className="relative h-5 w-5 shrink-0">
                <Image src={s.team.crest} alt="" fill className="object-contain" sizes="20px" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium truncate" style={{ color: "var(--ft-navy)" }}>
                {s.player.name}
              </p>
              <p className="font-mono text-[9px]" style={{ color: "var(--ft-text-dim)" }}>
                {s.team.nameZh || s.team.tla}
              </p>
            </div>
            <span className="font-mono text-sm font-black tabular-nums" style={{ color: "var(--ft-navy)" }}>
              {s.goals}
            </span>
            <div className="hidden sm:block w-16 h-1 overflow-hidden" style={{ backgroundColor: "var(--ft-bg-panel)" }}>
              <div style={{ width: `${(s.goals / maxGoals) * 100}%`, height: "100%", backgroundColor: "var(--ft-navy)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

interface TournamentCenterProps {
  /** Quant Picks 已展示的对局 ID，赛程区排除以避免重复 */
  featuredMatchIds: string[];
  focusMatchday: {
    date: string;
    label: string;
    isToday: boolean;
    matches: DisplayMatch[];
  };
  groupStandings: GroupStandings[];
  progress: TournamentProgress;
  scorers: WCScorer[];
  liveCount: number;
}

export default function TournamentCenter({
  featuredMatchIds,
  focusMatchday,
  groupStandings,
  progress,
  scorers,
  liveCount,
}: TournamentCenterProps) {
  const featuredSet = new Set(featuredMatchIds);
  const scheduleMatches = focusMatchday.matches.filter((m) => !featuredSet.has(m.id));
  const featuredOnDay = focusMatchday.matches.filter((m) => featuredSet.has(m.id));

  return (
    <section>
      {/* 区块标题 */}
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div style={{ borderLeft: "3px solid var(--ft-navy)", paddingLeft: "16px" }}>
          <p className="ft-label mb-2">TOURNAMENT CENTER · 赛事中心</p>
          <h2 className="ft-heading text-xl font-semibold">世界杯全局纵览</h2>
          <p className="mt-1 text-[13px]" style={{ color: "var(--ft-text-muted)" }}>
            赛程进程 · 小组出线 · 射手动态 · 不含预测信号
          </p>
        </div>
        <Link
          href="/worldcup"
          className="text-[13px] font-medium no-underline transition-colors hover:text-[color:var(--ft-navy)]"
          style={{ color: "var(--ft-blue)" }}
        >
          完整赛程与研报 →
        </Link>
      </div>

      {/* 进度条 */}
      <ProgressBar progress={progress} />

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        {/* 左：赛程_digest（排除 Quant Picks 已展示的对局） */}
        <div className="lg:col-span-2" style={CARD}>
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
            <div>
              {scheduleMatches.map((m) => (
                <CompactMatchRow key={m.id} match={m} />
              ))}
            </div>
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

        {/* 右：小组积分榜 */}
        <div className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="ft-label">GROUP STANDINGS · 小组积分榜</span>
            <span className="font-mono text-[9px]" style={{ color: "var(--ft-text-dim)" }}>
              前 2 名出线 · 绿底标注
            </span>
          </div>

          {groupStandings.length > 0 ? (
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {groupStandings.map((g) => (
                <MiniGroupTable key={g.group} group={g} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center" style={{ ...PANEL }}>
              <p className="text-[13px]" style={{ color: "var(--ft-text-muted)" }}>
                小组赛尚未开始 · 积分榜将在首场比赛后更新
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 射手榜 */}
      {scorers.length > 0 && (
        <div className="mt-4">
          <MiniScorers scorers={scorers} />
        </div>
      )}
    </section>
  );
}
