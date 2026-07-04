import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { X, Download, Loader2, ImageDown, Check, Sun, Moon, Smartphone, Monitor } from 'lucide-react';
import type { DrawnCard, SpreadPosition } from '@/types';
import type { QuestionTheme } from '@/data/questionThemes';
import type {
  DirectAnswer as DirectAnswerType,
  ActionItem,
  Verdict,
} from '@/lib/interpretation';

// === 海报样式（黑夜 / 白天） ===
type PosterStyle = 'dark' | 'light';
// === 海报方向（竖屏 / 横屏） ===
type PosterOrientation = 'portrait' | 'landscape';

// === 色板定义 ===
interface Palette {
  bg0: string;
  bg1: string;
  bg2: string;
  gold: string;
  lightgold: string;
  textStrong: string;
  textBase: string;
  textSoft: string;
  textMute: string;
  border: string;
  borderSoft: string;
  panel: string;
  emerald: string;
  rose: string;
  amber: string;
  /** 装饰光晕颜色 */
  glowGold: string;
  glowAccent: string;
  /** 进度条底色 */
  barTrack: string;
  /** 分隔线颜色 */
  divider: string;
}

const DARK_PALETTE: Palette = {
  bg0: '#050314',
  bg1: '#0e0828',
  bg2: '#1a0f3d',
  gold: '#d4af37',
  lightgold: '#f4d03f',
  textStrong: '#f5f3ff',
  textBase: '#e8e4f3',
  textSoft: '#c4b8d8',
  textMute: '#9a82bf',
  border: 'rgba(212, 175, 55, 0.3)',
  borderSoft: 'rgba(212, 175, 55, 0.15)',
  panel: 'rgba(30, 18, 64, 0.55)',
  emerald: '#34d399',
  rose: '#fb7185',
  amber: '#eab308',
  glowGold: 'rgba(212,175,55,0.12)',
  glowAccent: 'rgba(110,78,163,0.15)',
  barTrack: 'rgba(255,255,255,0.08)',
  divider: 'rgba(212, 175, 55, 0.3)',
};

const LIGHT_PALETTE: Palette = {
  bg0: '#f5f0e6',
  bg1: '#faf6ee',
  bg2: '#efe6d4',
  gold: '#a67c00',
  lightgold: '#8a6500',
  textStrong: '#2d2410',
  textBase: '#4a3f28',
  textSoft: '#6b5d40',
  textMute: '#9a8a66',
  border: 'rgba(166, 124, 0, 0.35)',
  borderSoft: 'rgba(166, 124, 0, 0.18)',
  panel: 'rgba(255, 250, 240, 0.7)',
  emerald: '#2d8659',
  rose: '#c0392b',
  amber: '#b8860b',
  glowGold: 'rgba(166,124,0,0.08)',
  glowAccent: 'rgba(180,140,80,0.1)',
  barTrack: 'rgba(74, 63, 40, 0.1)',
  divider: 'rgba(166, 124, 0, 0.3)',
};

const VERDICT_COLOR_KEY: Record<Verdict, keyof Palette> = {
  positive: 'emerald',
  cautious: 'rose',
  neutral: 'amber',
};

const VERDICT_LABEL: Record<Verdict, string> = {
  positive: '倾向明朗',
  cautious: '需谨慎',
  neutral: '能量待定',
};

const ACTION_ICON: Record<ActionItem['kind'], string> = {
  advice: '✦',
  warning: '⚠',
  timing: '⏳',
  theme: '✧',
};

const ACTION_LABEL: Record<ActionItem['kind'], string> = {
  advice: '此刻最该做',
  warning: '需要留意',
  timing: '时机提示',
  theme: '塔罗师叮嘱',
};

// === 尺寸 ===
const PORTRAIT_W = 750;
const PORTRAIT_H = 1334;
const LANDSCAPE_W = 1334;
const LANDSCAPE_H = 750;

// === 字号层次体系 ===
// 分三个视觉层级：
//   L1 焦点：品牌/问题/牌名/直接回应/域名 —— 最大字号、强对比、金色或最强文本色
//   L2 主体：section 标签/行动指引/解读/收束语/能量数字 —— 中等字号、主要内容
//   L3 辅助：日期/位置名/正逆位/关键词/箴言/CTA 提示 —— 小字号、柔和色
interface Typo {
  // L1 焦点
  brand: number;
  question: number;
  cardName: number;
  headline: number;
  domain: number;
  // L2 主体
  sectionTag: number;
  actionDetail: number;
  reasoning: number;
  verdict: number;
  closingText: number;
  energyCount: number;
  energyBarValue: number;
  // L3 辅助
  date: number;
  posName: number;
  cardMeta: number;
  keywords: number;
  energyLabel: number;
  energyPct: number;
  energyBarLabel: number;
  epilogue: number;
  ctaHint: number;
}

const TYPO_PORTRAIT: Typo = {
  brand: 30,
  question: 26,
  cardName: 24,
  headline: 24,
  domain: 22,
  sectionTag: 18,
  actionDetail: 20,
  reasoning: 19,
  verdict: 20,
  closingText: 22,
  energyCount: 18,
  energyBarValue: 18,
  date: 16,
  posName: 15,
  cardMeta: 15,
  keywords: 15,
  energyLabel: 16,
  energyPct: 14,
  energyBarLabel: 15,
  epilogue: 15,
  ctaHint: 14,
};

const TYPO_LANDSCAPE: Typo = {
  brand: 26,
  question: 22,
  cardName: 20,
  headline: 20,
  domain: 18,
  sectionTag: 15,
  actionDetail: 17,
  reasoning: 16,
  verdict: 17,
  closingText: 18,
  energyCount: 15,
  energyBarValue: 15,
  date: 13,
  posName: 12,
  cardMeta: 12,
  keywords: 12,
  energyLabel: 13,
  energyPct: 11,
  energyBarLabel: 12,
  epilogue: 12,
  ctaHint: 11,
};

/** 截断文本到指定字数 */
function truncate(text: string, max: number): string {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

export interface ShareCardData {
  question: string;
  drawnCards: DrawnCard[];
  positions: SpreadPosition[];
  spreadName: string;
  theme: QuestionTheme;
  directAnswer: DirectAnswerType;
  actionPlan: ActionItem[];
  closingText: string;
}

interface ShareCardModalProps extends ShareCardData {
  open: boolean;
  onClose: () => void;
}

export default function ShareCardModal({
  open,
  onClose,
  ...data
}: ShareCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [posterStyle, setPosterStyle] = useState<PosterStyle>('dark');
  const [orientation, setOrientation] = useState<PosterOrientation>('portrait');

  const palette = posterStyle === 'dark' ? DARK_PALETTE : LIGHT_PALETTE;
  const isPortrait = orientation === 'portrait';
  const posterW = isPortrait ? PORTRAIT_W : LANDSCAPE_W;
  const posterH = isPortrait ? PORTRAIT_H : LANDSCAPE_H;

  // 预览宽度：竖屏窄一点，横屏宽一点
  const previewW = isPortrait ? 280 : 380;
  const shareScale = previewW / posterW;

  // 重置状态
  useEffect(() => {
    if (open) {
      setStatus('idle');
      setDataUrl(null);
    }
  }, [open]);

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // 锁定背景滚动
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  const handleGenerate = useCallback(async () => {
    const node = cardRef.current;
    if (!node) return;
    setStatus('generating');
    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      await new Promise((r) => setTimeout(r, 120));
      const url = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        width: posterW,
        height: posterH,
        backgroundColor: palette.bg0,
        style: { transform: 'none', margin: '0' },
      });
      setDataUrl(url);
      setStatus('done');
    } catch (err) {
      console.error('生成图片失败', err);
      setStatus('error');
    }
  }, [posterW, posterH, palette.bg0]);

  const handleDownload = useCallback(() => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    link.download = `塔罗占卜_${date}.png`;
    link.href = dataUrl;
    link.click();
  }, [dataUrl]);

  // 切换样式/方向时清除已生成结果
  useEffect(() => {
    if (status === 'done') {
      setDataUrl(null);
      setStatus('idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posterStyle, orientation]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(5, 3, 20, 0.85)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-mystic-gold/15"
            style={{
              backgroundColor: 'rgba(30, 18, 64, 0.6)',
              border: `1px solid ${DARK_PALETTE.border}`,
              color: DARK_PALETTE.textSoft,
            }}
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>

          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto no-scrollbar rounded-2xl"
            style={{
              backgroundColor: DARK_PALETTE.bg1,
              border: `1px solid ${DARK_PALETTE.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题栏 */}
            <div
              className="flex items-center gap-2 px-5 py-3.5 sticky top-0 z-10"
              style={{
                borderBottom: `1px solid ${DARK_PALETTE.borderSoft}`,
                backgroundColor: DARK_PALETTE.bg1,
              }}
            >
              <ImageDown className="w-4 h-4" style={{ color: DARK_PALETTE.lightgold }} />
              <span
                className="font-title text-sm tracking-widest"
                style={{ color: DARK_PALETTE.lightgold }}
              >
                生成分享海报
              </span>
            </div>

            <div className="flex flex-col lg:flex-row gap-5 p-5">
              {/* 左侧：海报预览（实际被截图的节点） */}
              <div className="flex-shrink-0 mx-auto lg:mx-0 flex items-start justify-center">
                <div
                  className="origin-top-left overflow-hidden rounded-lg"
                  style={{ width: previewW, height: previewW * (posterH / posterW) }}
                >
                  <div
                    style={{
                      width: posterW,
                      height: posterH,
                      transform: `scale(${shareScale})`,
                      transformOrigin: 'top left',
                    }}
                  >
                    <ShareCard
                      ref={cardRef}
                      {...data}
                      palette={palette}
                      orientation={orientation}
                      width={posterW}
                      height={posterH}
                    />
                  </div>
                </div>
              </div>

              {/* 右侧：操作区 */}
              <div className="flex-1 flex flex-col gap-4 min-w-0">
                <div>
                  <h3
                    className="font-display text-xl mb-1.5"
                    style={{ color: DARK_PALETTE.lightgold }}
                  >
                    一键生成分享海报
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: DARK_PALETTE.textSoft }}>
                    选择样式与方向，将本次占卜凝练为精美图片。
                  </p>
                </div>

                {/* === 选项：海报样式 === */}
                <OptionGroup label="海报样式">
                  <OptionButton
                    active={posterStyle === 'dark'}
                    onClick={() => setPosterStyle('dark')}
                    icon={<Moon className="w-3.5 h-3.5" />}
                    label="黑夜"
                  />
                  <OptionButton
                    active={posterStyle === 'light'}
                    onClick={() => setPosterStyle('light')}
                    icon={<Sun className="w-3.5 h-3.5" />}
                    label="白天"
                  />
                </OptionGroup>

                {/* === 选项：海报方向 === */}
                <OptionGroup label="海报方向">
                  <OptionButton
                    active={orientation === 'portrait'}
                    onClick={() => setOrientation('portrait')}
                    icon={<Smartphone className="w-3.5 h-3.5" />}
                    label="竖屏"
                  />
                  <OptionButton
                    active={orientation === 'landscape'}
                    onClick={() => setOrientation('landscape')}
                    icon={<Monitor className="w-3.5 h-3.5" />}
                    label="横屏"
                  />
                </OptionGroup>

                {/* 状态展示 */}
                {status === 'done' && dataUrl && (
                  <div
                    className="rounded-xl p-3 flex items-center gap-2.5"
                    style={{
                      backgroundColor: 'rgba(52, 211, 153, 0.1)',
                      border: '1px solid rgba(52, 211, 153, 0.35)',
                    }}
                  >
                    <Check className="w-4 h-4 shrink-0" style={{ color: DARK_PALETTE.emerald }} />
                    <span className="text-sm" style={{ color: DARK_PALETTE.emerald }}>
                      图片已生成，点击下方按钮保存
                    </span>
                  </div>
                )}
                {status === 'error' && (
                  <div
                    className="rounded-xl p-3 text-sm"
                    style={{
                      backgroundColor: 'rgba(251, 113, 133, 0.1)',
                      border: '1px solid rgba(251, 113, 133, 0.35)',
                      color: DARK_PALETTE.rose,
                    }}
                  >
                    生成失败，请重试。若多次失败，可尝试用截图工具手动截取。
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex flex-col gap-2.5">
                  {status !== 'done' && (
                    <button
                      onClick={handleGenerate}
                      disabled={status === 'generating'}
                      className="w-full py-3 rounded-full font-title text-sm tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{
                        background:
                          status === 'generating'
                            ? DARK_PALETTE.panel
                            : 'linear-gradient(135deg, #f4d03f 0%, #d4af37 100%)',
                        color: status === 'generating' ? DARK_PALETTE.textSoft : '#0a0824',
                        border: `1px solid ${DARK_PALETTE.border}`,
                        cursor: status === 'generating' ? 'wait' : 'pointer',
                      }}
                    >
                      {status === 'generating' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          正在生成…
                        </>
                      ) : (
                        <>
                          <ImageDown className="w-4 h-4" />
                          生成海报
                        </>
                      )}
                    </button>
                  )}
                  {status === 'done' && (
                    <>
                      <button
                        onClick={handleDownload}
                        className="w-full py-3 rounded-full font-title text-sm tracking-widest transition-all flex items-center justify-center gap-2 hover:brightness-110"
                        style={{
                          background: 'linear-gradient(135deg, #f4d03f 0%, #d4af37 100%)',
                          color: '#0a0824',
                          border: `1px solid ${DARK_PALETTE.border}`,
                          cursor: 'pointer',
                        }}
                      >
                        <Download className="w-4 h-4" />
                        保存图片
                      </button>
                      <button
                        onClick={() => {
                          setDataUrl(null);
                          setStatus('idle');
                        }}
                        className="w-full py-2.5 rounded-full font-title text-xs tracking-widest transition-all hover:bg-mystic-gold/10"
                        style={{
                          backgroundColor: 'transparent',
                          color: DARK_PALETTE.textSoft,
                          border: `1px solid ${DARK_PALETTE.borderSoft}`,
                          cursor: 'pointer',
                        }}
                      >
                        重新生成
                      </button>
                    </>
                  )}
                </div>

                {/* 预览缩略图 */}
                {dataUrl && (
                  <div className="mt-1">
                    <div
                      className="text-[10px] font-title tracking-widest mb-1.5"
                      style={{ color: DARK_PALETTE.textMute }}
                    >
                      生成结果预览
                    </div>
                    <img
                      src={dataUrl}
                      alt="占卜海报预览"
                      className="w-full rounded-lg"
                      style={{ border: `1px solid ${DARK_PALETTE.borderSoft}` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// === 选项小组件 ===
function OptionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        className="text-[10px] font-title tracking-widest mb-2"
        style={{ color: DARK_PALETTE.textMute }}
      >
        {label}
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

function OptionButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-2 px-3 rounded-lg text-xs font-title tracking-wider transition-all flex items-center justify-center gap-1.5"
      style={{
        backgroundColor: active ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
        border: `1px solid ${active ? DARK_PALETTE.border : DARK_PALETTE.borderSoft}`,
        color: active ? DARK_PALETTE.lightgold : DARK_PALETTE.textSoft,
        cursor: 'pointer',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// === 元素能量计算 ===
const ELEMENT_META: Record<string, { label: string; icon: string }> = {
  fire: { label: '火', icon: '△' },
  water: { label: '水', icon: '▽' },
  air: { label: '风', icon: '◌' },
  earth: { label: '土', icon: '□' },
  spirit: { label: '灵', icon: '✦' },
};

function computeElementEnergy(cards: DrawnCard[]) {
  const counts: Record<string, number> = {};
  cards.forEach((c) => {
    const e = c.card.element || 'spirit';
    counts[e] = (counts[e] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([el, count]) => ({
      element: el,
      count,
      label: ELEMENT_META[el]?.label || el,
      icon: ELEMENT_META[el]?.icon || '✦',
    }));
}

const SITE_DOMAIN = 'taluopai.tbit.xin';

// === 海报本体 ===
interface ShareCardProps extends ShareCardData {
  palette: Palette;
  orientation: PosterOrientation;
  width: number;
  height: number;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { question, drawnCards, positions, spreadName, theme, directAnswer, actionPlan, closingText, palette, orientation, width, height },
  ref,
) {
  const date = new Date();
  const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  const verdictColor = palette[VERDICT_COLOR_KEY[directAnswer.verdict]];
  const pct = Math.round(((directAnswer.score + 100) / 200) * 100);
  const isPortrait = orientation === 'portrait';
  const typo = isPortrait ? TYPO_PORTRAIT : TYPO_LANDSCAPE;

  const cardStyle: CSSProperties = {
    width,
    height,
    background: `linear-gradient(160deg, ${palette.bg0} 0%, ${palette.bg1} 40%, ${palette.bg2} 100%)`,
    fontFamily: "'Cormorant Garamond', 'Noto Serif SC', serif",
    color: palette.textBase,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div ref={ref} style={cardStyle}>
      {/* 背景装饰光晕 */}
      <Glow top={-120} right={-100} size={360} color={palette.glowGold} />
      <Glow bottom={-80} left={-80} size={300} color={palette.glowAccent} />

      {isPortrait ? (
        <PortraitLayout
          question={question}
          drawnCards={drawnCards}
          positions={positions}
          spreadName={spreadName}
          theme={theme}
          directAnswer={directAnswer}
          actionPlan={actionPlan}
          closingText={closingText}
          palette={palette}
          verdictColor={verdictColor}
          pct={pct}
          dateStr={dateStr}
          typo={typo}
        />
      ) : (
        <LandscapeLayout
          question={question}
          drawnCards={drawnCards}
          positions={positions}
          spreadName={spreadName}
          theme={theme}
          directAnswer={directAnswer}
          actionPlan={actionPlan}
          closingText={closingText}
          palette={palette}
          verdictColor={verdictColor}
          pct={pct}
          dateStr={dateStr}
          typo={typo}
        />
      )}
    </div>
  );
});

// === 竖屏布局 ===
function PortraitLayout({
  question,
  drawnCards,
  positions,
  spreadName,
  theme,
  directAnswer,
  actionPlan,
  closingText,
  palette,
  verdictColor,
  pct,
  dateStr,
  typo,
}: {
  question: string;
  drawnCards: DrawnCard[];
  positions: SpreadPosition[];
  spreadName: string;
  theme: QuestionTheme;
  directAnswer: DirectAnswerType;
  actionPlan: ActionItem[];
  closingText: string;
  palette: Palette;
  verdictColor: string;
  pct: number;
  dateStr: string;
  typo: Typo;
}) {
  const elements = computeElementEnergy(drawnCards);
  const totalCards = drawnCards.length || 1;

  return (
    <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', padding: '44px 42px 0' }}>
      {/* 顶部品牌 —— L1 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: palette.gold, fontSize: typo.brand }}>✦</span>
          <span style={{ fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontSize: typo.brand, letterSpacing: '0.08em', color: palette.lightgold, fontWeight: 600 }}>
            塔罗秘境
          </span>
        </div>
        <span style={{ fontSize: typo.date, color: palette.textMute, fontFamily: "'Inter', sans-serif" }}>
          {dateStr}
        </span>
      </div>

      <Divider palette={palette} />

      {/* 问题 —— L1 焦点 */}
      <Section palette={palette} typo={typo} tag="你所问" marginTop={20} marginBottom={20}>
        <p style={{ fontSize: typo.question, lineHeight: 1.55, color: palette.textStrong, fontStyle: 'italic', fontWeight: 500, margin: '12px 0 0', minHeight: 30 }}>
          {question ? `「${truncate(question, 60)}」` : '— 静心冥想此刻的疑问 —'}
        </p>
        <div style={{
          display: 'inline-block', marginTop: 12, fontSize: typo.date, padding: '5px 16px', borderRadius: 999,
          color: palette.lightgold, border: `1px solid ${palette.border}`, backgroundColor: 'rgba(212,175,55,0.08)',
        }}>
          {theme.label}主题 · {spreadName}
        </div>
      </Section>

      <Divider palette={palette} />

      {/* 牌阵（含关键词） —— 牌名 L1，其余 L3 */}
      <Section palette={palette} typo={typo} tag="你的牌阵" marginTop={20} marginBottom={20}>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {drawnCards.map((c, i) => {
            const pos = positions[c.position];
            return (
              <div key={i} style={{
                flex: '1 1 30%', minWidth: 80, maxWidth: 150, padding: '14px 12px', borderRadius: 12,
                backgroundColor: palette.panel, border: `1px solid ${palette.borderSoft}`, textAlign: 'center',
              }}>
                <div style={{ fontSize: typo.posName, color: palette.textMute, fontFamily: "'Cinzel', serif", letterSpacing: '0.1em', marginBottom: 6 }}>
                  {pos?.name || `第${i + 1}张`}
                </div>
                <div style={{ fontSize: typo.cardName, color: palette.lightgold, fontWeight: 600, lineHeight: 1.3 }}>
                  {c.card.name.cn}
                </div>
                <div style={{ fontSize: typo.cardMeta, color: c.reversed ? palette.rose : palette.textMute, marginTop: 5, marginBottom: 7 }}>
                  {c.reversed ? '逆位' : '正位'} · {(ELEMENT_META[c.card.element]?.label) || '灵'}
                </div>
                <div style={{ fontSize: typo.keywords, color: palette.textSoft, lineHeight: 1.4 }}>
                  {c.card.keywords.slice(0, 2).join(' · ')}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Divider palette={palette} />

      {/* 塔罗师回应 —— headline L1 */}
      <Section palette={palette} typo={typo} tag="塔罗师的回应" marginTop={20} marginBottom={20}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
          <div style={{
            padding: '8px 22px', borderRadius: 999, fontSize: typo.verdict, fontWeight: 600, color: verdictColor,
            border: `1px solid ${verdictColor}66`, backgroundColor: `${verdictColor}14`,
            fontFamily: "'Cinzel', 'Noto Serif SC', serif", letterSpacing: '0.1em', whiteSpace: 'nowrap',
          }}>
            {VERDICT_LABEL[directAnswer.verdict]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: typo.energyBarLabel, color: palette.textMute, marginBottom: 6 }}>
              <span>能量值</span>
              <span style={{ color: palette.lightgold, fontWeight: 600, fontSize: typo.energyBarValue }}>{pct}</span>
            </div>
            <div style={{ height: 7, borderRadius: 999, backgroundColor: palette.barTrack, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${verdictColor}, ${palette.gold})` }} />
            </div>
          </div>
        </div>
        <p style={{ fontSize: typo.headline, lineHeight: 1.65, color: palette.textStrong, fontWeight: 500, margin: '16px 0 0' }}>
          {truncate(directAnswer.headline, 90)}
        </p>
      </Section>

      <Divider palette={palette} />

      {/* 塔罗师深度解读 —— L2 */}
      {directAnswer.reasoning && (
        <Section palette={palette} typo={typo} tag="牌面背后的脉络" marginTop={20} marginBottom={20}>
          <p style={{ fontSize: typo.reasoning, lineHeight: 1.85, color: palette.textSoft, margin: '14px 0 0', fontStyle: 'italic' }}>
            {truncate(directAnswer.reasoning, 150)}
          </p>
        </Section>
      )}

      <Divider palette={palette} />

      {/* 元素能量分布 —— 数字 L2，标签 L3 */}
      <Section palette={palette} typo={typo} tag="元素能量" marginTop={20} marginBottom={20}>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {elements.map((e) => (
            <div key={e.element} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999,
              backgroundColor: palette.panel, border: `1px solid ${palette.borderSoft}`,
            }}>
              <span style={{ fontSize: typo.energyCount, color: palette.gold }}>{e.icon}</span>
              <span style={{ fontSize: typo.energyLabel, color: palette.textBase, fontFamily: "'Cinzel', serif", letterSpacing: '0.08em' }}>
                {e.label}元素
              </span>
              <span style={{ fontSize: typo.energyCount, color: palette.lightgold, fontWeight: 600 }}>
                ×{e.count}
              </span>
              <span style={{ fontSize: typo.energyPct, color: palette.textMute }}>
                {Math.round((e.count / totalCards) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Divider palette={palette} />

      {/* 行动指引 —— detail L2 */}
      {actionPlan.length > 0 && (
        <Section palette={palette} typo={typo} tag="行动指引" marginTop={20} marginBottom={20}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
            {actionPlan.slice(0, 3).map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, padding: '14px 18px', borderRadius: 12,
                backgroundColor: palette.panel, border: `1px solid ${palette.borderSoft}`,
              }}>
                <span style={{ fontSize: typo.actionDetail, color: item.kind === 'warning' ? palette.rose : palette.lightgold, lineHeight: 1.5, flexShrink: 0 }}>
                  {ACTION_ICON[item.kind]}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: typo.posName, color: palette.textMute, fontFamily: "'Cinzel', serif", letterSpacing: '0.08em', marginBottom: 5 }}>
                    {ACTION_LABEL[item.kind]}
                  </div>
                  <div style={{ fontSize: typo.actionDetail, lineHeight: 1.55, color: palette.textBase }}>
                    {truncate(item.detail, 55)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 底部域名 CTA 区 —— 收束语 L2，域名 L1，其余 L3 */}
      <div style={{ marginTop: 'auto' }}>
        <Divider palette={palette} />
        <div style={{
          textAlign: 'center', padding: '26px 20px 30px',
          background: `linear-gradient(180deg, transparent 0%, ${palette.glowGold} 100%)`,
        }}>
          <p style={{ fontFamily: "'Cinzel', 'Noto Serif SC', serif", fontSize: typo.closingText, color: palette.gold, letterSpacing: '0.12em', marginBottom: 12, fontWeight: 500 }}>
            ✦ {truncate(closingText, 22)} ✦
          </p>
          <p style={{ fontSize: typo.epilogue, color: palette.textMute, lineHeight: 1.65, fontStyle: 'italic', marginBottom: 18 }}>
            塔罗不预测命运，而是照亮当下。<br />每一次占卜，都是与内心的深度对话。
          </p>
          {/* 域名 CTA —— L1 */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 26px', borderRadius: 999,
            border: `1px solid ${palette.border}`, backgroundColor: 'rgba(212,175,55,0.08)',
          }}>
            <span style={{ fontSize: typo.domain, color: palette.gold }}>✧</span>
            <span style={{
              fontSize: typo.domain, color: palette.lightgold, fontFamily: "'Inter', sans-serif",
              fontWeight: 600, letterSpacing: '0.08em',
            }}>
              {SITE_DOMAIN}
            </span>
            <span style={{ fontSize: typo.domain, color: palette.gold }}>✧</span>
          </div>
          <p style={{ fontSize: typo.ctaHint, color: palette.textMute, marginTop: 12, fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>
            扫码或访问 · 开启你的专属占卜
          </p>
        </div>
      </div>
    </div>
  );
}

// === 横屏布局（左右双栏） ===
function LandscapeLayout({
  question,
  drawnCards,
  positions,
  spreadName,
  theme,
  directAnswer,
  actionPlan,
  closingText,
  palette,
  verdictColor,
  pct,
  dateStr,
  typo,
}: {
  question: string;
  drawnCards: DrawnCard[];
  positions: SpreadPosition[];
  spreadName: string;
  theme: QuestionTheme;
  directAnswer: DirectAnswerType;
  actionPlan: ActionItem[];
  closingText: string;
  palette: Palette;
  verdictColor: string;
  pct: number;
  dateStr: string;
  typo: Typo;
}) {
  const elements = computeElementEnergy(drawnCards);
  const totalCards = drawnCards.length || 1;

  return (
    <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', padding: '32px 44px 0' }}>
      {/* 左栏：问题 + 牌阵 + 元素能量 */}
      <div style={{ flex: '1 1 48%', display: 'flex', flexDirection: 'column', paddingRight: 28, borderRight: `1px solid ${palette.borderSoft}` }}>
        {/* 顶部品牌 —— L1 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: palette.gold, fontSize: typo.brand }}>✦</span>
            <span style={{ fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontSize: typo.brand, letterSpacing: '0.08em', color: palette.lightgold, fontWeight: 600 }}>
              塔罗秘境
            </span>
          </div>
          <span style={{ fontSize: typo.date, color: palette.textMute, fontFamily: "'Inter', sans-serif" }}>
            {dateStr}
          </span>
        </div>

        {/* 问题 —— L1 焦点 */}
        <SectionTag text="你所问" palette={palette} typo={typo} />
        <p style={{ fontSize: typo.question, lineHeight: 1.5, color: palette.textStrong, fontStyle: 'italic', fontWeight: 500, margin: '12px 0 0', minHeight: 24 }}>
          {question ? `「${truncate(question, 44)}」` : '— 静心冥想此刻的疑问 —'}
        </p>
        <div style={{
          display: 'inline-block', marginTop: 12, fontSize: typo.date, padding: '4px 14px', borderRadius: 999,
          color: palette.lightgold, border: `1px solid ${palette.border}`, backgroundColor: 'rgba(212,175,55,0.08)',
        }}>
          {theme.label}主题 · {spreadName}
        </div>

        {/* 牌阵（含关键词） —— 牌名 L1，其余 L3 */}
        <div style={{ marginTop: 22 }}>
          <SectionTag text="你的牌阵" palette={palette} typo={typo} />
          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            {drawnCards.map((c, i) => {
              const pos = positions[c.position];
              return (
                <div key={i} style={{
                  flex: '1 1 28%', minWidth: 70, maxWidth: 125, padding: '12px 9px', borderRadius: 10,
                  backgroundColor: palette.panel, border: `1px solid ${palette.borderSoft}`, textAlign: 'center',
                }}>
                  <div style={{ fontSize: typo.posName, color: palette.textMute, fontFamily: "'Cinzel', serif", letterSpacing: '0.1em', marginBottom: 5 }}>
                    {pos?.name || `第${i + 1}张`}
                  </div>
                  <div style={{ fontSize: typo.cardName, color: palette.lightgold, fontWeight: 600, lineHeight: 1.3 }}>
                    {c.card.name.cn}
                  </div>
                  <div style={{ fontSize: typo.cardMeta, color: c.reversed ? palette.rose : palette.textMute, marginTop: 4, marginBottom: 5 }}>
                    {c.reversed ? '逆位' : '正位'} · {(ELEMENT_META[c.card.element]?.label) || '灵'}
                  </div>
                  <div style={{ fontSize: typo.keywords, color: palette.textSoft, lineHeight: 1.3 }}>
                    {c.card.keywords.slice(0, 2).join(' · ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 元素能量分布 —— 数字 L2，标签 L3 */}
        <div style={{ marginTop: 20 }}>
          <SectionTag text="元素能量" palette={palette} typo={typo} />
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {elements.map((e) => (
              <div key={e.element} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '7px 13px', borderRadius: 999,
                backgroundColor: palette.panel, border: `1px solid ${palette.borderSoft}`,
              }}>
                <span style={{ fontSize: typo.energyCount, color: palette.gold }}>{e.icon}</span>
                <span style={{ fontSize: typo.energyLabel, color: palette.textBase, fontFamily: "'Cinzel', serif", letterSpacing: '0.06em' }}>
                  {e.label}
                </span>
                <span style={{ fontSize: typo.energyCount, color: palette.lightgold, fontWeight: 600 }}>×{e.count}</span>
                <span style={{ fontSize: typo.energyPct, color: palette.textMute }}>
                  {Math.round((e.count / totalCards) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 底部域名 CTA —— 域名 L1 */}
        <div style={{ marginTop: 'auto', paddingTop: 18 }}>
          <p style={{ fontFamily: "'Cinzel', 'Noto Serif SC', serif", fontSize: typo.closingText, color: palette.gold, letterSpacing: '0.12em', marginBottom: 10, fontWeight: 500 }}>
            ✦ {truncate(closingText, 18)} ✦
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, padding: '9px 20px', borderRadius: 999,
            border: `1px solid ${palette.border}`, backgroundColor: 'rgba(212,175,55,0.08)',
          }}>
            <span style={{ fontSize: typo.domain, color: palette.gold }}>✧</span>
            <span style={{
              fontSize: typo.domain, color: palette.lightgold, fontFamily: "'Inter', sans-serif",
              fontWeight: 600, letterSpacing: '0.08em',
            }}>
              {SITE_DOMAIN}
            </span>
            <span style={{ fontSize: typo.domain, color: palette.gold }}>✧</span>
          </div>
        </div>
      </div>

      {/* 右栏：回应 + 解读 + 行动指引 */}
      <div style={{ flex: '1 1 52%', display: 'flex', flexDirection: 'column', paddingLeft: 28 }}>
        {/* 塔罗师回应 —— headline L1 */}
        <SectionTag text="塔罗师的回应" palette={palette} typo={typo} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14 }}>
          <div style={{
            padding: '7px 20px', borderRadius: 999, fontSize: typo.verdict, fontWeight: 600, color: verdictColor,
            border: `1px solid ${verdictColor}66`, backgroundColor: `${verdictColor}14`,
            fontFamily: "'Cinzel', 'Noto Serif SC', serif", letterSpacing: '0.1em', whiteSpace: 'nowrap',
          }}>
            {VERDICT_LABEL[directAnswer.verdict]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: typo.energyBarLabel, color: palette.textMute, marginBottom: 5 }}>
              <span>能量值</span>
              <span style={{ color: palette.lightgold, fontWeight: 600, fontSize: typo.energyBarValue }}>{pct}</span>
            </div>
            <div style={{ height: 7, borderRadius: 999, backgroundColor: palette.barTrack, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${verdictColor}, ${palette.gold})` }} />
            </div>
          </div>
        </div>
        <p style={{ fontSize: typo.headline, lineHeight: 1.6, color: palette.textStrong, fontWeight: 500, margin: '14px 0 0' }}>
          {truncate(directAnswer.headline, 80)}
        </p>

        {/* 塔罗师深度解读 —— L2 */}
        {directAnswer.reasoning && (
          <div style={{ marginTop: 20 }}>
            <SectionTag text="牌面背后的脉络" palette={palette} typo={typo} />
            <p style={{ fontSize: typo.reasoning, lineHeight: 1.8, color: palette.textSoft, margin: '12px 0 0', fontStyle: 'italic' }}>
              {truncate(directAnswer.reasoning, 130)}
            </p>
          </div>
        )}

        {/* 行动指引 —— detail L2 */}
        {actionPlan.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <SectionTag text="行动指引" palette={palette} typo={typo} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14 }}>
              {actionPlan.slice(0, 3).map((item, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 11, padding: '12px 15px', borderRadius: 10,
                  backgroundColor: palette.panel, border: `1px solid ${palette.borderSoft}`,
                }}>
                  <span style={{ fontSize: typo.actionDetail, color: item.kind === 'warning' ? palette.rose : palette.lightgold, lineHeight: 1.5, flexShrink: 0 }}>
                    {ACTION_ICON[item.kind]}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: typo.posName, color: palette.textMute, fontFamily: "'Cinzel', serif", letterSpacing: '0.08em', marginBottom: 4 }}>
                      {ACTION_LABEL[item.kind]}
                    </div>
                    <div style={{ fontSize: typo.actionDetail, lineHeight: 1.5, color: palette.textBase }}>
                      {truncate(item.detail, 45)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 底部箴言 + CTA —— L3 */}
        <div style={{ marginTop: 'auto', paddingTop: 16, textAlign: 'right' }}>
          <p style={{ fontSize: typo.epilogue, color: palette.textMute, lineHeight: 1.6, fontStyle: 'italic', marginBottom: 7 }}>
            塔罗不预测命运，而是照亮当下。
          </p>
          <p style={{ fontSize: typo.ctaHint, color: palette.textMute, fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>
            扫码或访问 · 开启你的专属占卜
          </p>
        </div>
      </div>
    </div>
  );
}

// === 共享小组件 ===
function Section({
  tag,
  children,
  palette,
  typo,
  marginTop,
  marginBottom,
}: {
  tag: string;
  children: React.ReactNode;
  palette: Palette;
  typo: Typo;
  marginTop: number;
  marginBottom: number;
}) {
  return (
    <div style={{ marginTop, marginBottom }}>
      <SectionTag text={tag} palette={palette} typo={typo} />
      {children}
    </div>
  );
}

function SectionTag({ text, palette, typo }: { text: string; palette: Palette; typo: Typo }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 18, height: 1.5, background: palette.gold, opacity: 0.7 }} />
      <span style={{ fontFamily: "'Cinzel', 'Noto Serif SC', serif", fontSize: typo.sectionTag, color: palette.gold, letterSpacing: '0.15em', fontWeight: 500 }}>
        {text}
      </span>
    </div>
  );
}

function Divider({ palette }: { palette: Palette }) {
  return (
    <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${palette.divider}, transparent)` }} />
  );
}

function Glow({
  top,
  right,
  bottom,
  left,
  size,
  color,
}: {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  size: number;
  color: string;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        right,
        bottom,
        left,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }}
    />
  );
}
