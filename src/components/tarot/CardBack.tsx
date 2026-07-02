interface CardBackProps {
  width?: number;
  height?: number;
  className?: string;
  withGlow?: boolean;
  showBorder?: boolean;
}

/**
 * 统一牌背设计：神秘金色徽印 + 紫黑底色 + 装饰边框
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
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#c0c0d6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#9b59b6" stopOpacity="0" />
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

      {/* 装饰网格 - 微弱 */}
      <g opacity="0.06" stroke="#d4af37" strokeWidth="0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`h-${i}`} x1="0" y1={32 * (i + 1)} x2="200" y2={32 * (i + 1)} />
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={`v-${i}`} x1={28.5 * (i + 1)} y1="0" x2={28.5 * (i + 1)} y2="320" />
        ))}
      </g>

      {/* 外层金色边框 */}
      {showBorder && (
        <>
          <rect
            x="6"
            y="6"
            width="188"
            height="308"
            rx="10"
            fill="none"
            stroke="#d4af37"
            strokeWidth="1.2"
            opacity="0.6"
          />
          <rect
            x="11"
            y="11"
            width="178"
            height="298"
            rx="7"
            fill="none"
            stroke="#d4af37"
            strokeWidth="0.5"
            opacity="0.4"
          />
        </>
      )}

      {/* 顶部装饰条 */}
      <line x1="20" y1="22" x2="180" y2="22" stroke="url(#goldLine)" strokeWidth="0.8" />
      <line x1="20" y1="298" x2="180" y2="298" stroke="url(#goldLine)" strokeWidth="0.8" />

      {/* 中心徽印 */}
      <g transform="translate(100, 160)" filter={withGlow ? 'url(#glow)' : undefined}>
        {/* 外圈 */}
        <circle r="58" fill="none" stroke="#d4af37" strokeWidth="0.8" opacity="0.5" />
        <circle r="48" fill="none" stroke="#d4af37" strokeWidth="0.5" opacity="0.4" />

        {/* 中心圆球 */}
        <circle r="32" fill="url(#centerOrb)" opacity="0.85" />
        <circle r="32" fill="none" stroke="#d4af37" strokeWidth="0.8" />

        {/* 月相图案 */}
        <circle r="20" fill="url(#moonGlow)" />
        <path
          d="M -6 -8 A 12 12 0 1 0 -6 8 A 9 9 0 1 1 -6 -8 Z"
          fill="#0a0824"
          opacity="0.6"
        />

        {/* 五角星 */}
        <polygon
          points="0,-12 3,-4 11,-4 5,1 7,9 0,5 -7,9 -5,1 -11,-4 -3,-4"
          fill="#f4d03f"
          opacity="0.9"
        />
      </g>

      {/* 装饰角 - 四角各有一个小符文 */}
      {[
        { x: 18, y: 18 },
        { x: 182, y: 18 },
        { x: 18, y: 302 },
        { x: 182, y: 302 },
      ].map((pos, i) => (
        <g key={i} transform={`translate(${pos.x}, ${pos.y})`}>
          <circle r="3" fill="#d4af37" opacity="0.6" />
        </g>
      ))}

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

      {/* 底部小符文 */}
      <g transform="translate(100, 285)" opacity="0.6">
        <text
          textAnchor="middle"
          fontFamily="serif"
          fontSize="9"
          fill="#d4af37"
        >
          ✧ ☽ ✧
        </text>
      </g>

      {/* 中心小六芒星装饰 */}
      <g transform="translate(100, 110)" opacity="0.5" stroke="#d4af37" fill="none" strokeWidth="0.6">
        <polygon points="0,-6 5,-3 5,3 0,6 -5,3 -5,-3" />
        <polygon points="0,6 5,3 5,-3 0,-6 -5,-3 -5,3" />
      </g>
      <g transform="translate(100, 210)" opacity="0.5" stroke="#d4af37" fill="none" strokeWidth="0.6">
        <polygon points="0,-6 5,-3 5,3 0,6 -5,3 -5,-3" />
        <polygon points="0,6 5,3 5,-3 0,-6 -5,-3 -5,3" />
      </g>
    </svg>
  );
}
