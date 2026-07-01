import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReadingRecord } from '@/types';

interface HistoryState {
  records: ReadingRecord[];
  addRecord: (record: ReadingRecord) => void;
  removeRecord: (id: string) => void;
  clear: () => void;
}

const MAX_RECORDS = 20;

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      records: [],
      addRecord: (record) =>
        set((state) => ({
          records: [record, ...state.records].slice(0, MAX_RECORDS),
        })),
      removeRecord: (id) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        })),
      clear: () => set({ records: [] }),
    }),
    { name: 'mystic-tarot-history' },
  ),
);
