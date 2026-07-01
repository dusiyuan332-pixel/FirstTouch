/**
 * KnockoutBracket — 全宽左右半区晋级树（贴边、可读卡片）
 */

import Link from "next/link";
import Image from "next/image";
import type { DisplayMatch, DisplayTeam, KnockoutRound } from "@/lib/footballDataApi";
import {
  getMatchWinner,
  isPlaceholderTeam,
  propagateWinnersInWing,
  propagateFinalMatch,
  TBD_TEAM,
} from "@/lib/footballDataApi";

const MATCH_H = 36;
const ROW_H = 30;
const CONN_W = 10;
const CENTER_W = 88;
const TEAM_ROW_H = 17;

const CARD = {
  border: "1px solid var(--ft-border)",
  backgroundColor: "var(--ft-bg-card)",
  borderRadius: "5px",
} as const;

// ─── 比赛卡 ─────────────────────────────────────────────────────────────────

function TeamRow({
  team, score, isWinner, isLoser,
}: {
  team: DisplayTeam; score?: number; isWinner: boolean; isLoser: boolean;
}) {
  return (
    <div
      className="flex items-center gap-1 px-1.5 min-w-0"
      style={{
        height: TEAM_ROW_H,
        backgroundColor: isWinner ? "rgba(0,92,56,0.07)" : undefined,
        opacity: isLoser ? 0.42 : 1,
      }}
    >
      {team.crest && (
        <div className="relative h-4 w-4 shrink-0">
          <Image src={team.crest} alt="" fill className="object-contain" sizes="16px" unoptimized />
        </div>
      )}
      <span
        className="flex-1 font-mono text-[11px] truncate leading-tight"
        style={{
          color: team.code === "TBD"
            ? "var(--ft-text-dim)"
            : isWinner ? "#005c38" : "var(--ft-navy)",
          fontWeight: isWinner ? 700 : 500,
          fontStyle: team.code === "TBD" ? "italic" : undefined,
        }}
      >
        {team.code}
      </span>
      {score !== undefined && (
        <span
          className="font-mono text-[11px] font-bold tabular-nums w-4 text-right shrink-0"
          style={{ color: isWinner ? "#005c38" : "var(--ft-navy)" }}
        >
          {score}
        </span>
      )}
    </div>
  );
}

function formatShortDate(date: string): string {
  const d = new Date(date + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function BracketMatchCard({ match, tag }: { match: DisplayMatch; tag?: string }) {
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const isScheduled = !isFinished && !isLive;
  const winner = getMatchWinner(match);

  const homeTeam = isPlaceholderTeam(match.homeTeam) ? TBD_TEAM : match.homeTeam;
  const awayTeam = isPlaceholderTeam(match.awayTeam) ? TBD_TEAM : match.awayTeam;
  const homeWins = winner?.code === match.homeTeam.code;
  const awayWins = winner?.code === match.awayTeam.code;
  const bothTbd = isPlaceholderTeam(match.homeTeam) && isPlaceholderTeam(match.awayTeam);

  return (
    <Link
      href={`/worldcup/match/${match.id}`}
      className="block w-full no-underline relative"
      style={{
        ...CARD,
        height: MATCH_H,
        borderLeft: isLive ? "2px solid var(--ft-red)" : undefined,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      {tag && (
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 px-1.5 py-0.5 whitespace-nowrap rounded-sm"
          style={{ backgroundColor: tag.includes("BRONZE") ? "#93c5fd" : "#f5c518" }}
        >
          <span className="font-mono text-[7px] font-bold uppercase" style={{ color: "#1e293b" }}>
            {tag.includes("BRONZE") ? "3RD" : "FINAL"}
          </span>
        </div>
      )}
      <TeamRow team={homeTeam} score={match.score?.home}
        isWinner={homeWins} isLoser={isFinished && awayWins} />
      <div style={{ borderTop: "1px solid var(--ft-divider)" }} />
      <TeamRow team={awayTeam} score={match.score?.away}
        isWinner={awayWins} isLoser={isFinished && homeWins} />

      {isScheduled && bothTbd && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none px-1 rounded-sm"
          style={{ backgroundColor: "var(--ft-bg-card)" }}
        >
          <span className="font-mono text-[9px] leading-none whitespace-nowrap" style={{ color: "var(--ft-text-dim)" }}>
            {formatShortDate(match.date)}
          </span>
        </div>
      )}
      {isScheduled && !bothTbd && (
        <div className="absolute bottom-0 left-0 right-0 text-center py-px pointer-events-none"
          style={{ backgroundColor: "rgba(255,255,255,0.9)", borderTop: "1px solid var(--ft-divider)" }}>
          <span className="font-mono text-[7px]" style={{ color: "var(--ft-text-dim)" }}>
            {formatShortDate(match.date)}
          </span>
        </div>
      )}
      {isLive && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none px-1"
          style={{ backgroundColor: "var(--ft-bg-card)" }}
        >
          <span className="font-mono text-[8px] font-bold animate-pulse" style={{ color: "var(--ft-red)" }}>LIVE</span>
        </div>
      )}
    </Link>
  );
}

// ─── 布局 ───────────────────────────────────────────────────────────────────

function splitHalf(matches: DisplayMatch[]) {
  const mid = Math.ceil(matches.length / 2);
  return { left: matches.slice(0, mid), right: matches.slice(mid) };
}

function matchTop(roundIndex: number, matchIndex: number): number {
  const blockSpan = Math.pow(2, roundIndex + 1);
  return matchIndex * blockSpan * ROW_H + ((blockSpan - 1) * ROW_H) / 2;
}

function calcTreeHeight(outerCount: number): number {
  return outerCount * ROW_H * 2;
}

function Connector({ matchCount, roundIndex, treeH, flip }: {
  matchCount: number; roundIndex: number; treeH: number; flip?: boolean;
}) {
  const x1 = flip ? CONN_W : 0;
  const x2 = flip ? 0 : CONN_W;
  const xMid = CONN_W / 2;
  return (
    <svg width={CONN_W} height={treeH} className="shrink-0 overflow-visible pointer-events-none">
      {Array.from({ length: matchCount }, (_, i) => {
        const y = matchTop(roundIndex, i) + MATCH_H / 2;
        return <line key={`h${i}`} x1={x1} y1={y} x2={xMid} y2={y} stroke="#d1d5db" strokeWidth={1} />;
      })}
      {Array.from({ length: Math.ceil(matchCount / 2) }, (_, p) => {
        const i = p * 2;
        const y1 = matchTop(roundIndex, i) + MATCH_H / 2;
        const y2 = i + 1 < matchCount ? matchTop(roundIndex, i + 1) + MATCH_H / 2 : y1;
        const yMid = (y1 + y2) / 2;
        return (
          <g key={`v${p}`}>
            <line x1={xMid} y1={y1} x2={xMid} y2={y2} stroke="#d1d5db" strokeWidth={1} />
            <line x1={xMid} y1={yMid} x2={x2} y2={yMid} stroke="#d1d5db" strokeWidth={1} />
          </g>
        );
      })}
    </svg>
  );
}

function RoundColumn({ matches, roundIndex, treeH }: {
  matches: DisplayMatch[]; roundIndex: number; treeH: number;
}) {
  if (matches.length === 0) return <div className="flex-1 min-w-0" />;
  return (
    <div className="relative flex-1 min-w-0" style={{ height: treeH }}>
      {matches.map((m, i) => (
        <div
          key={m.id}
          className="absolute left-0 right-0"
          style={{ top: matchTop(roundIndex, i), height: MATCH_H }}
        >
          <BracketMatchCard match={m} />
        </div>
      ))}
    </div>
  );
}

function BracketHalf({ side, wingRounds, treeH }: {
  side: "left" | "right";
  wingRounds: { matches: DisplayMatch[]; roundIndex: number }[];
  treeH: number;
}) {
  const cols = side === "left" ? wingRounds : [...wingRounds].reverse();

  return (
    <div className="flex flex-1 min-w-0 items-start">
      {cols.map((col, colIdx) => (
        <div key={`${side}-${col.roundIndex}`} className="flex flex-1 min-w-0 items-start">
          {side === "right" && colIdx > 0 && (
            <Connector matchCount={col.matches.length} roundIndex={col.roundIndex} treeH={treeH} flip />
          )}
          <RoundColumn matches={col.matches} roundIndex={col.roundIndex} treeH={treeH} />
          {side === "left" && colIdx < cols.length - 1 && (
            <Connector matchCount={col.matches.length} roundIndex={col.roundIndex} treeH={treeH} />
          )}
        </div>
      ))}
    </div>
  );
}

function CenterPodium({ finalMatch, thirdPlace, treeH }: {
  finalMatch: DisplayMatch | null;
  thirdPlace: DisplayMatch | null;
  treeH: number;
}) {
  const champion = finalMatch ? getMatchWinner(finalMatch) : null;
  const midY = treeH / 2;

  return (
    <div className="relative shrink-0 px-1" style={{ width: CENTER_W, height: treeH }}>
      <div className="absolute left-0 right-0 text-center" style={{ top: Math.max(4, midY - 100) }}>
        <div className="text-base leading-none mb-0.5">🏆</div>
        <p className="font-mono text-[7px] font-bold uppercase tracking-widest" style={{ color: "var(--ft-text-dim)" }}>
          CHAMPION
        </p>
        {champion ? (
          <div className="flex items-center justify-center gap-1 mt-1">
            {champion.crest && (
              <div className="relative h-4 w-4">
                <Image src={champion.crest} alt="" fill className="object-contain" sizes="16px" unoptimized />
              </div>
            )}
            <span className="font-mono text-[10px] font-bold" style={{ color: "#005c38" }}>{champion.code}</span>
          </div>
        ) : (
          <span className="font-mono text-[10px]" style={{ color: "var(--ft-text-dim)" }}>—</span>
        )}
      </div>

      {finalMatch && (
        <div className="absolute left-0 right-0" style={{ top: midY - 44 }}>
          <BracketMatchCard match={finalMatch} tag="FINAL" />
        </div>
      )}

      {thirdPlace && (
        <div className="absolute left-0 right-0" style={{ top: midY + 14 }}>
          <BracketMatchCard match={thirdPlace} tag="BRONZE" />
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

  const wingRoundsMeta = rounds.filter((r) => r.stage !== "Final");
  const finalMatch = rounds.find((r) => r.stage === "Final")?.matches[0] ?? null;

  const outerCount = wingRoundsMeta.length > 0
    ? Math.max(1, Math.ceil(wingRoundsMeta[0].matches.length / 2))
    : 1;
  const treeH = calcTreeHeight(outerCount);

  const leftWingRaw = wingRoundsMeta
    .map((r, i) => ({ matches: splitHalf(r.matches).left, roundIndex: i }))
    .filter((c) => c.matches.length > 0);

  const rightWingRaw = wingRoundsMeta
    .map((r, i) => ({ matches: splitHalf(r.matches).right, roundIndex: i }))
    .filter((c) => c.matches.length > 0);

  const leftPropagated = propagateWinnersInWing(leftWingRaw.map((c) => c.matches));
  const rightPropagated = propagateWinnersInWing(rightWingRaw.map((c) => c.matches));

  const leftWing = leftWingRaw.map((c, i) => ({
    roundIndex: c.roundIndex,
    matches: leftPropagated[i] ?? c.matches,
  }));

  const rightWing = rightWingRaw.map((c, i) => ({
    roundIndex: c.roundIndex,
    matches: rightPropagated[i] ?? c.matches,
  }));

  const leftInner = leftPropagated[leftPropagated.length - 1]?.[0] ?? null;
  const rightInner = rightPropagated[rightPropagated.length - 1]?.[0] ?? null;
  const enrichedFinal = propagateFinalMatch(finalMatch, leftInner, rightInner);

  return (
    <section style={{ ...CARD, borderRadius: 0 }}>
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: "1px solid var(--ft-divider)", backgroundColor: "var(--ft-bg-section)" }}
      >
        <p className="ft-label">KNOCKOUT BRACKET · 淘汰赛晋级形势</p>
        <span className="font-mono text-[8px]" style={{ color: "var(--ft-text-dim)" }}>
          {rounds.reduce((n, r) => n + r.matches.length, 0)} 场
        </span>
      </div>

      {/* 全宽贴边，无横向 padding */}
      <div className="w-full px-1 py-4">
        <div className="flex w-full items-start">
          <BracketHalf side="left" wingRounds={leftWing} treeH={treeH} />
          <CenterPodium finalMatch={enrichedFinal} thirdPlace={thirdPlace ?? null} treeH={treeH} />
          <BracketHalf side="right" wingRounds={rightWing} treeH={treeH} />
        </div>
      </div>
    </section>
  );
}
