import { motion } from 'framer-motion';

interface SweepBeamProps {
  className?: string;
  color?: string;
  duration?: number;
  delay?: number;
  direction?: 'ltr' | 'rtl' | 'ttb' | 'btt';
}

/**
 * 对角线扫光 - 用于洗牌等场景的能量波
 */
export default function SweepBeam({
  className = '',
  color = 'rgba(212, 175, 55, 0.4)',
  duration = 2.5,
  delay = 0,
  direction = 'ltr',
}: SweepBeamProps) {
  const initialMap = {
    ltr: { x: '-100%', y: '-100%' },
    rtl: { x: '100%', y: '-100%' },
    ttb: { x: '-100%', y: '-100%' },
    btt: { x: '-100%', y: '100%' },
  };
  const finalMap = {
    ltr: { x: '100%', y: '100%' },
    rtl: { x: '-100%', y: '100%' },
    ttb: { x: '100%', y: '100%' },
    btt: { x: '100%', y: '-100%' },
  };

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${direction === 'ltr' || direction === 'rtl' ? '45deg' : '-45deg'}, transparent 40%, ${color} 50%, transparent 60%)`,
          backgroundSize: '200% 200%',
        }}
        initial={{
          backgroundPosition: `${initialMap[direction].x} ${initialMap[direction].y}`,
          opacity: 0,
        }}
        animate={{
          backgroundPosition: `${finalMap[direction].x} ${finalMap[direction].y}`,
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          repeatDelay: 1.5,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
