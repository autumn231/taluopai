import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DrawnCard, SpreadType } from '@/types';
import { shouldReverse, shouldReversedSeeded, drawCardsByQuestion } from '@/utils/shuffle';
import { TAROT_CARDS } from '@/data/tarotCards';
import { getSpread } from '@/data/spreads';
import type { ThreeMode } from '@/data/questionThemes';

export type Stage = 'idle' | 'shuffle' | 'select' | 'done';

interface ReadingState {
  spreadType: SpreadType;
  /** 三张牌阵的子模式 */
  threeMode: ThreeMode;
  stage: Stage;
  drawnCards: DrawnCard[];
  question: string;

  // Actions
  setSpread: (type: SpreadType) => void;
  setThreeMode: (mode: ThreeMode) => void;
  setQuestion: (q: string) => void;
  startShuffle: () => void;
  startSelect: () => void;
  selectCards: (positions: number[]) => void; // positions 数组的长度应为 spreadType 对应数量
  revealAll: () => void;
  reset: () => void;
}

export const useReadingStore = create<ReadingState>()(
  persist(
    (set, get) => ({
      spreadType: 'single',
      threeMode: 'time',
      stage: 'idle',
      drawnCards: [],
      question: '',

      setSpread: (type) => {
        set({
          spreadType: type,
          stage: 'idle',
          drawnCards: [],
          question: '',
        });
      },

      setThreeMode: (mode) => set({ threeMode: mode }),

      setQuestion: (q) => set({ question: q }),

      startShuffle: () => {
        set({ stage: 'shuffle' });
      },

      startSelect: () => set({ stage: 'select' }),

      selectCards: (positions) => {
        const { spreadType, question, threeMode } = get();
        const spread = getSpread(spreadType);

        // 用问题作为种子抽牌 - 同样的问题会得到同样的牌
        const newDeck = drawCardsByQuestion(
          TAROT_CARDS,
          spread.cardCount,
          question,
          spreadType,
          threeMode,
        );

        const seedBase = `${spreadType}::${threeMode}::${question.trim()}::${positions.join(',')}`;
        const drawn: DrawnCard[] = newDeck.map((card, idx) => ({
          card,
          reversed: question.trim()
            ? shouldReversedSeeded(`${seedBase}::${card.id}`)
            : shouldReverse(),
          position: positions[idx] ?? idx,
        }));
        set({ stage: 'done', drawnCards: drawn });
      },

      revealAll: () => {},

      reset: () =>
        set({
          spreadType: 'single',
          threeMode: 'time',
          stage: 'idle',
          drawnCards: [],
          question: '',
        }),
    }),
    {
      name: 'mystic-tarot-reading',
      partialize: (state) => ({
        spreadType: state.spreadType,
        threeMode: state.threeMode,
        drawnCards: state.drawnCards,
        question: state.question,
      }),
    },
  ),
);
