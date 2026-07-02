import { useReadingStore } from './useReadingStore';
import { useHistoryStore } from './useHistoryStore';
import { useShallow } from 'zustand/react/shallow';

// === Reading store selectors ===
// 按字段粒度订阅，避免组件不必要 re-render

export const useSpreadType = () => useReadingStore((s) => s.spreadType);
export const useStage = () => useReadingStore((s) => s.stage);
export const useQuestion = () => useReadingStore((s) => s.question);
export const useDrawnCards = () => useReadingStore((s) => s.drawnCards);
export const useDeck = () => useReadingStore((s) => s.deck);

// 复合状态用 shallow 比较，避免对象引用变化导致重渲染
export const useReadingUI = () =>
  useReadingStore(
    useShallow((s) => ({
      stage: s.stage,
      spreadType: s.spreadType,
      question: s.question,
    })),
  );

// === Actions 单独导出，引用稳定，不会触发 re-render ===
export const useReadingActions = () =>
  useReadingStore(
    useShallow((s) => ({
      setSpread: s.setSpread,
      setQuestion: s.setQuestion,
      startMeditation: s.startMeditation,
      startShuffle: s.startShuffle,
      startSelect: s.startSelect,
      selectCards: s.selectCards,
      reset: s.reset,
    })),
  );

// === History store selectors ===
export const useHistoryRecords = () => useHistoryStore((s) => s.records);

export const useHistoryActions = () =>
  useHistoryStore(
    useShallow((s) => ({
      addRecord: s.addRecord,
      removeRecord: s.removeRecord,
      clear: s.clear,
    })),
  );
