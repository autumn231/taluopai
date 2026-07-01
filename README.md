# 塔罗秘境 · Mystic Tarot

> 沉浸式在线塔罗占卜体验 · 78 张完整塔罗牌图鉴 · 单张 / 三张 / 凯尔特十字牌阵

## ✦ 特性

- **3 种经典牌阵**：单张牌阵 / 三张牌阵（过去·现在·未来）/ 凯尔特十字（10 张深度剖析）
- **完整 78 张塔罗牌**：22 张大阿尔卡那 + 56 张小阿尔卡那，每张含正位/逆位、爱情/事业/财运三维解读
- **沉浸式仪式体验**：冥想 → 洗牌 → 选牌 → 翻牌，每一步精心设计的动画
- **炫酷动态效果**：Canvas 星空粒子、流星、星云、鼠标引力牵引、3D 翻牌
- **塔罗图鉴**：搜索、筛选、详情弹层
- **历史记录**：自动保存最近 20 次占卜
- **完全响应式**：桌面 / 平板 / 手机完美适配
- **静态部署**：纯静态构建，可部署在任何 CDN/EdgeOne Pages / Vercel / Netlify

## ✦ 技术栈

- **React 18** + **TypeScript** + **Vite 6**
- **Tailwind CSS 3** + 自定义设计系统
- **Framer Motion** - 复杂编排动画
- **Zustand** - 状态管理（含 localStorage 持久化）
- **React Router v6** - HashRouter 路由（兼容静态部署）
- **Lucide React** - 图标

## ✦ 本地开发

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # 输出到 dist/
pnpm preview      # 预览生产构建
```

## ✦ 部署到 EdgeOne Pages

### 方式一：CLI 部署

```bash
# 安装 EdgeOne CLI
npm install -g edgeone

# 构建并部署
pnpm build
edgeone pages deploy dist --name mystic-tarot
```

### 方式二：控制台部署

1. 在 [EdgeOne 控制台](https://console.cloud.tencent.com/edgeone) 创建 Pages 项目
2. 连接 Git 仓库，设置构建命令：
   - 构建命令：`pnpm build`
   - 输出目录：`dist`
   - Node 版本：`20`
3. 推送代码即可自动部署

### 方式三：手动上传

1. 运行 `pnpm build` 生成 `dist/` 目录
2. 在 EdgeOne Pages 控制台选择"上传部署"
3. 拖入 `dist/` 目录

### SPA 路由说明

本项目使用 **HashRouter**（如 `/#/reading`），无需配置 fallback 路由，部署后刷新任意页面均能正常工作。

## ✦ 项目结构

```
src/
├── pages/                # 页面
│   ├── Home.tsx         # 首页 - Hero + 牌阵选择
│   ├── Reading.tsx      # 占卜流程 - 5 个阶段
│   ├── Result.tsx       # 解读结果
│   ├── Tarot.tsx        # 78 张图鉴
│   └── History.tsx      # 历史记录
├── components/
│   ├── layout/          # 布局（Navbar / Footer / PageLayout）
│   ├── effects/         # 视觉效果（Starfield / MysticRing）
│   └── tarot/           # 塔罗牌组件
├── data/
│   ├── tarotCards.ts    # 78 张塔罗牌完整数据
│   └── spreads.ts       # 牌阵定义
├── store/               # Zustand 状态
└── types/               # TypeScript 类型
```

## ✦ 浏览器兼容

- Chrome / Edge ≥ 90
- Safari ≥ 14
- Firefox ≥ 88
- 移动端 iOS Safari / Chrome Android

## ✦ 免责声明

本站所有塔罗解读仅供**娱乐与自我反思**，不构成任何专业建议（医疗、法律、财务等）。
请结合现实与理性做出重要决定。

## ✦ 致谢

- 78 张塔罗牌的释义参考经典 Rider-Waite 体系
- 字体：Google Fonts（Cinzel / Cormorant Garamond / Noto Serif SC）
- 图标：Lucide

---

✦ *愿星辰指引你的道路* ✦
