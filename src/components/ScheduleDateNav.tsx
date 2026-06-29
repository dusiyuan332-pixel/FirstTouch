"use client";

interface ScheduleDateNavProps {
  dates: string[];
  todayDate: string;
}

export default function ScheduleDateNav({ dates, todayDate }: ScheduleDateNavProps) {
  function handleClick(date: string) {
    const el = document.getElementById(`date-${date}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav
      aria-label="赛程日期导航"
      className="sticky top-16 z-40"
      style={{
        backgroundColor: "var(--ft-bg)",
        borderBottom: "1px solid var(--ft-border)",
      }}
    >
      <div className="mx-auto max-w-5xl px-8">
        <ul className="flex overflow-x-auto scrollbar-none">
          {dates.map((date) => {
            const isToday = date === todayDate;
            return (
              <li key={date} className="shrink-0">
                <button
                  onClick={() => handleClick(date)}
                  className="px-4 py-4 font-mono text-[11px] transition-colors focus-visible:outline-none"
                  style={{
                    color: isToday ? "var(--ft-navy)" : "var(--ft-text-muted)",
                    borderBottom: isToday
                      ? "2px solid var(--ft-navy)"
                      : "2px solid transparent",
                    fontWeight: isToday ? 600 : 400,
                  }}
                >
                  {isToday ? "今天" : date.slice(5)}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
