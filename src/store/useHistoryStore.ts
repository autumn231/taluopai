import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReadingRecord } from '@/types';

interface HistoryState {
  records: ReadingRecord[];
  maxRecords: number;
  addRecord: (record: ReadingRecord) => void;
  removeRecord: (id: string) => void;
  clear: () => void;
  setMaxRecords: (count: number) => void;
}

/** 实际持久化的状态片段 */
type PersistedHistoryState = Pick<HistoryState, 'records' | 'maxRecords'>;

const DEFAULT_MAX_RECORDS = 20;
const MIN_RECORDS = 5;
const MAX_STORAGE_BYTES = 4 * 1024 * 1024; // 4MB 软上限，避免撑满 localStorage

/** 安全持久化：当数据接近或超过限额时自动裁掉最旧的记录 */
const safeLocalStorage = {
  getItem: (name: string) => {
    const raw = localStorage.getItem(name);
    return raw ? JSON.parse(raw) : null;
  },
  setItem: (name: string, value: { state?: PersistedHistoryState }) => {
    const records = value.state?.records ?? [];

    // 软上限预裁剪：避免单次写入过大
    let targetCount = records.length;
    while (targetCount > MIN_RECORDS) {
      const candidate = pruneRecords(value, targetCount);
      if (JSON.stringify(candidate).length <= MAX_STORAGE_BYTES) {
        try {
          localStorage.setItem(name, JSON.stringify(candidate));
          return;
        } catch (err) {
          const isQuota = err instanceof DOMException && err.name === 'QuotaExceededError';
          if (!isQuota) {
            console.warn('[HistoryStore] 保存失败:', err);
            return;
          }
        }
      }
      targetCount -= 1;
    }

    // 最小保留集也超过上限或触发配额：尝试只保留空记录
    try {
      localStorage.setItem(name, JSON.stringify(pruneRecords(value, 0)));
    } catch {
      // 完全无法写入时静默失败，避免阻塞流程
    }
  },
  removeItem: (name: string) => localStorage.removeItem(name),
};

function pruneRecords(value: { state?: PersistedHistoryState }, keep: number) {
  return {
    ...value,
    state: {
      ...value.state,
      records: (value.state?.records ?? []).slice(0, keep),
    },
  };
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      records: [],
      maxRecords: DEFAULT_MAX_RECORDS,
      addRecord: (record) =>
        set((state) => ({
          records: [record, ...state.records].slice(0, Math.max(MIN_RECORDS, state.maxRecords)),
        })),
      removeRecord: (id) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        })),
      clear: () => set({ records: [] }),
      setMaxRecords: (count) =>
        set((state) => ({
          maxRecords: Math.max(MIN_RECORDS, count),
          records: state.records.slice(0, Math.max(MIN_RECORDS, count)),
        })),
    }),
    {
      name: 'mystic-tarot-history',
      storage: safeLocalStorage,
      partialize: (state) => ({
        records: state.records,
        maxRecords: state.maxRecords,
      }),
    },
  ),
);
