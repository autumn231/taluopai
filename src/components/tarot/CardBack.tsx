interface CardBackProps {
  width?: number;
  height?: number;
  className?: string;
  withGlow?: boolean;
  showBorder?: boolean;
}

/**
 * 统一牌背设计：神秘金色徽印 + 紫黑底色 + 装饰边框
 * 性能优化：移除冗余装饰网格，合并装饰群组
 */
export default function CardBack({
  width = 200,
  height = 320,
  className = '',
  withGlow = false,
  showBorder = true,
}: CardBackProps) {
  return (
    <svg
      viewBox="0 0 200 320"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="backBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a0f3d" />
          <stop offset="50%" stopColor="#0a0824" />
          <stop offset="100%" stopColor="#1a0f3d" />
        </linearGradient>
        <radialGradient id="centerOrb" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f4d03f" />
          <stop offset="40%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#6e4ea3" />
        </radialGradient>
        <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d4af37" stopOpacity="0" />
          <stop offset="50%" stopColor="#d4af37" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
        </linearGradient>
        {withGlow && (
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* 背景 */}
      <rect width="200" height="320" rx="14" fill="url(#backBg)" />

      {/* 外层金色边框 - 双矩形组合 */}
      {showBorder && (
        <g>
          <rect x="6" y="6" width="188" height="308" rx="10" fill="none" stroke="#d4af37" strokeWidth="1.2" opacity="0.6" />
          <rect x="11" y="11" width="178" height="298" rx="7" fill="none" stroke="#d4af37" strokeWidth="0.5" opacity="0.4" />
        </g>
      )}

      {/* 顶部/底部装饰条 - 单条 path 替代两条 line */}
      <line x1="20" y1="22" x2="180" y2="22" stroke="url(#goldLine)" strokeWidth="0.8" />
      <line x1="20" y1="298" x2="180" y2="298" stroke="url(#goldLine)" strokeWidth="0.8" />

      {/* 中心徽印 - 合并为一个 group */}
      <g transform="translate(100, 160)" filter={withGlow ? 'url(#glow)' : undefined}>
        <circle r="58" fill="none" stroke="#d4af37" strokeWidth="0.8" opacity="0.5" />
        <circle r="48" fill="none" stroke="#d4af37" strokeWidth="0.5" opacity="0.4" />
        <circle r="32" fill="url(#centerOrb)" opacity="0.85" />
        <circle r="32" fill="none" stroke="#d4af37" strokeWidth="0.8" />
        {/* 月相 + 五角星 合并为单 group */}
        <g>
          <circle r="20" fill="#f4d03f" opacity="0.15" />
          <path d="M -6 -8 A 12 12 0 1 0 -6 8 A 9 9 0 1 1 -6 -8 Z" fill="#0a0824" opacity="0.6" />
          <polygon
            points="0,-12 3,-4 11,-4 5,1 7,9 0,5 -7,9 -5,1 -11,-4 -3,-4"
            fill="#f4d03f"
            opacity="0.9"
          />
        </g>
      </g>

      {/* 四角小符文 - 单 path + 4 个 use 替代 4 个独立 group */}
      <g fill="#d4af37" opacity="0.6">
        <circle cx="18" cy="18" r="3" />
        <circle cx="182" cy="18" r="3" />
        <circle cx="18" cy="302" r="3" />
        <circle cx="182" cy="302" r="3" />
      </g>

      {/* 顶部铭文 */}
      <text
        x="100"
        y="40"
        textAnchor="middle"
        fontFamily="Cinzel, serif"
        fontSize="7"
        letterSpacing="2"
        fill="#d4af37"
        opacity="0.7"
      >
        ✦ MYSTIC TAROT ✦
      </text>

      {/* 底部符文 */}
      <text
        x="100"
        y="285"
        textAnchor="middle"
        fontFamily="serif"
        fontSize="9"
        fill="#d4af37"
        opacity="0.6"
      >
        ✧ ☽ ✧
      </text>

      {/* 中心上下六芒星 - 合并为 path */}
      <g opacity="0.5" stroke="#d4af37" fill="none" strokeWidth="0.6">
        <path d="M 100,104 l 5,3 l 0,6 l -5,3 l -5,-3 l 0,-6 z" />
        <path d="M 100,110 l 5,3 l 0,-3 l -5,-3 l -5,3 l 0,3 z" />
        <path d="M 100,210 l 5,3 l 0,6 l -5,3 l -5,-3 l 0,-6 z" />
        <path d="M 100,216 l 5,3 l 0,-3 l -5,-3 l -5,3 l 0,3 z" />
      </g>
    </svg>
  );
}
