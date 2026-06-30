"use client";

import Link from "next/link";
import Image from "next/image";
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
          className="flex items-center gap-2 md:gap-3 no-underline"
          style={{ color: "var(--ft-navy)" }}
        >
          <Image
            src="/logo-mark.png"
            alt="FirstTouch"
            width={28}
            height={32}
            className="object-contain"
            priority
          />
          <div className="flex flex-col justify-center leading-none">
            <span className="ft-heading text-[15px] md:text-[17px] font-semibold" style={{ letterSpacing: "0.02em" }}>
              FirstTouch
            </span>
            <span className="ft-label mt-0.5 hidden sm:block">Quantitative Analytics</span>
          </div>
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
