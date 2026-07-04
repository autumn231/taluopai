import { motion } from 'framer-motion';
import { Flame, Droplet, Wind, Mountain, Sparkles, Layers, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type SynergyReport,
  type DignityPair,
  ELEMENT_CN,
  ELEMENT_TRAIT,
  ELEMENT_COLOR,
} from '@/lib/interpretation';
import type { Element } from '@/types';

const ELEMENT_ICON: Record<Element, typeof Flame> = {
  spirit: Sparkles,
  fire: Flame,
  water: Droplet,
  air: Wind,
  earth: Mountain,
};

const DIGNITY_STYLE: Record<
  DignityPair['relation'],
  { dot: string; text: string; border: string; bg: string }
> = {
  amplify: {
    dot: 'bg-mystic-lightgold',
    text: 'text-mystic-lightgold',
    border: 'border-mystic-lightgold/50',
    bg: 'bg-mystic-gold/10',
  },
  support: {
    dot: 'bg-emerald-400',
    text: 'text-emerald-300',
    border: 'border-emerald-400/40',
    bg: 'bg-emerald-400/8',
  },
  neutral: {
    dot: 'bg-midnight-300',
    text: 'text-midnight-200',
    border: 'border-midnight-200/30',
    bg: 'bg-midnight-900/30',
  },
  conflict: {
    dot: 'bg-rose-400',
    text: 'text-rose-300',
    border: 'border-rose-400/40',
    bg: 'bg-rose-400/8',
  },
};

export default function CardSynergy({ report }: { report: SynergyReport }) {
  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-5">
      {/* 整体格局 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-3.5 h-3.5 text-mystic-gold" />
          <span className="font-title text-xs sm:text-sm text-mystic-gold tracking-widest">
            整体格局
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-sm font-display text-mystic-lightgold">
            {report.pattern}
          </span>
          <span className="text-[10px] text-midnight-300/60 font-sans-ui">
            大阿尔卡那 {report.majorArcanaCount}/{report.elementalBalance.reduce((s, e) => s + e.count, 0)}
            {report.courtCount > 0 && ` · 宫廷 ${report.courtCount}`}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-midnight-200/80 leading-relaxed font-body">
          {report.patternHint}
          {report.courtCount >= 2 &&
            ` 宫廷牌出现 ${report.courtCount} 张（${report.courtNames.join('、')}），「人」的因素在这段局面里很关键。`}
        </p>
      </div>

      <div className="h-px bg-mystic-gold/10" />

      {/* 元素分布 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-mystic-gold" />
          <span className="font-title text-xs sm:text-sm text-mystic-gold tracking-widest">
            元素分布
          </span>
        </div>
        <div className="space-y-2.5">
          {report.elementalBalance.map((e) => {
            const Icon = ELEMENT_ICON[e.element];
            return (
              <div key={e.element} className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex items-center gap-1.5 w-20 sm:w-24 shrink-0 text-xs font-title',
                    ELEMENT_COLOR[e.element],
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {ELEMENT_CN[e.element]}
                </div>
                <div className="flex-1 h-2 rounded-full bg-midnight-900/60 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${e.pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={cn(
                      'h-full rounded-full',
                      e.element === 'spirit' && 'bg-mystic-lightgold',
                      e.element === 'fire' && 'bg-rose-400',
                      e.element === 'water' && 'bg-sky-400',
                      e.element === 'air' && 'bg-violet-400',
                      e.element === 'earth' && 'bg-emerald-400',
                    )}
                  />
                </div>
                <div className="w-16 sm:w-24 shrink-0 text-right">
                  <span className="text-[11px] text-midnight-200/80 font-sans-ui">
                    {e.count} 张 · {e.pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {report.dominantElement && (
          <p className="mt-3 text-xs text-midnight-300/70 italic font-body">
            主调：{ELEMENT_CN[report.dominantElement]}——{ELEMENT_TRAIT[report.dominantElement]}
          </p>
        )}
      </div>

      {/* 牌与牌的关系（仅多张牌） */}
      {report.dignities.length > 0 && (
        <>
          <div className="h-px bg-mystic-gold/10" />
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="w-3.5 h-3.5 text-mystic-gold" />
              <span className="font-title text-xs sm:text-sm text-mystic-gold tracking-widest">
                相邻牌的能量关系
              </span>
            </div>
            <div className="space-y-2">
              {report.dignities.map((d, i) => {
                const style = DIGNITY_STYLE[d.relation];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={cn(
                      'rounded-lg border px-3 py-2 flex items-center gap-2.5',
                      style.border,
                      style.bg,
                    )}
                  >
                    <span className={cn('w-2 h-2 rounded-full shrink-0', style.dot)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs flex-wrap">
                        <span className="text-midnight-100/90 truncate">{d.aName}</span>
                        <span className="text-mystic-gold/40">↔</span>
                        <span className="text-midnight-100/90 truncate">{d.bName}</span>
                        <span className={cn('ml-auto font-title text-[10px] shrink-0', style.text)}>
                          {d.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-midnight-300/60 mt-0.5">{d.hint}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
