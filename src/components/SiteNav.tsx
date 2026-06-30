"use client";

import Link from "next/link";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";

interface SiteNavProps {
  activeSection?: "dashboard" | "worldcup" | "match";
}

const NAV_ITEMS = [
  { label: "市场概览", href: "/",         section: "dashboard" },
  { label: "世界杯", href: "/worldcup", section: "worldcup"  },
] as const;

export default function SiteNav({ activeSection }: SiteNavProps) {
  const { isSignedIn } = useUser();

  return (
    <header
      style={{
        backgroundColor: "var(--ft-bg)",
        borderBottom: "1px solid var(--ft-border)",
      }}
      className="sticky top-0 z-50"
    >
      <div className="mx-auto flex h-14 md:h-16 max-w-6xl items-stretch justify-between px-4 md:px-8">

        {/* 品牌 */}
        <Link
          href="/"
          className="flex items-center no-underline"
          style={{ color: "var(--ft-navy)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/newfulllogo-trimmed.svg"
            alt="FirstTouch"
            style={{ height: "46px", width: "auto", maxWidth: "360px" }}
            className="object-contain"
          />
        </Link>

        {/* 导航 + 用户区 */}
        <nav className="flex items-stretch gap-0">
          {NAV_ITEMS.map((item) => {
            const isActive =
              activeSection === item.section ||
              (activeSection === "match" && item.section === "worldcup");
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-3 md:px-5 text-[13px] font-medium no-underline transition-colors"
                style={{
                  color: isActive ? "var(--ft-navy)" : "var(--ft-text-muted)",
                  borderBottom: isActive ? "2px solid var(--ft-navy)" : "2px solid transparent",
                  marginBottom: "-1px",
                }}
              >
                {item.label}
              </Link>
            );
          })}

          {/* 分隔线 */}
          <div className="mx-2 md:mx-4 my-4 md:my-5 w-px" style={{ backgroundColor: "var(--ft-border)" }} />

          {/* 登录态 */}
          <div className="flex items-center">
            {isSignedIn ? (
              <UserButton appearance={{ elements: { avatarBox: "h-7 w-7" } }} />
            ) : (
              <SignInButton mode="modal">
                <button
                  className="px-3 md:px-4 text-[13px] font-medium transition-colors"
                  style={{ color: "var(--ft-text-muted)" }}
                >
                  登录
                </button>
              </SignInButton>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
