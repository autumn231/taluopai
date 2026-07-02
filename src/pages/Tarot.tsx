import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Sparkles, Heart, Briefcase, Coins, BookOpen } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import TarotCard from '@/components/tarot/TarotCard';
import RuneShower from '@/components/effects/RuneShower';
import { TAROT_CARDS, ELEMENT_THEMES, SUIT_THEMES } from '@/data/tarotCards';
import { cn } from '@/lib/utils';
import type { Suit, TarotCard as TarotCardType } from '@/types';

type Filter = 'all' | 'major' | Suit;

const FILTERS: { key: Filter; label: string; cn: string }[] = [
  { key: 'all', label: '全部', cn: '全部 · 78' },
  { key: 'major', label: '大阿尔卡那', cn: '大阿尔卡那 · 22' },
  { key: 'wands', label: '权杖', cn: '权杖 · 14' },
  { key: 'cups', label: '圣杯', cn: '圣杯 · 14' },
  { key: 'swords', label: '宝剑', cn: '宝剑 · 14' },
  { key: 'pentacles', label: '星币', cn: '星币 · 14' },
];

export default function Tarot() {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<TarotCardType | null>(null);

  const filteredCards = useMemo(() => {
    let cards = TAROT_CARDS;
    if (filter === 'major') {
      cards = cards.filter((c) => c.arcana === 'major');
    } else if (filter !== 'all') {
      cards = cards.filter((c) => c.suit === filter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      cards = cards.filter(
        (c) =>
          c.name.cn.toLowerCase().includes(q) ||
          c.name.en.toLowerCase().includes(q) ||
          c.keywords.some((k) => k.toLowerCase().includes(q)),
      );
    }
    return cards;
  }, [filter, search]);

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative">
        {/* 飘落的符文背景 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-0">
          <RuneShower count={10} duration={10} />
        </div>

        <div className="relative z-10">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-5 h-5 text-mystic-gold" />
            <span className="font-title text-xs sm:text-sm text-mystic-gold/80 tracking-[0.4em]">
              THE ENCYCLOPEDIA
            </span>
            <BookOpen className="w-5 h-5 text-mystic-gold" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-gold-gradient glow-text">
            塔罗图鉴
          </h1>
          <div className="rune-divider mt-4 max-w-xs mx-auto">
            <span className="text-mystic-gold/60 text-xs">✦</span>
          </div>
          <p className="mt-4 font-body italic text-sm sm:text-base text-midnight-200/70 max-w-2xl mx-auto">
            78 张塔罗牌，每一张都是宇宙的一个面向。点击任意牌，聆听它想对你说的话。
          </p>
        </motion.div>

        {/* 筛选器 - 一行：搜索 + 分类（移动端 2 行） */}
        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          {/* 搜索框 + 计数 */}
          <div className="flex items-center gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mystic-gold/60" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索牌名、关键词……"
                className="w-full pl-10 pr-4 py-2.5 bg-midnight-900/50 border border-mystic-gold/20 rounded-full text-sm text-midnight-100 placeholder:text-midnight-300/50 focus:outline-none focus:border-mystic-gold/50"
              />
            </div>
            <div className="text-[11px] sm:text-xs font-sans-ui text-midnight-300/70 tracking-wider whitespace-nowrap">
              {filteredCards.length} / 78
            </div>
          </div>

          {/* 分类 - 一行 */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-title tracking-wider transition-all',
                  filter === f.key
                    ? 'bg-mystic-gold/20 border border-mystic-gold text-mystic-lightgold shadow-gold-glow'
                    : 'border border-mystic-gold/15 text-midnight-200 hover:border-mystic-gold/40',
                )}
              >
                {f.cn}
              </button>
            ))}
          </div>
        </div>

        {/* 牌墙 */}
        {filteredCards.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4 md:gap-6"
          >
            {filteredCards.map((card, idx) => (
              <motion.button
                key={card.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.02, 0.5) }}
                onClick={() => setSelected(card)}
                className="group flex flex-col items-center"
              >
                <div className="relative w-full" style={{ paddingTop: '160%' }}>
                  <div className="absolute inset-0 transition-transform duration-300 group-hover:-translate-y-2">
                    <TarotCard
                      card={card}
                      flipped
                      size="md"
                      autoFlip
                      interactive={false}
                      noText
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <div className="font-title text-xs sm:text-sm text-midnight-100 group-hover:text-mystic-lightgold transition-colors">
                    {card.name.cn}
                  </div>
                  <div className="text-[10px] text-midnight-300/50 font-sans-ui tracking-wider mt-0.5">
                    {card.name.en}
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <p className="font-body italic text-midnight-200/60">未找到匹配的牌</p>
          </div>
        )}

        {/* 详情弹层 */}
        <AnimatePresence>
          {selected && (
            <CardDetailModal card={selected} onClose={() => setSelected(null)} />
          )}
        </AnimatePresence>
        </div>
      </div>
    </PageLayout>
  );
}

// 详情弹层
function CardDetailModal({
  card,
  onClose,
}: {
  card: TarotCardType;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'upright' | 'reversed'>('upright');
  const reading = tab === 'upright' ? card.upright : card.reversed;
  const theme = card.arcana === 'major'
    ? ELEMENT_THEMES['spirit']
    : SUIT_THEMES[card.suit as Suit];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-midnight-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto glass-panel-strong rounded-2xl"
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-midnight-900/60 hover:bg-mystic-gold/20 border border-mystic-gold/20 flex items-center justify-center text-midnight-200 hover:text-mystic-gold transition-colors"
          aria-label="关闭"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 顶部装饰 */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mystic-gold/50 to-transparent" />

        <div className="p-5 sm:p-8 md:p-10">
          <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
            {/* 牌图 */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <TarotCard
                card={card}
                reversed={tab === 'reversed'}
                flipped
                size="lg"
                autoFlip
                interactive={false}
              />
            </div>

            {/* 内容 */}
            <div className="flex-1 min-w-0">
              {/* 标题 */}
              <div className="mb-4">
                <div className="text-xs font-sans-ui text-mystic-gold/70 tracking-widest mb-1">
                  {card.arcana === 'major' ? 'MAJOR ARCANA' : `MINOR ARCANA · ${theme?.name || ''}`}
                </div>
                <h2 className="font-display text-3xl sm:text-4xl text-gold-gradient glow-text">
                  {card.name.cn}
                </h2>
                <div className="text-sm text-midnight-300/60 font-title tracking-widest mt-1">
                  {card.name.en}
                </div>
                <div className="text-xs text-midnight-300/50 font-body italic mt-2">
                  {card.symbol}
                </div>
              </div>

              {/* 关键词 */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-5">
                {card.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-xs px-2.5 py-1 rounded-full border border-mystic-gold/30 bg-mystic-gold/5 text-mystic-gold/90"
                  >
                    {kw}
                  </span>
                ))}
              </div>

              {/* 切换正逆位 */}
              <div className="flex gap-1 mb-5 bg-midnight-900/40 rounded-full p-1 border border-mystic-gold/15 w-fit">
                <button
                  onClick={() => setTab('upright')}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-xs font-title tracking-widest transition-all',
                    tab === 'upright'
                      ? 'bg-mystic-gold/20 text-mystic-lightgold'
                      : 'text-midnight-300 hover:text-mystic-gold',
                  )}
                >
                  正位
                </button>
                <button
                  onClick={() => setTab('reversed')}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-xs font-title tracking-widest transition-all',
                    tab === 'reversed'
                      ? 'bg-rose-400/20 text-rose-300'
                      : 'text-midnight-300 hover:text-rose-300',
                  )}
                >
                  逆位
                </button>
              </div>

              {/* 核心解读 */}
              <div className="mb-5">
                <SectionTitle icon={<Sparkles className="w-3.5 h-3.5" />} title="核心指引" />
                <p className="font-body text-sm sm:text-base text-midnight-100/90 leading-relaxed">
                  {reading.general}
                </p>
              </div>

              {/* 三维度 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <Dimension
                  icon={<Heart className="w-3.5 h-3.5" />}
                  label="爱情"
                  content={reading.love}
                  color="rose"
                />
                <Dimension
                  icon={<Briefcase className="w-3.5 h-3.5" />}
                  label="事业"
                  content={reading.career}
                  color="violet"
                />
                <Dimension
                  icon={<Coins className="w-3.5 h-3.5" />}
                  label="财运"
                  content={reading.wealth}
                  color="gold"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-mystic-gold">{icon}</span>
      <span className="font-title text-xs sm:text-sm text-mystic-gold/90 tracking-widest">
        {title}
      </span>
    </div>
  );
}

function Dimension({
  icon,
  label,
  content,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  content: string;
  color: 'rose' | 'violet' | 'gold';
}) {
  const colors = {
    rose: 'text-rose-400/90 border-rose-400/30 bg-rose-400/5',
    violet: 'text-violet-400/90 border-violet-400/30 bg-violet-400/5',
    gold: 'text-mystic-gold/90 border-mystic-gold/30 bg-mystic-gold/5',
  };
  return (
    <div className={cn('rounded-xl border p-3 sm:p-4', colors[color])}>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="font-title text-xs tracking-widest">{label}</span>
      </div>
      <p className="font-body text-xs sm:text-sm text-midnight-100/80 leading-relaxed">
        {content}
      </p>
    </div>
  );
}
