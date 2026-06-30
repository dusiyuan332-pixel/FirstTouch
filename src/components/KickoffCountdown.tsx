"use client";

/**
 * KickoffCountdown — 开球倒计时组件
 * 仅在比赛开球前 60 分钟内显示，每秒更新一次。
 * 作为纯客户端组件，可安全嵌入任何 Server Component。
 */

import { useEffect, useState, type ReactNode } from "react";

interface Props {
  dateStr: string; // "2026-06-30"
  timeStr: string; // "17:00"
  variant?: "card" | "badge"; // card = 大显示，badge = 小标签
  /** card 模式下 >60min 时渲染的回退内容（静态时间） */
  fallback?: ReactNode;
}

function secondsLeft(dateStr: string, timeStr: string): number {
  const t = `${dateStr}T${timeStr.padStart(5, "0")}:00Z`;
  return Math.floor((new Date(t).getTime() - Date.now()) / 1000);
}

function fmt(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const THRESHOLD   = 60 * 60;  // 开赛前 60 分钟开始显示
const MAX_ELAPSED = 120 * 60; // 最多显示到开赛后 120 分钟（含加时）

export default function KickoffCountdown({ dateStr, timeStr, variant = "card", fallback }: Props) {
  const [secs, setSecs] = useState(() => secondsLeft(dateStr, timeStr));

  useEffect(() => {
    const s = secondsLeft(dateStr, timeStr);
    // 超过倒计时窗口且比赛已过 2 小时 → 不启动
    if (s > THRESHOLD) return;
    if (s < -MAX_ELAPSED) return;

    const id = setInterval(() => {
      setSecs(secondsLeft(dateStr, timeStr));
    }, 1000);

    return () => clearInterval(id);
  }, [dateStr, timeStr]);

  // 超过 60 分钟未开赛，或超过 2 小时仍未结束（按理已结束）→ fallback
  if (secs > THRESHOLD || secs < -MAX_ELAPSED) {
    return fallback ? <>{fallback}</> : null;
  }

  // ── 已过开球时间（API 尚未回报 live 状态）─────────────────────────────────
  if (secs <= 0) {
    const elapsedMin = Math.floor(-secs / 60);
    const elapsedSec = (-secs) % 60;

    if (variant === "badge") {
      return (
        <span
          className="inline-flex items-center gap-1 font-mono text-[9px] font-bold px-1.5 py-0.5"
          style={{
            backgroundColor: "rgba(176,28,28,0.08)",
            color: "var(--ft-red)",
            border: "1px solid rgba(176,28,28,0.2)",
          }}
        >
          <PulsingDot />
          {elapsedMin > 0 ? `${elapsedMin}'` : "KO"}
        </span>
      );
    }

    // card 模式：开球瞬间 (elapsedMin === 0) 显示 KICKOFF，之后显示估算时钟
    if (elapsedMin === 0) {
      return (
        <span className="animate-pulse font-mono text-sm font-black" style={{ color: "var(--ft-red)" }}>
          KICKOFF
        </span>
      );
    }

    return (
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-1.5">
          <PulsingDot />
          <span className="font-mono text-xl font-black tabular-nums" style={{ color: "var(--ft-red)" }}>
            {elapsedMin}&apos;{String(elapsedSec).padStart(2, "0")}
          </span>
        </div>
        <span className="ft-label" style={{ color: "var(--ft-text-dim)" }}>
          LIVE · API 同步中
        </span>
      </div>
    );
  }

  // ── 倒计时（secs > 0）─────────────────────────────────────────────────────
  if (variant === "badge") {
    return (
      <span
        className="inline-flex items-center gap-1 font-mono text-[9px] font-bold px-1.5 py-0.5"
        style={{
          backgroundColor: "rgba(176,28,28,0.08)",
          color: "var(--ft-red)",
          border: "1px solid rgba(176,28,28,0.2)",
        }}
      >
        <PulsingDot />
        {fmt(secs)}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="ft-label" style={{ color: "var(--ft-red)" }}>KICKOFF IN</span>
      <span className="font-mono text-xl font-black tabular-nums leading-none" style={{ color: "var(--ft-red)" }}>
        {fmt(secs)}
      </span>
      <span className="ft-label" style={{ color: "var(--ft-text-dim)" }}>UTC</span>
    </div>
  );
}

function PulsingDot() {
  return (
    <span className="relative flex h-1.5 w-1.5 shrink-0">
      <span
        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
        style={{ backgroundColor: "var(--ft-red)" }}
      />
      <span
        className="relative inline-flex h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: "var(--ft-red)" }}
      />
    </span>
  );
}
