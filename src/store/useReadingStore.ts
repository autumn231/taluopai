import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DrawnCard, SpreadType, TarotCard } from '@/types';
import { drawCards, shouldReverse } from '@/utils/shuffle';
import { TAROT_CARDS } from '@/data/tarotCards';
import { getSpread } from '@/data/spreads';
import { generateId } from '@/lib/utils';

export type Stage = 'idle' | 'meditation' | 'shuffle' | 'select' | 'reveal' | 'done';

interface ReadingState {
  spreadType: SpreadType | null;
  stage: Stage;
  drawnCards: DrawnCard[];
  question: string;
  deck: TarotCard[]; // 当前已抽完的牌组，供洗牌动画使用

  // Actions
  setSpread: (type: SpreadType) => void;
  setQuestion: (q: string) => void;
  startMeditation: () => void;
  startShuffle: () => void;
  startSelect: () => void;
  selectCards: (positions: number[]) => void; // positions 数组的长度应为 spreadType 对应数量
  revealCard: (index: number) => void;
  revealAll: () => void;
  reset: () => void;
}

export const useReadingStore = create<ReadingState>()(
  persist(
    (set, get) => ({
      spreadType: null,
      stage: 'idle',
      drawnCards: [],
      question: '',
      deck: [],

      setSpread: (type) => {
        const spread = getSpread(type);
        // 预生成一份洗好的牌组
        const shuffledDeck = drawCards(TAROT_CARDS, spread.cardCount);
        set({
          spreadType: type,
          stage: 'idle',
          drawnCards: [],
          deck: shuffledDeck,
          question: '',
        });
      },

      setQuestion: (q) => set({ question: q }),

      startMeditation: () => set({ stage: 'meditation' }),

      startShuffle: () => {
        const spread = getSpread(get().spreadType!);
        const shuffledDeck = drawCards(TAROT_CARDS, spread.cardCount);
        set({ stage: 'shuffle', deck: shuffledDeck });
      },

      startSelect: () => set({ stage: 'select' }),

      selectCards: (positions) => {
        const { spreadType, deck } = get();
        if (!spreadType) return;
        const spread = getSpread(spreadType);
        // 重新洗牌并抽取对应数量的牌
        const newDeck = drawCards(TAROT_CARDS, spread.cardCount);
        const drawn: DrawnCard[] = newDeck.map((card, idx) => ({
          card,
          reversed: shouldReverse(),
          position: positions[idx] ?? idx,
        }));
        set({ stage: 'reveal', drawnCards: drawn, deck: newDeck });
      },

      revealCard: (index) => {
        // 单张翻牌（顺序揭晓由 UI 控制）
      },

      revealAll: () => set({ stage: 'done' }),

      reset: () =>
        set({
          spreadType: null,
          stage: 'idle',
          drawnCards: [],
          question: '',
          deck: [],
        }),
    }),
    {
      name: 'mystic-tarot-reading',
      partialize: (state) => ({
        spreadType: state.spreadType,
        drawnCards: state.drawnCards,
        question: state.question,
      }),
    },
  ),
);
