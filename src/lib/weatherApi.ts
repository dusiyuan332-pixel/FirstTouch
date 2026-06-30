/**
 * weatherApi.ts — 免费天气数据（wttr.in）
 * ─────────────────────────────────────────────────────────────────────────────
 * 使用 wttr.in 开源天气服务，无需 API Key，完全免费
 * 文档：https://wttr.in/:help
 * JSON 格式：https://wttr.in/{city}?format=j1
 *
 * 缓存策略：30 分钟（天气变化不快，节省带宽）
 */

// ─── API 原始类型 ─────────────────────────────────────────────────────────────

interface WttrCondition {
  temp_C: string;
  FeelsLikeC: string;
  humidity: string;
  windspeedKmph: string;
  weatherCode: string;
  weatherDesc: [{ value: string }];
  cloudcover: string;
  precipMM: string;
  uvIndex: string;
}

interface WttrResponse {
  current_condition: WttrCondition[];
  nearest_area: Array<{
    areaName: [{ value: string }];
    country: [{ value: string }];
    latitude: string;
    longitude: string;
  }>;
  weather: Array<{
    date: string;         // "2026-06-28"
    mintempC: string;
    maxtempC: string;
    hourly: Array<{
      time: string;       // "0" | "300" | ... | "2100" (分钟 * 100)
      tempC: string;
      weatherCode: string;
      weatherDesc: [{ value: string }];
      precipMM: string;
    }>;
  }>;
}

// ─── 对外类型 ──────────────────────────────────────────────────────────────

export interface CurrentWeather {
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  windKph: number;
  /** wttr.in weatherCode，用于映射 emoji */
  conditionCode: number;
  /** 英文描述，如 "Partly cloudy" */
  condition: string;
  /** 对应 emoji */
  emoji: string;
  /** 中文描述 */
  conditionZh: string;
  /** 近2天最低气温 */
  minTempC: number;
  /** 近2天最高气温 */
  maxTempC: number;
  /** UV 指数 */
  uvIndex: number;
  /** 降水量 mm */
  precipMM: number;
}

// ─── 天气码 → emoji + 中文 ─────────────────────────────────────────────────

interface WeatherDisplay { emoji: string; zh: string }

function weatherDisplay(code: number): WeatherDisplay {
  if (code === 113) return { emoji: "☀️",  zh: "晴" };
  if (code === 116) return { emoji: "⛅",  zh: "局部多云" };
  if (code === 119) return { emoji: "☁️",  zh: "多云" };
  if (code === 122) return { emoji: "☁️",  zh: "阴" };
  if (code === 143) return { emoji: "🌫️",  zh: "薄雾" };
  if (code === 176) return { emoji: "🌦️",  zh: "小阵雨" };
  if (code === 179) return { emoji: "🌨️",  zh: "小阵雪" };
  if ([182, 185].includes(code)) return { emoji: "🌨️", zh: "雨夹雪" };
  if (code === 200) return { emoji: "⛈️",  zh: "雷阵雨" };
  if ([227, 230].includes(code)) return { emoji: "❄️",  zh: "暴风雪" };
  if (code === 248) return { emoji: "🌫️",  zh: "冻雾" };
  if (code === 260) return { emoji: "🌫️",  zh: "冻雾" };
  if ([263, 266].includes(code)) return { emoji: "🌦️", zh: "毛毛雨" };
  if ([281, 284].includes(code)) return { emoji: "🌧️", zh: "冻雨" };
  if ([293, 296].includes(code)) return { emoji: "🌦️", zh: "小雨" };
  if ([299, 302].includes(code)) return { emoji: "🌧️", zh: "中雨" };
  if ([305, 308].includes(code)) return { emoji: "🌧️", zh: "大雨" };
  if ([311, 314].includes(code)) return { emoji: "🌦️", zh: "小阵雨" };
  if ([317, 320].includes(code)) return { emoji: "🌨️", zh: "雨夹雪" };
  if ([323, 326].includes(code)) return { emoji: "🌨️", zh: "小雪" };
  if ([329, 332, 335].includes(code)) return { emoji: "❄️", zh: "中雪" };
  if (code === 338) return { emoji: "❄️",  zh: "大雪" };
  if ([353, 356].includes(code)) return { emoji: "🌦️", zh: "小阵雨" };
  if (code === 359) return { emoji: "🌧️",  zh: "大阵雨" };
  if ([362, 365].includes(code)) return { emoji: "🌨️", zh: "雨夹雪" };
  if ([368, 371].includes(code)) return { emoji: "🌨️", zh: "阵雪" };
  if ([386, 389].includes(code)) return { emoji: "⛈️", zh: "雷暴" };
  if ([392, 395].includes(code)) return { emoji: "⛈️", zh: "雷雪" };
  return { emoji: "🌤️", zh: "多云间晴" };
}

// ─── 核心函数 ─────────────────────────────────────────────────────────────

/**
 * 根据城市名获取当前天气
 * - 无需 API Key
 * - 缓存 30 分钟（Next.js revalidate）
 */
export async function fetchCityWeather(city: string): Promise<CurrentWeather | null> {
  try {
    const encoded = encodeURIComponent(city);
    const res = await fetch(
      `https://wttr.in/${encoded}?format=j1&lang=zh`,
      {
        next: { revalidate: 1800 },  // 30 分钟缓存
        headers: { "User-Agent": "FirstTouch-Football-App/1.0" },
      }
    );
    if (!res.ok) return null;

    const data = await res.json() as WttrResponse;
    const cc   = data.current_condition?.[0];
    const day0 = data.weather?.[0];
    if (!cc) return null;

    const code    = parseInt(cc.weatherCode, 10);
    const display = weatherDisplay(code);

    return {
      tempC:        parseInt(cc.temp_C, 10),
      feelsLikeC:   parseInt(cc.FeelsLikeC, 10),
      humidity:     parseInt(cc.humidity, 10),
      windKph:      parseInt(cc.windspeedKmph, 10),
      conditionCode: code,
      condition:    cc.weatherDesc?.[0]?.value ?? "",
      emoji:        display.emoji,
      conditionZh:  display.zh,
      minTempC:     day0 ? parseInt(day0.mintempC, 10) : parseInt(cc.temp_C, 10),
      maxTempC:     day0 ? parseInt(day0.maxtempC, 10) : parseInt(cc.temp_C, 10),
      uvIndex:      parseInt(cc.uvIndex, 10),
      precipMM:     parseFloat(cc.precipMM),
    };
  } catch {
    return null;
  }
}
