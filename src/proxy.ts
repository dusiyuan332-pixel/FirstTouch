import { clerkMiddleware } from "@clerk/nextjs/server";

// 不在中间件层拦截，让每个页面自己做鉴权
// match/[id]/page.tsx 内部的 checkAnalystAccess() 负责：
//   未登录 → PaywallUI（显示付费墙）
//   已登录 free → PaywallUI
//   已登录 premium → 正常显示报告
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
