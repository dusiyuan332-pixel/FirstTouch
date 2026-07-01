"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";

// ─── 菜单结构 ──────────────────────────────────────────────────────────────

const MENU_SECTIONS = [
  {
    id: "analytics",
    label: "足球分析",
    labelEn: "Football Analytics",
    items: [
      { label: "世界杯 2026",  href: "/worldcup",          desc: "64 场比赛深度量化分析" },
      { label: "市场概览",     href: "/",                  desc: "英超实时赔率 · Edge 追踪" },
    ],
  },
  {
    id: "about",
    label: "关于我们",
    labelEn: "About Us",
    items: [
      { label: "我们的故事",   href: "/about",                    desc: "FirstTouch 的量化足球哲学" },
      { label: "分析方法论",   href: "/about#methodology",        desc: "数据源 · 模型架构 · 边际" },
      { label: "免责声明",     href: "/about#disclaimer",         desc: "风险提示与使用条款" },
    ],
  },
  {
    id: "careers",
    label: "加入我们",
    labelEn: "Careers",
    items: [
      { label: "开放职位",     href: "/careers",                  desc: "数据科学 · 工程 · 产品" },
      { label: "工作文化",     href: "/careers#culture",          desc: "我们的价值观与工作方式" },
    ],
  },
] as const;

type SectionId = typeof MENU_SECTIONS[number]["id"];

// ─── 设计常量 ──────────────────────────────────────────────────────────────

const OVERLAY_BG   = "#001830";
const GOLD         = "#c9a96e";
const WHITE        = "#ffffff";
const WHITE_DIM    = "rgba(255,255,255,0.50)";
const WHITE_BORDER = "rgba(255,255,255,0.10)";

// ─── 汉堡图标 ──────────────────────────────────────────────────────────────

function HamburgerIcon({ open }: { open: boolean }) {
  const base = {
    display: "block",
    width: "22px",
    height: "2px",
    backgroundColor: "var(--ft-navy)",
    transition: "all 0.28s ease",
    transformOrigin: "center",
  } as React.CSSProperties;
  return (
    <div style={{ width: 22, height: 16, position: "relative", cursor: "pointer" }}>
      <span style={{
        ...base,
        position: "absolute", top: 0,
        transform: open ? "translateY(7px) rotate(45deg)" : "none",
      }} />
      <span style={{
        ...base,
        position: "absolute", top: 7,
        opacity: open ? 0 : 1,
        transform: open ? "scaleX(0)" : "none",
      }} />
      <span style={{
        ...base,
        position: "absolute", top: 14,
        transform: open ? "translateY(-7px) rotate(-45deg)" : "none",
      }} />
    </div>
  );
}

// ─── 全屏菜单 Overlay ──────────────────────────────────────────────────────

function NavOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [active, setActive] = useState<SectionId>("analytics");

  // 重置 active 状态
  useEffect(() => { if (open) setActive("analytics"); }, [open]);

  const activeSection = MENU_SECTIONS.find((s) => s.id === active)!;

  return (
    <>
      {/* 遮罩 */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 90,
          backgroundColor: "rgba(0,0,0,0.5)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* 菜单面板 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "min(620px, 100vw)",
          zIndex: 100,
          backgroundColor: OVERLAY_BG,
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "4px 0 40px rgba(0,0,0,0.4)",
        }}
      >
        {/* 头部：Logo + 关闭按钮 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            height: "64px",
            borderBottom: `1px solid ${WHITE_BORDER}`,
            flexShrink: 0,
          }}
        >
          <Link href="/" onClick={onClose}
            style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-wordmark-clean.png" alt="FirstTouch"
              style={{ height: 36, width: "auto", filter: "brightness(0) invert(1)" }} />
          </Link>
          <button
            onClick={onClose}
            aria-label="关闭菜单"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: WHITE, fontSize: "24px", lineHeight: 1,
              padding: "4px", opacity: 0.7,
            }}
          >
            ✕
          </button>
        </div>

        {/* 主体：左列（分类） + 右列（子项） */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* 左列：主分类 */}
          <div
            style={{
              width: "210px",
              flexShrink: 0,
              borderRight: `1px solid ${WHITE_BORDER}`,
              padding: "32px 0",
              overflowY: "auto",
            }}
          >
            {MENU_SECTIONS.map((sec) => {
              const isActive = active === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActive(sec.id)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "14px 28px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: "15px",
                      fontWeight: 600,
                      color: isActive ? GOLD : WHITE,
                      letterSpacing: "0.02em",
                      transition: "color 0.18s ease",
                    }}
                  >
                    {sec.label}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "10px",
                      color: isActive ? `${GOLD}aa` : WHITE_DIM,
                      marginTop: "2px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {sec.labelEn}
                  </span>
                  {/* 右侧 ">" 指示 */}
                  {isActive && (
                    <span style={{
                      position: "absolute",
                      right: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: GOLD,
                      fontSize: "14px",
                    }}>
                      ›
                    </span>
                  )}
                </button>
              );
            })}

            {/* 底部分隔 + 版本信息 */}
            <div style={{ marginTop: "auto", padding: "24px 28px 0", borderTop: `1px solid ${WHITE_BORDER}`, marginInline: "16px" }}>
              <p style={{ fontSize: "10px", color: WHITE_DIM, lineHeight: 1.5 }}>
                FirstTouch Analytics<br />
                Powered by Poisson Model
              </p>
            </div>
          </div>

          {/* 右列：子项 */}
          <div
            style={{
              flex: 1,
              padding: "32px 28px",
              overflowY: "auto",
            }}
          >
            {/* 分类标题 */}
            <p style={{
              fontSize: "10px",
              color: GOLD,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "20px",
            }}>
              {activeSection.labelEn}
            </p>

            {/* 子菜单项 */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {activeSection.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  style={{
                    display: "block",
                    padding: "12px 14px",
                    textDecoration: "none",
                    borderRadius: "4px",
                    transition: "background 0.15s ease",
                    borderLeft: `2px solid transparent`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLAnchorElement).style.borderLeftColor = GOLD;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
                    (e.currentTarget as HTMLAnchorElement).style.borderLeftColor = "transparent";
                  }}
                >
                  <span style={{
                    display: "block",
                    fontSize: "15px",
                    fontWeight: 600,
                    color: WHITE,
                    letterSpacing: "0.01em",
                  }}>
                    {item.label}
                  </span>
                  <span style={{
                    display: "block",
                    fontSize: "11px",
                    color: WHITE_DIM,
                    marginTop: "3px",
                  }}>
                    {item.desc}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* 底部免责说明 */}
        <div style={{
          padding: "12px 28px",
          borderTop: `1px solid ${WHITE_BORDER}`,
          flexShrink: 0,
        }}>
          <p style={{ fontSize: "10px", color: WHITE_DIM, lineHeight: 1.5 }}>
            © 2026 FirstTouch Analytics · 本站内容仅供研究参考，不构成投注建议
          </p>
        </div>
      </div>
    </>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────

interface SiteNavProps {
  /** 保留向后兼容，当前设计中不再用于 nav bar 高亮 */
  activeSection?: string;
}

export default function SiteNav({ activeSection: _activeSection }: SiteNavProps) {
  const { isSignedIn } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);

  // 菜单打开时锁定 body 滚动
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Esc 关闭
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close]);

  return (
    <>
      <header
        style={{
          backgroundColor: "var(--ft-bg)",
          borderBottom: "1px solid var(--ft-border)",
        }}
        className="sticky top-0 z-50"
      >
        {/* 三列 grid：左(汉堡) | 中(Logo) | 右(用户) */}
        <div
          className="mx-auto max-w-6xl px-4 md:px-8"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            height: "64px",
          }}
        >
          {/* 左：汉堡按钮 */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={() => setIsOpen((v) => !v)}
              aria-label={isOpen ? "关闭菜单" : "打开菜单"}
              aria-expanded={isOpen}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: "-8px",
              }}
            >
              <HamburgerIcon open={isOpen} />
            </button>
          </div>

          {/* 中：Logo（绝对居中） */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-wordmark-clean.png"
              alt="FirstTouch"
              style={{ height: "38px", width: "auto" }}
              className="object-contain"
            />
          </Link>

          {/* 右：用户区 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            {isSignedIn ? (
              <UserButton appearance={{ elements: { avatarBox: "h-7 w-7" } }} />
            ) : (
              <SignInButton mode="modal">
                <button
                  style={{
                    background: "none",
                    border: "1px solid var(--ft-border)",
                    cursor: "pointer",
                    padding: "5px 14px",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--ft-text-muted)",
                    letterSpacing: "0.04em",
                  }}
                >
                  登录
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      {/* 菜单 Overlay */}
      <NavOverlay open={isOpen} onClose={close} />
    </>
  );
}
