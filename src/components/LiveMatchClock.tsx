"use client";

/**
 * LiveMatchClock — 实时比赛计时器 + 比分
 *
 * 时钟计算原则（用户需求）：
 *  · 上半场：elapsed = now − kickoffTime（纯本地，无需 API）
 *  · 中场：API 返回 PAUSED → 冻结显示 "HT"，停止走秒
 *  · 下半场：API 从 PAUSED → IN_PLAY 时记录第二阶段开始时刻；
 *           显示 = 45 + (now − secondHalfStart)
 *  · 如页面刷新导致 secondHalfStart 丢失，退化为 elapsed − 15min（15分钟中场估算）
 */

import { useEffect, useRef, useState } from "react";

interface Props {
  score: { home: number; away: number };
  kickoffDate: string; // "2026-06-30"
  kickoffTime: string; // "01:00"
  statusDetail?: "IN_PLAY" | "PAUSED";
}

const HALFTIME_EST_MS = 15 * 60 * 1000; // 估算中场时长 15 分钟

export default function LiveMatchClock({ score, kickoffDate, kickoffTime, statusDetail }: Props) {
  const kickoffMs = new Date(`${kickoffDate}T${kickoffTime.padStart(5,"0")}:00Z`).getTime();

  // 记录第二阶段开球时刻（仅在 PAUSED→IN_PLAY 转换时写入）
  const secondHalfStartRef = useRef<number | null>(null);
  const prevStatus = useRef<string | undefined>(statusDetail);

  const [tick, setTick] = useState(0);

  // 检测 PAUSED → IN_PLAY（二阶段开球）
  useEffect(() => {
    if (prevStatus.current === "PAUSED" && statusDetail === "IN_PLAY") {
      secondHalfStartRef.current = Date.now();
    }
    prevStatus.current = statusDetail;
  }, [statusDetail]);

  // 每秒刷新（中场暂停时停止）
  useEffect(() => {
    if (statusDetail === "PAUSED") return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [statusDetail]);

  // ── 中场休息 ──────────────────────────────────────────────────────────────
  if (statusDetail === "PAUSED") {
    return (
      <div className="flex flex-col items-center gap-1">
        <ScoreLine score={score} />
        <span
          className="animate-pulse font-mono text-[11px] font-bold uppercase tracking-wide"
          style={{ color: "var(--ft-amber)" }}
        >
          Half Time
        </span>
      </div>
    );
  }

  // ── 计算当前比赛分钟 ──────────────────────────────────────────────────────
  const now = Date.now();
  const totalElapsedMs = now - kickoffMs;
  const totalElapsedSecs = Math.max(0, Math.floor(totalElapsedMs / 1000));

  let displayMin: number;
  let displaySec: number;

  if (totalElapsedSecs <= 45 * 60) {
    // 上半场：直接用经过时间
    displayMin = Math.floor(totalElapsedSecs / 60);
    displaySec = totalElapsedSecs % 60;
  } else {
    // 下半场或加时
    const sh2Start = secondHalfStartRef.current;
    if (sh2Start !== null) {
      // 精确：用检测到的二阶段开球时刻
      const sh2Elapsed = Math.max(0, Math.floor((now - sh2Start) / 1000));
      displayMin = Math.min(45 + Math.floor(sh2Elapsed / 60), 95);
      displaySec = sh2Elapsed % 60;
    } else {
      // 退化方案：elapsed − 估算中场时长（15min）
      const adjusted = Math.max(0, totalElapsedSecs - Math.floor(HALFTIME_EST_MS / 1000));
      displayMin = Math.min(45 + Math.floor(adjusted / 60), 95);
      displaySec = adjusted % 60;
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <ScoreLine score={score} />
      <div className="flex items-center gap-1.5">
        {/* 跳动红点 */}
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
            style={{ backgroundColor: "var(--ft-red)" }}
          />
          <span
            className="relative inline-flex h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: "var(--ft-red)" }}
          />
        </span>
        <span
          className="font-mono text-sm font-bold tabular-nums leading-none"
          style={{ color: "var(--ft-red)" }}
        >
          {displayMin}&apos;{String(displaySec).padStart(2, "0")}
        </span>
        <span className="ft-label" style={{ color: "var(--ft-text-dim)" }}>LIVE</span>
      </div>
    </div>
  );
}

function ScoreLine({ score }: { score: { home: number; away: number } }) {
  return (
    <span className="font-mono text-2xl font-black tabular-nums" style={{ color: "var(--ft-navy)" }}>
      {score.home}
      <span style={{ color: "var(--ft-text-dim)", margin: "0 6px" }}>–</span>
      {score.away}
    </span>
  );
}
