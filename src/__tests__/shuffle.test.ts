import { describe, it, expect } from 'vitest';
import { seededShuffle, drawCards, shouldReversedSeeded } from '@/utils/shuffle';
import { TAROT_CARDS } from '@/data/tarotCards';

describe('洗牌与抽牌', () => {
  it('种子洗牌同种子同结果', () => {
    const a = seededShuffle(TAROT_CARDS, '2026-11-21').map((c) => c.id);
    const b = seededShuffle(TAROT_CARDS, '2026-11-21').map((c) => c.id);
    expect(a).toEqual(b);
    expect(new Set(a).size).toBe(78);
  });

  it('真随机抽牌数量正确且不重复', () => {
    const drawn = drawCards(TAROT_CARDS, 10);
    expect(drawn).toHaveLength(10);
    expect(new Set(drawn.map((c) => c.id)).size).toBe(10);
  });

  it('种子逆位判定稳定', () => {
    expect(shouldReversedSeeded('seed-a')).toBe(shouldReversedSeeded('seed-a'));
  });
});
