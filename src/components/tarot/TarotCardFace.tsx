import type { TarotCard as TarotCardType, Suit } from '@/types';
import { ELEMENT_THEMES, SUIT_THEMES } from '@/data/tarotCards';
import CardBack from './CardBack';

interface TarotCardProps {
  card?: TarotCardType;
  width?: number;
  height?: number;
  className?: string;
  showBack?: boolean;
  reversed?: boolean;
  noText?: boolean; // 用于图鉴缩略
}

const SUIT_GLYPHS: Record<Suit, string> = {
  wands: '🜂',
  cups: '🜄',
  swords: '🜁',
  pentacles: '🜃',
};

const MAJOR_GLYPHS: Record<number, string> = {
  0: '🌌', 1: '🜍', 2: '🌙', 3: '👑', 4: '♈', 5: '⚜',
  6: '💕', 7: '⚔', 8: '🦁', 9: '🏮', 10: '☸', 11: '⚖',
  12: '🝎', 13: '💀', 14: '⚖', 15: '😈', 16: '🗼', 17: '⭐',
  18: '🌕', 19: '☀', 20: '📯', 21: '🌍',
};

/**
 * 单张塔罗牌的渲染 - 牌图采用符号化设计
 */
export default function TarotCardFace({
  card,
  width = 200,
  height = 320,
  className = '',
  showBack = false,
  reversed = false,
  noText = false,
}: TarotCardProps) {
  if (showBack || !card) {
    return (
      <CardBack
        width={width}
        height={height}
        className={className}
      />
    );
  }

  const isMajor = card.arcana === 'major';
  const suit = card.suit;
  const theme = isMajor
    ? ELEMENT_THEMES['spirit']
    : suit
    ? SUIT_THEMES[suit]
    : ELEMENT_THEMES['spirit'];

  const accentColor = isMajor
    ? '#d4af37'
    : suit === 'wands'
    ? '#ff6b35'
    : suit === 'cups'
    ? '#4cc9f0'
    : suit === 'swords'
    ? '#c0c0d6'
    : '#d4af37';

  // 大阿尔卡那序号显示为罗马数字
  const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
    'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];
  const cardNumber = isMajor
    ? romanNumerals[card.id]
    : card.number
    ? String(card.number)
    : '?';

  // 中央图案符号
  const centerGlyph = isMajor
    ? MAJOR_GLYPHS[card.id] || '✦'
    : SUIT_GLYPHS[suit as Suit] || '✦';

  // 装饰图案 - 大小阿尔卡那不同
  const decoration = isMajor
    ? getMajorDecoration()
    : getMinorDecoration(suit as Suit, card.number || 1);

  return (
    <svg
      viewBox="0 0 200 320"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: reversed ? 'rotate(180deg)' : undefined }}
    >
      <defs>
        <linearGradient id={`bg-${card.id}-${width}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a0f3d" />
          <stop offset="50%" stopColor="#0a0824" />
          <stop offset="100%" stopColor="#0a0824" />
        </linearGradient>
        <radialGradient id={`center-${card.id}-${width}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.7" />
          <stop offset="60%" stopColor={accentColor} stopOpacity="0.15" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`goldLine-${card.id}-${width}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0" />
          <stop offset="50%" stopColor={accentColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </linearGradient>
        <filter id={`glow-${card.id}-${width}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* 背景 */}
      <rect width="200" height="320" rx="14" fill={`url(#bg-${card.id}-${width})`} />

      {/* 装饰性背景纹理 */}
      <g opacity="0.08" stroke={accentColor} strokeWidth="0.4" fill="none">
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`hl-${i}`} x1="0" y1={16 * i} x2="200" y2={16 * i} />
        ))}
      </g>

      {/* 外层金色边框 */}
      <rect
        x="6"
        y="6"
        width="188"
        height="308"
        rx="10"
        fill="none"
        stroke={accentColor}
        strokeWidth="1.2"
        opacity="0.7"
      />
      <rect
        x="10"
        y="10"
        width="180"
        height="300"
        rx="7"
        fill="none"
        stroke={accentColor}
        strokeWidth="0.5"
        opacity="0.4"
      />

      {/* 顶部装饰条 */}
      <line x1="20" y1="22" x2="180" y2="22" stroke={`url(#goldLine-${card.id}-${width})`} strokeWidth="0.8" />
      <line x1="20" y1="298" x2="180" y2="298" stroke={`url(#goldLine-${card.id}-${width})`} strokeWidth="0.8" />

      {/* 顶部 - 序号 + 花色/特殊符号 */}
      <g transform="translate(100, 45)">
        {/* 大阿尔卡那显示罗马数字 */}
        {isMajor ? (
          <text
            textAnchor="middle"
            fontFamily="Cinzel, serif"
            fontSize="13"
            fontWeight="700"
            fill={accentColor}
            letterSpacing="1"
            opacity="0.9"
          >
            {cardNumber}
          </text>
        ) : (
          <text
            textAnchor="middle"
            fontFamily="Cinzel, serif"
            fontSize="11"
            fontWeight="700"
            fill={accentColor}
            opacity="0.9"
          >
            {cardNumber}
          </text>
        )}
      </g>

      {/* 顶部左右小角标 */}
      <g transform="translate(22, 36)" opacity="0.7">
        <text
          fontFamily="Cinzel, serif"
          fontSize="7"
          fill={accentColor}
          textAnchor="middle"
        >
          {isMajor ? romanNumerals[card.id] : card.number}
        </text>
      </g>
      <g transform="translate(178, 36)" opacity="0.7">
        <text
          fontFamily="Cinzel, serif"
          fontSize="7"
          fill={accentColor}
          textAnchor="middle"
        >
          {isMajor ? romanNumerals[card.id] : card.number}
        </text>
      </g>

      {/* 中央圆形光晕 */}
      <circle cx="100" cy="160" r="65" fill={`url(#center-${card.id}-${width})`} />

      {/* 中央圆形边框 */}
      <circle
        cx="100"
        cy="160"
        r="62"
        fill="none"
        stroke={accentColor}
        strokeWidth="0.8"
        opacity="0.6"
      />
      <circle
        cx="100"
        cy="160"
        r="56"
        fill="none"
        stroke={accentColor}
        strokeWidth="0.4"
        opacity="0.4"
      />

      {/* 中央图案 - 符号化设计 */}
      <g transform="translate(100, 160)">
        {/* 主要符号 */}
        <text
          textAnchor="middle"
          fontSize="48"
          fill={accentColor}
          opacity="0.95"
          filter={`url(#glow-${card.id}-${width})`}
        >
          {centerGlyph}
        </text>
        <text
          textAnchor="middle"
          fontSize="48"
          fill={accentColor}
          opacity="0.95"
        >
          {centerGlyph}
        </text>

        {/* 围绕中央的小符文 */}
        <g opacity="0.6">
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * 50;
            const y = Math.sin(angle) * 50;
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize="6"
                fill={accentColor}
                transform={`rotate(${(angle * 180) / Math.PI + 90}, ${x}, ${y})`}
              >
                ✦
              </text>
            );
          })}
        </g>
      </g>

      {/* 牌面装饰图形 */}
      {decoration}

      {/* 牌名 - 顶部 */}
      {!noText && (
        <text
          x="100"
          y="78"
          textAnchor="middle"
          fontFamily="'Noto Serif SC', serif"
          fontSize="11"
          fontWeight="600"
          fill="#f4d03f"
          opacity="0.95"
          letterSpacing="1"
        >
          {card.name.cn.length > 6 ? card.name.cn.slice(0, 6) : card.name.cn}
        </text>
      )}

      {/* 牌名 - 底部 */}
      {!noText && (
        <text
          x="100"
          y="278"
          textAnchor="middle"
          fontFamily="'Noto Serif SC', serif"
          fontSize="11"
          fontWeight="600"
          fill="#f4d03f"
          opacity="0.95"
          letterSpacing="1"
        >
          {card.name.cn.length > 6 ? card.name.cn.slice(0, 6) : card.name.cn}
        </text>
      )}

      {/* 英文名（小） */}
      {!noText && (
        <text
          x="100"
          y="89"
          textAnchor="middle"
          fontFamily="Cinzel, serif"
          fontSize="5"
          fill={accentColor}
          opacity="0.7"
          letterSpacing="0.5"
        >
          {card.name.en.toUpperCase()}
        </text>
      )}

      {/* 底部花色或特殊符号 */}
      <g transform="translate(100, 264)" opacity="0.6">
        <text
          textAnchor="middle"
          fontSize="10"
          fill={accentColor}
        >
          {isMajor ? '✦' : SUIT_GLYPHS[suit as Suit]}
        </text>
      </g>

      {/* 四角装饰圆点 */}
      {[
        { x: 18, y: 18 },
        { x: 182, y: 18 },
        { x: 18, y: 302 },
        { x: 182, y: 302 },
      ].map((pos, i) => (
        <g key={i} transform={`translate(${pos.x}, ${pos.y})`}>
          <circle r="2.5" fill={accentColor} opacity="0.7" />
          <circle r="1" fill="#f4d03f" opacity="0.9" />
        </g>
      ))}

      {/* 元素标识 - 底部 */}
      <g transform="translate(100, 252)">
        <text
          textAnchor="middle"
          fontFamily="Cinzel, serif"
          fontSize="6"
          fill={accentColor}
          opacity="0.7"
          letterSpacing="1"
        >
          {isMajor ? '✦ MAJOR ARCANA ✦' : `✦ ${theme.name} ✦`}
        </text>
      </g>
    </svg>
  );
}

function getMajorDecoration() {
  // 大阿尔卡那的特殊装饰
  return (
    <g opacity="0.4" stroke="#d4af37" strokeWidth="0.3" fill="none">
      {/* 顶部新月 */}
      <path d="M 85 105 A 8 8 0 0 0 85 121 A 6 6 0 0 1 85 105 Z" fill="#d4af37" opacity="0.3" />
      {/* 底部太阳 */}
      <circle cx="100" cy="215" r="6" />
      <g>
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={100 + Math.cos(angle) * 7}
              y1={215 + Math.sin(angle) * 7}
              x2={100 + Math.cos(angle) * 10}
              y2={215 + Math.sin(angle) * 10}
            />
          );
        })}
      </g>
      {/* 左右菱形装饰 */}
      <rect x="20" y="155" width="6" height="6" transform="rotate(45, 23, 158)" />
      <rect x="174" y="155" width="6" height="6" transform="rotate(45, 177, 158)" />
    </g>
  );
}

function getMinorDecoration(suit: Suit, num: number) {
  // 小阿尔卡那的图案基于花色
  const element = suit;
  const colors: Record<Suit, string> = {
    wands: '#ff6b35',
    cups: '#4cc9f0',
    swords: '#c0c0d6',
    pentacles: '#d4af37',
  };
  const c = colors[element];

  // 宫廷牌 (11-14) 显示人物剪影
  if (num >= 11) {
    return (
      <g opacity="0.5" fill={c}>
        {/* 头部 */}
        <circle cx="100" cy="125" r="6" />
        {/* 身体 */}
        <path d="M 88 140 L 88 175 L 100 195 L 112 175 L 112 140 Z" fill={c} opacity="0.4" />
        {/* 装饰物 */}
        <circle cx="100" cy="125" r="3" fill="none" stroke={c} strokeWidth="0.5" />
      </g>
    );
  }

  // 数字牌 - 显示对应数量的花色符号
  return (
    <g opacity="0.4">
      {/* 顶部小型花色符号 */}
      <text x="40" y="100" fontSize="10" fill={c} opacity="0.6">✦</text>
      <text x="160" y="100" fontSize="10" fill={c} opacity="0.6">✦</text>
      {/* 底部装饰 */}
      <text x="40" y="225" fontSize="10" fill={c} opacity="0.6">✦</text>
      <text x="160" y="225" fontSize="10" fill={c} opacity="0.6">✦</text>
    </g>
  );
}
