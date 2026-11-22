import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DrawnCard, SpreadType } from '@/types';
import { shouldReverse, drawCards } from '@/utils/shuffle';
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

      selectCards: (_positions) => {
        const { spreadType } = get();
        const spread = getSpread(spreadType);

        // 真随机抽牌 —— 每次抽卡结果都不同
        const newDeck = drawCards(TAROT_CARDS, spread.cardCount);

        const drawn: DrawnCard[] = newDeck.map((card, idx) => ({
          card,
          reversed: shouldReverse(),
          // position 是牌阵位置序号：第 idx 张抽到的牌对应牌阵第 idx 个位置。
          // 入参 positions 是用户在扇面上点选的扇位序号，与牌阵位置无关，
          // 曾误存为 position，导致位置名错位、扇位 ≥ 牌阵长度时位置名缺失。
          position: idx,
        }));
        set({ stage: 'done', drawnCards: drawn });
      },

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
