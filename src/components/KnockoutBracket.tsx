/**
 * KnockoutBracket — FotMob 比例：左右半区 + 中心区，紧凑无横滚
 */

import Link from "next/link";
import Image from "next/image";
import BracketFit from "@/components/BracketFit";
import type { DisplayMatch, DisplayTeam, KnockoutRound } from "@/lib/footballDataApi";
import { getMatchWinner } from "@/lib/footballDataApi";

// FotMob 风格紧凑尺寸（设计稿 720px 宽）
const MATCH_H = 26;
const ROW_H = 26;
const COL_W = 68;
const CONN_W = 8;
const CENTER_W = 76;
const HEADER_H = 28;

const CARD = {
  border: "1px solid var(--ft-border)",
  backgroundColor: "var(--ft-bg-card)",
  borderRadius: "4px",
} as const;

// ─── 紧凑比赛卡（FotMob：双行队名 + 中间日期/比分）────────────────────────

function TeamRow({
  team, score, isWinner, isLoser,
}: {
  team: DisplayTeam; score?: number; isWinner: boolean; isLoser: boolean;
}) {
  return (
    <div
      className="flex items-center gap-0.5 px-1 h-[13px] min-w-0"
      style={{ backgroundColor: isWinner ? "rgba(0,92,56,0.07)" : undefined, opacity: isLoser ? 0.4 : 1 }}
    >
      {team.crest ? (
        <div className="relative h-3 w-3 shrink-0">
          <Image src={team.crest} alt="" fill className="object-contain" sizes="12px" unoptimized />
        </div>
      ) : null}
      <span
        className="flex-1 font-mono text-[9px] truncate leading-none"
        style={{ color: isWinner ? "#005c38" : "var(--ft-navy)", fontWeight: isWinner ? 700 : 500 }}
      >
        {team.code}
      </span>
      {score !== undefined && (
        <span className="font-mono text-[9px] font-bold tabular-nums leading-none w-3 text-right shrink-0"
          style={{ color: isWinner ? "#005c38" : "var(--ft-navy)" }}>
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
  const homeWins = winner?.code === match.homeTeam.code;
  const awayWins = winner?.code === match.awayTeam.code;

  return (
    <Link
      href={`/worldcup/match/${match.id}`}
      className="block no-underline relative"
      style={{
        ...CARD,
        height: MATCH_H,
        borderLeft: isLive ? "2px solid var(--ft-red)" : undefined,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      {tag && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-1 py-px whitespace-nowrap"
          style={{ backgroundColor: tag.includes("FINAL") && !tag.includes("BRONZE") ? "#f5c518" : "#93c5fd", borderRadius: 2 }}
        >
          <span className="font-mono text-[6px] font-bold uppercase" style={{ color: "#1e293b" }}>
            {tag.includes("BRONZE") ? "3RD" : "FINAL"}
          </span>
        </div>
      )}
      <TeamRow team={match.homeTeam} score={match.score?.home}
        isWinner={homeWins} isLoser={isFinished && awayWins} />
      <div style={{ borderTop: "1px solid var(--ft-divider)" }} />
      <TeamRow team={match.awayTeam} score={match.score?.away}
        isWinner={awayWins} isLoser={isFinished && homeWins} />

      {isScheduled && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none px-0.5"
          style={{ backgroundColor: "var(--ft-bg-card)" }}
        >
          <span className="font-mono text-[7px] leading-none whitespace-nowrap" style={{ color: "var(--ft-text-dim)" }}>
            {formatShortDate(match.date)}
          </span>
        </div>
      )}
      {isLive && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none px-0.5"
          style={{ backgroundColor: "var(--ft-bg-card)" }}>
          <span className="font-mono text-[6px] font-bold animate-pulse" style={{ color: "var(--ft-red)" }}>LIVE</span>
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
  if (matches.length === 0) return <div style={{ width: COL_W }} />;
  return (
    <div className="relative shrink-0" style={{ width: COL_W, height: treeH }}>
      {matches.map((m, i) => (
        <div key={m.id} className="absolute left-0 right-0" style={{ top: matchTop(roundIndex, i), height: MATCH_H }}>
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
  const cols = side === "left"
    ? wingRounds
    : [...wingRounds].reverse();

  return (
    <div className="flex shrink-0">
      {cols.map((col, colIdx) => (
        <div key={`${side}-${col.roundIndex}`} className="flex shrink-0">
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
    <div className="relative shrink-0" style={{ width: CENTER_W, height: treeH }}>
      {/* 冠军 */}
      <div className="absolute left-0 right-0 text-center" style={{ top: Math.max(0, midY - 90) }}>
        <div className="text-sm leading-none mb-0.5">🏆</div>
        <p className="font-mono text-[6px] font-bold uppercase tracking-widest" style={{ color: "var(--ft-text-dim)" }}>
          CHAMPION
        </p>
        {champion ? (
          <div className="flex items-center justify-center gap-0.5 mt-0.5">
            {champion.crest && (
              <div className="relative h-3.5 w-3.5">
                <Image src={champion.crest} alt="" fill className="object-contain" sizes="14px" unoptimized />
              </div>
            )}
            <span className="font-mono text-[8px] font-bold" style={{ color: "#005c38" }}>{champion.code}</span>
          </div>
        ) : (
          <span className="font-mono text-[8px]" style={{ color: "var(--ft-text-dim)" }}>—</span>
        )}
      </div>

      {finalMatch && (
        <div className="absolute left-0 right-0" style={{ top: midY - 38 }}>
          <BracketMatchCard match={finalMatch} tag="FINAL" />
        </div>
      )}

      {thirdPlace && (
        <div className="absolute left-0 right-0" style={{ top: midY + 12 }}>
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

  const leftWing = wingRoundsMeta
    .map((r, i) => ({ matches: splitHalf(r.matches).left, roundIndex: i }))
    .filter((c) => c.matches.length > 0);

  const rightWing = wingRoundsMeta
    .map((r, i) => ({ matches: splitHalf(r.matches).right, roundIndex: i }))
    .filter((c) => c.matches.length > 0);

  const roundCount = Math.max(leftWing.length, rightWing.length);
  const designWidth =
    roundCount * 2 * (COL_W + CONN_W) + CENTER_W;
  const designHeight = treeH + HEADER_H;

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

      <div className="px-2 md:px-3 py-3">
        <BracketFit designWidth={designWidth} designHeight={designHeight}>
          <div style={{ width: designWidth, height: designHeight, paddingTop: HEADER_H }}>
            <div className="flex items-start justify-center">
              <BracketHalf side="left" wingRounds={leftWing} treeH={treeH} />
              <CenterPodium finalMatch={finalMatch} thirdPlace={thirdPlace ?? null} treeH={treeH} />
              <BracketHalf side="right" wingRounds={rightWing} treeH={treeH} />
            </div>
          </div>
        </BracketFit>
      </div>
    </section>
  );
}
