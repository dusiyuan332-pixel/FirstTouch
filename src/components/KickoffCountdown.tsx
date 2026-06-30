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

const THRESHOLD = 60 * 60; // 60 分钟

export default function KickoffCountdown({ dateStr, timeStr, variant = "card", fallback }: Props) {
  const [secs, setSecs] = useState(() => secondsLeft(dateStr, timeStr));

  useEffect(() => {
    // 超过阈值时不启动计时器，节省资源
    if (secondsLeft(dateStr, timeStr) > THRESHOLD) return;

    const id = setInterval(() => {
      setSecs(secondsLeft(dateStr, timeStr));
    }, 1000);

    return () => clearInterval(id);
  }, [dateStr, timeStr]);

  // 超过 60 分钟 或 比赛已开始超过 2 分钟 → 渲染 fallback 或空
  if (secs > THRESHOLD || secs < -120) return fallback ? <>{fallback}</> : null;

  // 刚好开球
  if (secs <= 0) {
    return variant === "badge" ? (
      <span
        className="animate-pulse font-mono text-[9px] font-bold uppercase px-1.5 py-0.5"
        style={{ backgroundColor: "rgba(176,28,28,0.1)", color: "var(--ft-red)" }}
      >
        KICKOFF
      </span>
    ) : (
      <span
        className="animate-pulse font-mono text-sm font-black"
        style={{ color: "var(--ft-red)" }}
      >
        KICKOFF
      </span>
    );
  }

  // 倒计时中 —— 区分两种展示模式
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
        {/* 跳动点 */}
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
        {fmt(secs)}
      </span>
    );
  }

  // variant === "card"：显示在对阵卡片中央
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="ft-label" style={{ color: "var(--ft-red)" }}>
        KICKOFF IN
      </span>
      <span
        className="font-mono text-xl font-black tabular-nums leading-none"
        style={{ color: "var(--ft-red)" }}
      >
        {fmt(secs)}
      </span>
      <span className="ft-label" style={{ color: "var(--ft-text-dim)" }}>UTC</span>
    </div>
  );
}
