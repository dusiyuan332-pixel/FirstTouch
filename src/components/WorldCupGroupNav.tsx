"use client";

// 客户端组件：实现分组导航的平滑滚动
// 接收所有小组名列表，渲染横向滚动的导航栏

interface WorldCupGroupNavProps {
  groups: string[]; // 例如 ["Group A", "Group B", ...]
}

export default function WorldCupGroupNav({ groups }: WorldCupGroupNavProps) {
  function handleClick(groupName: string) {
    const anchorId = groupName.toLowerCase().replace(/\s+/g, "-");
    const el = document.getElementById(anchorId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <nav
      aria-label="小组导航"
      className="sticky top-14 z-40 border-b border-white/8 bg-slate-950/90 backdrop-blur-md"
    >
      <div className="mx-auto max-w-6xl px-6">
        <ul className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
          {groups.map((group) => (
            <li key={group} className="shrink-0">
              <button
                onClick={() => handleClick(group)}
                className="rounded-lg px-4 py-1.5 text-xs font-semibold tracking-wide text-slate-400
                  transition-colors hover:bg-white/8 hover:text-white
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                {group}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
