import { clerkClient, verifyToken } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let userId: string | null = null;

  // Try Bearer token first (sent explicitly from client)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
        authorizedParties: [
          "http://localhost:3000",
          "https://first-touch-theta.vercel.app",
        ],
      });
      userId = payload.sub;
    } catch {
      // token invalid or expired
    }
  }

  if (!userId) {
    return NextResponse.json({ error: "请先登录后再兑换邀请码" }, { status: 401 });
  }

  const body = await req.json();
  const inputCode = (body.code as string | undefined)?.trim().toUpperCase();

  if (!inputCode) {
    return NextResponse.json({ error: "请输入邀请码" }, { status: 400 });
  }

  const validCodes = (process.env.INVITE_CODES ?? "")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);

  if (!validCodes.includes(inputCode)) {
    return NextResponse.json({ error: "邀请码无效，请检查后重试" }, { status: 400 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  if ((user.publicMetadata as { tier?: string }).tier === "premium") {
    return NextResponse.json({ message: "你已拥有 Analyst 权限" });
  }

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      tier: "premium",
      redeemedCode: inputCode,
      redeemedAt: new Date().toISOString(),
    },
  });

  return NextResponse.json({
    message: "邀请码验证成功，Analyst 权限已激活",
  });
}
