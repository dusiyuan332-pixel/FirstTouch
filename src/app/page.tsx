import Link from "next/link";
import Image from "next/image";
import SiteNav from "@/components/SiteNav";
import LeagueTabs from "@/components/LeagueTabs";
import { fetchWC2026Matches, type DisplayMatch, type RatingType } from "@/lib/footballDataApi";
import { PREDICTIONS } from "@/data/wc2026";

// ─── 评级元数据（白底配色）────────────────────────────────────────────────────

const RATING_META: Record<RatingType, { label: string; color: string; bg: string; border: string }> = {
  STRONG_BUY: { label: "强烈买入", color: "var(--ft-green)",   bg: "var(--ft-green-bg)", border: "rgba(0,92,56,0.25)" },
  BUY:        { label: "买入",     color: "var(--ft-green)",   bg: "var(--ft-green-bg)", border: "rgba(0,92,56,0.15)" },
  NEUTRAL:    { label: "中性",     color: "var(--ft-amber)",   bg: "var(--ft-amber-bg)", border: "rgba(122,82,0,0.2)" },
  AVOID:      { label: "回避",     color: "var(--ft-red)",     bg: "var(--ft-red-bg)",   border: "rgba(176,28,28,0.2)" },
};

// ─── 数据统计条 ───────────────────────────────────────────────────────────────

function DataStrip({ liveCount }: { liveCount: number }) {
  const items = [
    { label: "本届总场次",   value: "104" },
    { label: "直播进行中",   value: liveCount > 0 ? `${liveCount}` : "—", live: liveCount > 0 },
    { label: "已建模对局",   value: String(Object.keys(PREDICTIONS).length) },
    { label: "数据刷新",     value: "5 min" },
  ];
  return (
    <div style={{ borderBottom: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-panel)" }}>
      <div className="mx-auto flex max-w-6xl divide-x px-8"
        style={{ borderColor: "var(--ft-border)" }}>
        {items.map((s) => (
          <div key={s.label} className="flex flex-1 flex-col items-center py-4 gap-0.5">
            <span
              className="font-mono text-lg font-bold tabular-nums"
              style={{ color: s.live ? "var(--ft-red)" : "var(--ft-navy)" }}
            >
              {s.value}
            </span>
            <span className="ft-label">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 量化精选卡片 ─────────────────────────────────────────────────────────────

function QuantCard({ match }: { match: DisplayMatch }) {
  const pred = match.prediction ?? null;
  const meta = pred ? RATING_META[pred.rating] : null;
  const isLive = match.status === "live";
  const accentColor = meta ? meta.color : "var(--ft-navy)";

  return (
    <Link href={`/worldcup/match/${match.id}`} className="group block h-full no-underline">
      <div
        className="h-full flex flex-col transition-all duration-150"
        style={{
          border: "1px solid var(--ft-border)",
          backgroundColor: "var(--ft-bg-card)",
          borderTop: `3px solid ${accentColor}`,
        }}
      >
        {/* 卡头 */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid var(--ft-divider)" }}
        >
          <span className="ft-label">{match.group ?? match.stage}</span>
          <div className="flex items-center gap-3">
            {isLive && (
              <span className="ft-label" style={{ color: "var(--ft-red)" }}>LIVE</span>
            )}
            {meta ? (
              <span
                className="px-2 py-0.5 font-mono text-[10px] font-semibold uppercase"
                style={{ backgroundColor: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
              >
                {meta.label}
              </span>
            ) : (
              <span className="ft-label" style={{ color: "var(--ft-text-dim)" }}>
                模型分析中
              </span>
            )}
          </div>
        </div>

        {/* 两队 */}
        <div className="flex flex-1 items-center gap-4 px-5 py-6">
          {[
            { team: match.homeTeam, side: "HOME" },
            null,
            { team: match.awayTeam, side: "AWAY" },
          ].map((item, i) => {
            if (!item) {
              return (
                <div key="mid" className="flex shrink-0 flex-col items-center gap-1">
                  {match.score ? (
                    <span
                      className="font-mono text-2xl font-black tabular-nums"
                      style={{ color: "var(--ft-navy)" }}
                    >
                      {match.score.home}
                      <span style={{ color: "var(--ft-text-dim)", margin: "0 6px" }}>–</span>
                      {match.score.away}
                    </span>
                  ) : (
                    <span
                      className="font-mono text-base font-semibold"
                      style={{ color: "var(--ft-text-muted)" }}
                    >
                      {match.time}
                      <span className="block text-center ft-label mt-0.5">UTC</span>
                    </span>
                  )}
                </div>
              );
            }
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-2 text-center">
                <div className="relative h-10 w-10">
                  {item.team.crest ? (
                    <Image src={item.team.crest} alt={item.team.name} fill className="object-contain" sizes="40px" />
                  ) : (
                    <div
                      className="h-10 w-10 flex items-center justify-center font-mono text-[10px] font-bold"
                      style={{ backgroundColor: "var(--ft-bg-panel)", color: "var(--ft-text-muted)", border: "1px solid var(--ft-border)" }}
                    >
                      {item.team.code}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--ft-navy)" }}>
                    {item.team.nameZh || item.team.name}
                  </p>
                  <p className="ft-label mt-0.5">{item.team.code} · {item.side}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 概率条（有静态预测时显示） */}
        {pred ? (
          <div className="px-5 pb-4 space-y-1.5">
            <div className="flex h-1 overflow-hidden" style={{ backgroundColor: "var(--ft-bg-panel)" }}>
              <div style={{ width: `${pred.homeWin}%`, backgroundColor: "var(--ft-sky)" }} />
              <div style={{ width: `${pred.draw}%`, backgroundColor: "var(--ft-text-dim)" }} />
              <div style={{ width: `${pred.awayWin}%`, backgroundColor: "var(--ft-red)" }} />
            </div>
            <div className="flex justify-between">
              <span className="ft-label" style={{ color: "var(--ft-sky)" }}>{pred.homeWin}%</span>
              <span className="ft-label">{pred.draw}%</span>
              <span className="ft-label" style={{ color: "var(--ft-red)" }}>{pred.awayWin}%</span>
            </div>
          </div>
        ) : (
          <div className="px-5 pb-4 pt-2">
            <div className="flex h-1 overflow-hidden" style={{ backgroundColor: "var(--ft-bg-panel)" }}>
              <div className="h-full w-full animate-pulse" style={{ backgroundColor: "var(--ft-border)" }} />
            </div>
            <p className="mt-1.5 ft-label text-center">Python 模型实时计算中 · 点击查看</p>
          </div>
        )}

        {/* 底部 */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid var(--ft-divider)", backgroundColor: "var(--ft-bg-panel)" }}
        >
          <p
            className="text-[12px] leading-snug line-clamp-1"
            style={{ color: "var(--ft-text-muted)" }}
          >
            {pred
              ? (pred.insight || `置信度 ${pred.confidenceScore} · ${pred.ratingTarget}`)
              : `${match.date} · ${match.time} UTC · 点击进入分析`}
          </p>
          <span
            className="ml-3 shrink-0 text-[12px] font-medium transition-colors group-hover:text-[color:var(--ft-navy)]"
            style={{ color: "var(--ft-blue)" }}
          >
            查看报告 →
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── 区块标题 ─────────────────────────────────────────────────────────────────

function SectionHeading({
  label, title, sub, action,
}: {
  label: string; title: string; sub?: string; action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <div style={{ borderLeft: "3px solid var(--ft-navy)", paddingLeft: "16px" }}>
        <p className="ft-label mb-2">{label}</p>
        {/* Playfair Display 衬线大标题 */}
        <h2 className="ft-heading text-xl font-semibold">{title}</h2>
        {sub && (
          <p className="mt-1 text-[13px]" style={{ color: "var(--ft-text-muted)" }}>{sub}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── 主页面 ───────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const allWcMatches = await fetchWC2026Matches(PREDICTIONS).catch(() => []);
  const now = new Date();

  // 优先取直播中，其次取最近即将开赛的（按开赛时间 ASC）
  const hotMatches = allWcMatches
    .filter((m) => m.status === "live" || m.status === "upcoming")
    .sort((a, b) => {
      if (a.status === "live" && b.status !== "live") return -1;
      if (b.status === "live" && a.status !== "live") return 1;
      const tA = new Date(`${a.date}T${a.time}:00Z`).getTime();
      const tB = new Date(`${b.date}T${b.time}:00Z`).getTime();
      return tA - tB; // 最近的排前面
    })
    .slice(0, 2);

  const liveCount = allWcMatches.filter((m) => m.status === "live").length;

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--ft-bg)" }}>
      <SiteNav activeSection="dashboard" />
      <DataStrip liveCount={liveCount} />

      {/* Hero */}
      <div style={{ borderBottom: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-section)" }}>
        <div className="mx-auto max-w-6xl px-8 py-14">
          <p className="ft-label mb-4">FirstTouch · Quantitative Sports Analytics</p>
          {/* Playfair Display 大标题 */}
          <h1 className="ft-heading text-4xl font-semibold leading-snug" style={{ maxWidth: "520px" }}>
            Every decision begins<br />
            <span style={{ fontStyle: "italic" }}>with the first touch.</span>
          </h1>
          <p
            className="mt-6 text-[14px] leading-relaxed"
            style={{ color: "var(--ft-text-muted)", maxWidth: "480px" }}
          >
            足球场上的一次触球，在神经系统中预载了之后所有的决策——
            这正是我们构建量化模型的起点。捕捉每场对局的隐含价值。
          </p>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-8 py-12 space-y-16">

        {/* ── 量化精选 ── */}
        <section>
          <SectionHeading
            label="Quant Picks · 量化精选"
            title="近期推荐对局"
            sub="模型自动筛选 · 按开赛时间最近排序"
            action={
              <Link
                href="/worldcup"
                className="text-[13px] font-medium no-underline transition-colors hover:text-[color:var(--ft-navy)]"
                style={{ color: "var(--ft-blue)" }}
              >
                全部赛程 →
              </Link>
            }
          />

          {hotMatches.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {hotMatches.map((m) => <QuantCard key={m.id} match={m} />)}
            </div>
          ) : (
            <div
              className="py-16 text-center"
              style={{ border: "1px solid var(--ft-border)" }}
            >
              <p className="text-[13px]" style={{ color: "var(--ft-text-muted)" }}>
                暂无推荐对局 ·{" "}
                <Link href="/worldcup" style={{ color: "var(--ft-blue)" }}>
                  查看世界杯赛程
                </Link>
              </p>
            </div>
          )}
        </section>

        {/* ── 五大联赛 ── */}
        <section>
          <SectionHeading
            label="Top 5 European Leagues · 五大联赛"
            title="2026/27 赛季赛程预览"
            sub="开赛后由 API 实时替换"
            action={
              <span
                className="font-mono text-[10px] px-3 py-1.5 uppercase tracking-wider"
                style={{ border: "1px solid var(--ft-border)", color: "var(--ft-text-dim)" }}
              >
                2026/27 Pre-Season
              </span>
            }
          />
          <LeagueTabs />
        </section>

        {/* 底部声明 */}
        <div style={{ borderTop: "1px solid var(--ft-divider)", paddingTop: "24px" }}>
          <p className="ft-label text-center" style={{ color: "var(--ft-text-dim)" }}>
            Data: football-data.org · Predictions for reference only · Not financial or betting advice · © 2026 FirstTouch
          </p>
        </div>
      </main>
    </div>
  );
}
