/**
 * VenueWeatherPanel — 比赛场馆 + 实时天气
 *
 * 数据来源：
 *  - 场馆：football-data.org API（venue 字段）+ 本地静态数据（wcVenues.ts）
 *  - 天气：wttr.in 开源天气 API（无需 API Key，30 分钟缓存）
 */

import { fetchCityWeather, type CurrentWeather } from "@/lib/weatherApi";
import { findVenue, type VenueInfo } from "@/data/wcVenues";

interface Props {
  /** 来自 API 的场馆名（可能为空） */
  venueName?: string;
  /** 比赛日期 "2026-06-28" */
  matchDate: string;
  /** 主队城市后备（若场馆未知时用于天气查询） */
  fallbackCity?: string;
}

// ─── 天气指标卡 ────────────────────────────────────────────────────────────

function WeatherStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[56px]">
      <span className="ft-label text-[10px]">{label}</span>
      <span className="font-mono text-[12px] font-bold" style={{ color: "var(--ft-navy)" }}>
        {value}
      </span>
    </div>
  );
}

// ─── UV 指数中文等级 ────────────────────────────────────────────────────────

function uvLabel(uv: number): string {
  if (uv <= 2) return "低";
  if (uv <= 5) return "中";
  if (uv <= 7) return "高";
  if (uv <= 10) return "很高";
  return "极高";
}

function uvColor(uv: number): string {
  if (uv <= 2) return "var(--ft-green)";
  if (uv <= 5) return "#f59e0b";
  if (uv <= 7) return "#f97316";
  return "#b01c1c";
}

// ─── 天气卡 ────────────────────────────────────────────────────────────────

function WeatherCard({ weather, city }: { weather: CurrentWeather; city: string }) {
  const uvText  = `${weather.uvIndex} (${uvLabel(weather.uvIndex)})`;
  const uvC     = uvColor(weather.uvIndex);

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-4"
      style={{ borderTop: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-panel)" }}
    >
      {/* 主温度 + 天气状态 */}
      <div className="flex items-center gap-3 sm:min-w-[160px]">
        <span className="text-4xl leading-none" role="img" aria-label={weather.conditionZh}>
          {weather.emoji}
        </span>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-3xl font-black" style={{ color: "var(--ft-navy)" }}>
              {weather.tempC}°
            </span>
            <span className="font-mono text-sm" style={{ color: "var(--ft-text-muted)" }}>C</span>
          </div>
          <p className="text-[13px] font-semibold" style={{ color: "var(--ft-navy)" }}>
            {weather.conditionZh}
          </p>
          <p className="ft-label text-[10px]">体感 {weather.feelsLikeC}°C · {city}</p>
        </div>
      </div>

      {/* 次要指标 */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 sm:ml-4">
        <WeatherStat label="最低" value={`${weather.minTempC}°C`} />
        <WeatherStat label="最高" value={`${weather.maxTempC}°C`} />
        <WeatherStat label="湿度" value={`${weather.humidity}%`} />
        <WeatherStat label="风速" value={`${weather.windKph} km/h`} />
        {weather.precipMM > 0 && (
          <WeatherStat label="降水" value={`${weather.precipMM} mm`} />
        )}
        <div className="flex flex-col items-center gap-0.5 min-w-[56px]">
          <span className="ft-label text-[10px]">UV</span>
          <span className="font-mono text-[12px] font-bold" style={{ color: uvC }}>
            {uvText}
          </span>
        </div>
      </div>

      <p className="ft-label text-[10px] sm:ml-auto text-right shrink-0" style={{ color: "var(--ft-text-dim)" }}>
        wttr.in · 30 min cache
      </p>
    </div>
  );
}

// ─── 场馆信息主体 ──────────────────────────────────────────────────────────

function VenueDetails({ venue, matchDate }: { venue: VenueInfo; matchDate: string }) {
  const flagMap: Record<string, string> = { USA: "🇺🇸", Canada: "🇨🇦", Mexico: "🇲🇽" };
  const flag = flagMap[venue.country] ?? "";

  return (
    <>
      {/* 场馆名 + 位置 */}
      <div className="px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-[16px] font-bold mb-1" style={{ color: "var(--ft-navy)" }}>
              {flag} {venue.nameZh}
            </h3>
            <p className="text-[12px] font-mono" style={{ color: "var(--ft-text-muted)" }}>
              {venue.name}
            </p>
            <p className="ft-label mt-1">
              {venue.cityZh} · {venue.state} · {venue.countryZh}
            </p>
          </div>

          {/* 容量 + 日期 */}
          <div className="flex gap-4 shrink-0">
            <div className="text-right">
              <p className="ft-label text-[10px] mb-0.5">座位容量</p>
              <p className="font-mono text-base font-bold" style={{ color: "var(--ft-navy)" }}>
                {venue.capacity.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="ft-label text-[10px] mb-0.5">比赛日期</p>
              <p className="font-mono text-base font-bold" style={{ color: "var(--ft-navy)" }}>
                {matchDate.slice(5).replace("-", "/")}
              </p>
            </div>
          </div>
        </div>

        {/* 简介 */}
        <p className="text-[12px] mt-3 leading-relaxed" style={{ color: "var(--ft-text-muted)", borderLeft: "2px solid var(--ft-border)", paddingLeft: "10px" }}>
          {venue.descriptionZh}
        </p>
      </div>
    </>
  );
}

// ─── 无场馆信息时的通用展示 ────────────────────────────────────────────────

function GenericVenueInfo({ matchDate }: { matchDate: string }) {
  return (
    <div className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-bold mb-1" style={{ color: "var(--ft-navy)" }}>
            🏟️ FIFA 世界杯 2026
          </h3>
          <p className="ft-label mt-1">
            主办国：美国 🇺🇸 · 加拿大 🇨🇦 · 墨西哥 🇲🇽
          </p>
          <p className="ft-label text-[11px] mt-1" style={{ color: "var(--ft-text-dim)" }}>
            共 16 个场馆 · 比赛地点将在赛程确认后更新
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="ft-label text-[10px] mb-0.5">比赛日期</p>
          <p className="font-mono text-base font-bold" style={{ color: "var(--ft-navy)" }}>
            {matchDate.slice(5).replace("-", "/")}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── 主组件（async Server Component）──────────────────────────────────────

export default async function VenueWeatherPanel({
  venueName,
  matchDate,
  fallbackCity,
}: Props) {
  const CARD   = { border: "1px solid var(--ft-border)" } as const;
  const HEADER = { borderBottom: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-section)" } as const;

  // 查找场馆静态信息
  const venue = findVenue(venueName);

  // 决定天气查询城市：优先场馆城市，其次后备城市
  const weatherCity = venue?.weatherCity ?? fallbackCity ?? null;

  // 并行获取天气
  const weather = weatherCity ? await fetchCityWeather(weatherCity) : null;

  return (
    <div style={CARD}>
      {/* 标题 */}
      <div className="flex items-center justify-between gap-2 px-5 py-2.5" style={HEADER}>
        <p className="ft-label">Venue & Weather · 场馆与天气</p>
        {venue && (
          <span className="ft-label text-[11px]" style={{ color: "var(--ft-text-dim)" }}>
            {venue.city} · {venue.country}
          </span>
        )}
      </div>

      {/* 场馆详情 */}
      {venue ? (
        <VenueDetails venue={venue} matchDate={matchDate} />
      ) : (
        <GenericVenueInfo matchDate={matchDate} />
      )}

      {/* 实时天气 */}
      {weather ? (
        <WeatherCard
          weather={weather}
          city={venue?.cityZh ?? weatherCity ?? ""}
        />
      ) : (
        <div
          className="px-5 py-3 text-center"
          style={{ borderTop: "1px solid var(--ft-border)", backgroundColor: "var(--ft-bg-panel)" }}
        >
          <p className="ft-label text-[11px]" style={{ color: "var(--ft-text-dim)" }}>
            天气数据暂时无法加载 · 由 wttr.in 提供
          </p>
        </div>
      )}
    </div>
  );
}
