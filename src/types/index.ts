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
  upright: Reading;
  reversed: Reading;
  symbol: string; // 牌面象征元素描述
  element: Element;
}

export interface Reading {
  general: string;
  love: string;
  career: string;
  wealth: string;
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
  question: string;
  cards: DrawnCard[];
}
