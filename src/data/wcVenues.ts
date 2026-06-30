/**
 * WC2026 比赛场馆静态数据
 * 16 个主办场馆：美国 11 + 加拿大 2 + 墨西哥 3
 *
 * 用途：
 *  1. 通过 football-data.org 返回的 venue 名称模糊匹配场馆详情
 *  2. 提供天气查询城市（weatherCity）供 wttr.in 使用
 */

export interface VenueInfo {
  /** API 中出现的标准英文名 */
  name: string;
  nameZh: string;
  city: string;
  cityZh: string;
  /** 州 / 省 / 联邦实体 */
  state: string;
  country: "USA" | "Canada" | "Mexico";
  countryZh: string;
  /** FIFA 官方容量（部分为扩容后数字） */
  capacity: number;
  /** wttr.in 查询城市名（URL 编码前） */
  weatherCity: string;
  /** 简介（中文，1-2 句话） */
  descriptionZh: string;
  /** 其他可能出现的别名，用于模糊匹配 */
  aliases: string[];
}

const VENUES: VenueInfo[] = [
  // ── 美国 ──────────────────────────────────────────────────────────────────
  {
    name: "SoFi Stadium",
    nameZh: "SoFi 球场",
    city: "Inglewood",
    cityZh: "英格尔伍德（洛杉矶）",
    state: "CA",
    country: "USA",
    countryZh: "美国",
    capacity: 70240,
    weatherCity: "Los Angeles",
    descriptionZh: "2020 年落成，NFL 公羊队主场，全透明屋顶设计，是本届世界杯决赛场地。",
    aliases: ["sofi", "los angeles", "inglewood", "la stadium"],
  },
  {
    name: "Levi's Stadium",
    nameZh: "李维斯球场",
    city: "Santa Clara",
    cityZh: "圣克拉拉（旧金山湾区）",
    state: "CA",
    country: "USA",
    countryZh: "美国",
    capacity: 68500,
    weatherCity: "San Jose",
    descriptionZh: "NFL 旧金山 49 人主场，硅谷核心地带，设施先进，配备超大屏幕。",
    aliases: ["levis", "levi's", "santa clara", "san francisco", "49ers"],
  },
  {
    name: "Lumen Field",
    nameZh: "流明球场",
    city: "Seattle",
    cityZh: "西雅图",
    state: "WA",
    country: "USA",
    countryZh: "美国",
    capacity: 69000,
    weatherCity: "Seattle",
    descriptionZh: "NFL 西雅图海鹰主场，以噪音响度著称，2026 年世界杯北美最北部美国赛场。",
    aliases: ["lumen", "seattle", "seahawks", "centurylink"],
  },
  {
    name: "AT&T Stadium",
    nameZh: "AT&T 球场",
    city: "Arlington",
    cityZh: "阿灵顿（达拉斯都市区）",
    state: "TX",
    country: "USA",
    countryZh: "美国",
    capacity: 80000,
    weatherCity: "Dallas",
    descriptionZh: "NFL 达拉斯牛仔队主场，可开合屋顶，容量 8 万人，是全球最大室内体育场之一。",
    aliases: ["att", "at&t", "arlington", "dallas", "cowboys", "jerry's world"],
  },
  {
    name: "NRG Stadium",
    nameZh: "NRG 球场",
    city: "Houston",
    cityZh: "休斯顿",
    state: "TX",
    country: "USA",
    countryZh: "美国",
    capacity: 72220,
    weatherCity: "Houston",
    descriptionZh: "NFL 休斯顿德克萨斯人主场，可开合穹顶，曾多次承办超级碗和足球大赛。",
    aliases: ["nrg", "houston", "texans", "reliant"],
  },
  {
    name: "Arrowhead Stadium",
    nameZh: "箭头球场",
    city: "Kansas City",
    cityZh: "堪萨斯城",
    state: "MO",
    country: "USA",
    countryZh: "美国",
    capacity: 76416,
    weatherCity: "Kansas City",
    descriptionZh: "NFL 堪萨斯城酋长队主场，球迷氛围极佳，是世界上噪音最响的开放式球场之一。",
    aliases: ["arrowhead", "kansas city", "chiefs", "kc"],
  },
  {
    name: "MetLife Stadium",
    nameZh: "大都会人寿球场",
    city: "East Rutherford",
    cityZh: "东卢瑟福（纽约都市区）",
    state: "NJ",
    country: "USA",
    countryZh: "美国",
    capacity: 82500,
    weatherCity: "New York",
    descriptionZh: "容量 82,500 人，是本届世界杯最大场馆，决赛候选地，毗邻纽约市中心。",
    aliases: ["metlife", "east rutherford", "new york", "new jersey", "giants stadium", "giants", "jets"],
  },
  {
    name: "Lincoln Financial Field",
    nameZh: "林肯金融球场",
    city: "Philadelphia",
    cityZh: "费城",
    state: "PA",
    country: "USA",
    countryZh: "美国",
    capacity: 69176,
    weatherCity: "Philadelphia",
    descriptionZh: "NFL 费城雄鹰主场，球迷热情高涨，费城是美国历史最悠久的城市之一。",
    aliases: ["lincoln financial", "lincoln", "philadelphia", "philly", "eagles"],
  },
  {
    name: "Gillette Stadium",
    nameZh: "吉列球场",
    city: "Foxborough",
    cityZh: "福克斯伯勒（波士顿都市区）",
    state: "MA",
    country: "USA",
    countryZh: "美国",
    capacity: 65878,
    weatherCity: "Boston",
    descriptionZh: "NFL 新英格兰爱国者主场，毗邻波士顿，也是 MLS 新英格兰革命队主场。",
    aliases: ["gillette", "foxborough", "foxboro", "boston", "patriots", "new england"],
  },
  {
    name: "Hard Rock Stadium",
    nameZh: "硬石球场",
    city: "Miami Gardens",
    cityZh: "迈阿密花园（迈阿密都市区）",
    state: "FL",
    country: "USA",
    countryZh: "美国",
    capacity: 64767,
    weatherCity: "Miami",
    descriptionZh: "NFL 迈阿密海豚主场，热带气候，也曾多次举办超级碗和 MLS 国际锦标赛。",
    aliases: ["hard rock", "miami gardens", "miami", "dolphins", "sun life"],
  },
  {
    name: "Mercedes-Benz Stadium",
    nameZh: "梅赛德斯-奔驰球场",
    city: "Atlanta",
    cityZh: "亚特兰大",
    state: "GA",
    country: "USA",
    countryZh: "美国",
    capacity: 71000,
    weatherCity: "Atlanta",
    descriptionZh: "MLS 亚特兰大联主场，八角形可开合穹顶，2019 年超级碗举办地，全球最先进场馆之一。",
    aliases: ["mercedes-benz", "mercedes benz", "mb stadium", "atlanta", "falcons", "atlanta united"],
  },
  // ── 加拿大 ────────────────────────────────────────────────────────────────
  {
    name: "BC Place",
    nameZh: "不列颠哥伦比亚省体育场",
    city: "Vancouver",
    cityZh: "温哥华",
    state: "BC",
    country: "Canada",
    countryZh: "加拿大",
    capacity: 54500,
    weatherCity: "Vancouver",
    descriptionZh: "加拿大西岸最大室内多功能球场，可充气穹顶，俯瞰美丽的温哥华市区。",
    aliases: ["bc place", "vancouver", "whitecaps", "british columbia"],
  },
  {
    name: "BMO Field",
    nameZh: "BMO 球场",
    city: "Toronto",
    cityZh: "多伦多",
    state: "ON",
    country: "Canada",
    countryZh: "加拿大",
    capacity: 45736,
    weatherCity: "Toronto",
    descriptionZh: "MLS 多伦多 FC 主场，为世界杯临时扩容至约 45,000 座，加拿大最大城市主场。",
    aliases: ["bmo field", "toronto", "toronto fc", "tfc", "ontario"],
  },
  // ── 墨西哥 ────────────────────────────────────────────────────────────────
  {
    name: "Estadio Azteca",
    nameZh: "阿兹台克体育场",
    city: "Mexico City",
    cityZh: "墨西哥城",
    state: "CDMX",
    country: "Mexico",
    countryZh: "墨西哥",
    capacity: 87523,
    weatherCity: "Mexico City",
    descriptionZh: "世界最著名足球圣地之一，曾举办 1970 和 1986 年世界杯决赛，马拉多纳「上帝之手」发生地。",
    aliases: ["azteca", "estadio azteca", "mexico city", "cdmx", "df"],
  },
  {
    name: "Estadio Akron",
    nameZh: "阿克隆体育场",
    city: "Guadalajara",
    cityZh: "瓜达拉哈拉",
    state: "JAL",
    country: "Mexico",
    countryZh: "墨西哥",
    capacity: 49850,
    weatherCity: "Guadalajara",
    descriptionZh: "Liga MX 瓜达拉哈拉竞技主场，现代化设施，墨西哥第二大城市的旗舰球场。",
    aliases: ["akron", "estadio akron", "guadalajara", "chivas", "jalisco"],
  },
  {
    name: "Estadio BBVA",
    nameZh: "BBVA 体育场",
    city: "Monterrey",
    cityZh: "蒙特雷",
    state: "NLE",
    country: "Mexico",
    countryZh: "墨西哥",
    capacity: 53460,
    weatherCity: "Monterrey",
    descriptionZh: "Liga MX 蒙特雷俱乐部主场，以壮观的山脉背景著称，是墨西哥最美的现代球场之一。",
    aliases: ["bbva", "estadio bbva", "monterrey", "rayados", "nuevo leon", "nueveo leon"],
  },
];

// ─── 查找函数（模糊匹配）─────────────────────────────────────────────────────

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * 根据场馆名称（来自 football-data.org API）查找场馆详情
 * 支持模糊匹配：如 "SoFi Stadium" → VenueInfo
 */
export function findVenue(venueName: string | null | undefined): VenueInfo | null {
  if (!venueName || venueName.trim() === "") return null;
  const norm = normalize(venueName);

  // 精确匹配优先
  const exact = VENUES.find((v) => normalize(v.name) === norm);
  if (exact) return exact;

  // 别名匹配
  const alias = VENUES.find((v) =>
    v.aliases.some((a) => normalize(a) === norm || norm.includes(normalize(a)) || normalize(a).includes(norm))
  );
  if (alias) return alias;

  // 包含匹配
  return VENUES.find((v) =>
    normalize(v.name).includes(norm) || norm.includes(normalize(v.name))
  ) ?? null;
}

export default VENUES;
