import { motion } from 'framer-motion';

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
 */
export default function MysticRing({
  size = 280,
  className = '',
  rings = 3,
  speed = 1,
  glowColor = '#d4af37',
}: MysticRingProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* 外层光晕 */}
      <div
        className="absolute inset-0 rounded-full animate-pulse-glow"
        style={{
          background: `radial-gradient(circle, ${glowColor}33 0%, transparent 70%)`,
        }}
      />

      {/* 三层旋转环 */}
      {Array.from({ length: rings }).map((_, ringIdx) => {
        const ringSize = size * (0.95 - ringIdx * 0.18);
        const isReverse = ringIdx % 2 === 1;
        const duration = (20 + ringIdx * 10) / speed;
        const symbolsCount = RUNE_SYMBOLS.length;

        return (
          <div
            key={ringIdx}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: ringSize,
              height: ringSize,
              border: `1px solid ${glowColor}${ringIdx === 1 ? '80' : '40'}`,
              animation: `${isReverse ? 'spinReverse' : 'spin'} ${duration}s linear infinite`,
            }}
          >
            {/* 环上的符文 */}
            {Array.from({ length: symbolsCount }).map((_, i) => {
              const angle = (i / symbolsCount) * 360;
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

      {/* 中心圆点 */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: size * 0.1,
          height: size * 0.1,
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
