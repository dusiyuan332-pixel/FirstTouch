import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const inputCode = (body.code as string | undefined)?.trim().toUpperCase();
  const userId = body.userId as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "请先登录后再兑换邀请码" }, { status: 401 });
  }

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

  let user;
  try {
    user = await client.users.getUser(userId);
  } catch (err) {
    return NextResponse.json({ error: "用户不存在，请重新登录后重试", _debug: String(err) }, { status: 401 });
  }

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

  return NextResponse.json({ message: "邀请码验证成功，Analyst 权限已激活" });
}
