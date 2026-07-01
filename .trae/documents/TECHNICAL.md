# 塔罗秘境 · 技术架构文档

## 1. 架构设计

```
┌─────────────────────────────────────────────────┐
│                  浏览器客户端                      │
├─────────────────────────────────────────────────┤
│  React 18 + Vite + TypeScript                    │
│  ├─ 路由层 (React Router v6)                    │
│  ├─ 页面层 (Pages)                              │
│  ├─ 组件层 (Components)                         │
│  ├─ 状态层 (Zustand)                            │
│  ├─ 工具层 (Utils / Hooks)                      │
│  └─ 样式层 (Tailwind CSS + 自定义 CSS)          │
├─────────────────────────────────────────────────┤
│  静态资源: 78 张塔罗牌 SVG / 字体 / 图标          │
└─────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────┐
│           EdgeOne Pages 静态托管                  │
│  (CDN 加速 + 全球边缘节点)                        │
└─────────────────────────────────────────────────┘
```

## 2. 技术选型

- **前端框架**：React@18 + TypeScript
- **构建工具**：Vite@5
- **样式方案**：Tailwind CSS@3 + CSS Modules（用于关键帧动画）
- **路由**：React Router v6（`HashRouter`，兼容 EdgeOne Pages 静态部署）
- **状态管理**：Zustand（占卜状态、历史记录）
- **图标库**：lucide-react
- **字体**：Google Fonts（Cinzel Decorative / Cormorant Garamond / Noto Serif SC / Inter）
- **动效方案**：Framer Motion（复杂编排）+ CSS 关键帧（性能优先）
- **后端**：无（纯静态前端）
- **数据存储**：localStorage（历史记录、用户偏好）
- **数据来源**：本地 JSON 数据文件（78 张塔罗牌内置）

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| `/` | 首页（Hero + 牌阵选择） |
| `/reading` | 占卜流程页（冥想 → 洗牌 → 选牌 → 翻牌） |
| `/result` | 解读结果页 |
| `/tarot` | 塔罗图鉴（78 张牌浏览） |
| `/history` | 历史记录 |

> 使用 `HashRouter` 以兼容 EdgeOne Pages 的静态托管

## 4. 状态管理

```ts
// useReadingStore
interface ReadingState {
  spreadType: 'single' | 'three' | 'celtic' | null
  stage: 'meditation' | 'shuffle' | 'select' | 'reveal' | null
  drawnCards: { card: TarotCard; reversed: boolean; position: number }[]
  question: string
  setSpread: (type) => void
  setStage: (stage) => void
  drawCard: (card, reversed, position) => void
  reset: () => void
}

// useHistoryStore
interface HistoryState {
  records: ReadingRecord[]
  addRecord: (record) => void
  clear: () => void
}
```

## 5. 数据结构

```ts
// 单张塔罗牌
interface TarotCard {
  id: number                       // 0-77
  name: { en: string; cn: string }
  arcana: 'major' | 'minor'
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles'
  number?: number                  // 1-14
  keywords: string[]
  upright: {
    general: string
    love: string
    career: string
    wealth: string
  }
  reversed: {
    general: string
    love: string
    career: string
    wealth: string
  }
  symbol: string                   // 用于 SVG 牌图渲染的描述
  imageId: string                  // 对应 SVG 资源 id
}

// 牌阵位置
interface SpreadPosition {
  index: number
  name: string
  meaning: string
}

// 占卜记录
interface ReadingRecord {
  id: string                       // uuid
  timestamp: number
  spreadType: 'single' | 'three' | 'celtic'
  question: string
  cards: { card: TarotCard; reversed: boolean; position: number }[]
}
```

## 6. 项目结构

```
/workspace
├── .trae/documents/         # 产品/技术文档
├── public/                  # 静态资源
│   ├── cards/               # 78 张塔罗牌 SVG
│   └── fonts/               # 字体文件（可选）
├── src/
│   ├── main.tsx             # 入口
│   ├── App.tsx              # 根组件 + 路由
│   ├── index.css            # 全局样式 + Tailwind
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Reading.tsx
│   │   ├── Result.tsx
│   │   ├── Tarot.tsx
│   │   └── History.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── effects/
│   │   │   ├── Starfield.tsx       # Canvas 星空
│   │   │   ├── ParticleCursor.tsx  # 鼠标粒子拖尾
│   │   │   └── MysticRing.tsx      # 旋转符文圆环
│   │   ├── tarot/
│   │   │   ├── TarotCard.tsx       # 单张 3D 牌
│   │   │   ├── CardBack.tsx        # 牌背
│   │   │   ├── CardFan.tsx         # 扇形牌阵
│   │   │   ├── CardStack.tsx       # 牌堆
│   │   │   └── SpreadLayout.tsx    # 牌位布局
│   │   └── ui/
│   │       ├── GlowButton.tsx
│   │       ├── GlassPanel.tsx
│   │       └── SacredDivider.tsx
│   ├── data/
│   │   ├── tarotCards.ts     # 78 张牌完整数据
│   │   └── spreads.ts        # 牌阵位置定义
│   ├── store/
│   │   ├── useReadingStore.ts
│   │   └── useHistoryStore.ts
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   └── useShuffle.ts
│   ├── utils/
│   │   ├── shuffle.ts        # 洗牌算法
│   │   └── cn.ts             # className 合并
│   └── types/
│       └── index.ts
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
└── edgeone.json              # EdgeOne 部署配置（可选）
```

## 7. 部署流程（EdgeOne Pages）

1. `pnpm build` 生成 `dist/` 目录
2. 将 `dist/` 目录上传至 EdgeOne Pages 静态托管
3. **SPA 路由配置**：因使用 HashRouter，无需 fallback 路由配置
4. **自定义域名**：可在 EdgeOne 控制台绑定
5. **HTTPS**：EdgeOne 默认自动签发证书

## 8. 性能与兼容

- **首屏优化**：路由懒加载（`React.lazy` 仅用于非首屏页面）；关键 CSS 内联
- **Canvas 星空**：使用 `requestAnimationFrame` 自适应降帧（移动端 30fps）
- **SVG 优化**：每张牌 SVG 控制在 4KB 以内，启用 GZIP
- **字体加载**：`font-display: swap`，关键显示字体 preload
- **图片响应式**：使用 `srcset` + 视口断点
- **触摸优化**：禁用 `touch-action: none` 在牌面区域以避免误触
- **降级策略**：当 `prefers-reduced-motion: reduce` 时禁用粒子与翻牌动画，仅保留淡入
