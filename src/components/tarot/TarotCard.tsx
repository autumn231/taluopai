import { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import type { TarotCard as TarotCardType } from '@/types';
import TarotCardFace from './TarotCardFace';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useIsMobile';

interface TarotCardProps {
  card?: TarotCardType;
  reversed?: boolean;
  /** 是否已翻开显示牌面（true=正面朝上，false=背面朝上） */
  flipped?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  /** 仅渲染牌背，用于牌堆、卡槽等装饰场景；与 flipped 同时使用时仍以背面呈现 */
  showBack?: boolean;
  delay?: number;
  noText?: boolean;
  interactive?: boolean;
}

const SIZE_MAP = {
  xs: { w: 60, h: 96 },
  sm: { w: 90, h: 144 },
  md: { w: 130, h: 208 },
  lg: { w: 180, h: 288 },
  xl: { w: 220, h: 352 },
};

const TarotCard = memo(function TarotCard({
  card,
  reversed = false,
  flipped = false,
  size = 'md',
  className = '',
  onClick,
  showBack = false,
  delay = 0,
  noText = false,
  interactive = true,
}: TarotCardProps) {
  const [hovered, setHovered] = useState(false);
  const { w, h } = SIZE_MAP[size];
  const isMobile = useIsMobile();
  // 移动端跳过 3D 翻转动画，改用简单淡入（preserve-3d + backface-hidden 在移动端极耗 GPU）
  const use3D = !isMobile;
  const isFlipped = flipped;

  return (
    <motion.div
      className={cn('relative cursor-pointer', use3D && 'perspective-1000', className)}
      style={{ width: w, height: h }}
      onClick={onClick}
      onMouseEnter={() => interactive && setHovered(true)}
      onMouseLeave={() => interactive && setHovered(false)}
      whileHover={interactive ? { y: -8 } : undefined}
      initial={{ opacity: 0, y: 30, ...(use3D ? { rotateY: 180 } : {}) }}
      animate={{ opacity: 1, y: 0, ...(use3D ? { rotateY: 0 } : {}) }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {use3D ? (
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
              showBack={showBack}
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
              {showBack ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full"
                >
                  <TarotCardFace
                    showBack
                    width={w}
                    height={h}
                    className="rounded-xl"
                  />
                </motion.div>
              ) : card ? (
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
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : (
        /* 移动端：单平面轻量翻牌（不用 preserve-3d，尊重 flipped 状态） */
        <MobileFlip
          card={card}
          reversed={reversed}
          flipped={isFlipped}
          showBack={showBack}
          width={w}
          height={h}
          noText={noText}
        />
      )}

      {/* 光晕层 */}
      {interactive && (
        <motion.div
          className="absolute inset-0 -z-10 rounded-xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%)',
            filter: 'blur(20px)',
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
});

export default TarotCard;

/**
 * 移动端翻牌：单平面 rotateY 转到侧面（90°）时切换正反面再转回，
 * 避免 preserve-3d + backface-hidden 的移动端 GPU 开销，同时保留翻牌动画。
 */
function MobileFlip({
  card,
  reversed,
  flipped,
  showBack,
  width,
  height,
  noText,
}: {
  card?: TarotCardType;
  reversed: boolean;
  flipped: boolean;
  showBack: boolean;
  width: number;
  height: number;
  noText: boolean;
}) {
  const [faceUp, setFaceUp] = useState(flipped);
  const controls = useAnimationControls();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      setFaceUp(flipped);
      return;
    }
    if (faceUp === flipped) return;
    let cancelled = false;
    (async () => {
      await controls.start({ rotateY: 90, transition: { duration: 0.16, ease: 'easeIn' } });
      if (cancelled) return;
      setFaceUp(flipped);
      await controls.start({ rotateY: 0, transition: { duration: 0.24, ease: 'easeOut' } });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped]);

  const showFace = !showBack && !!card && faceUp;
  return (
    <div className="relative w-full h-full" style={{ perspective: 700 }}>
      <motion.div className="relative w-full h-full" animate={controls} initial={{ rotateY: 0 }}>
        {showFace ? (
          <TarotCardFace
            card={card}
            width={width}
            height={height}
            reversed={reversed}
            noText={noText}
            className="rounded-xl"
          />
        ) : (
          <TarotCardFace showBack width={width} height={height} className="rounded-xl" />
        )}
      </motion.div>
    </div>
  );
}
