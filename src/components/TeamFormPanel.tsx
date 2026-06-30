/**
 * TeamFormPanel — 近5场实时战绩 + 伤病/停赛报告
 * 数据源：API-Football v3（独立于静态 wc2026.ts 数据）
 */

import Image from "next/image";
import type { DualFormData, FormMatch, InjuryRecord } from "@/lib/formApi";

// ─── 设计常量 ──────────────────────────────────────────────────────────────

const C_HOME = "var(--ft-navy)";
const C_AWAY = "var(--ft-red)";
const CARD   = { border: "1px solid var(--ft-border)" } as const;
const PANEL  = { border: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-panel)" } as const;
const HEADER = { borderBottom: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-section)" } as const;

// ─── 胜平负徽章 ────────────────────────────────────────────────────────────

function ResultBadge({ result }: { result: "W" | "D" | "L" }) {
  const bg =
    result === "W" ? "var(--ft-green)" :
    result === "L" ? "#b01c1c" :
    "var(--ft-text-muted)";
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-black text-white shrink-0"
      style={{ backgroundColor: bg }}
    >
      {result}
    </div>
  );
}

// ─── 近5场串（W-W-D-L-W 浓缩版）────────────────────────────────────────────

function FormString({ form }: { form: FormMatch[] }) {
  if (!form.length) {
    return <span className="ft-label italic">暂无记录</span>;
  }
  return (
    <div className="flex items-center gap-1">
      {[...form].reverse().map((m, i) => ( // reverse: 最旧在左，最新在右
        <ResultBadge key={i} result={m.result} />
      ))}
    </div>
  );
}

// ─── 单场比赛行 ────────────────────────────────────────────────────────────

function MatchRow({ m, teamSide }: { m: FormMatch; teamSide: "home" | "away" }) {
  const isRight = teamSide === "away";
  const scored   = `${m.goalsFor}–${m.goalsAgainst}`;
  const dateStr  = m.date.slice(5); // "06-15"
  const compShort = m.competition.replace(/FIFA\s*/i, "").replace(/\s*Qualifier.*/i, " Qual.").slice(0, 22);

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 text-[12px]"
      style={{ borderBottom: "1px solid var(--ft-divider)" }}
    >
      {/* 左侧布局（主队一侧）：徽章 | 对手 | 主客 | 比分 | 日期 */}
      {/* 右侧布局（客队一侧）：日期 | 比分 | 主客 | 对手 | 徽章 */}
      {!isRight && <ResultBadge result={m.result} />}
      {!isRight && (
        <span className="text-[10px] px-1 py-0.5 font-mono font-bold"
          style={{ backgroundColor: m.isHome ? "rgba(0,92,56,0.08)" : "rgba(176,28,28,0.06)",
                   color: m.isHome ? "var(--ft-green)" : C_AWAY,
                   border: `1px solid ${m.isHome ? "rgba(0,92,56,0.2)" : "rgba(176,28,28,0.2)"}` }}>
          {m.isHome ? "主" : "客"}
        </span>
      )}
      {isRight && (
        <span className="ft-label text-[10px] ml-auto">{dateStr}</span>
      )}
      {isRight && (
        <span className="font-mono text-[11px] font-bold" style={{ color: "var(--ft-navy)" }}>
          {scored}
        </span>
      )}

      {/* 对手 logo + 名 */}
      {m.opponentLogo && (
        <div className="relative h-4 w-4 shrink-0">
          <Image src={m.opponentLogo} alt={m.opponentName} fill className="object-contain" sizes="16px" />
        </div>
      )}
      <span className="truncate flex-1" style={{ color: "var(--ft-text-muted)" }}>
        {m.opponentName.slice(0, 18)}
      </span>

      {!isRight && (
        <span className="font-mono text-[11px] font-bold" style={{ color: "var(--ft-navy)" }}>
          {scored}
        </span>
      )}
      {!isRight && (
        <span className="ft-label text-[10px]">{dateStr}</span>
      )}
      {isRight && (
        <span className="text-[10px] px-1 py-0.5 font-mono font-bold"
          style={{ backgroundColor: m.isHome ? "rgba(0,92,56,0.08)" : "rgba(176,28,28,0.06)",
                   color: m.isHome ? "var(--ft-green)" : C_AWAY,
                   border: `1px solid ${m.isHome ? "rgba(0,92,56,0.2)" : "rgba(176,28,28,0.2)"}` }}>
          {m.isHome ? "主" : "客"}
        </span>
      )}
      {isRight && <ResultBadge result={m.result} />}
    </div>
  );
}

// ─── 单队面板 ──────────────────────────────────────────────────────────────

function TeamColumn({
  data,
  accentColor,
  side,
}: {
  data: { teamName: string; teamLogo: string; form: FormMatch[]; injuries: InjuryRecord[] };
  accentColor: string;
  side: "home" | "away";
}) {
  const wins   = data.form.filter((m) => m.result === "W").length;
  const draws  = data.form.filter((m) => m.result === "D").length;
  const losses = data.form.filter((m) => m.result === "L").length;
  const gf     = data.form.reduce((s, m) => s + m.goalsFor, 0);
  const ga     = data.form.reduce((s, m) => s + m.goalsAgainst, 0);

  return (
    <div className="flex flex-col min-w-0">
      {/* 队名 + 形态串 */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--ft-border)" }}>
        <div className="flex items-center gap-2 mb-2">
          {data.teamLogo && (
            <div className="relative h-5 w-5 shrink-0">
              <Image src={data.teamLogo} alt={data.teamName} fill className="object-contain" sizes="20px" />
            </div>
          )}
          <span className="text-[13px] font-semibold truncate" style={{ color: accentColor }}>
            {data.teamName}
          </span>
        </div>
        <FormString form={data.form} />
        {data.form.length > 0 && (
          <div className="flex gap-3 mt-2">
            <span className="font-mono text-[11px] font-bold" style={{ color: "var(--ft-green)" }}>
              {wins}W
            </span>
            <span className="font-mono text-[11px]" style={{ color: "var(--ft-text-muted)" }}>
              {draws}D
            </span>
            <span className="font-mono text-[11px] font-bold" style={{ color: "#b01c1c" }}>
              {losses}L
            </span>
            <span className="ft-label text-[10px] ml-auto">
              进{gf} / 失{ga}
            </span>
          </div>
        )}
      </div>

      {/* 近5场明细 */}
      {data.form.length > 0 ? (
        <div>
          {data.form.map((m, i) => (
            <MatchRow key={i} m={m} teamSide={side} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-6">
          <p className="ft-label text-[11px]" style={{ color: "var(--ft-text-dim)" }}>
            暂无近期比赛数据
          </p>
        </div>
      )}

      {/* 伤病 / 停赛 */}
      <div style={{ borderTop: "1px solid var(--ft-border)" }}>
        <div className="px-4 py-2" style={{ backgroundColor: "var(--ft-bg-section)" }}>
          <p className="ft-label text-[10px]">伤病 / 停赛</p>
        </div>
        {data.injuries.length === 0 ? (
          <div className="px-4 py-3">
            <p className="ft-label text-[11px]" style={{ color: "var(--ft-text-dim)" }}>
              暂无伤病记录
            </p>
          </div>
        ) : (
          <div>
            {data.injuries.slice(0, 6).map((inj, i) => (
              <InjuryRow key={i} inj={inj} />
            ))}
            {data.injuries.length > 6 && (
              <div className="px-4 py-2">
                <p className="ft-label text-[10px]" style={{ color: "var(--ft-text-dim)" }}>
                  + {data.injuries.length - 6} 名球员伤病记录
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 伤病行 ────────────────────────────────────────────────────────────────

function InjuryRow({ inj }: { inj: InjuryRecord }) {
  const isSuspension = inj.type.toLowerCase().includes("suspension");
  const dotColor     = isSuspension ? "#f59e0b" : "#b01c1c";
  const typeLabel    = isSuspension ? "停赛" : "伤病";

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 text-[12px]"
      style={{ borderBottom: "1px solid var(--ft-divider)" }}
    >
      {/* 状态指示点 */}
      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />

      {inj.playerPhoto && (
        <div className="relative h-5 w-5 rounded-full overflow-hidden shrink-0 border"
          style={{ borderColor: "var(--ft-border)" }}>
          <Image
            src={inj.playerPhoto}
            alt={inj.playerName}
            fill
            className="object-cover"
            sizes="20px"
            onError={() => {}}
          />
        </div>
      )}

      <span className="font-medium truncate flex-1" style={{ color: "var(--ft-navy)" }}>
        {inj.playerName}
      </span>

      <div className="flex items-center gap-1 shrink-0">
        <span
          className="text-[9px] px-1.5 py-0.5 font-bold font-mono"
          style={{
            backgroundColor: isSuspension ? "rgba(245,158,11,0.1)" : "rgba(176,28,28,0.08)",
            color: dotColor,
            border: `1px solid ${isSuspension ? "rgba(245,158,11,0.3)" : "rgba(176,28,28,0.2)"}`,
          }}
        >
          {typeLabel}
        </span>
      </div>

      <span className="ft-label text-[10px] truncate max-w-[100px]" title={inj.reason}>
        {inj.reason.slice(0, 18)}
      </span>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────

interface Props {
  data: DualFormData;
  homeTeamChinese?: string;
  awayTeamChinese?: string;
}

export default function TeamFormPanel({ data, homeTeamChinese, awayTeamChinese }: Props) {
  const home = {
    ...data.home,
    teamName: homeTeamChinese || data.home.teamName,
  };
  const away = {
    ...data.away,
    teamName: awayTeamChinese || data.away.teamName,
  };

  return (
    <div style={CARD}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-5 py-3" style={HEADER}>
        <p className="ft-label">FORM GUIDE · 近5场状态 + 伤病报告</p>
        <span className="ft-label text-[11px]" style={{ color: "var(--ft-text-dim)" }}>
          Data: API-Football · 1h cache
        </span>
      </div>

      {/* 图例 */}
      <div
        className="px-5 py-2 flex items-center gap-4"
        style={{ borderBottom: "1px solid var(--ft-divider)", backgroundColor: "var(--ft-bg-panel)" }}
      >
        {[
          { color: "var(--ft-green)", label: "胜 W" },
          { color: "var(--ft-text-muted)", label: "平 D" },
          { color: "#b01c1c", label: "负 L" },
          { color: "#f59e0b", label: "停赛" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="ft-label text-[10px]">{label}</span>
          </div>
        ))}
        <span className="ft-label text-[10px] ml-auto">主 = 主场 · 客 = 客场</span>
      </div>

      {/* 两列内容 */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x"
        style={{ "--tw-divide-opacity": "1", borderColor: "var(--ft-border)" } as React.CSSProperties}>
        <TeamColumn data={home} accentColor={C_HOME} side="home" />
        <TeamColumn data={away} accentColor={C_AWAY} side="away" />
      </div>

      {/* 底注 */}
      <div
        className="px-5 py-2"
        style={{ borderTop: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-section)" }}
      >
        <p className="ft-label text-[10px]" style={{ color: "var(--ft-text-dim)" }}>
          伤病数据基于 2026 赛季记录 · 国家队伤病覆盖可能低于俱乐部 · Not betting advice
        </p>
      </div>
    </div>
  );
}
