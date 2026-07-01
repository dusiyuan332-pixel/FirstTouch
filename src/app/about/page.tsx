import SiteNav from "@/components/SiteNav";
import Link from "next/link";

// ─── 方法论卡片 ────────────────────────────────────────────────────────────

function ModelCard({
  title, titleEn, desc, tag,
}: {
  title: string; titleEn: string; desc: string; tag: string;
}) {
  return (
    <div style={{
      border: "1px solid var(--ft-border)",
      backgroundColor: "var(--ft-bg-section)",
      padding: "24px",
    }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-[15px] font-bold mb-0.5" style={{ color: "var(--ft-navy)" }}>
            {title}
          </h3>
          <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--ft-text-muted)" }}>
            {titleEn}
          </p>
        </div>
        <span className="font-mono text-[9px] px-2 py-1 font-bold uppercase shrink-0"
          style={{ backgroundColor: "rgba(0,40,85,0.07)", color: "var(--ft-navy)", border: "1px solid rgba(0,40,85,0.15)" }}>
          {tag}
        </span>
      </div>
      <p className="text-[13px] leading-relaxed" style={{ color: "#334155" }}>
        {desc}
      </p>
    </div>
  );
}

// ─── 数据源卡片 ────────────────────────────────────────────────────────────

function DataSourceRow({ name, type, detail }: { name: string; type: string; detail: string }) {
  return (
    <div className="flex items-center justify-between py-3"
      style={{ borderBottom: "1px solid var(--ft-divider)" }}>
      <div>
        <p className="text-[13px] font-semibold" style={{ color: "var(--ft-navy)" }}>{name}</p>
        <p className="text-[11px] mt-0.5" style={{ color: "#64748b" }}>{detail}</p>
      </div>
      <span className="font-mono text-[10px] px-2 py-0.5"
        style={{ backgroundColor: "var(--ft-green-bg)", color: "var(--ft-green)", border: "1px solid rgba(0,92,56,0.2)" }}>
        {type}
      </span>
    </div>
  );
}

// ─── 主页面 ────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--ft-bg)" }}>
      <SiteNav />

      {/* Hero */}
      <section style={{ backgroundColor: "#001830", color: "#fff" }}>
        <div className="mx-auto max-w-5xl px-4 md:px-8 py-20 md:py-28">
          <p className="font-mono text-[10px] tracking-widest uppercase mb-4"
            style={{ color: "#c9a96e" }}>
            About FirstTouch
          </p>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6"
            style={{ letterSpacing: "-0.02em", color: "#ffffff" }}>
            用量化思維<br />重新定義足球分析
          </h1>
          <p className="text-[16px] leading-relaxed max-w-2xl"
            style={{ color: "rgba(255,255,255,0.88)" }}>
            FirstTouch 是一個面向嚴肅球迷與量化研究者的足球數據平台。
            我們相信，足球的美與複雜性可以用嚴謹的概率論和博弈論來更好地理解。
          </p>
        </div>
      </section>

      {/* 使命与理念 */}
      <section className="mx-auto w-full max-w-5xl px-4 md:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <p className="ft-label mb-2">OUR STORY · 我们的故事</p>
            <h2 className="text-2xl font-bold mb-5" style={{ color: "var(--ft-navy)" }}>
              当足球遇上金融建模
            </h2>
            <div className="space-y-4 text-[14px] leading-relaxed" style={{ color: "#334155" }}>
              <p>
                FirstTouch 诞生于一个简单的问题：如果把投资银行的量化思维应用于足球预测，会得出什么结论？
              </p>
              <p>
                我们的创始团队来自金融和数据科学领域，深信市场定价并非总是有效的。足球博彩市场也是如此——
                通过系统性的数据分析，我们可以找到被低估或高估的预测，量化其中的「Edge」。
              </p>
              <p>
                这不是投注指南。这是一个思考框架：如何在不确定性中做出更好的决策。
              </p>
            </div>
          </div>
          <div className="space-y-5">
            {[
              { num: "104", label: "场 WC2026 比赛", sub: "全程覆盖，深度建模" },
              { num: "6+",  label: "个免费数据源",  sub: "football-data.org · API-Football · The Odds API" },
              { num: "∞",   label: "泊松模型精度",  sub: "基于 xG 的概率分布推演" },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-5 px-5 py-4"
                style={{ border: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-section)" }}>
                <span className="font-mono text-3xl font-black" style={{ color: "var(--ft-navy)", minWidth: 60 }}>
                  {s.num}
                </span>
                <div>
                  <p className="text-[14px] font-semibold" style={{ color: "var(--ft-navy)" }}>{s.label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#64748b" }}>{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 方法论 */}
      <section id="methodology" className="py-16"
        style={{ borderTop: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-section)" }}>
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <p className="ft-label mb-2">METHODOLOGY · 方法论</p>
          <h2 className="text-2xl font-bold mb-8" style={{ color: "var(--ft-navy)" }}>
            量化模型架构
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5">
            <ModelCard
              title="泊松预测模型"
              titleEn="Poisson Distribution"
              tag="CORE"
              desc="以历史赛季攻防数据为输入，使用泊松分布对比赛总进球数的概率进行建模。预期进球（xG）作为泊松参数 λ，推演任意比分的概率分布。"
            />
            <ModelCard
              title="市场 Edge 分析"
              titleEn="Market Edge"
              tag="STRATEGY"
              desc="比较模型隐含概率与博彩市场赔率的差异。Edge = 模型概率 − 市场隐含概率。正 Edge 意味着市场低估了该结果的真实概率。"
            />
            <ModelCard
              title="Kelly 准则"
              titleEn="Kelly Criterion"
              tag="RISK"
              desc="在已知 Edge 和赔率的前提下，Kelly 公式给出理论上最大化长期增长率的仓位比例。我们默认使用半 Kelly 以降低波动风险。"
            />
            <ModelCard
              title="大小球泊松边际"
              titleEn="Over/Under Poisson"
              tag="TOTALS"
              desc="将主客队 xG 求和为总 xG（λ），通过泊松 CDF 计算 P(total > 2.5)，与市场大小球赔率的隐含概率对比，寻找价值机会。"
            />
          </div>

          <Link href="/about#methodology" className="inline-block mt-8 text-[13px] font-semibold no-underline"
            style={{ color: "var(--ft-navy)", borderBottom: "1px solid var(--ft-navy)", paddingBottom: "2px" }}>
            了解更多 →
          </Link>
        </div>
      </section>

      {/* 数据来源 */}
      <section className="mx-auto w-full max-w-5xl px-4 md:px-8 py-16">
        <p className="ft-label mb-2">DATA SOURCES · 数据来源</p>
        <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--ft-navy)" }}>
          可信赖的多源数据
        </h2>
        <div style={{ border: "1px solid var(--ft-border)" }}>
          {[
            { name: "football-data.org",   type: "免费",   detail: "世界杯 & 英超 比赛、积分榜、射手榜" },
            { name: "API-Football v3",      type: "免费",   detail: "H2H 历史战绩、近期战绩、伤病报告" },
            { name: "The Odds API v4",      type: "免费",   detail: "实时博彩赔率 (h2h · totals) · 500 credits/月" },
            { name: "wttr.in",              type: "开源",   detail: "比赛场馆城市实时天气 · 无需 API Key" },
            { name: "自研泊松模型",         type: "内部",   detail: "Python FastAPI 后端 · xG 分布推演" },
          ].map((ds) => (
            <div key={ds.name} className="px-5">
              <DataSourceRow {...ds} />
            </div>
          ))}
        </div>
      </section>

      {/* 免责声明 */}
      <section id="disclaimer"
        style={{ borderTop: "1px solid var(--ft-border)", backgroundColor: "#001830", color: "#fff" }}>
        <div className="mx-auto max-w-5xl px-4 md:px-8 py-12">
          <p className="font-mono text-[10px] tracking-widest uppercase mb-4"
            style={{ color: "rgba(201,169,110,0.9)" }}>
            Disclaimer · 免责声明
          </p>
          <h2 className="text-xl font-bold mb-5">风险提示与使用条款</h2>
          <div className="space-y-3 text-[13px] leading-relaxed max-w-3xl"
            style={{ color: "rgba(255,255,255,0.88)" }}>
            <p>
              FirstTouch 提供的所有分析内容（包括胜率预测、Edge 分析、Kelly 仓位建议）
              <strong style={{ color: "#fff" }}>仅供学术研究与数据探索参考，不构成任何形式的投注或投资建议。</strong>
            </p>
            <p>
              足球比赛结果具有高度不确定性。任何量化模型都无法保证预测的准确性。
              历史数据和统计模型不能预测未来结果。
            </p>
            <p>
              请在您所在地区法律允许的范围内使用本网站的信息。
              本网站不对任何因使用或依赖本网站信息而导致的损失承担责任。
            </p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "11px", marginTop: 12 }}>
              Data providers: football-data.org · api-sports.io · the-odds-api.com · wttr.in<br />
              © 2026 FirstTouch Analytics. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
