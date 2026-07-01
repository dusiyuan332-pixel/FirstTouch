/**
 * KnockoutBracket — 淘汰赛晋级形势树状图
 * 数据来源：football-data.org 赛果，按轮次分列展示
 */

import Link from "next/link";
import Image from "next/image";
import type { DisplayMatch, DisplayTeam, KnockoutRound } from "@/lib/footballDataApi";
import { getMatchWinner } from "@/lib/footballDataApi";

const CARD = { border: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-card)" } as const;
const MATCH_H = 72; // px，单场卡片近似高度
const MATCH_GAP = 8;

// ─── 单场比赛节点 ───────────────────────────────────────────────────────────

function TeamLine({
  team,
  score,
  isWinner,
  isLoser,
}: {
  team: DisplayTeam;
  score?: number;
  isWinner: boolean;
  isLoser: boolean;
}) {
  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 min-w-0"
      style={{
        backgroundColor: isWinner ? "rgba(0,92,56,0.08)" : undefined,
        opacity: isLoser ? 0.45 : 1,
      }}
    >
      {team.crest ? (
        <div className="relative h-4 w-4 shrink-0">
          <Image src={team.crest} alt="" fill className="object-contain" sizes="16px" />
        </div>
      ) : (
        <span className="font-mono text-[8px] w-4 text-center shrink-0" style={{ color: "var(--ft-text-dim)" }}>
          {team.code}
        </span>
      )}
      <span
        className="flex-1 text-[11px] truncate font-medium"
        style={{
          color: isWinner ? "var(--ft-green)" : "var(--ft-navy)",
          fontWeight: isWinner ? 700 : 500,
        }}
      >
        {team.nameZh || team.code}
      </span>
      {score !== undefined && (
        <span
          className="font-mono text-[11px] font-bold tabular-nums w-4 text-right shrink-0"
          style={{ color: isWinner ? "var(--ft-green)" : "var(--ft-navy)" }}
        >
          {score}
        </span>
      )}
    </div>
  );
}

function BracketMatchCard({ match }: { match: DisplayMatch }) {
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const winner = getMatchWinner(match);
  const homeWins = winner?.code === match.homeTeam.code;
  const awayWins = winner?.code === match.awayTeam.code;

  return (
    <Link
      href={`/worldcup/match/${match.id}`}
      className="block no-underline transition-shadow hover:shadow-sm"
      style={{ ...CARD, borderLeft: isLive ? "3px solid var(--ft-red)" : "1px solid var(--ft-border)" }}
    >
      {isLive && (
        <div className="px-2 py-0.5" style={{ backgroundColor: "rgba(176,28,28,0.06)", borderBottom: "1px solid var(--ft-divider)" }}>
          <span className="font-mono text-[8px] font-bold animate-pulse" style={{ color: "var(--ft-red)" }}>
            ● LIVE {match.minute != null ? `${match.minute}'` : ""}
          </span>
        </div>
      )}
      <TeamLine team={match.homeTeam} score={match.score?.home} isWinner={homeWins} isLoser={isFinished && awayWins} />
      <div style={{ borderTop: "1px solid var(--ft-divider)" }} />
      <TeamLine team={match.awayTeam} score={match.score?.away} isWinner={awayWins} isLoser={isFinished && homeWins} />
      {!isFinished && !isLive && (
        <div className="px-2 py-0.5 text-center" style={{ borderTop: "1px solid var(--ft-divider)", backgroundColor: "var(--ft-bg-section)" }}>
          <span className="font-mono text-[8px]" style={{ color: "var(--ft-text-dim)" }}>
            {match.date.slice(5)} · {match.time}
          </span>
        </div>
      )}
    </Link>
  );
}

/** 计算某轮次中第 i 场比赛的垂直偏移（树状居中） */
function matchTopOffset(roundIndex: number, matchIndex: number): number {
  const slotH = MATCH_H + MATCH_GAP;
  const blockSpan = Math.pow(2, roundIndex + 1);
  return matchIndex * blockSpan * slotH + ((blockSpan - 1) * slotH) / 2;
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

interface KnockoutBracketProps {
  rounds: KnockoutRound[];
  thirdPlace?: DisplayMatch | null;
}

export default function KnockoutBracket({ rounds, thirdPlace }: KnockoutBracketProps) {
  if (rounds.length === 0) return null;

  const firstCount = rounds[0].matches.length;
  const slotH = MATCH_H + MATCH_GAP;
  const treeHeight = firstCount * slotH * 2 - MATCH_GAP;

  return (
    <section style={CARD}>
      <div
        className="flex flex-wrap items-center justify-between gap-2 px-4 md:px-5 py-3"
        style={{ borderBottom: "1px solid var(--ft-divider)", backgroundColor: "var(--ft-bg-section)" }}
      >
        <div>
          <p className="ft-label">KNOCKOUT BRACKET · 淘汰赛晋级形势</p>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--ft-text-muted)" }}>
            根据最新赛果自动更新 · 绿色为晋级球队
          </p>
        </div>
        <span className="font-mono text-[9px]" style={{ color: "var(--ft-text-dim)" }}>
          {rounds.reduce((n, r) => n + r.matches.length, 0)} 场淘汰赛
        </span>
      </div>

      <div className="overflow-x-auto px-3 md:px-6 pt-12 pb-5 md:pb-6">
        <div className="flex gap-0 min-w-max mx-auto" style={{ height: treeHeight }}>
          {rounds.map((round, roundIndex) => (
            <div key={round.stage} className="flex shrink-0">
              {/* 轮次列 */}
              <div className="relative" style={{ width: 160 }}>
                {/* 标题 */}
                <div className="absolute -top-10 left-0 right-0 text-center">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--ft-navy)" }}>
                    {round.label}
                  </p>
                  <p className="font-mono text-[8px]" style={{ color: "var(--ft-text-dim)" }}>
                    {round.labelEn}
                  </p>
                </div>

                {/* 比赛节点 */}
                {round.matches.map((match, matchIndex) => (
                  <div
                    key={match.id}
                    className="absolute left-0 right-0"
                    style={{ top: matchTopOffset(roundIndex, matchIndex), height: MATCH_H }}
                  >
                    <BracketMatchCard match={match} />
                  </div>
                ))}
              </div>

              {/* 连接线（除最后一列） */}
              {roundIndex < rounds.length - 1 && (
                <div className="relative shrink-0" style={{ width: 20, height: treeHeight }}>
                  {round.matches.map((_, matchIndex) => {
                    const y = matchTopOffset(roundIndex, matchIndex) + MATCH_H / 2;
                    return (
                      <svg
                        key={matchIndex}
                        className="absolute left-0 overflow-visible pointer-events-none"
                        style={{ top: 0, width: 20, height: treeHeight }}
                      >
                        <line x1={0} y1={y} x2={20} y2={y} stroke="var(--ft-border)" strokeWidth={1} />
                      </svg>
                    );
                  })}
                  {/* 配对竖线 */}
                  {round.matches.map((_, matchIndex) => {
                    if (matchIndex % 2 !== 0) return null;
                    const y1 = matchTopOffset(roundIndex, matchIndex) + MATCH_H / 2;
                    const y2 = matchIndex + 1 < round.matches.length
                      ? matchTopOffset(roundIndex, matchIndex + 1) + MATCH_H / 2
                      : y1;
                    const yMid = (y1 + y2) / 2;
                    return (
                      <svg
                        key={`v-${matchIndex}`}
                        className="absolute left-0 overflow-visible pointer-events-none"
                        style={{ top: 0, width: 20, height: treeHeight }}
                      >
                        <line x1={20} y1={y1} x2={20} y2={y2} stroke="var(--ft-border)" strokeWidth={1} />
                        <line x1={20} y1={yMid} x2={20} y2={yMid} stroke="var(--ft-border)" strokeWidth={1} />
                      </svg>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {thirdPlace && (
        <div
          className="mx-4 md:mx-5 mb-5 px-4 py-3"
          style={{ border: "1px dashed var(--ft-border)", backgroundColor: "var(--ft-bg-section)" }}
        >
          <p className="ft-label mb-2 text-center">三四名决赛 · Third Place</p>
          <div className="max-w-[160px] mx-auto">
            <BracketMatchCard match={thirdPlace} />
          </div>
        </div>
      )}
    </section>
  );
}
