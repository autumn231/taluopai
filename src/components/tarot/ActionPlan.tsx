import { motion } from 'framer-motion';
import { Compass, ShieldAlert, Clock, Sparkles, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActionItem } from '@/lib/interpretation';

const KIND_META: Record<
  ActionItem['kind'],
  { icon: LucideIcon; label: string; accent: string; border: string; bg: string; num: string }
> = {
  advice: {
    icon: Compass,
    label: '行动',
    accent: 'text-mystic-lightgold',
    border: 'border-mystic-gold/40',
    bg: 'bg-mystic-gold/8',
    num: '01',
  },
  warning: {
    icon: ShieldAlert,
    label: '留意',
    accent: 'text-rose-300',
    border: 'border-rose-400/35',
    bg: 'bg-rose-400/6',
    num: '02',
  },
  timing: {
    icon: Clock,
    label: '时机',
    accent: 'text-amber-300',
    border: 'border-amber-400/35',
    bg: 'bg-amber-400/6',
    num: '03',
  },
  theme: {
    icon: Sparkles,
    label: '叮嘱',
    accent: 'text-violet-300',
    border: 'border-violet-400/35',
    bg: 'bg-violet-400/6',
    num: '04',
  },
};

export default function ActionPlan({ items }: { items: ActionItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
      {items.map((item, i) => {
        const meta = KIND_META[item.kind];
        const Icon = meta.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className={cn(
              'glass-panel rounded-2xl p-4 sm:p-5 border relative overflow-hidden flex flex-col',
              meta.border,
              meta.bg,
            )}
          >
            <div className="absolute top-2 right-3 text-[10px] font-display text-mystic-gold/30">
              {meta.num}
            </div>
            <div className={cn('flex items-center gap-2 mb-3', meta.accent)}>
              <Icon className="w-4 h-4" />
              <span className="font-title text-xs tracking-widest">{meta.label}</span>
            </div>
            <h4 className="font-display text-sm sm:text-base text-mystic-lightgold mb-2">
              {item.title}
            </h4>
            <p className="text-xs sm:text-sm text-midnight-100/90 leading-relaxed font-body flex-1">
              {item.detail}
            </p>
            <div className="mt-3 pt-2 border-t border-mystic-gold/10 text-[10px] text-midnight-300/60 font-sans-ui">
              来自 · {item.source}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
