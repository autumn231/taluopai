import type { TarotCard } from '@/types';

/**
 * 字符串 hash - 将任意字符串转为 32 位整数种子
 */
function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0; // 转为 32 位整数
  }
  return Math.abs(hash);
}

/**
 * 基于种子的伪随机数生成器（mulberry32）
 */
function seededRandom(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 基于种子的洗牌 - 相同输入产生相同输出
 */
export function seededShuffle<T>(array: T[], seed: string): T[] {
  const arr = [...array];
  const rng = seededRandom(hashString(seed));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Fisher-Yates 洗牌算法（真随机）
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
 * 从牌组中随机抽取指定数量的牌（真随机）
 */
export function drawCards(deck: TarotCard[], count: number): TarotCard[] {
  return shuffle(deck).slice(0, count);
}

/**
 * 基于问题的种子抽取（相同问题+牌阵 = 相同牌）
 */
export function drawCardsByQuestion(
  deck: TarotCard[],
  count: number,
  question: string,
  spreadType: string,
): TarotCard[] {
  // 没有问题则用真随机
  if (!question.trim()) {
    return drawCards(deck, count);
  }
  const seed = `${spreadType}::${question.trim()}`;
  return seededShuffle(deck, seed).slice(0, count);
}

/**
 * 决定是否逆位（30% 概率）
 */
export function shouldReverse(): boolean {
  return Math.random() < 0.3;
}

/**
 * 基于种子的逆位决定（同一张牌在相同种子下正逆位稳定）
 */
export function shouldReversedSeeded(seed: string): boolean {
  return seededRandom(hashString(seed + ':rev'))() < 0.3;
}
