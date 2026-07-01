import Link from "next/link";
import Image from "next/image";
import SiteNav from "@/components/SiteNav";
import LeagueTabs from "@/components/LeagueTabs";
import TournamentCenter from "@/components/TournamentCenter";
import KickoffCountdown from "@/components/KickoffCountdown";
import LiveMatchClock from "@/components/LiveMatchClock";
import LiveRefresher from "@/components/LiveRefresher";
import {
  fetchWC2026Matches,
  fetchTopFiveLeagues,
  fetchWC2026Scorers,
  computeGroupStandings,
  getTournamentProgress,
  getFocusMatchday,
  type DisplayMatch,
  type RatingType,
} from "@/lib/footballDataApi";
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
    { label: "数据刷新",     value: "1 min" },
  ];
  return (
    <div style={{ borderBottom: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-panel)" }}>
      <div className="mx-auto flex max-w-6xl divide-x px-4 md:px-8"
        style={{ borderColor: "var(--ft-border)" }}>
        {items.map((s) => (
          <div key={s.label} className="flex flex-1 flex-col items-center py-3 md:py-4 gap-0.5">
            <span
              className="font-mono text-base md:text-lg font-bold tabular-nums"
              style={{ color: s.live ? "var(--ft-red)" : "var(--ft-navy)" }}
            >
              {s.value}
            </span>
            <span className="ft-label text-[9px] md:text-[10px] text-center px-1">{s.label}</span>
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
          className="flex items-center justify-between px-5 py-2.5"
          style={{ borderBottom: "1px solid var(--ft-divider)" }}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--ft-text-dim)" }}>
              {match.group ?? match.stage}
            </span>
            {/* Model status badge */}
            <span
              className="font-mono text-[9px] px-1.5 py-0.5 border"
              style={{
                color: "var(--ft-blue)",
                backgroundColor: "rgba(0,51,160,0.04)",
                borderColor: "rgba(0,51,160,0.15)",
              }}
            >
              Model Inference: Ready
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="font-mono text-[10px] font-bold animate-pulse" style={{ color: "var(--ft-red)" }}>
                ● LIVE
              </span>
            )}
            {meta ? (
              <span
                className="px-2 py-0.5 font-mono text-[10px] font-semibold uppercase"
                style={{ backgroundColor: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
              >
                {meta.label}
              </span>
            ) : (
              <span className="font-mono text-[10px]" style={{ color: "var(--ft-text-dim)" }}>
                SIGNAL: PENDING
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
                  {/* 直播中：实时比分 + 走秒时钟 */}
                  {match.status === "live" && match.score ? (
                    <LiveMatchClock
                      score={match.score}
                      kickoffDate={match.date}
                      kickoffTime={match.time}
                      statusDetail={match.statusDetail}
                    />
                  ) : match.status === "finished" && match.score ? (
                    /* 已结束：静态比分 */
                    <span
                      className="font-mono text-2xl font-black tabular-nums"
                      style={{ color: "var(--ft-navy)" }}
                    >
                      {match.score.home}
                      <span style={{ color: "var(--ft-text-dim)", margin: "0 6px" }}>–</span>
                      {match.score.away}
                    </span>
                  ) : (
                    /* 未开赛：倒计时 or 静态时间 */
                    <KickoffCountdown
                      dateStr={match.date}
                      timeStr={match.time}
                      variant="card"
                      fallback={
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--ft-text-dim)" }}>
                            KICKOFF_AT
                          </span>
                          <span className="font-mono text-base font-bold tabular-nums" style={{ color: "var(--ft-navy)" }}>
                            {match.time}
                          </span>
                          <span className="font-mono text-[9px]" style={{ color: "var(--ft-text-dim)" }}>UTC</span>
                        </div>
                      }
                    />
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
                  <p className="font-mono text-[10px] mt-0.5 uppercase tracking-wide" style={{ color: "var(--ft-text-dim)" }}>
                    {item.team.code} · {item.side}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 概率条 */}
        {pred ? (
          <div className="px-5 pb-4 space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--ft-text-dim)" }}>
                Alpha Signal: High
              </span>
              <span className="font-mono text-[9px]" style={{ color: "var(--ft-text-dim)" }}>
                Conf. {pred.confidenceScore}/100
              </span>
            </div>
            <div className="flex h-1 overflow-hidden" style={{ backgroundColor: "var(--ft-bg-panel)" }}>
              <div style={{ width: `${pred.homeWin}%`, backgroundColor: "var(--ft-sky)" }} />
              <div style={{ width: `${pred.draw}%`, backgroundColor: "var(--ft-text-dim)" }} />
              <div style={{ width: `${pred.awayWin}%`, backgroundColor: "var(--ft-red)" }} />
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-[11px]" style={{ color: "var(--ft-sky)" }}>{pred.homeWin}%</span>
              <span className="font-mono text-[11px]" style={{ color: "var(--ft-text-dim)" }}>{pred.draw}%</span>
              <span className="font-mono text-[11px]" style={{ color: "var(--ft-red)" }}>{pred.awayWin}%</span>
            </div>
          </div>
        ) : (
          <div className="px-5 pb-4 pt-2">
            <div className="flex h-1 overflow-hidden" style={{ backgroundColor: "var(--ft-bg-panel)" }}>
              <div className="h-full w-full animate-pulse" style={{ backgroundColor: "var(--ft-border)" }} />
            </div>
            <p className="mt-1.5 font-mono text-[10px] text-center" style={{ color: "var(--ft-text-dim)" }}>
              SIGNAL: COMPUTING... | 算力推演中
            </p>
          </div>
        )}

        {/* 底部控制台风格栏 */}
        <div
          className="flex items-center justify-between px-5 py-2.5"
          style={{ borderTop: "1px solid var(--ft-divider)", backgroundColor: "var(--ft-bg-panel)" }}
        >
          <p className="font-mono text-[11px] leading-snug line-clamp-1" style={{ color: "var(--ft-text-muted)" }}>
            {pred
              ? `> ${match.date} · ${match.time} UTC · ${pred.ratingTarget}`
              : `> ${match.date} · ${match.time} UTC · Quantitative Report Generating`}
          </p>
          <span
            className="ml-3 shrink-0 font-mono text-[11px] transition-colors group-hover:text-[color:var(--ft-navy)]"
            style={{ color: "var(--ft-blue)" }}
          >
            研报 →
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
    <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
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
  const TODAY = new Date().toISOString().slice(0, 10);

  const [allWcMatches, leagueStandings, scorers] = await Promise.all([
    fetchWC2026Matches(PREDICTIONS).catch(() => []),
    fetchTopFiveLeagues().catch(() => []),
    fetchWC2026Scorers(5).catch(() => []),
  ]);

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
  const featuredMatchIds = hotMatches.map((m) => m.id);
  const groupStandings = computeGroupStandings(allWcMatches);
  const tournamentProgress = getTournamentProgress(allWcMatches);
  const focusMatchday = getFocusMatchday(allWcMatches, TODAY);

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--ft-bg)" }}>
      <SiteNav activeSection="dashboard" />
      <DataStrip liveCount={liveCount} />
      {/* 有直播比赛时，每 60s 静默刷新主页数据（无 UI，后台运行） */}
      <LiveRefresher isLive={liveCount > 0} silent />

      {/* ── Hero：罗斯柴尔德全屏风格 ──────────────────────────────────────────── */}
      {/*
       * 背景目前使用深海军蓝渐变占位。
       * 如需替换为真实照片：
       *   1. 将图片放至 public/hero.jpg
       *   2. 将渐变 div 替换为：
       *      <Image src="/hero.jpg" alt="" fill className="object-cover opacity-50" />
       */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "62vh", minHeight: "440px", maxHeight: "760px" }}
      >
        {/* 真实背景图 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/herobg.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* 深色渐变遮罩（保证文字卡片外侧的层次感） */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.22) 100%)",
          }}
        />

        {/* 文字卡片：底部偏左悬浮（Rothschild 标志性布局） */}
        <div
          className="absolute bottom-0 left-0 md:left-[13%] bg-white px-8 md:px-12 py-8 md:py-10"
          style={{ maxWidth: "min(520px, 88vw)" }}
        >
          <p
            className="font-mono text-[9px] md:text-[10px] tracking-widest uppercase mb-3 md:mb-4"
            style={{ color: "var(--ft-text-dim)" }}
          >
            FirstTouch · Quantitative Sports Analytics
          </p>

          <h1 className="ft-heading font-semibold leading-tight">
            <span
              className="block text-[1.5rem] md:text-[2.1rem]"
              style={{ color: "var(--ft-navy)" }}
            >
              Quantifying the Genesis of Decision.
            </span>
            <span
              className="block text-[1.2rem] md:text-[1.7rem] mt-1"
              style={{ fontStyle: "italic", color: "var(--ft-navy)" }}
            >
              量化決斷之始。
            </span>
          </h1>

          <p
            className="mt-4 text-[12px] md:text-[13px] leading-relaxed"
            style={{ color: "var(--ft-text-muted)", maxWidth: "400px" }}
          >
            足球場上的第一次觸球，即是戰術執行的輸入層（Input Layer）。
            FirstTouch 透過底層神經網絡，在球權轉換的毫秒間預演決策拓撲，
            為您錨定每一場對局的隱含期望收益（EV）。
          </p>

          {/* 底部分隔线 + 指示 */}
          <div
            className="mt-5 pt-4 flex items-center gap-4"
            style={{ borderTop: "1px solid var(--ft-divider)" }}
          >
            <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--ft-text-dim)" }}>
              FIFA World Cup 2026
            </span>
            <span style={{ color: "var(--ft-divider)" }}>·</span>
            <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--ft-text-dim)" }}>
              {liveCount > 0 ? (
                <span style={{ color: "var(--ft-red)" }}>● {liveCount} Live Now</span>
              ) : "Match Analysis Platform"}
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 md:px-8 py-8 md:py-12 space-y-12 md:space-y-16">

        {/* ── 赛事中心（全局纵览，不含预测）── */}
        <TournamentCenter
          featuredMatchIds={featuredMatchIds}
          focusMatchday={focusMatchday}
          groupStandings={groupStandings}
          progress={tournamentProgress}
          scorers={scorers}
          liveCount={liveCount}
        />

        {/* ── 量化精选（深度推荐，与赛事中心互补）── */}
        <section>
          <SectionHeading
            label="QUANT PICKS · 量化精选"
            title="近期推荐对局"
            sub="模型深度分析入口 · 含预测信号与置信度评级"
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
            label="MACRO ENVIRONMENT · 宏观基本面基准"
            title="标的能力复盘"
            sub="2025/26 赛季全量标的收益表现与能力拓扑复盘"
            action={
              <span
                className="font-mono text-[10px] px-3 py-1.5 uppercase tracking-wider"
                style={{ border: "1px solid var(--ft-border)", color: "var(--ft-text-dim)" }}
              >
                2025/26 Final
              </span>
            }
          />
          <LeagueTabs standings={leagueStandings} />
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
