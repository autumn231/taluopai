import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DrawnCard, SpreadType, TarotCard } from '@/types';
import { drawCards, shouldReverse, shouldReversedSeeded, drawCardsByQuestion } from '@/utils/shuffle';
import { TAROT_CARDS } from '@/data/tarotCards';
import { getSpread } from '@/data/spreads';
import type { ThreeMode } from '@/data/questionThemes';

export type Stage = 'idle' | 'shuffle' | 'select' | 'reveal' | 'done';

interface ReadingState {
  spreadType: SpreadType | null;
  /** 三张牌阵的子模式 */
  threeMode: ThreeMode;
  stage: Stage;
  drawnCards: DrawnCard[];
  question: string;
  deck: TarotCard[]; // 当前已抽完的牌组，供洗牌动画使用

  // Actions
  setSpread: (type: SpreadType) => void;
  setThreeMode: (mode: ThreeMode) => void;
  setQuestion: (q: string) => void;
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
      spreadType: 'single',
      threeMode: 'time',
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

      setThreeMode: (mode) => set({ threeMode: mode }),

      setQuestion: (q) => set({ question: q }),

      startShuffle: () => {
        const spread = getSpread(get().spreadType!);
        // 预览用的洗牌（用真随机让用户看到牌面在动）
        const shuffledDeck = drawCards(TAROT_CARDS, spread.cardCount);
        set({ stage: 'shuffle', deck: shuffledDeck });
      },

      startSelect: () => set({ stage: 'select' }),

      selectCards: (positions) => {
        const { spreadType, question, threeMode } = get();
        if (!spreadType) return;
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
        set({ stage: 'reveal', drawnCards: drawn, deck: newDeck });
      },

      revealCard: () => {
        // 单张翻牌（顺序揭晓由 UI 控制）
      },

      revealAll: () => set({ stage: 'done' }),

      reset: () =>
        set({
          spreadType: 'single',
          threeMode: 'time',
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
        threeMode: state.threeMode,
        drawnCards: state.drawnCards,
        question: state.question,
      }),
    },
  ),
);
