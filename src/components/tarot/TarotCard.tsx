import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TarotCard as TarotCardType } from '@/types';
import TarotCardFace from './TarotCardFace';
import { cn } from '@/lib/utils';

interface TarotCardProps {
  card?: TarotCardType;
  reversed?: boolean;
  flipped?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  showBack?: boolean;
  delay?: number;
  autoFlip?: boolean;
  noText?: boolean;
  interactive?: boolean;
}

const SIZE_MAP = {
  sm: { w: 90, h: 144 },
  md: { w: 130, h: 208 },
  lg: { w: 180, h: 288 },
  xl: { w: 220, h: 352 },
};

// 选牌阶段同时显示 14 张牌 + Result 页 10 张牌，memo 显著减少重渲染
function TarotCard({
  card,
  reversed = false,
  flipped = false,
  size = 'md',
  className = '',
  onClick,
  showBack = false,
  delay = 0,
  autoFlip = false,
  noText = false,
  interactive = true,
}: TarotCardProps) {
  const [hovered, setHovered] = useState(false);
  const { w, h } = SIZE_MAP[size];
  const isFlipped = flipped || autoFlip;

  return (
    <motion.div
      className={cn('relative cursor-pointer perspective-1000', className)}
      style={{
        width: w,
        height: h,
        // 告诉浏览器该元素会做 3D 变换，提前创建合成层
        willChange: 'transform',
      }}
      onClick={onClick}
      onMouseEnter={() => interactive && setHovered(true)}
      onMouseLeave={() => interactive && setHovered(false)}
      whileHover={interactive ? { y: -8 } : undefined}
      initial={{ opacity: 0, y: 30, rotateY: 180 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{
          rotateY: isFlipped ? 180 : 0,
          rotateX: hovered && interactive ? -8 : 0,
        }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* 牌背（默认显示） */}
        <div
          className="absolute inset-0 backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <TarotCardFace
            showBack
            width={w}
            height={h}
            className="rounded-xl"
          />
        </div>

        {/* 牌面（翻转后显示） */}
        <div
          className="absolute inset-0 backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <AnimatePresence>
            {card && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full"
              >
                <TarotCardFace
                  card={card}
                  width={w}
                  height={h}
                  reversed={reversed}
                  noText={noText}
                  className="rounded-xl"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* 光晕层 - 用 transform 替代 filter blur 减小性能开销 */}
      {interactive && (
        <motion.div
          className="absolute inset-0 -z-10 rounded-xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%)',
            opacity: 0.3,
          }}
          animate={{
            opacity: hovered ? 0.8 : 0.3,
            scale: hovered ? 1.1 : 1,
          }}
          transition={{ duration: 0.4 }}
        />
      )}

      {/* 选中外发光环 */}
      {hovered && interactive && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: '0 0 30px rgba(212, 175, 55, 0.6), inset 0 0 20px rgba(212, 175, 55, 0.2)',
            border: '1px solid rgba(244, 208, 63, 0.6)',
          }}
        />
      )}
    </motion.div>
  );
}

export default memo(TarotCard, (prev, next) => {
  // 精细比较：避免任何不相关的 props 变化触发重渲染
  return (
    prev.card?.id === next.card?.id &&
    prev.reversed === next.reversed &&
    prev.flipped === next.flipped &&
    prev.size === next.size &&
    prev.className === next.className &&
    prev.showBack === next.showBack &&
    prev.delay === next.delay &&
    prev.autoFlip === next.autoFlip &&
    prev.noText === next.noText &&
    prev.interactive === next.interactive &&
    prev.onClick === next.onClick
  );
});
