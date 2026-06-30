"use client";

/**
 * LiveMatchClock — 实时比赛计时器 + 比分显示
 *
 * 原理：
 *  1. 从服务端收到 apiMinute（API 上一次返回的比赛分钟数）
 *  2. 记录组件挂载时刻，本地每秒 +1 秒，推算当前分钟
 *  3. 每当 LiveRefresher 调用 router.refresh()，服务端重新渲染，
 *     组件 re-mount，apiMinute 更新，时钟重新校准
 *  这样在 API 更新间隔（60s）内，时钟仍可流畅走动。
 */

import { useEffect, useRef, useState } from "react";

interface Props {
  score: { home: number; away: number };
  /** API 返回的比赛分钟，undefined = 刚开球但 API 尚未返回 minute */
  apiMinute?: number;
  /** "IN_PLAY" | "PAUSED"（中场） */
  statusDetail?: "IN_PLAY" | "PAUSED";
}

export default function LiveMatchClock({ score, apiMinute, statusDetail }: Props) {
  // 记录挂载时间，用于本地推算经过秒数
  const mountedAt = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0); // 自挂载后经过的秒数

  useEffect(() => {
    mountedAt.current = Date.now();
    setElapsed(0);

    if (statusDetail === "PAUSED") return; // 中场不走秒

    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - mountedAt.current) / 1000));
    }, 1000);

    return () => clearInterval(id);
  }, [apiMinute, statusDetail]); // apiMinute 更新时重新校准

  // 中场休息
  if (statusDetail === "PAUSED") {
    return (
      <div className="flex flex-col items-center gap-1">
        <ScoreLine score={score} />
        <span
          className="font-mono text-[11px] font-bold uppercase tracking-wide animate-pulse"
          style={{ color: "var(--ft-amber)" }}
        >
          Half Time
        </span>
      </div>
    );
  }

  // 计算当前显示分钟
  const base = apiMinute ?? 0;
  const addedMins = Math.floor(elapsed / 60);
  const displayMin = Math.min(base + addedMins, 90); // 不超过 90'
  const displaySec = elapsed % 60;

  return (
    <div className="flex flex-col items-center gap-1">
      <ScoreLine score={score} />
      {/* 时钟行 */}
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
    <span
      className="font-mono text-2xl font-black tabular-nums"
      style={{ color: "var(--ft-navy)" }}
    >
      {score.home}
      <span style={{ color: "var(--ft-text-dim)", margin: "0 6px" }}>–</span>
      {score.away}
    </span>
  );
}
