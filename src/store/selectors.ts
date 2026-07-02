import { useReadingStore } from './useReadingStore';
import { useHistoryStore } from './useHistoryStore';
import { useShallow } from 'zustand/react/shallow';

/** 牌阵类型 */
export const useSpreadType = () => useReadingStore((s) => s.spreadType);
/** 三张牌阵的子模式 */
export const useThreeMode = () => useReadingStore((s) => s.threeMode);
/** 当前阶段 */
export const useStage = () => useReadingStore((s) => s.stage);
/** 当前问题文本 */
export const useQuestion = () => useReadingStore((s) => s.question);
/** 已抽出的牌 */
export const useDrawnCards = () => useReadingStore((s) => s.drawnCards);
/** 牌堆（用于洗牌动画） */
export const useDeck = () => useReadingStore((s) => s.deck);

/** UI 复合状态 - 一次拿多个，减少订阅开销 */
export const useReadingUI = () =>
  useReadingStore(
    useShallow((s) => ({
      spreadType: s.spreadType,
      threeMode: s.threeMode,
      stage: s.stage,
      drawnCards: s.drawnCards,
      question: s.question,
    })),
  );

/** Reading 页面所有 actions - 引用稳定 */
export const useReadingActions = () =>
  useReadingStore(
    useShallow((s) => ({
      setSpread: s.setSpread,
      setThreeMode: s.setThreeMode,
      setQuestion: s.setQuestion,
      startShuffle: s.startShuffle,
      startSelect: s.startSelect,
      selectCards: s.selectCards,
      revealAll: s.revealAll,
      reset: s.reset,
    })),
  );

/** History 相关 */
export const useHistoryRecords = () => useHistoryStore((s) => s.records);
export const useHistoryActions = () =>
  useHistoryStore(
    useShallow((s) => ({
      addRecord: s.addRecord,
      removeRecord: s.removeRecord,
      clear: s.clear,
    })),
  );
