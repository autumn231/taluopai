import { describe, it, expect } from 'vitest';
import { TAROT_CARDS, getMajorArcana, getMinorArcana } from '@/data/tarotCards';
import type { Suit } from '@/types';

const BASE_FIELDS = ['general', 'love', 'career', 'wealth'] as const;
const EXT_FIELDS = ['health', 'relationship', 'spiritual', 'advice', 'warning', 'timing'] as const;

describe('牌组完整性', () => {
  it('共 78 张，id 为 0-77 且唯一', () => {
    expect(TAROT_CARDS).toHaveLength(78);
    const ids = TAROT_CARDS.map((c) => c.id).sort((a, b) => a - b);
    expect(ids).toEqual(Array.from({ length: 78 }, (_, i) => i));
  });

  it('大牌 22 张、小牌 56 张', () => {
    expect(getMajorArcana()).toHaveLength(22);
    expect(getMinorArcana()).toHaveLength(56);
  });

  it('每张牌都有中英文名与基础四维解读（正逆位）', () => {
    for (const card of TAROT_CARDS) {
      expect(card.name.cn.length, card.name.en).toBeGreaterThan(0);
      expect(card.name.en.length).toBeGreaterThan(0);
      for (const dir of ['upright', 'reversed'] as const) {
        for (const f of BASE_FIELDS) {
          expect(card[dir][f]?.length ?? 0, `${card.name.cn}/${dir}/${f}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('小牌十维解读齐全（正逆位）', () => {
    for (const card of getMinorArcana()) {
      for (const dir of ['upright', 'reversed'] as const) {
        for (const f of EXT_FIELDS) {
          expect(card[dir][f]?.length ?? 0, `${card.name.cn}/${dir}/${f}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('同一花色内小牌的爱情/事业/财运解读不再千篇一律', () => {
    const suits: Suit[] = ['wands', 'cups', 'swords', 'pentacles'];
    for (const suit of suits) {
      const cards = getMinorArcana(suit);
      expect(cards).toHaveLength(14);
      for (const f of ['love', 'career', 'wealth'] as const) {
        const texts = new Set(cards.map((c) => c.upright[f]));
        expect(texts.size, `${suit}/${f}`).toBeGreaterThanOrEqual(10);
      }
    }
  });
});
