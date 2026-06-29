/**
 * 世界杯球队攻防指数
 * ────────────────────────────────────────────────────────────────────────────
 * attack_rating  : 进攻指数（联赛/赛事均值 = 1.0，越高越强）
 * defense_rating : 防守指数（越高 → 防守越好 → 对方 λ 越低）
 *
 * 基准：国际赛平均每队每场进球 ≈ 1.10
 * 数据依据：FIFA 世界排名、2022 世界杯及资格赛历史 xG 表现
 * 使用 football-data.org 的 TLA（三字母代码）作为键
 */

export interface TeamRating {
  attack: number;
  defense: number;
}

export const TEAM_RATINGS: Record<string, TeamRating> = {
  // ── 顶级强队 ─────────────────────────────────────────────────────────────
  FRA: { attack: 1.45, defense: 1.30 },   // 法国
  ENG: { attack: 1.30, defense: 1.20 },   // 英格兰
  BRA: { attack: 1.40, defense: 1.25 },   // 巴西
  ARG: { attack: 1.45, defense: 1.20 },   // 阿根廷（卫冕冠军）
  ESP: { attack: 1.35, defense: 1.25 },   // 西班牙
  GER: { attack: 1.30, defense: 1.15 },   // 德国
  POR: { attack: 1.35, defense: 1.10 },   // 葡萄牙
  NED: { attack: 1.25, defense: 1.15 },   // 荷兰
  BEL: { attack: 1.20, defense: 1.05 },   // 比利时
  CRO: { attack: 1.15, defense: 1.15 },   // 克罗地亚
  URU: { attack: 1.20, defense: 1.10 },   // 乌拉圭
  DEN: { attack: 1.15, defense: 1.20 },   // 丹麦
  SUI: { attack: 1.10, defense: 1.15 },   // 瑞士
  USA: { attack: 1.10, defense: 1.05 },   // 美国（主办国）

  // ── 中上游 ───────────────────────────────────────────────────────────────
  MEX: { attack: 1.10, defense: 1.00 },   // 墨西哥（主办国）
  CAN: { attack: 1.05, defense: 1.00 },   // 加拿大（主办国）
  SEN: { attack: 1.10, defense: 1.05 },   // 塞内加尔
  MAR: { attack: 1.10, defense: 1.15 },   // 摩洛哥
  COL: { attack: 1.15, defense: 1.00 },   // 哥伦比亚
  ECU: { attack: 1.05, defense: 1.00 },   // 厄瓜多尔
  SRB: { attack: 1.10, defense: 0.95 },   // 塞尔维亚
  POL: { attack: 1.10, defense: 0.95 },   // 波兰
  AUS: { attack: 0.95, defense: 1.00 },   // 澳大利亚
  JPN: { attack: 1.05, defense: 1.05 },   // 日本
  KOR: { attack: 1.00, defense: 1.00 },   // 韩国
  WAL: { attack: 1.00, defense: 1.00 },   // 威尔士

  // ── 其他参赛队 ───────────────────────────────────────────────────────────
  TUN: { attack: 0.90, defense: 1.00 },   // 突尼斯
  GHA: { attack: 0.95, defense: 0.90 },   // 加纳
  CMR: { attack: 0.90, defense: 0.90 },   // 喀麦隆
  CIV: { attack: 0.95, defense: 0.90 },   // 科特迪瓦
  NGA: { attack: 1.00, defense: 0.90 },   // 尼日利亚
  IRN: { attack: 0.90, defense: 1.00 },   // 伊朗
  KSA: { attack: 0.90, defense: 0.85 },   // 沙特阿拉伯
  QAT: { attack: 0.80, defense: 0.85 },   // 卡塔尔
  PAN: { attack: 0.85, defense: 0.90 },   // 巴拿马
  BOL: { attack: 0.80, defense: 0.80 },   // 玻利维亚
  PAR: { attack: 0.90, defense: 0.90 },   // 巴拉圭
  PER: { attack: 0.95, defense: 0.95 },   // 秘鲁
  CHL: { attack: 1.00, defense: 0.95 },   // 智利

  // ── 东欧 ─────────────────────────────────────────────────────────────────
  UKR: { attack: 1.10, defense: 1.05 },   // 乌克兰
  TUR: { attack: 1.10, defense: 1.00 },   // 土耳其
  ROU: { attack: 1.00, defense: 0.95 },   // 罗马尼亚
  SVK: { attack: 0.95, defense: 1.00 },   // 斯洛伐克
  SVN: { attack: 0.95, defense: 1.00 },   // 斯洛文尼亚
  CZE: { attack: 1.00, defense: 1.00 },   // 捷克

  // ── 北欧 ─────────────────────────────────────────────────────────────────
  NOR: { attack: 1.20, defense: 1.05 },   // 挪威
  SWE: { attack: 1.05, defense: 1.05 },   // 瑞典
  FIN: { attack: 0.90, defense: 1.00 },   // 芬兰
  SCO: { attack: 1.00, defense: 1.00 },   // 苏格兰
  AUT: { attack: 1.05, defense: 1.00 },   // 奥地利

  // ── 亚非 ─────────────────────────────────────────────────────────────────
  IND: { attack: 0.75, defense: 0.80 },
  CHN: { attack: 0.80, defense: 0.85 },
  MLI: { attack: 0.90, defense: 0.90 },
  COD: { attack: 0.85, defense: 0.85 },
  ALG: { attack: 0.90, defense: 0.90 },
};

/** 若球队代码未找到，使用此默认值（略高于联赛均值，反映世界杯参赛队整体水平） */
export const DEFAULT_RATING: TeamRating = { attack: 1.2, defense: 1.2 };

/** 返回评分，同时告知是否命中预置库 */
export function getRating(tla: string): { rating: TeamRating; found: boolean } {
  const upper = tla?.toUpperCase();
  const found = upper in TEAM_RATINGS;
  return { rating: TEAM_RATINGS[upper] ?? DEFAULT_RATING, found };
}
