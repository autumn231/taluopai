import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

interface RuneShowerProps {
  className?: string;
  count?: number;
  duration?: number;
  runes?: string[];
}

/**
 * 符文雨 - 飘落的符文符号
 */
export default function RuneShower({
  className = '',
  count = 16,
  duration = 6,
  runes = ['✦', '☽', '✧', '☉', '✶', '✷', '', '❋'],
}: RuneShowerProps) {
  const isMobile = useIsMobile();
  // 移动端减半
  const effectiveCount = isMobile ? Math.floor(count / 2) : count;

  const items = useMemo(
    () =>
      Array.from({ length: effectiveCount }, (_, i) => ({
        id: i,
        rune: runes[i % runes.length],
        x: Math.random() * 100,
        delay: Math.random() * duration,
        fallDuration: duration + Math.random() * 4,
        size: 14 + Math.random() * 20,
        drift: (Math.random() - 0.5) * 60,
      })),
    [effectiveCount, runes, duration],
  );

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {items.map((item) => (
        <motion.div
          key={item.id}
          className="absolute text-mystic-gold/40 font-display"
          style={{
            left: `${item.x}%`,
            top: -50,
            fontSize: item.size,
            textShadow: '0 0 8px rgba(212, 175, 55, 0.6)',
          }}
          initial={{ y: -50, opacity: 0, rotate: 0 }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, item.drift, 0],
            opacity: [0, 0.7, 0.7, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: item.fallDuration,
            delay: item.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {item.rune}
        </motion.div>
      ))}
    </div>
  );
}
