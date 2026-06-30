import Image from "next/image";
import type { WCScorer } from "@/lib/footballDataApi";

interface Props {
  scorers: WCScorer[];
}

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function WCTopScorers({ scorers }: Props) {
  if (scorers.length === 0) {
    return (
      <div
        className="py-8 text-center text-[13px]"
        style={{
          border: "1px solid var(--ft-border)",
          backgroundColor: "var(--ft-bg-card)",
          color: "var(--ft-text-muted)",
        }}
      >
        射手榜数据暂未开放（小组赛开赛后自动更新）
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid var(--ft-border)",
        backgroundColor: "var(--ft-bg-card)",
      }}
    >
      {/* 表头 */}
      <div
        className="grid items-center px-4 py-2"
        style={{
          gridTemplateColumns: "2.5rem 1fr 7rem 4rem 4rem 4rem",
          borderBottom: "1px solid var(--ft-border)",
          backgroundColor: "var(--ft-bg-section)",
        }}
      >
        {(["#", "球员", "球队", "进球", "助攻", "场次"] as const).map((h) => (
          <span
            key={h}
            className="ft-label text-[11px] uppercase tracking-wider"
            style={{
              textAlign: h === "球员" || h === "球队" ? "left" : "center",
            }}
          >
            {h}
          </span>
        ))}
      </div>

      {/* 数据行 */}
      <div>
        {scorers.map((s) => (
          <div
            key={s.player.id}
            className="grid items-center px-4 py-3 transition-colors hover:bg-[var(--ft-bg-section)]"
            style={{
              gridTemplateColumns: "2.5rem 1fr 7rem 4rem 4rem 4rem",
              borderTop: "1px solid var(--ft-border)",
            }}
          >
            {/* 排名 */}
            <span
              className="text-[13px] font-semibold"
              style={{ color: s.rank <= 3 ? "var(--ft-navy)" : "var(--ft-text-muted)" }}
            >
              {MEDAL[s.rank] ?? s.rank}
            </span>

            {/* 球员名 + 国籍 */}
            <div className="min-w-0">
              <p
                className="truncate text-[13px] font-semibold"
                style={{ color: "var(--ft-text)" }}
              >
                {s.player.name}
              </p>
              <p className="text-[11px]" style={{ color: "var(--ft-text-muted)" }}>
                {s.player.nationality}
              </p>
            </div>

            {/* 球队 */}
            <div className="flex items-center gap-1.5 min-w-0">
              <Image
                src={s.team.crest}
                alt={s.team.name}
                width={18}
                height={18}
                className="shrink-0 object-contain"
                unoptimized
              />
              <span
                className="truncate text-[12px]"
                style={{ color: "var(--ft-text-dim)" }}
              >
                {s.team.nameZh || s.team.name}
              </span>
            </div>

            {/* 进球 */}
            <div className="text-center">
              <span
                className="inline-block min-w-[28px] rounded px-1.5 py-0.5 text-[13px] font-bold"
                style={{
                  backgroundColor: s.rank === 1 ? "var(--ft-navy)" : "var(--ft-bg-section)",
                  color: s.rank === 1 ? "#fff" : "var(--ft-navy)",
                  border: "1px solid var(--ft-border)",
                }}
              >
                {s.goals}
              </span>
            </div>

            {/* 助攻 */}
            <div className="text-center">
              <span className="text-[13px]" style={{ color: "var(--ft-text-dim)" }}>
                {s.assists}
              </span>
            </div>

            {/* 场次 */}
            <div className="text-center">
              <span className="text-[13px]" style={{ color: "var(--ft-text-muted)" }}>
                {s.playedMatches}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 底注 */}
      <div
        className="px-4 py-2.5"
        style={{ borderTop: "1px solid var(--ft-border)" }}
      >
        <p className="ft-label text-[11px]" style={{ color: "var(--ft-text-dim)" }}>
          数据来源：football-data.org · 每 10 分钟更新
        </p>
      </div>
    </div>
  );
}
