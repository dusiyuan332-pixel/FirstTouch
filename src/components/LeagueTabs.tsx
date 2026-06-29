"use client";

import { useState } from "react";
import Image from "next/image";
import type { LeagueStandings, LeagueTableRow } from "@/lib/footballDataApi";

// ─── 联赛 Tab 元数据 ──────────────────────────────────────────────────────────

const LEAGUE_ORDER = ["PL", "PD", "BL1", "SA", "FL1"];
const LEAGUE_LABELS: Record<string, string> = {
  PL: "英超", PD: "西甲", BL1: "德甲", SA: "意甲", FL1: "法甲",
};

// ─── 积分榜行 ─────────────────────────────────────────────────────────────────

function StandingsRow({ row, highlight }: { row: LeagueTableRow; highlight: boolean }) {
  const posColor =
    row.position <= 4  ? "var(--ft-blue)"  :
    row.position <= 6  ? "rgba(0,92,56,0.8)" :
    row.position >= 18 ? "var(--ft-red)"   : "var(--ft-text-muted)";

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 ft-row-hover min-w-[340px]"
      style={{
        borderBottom: "1px solid var(--ft-divider)",
        backgroundColor: highlight ? "rgba(0,40,85,0.04)" : undefined,
      }}
    >
      {/* 排名 */}
      <span
        className="w-6 shrink-0 text-center font-mono text-[11px] font-bold"
        style={{ color: posColor }}
      >
        {row.position}
      </span>

      {/* 队徽 + 队名 */}
      <div className="flex flex-1 items-center gap-2 min-w-0">
        {row.team.crest ? (
          <div className="relative h-5 w-5 shrink-0">
            <Image src={row.team.crest} alt={row.team.tla} fill className="object-contain" sizes="20px" />
          </div>
        ) : (
          <div className="h-5 w-5 shrink-0 flex items-center justify-center font-mono text-[8px]"
            style={{ backgroundColor: "var(--ft-bg-panel)", border: "1px solid var(--ft-border)", color: "var(--ft-text-muted)" }}>
            {row.team.tla}
          </div>
        )}
        <span className="truncate text-[13px] font-medium" style={{ color: "var(--ft-navy)" }}>
          {row.team.shortName || row.team.name}
        </span>
      </div>

      {/* 数据列 */}
      {[row.playedGames, row.won, row.draw, row.lost].map((v, i) => (
        <span key={i} className="w-7 shrink-0 text-center font-mono text-[12px]"
          style={{ color: "var(--ft-text-muted)" }}>{v}</span>
      ))}
      <span className="w-10 shrink-0 text-center font-mono text-[12px]"
        style={{ color: row.goalDifference > 0 ? "var(--ft-green)" : row.goalDifference < 0 ? "var(--ft-red)" : "var(--ft-text-muted)" }}>
        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
      </span>
      <span className="w-8 shrink-0 text-center font-mono text-[13px] font-bold"
        style={{ color: "var(--ft-navy)" }}>{row.points}</span>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

interface LeagueTabsProps {
  standings: LeagueStandings[];
}

export default function LeagueTabs({ standings }: LeagueTabsProps) {
  const ordered = LEAGUE_ORDER
    .map((code) => standings.find((s) => s.competition.code === code))
    .filter(Boolean) as LeagueStandings[];

  const [activeCode, setActiveCode] = useState(ordered[0]?.competition.code ?? "PL");
  const active = ordered.find((s) => s.competition.code === activeCode) ?? ordered[0];

  if (!active) return (
    <div className="py-12 text-center ft-label" style={{ border: "1px solid var(--ft-border)" }}>
      积分榜数据加载失败 · 请检查 FOOTBALL_DATA_KEY
    </div>
  );

  return (
    <div>
      {/* Tab 栏 */}
      <div className="mb-5 flex overflow-x-auto scrollbar-none"
        style={{ borderBottom: "1px solid var(--ft-border)" }}>
        {ordered.map((s) => {
          const isActive = s.competition.code === activeCode;
          return (
            <button key={s.competition.code}
              onClick={() => setActiveCode(s.competition.code)}
              className="shrink-0 px-6 py-3 text-[13px] transition-colors focus-visible:outline-none"
              style={{
                color: isActive ? "var(--ft-navy)" : "var(--ft-text-muted)",
                borderBottom: isActive ? "2px solid var(--ft-navy)" : "2px solid transparent",
                marginBottom: "-1px",
                fontWeight: isActive ? 600 : 400,
              }}>
              {LEAGUE_LABELS[s.competition.code] ?? s.nameZh}
            </button>
          );
        })}
      </div>

      {/* 积分表 */}
      <div className="overflow-x-auto" style={{ border: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-card)" }}>
        {/* 表头 */}
        <div className="flex items-center gap-3 px-4 py-2.5 min-w-[340px]"
          style={{ borderBottom: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-section)" }}>
          <span className="w-6 shrink-0 text-center ft-label">#</span>
          <span className="flex-1 ft-label">球队</span>
          {["PL", "W", "D", "L", "GD", "PTS"].map((h) => (
            <span key={h}
              className={`shrink-0 text-center ft-label font-semibold ${
                h === "GD" ? "w-10 hidden sm:inline-block" :
                h === "PTS" ? "w-8" :
                (h === "W" || h === "D" || h === "L") ? "w-7 hidden xs:inline-block" : "w-7"
              }`}
              style={{ color: h === "PTS" ? "var(--ft-navy)" : undefined }}>
              {h}
            </span>
          ))}
        </div>

        {/* 数据行 */}
        {active.table.map((row) => (
          <StandingsRow key={row.team.id} row={row} highlight={row.position <= 4} />
        ))}

        {/* 图例 */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6 px-4 py-3 min-w-[340px]"
          style={{ borderTop: "1px solid var(--ft-divider)", backgroundColor: "var(--ft-bg-section)" }}>
          {[
            { color: "var(--ft-blue)", label: "欧冠资格" },
            { color: "rgba(0,92,56,0.8)", label: "欧联杯" },
            { color: "var(--ft-red)", label: "降级区" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="h-2 w-2 shrink-0" style={{ backgroundColor: color }} />
              <span className="ft-label">{label}</span>
            </div>
          ))}
          <span className="ml-auto ft-label">2025/26 Final · football-data.org</span>
        </div>
      </div>
    </div>
  );
}
