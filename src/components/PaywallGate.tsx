/**
 * PaywallGate — 服务端鉴权守卫
 * 在 match/[id]/page.tsx 里最先调用：
 *   - 未登录 → 跳 /sign-in
 *   - 已登录但 free → 显示高冷 Paywall
 *   - premium → 返回 null（正常渲染）
 */
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import SiteNav from "@/components/SiteNav";
import type { DisplayMatch } from "@/lib/footballDataApi";

// ─── 付费墙 UI ────────────────────────────────────────────────────────────────

export function PaywallUI({ match }: { match: DisplayMatch }) {
  const home = match.homeTeam.nameZh || match.homeTeam.code;
  const away = match.awayTeam.nameZh || match.awayTeam.code;

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--ft-bg)" }}>
      <SiteNav activeSection="match" />

      {/* 面包屑 */}
      <div style={{ borderBottom: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-section)" }}>
        <div className="mx-auto flex h-10 max-w-5xl items-center gap-2 px-8">
          <Link href="/" className="ft-label">首页</Link>
          <span className="ft-label">/</span>
          <Link href="/worldcup" className="ft-label">世界杯</Link>
          <span className="ft-label">/</span>
          <span className="ft-label" style={{ color: "var(--ft-text-muted)" }}>分析报告</span>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-10 px-8 py-20">

        {/* 比赛标识（极简） */}
        <div className="text-center">
          <p className="ft-label mb-4">{match.group ?? match.stage} · {match.date}</p>
          <h1 className="ft-heading text-2xl font-semibold" style={{ color: "var(--ft-navy)" }}>
            {home}
            <span className="mx-4 font-mono text-lg font-light" style={{ color: "var(--ft-text-dim)" }}>vs</span>
            {away}
          </h1>
        </div>

        {/* 内容遮挡区 */}
        <div className="w-full max-w-2xl space-y-3">
          {/* 模糊内容预览 */}
          {[
            { label: "胜平负概率", w: "60%" },
            { label: "Expected Goals (xG)", w: "45%" },
            { label: "比分概率矩阵", w: "80%" },
            { label: "Kelly Criterion", w: "40%" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center gap-4 px-5 py-4"
              style={{ border: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-section)" }}
            >
              <span className="ft-label w-36 shrink-0">{row.label}</span>
              <div className="flex-1 h-1.5 overflow-hidden" style={{ backgroundColor: "var(--ft-bg-hover)" }}>
                <div className="h-full animate-pulse" style={{ width: row.w, backgroundColor: "var(--ft-border)" }} />
              </div>
              <span className="font-mono text-[11px]" style={{ color: "var(--ft-text-dim)" }}>
                ████
              </span>
            </div>
          ))}
        </div>

        {/* 锁定说明 */}
        <div
          className="w-full max-w-2xl px-8 py-8 text-center"
          style={{ border: "1px solid var(--ft-border)", borderLeft: "3px solid var(--ft-navy)" }}
        >
          <p className="ft-label mb-3">Analyst Access Required</p>
          <h2 className="ft-heading text-xl font-semibold mb-4">
            此报告需要 Analyst 权限
          </h2>
          <p className="text-[13px] leading-relaxed mb-8" style={{ color: "var(--ft-text-muted)", maxWidth: "360px", margin: "0 auto 32px" }}>
            量化分析报告属于机构级研究内容，目前处于邀请制内测阶段。
            持有邀请码可立即解锁全部功能，永久免费。
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/access"
              className="inline-block px-8 py-3 text-[13px] font-semibold text-white no-underline transition-colors"
              style={{ backgroundColor: "var(--ft-navy)" }}
            >
              兑换邀请码
            </Link>
            <Link
              href="/worldcup"
              className="inline-block px-8 py-3 text-[13px] font-medium no-underline transition-colors"
              style={{ border: "1px solid var(--ft-border)", color: "var(--ft-navy)" }}
            >
              返回赛程
            </Link>
          </div>
        </div>

        <p className="ft-label" style={{ color: "var(--ft-text-dim)" }}>
          FirstTouch Quantitative Research · Invite-only Beta
        </p>
      </main>
    </div>
  );
}

// ─── 主鉴权函数 ───────────────────────────────────────────────────────────────

/**
 * 返回 null 表示放行，返回 JSX 表示渲染付费墙
 */
export async function checkAnalystAccess(
  match: DisplayMatch
): Promise<React.ReactNode | null> {
  const { userId } = await auth();

  // 未登录 → middleware 已重定向，这里理论上不会命中，但做个兜底
  if (!userId) {
    return <PaywallUI match={match} />;
  }

  const user = await currentUser();
  const tier = (user?.publicMetadata as { tier?: string } | null)?.tier;

  if (tier === "premium") return null; // 放行

  return <PaywallUI match={match} />;
}
