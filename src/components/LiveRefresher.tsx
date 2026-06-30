"use client";

/**
 * LiveRefresher — 对直播比赛每 60 秒静默调用 router.refresh()，
 * 触发 Server Component 重新从 API 取最新比分（利用 Next.js ISR）。
 * 不刷新整个页面，用户无感知。
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface LiveRefresherProps {
  isLive: boolean;
  intervalMs?: number;
  /** 不渲染任何 UI，仅在后台刷新 */
  silent?: boolean;
}

export default function LiveRefresher({
  isLive,
  intervalMs = 60_000,
  silent = false,
}: LiveRefresherProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(intervalMs / 1000);

  useEffect(() => {
    if (!isLive) return;

    // 倒计时每秒 -1
    const tick = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          router.refresh();
          return intervalMs / 1000;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [isLive, intervalMs, router]);

  if (!isLive || silent) return null;

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5"
      style={{
        border: "1px solid rgba(176,28,28,0.25)",
        backgroundColor: "rgba(176,28,28,0.05)",
      }}
    >
      {/* 跳动红点 */}
      <span className="relative flex h-2 w-2 shrink-0">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
          style={{ backgroundColor: "var(--ft-red)" }}
        />
        <span
          className="relative inline-flex h-2 w-2 rounded-full"
          style={{ backgroundColor: "var(--ft-red)" }}
        />
      </span>
      <span className="font-mono text-[11px] font-semibold" style={{ color: "var(--ft-red)" }}>
        LIVE
      </span>
      <span className="ft-label" style={{ color: "var(--ft-text-dim)" }}>
        · 比分将在 {countdown}s 后自动刷新
      </span>
    </div>
  );
}
