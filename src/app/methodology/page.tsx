import SiteNav from "@/components/SiteNav";
import Link from "next/link";

function Section({ id, title, titleEn, children }: {
  id: string; title: string; titleEn: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="py-12" style={{ borderBottom: "1px solid var(--ft-border)" }}>
      <p className="ft-label mb-1">{titleEn}</p>
      <h2 className="text-xl font-bold mb-6" style={{ color: "var(--ft-navy)" }}>{title}</h2>
      {children}
    </section>
  );
}

function Formula({ eq, desc }: { eq: string; desc: string }) {
  return (
    <div className="my-4 px-5 py-4"
      style={{ border: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-section)" }}>
      <p className="font-mono text-[14px] font-bold mb-2" style={{ color: "var(--ft-navy)" }}>{eq}</p>
      <p className="ft-label text-[11px]">{desc}</p>
    </div>
  );
}

export default function MethodologyPage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--ft-bg)" }}>
      <SiteNav />

      {/* Hero */}
      <div style={{ backgroundColor: "#001830", color: "#fff" }}>
        <div className="mx-auto max-w-4xl px-4 md:px-8 py-16">
          <p className="font-mono text-[10px] tracking-widest uppercase mb-4"
            style={{ color: "rgba(201,169,110,0.9)" }}>
            Methodology · 方法论
          </p>
          <h1 className="text-3xl md:text-4xl font-black mb-4" style={{ letterSpacing: "-0.02em" }}>
            量化模型技术文档
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
            FirstTouch 分析引擎的数学基础与实现逻辑
          </p>
        </div>
      </div>

      <main className="mx-auto w-full max-w-4xl px-4 md:px-8 py-8">

        <Section id="poisson" title="泊松预测模型" titleEn="POISSON DISTRIBUTION MODEL">
          <div className="space-y-4 text-[14px] leading-relaxed" style={{ color: "var(--ft-text-muted)" }}>
            <p>
              足球比赛中的进球数可以近似用泊松分布建模。给定球队的历史攻防数据，
              我们可以估算出每队在一场比赛中的预期进球数（xG），进而推演所有可能比分的概率分布。
            </p>
            <Formula
              eq="P(X=k) = e^(-λ) · λᵏ / k!"
              desc="λ = 预期进球数（xG），k = 实际进球数"
            />
            <p>
              主队的 xG（λ_home）由其近期场均进球 × 客队近期场均失球 × 主场优势系数计算得出。
              客队同理。两者相互独立，联合概率可以用两个泊松分布的笛卡尔积表示。
            </p>
          </div>
        </Section>

        <Section id="edge" title="Edge 市场价值差分析" titleEn="EDGE ANALYSIS">
          <div className="space-y-4 text-[14px] leading-relaxed" style={{ color: "var(--ft-text-muted)" }}>
            <p>
              Edge 是我们核心的量化指标，衡量模型对某个结果的概率估计与市场赔率隐含概率之间的差距。
            </p>
            <Formula
              eq="Edge = P_model − P_market"
              desc="P_market = 1 / decimal_odds（市场隐含概率，已去除过水）"
            />
            <p>
              正 Edge（+%）表示模型认为该结果被市场低估；负 Edge 表示被高估。
              我们通常只关注 Edge ≥ 2% 的机会，并用绿色左边框高亮显示。
            </p>
          </div>
        </Section>

        <Section id="kelly" title="Kelly 准则" titleEn="KELLY CRITERION">
          <div className="space-y-4 text-[14px] leading-relaxed" style={{ color: "var(--ft-text-muted)" }}>
            <p>
              Kelly 准则给出在已知胜率和赔率的情况下，最大化对数期望收益（即长期增长率）的最优下注比例。
            </p>
            <Formula
              eq="f* = (bp − q) / b = (b·p − (1−p)) / b"
              desc="b = 净赔率（odds−1），p = 模型胜率，q = 1−p"
            />
            <p>
              由于全 Kelly 波动极大，我们默认使用<strong style={{ color: "var(--ft-navy)" }}>半 Kelly（f* / 2）</strong>，
              在保留长期增长优势的同时降低短期亏损风险。任何 Kelly 比例 &gt; 25% 时自动上限到 25%。
            </p>
          </div>
        </Section>

        <Section id="totals" title="大小球泊松边际" titleEn="OVER/UNDER POISSON MODEL">
          <div className="space-y-4 text-[14px] leading-relaxed" style={{ color: "var(--ft-text-muted)" }}>
            <p>
              总进球数 T = 主队进球 + 客队进球。由于两队进球相互独立，T 服从参数为
              λ_total = λ_home + λ_away 的泊松分布。
            </p>
            <Formula
              eq="P(Over 2.5) = 1 − P(T≤2) = 1 − Σ P(T=k), k=0,1,2"
              desc="与市场大小球赔率的隐含概率对比，计算 Over/Under Edge"
            />
          </div>
        </Section>

        <div className="py-8 text-center">
          <Link href="/about" className="ft-label no-underline" style={{ color: "var(--ft-text-dim)" }}>
            ← 返回关于我们
          </Link>
        </div>
      </main>
    </div>
  );
}
