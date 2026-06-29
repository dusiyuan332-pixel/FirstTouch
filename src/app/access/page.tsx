"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";

// ─── 订阅等级展示 ─────────────────────────────────────────────────────────────

const TIERS = [
  {
    name: "Observer",
    nameZh: "旁观者",
    price: "Free",
    features: [
      "世界杯赛程总览",
      "五大联赛赛程预览",
      "仪表盘概览",
    ],
    locked: [
      "对局量化分析报告",
      "Python 泊松预测模型",
      "比分概率矩阵",
      "Kelly 仓位建议",
    ],
    current: true,
    cta: null,
  },
  {
    name: "Analyst",
    nameZh: "分析师",
    price: "邀请制",
    features: [
      "全部 Observer 功能",
      "对局完整分析报告",
      "实时 Python 泊松预测",
      "5×5 比分概率矩阵",
      "Kelly Criterion 仓位计算",
      "市场价值差 Edge Analysis",
    ],
    locked: [],
    current: false,
    cta: "输入邀请码",
  },
];

// ─── 邀请码表单 ───────────────────────────────────────────────────────────────

function InviteCodeForm() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    if (!isSignedIn) {
      setStatus("error");
      setMessage("请先登录后再兑换邀请码");
      return;
    }

    setStatus("loading");
    setMessage("");

    // 主动获取 Clerk token 放入 Authorization header
    const token = await getToken();

    try {
      const res = await fetch("/api/redeem-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message ?? "邀请码验证成功，正在升级权限...");
        setTimeout(() => router.push("/worldcup"), 1800);
      } else {
        setStatus("error");
        setMessage(data.error ?? "邀请码无效，请重新确认");
      }
    } catch {
      setStatus("error");
      setMessage("网络错误，请稍后重试");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="ft-label mb-2 block">邀请码</label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="FIRSTTOUCH2026"
          disabled={status === "loading" || status === "success"}
          className="w-full px-4 py-3 font-mono text-[13px] tracking-widest outline-none transition-colors"
          style={{
            border: status === "error"
              ? "1px solid var(--ft-red)"
              : status === "success"
              ? "1px solid var(--ft-green)"
              : "1px solid var(--ft-border)",
            backgroundColor: "var(--ft-bg)",
            color: "var(--ft-navy)",
          }}
        />
      </div>

      {message && (
        <p
          className="ft-label"
          style={{ color: status === "success" ? "var(--ft-green)" : "var(--ft-red)" }}
        >
          {status === "success" ? "✓ " : "× "}{message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading" || status === "success" || !code.trim()}
        className="w-full px-4 py-3 text-[13px] font-semibold text-white transition-all"
        style={{
          backgroundColor: status === "success"
            ? "var(--ft-green)"
            : status === "loading"
            ? "var(--ft-text-muted)"
            : "var(--ft-navy)",
          cursor: status === "loading" || status === "success" ? "not-allowed" : "pointer",
        }}
      >
        {status === "loading" ? "验证中..." : status === "success" ? "已解锁 Analyst 权限" : "兑换邀请码"}
      </button>
    </form>
  );
}

// ─── 主页面 ───────────────────────────────────────────────────────────────────

export default function AccessPage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--ft-bg)" }}>
      <SiteNav />

      {/* 页头 */}
      <div style={{ borderBottom: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-section)" }}>
        <div className="mx-auto max-w-4xl px-8 py-14">
          <p className="ft-label mb-4">FirstTouch · Access Control</p>
          <h1 className="ft-heading text-3xl font-semibold" style={{ maxWidth: "480px" }}>
            Research Access
          </h1>
          <p className="mt-4 text-[14px] leading-relaxed" style={{ color: "var(--ft-text-muted)", maxWidth: "420px" }}>
            量化分析报告属于机构级研究产品，需要相应权限方可访问。
            目前处于邀请制内测阶段。
          </p>
        </div>
      </div>

      <main className="mx-auto w-full max-w-4xl flex-1 px-8 py-12">

        {/* 等级对比 */}
        <div className="grid gap-6 md:grid-cols-2 mb-12">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              style={{
                border: "1px solid var(--ft-border)",
                backgroundColor: "var(--ft-bg-card)",
                borderTop: `3px solid ${tier.current ? "var(--ft-text-dim)" : "var(--ft-navy)"}`,
              }}
            >
              {/* 等级头 */}
              <div className="px-6 py-5" style={{ borderBottom: "1px solid var(--ft-divider)" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="ft-label mb-1">{tier.nameZh}</p>
                    <h2 className="ft-heading text-xl font-semibold">{tier.name}</h2>
                  </div>
                  <div className="text-right">
                    <p
                      className="font-mono text-lg font-black"
                      style={{ color: tier.current ? "var(--ft-text-muted)" : "var(--ft-navy)" }}
                    >
                      {tier.price}
                    </p>
                  </div>
                </div>
                {tier.current && (
                  <span
                    className="mt-3 inline-block font-mono text-[9px] font-bold uppercase px-2.5 py-1 tracking-wider"
                    style={{ backgroundColor: "var(--ft-bg-panel)", color: "var(--ft-text-dim)", border: "1px solid var(--ft-border)" }}
                  >
                    当前等级
                  </span>
                )}
              </div>

              {/* 功能列表 */}
              <div className="px-6 py-5 space-y-2">
                {tier.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <span className="h-1 w-1 shrink-0 bg-current" style={{ color: "var(--ft-navy)" }} />
                    <span className="text-[13px]" style={{ color: "var(--ft-text)" }}>{f}</span>
                  </div>
                ))}
                {tier.locked.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 opacity-35">
                    <span className="h-1 w-1 shrink-0" style={{ backgroundColor: "var(--ft-text-dim)" }} />
                    <span className="text-[13px] line-through" style={{ color: "var(--ft-text-muted)" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 邀请码兑换区 */}
        <div style={{ border: "1px solid var(--ft-border)", borderLeft: "3px solid var(--ft-navy)" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--ft-divider)", backgroundColor: "var(--ft-bg-section)" }}>
            <p className="ft-label">Invite Code · 邀请码兑换</p>
          </div>
          <div className="px-6 py-6 max-w-sm">
            <p className="text-[13px] mb-5" style={{ color: "var(--ft-text-muted)" }}>
              持有邀请码可立即升级至 Analyst 权限，永久有效，无需付费。
            </p>
            <InviteCodeForm />
          </div>
        </div>

        {/* 底部导航 */}
        <div className="mt-10 flex items-center gap-6" style={{ borderTop: "1px solid var(--ft-divider)", paddingTop: "24px" }}>
          <Link href="/" className="ft-label transition-colors" style={{ color: "var(--ft-text-muted)" }}>
            ← 返回首页
          </Link>
          <Link href="/worldcup" className="ft-label transition-colors" style={{ color: "var(--ft-text-muted)" }}>
            查看赛程
          </Link>
        </div>
      </main>
    </div>
  );
}
