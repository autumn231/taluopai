// 塔罗牌核心类型定义

export type Arcana = 'major' | 'minor';
export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles';

export interface TarotCard {
  id: number; // 0-77
  name: {
    en: string;
    cn: string;
  };
  arcana: Arcana;
  suit?: Suit;
  number?: number; // 1-14 for minor arcana, undefined for major
  keywords: string[];
  upright: BaseReading & Partial<Omit<Reading, keyof BaseReading>>;
  reversed: BaseReading & Partial<Omit<Reading, keyof BaseReading>>;
  symbol: string; // 牌面象征元素描述
  element: Element;
}

/** 牌面解读 - 基础 4 维（爱/事业/财富/总览） */
export interface BaseReading {
  general: string;
  love: string;
  career: string;
  wealth: string;
}

/** 完整解读 - 基础 4 维 + 扩展 6 维（健康/人际/灵性/建议/警示/时间） */
export interface Reading extends BaseReading {
  /** 健康 / 身心状态 */
  health: string;
  /** 人际 / 朋友 / 家庭 */
  relationship: string;
  /** 灵性 / 内在成长 */
  spiritual: string;
  /** 行动建议 - 一句话指引 */
  advice: string;
  /** 需要留意 - 警示 / 陷阱 */
  warning: string;
  /** 时间提示 - 短期 / 中期 / 长期 */
  timing: string;
}

export type Element = 'spirit' | 'fire' | 'water' | 'air' | 'earth';

export type SpreadType = 'single' | 'three' | 'celtic';

export interface SpreadPosition {
  index: number;
  name: string;
  meaning: string;
  description: string;
  gridArea?: string; // CSS grid area
}

export interface SpreadDefinition {
  type: SpreadType;
  name: string;
  description: string;
  longDescription: string;
  cardCount: number;
  positions: SpreadPosition[];
}

export interface DrawnCard {
  card: TarotCard;
  reversed: boolean;
  position: number;
}

export interface ReadingRecord {
  id: string;
  timestamp: number;
  spreadType: SpreadType;
  /** 三张牌阵的子模式（仅 three 牌阵有意义） */
  threeMode?: 'time' | 'mind' | 'free';
  question: string;
  cards: DrawnCard[];
}
