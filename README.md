# 塔罗秘境 · Mystic Tarot

> 沉浸式在线塔罗占卜体验 · 78 张完整塔罗牌图鉴 · 单张 / 三张 / 凯尔特十字牌阵

线上访问：[taluopai.tbit.xin](https://taluopai.tbit.xin)

## ✦ 特性

- **3 种经典牌阵**：单张牌阵 / 三牌阵（过去·现在·未来）/ 凯尔特十字（10 张深度剖析）
- **完整 78 张塔罗牌**：22 张大阿尔卡那 + 56 张小阿尔卡那，每张含正位 / 逆位、爱情 / 事业 / 财运三维解读
- **沉浸式仪式流程**：冥想 → 洗牌 → 选牌 → 翻牌，每一步配有精心编排的动画
- **动态视觉效果**：Canvas 星空粒子、流星、星云、能量漩涡、符文雨、传送门等 10 种特效组件
- **塔罗图鉴**：支持搜索、元素筛选、正逆位切换与详情弹层
- **历史记录**：自动保存最近 20 次占卜，支持回看与删除
- **一键生成分享海报**：白天 / 黑夜双主题、竖屏 / 横屏双方向，支持单牌、三牌、凯尔特十字三种布局
- **完全响应式**：桌面 / 平板 / 手机自适应
- **静态部署**：纯静态产物，可托管于 EdgeOne Pages / Vercel / Netlify 等任意静态托管平台

## ✦ 技术栈

- **React 18** + **TypeScript 5.8** + **Vite 6**
- **Tailwind CSS 3** + 自定义设计系统
- **Framer Motion 12** — 复杂编排动画
- **Zustand 5** — 状态管理（含 localStorage 持久化）
- **React Router 7** — HashRouter 路由（兼容纯静态部署，无需服务端 fallback）
- **html-to-image** — DOM 节点转 PNG 生成分享海报
- **Lucide React** — 图标
- **clsx** + **tailwind-merge** — 条件类名合并

## ✦ 本地开发

项目同时提供 `package-lock.json` 与 `pnpm-lock.yaml`，npm 与 pnpm 均可使用。以下以 npm 为例：

```bash
npm install
npm run dev          # 启动开发服务器，默认 http://localhost:5173
npm run build        # 类型检查 + 生产构建，输出到 dist/
npm run preview      # 本地预览生产构建
npm run check        # 仅运行 TypeScript 类型检查（tsc -b --noEmit）
npm run lint         # ESLint 检查
```

> 若使用 pnpm，将 `npm install` / `npm run xxx` 替换为 `pnpm install` / `pnpm xxx` 即可。

## ✦ 部署到 EdgeOne Pages

项目根目录已包含 `edgeone.json` 配置（项目名 `mystic-tarot`，构建命令 `pnpm build`，输出目录 `dist`，Node 版本 `20.18.0`）。

### 方式一：CLI 部署

```bash
npm install -g edgeone
pnpm build
edgeone pages deploy dist --name mystic-tarot
```

### 方式二：连接 Git 仓库自动部署

1. 在 [EdgeOne 控制台](https://console.cloud.tencent.com/edgeone) 创建 Pages 项目并连接 Git 仓库
2. 构建配置参考 `edgeone.json`：构建命令 `pnpm build`，输出目录 `dist`，Node 版本 `20.18.0`
3. 推送代码到默认分支即自动触发部署

### 方式三：手动上传

1. 运行 `pnpm build` 生成 `dist/` 目录
2. 在 EdgeOne Pages 控制台选择「上传部署」，拖入 `dist/` 目录

### SPA 路由说明

本项目使用 **HashRouter**（URL 形如 `/#/reading`），路由信息位于 hash 段，刷新任意页面均能正常工作，无需配置服务端 fallback 规则。

## ✦ 项目结构

```
src/
├── pages/                # 页面
│   ├── Home.tsx          # 首页：Hero + 牌阵选择
│   ├── Reading.tsx       # 占卜流程：冥想→洗牌→选牌→翻牌→解读
│   ├── Result.tsx        # 解读结果
│   ├── Tarot.tsx         # 78 张图鉴
│   └── History.tsx       # 历史记录
├── components/
│   ├── layout/           # 布局：Navbar / Footer / PageLayout / ThemeToggle / ErrorBoundary
│   ├── effects/          # 视觉特效：Starfield / MysticRing / EnergyVortex / Portal / RuneShower 等 10 个
│   └── tarot/            # 塔罗组件：TarotCard / ShareCardModal / CardOfTheDay / DirectAnswer / ActionPlan 等
├── data/
│   ├── tarotCards.ts             # 78 张塔罗牌完整数据
│   ├── tarotMajorExtended.ts     # 22 张大阿尔卡那扩展解读
│   ├── spreads.ts                # 牌阵定义
│   └── questionThemes.ts         # 问题主题（感情 / 事业 / 财运 / 学业 / 健康）
├── store/                # Zustand 状态：useReadingStore / useHistoryStore / selectors
├── hooks/                # useIsMobile / useTheme
├── lib/                  # interpretation.ts（解读引擎）/ utils.ts
├── utils/                # shuffle.ts（洗牌算法）
└── types/                # TypeScript 类型定义
```

## ✦ 海报分享与下载

在解读结果页点击「生成分享海报」即可将本次占卜凝练为一张可分享图片，支持白天 / 黑夜、竖屏 / 横屏组合，并按牌数自动切换布局。

下载逻辑按设备分流：

- **桌面端**：优先调用 `showSaveFilePicker`（Chrome / Edge）弹出系统「另存为」对话框；不支持的浏览器（Firefox / Safari）回退到 `<a download>` 直接下载。
- **移动端**：点击「保存图片」后 `window.open` 打开新窗口，窗口内展示海报与「点击下载到手机」按钮，由用户手动点击触发下载；同时提示「如果无法下载，请更换浏览器」，并支持长按图片「保存到相册」作为兜底。

移动端统一采用新窗口 + 手动下载方案，规避了夸克、QQ、UC 等浏览器对 `blob:` 下载与程序化 `<a download>` 的拦截，是目前跨浏览器兼容性最好的模式。

## ✦ 浏览器兼容

- Chrome / Edge ≥ 90
- Safari ≥ 14
- Firefox ≥ 88
- 移动端 iOS Safari / Chrome Android / 主流国产浏览器（夸克、QQ、UC 等）

## ✦ 免责声明

本站所有塔罗解读仅供**娱乐与自我反思**，不构成任何专业建议（医疗、法律、财务等）。请结合现实与理性做出重要决定。

## ✦ 致谢

- 78 张塔罗牌释义参考经典 Rider-Waite 体系
- 字体：Google Fonts（Cinzel / Cormorant Garamond / Noto Serif SC）
- 图标：Lucide

---

✦ *愿星辰指引你的道路* ✦
