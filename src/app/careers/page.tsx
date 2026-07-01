import SiteNav from "@/components/SiteNav";

// ─── 职位卡片 ──────────────────────────────────────────────────────────────

function JobCard({
  title, dept, type, location, desc, skills,
}: {
  title: string; dept: string; type: string;
  location: string; desc: string; skills: string[];
}) {
  return (
    <div style={{ border: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg)" }}>
      {/* 标题行 */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-section)" }}>
        <div>
          <h3 className="text-[15px] font-bold mb-0.5" style={{ color: "var(--ft-navy)" }}>
            {title}
          </h3>
          <p className="ft-label text-[11px]">{dept} · {location}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[9px] px-2 py-0.5 font-bold"
            style={{ backgroundColor: "var(--ft-green-bg)", color: "var(--ft-green)", border: "1px solid rgba(0,92,56,0.2)" }}>
            {type}
          </span>
        </div>
      </div>
      {/* 描述 + 技能 */}
      <div className="px-5 py-4">
      <p className="text-[13px] leading-relaxed mb-4" style={{ color: "#334155" }}>
        {desc}
      </p>
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span key={s}
              className="font-mono text-[10px] px-2 py-0.5"
              style={{ backgroundColor: "rgba(0,40,85,0.06)", color: "var(--ft-navy)", border: "1px solid rgba(0,40,85,0.12)" }}>
              {s}
            </span>
          ))}
        </div>
        <div className="mt-4">
          <a href="mailto:careers@firsttouch.app"
            className="inline-block text-[12px] font-semibold no-underline py-2 px-4"
            style={{
              backgroundColor: "var(--ft-navy)", color: "#fff",
              letterSpacing: "0.04em",
            }}>
            申请职位 →
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── 价值观卡片 ────────────────────────────────────────────────────────────

function ValueCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="px-5 py-5" style={{ border: "1px solid var(--ft-border)" }}>
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="text-[14px] font-bold mb-2" style={{ color: "var(--ft-navy)" }}>{title}</h3>
      <p className="text-[13px] leading-relaxed" style={{ color: "#334155" }}>{desc}</p>
    </div>
  );
}

// ─── 主页面 ────────────────────────────────────────────────────────────────

export default function CareersPage() {
  const JOBS = [
    {
      title: "量化足球分析师",
      dept: "Research",
      type: "全职",
      location: "远程 / 上海",
      desc: "负责开发和维护足球比赛预测模型，包括泊松分布建模、历史数据分析、边际价值识别。需要对足球有深刻理解，同时具备扎实的统计学基础。",
      skills: ["Python", "统计学", "泊松分布", "机器学习", "足球战术"],
    },
    {
      title: "全栈工程师（Next.js）",
      dept: "Engineering",
      type: "全职",
      location: "远程",
      desc: "负责 FirstTouch 前端架构与 API 集成。主要技术栈为 Next.js 15 App Router、TypeScript、Tailwind CSS。需要有 Server Component 和 API Route 开发经验。",
      skills: ["Next.js", "TypeScript", "Tailwind CSS", "API Integration", "Vercel"],
    },
    {
      title: "足球数据工程师",
      dept: "Data",
      type: "兼职 / 实习",
      location: "远程",
      desc: "负责建立并维护足球数据管道，整合多个数据源（football-data.org、API-Football 等），确保数据质量与一致性，支持分析师团队。",
      skills: ["Python", "SQL", "REST API", "数据清洗", "ETL"],
    },
    {
      title: "产品设计师",
      dept: "Product",
      type: "兼职",
      location: "远程",
      desc: "负责 FirstTouch 的用户体验设计，打造适合量化分析师和足球爱好者的数据可视化界面。需要有 Figma 使用经验，并对数据产品有热情。",
      skills: ["Figma", "UX/UI", "数据可视化", "用户研究", "原型设计"],
    },
  ];

  const VALUES = [
    {
      icon: "📊",
      title: "数据驱动",
      desc: "所有决策基于数据和逻辑，而非直觉。我们相信严谨的量化分析能揭示足球运动的深层规律。",
    },
    {
      icon: "🔍",
      title: "追求精确",
      desc: "模型的每一个假设都应该被检验。我们不断迭代和回测，追求预测的持续改进。",
    },
    {
      icon: "🌐",
      title: "开放透明",
      desc: "我们的方法论公开，数据来源清晰，分析逻辑可以被质疑和讨论。好的想法来自开放的环境。",
    },
    {
      icon: "⚽",
      title: "热爱足球",
      desc: "技术是工具，足球是灵魂。我们对这项运动有发自内心的热情，这驱动我们不断探索。",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--ft-bg)" }}>
      <SiteNav />

      {/* Hero */}
      <section style={{ backgroundColor: "#001830", color: "#fff" }}>
        <div className="mx-auto max-w-5xl px-4 md:px-8 py-20 md:py-28">
          <p className="font-mono text-[10px] tracking-widest uppercase mb-4"
            style={{ color: "rgba(201,169,110,0.9)" }}>
            Careers · 加入我们
          </p>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6"
            style={{ letterSpacing: "-0.02em" }}>
            构建下一代<br />足球分析平台
          </h1>
          <p className="text-[16px] leading-relaxed max-w-2xl mb-8"
            style={{ color: "rgba(255,255,255,0.88)" }}>
            我们正在寻找对数据、足球、以及不确定性充满热情的人才。
            无论你是量化分析师、工程师还是设计师，只要你相信数据可以让足球更有趣，我们很想认识你。
          </p>
          <div className="flex flex-wrap gap-4">
            {[
              { num: "4", label: "个开放职位" },
              { num: "100%", label: "远程友好" },
              { num: "Stage", label: "种子阶段" },
            ].map((s) => (
              <div key={s.num} className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-black">{s.num}</span>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 开放职位 */}
      <section className="mx-auto w-full max-w-5xl px-4 md:px-8 py-16">
        <p className="ft-label mb-2">OPEN POSITIONS · 开放职位</p>
        <h2 className="text-2xl font-bold mb-8" style={{ color: "var(--ft-navy)" }}>
          当前在招职位
        </h2>
        <div className="space-y-5">
          {JOBS.map((job) => (
            <JobCard key={job.title} {...job} />
          ))}
        </div>
      </section>

      {/* 工作文化 */}
      <section id="culture"
        style={{ borderTop: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-section)" }}>
        <div className="mx-auto max-w-5xl px-4 md:px-8 py-16">
          <p className="ft-label mb-2">CULTURE · 工作文化</p>
          <h2 className="text-2xl font-bold mb-8" style={{ color: "var(--ft-navy)" }}>
            我们的价值观
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v) => (
              <ValueCard key={v.title} {...v} />
            ))}
          </div>

          {/* 工作方式 */}
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {[
              {
                title: "异步优先",
                desc: "我们信任每个人的工作节奏。通过文档和异步沟通，你可以在最专注的时间工作。",
              },
              {
                title: "结果导向",
                desc: "你会对自己的模块完全负责。不需要请示每一个决定，但需要清晰地展示你的思考过程。",
              },
              {
                title: "持续学习",
                desc: "足球分析是一个快速发展的领域。我们鼓励阅读、实验和分享，保持对新方法的开放态度。",
              },
            ].map((w) => (
              <div key={w.title} className="px-5 py-5"
                style={{ border: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg)" }}>
                <h3 className="text-[14px] font-bold mb-2" style={{ color: "var(--ft-navy)" }}>{w.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: "#334155" }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ backgroundColor: "#001830", color: "#fff" }}>
        <div className="mx-auto max-w-5xl px-4 md:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">没有合适的职位？</h2>
          <p className="text-[14px] mb-6" style={{ color: "rgba(255,255,255,0.88)" }}>
            如果你认为自己能为 FirstTouch 带来价值，随时发邮件给我们。
          </p>
          <a
            href="mailto:careers@firsttouch.app"
            className="inline-block font-semibold text-[13px] no-underline py-3 px-8"
            style={{
              border: "1px solid rgba(201,169,110,0.6)",
              color: "#c9a96e",
              letterSpacing: "0.06em",
            }}
          >
            发送简历 → careers@firsttouch.app
          </a>
        </div>
      </section>
    </div>
  );
}
