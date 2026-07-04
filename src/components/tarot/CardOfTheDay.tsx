import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, Calendar } from 'lucide-react';
import TarotCard from './TarotCard';
import { TAROT_CARDS } from '@/data/tarotCards';
import { seededShuffle, shouldReversedSeeded } from '@/utils/shuffle';
import type { TarotCard as TarotCardType } from '@/types';

const STORAGE_KEY = 'mystic-tarot-cotd';

interface CotdState {
  date: string;
  cardId: number;
  reversed: boolean;
  revealed: boolean;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** 基于日期种子选出今日牌（同一天稳定） */
function pickDailyCard(): { card: TarotCardType; reversed: boolean } {
  const seed = `cotd::${todayKey()}`;
  const card = seededShuffle(TAROT_CARDS, seed)[0];
  const reversed = shouldReversedSeeded(`${seed}::${card.id}`);
  return { card, reversed };
}

/** 真随机抽一张（用于「换一张」） */
function pickRandomCard(excludeId?: number): { card: TarotCardType; reversed: boolean } {
  let card = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
  // 尽量避免与上一张重复
  if (excludeId !== undefined && TAROT_CARDS.length > 1) {
    while (card.id === excludeId) {
      card = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
    }
  }
  const reversed = Math.random() < 0.3;
  return { card, reversed };
}

function loadState(): CotdState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CotdState;
    if (parsed.date !== todayKey()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function CardOfTheDay() {
  const [card, setCard] = useState<TarotCardType | null>(null);
  const [reversed, setReversed] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // 初始化：优先读取今日已存状态，否则按日期种子抽一张
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      const found = TAROT_CARDS.find((c) => c.id === saved.cardId);
      if (found) {
        setCard(found);
        setReversed(saved.reversed);
        setRevealed(saved.revealed);
        return;
      }
    }
    const { card: c, reversed: r } = pickDailyCard();
    setCard(c);
    setReversed(r);
    setRevealed(false);
  }, []);

  // 持久化
  const persist = useCallback((c: TarotCardType, r: boolean, rev: boolean) => {
    try {
      const state: CotdState = {
        date: todayKey(),
        cardId: c.id,
        reversed: r,
        revealed: rev,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // 静默失败
    }
  }, []);

  const handleReveal = () => {
    if (!card || revealed) return;
    setRevealed(true);
    persist(card, reversed, true);
  };

  const handleRefresh = () => {
    const { card: c, reversed: r } = pickRandomCard(card?.id);
    setCard(c);
    setReversed(r);
    setRevealed(false);
    persist(c, r, false);
  };

  if (!card) {
    return (
      <section className="relative px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="glass-panel-strong rounded-2xl p-6 sm:p-10 relative overflow-hidden animate-pulse">
            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-10">
              <div className="w-[200px] h-[320px] rounded-xl bg-mystic-gold/10 border border-mystic-gold/20" />
              <div className="flex-1 space-y-3">
                <div className="h-3 w-24 rounded bg-mystic-gold/15" />
                <div className="h-8 w-40 rounded bg-mystic-gold/15" />
                <div className="h-3 w-32 rounded bg-mystic-gold/10" />
                <div className="h-20 w-full rounded bg-mystic-gold/8" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const reading = reversed ? card.reversed : card.upright;

  return (
    <section className="relative px-4 sm:px-6 py-16 sm:py-24">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="flex items-center justify-center gap-2 text-[10px] sm:text-[11px] font-title tracking-[0.35em] uppercase text-mystic-gold/80 mb-3 sm:mb-4">
            <Calendar className="w-3.5 h-3.5" />
            <span>今日指引 · Card of the Day</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-gold-gradient glow-text leading-tight">
            每日一牌
          </h2>
          <div className="rune-divider mt-5 sm:mt-6 max-w-xs mx-auto">
            <span className="text-mystic-gold/60 text-xs">✦</span>
          </div>
          <p className="mt-5 sm:mt-6 font-body italic text-sm sm:text-[15px] text-midnight-200/75 max-w-2xl mx-auto leading-relaxed">
            每一天，宇宙都会为你递来一张牌。它在晨光中等待，等你亲手翻开今日的低语。
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="glass-panel-strong rounded-2xl p-6 sm:p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mystic-gold/50 to-transparent" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-mystic-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-10">
            {/* 牌面 - 可点击翻牌 */}
            <button
              onClick={handleReveal}
              className="flex-shrink-0 group cursor-pointer"
              aria-label={revealed ? '今日牌已翻开' : '点击翻开今日牌'}
            >
              <div className="relative transition-transform duration-500 group-hover:-translate-y-1.5">
                <TarotCard
                  card={card}
                  reversed={reversed}
                  flipped={revealed}
                  size="lg"
                  interactive={false}
                />
                {!revealed && (
                  <motion.div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      boxShadow: '0 0 40px rgba(244, 208, 63, 0.5)',
                    }}
                  />
                )}
              </div>
            </button>

            {/* 解读 */}
            <div className="flex-1 min-w-0 text-center md:text-left">
              {!revealed ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center md:items-start gap-3"
                >
                  <span className="text-[11px] font-title text-mystic-gold/80 tracking-widest">
                    ✦ 今日之牌已就位
                  </span>
                  <p className="font-body italic text-sm sm:text-base text-midnight-200/80 leading-relaxed">
                    轻触牌面，让今日的能量向你显现。
                  </p>
                  <button
                    onClick={handleReveal}
                    className="btn-mystic text-xs sm:text-sm px-5 py-2.5 mt-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-2" />
                    翻开今日牌
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                    <span className="text-[11px] font-title text-mystic-gold/80 tracking-widest">
                      {card.arcana === 'major' ? '大阿尔卡那' : '小阿尔卡那'}
                    </span>
                    {reversed && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-rose-400/40 text-rose-400/90 font-title">
                        逆位
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl text-gold-gradient mb-1 break-words">
                    {card.name.cn}
                  </h3>
                  <div className="text-xs text-midnight-300/60 font-title tracking-widest mb-3">
                    {card.name.en.toUpperCase()}
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center md:justify-start mb-4">
                    {card.keywords.slice(0, 4).map((kw: string) => (
                      <span
                        key={kw}
                        className="text-[11px] px-2 py-0.5 rounded-full border border-mystic-gold/30 bg-mystic-gold/5 text-mystic-gold/90"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                  <p className="font-body text-sm sm:text-base text-midnight-100/90 leading-relaxed">
                    {reading.general}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* 底部操作 */}
          <div className="relative z-10 mt-6 sm:mt-8 flex justify-center">
            <button
              onClick={handleRefresh}
              className="text-xs text-mystic-gold/70 hover:text-mystic-lightgold transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-mystic-gold/20 hover:border-mystic-gold/40"
            >
              <RefreshCw className="w-3 h-3" />
              换一张 · 重新抽取
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
