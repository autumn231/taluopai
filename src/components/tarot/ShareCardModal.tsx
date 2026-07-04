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
import { X, Download, Loader2, ImageDown, Check } from 'lucide-react';
import type { DrawnCard, SpreadPosition } from '@/types';
import type { QuestionTheme } from '@/data/questionThemes';
import type {
  DirectAnswer as DirectAnswerType,
  ActionItem,
  Verdict,
} from '@/lib/interpretation';

// === 海报固定色板（始终深色神秘风，不受白天/黑夜切换影响） ===
const C = {
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
};

const VERDICT_COLOR: Record<Verdict, string> = {
  positive: C.emerald,
  cautious: C.rose,
  neutral: C.amber,
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

const W = 750;
const H = 1334;

// 预览缩放：750 → 300px 宽
const SHARE_SCALE = 300 / W;
const SHARE_PREVIEW_W = 300;

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
      // 等待字体就绪，避免首帧字体未加载
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      await new Promise((r) => setTimeout(r, 120));
      const url = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        width: W,
        height: H,
        backgroundColor: C.bg0,
        style: { transform: 'none', margin: '0' },
      });
      setDataUrl(url);
      setStatus('done');
    } catch (err) {
      console.error('生成图片失败', err);
      setStatus('error');
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    link.download = `塔罗占卜_${date}.png`;
    link.href = dataUrl;
    link.click();
  }, [dataUrl]);

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
              border: `1px solid ${C.border}`,
              color: C.textSoft,
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
            className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto no-scrollbar rounded-2xl"
            style={{
              backgroundColor: C.bg1,
              border: `1px solid ${C.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题栏 */}
            <div
              className="flex items-center gap-2 px-5 py-3.5 sticky top-0 z-10"
              style={{
                borderBottom: `1px solid ${C.borderSoft}`,
                backgroundColor: C.bg1,
              }}
            >
              <ImageDown className="w-4 h-4" style={{ color: C.lightgold }} />
              <span
                className="font-title text-sm tracking-widest"
                style={{ color: C.lightgold }}
              >
                生成分享海报
              </span>
            </div>

            <div className="flex flex-col lg:flex-row gap-5 p-5">
              {/* 左侧：海报预览（实际被截图的节点） */}
              <div className="flex-shrink-0 mx-auto lg:mx-0">
                {/* 缩放容器：把 750px 宽的海报缩放到适配预览 */}
                <div
                  className="origin-top-left overflow-hidden rounded-lg"
                  style={{ width: SHARE_PREVIEW_W }}
                >
                  <div
                    style={{
                      width: W,
                      transform: `scale(${SHARE_SCALE})`,
                      transformOrigin: 'top left',
                    }}
                  >
                    <ShareCard ref={cardRef} {...data} />
                  </div>
                </div>
              </div>

              {/* 右侧：操作区 */}
              <div className="flex-1 flex flex-col justify-center gap-4 min-w-0">
                <div className="text-center lg:text-left">
                  <h3
                    className="font-display text-xl mb-1.5"
                    style={{ color: C.lightgold }}
                  >
                    一键生成分享海报
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: C.textSoft }}>
                    将本次占卜的核心解读凝练为一张精美图片，
                    可保存到相册或分享给朋友。
                  </p>
                </div>

                {/* 状态展示 */}
                {status === 'done' && dataUrl && (
                  <div
                    className="rounded-xl p-3 flex items-center gap-2.5"
                    style={{
                      backgroundColor: 'rgba(52, 211, 153, 0.1)',
                      border: '1px solid rgba(52, 211, 153, 0.35)',
                    }}
                  >
                    <Check className="w-4 h-4 shrink-0" style={{ color: C.emerald }} />
                    <span className="text-sm" style={{ color: C.emerald }}>
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
                      color: C.rose,
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
                            ? C.panel
                            : 'linear-gradient(135deg, #f4d03f 0%, #d4af37 100%)',
                        color: status === 'generating' ? C.textSoft : '#0a0824',
                        border: `1px solid ${C.border}`,
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
                          border: `1px solid ${C.border}`,
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
                          color: C.textSoft,
                          border: `1px solid ${C.borderSoft}`,
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
                      style={{ color: C.textMute }}
                    >
                      生成结果预览
                    </div>
                    <img
                      src={dataUrl}
                      alt="占卜海报预览"
                      className="w-full rounded-lg"
                      style={{ border: `1px solid ${C.borderSoft}` }}
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

// === 海报本体（被截图的节点，固定 750×1334） ===
const ShareCard = forwardRef<HTMLDivElement, ShareCardData>(function ShareCard(
  { question, drawnCards, positions, spreadName, theme, directAnswer, actionPlan, closingText },
  ref,
) {
  const date = new Date();
  const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  const verdictColor = VERDICT_COLOR[directAnswer.verdict];
  const pct = Math.round(((directAnswer.score + 100) / 200) * 100);

  return (
    <div
      ref={ref}
      style={{
        width: W,
        height: H,
        background: `linear-gradient(160deg, ${C.bg0} 0%, ${C.bg1} 40%, ${C.bg2} 100%)`,
        fontFamily: "'Cormorant Garamond', 'Noto Serif SC', serif",
        color: C.textBase,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 背景装饰光晕 */}
      <Glow top={-120} right={-100} size={360} color="rgba(212,175,55,0.12)" />
      <Glow bottom={-80} left={-80} size={300} color="rgba(110,78,163,0.15)" />

      {/* 内容容器 */}
      <div style={contentStyle}>
        {/* === 顶部品牌 === */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: C.gold, fontSize: 18 }}>✦</span>
            <span style={brandStyle}>塔罗秘境</span>
          </div>
          <span style={{ fontSize: 13, color: C.textMute, fontFamily: "'Inter', sans-serif" }}>
            {dateStr}
          </span>
        </div>

        <Divider />

        {/* === 问题 === */}
        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <SectionTag text="你所问" />
          <p style={questionStyle}>
            {question ? `「${truncate(question, 80)}」` : '— 静心冥想此刻的疑问 —'}
          </p>
          <div style={tagStyle}>
            {theme.label}主题 · {spreadName}
          </div>
        </div>

        <Divider />

        {/* === 牌阵 === */}
        <div style={{ marginTop: 22, marginBottom: 22 }}>
          <SectionTag text="你的牌阵" />
          <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
            {drawnCards.map((c, i) => {
              const pos = positions[c.position];
              return (
                <div key={i} style={cardItemStyle}>
                  <div style={cardPosStyle}>{pos?.name || `第${i + 1}张`}</div>
                  <div style={cardNameStyle}>{c.card.name.cn}</div>
                  <div style={{ fontSize: 10, color: c.reversed ? C.rose : C.textMute, marginTop: 3 }}>
                    {c.reversed ? '逆位' : '正位'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Divider />

        {/* === 塔罗师的回应 === */}
        <div style={{ marginTop: 22, marginBottom: 22 }}>
          <SectionTag text="塔罗师的回应" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14 }}>
            <div style={verdictTagStyle(verdictColor)}>
              {VERDICT_LABEL[directAnswer.verdict]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.textMute, marginBottom: 4 }}>
                <span>能量值</span>
                <span style={{ color: C.lightgold, fontWeight: 600 }}>{pct}</span>
              </div>
              <div style={barTrackStyle}>
                <div style={barFillStyle(pct, verdictColor)} />
              </div>
            </div>
          </div>
          <p style={headlineStyle}>{truncate(directAnswer.headline, 120)}</p>
        </div>

        <Divider />

        {/* === 行动指引 === */}
        {actionPlan.length > 0 && (
          <div style={{ marginTop: 22, marginBottom: 22 }}>
            <SectionTag text="行动指引" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
              {actionPlan.slice(0, 3).map((item, i) => (
                <div key={i} style={actionItemStyle}>
                  <span style={{ fontSize: 14, color: item.kind === 'warning' ? C.rose : C.lightgold, lineHeight: 1.6, flexShrink: 0 }}>
                    {ACTION_ICON[item.kind]}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={actionLabelStyle}>{ACTION_LABEL[item.kind]}</div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.6, color: C.textBase }}>
                      {truncate(item.detail, 70)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 弹性间隔 */}
        <div style={{ flex: 1 }} />

        {/* === 底部 === */}
        <Divider />
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <p style={closingStyle}>✦ {truncate(closingText, 30)} ✦</p>
          <p style={{ fontSize: 11, color: C.textMute, lineHeight: 1.6, fontStyle: 'italic' }}>
            塔罗不预测命运，而是照亮当下。
          </p>
          <div style={footerBrandStyle}>塔罗秘境 · Mystic Tarot</div>
        </div>
      </div>
    </div>
  );
});

// === 样式工厂 ===
const contentStyle: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: '44px 40px 36px',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 28,
};

const brandStyle: CSSProperties = {
  fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
  fontSize: 22,
  letterSpacing: '0.08em',
  color: C.lightgold,
};

const questionStyle: CSSProperties = {
  fontSize: 18,
  lineHeight: 1.7,
  color: C.textStrong,
  fontStyle: 'italic',
  margin: '10px 0 0',
  minHeight: 30,
};

const tagStyle: CSSProperties = {
  display: 'inline-block',
  marginTop: 10,
  fontSize: 12,
  padding: '3px 12px',
  borderRadius: 999,
  color: C.lightgold,
  border: `1px solid ${C.border}`,
  backgroundColor: 'rgba(212,175,55,0.08)',
};

const cardItemStyle: CSSProperties = {
  flex: '1 1 30%',
  minWidth: 80,
  maxWidth: 130,
  padding: '10px 8px',
  borderRadius: 10,
  backgroundColor: C.panel,
  border: `1px solid ${C.borderSoft}`,
  textAlign: 'center',
};

const cardPosStyle: CSSProperties = {
  fontSize: 10,
  color: C.textMute,
  fontFamily: "'Cinzel', serif",
  letterSpacing: '0.1em',
  marginBottom: 4,
};

const cardNameStyle: CSSProperties = {
  fontSize: 15,
  color: C.lightgold,
  fontWeight: 600,
  lineHeight: 1.3,
};

const verdictTagStyle = (color: string): CSSProperties => ({
  padding: '6px 16px',
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 600,
  color,
  border: `1px solid ${color}66`,
  backgroundColor: `${color}14`,
  fontFamily: "'Cinzel', 'Noto Serif SC', serif",
  letterSpacing: '0.1em',
  whiteSpace: 'nowrap',
});

const barTrackStyle: CSSProperties = {
  height: 6,
  borderRadius: 999,
  backgroundColor: 'rgba(255,255,255,0.08)',
  overflow: 'hidden',
};

const barFillStyle = (pct: number, color: string): CSSProperties => ({
  width: `${pct}%`,
  height: '100%',
  borderRadius: 999,
  background: `linear-gradient(90deg, ${color}, ${C.gold})`,
});

const headlineStyle: CSSProperties = {
  fontSize: 14.5,
  lineHeight: 1.75,
  color: C.textBase,
  margin: '14px 0 0',
};

const actionItemStyle: CSSProperties = {
  display: 'flex',
  gap: 10,
  padding: '10px 14px',
  borderRadius: 10,
  backgroundColor: C.panel,
  border: `1px solid ${C.borderSoft}`,
};

const actionLabelStyle: CSSProperties = {
  fontSize: 11,
  color: C.textMute,
  fontFamily: "'Cinzel', serif",
  letterSpacing: '0.08em',
  marginBottom: 3,
};

const closingStyle: CSSProperties = {
  fontFamily: "'Cinzel', 'Noto Serif SC', serif",
  fontSize: 14,
  color: C.gold,
  letterSpacing: '0.12em',
  marginBottom: 8,
};

const footerBrandStyle: CSSProperties = {
  marginTop: 12,
  fontSize: 11,
  color: C.textMute,
  fontFamily: "'Inter', sans-serif",
  letterSpacing: '0.1em',
};

// === 小组件 ===
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

function SectionTag({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 14, height: 1, background: C.gold, opacity: 0.6 }} />
      <span
        style={{
          fontFamily: "'Cinzel', 'Noto Serif SC', serif",
          fontSize: 12,
          color: C.gold,
          letterSpacing: '0.15em',
        }}
      >
        {text}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background: `linear-gradient(90deg, transparent, ${C.border}, transparent)`,
      }}
    />
  );
}
