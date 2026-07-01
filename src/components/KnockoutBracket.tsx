/**
 * KnockoutBracket — 左右半区对称淘汰赛晋级树
 * 左区 + 决赛/季军（中） + 右区，横向展开、纵向减半
 */

import Link from "next/link";
import Image from "next/image";
import type { DisplayMatch, DisplayTeam, KnockoutRound } from "@/lib/footballDataApi";
import { getMatchWinner } from "@/lib/footballDataApi";

const CARD = { border: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-card)" } as const;
const MATCH_H = 58;
const MATCH_GAP = 6;
const COL_W = 148;
const CONN_W = 16;

// ─── 比赛卡片 ───────────────────────────────────────────────────────────────

function TeamLine({
  team, score, isWinner, isLoser,
}: {
  team: DisplayTeam; score?: number; isWinner: boolean; isLoser: boolean;
}) {
  return (
    <div
      className="flex items-center gap-1 px-1.5 py-0.5 min-w-0"
      style={{ backgroundColor: isWinner ? "rgba(0,92,56,0.08)" : undefined, opacity: isLoser ? 0.45 : 1 }}
    >
      {team.crest ? (
        <div className="relative h-3.5 w-3.5 shrink-0">
          <Image src={team.crest} alt="" fill className="object-contain" sizes="14px" />
        </div>
      ) : (
        <span className="font-mono text-[7px] w-3.5 text-center shrink-0" style={{ color: "var(--ft-text-dim)" }}>
          {team.code}
        </span>
      )}
      <span
        className="flex-1 text-[10px] truncate"
        style={{ color: isWinner ? "var(--ft-green)" : "var(--ft-navy)", fontWeight: isWinner ? 700 : 500 }}
      >
        {team.code}
      </span>
      {score !== undefined && (
        <span className="font-mono text-[10px] font-bold tabular-nums w-3.5 text-right shrink-0"
          style={{ color: isWinner ? "var(--ft-green)" : "var(--ft-navy)" }}>
          {score}
        </span>
      )}
    </div>
  );
}

function BracketMatchCard({ match, tag }: { match: DisplayMatch; tag?: string }) {
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
      {tag && (
        <div className="px-1.5 py-0.5 text-center" style={{ borderBottom: "1px solid var(--ft-divider)", backgroundColor: "var(--ft-bg-section)" }}>
          <span className="font-mono text-[7px] font-bold uppercase tracking-wider" style={{ color: "var(--ft-navy)" }}>
            {tag}
          </span>
        </div>
      )}
      {isLive && (
        <div className="px-1.5 py-0.5" style={{ backgroundColor: "rgba(176,28,28,0.06)", borderBottom: "1px solid var(--ft-divider)" }}>
          <span className="font-mono text-[7px] font-bold animate-pulse" style={{ color: "var(--ft-red)" }}>
            ● LIVE
          </span>
        </div>
      )}
      <TeamLine team={match.homeTeam} score={match.score?.home} isWinner={homeWins} isLoser={isFinished && awayWins} />
      <div style={{ borderTop: "1px solid var(--ft-divider)" }} />
      <TeamLine team={match.awayTeam} score={match.score?.away} isWinner={awayWins} isLoser={isFinished && homeWins} />
      {!isFinished && !isLive && (
        <div className="px-1.5 py-0.5 text-center" style={{ borderTop: "1px solid var(--ft-divider)", backgroundColor: "var(--ft-bg-section)" }}>
          <span className="font-mono text-[7px]" style={{ color: "var(--ft-text-dim)" }}>
            {match.date.slice(5)} · {match.time}
          </span>
        </div>
      )}
    </Link>
  );
}

// ─── 布局工具 ───────────────────────────────────────────────────────────────

function splitHalf(matches: DisplayMatch[]) {
  const mid = Math.ceil(matches.length / 2);
  return { left: matches.slice(0, mid), right: matches.slice(mid) };
}

/** 半区内某轮第 i 场的垂直偏移 */
function matchTop(roundIndex: number, matchIndex: number): number {
  const slotH = MATCH_H + MATCH_GAP;
  const blockSpan = Math.pow(2, roundIndex + 1);
  return matchIndex * blockSpan * slotH + ((blockSpan - 1) * slotH) / 2;
}

function treeHeight(outerCount: number): number {
  const slotH = MATCH_H + MATCH_GAP;
  return outerCount * slotH * 2 - MATCH_GAP;
}

// ─── 连接线（两场比赛合并到下一轮）────────────────────────────────────────

function Connector({
  matchCount,
  roundIndex,
  treeH,
  flip,
}: {
  matchCount: number;
  roundIndex: number;
  treeH: number;
  /** 右半区：连线方向镜像 */
  flip?: boolean;
}) {
  const x1 = flip ? CONN_W : 0;
  const x2 = flip ? 0 : CONN_W;
  const xMid = CONN_W / 2;

  return (
    <svg className="shrink-0 overflow-visible pointer-events-none" width={CONN_W} height={treeH}>
      {Array.from({ length: matchCount }, (_, i) => {
        const y = matchTop(roundIndex, i) + MATCH_H / 2;
        return <line key={`h-${i}`} x1={x1} y1={y} x2={xMid} y2={y} stroke="var(--ft-border)" strokeWidth={1} />;
      })}
      {Array.from({ length: Math.ceil(matchCount / 2) }, (_, pairIdx) => {
        const i = pairIdx * 2;
        const y1 = matchTop(roundIndex, i) + MATCH_H / 2;
        const y2 = i + 1 < matchCount
          ? matchTop(roundIndex, i + 1) + MATCH_H / 2
          : y1;
        const yMid = (y1 + y2) / 2;
        return (
          <g key={`v-${pairIdx}`}>
            <line x1={xMid} y1={y1} x2={xMid} y2={y2} stroke="var(--ft-border)" strokeWidth={1} />
            <line x1={xMid} y1={yMid} x2={x2} y2={yMid} stroke="var(--ft-border)" strokeWidth={1} />
          </g>
        );
      })}
    </svg>
  );
}

// ─── 半区轮次列 ─────────────────────────────────────────────────────────────

function RoundColumn({
  matches,
  roundIndex,
  label,
  labelEn,
  treeH,
}: {
  matches: DisplayMatch[];
  roundIndex: number;
  label: string;
  labelEn: string;
  treeH: number;
}) {
  return (
    <div className="relative shrink-0" style={{ width: COL_W, height: treeH }}>
      <div className="absolute -top-9 left-0 right-0 text-center">
        <p className="font-mono text-[8px] font-bold uppercase tracking-wider" style={{ color: "var(--ft-navy)" }}>
          {label}
        </p>
        <p className="font-mono text-[7px]" style={{ color: "var(--ft-text-dim)" }}>{labelEn}</p>
      </div>
      {matches.map((match, i) => (
        <div
          key={match.id}
          className="absolute left-0 right-0"
          style={{ top: matchTop(roundIndex, i), height: MATCH_H }}
        >
          <BracketMatchCard match={match} />
        </div>
      ))}
    </div>
  );
}

// ─── 半区（左 or 右）────────────────────────────────────────────────────────

function BracketHalf({
  side,
  wingRounds,
  outerCount,
  treeH,
}: {
  side: "left" | "right";
  wingRounds: { label: string; labelEn: string; matches: DisplayMatch[] }[];
  outerCount: number;
  treeH: number;
}) {
  // 左半区：外→内（R32 靠左）；右半区：内→外显示（R32 靠右）
  const cols = side === "left"
    ? wingRounds.map((r, i) => ({ ...r, roundIndex: i }))
    : wingRounds.map((r, i) => ({ ...r, roundIndex: i })).reverse();

  return (
    <div className="flex shrink-0 items-start">
      {cols.map((col, colIdx) => (
        <div key={`${side}-${col.roundIndex}`} className="flex shrink-0">
          {side === "right" && colIdx > 0 && (
            <Connector
              matchCount={col.matches.length}
              roundIndex={col.roundIndex}
              treeH={treeH}
              flip
            />
          )}
          <RoundColumn
            matches={col.matches}
            roundIndex={col.roundIndex}
            label={col.label}
            labelEn={col.labelEn}
            treeH={treeH}
          />
          {side === "left" && colIdx < cols.length - 1 && (
            <Connector
              matchCount={col.matches.length}
              roundIndex={col.roundIndex}
              treeH={treeH}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── 中心区：决赛 + 季军 + 冠军 ─────────────────────────────────────────────

function CenterPodium({
  finalMatch,
  thirdPlace,
  treeH,
}: {
  finalMatch: DisplayMatch | null;
  thirdPlace: DisplayMatch | null;
  treeH: number;
}) {
  const champion = finalMatch ? getMatchWinner(finalMatch) : null;

  return (
    <div
      className="relative shrink-0 flex flex-col items-center justify-center px-3"
      style={{ width: COL_W + 24, height: treeH, paddingTop: 36 }}
    >
      {/* 冠军 */}
      <div className="mb-3 text-center">
        <div className="text-lg mb-1">🏆</div>
        <p className="font-mono text-[8px] font-bold uppercase tracking-widest" style={{ color: "var(--ft-text-dim)" }}>
          CHAMPION
        </p>
        {champion ? (
          <div className="flex items-center justify-center gap-1.5 mt-1">
            {champion.crest && (
              <div className="relative h-5 w-5">
                <Image src={champion.crest} alt="" fill className="object-contain" sizes="20px" />
              </div>
            )}
            <span className="text-[11px] font-bold" style={{ color: "var(--ft-green)" }}>
              {champion.nameZh || champion.code}
            </span>
          </div>
        ) : (
          <span className="text-[11px]" style={{ color: "var(--ft-text-dim)" }}>—</span>
        )}
      </div>

      {finalMatch && (
        <div className="w-full mb-3">
          <BracketMatchCard match={finalMatch} tag="FINAL · 决赛" />
        </div>
      )}

      {thirdPlace && (
        <div className="w-full">
          <BracketMatchCard match={thirdPlace} tag="BRONZE · 季军战" />
        </div>
      )}
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

interface KnockoutBracketProps {
  rounds: KnockoutRound[];
  thirdPlace?: DisplayMatch | null;
}

export default function KnockoutBracket({ rounds, thirdPlace }: KnockoutBracketProps) {
  if (rounds.length === 0) return null;

  const wingRounds = rounds.filter((r) => r.stage !== "Final");
  const finalRound = rounds.find((r) => r.stage === "Final");
  const finalMatch = finalRound?.matches[0] ?? null;

  const outerCount = wingRounds.length > 0
    ? Math.max(1, Math.ceil(wingRounds[0].matches.length / 2))
    : 1;
  const treeH = treeHeight(outerCount);

  const leftWing = wingRounds.map((r) => {
    const { left } = splitHalf(r.matches);
    return { label: r.label, labelEn: r.labelEn, matches: left };
  });

  const rightWing = wingRounds.map((r) => {
    const { right } = splitHalf(r.matches);
    return { label: r.label, labelEn: r.labelEn, matches: right };
  });

  return (
    <section style={CARD}>
      <div
        className="flex flex-wrap items-center justify-between gap-2 px-4 md:px-5 py-3"
        style={{ borderBottom: "1px solid var(--ft-divider)", backgroundColor: "var(--ft-bg-section)" }}
      >
        <div>
          <p className="ft-label">KNOCKOUT BRACKET · 淘汰赛晋级形势</p>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--ft-text-muted)" }}>
            左右半区对称 · 根据最新赛果更新
          </p>
        </div>
        <span className="font-mono text-[9px]" style={{ color: "var(--ft-text-dim)" }}>
          {rounds.reduce((n, r) => n + r.matches.length, 0)} 场淘汰赛
        </span>
      </div>

      <div className="overflow-x-auto px-2 md:px-4 pt-11 pb-5 md:pb-6">
        <div className="flex items-start justify-center min-w-max mx-auto gap-0">
          <BracketHalf side="left" wingRounds={leftWing} outerCount={outerCount} treeH={treeH} />
          <CenterPodium finalMatch={finalMatch} thirdPlace={thirdPlace ?? null} treeH={treeH} />
          <BracketHalf side="right" wingRounds={rightWing} outerCount={outerCount} treeH={treeH} />
        </div>
      </div>
    </section>
  );
}
