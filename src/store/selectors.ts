import { useReadingStore } from './useReadingStore';
import { useHistoryStore } from './useHistoryStore';
import { useShallow } from 'zustand/react/shallow';

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
export const useHistoryActions = () =>
  useHistoryStore(
    useShallow((s) => ({
      addRecord: s.addRecord,
      removeRecord: s.removeRecord,
      clear: s.clear,
    })),
  );
