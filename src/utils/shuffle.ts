import type { TarotCard } from '@/types';

/**
 * Fisher-Yates 洗牌算法
 */
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 从牌组中随机抽取指定数量的牌
 */
export function drawCards(deck: TarotCard[], count: number): TarotCard[] {
  return shuffle(deck).slice(0, count);
}

/**
 * 决定是否逆位（30% 概率）
 */
export function shouldReverse(): boolean {
  return Math.random() < 0.3;
}
