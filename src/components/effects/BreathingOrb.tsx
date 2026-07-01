import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface BreathingOrbProps {
  size?: number;
  className?: string;
  duration?: number; // 一次呼吸周期
  text?: string[]; // ['吸气', '屏息', '呼气']
  showText?: boolean;
}

/**
 * 冥想呼吸球 - 配合冥想引导使用
 */
export default function BreathingOrb({
  size = 180,
  className = '',
  duration = 8,
  text = ['吸气', '屏息', '呼气'],
  showText = true,
}: BreathingOrbProps) {
  const [phase, setPhase] = useState(0); // 0: 吸气, 1: 屏息, 2: 呼气

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => (p + 1) % 3);
    }, (duration * 1000) / 3);
    return () => clearInterval(interval);
  }, [duration]);

  // 球体大小变化
  const scaleByPhase = [1.6, 1.6, 0.85];

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size * 2, height: size * 2 }}>
      {/* 外层旋转光晕 */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 60%)',
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 主球体 - 呼吸效果 */}
      <motion.div
        className="relative rounded-full"
        style={{
          width: size,
          height: size,
          background: 'radial-gradient(circle at 30% 30%, #f4d03f, #d4af37 40%, #6e4ea3 80%, #1a0f3d)',
          boxShadow: '0 0 60px rgba(212, 175, 55, 0.6), inset 0 0 40px rgba(244, 208, 63, 0.4)',
        }}
        animate={{
          scale: scaleByPhase[phase],
        }}
        transition={{ duration: duration / 3, ease: 'easeInOut' }}
      >
        {/* 内部高光 */}
        <motion.div
          className="absolute rounded-full"
          style={{
            top: '15%',
            left: '20%',
            width: '30%',
            height: '25%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.7), transparent 70%)',
            filter: 'blur(4px)',
          }}
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* 中心月相 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="rounded-full"
            style={{
              width: size * 0.3,
              height: size * 0.3,
              background: 'radial-gradient(circle, rgba(255,255,255,0.9), rgba(212,175,55,0.6) 50%, transparent)',
              filter: 'blur(2px)',
            }}
          />
        </div>
      </motion.div>

      {/* 文字提示 */}
      {showText && (
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6 }}
          className="absolute -bottom-16 sm:-bottom-20 left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          <span className="font-title text-base sm:text-lg text-mystic-lightgold tracking-[0.4em]">
            {text[phase]}
          </span>
        </motion.div>
      )}

      {/* 外层光环 - 跟随呼吸 */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: size,
            height: size,
            borderColor: 'rgba(212, 175, 55, 0.3)',
            borderWidth: 1,
          }}
          animate={{
            scale: scaleByPhase[phase] * (1 + i * 0.15),
            opacity: [0.4 - i * 0.1, 0.1, 0.4 - i * 0.1],
          }}
          transition={{
            duration: duration / 3,
            ease: 'easeInOut',
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}
