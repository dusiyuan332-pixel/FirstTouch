import { NextRequest, NextResponse } from "next/server";

const BASE = "https://v3.football.api-sports.io";

async function apiFetch(path: string) {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return { error: "API_FOOTBALL_KEY not set" };

  const res = await fetch(`${BASE}${path}`, {
    headers: { "x-apisports-key": key },
    cache: "no-store",
  });

  const remaining = res.headers.get("x-ratelimit-requests-remaining");
  const limit     = res.headers.get("x-ratelimit-requests-limit");

  if (!res.ok) {
    return { error: `HTTP ${res.status}`, remaining, limit };
  }
  const data = await res.json();
  return { data, remaining, limit, status: res.status };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const home = searchParams.get("home") ?? "France";
  const away = searchParams.get("away") ?? "Sweden";

  // Step 1: 检查 API key
  const key = process.env.API_FOOTBALL_KEY;
  const keyPresent = !!key;
  const keyPreview = key ? `${key.slice(0, 6)}...` : "NOT SET";

  // Step 2: 搜索主队
  const homeSearch = await apiFetch(`/teams?search=${encodeURIComponent(home)}`);

  // Step 3: 搜索客队
  const awaySearch = await apiFetch(`/teams?search=${encodeURIComponent(away)}`);

  // Step 4: 如果找到 ID，尝试 H2H
  let h2hResult: unknown = null;
  const homeId = (homeSearch.data as { response?: Array<{ team: { id: number; national: boolean } }> })
    ?.response?.find((r) => r.team.national)?.team?.id
    ?? (homeSearch.data as { response?: Array<{ team: { id: number } }> })?.response?.[0]?.team?.id;
  const awayId = (awaySearch.data as { response?: Array<{ team: { id: number; national: boolean } }> })
    ?.response?.find((r) => r.team.national)?.team?.id
    ?? (awaySearch.data as { response?: Array<{ team: { id: number } }> })?.response?.[0]?.team?.id;

  if (homeId && awayId) {
    h2hResult = await apiFetch(`/fixtures/headtohead?h2h=${homeId}-${awayId}&last=10`);
  }

  return NextResponse.json({
    keyPresent,
    keyPreview,
    homeTeam: home,
    awayTeam: away,
    homeSearch: {
      status: homeSearch.status,
      error: homeSearch.error,
      remaining: homeSearch.remaining,
      limit: homeSearch.limit,
      resultCount: (homeSearch.data as { response?: unknown[] })?.response?.length ?? 0,
      firstResult: (homeSearch.data as { response?: Array<{ team: unknown }> })?.response?.[0]?.team,
      nationalResult: (homeSearch.data as { response?: Array<{ team: { national: boolean; id: number; name: string } }> })
        ?.response?.find((r) => r.team.national)?.team,
    },
    awaySearch: {
      status: awaySearch.status,
      error: awaySearch.error,
      remaining: awaySearch.remaining,
      limit: awaySearch.limit,
      resultCount: (awaySearch.data as { response?: unknown[] })?.response?.length ?? 0,
      firstResult: (awaySearch.data as { response?: Array<{ team: unknown }> })?.response?.[0]?.team,
      nationalResult: (awaySearch.data as { response?: Array<{ team: { national: boolean; id: number; name: string } }> })
        ?.response?.find((r) => r.team.national)?.team,
    },
    resolvedHomeId: homeId,
    resolvedAwayId: awayId,
    h2hResult: {
      error: (h2hResult as { error?: string } | null)?.error,
      remaining: (h2hResult as { remaining?: string } | null)?.remaining,
      matchCount: ((h2hResult as { data?: { response?: unknown[] } } | null)?.data?.response?.length) ?? 0,
      firstMatch: ((h2hResult as { data?: { response?: unknown[] } } | null)?.data?.response?.[0]),
    },
  });
}
