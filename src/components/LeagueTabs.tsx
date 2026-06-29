"use client";

import { useState } from "react";
import { LEAGUES_2027, daysUntil, formatFixtureDate, type LeagueInfo } from "@/data/leagues2027";

// ─── 开幕倒计时条 ─────────────────────────────────────────────────────────────

function OpeningBanner({ league }: { league: LeagueInfo }) {
  const days = daysUntil(league.openingDate);
  return (
    <div
      className="mb-4 flex items-center justify-between px-5 py-4"
      style={{
        border: "1px solid var(--ft-border)",
        backgroundColor: "var(--ft-bg-section)",
        borderLeft: "3px solid var(--ft-navy)",
      }}
    >
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--ft-navy)" }}>
          {league.nameEn} 2026/27
        </p>
        <p className="ft-label mt-1">开幕日 · {formatFixtureDate(league.openingDate)}</p>
      </div>
      <div className="text-right">
        {days > 0 ? (
          <>
            <p className="font-mono text-2xl font-black" style={{ color: "var(--ft-navy)" }}>{days}</p>
            <p className="ft-label">天后开赛</p>
          </>
        ) : (
          <span
            className="font-mono text-[10px] font-bold px-3 py-1.5 uppercase tracking-wider"
            style={{
              backgroundColor: "rgba(0,92,56,0.08)",
              color: "var(--ft-green)",
              border: "1px solid rgba(0,92,56,0.15)",
            }}
          >
            赛季进行中
          </span>
        )}
      </div>
    </div>
  );
}

// ─── 单场赛程行 ───────────────────────────────────────────────────────────────

function FixtureRow({ fixture, showDate }: { fixture: LeagueInfo["fixtures"][0]; showDate: boolean }) {
  return (
    <div
      className="flex items-center gap-3 px-5 py-3 ft-row-hover"
      style={{ borderBottom: "1px solid var(--ft-divider)" }}
    >
      <div className="w-20 shrink-0 text-right">
        {showDate ? (
          <span className="font-mono text-[10px]" style={{ color: "var(--ft-text-muted)" }}>
            {formatFixtureDate(fixture.date)}
          </span>
        ) : (
          <span className="ft-label">—</span>
        )}
      </div>
      <span className="flex-1 text-right text-[13px] font-medium" style={{ color: "var(--ft-navy)" }}>
        {fixture.homeTeam}
      </span>
      <div className="flex w-24 shrink-0 flex-col items-center gap-0.5">
        <span className="ft-label">VS</span>
        <span className="font-mono text-[10px]" style={{ color: "var(--ft-text-muted)" }}>
          {fixture.time} UTC
        </span>
      </div>
      <span className="flex-1 text-[13px] font-medium" style={{ color: "var(--ft-navy)" }}>
        {fixture.awayTeam}
      </span>
      <span className="w-20 shrink-0 text-right ft-label">待上线</span>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

export default function LeagueTabs() {
  const [activeCode, setActiveCode] = useState(LEAGUES_2027[0].code);
  const active = LEAGUES_2027.find((l) => l.code === activeCode)!;

  const dateGroups = active.fixtures.reduce<Record<string, typeof active.fixtures>>(
    (acc, f) => {
      (acc[f.date] = acc[f.date] ?? []).push(f);
      return acc;
    },
    {}
  );
  const sortedDates = Object.keys(dateGroups).sort();

  return (
    <div>
      {/* Tab 栏 */}
      <div
        className="mb-5 flex overflow-x-auto scrollbar-none"
        style={{ borderBottom: "1px solid var(--ft-border)" }}
      >
        {LEAGUES_2027.map((league) => {
          const isActive = activeCode === league.code;
          return (
            <button
              key={league.code}
              onClick={() => setActiveCode(league.code)}
              className="shrink-0 px-6 py-3 text-[13px] font-medium transition-colors focus-visible:outline-none"
              style={{
                color: isActive ? "var(--ft-navy)" : "var(--ft-text-muted)",
                borderBottom: isActive ? "2px solid var(--ft-navy)" : "2px solid transparent",
                marginBottom: "-1px",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {league.nameZh}
            </button>
          );
        })}
      </div>

      {/* 开幕倒计时 */}
      <OpeningBanner league={active} />

      {/* 赛程列表 */}
      <div style={{ border: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-card)" }}>
        {/* 表头 */}
        <div
          className="flex items-center gap-3 px-5 py-3"
          style={{
            borderBottom: "1px solid var(--ft-border)",
            backgroundColor: "var(--ft-bg-section)",
          }}
        >
          <span className="w-20 shrink-0 ft-label text-right">日期</span>
          <span className="flex-1 text-right ft-label">主队</span>
          <span className="w-24 shrink-0 text-center ft-label">开赛时间</span>
          <span className="flex-1 ft-label">客队</span>
          <span className="w-20 shrink-0 text-right ft-label">分析状态</span>
        </div>

        {sortedDates.map((date) =>
          dateGroups[date].map((fixture, i) => (
            <FixtureRow key={fixture.id} fixture={fixture} showDate={i === 0} />
          ))
        )}

        {/* 底部说明 */}
        <div
          className="px-5 py-3"
          style={{ borderTop: "1px solid var(--ft-divider)", backgroundColor: "var(--ft-bg-section)" }}
        >
          <p className="ft-label">
            2026/27 赛季预期赛程 · 开赛后由 API 实时替换 · Matchday 1 Preview
          </p>
        </div>
      </div>
    </div>
  );
}
