import Image from "next/image";
import type { H2HData } from "@/lib/h2hApi";

const C_HOME = "#0055a5";
const C_AWAY = "#b01c1c";

const CARD   = { border: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-card)" } as const;
const PANEL  = { border: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-panel)" } as const;
const HEADER = { borderBottom: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-section)" } as const;

interface Props {
  h2h: H2HData;
  /** 本场比赛主队名（用于颜色标注） */
  currentHomeName: string;
  /** 本场比赛客队名 */
  currentAwayName: string;
}

// 简单名称模糊匹配（API 返回的名字可能与 FD 稍有差异）
function normName(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

function isHome(matchedTeamName: string, currentName: string): boolean {
  const a = normName(matchedTeamName);
  const b = normName(currentName);
  return a.includes(b.slice(0, 5)) || b.includes(a.slice(0, 5));
}

function WinBar({ team1Wins, draws, team2Wins, total }: {
  team1Wins: number;
  draws: number;
  team2Wins: number;
  total: number;
}) {
  if (total === 0) return null;
  const t1Pct = (team1Wins / total) * 100;
  const dPct  = (draws     / total) * 100;
  const t2Pct = (team2Wins / total) * 100;
  return (
    <div className="flex h-1.5 overflow-hidden" style={{ backgroundColor: "var(--ft-bg-panel)" }}>
      <div style={{ width: `${t1Pct}%`, backgroundColor: C_HOME, transition: "width 0.5s" }} />
      <div style={{ width: `${dPct}%`,  backgroundColor: "var(--ft-text-dim)"  }} />
      <div style={{ width: `${t2Pct}%`, backgroundColor: C_AWAY, transition: "width 0.5s" }} />
    </div>
  );
}

function TeamLogo({ src, name }: { src: string; name: string }) {
  if (!src) return (
    <span className="font-mono text-[11px] font-bold" style={{ color: "var(--ft-text-dim)" }}>
      {name.slice(0, 3).toUpperCase()}
    </span>
  );
  return (
    <Image
      src={src}
      alt={name}
      width={20}
      height={20}
      className="object-contain"
      unoptimized
    />
  );
}

export default function H2HPanel({ h2h, currentHomeName, currentAwayName }: Props) {
  const finished = h2h.matches.filter((m) =>
    ["FT", "AET", "PEN"].includes(m.status)
  );

  return (
    <div style={CARD}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-5 py-3" style={HEADER}>
        <span className="ft-label">Head-to-Head · 历史交锋</span>
        <span className="ft-label text-[11px]" style={{ color: "var(--ft-text-dim)" }}>
          数据：API-Football · 最近 {h2h.totalMatches} 场 · 24h 缓存
        </span>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* ── 汇总统计 ── */}
        <div className="grid grid-cols-3 gap-3">
          {/* 主队 */}
          <div
            className="flex flex-col items-center gap-1.5 py-4 text-center"
            style={{ ...PANEL, borderTop: `3px solid ${C_HOME}` }}
          >
            <span
              className="font-mono text-3xl font-black tabular-nums"
              style={{ color: C_HOME }}
            >
              {h2h.team1Wins}
            </span>
            <span className="ft-label text-[11px]">
              {h2h.team1Name.length > 12
                ? h2h.team1Name.slice(0, 12) + "…"
                : h2h.team1Name}
            </span>
            <span className="ft-label text-[10px]">胜场</span>
          </div>

          {/* 平局 */}
          <div
            className="flex flex-col items-center gap-1.5 py-4 text-center"
            style={{ ...PANEL, borderTop: "3px solid var(--ft-text-dim)" }}
          >
            <span
              className="font-mono text-3xl font-black tabular-nums"
              style={{ color: "var(--ft-text-dim)" }}
            >
              {h2h.draws}
            </span>
            <span className="ft-label text-[11px]">平局</span>
            <span className="ft-label text-[10px]">
              场均 {h2h.avgGoals} 球
            </span>
          </div>

          {/* 客队 */}
          <div
            className="flex flex-col items-center gap-1.5 py-4 text-center"
            style={{ ...PANEL, borderTop: `3px solid ${C_AWAY}` }}
          >
            <span
              className="font-mono text-3xl font-black tabular-nums"
              style={{ color: C_AWAY }}
            >
              {h2h.team2Wins}
            </span>
            <span className="ft-label text-[11px]">
              {h2h.team2Name.length > 12
                ? h2h.team2Name.slice(0, 12) + "…"
                : h2h.team2Name}
            </span>
            <span className="ft-label text-[10px]">胜场</span>
          </div>
        </div>

        {/* 胜率条 */}
        <WinBar
          team1Wins={h2h.team1Wins}
          draws={h2h.draws}
          team2Wins={h2h.team2Wins}
          total={finished.length || 1}
        />

        {/* ── 近期对阵记录 ── */}
        {h2h.matches.length > 0 ? (
          <div
            style={{
              border: "1px solid var(--ft-border)",
              overflow: "hidden",
            }}
          >
            {/* 表头 */}
            <div
              className="grid items-center px-3 py-2"
              style={{
                gridTemplateColumns: "5rem 1fr auto 1fr",
                borderBottom: "1px solid var(--ft-border)",
                backgroundColor: "var(--ft-bg-section)",
              }}
            >
              {["日期", "主队", "比分", "客队"].map((h) => (
                <span
                  key={h}
                  className="ft-label text-[11px] uppercase tracking-wider"
                  style={{ textAlign: h === "比分" ? "center" : "left" }}
                >
                  {h}
                </span>
              ))}
            </div>

            {/* 数据行 */}
            {h2h.matches.map((m) => {
              const homeIsCurrentHome = isHome(m.homeTeamName, currentHomeName);
              const homeColor = homeIsCurrentHome ? C_HOME : C_AWAY;
              const awayColor = homeIsCurrentHome ? C_AWAY : C_HOME;

              let rowHighlight: string | undefined;
              if (["FT", "AET", "PEN"].includes(m.status) &&
                  m.homeGoals !== null && m.awayGoals !== null) {
                if (m.homeGoals === m.awayGoals) rowHighlight = undefined;
                else if (
                  (homeIsCurrentHome && m.homeGoals > m.awayGoals) ||
                  (!homeIsCurrentHome && m.awayGoals > m.homeGoals)
                ) rowHighlight = `${C_HOME}0d`; // 主队（本场）赢
                else rowHighlight = `${C_AWAY}0d`;
              }

              const isFinished = ["FT", "AET", "PEN"].includes(m.status);

              return (
                <div
                  key={m.fixtureId}
                  className="grid items-center px-3 py-2.5"
                  style={{
                    gridTemplateColumns: "5rem 1fr auto 1fr",
                    borderTop: "1px solid var(--ft-border)",
                    backgroundColor: rowHighlight,
                  }}
                >
                  {/* 日期 + 赛事 */}
                  <div>
                    <p className="font-mono text-[12px]" style={{ color: "var(--ft-text-muted)" }}>
                      {m.date}
                    </p>
                    <p className="text-[10px] truncate max-w-[80px]" style={{ color: "var(--ft-text-dim)" }}>
                      {m.competition}
                    </p>
                  </div>

                  {/* 主队 */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <TeamLogo src={m.homeLogo} name={m.homeTeamName} />
                    <span
                      className="truncate text-[12px] font-medium"
                      style={{ color: homeColor }}
                    >
                      {m.homeTeamName}
                    </span>
                  </div>

                  {/* 比分 */}
                  <div className="px-3 text-center">
                    {isFinished && m.homeGoals !== null && m.awayGoals !== null ? (
                      <span
                        className="font-mono text-[13px] font-bold tabular-nums"
                        style={{ color: "var(--ft-navy)" }}
                      >
                        {m.homeGoals} – {m.awayGoals}
                        {m.status !== "FT" && (
                          <span className="ml-1 text-[9px] font-normal" style={{ color: "var(--ft-text-dim)" }}>
                            {m.status}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="font-mono text-[11px]" style={{ color: "var(--ft-text-dim)" }}>
                        vs
                      </span>
                    )}
                  </div>

                  {/* 客队 */}
                  <div className="flex items-center justify-end gap-1.5 min-w-0">
                    <span
                      className="truncate text-[12px] font-medium text-right"
                      style={{ color: awayColor }}
                    >
                      {m.awayTeamName}
                    </span>
                    <TeamLogo src={m.awayLogo} name={m.awayTeamName} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="ft-label text-center py-4" style={{ color: "var(--ft-text-dim)" }}>
            暂无历史交锋记录
          </p>
        )}

        {/* 图例 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-4" style={{ backgroundColor: C_HOME }} />
            <span className="ft-label text-[11px]">{currentHomeName.split(" ")[0]} 胜（主队方）</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-4" style={{ backgroundColor: "var(--ft-text-dim)" }} />
            <span className="ft-label text-[11px]">平局</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-4" style={{ backgroundColor: C_AWAY }} />
            <span className="ft-label text-[11px]">{currentAwayName.split(" ")[0]} 胜（客队方）</span>
          </div>
        </div>
      </div>
    </div>
  );
}
