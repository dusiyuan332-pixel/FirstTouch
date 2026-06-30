import Image from "next/image";
import type { WCScorer } from "@/lib/footballDataApi";

interface Props {
  scorers: WCScorer[];
}

const RANK_COLORS: Record<number, string> = {
  1: "#b8860b", // gold
  2: "#6b7280", // silver
  3: "#92400e", // bronze
};

/** 队徽作为头像（圆形裁切） */
function CrestAvatar({ src, name, size = 44 }: { src: string; name: string; size?: number }) {
  const initials = name.slice(0, 3).toUpperCase();

  if (!src) {
    return (
      <div
        className="flex shrink-0 items-center justify-center font-mono text-[10px] font-bold"
        style={{
          width: size, height: size, borderRadius: "50%",
          backgroundColor: "var(--ft-bg-panel)",
          border: "1px solid var(--ft-border)",
          color: "var(--ft-text-dim)",
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className="relative shrink-0 flex items-center justify-center"
      style={{
        width: size, height: size, borderRadius: "50%",
        border: "1.5px solid var(--ft-border)",
        backgroundColor: "var(--ft-bg-section)",
        overflow: "hidden",
      }}
    >
      <Image
        src={src}
        alt={name}
        width={size - 8}
        height={size - 8}
        className="object-contain"
        unoptimized
      />
    </div>
  );
}

function GoalBar({ goals, max }: { goals: number; max: number }) {
  const pct = max > 0 ? (goals / max) * 100 : 0;
  return (
    <div
      className="h-1 overflow-hidden"
      style={{ backgroundColor: "var(--ft-bg-panel)", borderRadius: 2 }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          backgroundColor: "var(--ft-navy)",
          borderRadius: 2,
          transition: "width 0.4s",
        }}
      />
    </div>
  );
}

export default function WCScorersWidget({ scorers }: Props) {
  const top = scorers.slice(0, 5);
  const highest = top[0]?.goals ?? 1;

  return (
    <div
      style={{
        border: "1px solid var(--ft-border)",
        backgroundColor: "var(--ft-bg-card)",
      }}
    >
      {/* 标题 */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          borderBottom: "1px solid var(--ft-border)",
          backgroundColor: "var(--ft-bg-section)",
        }}
      >
        <div>
          <p className="ft-label text-[10px] uppercase tracking-wider">FIFA World Cup 2026</p>
          <p className="mt-0.5 text-[13px] font-semibold" style={{ color: "var(--ft-navy)" }}>
            射手榜 · Top Scorers
          </p>
        </div>
        <span className="ft-label text-[10px]">前 {top.length} 名</span>
      </div>

      {/* 球员列表 */}
      {top.length === 0 ? (
        <p className="py-6 text-center ft-label text-[12px]" style={{ color: "var(--ft-text-dim)" }}>
          小组赛开赛后更新
        </p>
      ) : (
        <div>
          {top.map((s) => (
            <div
              key={s.player.id}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--ft-bg-section)]"
              style={{ borderTop: "1px solid var(--ft-border)" }}
            >
              {/* 队徽头像 + 排名角标 */}
              <div className="relative shrink-0">
                <CrestAvatar src={s.team.crest} name={s.team.tla} size={40} />
                <span
                  className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center font-mono text-[9px] font-bold"
                  style={{
                    backgroundColor: RANK_COLORS[s.rank] ?? "var(--ft-text-dim)",
                    color: "#fff",
                    borderRadius: "50%",
                    border: "1.5px solid var(--ft-bg-card)",
                  }}
                >
                  {s.rank}
                </span>
              </div>

              {/* 信息区 */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold leading-tight" style={{ color: "var(--ft-text)" }}>
                  {s.player.name}
                </p>
                <p className="text-[11px] leading-tight" style={{ color: "var(--ft-text-dim)" }}>
                  {s.team.nameZh || s.team.name}
                </p>
                <div className="mt-1.5">
                  <GoalBar goals={s.goals} max={highest} />
                </div>
              </div>

              {/* 进球 + 助攻 */}
              <div className="shrink-0 text-right">
                <span
                  className="font-mono text-xl font-black tabular-nums leading-none"
                  style={{ color: s.rank === 1 ? "var(--ft-navy)" : "var(--ft-text)" }}
                >
                  {s.goals}
                </span>
                <p className="ft-label text-[10px] leading-none mt-0.5" style={{ color: "var(--ft-text-dim)" }}>
                  {s.assists > 0 ? `+${s.assists}A` : "进球"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 底注 */}
      <div
        className="px-4 py-2"
        style={{ borderTop: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-section)" }}
      >
        <p className="ft-label text-[10px]" style={{ color: "var(--ft-text-dim)" }}>
          football-data.org · 每 10 分钟更新
        </p>
      </div>
    </div>
  );
}
