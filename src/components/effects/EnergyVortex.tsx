import { motion } from 'framer-motion';

interface EnergyVortexProps {
  size?: number;
  color?: string;
  active?: boolean;
  className?: string;
  rings?: number;
  speed?: number;
}

/**
 * 能量漩涡 - 多环旋转 + 能量粒子辐射
 */
export default function EnergyVortex({
  size = 240,
  color = '#d4af37',
  active = true,
  className = '',
  rings = 4,
  speed = 1,
}: EnergyVortexProps) {
  if (!active) return null;

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 辐射光晕 */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}40 0%, transparent 60%)`,
          filter: 'blur(8px)',
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 2 / speed, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 多层环 */}
      {Array.from({ length: rings }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size * (0.5 + i * 0.15),
            height: size * (0.5 + i * 0.15),
            border: `1px solid ${color}`,
            opacity: 0.4 - i * 0.05,
            borderStyle: i % 2 === 0 ? 'solid' : 'dashed',
          }}
          animate={{
            rotate: i % 2 === 0 ? 360 : -360,
            scale: [1, 1.05, 1],
          }}
          transition={{
            rotate: {
              duration: 6 / speed + i,
              repeat: Infinity,
              ease: 'linear',
            },
            scale: { duration: 3 / speed, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      ))}

      {/* 中心光球 */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.25,
          height: size * 0.25,
          background: `radial-gradient(circle, #f4d03f 0%, ${color} 60%, transparent 90%)`,
          boxShadow: `0 0 ${size / 3}px ${color}`,
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5 / speed, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 辐射粒子 */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: 4,
              height: 4,
              background: color,
              boxShadow: `0 0 8px ${color}`,
            }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
              x: [0, Math.cos(angle) * size * 0.5, Math.cos(angle) * size * 0.5],
              y: [0, Math.sin(angle) * size * 0.5, Math.sin(angle) * size * 0.5],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2 / speed,
              delay: i * 0.15,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
}
