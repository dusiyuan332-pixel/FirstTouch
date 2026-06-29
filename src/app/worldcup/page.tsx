import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import ScheduleMatchCard from "@/components/ScheduleMatchCard";
import ScheduleDateNav from "@/components/ScheduleDateNav";
import { fetchWC2026Matches, groupByDate, getUniqueDates, formatDate } from "@/lib/footballDataApi";
import { PREDICTIONS } from "@/data/wc2026";
import { computeQuickPrediction } from "@/lib/quickPredict";

// 动态计算今日 UTC 日期，确保不因服务器时区偏差显示昨天
const TODAY = new Date().toISOString().slice(0, 10);

export default async function WorldCupPage() {
  let allMatches = await fetchWC2026Matches(PREDICTIONS).catch(() => null);
  const isRealData = allMatches !== null;
  if (!allMatches) allMatches = [];

  const cutoff = new Date(TODAY);
  cutoff.setDate(cutoff.getDate() - 2);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const visibleMatches = allMatches
    .filter((m) => m.date >= cutoffStr)
    .map((m) => {
      // 若无静态预测，且比赛已开放分析（已结束 / 3天内），用轻量模型补全
      if (!m.prediction) {
        const days = Math.ceil(
          (new Date(`${m.date}T${m.time}:00Z`).getTime() - Date.now()) / 86400000
        );
        const open = m.status === "finished" || m.status === "live" || days <= 3;
        if (open) {
          const quick = computeQuickPrediction(m.homeTeam.code, m.awayTeam.code);
          if (quick) return { ...m, prediction: quick };
        }
      }
      return m;
    });

  const dates = getUniqueDates(visibleMatches);
  const byDate = groupByDate(visibleMatches);

  const liveCount     = visibleMatches.filter((m) => m.status === "live").length;
  const upcomingCount = visibleMatches.filter((m) => m.status === "upcoming").length;

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--ft-bg)" }}>
      <SiteNav activeSection="worldcup" />
      {dates.length > 0 && <ScheduleDateNav dates={dates} todayDate={TODAY} />}

      {/* 页头 */}
      <div style={{ borderBottom: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-section)" }}>
        <div className="mx-auto max-w-5xl px-8 py-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="ft-label mb-2">FIFA World Cup 2026 · Match Schedule</p>
              <h1 className="ft-heading text-xl font-semibold">赛程 · 对局分析</h1>
              <div className="mt-2 flex items-center gap-4">
                <span className="ft-label">{upcomingCount} 场待开赛</span>
                {liveCount > 0 && (
                  <span className="ft-label animate-pulse" style={{ color: "var(--ft-red)" }}>
                    {liveCount} 场进行中
                  </span>
                )}
                <span
                  className="ft-label"
                  style={{ color: isRealData ? "var(--ft-green)" : "var(--ft-red)" }}
                >
                  {isRealData ? "实时数据" : "API 离线"}
                </span>
              </div>
            </div>

            {/* 数据来源 */}
            <div
              className="px-5 py-4"
              style={{
                border: "1px solid var(--ft-border)",
                backgroundColor: "var(--ft-bg-card)",
              }}
            >
              <p className="ft-label mb-2">数据来源</p>
              <p className="text-[13px] font-medium" style={{ color: "var(--ft-navy)" }}>
                {isRealData ? "football-data.org" : "未连接"}
              </p>
              <p className="ft-label mt-1" style={{ color: isRealData ? "var(--ft-green)" : "var(--ft-red)" }}>
                {isRealData ? "每 5 分钟自动更新" : "请重启开发服务器"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-5xl flex-1 px-8 py-10 space-y-12">
        {visibleMatches.length > 0 ? (
          dates.map((date) => {
            const matches = byDate.get(date) ?? [];
            const isToday = date === TODAY;
            const isPast  = date < TODAY;

            return (
              <section key={date} id={`date-${date}`} className="scroll-mt-28">
                {/* 日期标题 */}
                <div className="mb-5 flex items-center gap-4">
                  <div
                    className="flex items-center gap-3 py-1"
                    style={{
                      borderLeft: `3px solid ${isToday ? "var(--ft-navy)" : isPast ? "var(--ft-text-dim)" : "var(--ft-border)"}`,
                      paddingLeft: "12px",
                    }}
                  >
                    <span
                      className="text-sm font-semibold"
                      style={{ color: isToday ? "var(--ft-navy)" : isPast ? "var(--ft-text-muted)" : "var(--ft-text)" }}
                    >
                      {formatDate(date)}
                    </span>
                    {isToday && (
                      <span
                        className="font-mono text-[9px] font-bold uppercase px-2 py-0.5"
                        style={{ backgroundColor: "var(--ft-navy)", color: "#fff" }}
                      >
                        TODAY
                      </span>
                    )}
                  </div>
                  <span className="ft-label">{matches.length} 场</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {matches.map((match) => (
                    <ScheduleMatchCard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          <div
            className="py-20 text-center"
            style={{ border: "1px solid var(--ft-border)" }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--ft-navy)" }}>
              无法加载赛程数据
            </p>
            <p className="mt-2 text-[13px]" style={{ color: "var(--ft-text-muted)" }}>
              请检查 FOOTBALL_DATA_KEY 并重启开发服务器
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-[13px] no-underline"
              style={{ color: "var(--ft-blue)" }}
            >
              返回主界面
            </Link>
          </div>
        )}

        <p className="ft-label text-center pb-6" style={{ color: "var(--ft-text-dim)" }}>
          Data: football-data.org · Predictions for reference only · Not betting advice · © 2026 FirstTouch
        </p>
      </main>
    </div>
  );
}
