import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trash2, History as HistoryIcon, Eye, Calendar, RotateCcw, Search, X } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import TarotCard from '@/components/tarot/TarotCard';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useReadingStore } from '@/store/useReadingStore';
import { SPREADS, THREE_MODES } from '@/data/spreads';
import { formatDate, cn } from '@/lib/utils';
import type { ReadingRecord, SpreadType } from '@/types';

type HistoryFilter = 'all' | SpreadType;

const FILTERS: { key: HistoryFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'single', label: '单张' },
  { key: 'three', label: '三张' },
  { key: 'celtic', label: '凯尔特' },
];

export default function History() {
  const records = useHistoryStore((s) => s.records);
  const removeRecord = useHistoryStore((s) => s.removeRecord);
  const clear = useHistoryStore((s) => s.clear);
  const [confirmClear, setConfirmClear] = useState(false);
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [search, setSearch] = useState('');

  // 应用筛选 + 搜索后再按日期分组
  const grouped = useMemo(() => {
    let list = records;
    if (filter !== 'all') {
      list = list.filter((r) => r.spreadType === filter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.question?.toLowerCase().includes(q) ||
          r.cards.some((c) => c.card.name.cn.toLowerCase().includes(q)),
      );
    }

    const groups: { label: string; items: ReadingRecord[] }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    list.forEach((r) => {
      const d = new Date(r.timestamp);
      d.setHours(0, 0, 0, 0);
      let label: string;
      if (d.getTime() === today.getTime()) label = '今天';
      else if (d.getTime() === yesterday.getTime()) label = '昨天';
      else if (d.getTime() >= weekAgo.getTime()) label = '本周早些时候';
      else label = d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });

      let g = groups.find((x) => x.label === label);
      if (!g) {
        g = { label, items: [] };
        groups.push(g);
      }
      g.items.push(r);
    });
    return groups;
  }, [records, filter, search]);

  const totalFiltered = grouped.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <HistoryIcon className="w-5 h-5 text-mystic-gold" />
            <span className="font-title text-xs sm:text-sm text-mystic-gold/80 tracking-[0.4em]">
              YOUR JOURNEY
            </span>
            <HistoryIcon className="w-5 h-5 text-mystic-gold" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-gold-gradient glow-text">
            历史记录
          </h1>
          <div className="rune-divider mt-4 max-w-xs mx-auto">
            <span className="text-mystic-gold/60 text-xs">✦</span>
          </div>
          <p className="mt-4 font-body italic text-sm sm:text-base text-midnight-200/70">
            回顾你与宇宙的每一次对话
          </p>
        </motion.div>

        {records.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* 顶部操作栏 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between mb-5 sm:mb-6"
            >
              <div className="text-xs sm:text-sm font-sans-ui text-midnight-300/70">
                共 {records.length} 条 · 当前 {totalFiltered} 条
              </div>
              {confirmClear ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-300">确定要清空所有记录？</span>
                  <button
                    onClick={() => {
                      clear();
                      setConfirmClear(false);
                    }}
                    className="px-3 py-1 text-xs rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 hover:bg-rose-500/30"
                  >
                    确认
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-1 text-xs rounded-full border border-midnight-200/30 text-midnight-200 hover:border-midnight-200/60"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="text-xs text-midnight-300/70 hover:text-rose-300 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  清空记录
                </button>
              )}
            </motion.div>

            {/* 筛选 + 搜索 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-6 sm:mb-8 space-y-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={cn(
                      'px-3 py-1 rounded-full text-[11px] font-title tracking-wider transition-all',
                      filter === f.key
                        ? 'bg-mystic-gold/20 border border-mystic-gold text-mystic-lightgold shadow-gold-glow'
                        : 'border border-mystic-gold/15 text-midnight-200 hover:border-mystic-gold/40',
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-mystic-gold/60" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索问题或牌名……"
                  className="w-full pl-9 pr-9 py-2 bg-midnight-900/40 border border-mystic-gold/20 rounded-full text-sm text-midnight-100 placeholder:text-midnight-300/50 focus:outline-none focus:border-mystic-gold/50 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-midnight-300/60 hover:text-mystic-gold"
                    aria-label="清除搜索"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>

            {/* 记录列表 - 按时间分组 */}
            {totalFiltered === 0 ? (
              <div className="text-center py-16">
                <p className="font-body italic text-midnight-200/60">
                  没有匹配的记录
                </p>
                {(filter !== 'all' || search) && (
                  <button
                    onClick={() => {
                      setFilter('all');
                      setSearch('');
                    }}
                    className="mt-4 text-xs text-mystic-gold/80 hover:text-mystic-lightgold transition-colors"
                  >
                    清除筛选条件
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-8 sm:space-y-10">
                {grouped.map((group) => (
                  <div key={group.label}>
                    {/* 分组标题 */}
                    <div className="flex items-baseline gap-3 mb-3 sm:mb-4">
                      <span className="text-xs sm:text-sm font-title tracking-widest text-mystic-gold/80">
                        {group.label}
                      </span>
                      <div className="flex-1 h-px bg-mystic-gold/10" />
                      <span className="text-[10px] text-midnight-300/50 font-sans-ui">
                        {group.items.length} 条
                      </span>
                    </div>

                    {/* 该组下的记录 */}
                    <div className="space-y-4 sm:space-y-5">
                      {group.items.map((record) => (
                        <HistoryItem
                          key={record.id}
                          record={record}
                          onRemove={() => removeRecord(record.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="text-center py-20"
    >
      <div className="inline-block p-8 sm:p-12 glass-panel rounded-3xl max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-mystic-gold/10 border border-mystic-gold/30 flex items-center justify-center">
          <HistoryIcon className="w-10 h-10 text-mystic-gold/60" />
        </div>
        <h3 className="font-display text-xl sm:text-2xl text-mystic-lightgold mb-3">
          尚无历史记录
        </h3>
        <p className="font-body italic text-sm text-midnight-200/70 mb-6">
          你的第一次占卜将记录在此处
        </p>
        <Link to="/reading" className="btn-mystic text-sm inline-flex">
          <RotateCcw className="w-3.5 h-3.5 mr-2" />
          开始占卜
        </Link>
      </div>
    </motion.div>
  );
}

function HistoryItem({
  record,
  onRemove,
}: {
  record: ReadingRecord;
  onRemove: () => void;
}) {
  const spread = SPREADS[record.spreadType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-panel rounded-2xl p-4 sm:p-6 hover:border-mystic-gold/40 transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* 牌的缩略图 */}
        <div className="flex-shrink-0 -space-x-12 sm:-space-x-16 flex">
          {record.cards.slice(0, 5).map((c, i) => (
            <div
              key={i}
              style={{ zIndex: 5 - i, transform: `rotate(${(i - 2) * 5}deg)` }}
              className="origin-bottom"
            >
              <TarotCard
                card={c.card}
                reversed={c.reversed}
                flipped
                size="sm"
                interactive={false}
                noText
              />
            </div>
          ))}
          {record.cards.length > 5 && (
            <div
              className="w-[90px] h-[144px] rounded-xl border border-mystic-gold/30 bg-midnight-800/80 flex items-center justify-center text-mystic-gold font-title text-sm"
              style={{ transform: 'rotate(10deg)' }}
            >
              +{record.cards.length - 5}
            </div>
          )}
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-title text-base sm:text-lg text-mystic-lightgold">
              {spread.name}
            </span>
            {record.spreadType === 'three' && record.threeMode && THREE_MODES[record.threeMode] && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-mystic-gold/10 border border-mystic-gold/25 text-mystic-gold/80">
                {THREE_MODES[record.threeMode].name}
              </span>
            )}
            <span className="text-xs text-midnight-300/60">
              · {record.cards.length} 张牌
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-midnight-300/60 mb-2">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(record.timestamp)}</span>
          </div>
          {record.question && (
            <div className="text-sm font-body italic text-midnight-200/80 line-clamp-2">
              "{record.question}"
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {record.cards.map((c, i) => (
              <span
                key={i}
                className="text-xs text-midnight-200/70"
              >
                {c.card.name.cn}{c.reversed && '·逆'}
                {i < record.cards.length - 1 && <span className="mx-1.5 text-mystic-gold/30">·</span>}
              </span>
            ))}
          </div>
        </div>

        {/* 操作 */}
        <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-2">
          <Link
            to="/result"
            onClick={() => {
              // 恢复历史到 store
              useReadingStore.setState({
                spreadType: record.spreadType,
                threeMode: record.threeMode || 'time',
                drawnCards: record.cards,
                question: record.question,
                // 用 idle 而非 done：避免回 /reading 时触发重复保存与跳转
                stage: 'idle',
              });
            }}
            className="btn-ghost text-xs"
          >
            <Eye className="w-3 h-3 mr-1.5" />
            查看
          </Link>
          <button
            onClick={onRemove}
            className="text-xs text-midnight-300/50 hover:text-rose-300 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">删除</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
