import { memo } from 'react';
import { useIsDark } from '@/hooks/useIsDark';
import { useInViewport } from '@/hooks/useInViewport';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface MysticRingProps {
  size?: number;
  className?: string;
  rings?: number;
  speed?: number;
  glowColor?: string;
}

const RUNE_SYMBOLS = ['✦', '☽', '✧', '☉', '✶', '☾', '✷', '✸', '✹', '✺', '✪', '✫'];

/**
 * 旋转的符文圆环 - 用于冥想环节和仪式感的占位
 * 优化：白天模式隐藏、视口外停 CSS 动画
 */
function MysticRingImpl({
  size = 280,
  className = '',
  rings = 3,
  speed = 1,
  glowColor = '#d4af37',
}: MysticRingProps) {
  const isDark = useIsDark();
  const reduced = useReducedMotion();
  const [ref, inView] = useInViewport<HTMLDivElement>({ threshold: 0.05 });

  if (!isDark) return null;

  const animating = inView && !reduced;
  const symbolCount = RUNE_SYMBOLS.length;

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={{ width: size, height: size, willChange: animating ? 'transform' : 'auto' }}
      aria-hidden="true"
    >
      {/* 外层光晕 */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${glowColor}33 0%, transparent 70%)`,
        }}
      />

      {/* 三层旋转环 */}
      {Array.from({ length: rings }).map((_, ringIdx) => {
        const ringSize = size * (0.95 - ringIdx * 0.18);
        const isReverse = ringIdx % 2 === 1;
        const duration = (20 + ringIdx * 10) / speed;

        return (
          <div
            key={ringIdx}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: ringSize,
              height: ringSize,
              border: `1px solid ${glowColor}${ringIdx === 1 ? '80' : '40'}`,
              animation: animating
                ? `${isReverse ? 'spinReverse' : 'spin'} ${duration}s linear infinite`
                : 'none',
              willChange: animating ? 'transform' : 'auto',
            }}
          >
            {/* 环上的符文 - 静态摆放（用 CSS 旋转跟随父元素） */}
            {Array.from({ length: symbolCount }).map((_, i) => {
              const angle = (i / symbolCount) * 360;
              return (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(${-ringSize / 2}px)`,
                  }}
                >
                  <span
                    className="block text-xs"
                    style={{
                      color: glowColor,
                      opacity: 0.6,
                      textShadow: `0 0 6px ${glowColor}`,
                      transform: `rotate(${-angle}deg)`,
                    }}
                  >
                    {RUNE_SYMBOLS[i]}
                  </span>
                </div>
              );
            })}

            {/* 刻度点 */}
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i / 24) * 360;
              const isMajor = i % 6 === 0;
              return (
                <div
                  key={`dot-${i}`}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    width: isMajor ? 4 : 2,
                    height: isMajor ? 4 : 2,
                    background: glowColor,
                    borderRadius: '50%',
                    opacity: isMajor ? 0.8 : 0.4,
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(${-ringSize / 2}px)`,
                    boxShadow: isMajor ? `0 0 6px ${glowColor}` : 'none',
                  }}
                />
              );
            })}
          </div>
        );
      })}

      {/* 中心圆点 - 呼吸效果 */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: size * 0.1,
          height: size * 0.1,
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          animation: animating ? 'pulse-soft 3s ease-in-out infinite' : 'none',
          willChange: animating ? 'transform, opacity' : 'auto',
        }}
      />
    </div>
  );
}

export default memo(MysticRingImpl);
