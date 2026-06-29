import Image from "next/image";
import { type TeamStanding } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─── 辅助：排名徽章颜色 ───────────────────────────────────────────────────────

function RankCell({ rank }: { rank: number }) {
  // 世界杯小组前 2 名晋级淘汰赛
  const advancing = rank <= 2;
  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold
        ${advancing
          ? "bg-sky-500/20 text-sky-400"
          : "bg-slate-800 text-slate-500"
        }`}
    >
      {rank}
    </span>
  );
}

// ─── 净胜球着色 ───────────────────────────────────────────────────────────────

function GoalDiff({ value }: { value: number }) {
  const color =
    value > 0
      ? "text-emerald-400"
      : value < 0
        ? "text-rose-400"
        : "text-slate-400";
  return (
    <span className={`font-mono text-sm ${color}`}>
      {value > 0 ? `+${value}` : value}
    </span>
  );
}

// ─── GroupStandings 主组件 ────────────────────────────────────────────────────
// Props:
//   groupName  — "Group A" 等，用于标题和锚点 id
//   teams      — 该小组的 4 支球队数据

interface GroupStandingsProps {
  groupName: string;
  teams: TeamStanding[];
}

export default function GroupStandings({ groupName, teams }: GroupStandingsProps) {
  // 将 "Group A" 转为 URL 安全的锚点：group-a
  const anchorId = groupName.toLowerCase().replace(/\s+/g, "-");

  return (
    <Card
      id={anchorId}
      className="border-white/8 bg-slate-900 scroll-mt-28"
    >
      <CardHeader className="border-b border-white/8 pb-4">
        <div className="flex items-center gap-3">
          {/* 小组字母头像 */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sm font-bold text-sky-400 ring-1 ring-sky-500/25">
            {groupName.replace("Group ", "")}
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-white">
              {groupName}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              FIFA 世界杯 2022 · 卡塔尔
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-white/8 hover:bg-transparent">
              <TableHead className="w-10 text-center text-slate-500">#</TableHead>
              <TableHead className="text-slate-500">球队</TableHead>
              <TableHead className="w-10 text-center text-slate-500">场</TableHead>
              <TableHead className="w-14 text-center text-slate-500">净胜</TableHead>
              <TableHead className="w-14 text-center text-slate-500 font-bold">积分</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow
                key={team.team.id}
                className={`border-white/8 transition-colors hover:bg-white/[0.03]
                  ${team.rank === 2 ? "border-b border-dashed border-white/15" : ""}`}
              >
                {/* 排名 */}
                <TableCell className="text-center">
                  <RankCell rank={team.rank} />
                </TableCell>

                {/* 球队名 + 队徽 */}
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="relative h-6 w-6 shrink-0">
                      <Image
                        src={team.team.logo}
                        alt={team.team.name}
                        fill
                        className="object-contain"
                        sizes="24px"
                      />
                    </div>
                    <span className="text-sm font-medium text-white">
                      {team.team.name}
                    </span>
                  </div>
                </TableCell>

                {/* 场次 */}
                <TableCell className="text-center font-mono text-sm text-slate-400">
                  {team.all.played}
                </TableCell>

                {/* 净胜球 */}
                <TableCell className="text-center">
                  <GoalDiff value={team.goalsDiff} />
                </TableCell>

                {/* 积分 */}
                <TableCell className="text-center">
                  <span className="font-mono text-base font-bold text-white">
                    {team.points}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
