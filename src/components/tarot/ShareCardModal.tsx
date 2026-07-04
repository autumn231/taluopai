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

// ============================================================
// 类型与常量
// ============================================================

type PosterStyle = 'dark' | 'light';
type PosterOrientation = 'portrait' | 'landscape';
type LayoutKind = 'single' | 'three' | 'celtic';

interface Palette {
  bg: string;
  panel: string;
  gold: string;
  lightgold: string;
  textStrong: string;
  textBase: string;
  textSoft: string;
  textMute: string;
  border: string;
  borderSoft: string;
  emerald: string;
  rose: string;
  amber: string;
}

const DARK: Palette = {
  bg: '#0e0828',
  panel: 'rgba(30, 18, 64, 0.55)',
  gold: '#d4af37',
  lightgold: '#f4d03f',
  textStrong: '#f5f3ff',
  textBase: '#e8e4f3',
  textSoft: '#c4b8d8',
  textMute: '#9a82bf',
  border: 'rgba(212, 175, 55, 0.32)',
  borderSoft: 'rgba(212, 175, 55, 0.16)',
  emerald: '#34d399',
  rose: '#fb7185',
  amber: '#eab308',
};

const LIGHT: Palette = {
  bg: '#f5f0e6',
  panel: 'rgba(255, 250, 240, 0.7)',
  gold: '#a67c00',
  lightgold: '#8a6500',
  textStrong: '#2d2410',
  textBase: '#4a3f28',
  textSoft: '#6b5d40',
  textMute: '#9a8a66',
  border: 'rgba(166, 124, 0, 0.35)',
  borderSoft: 'rgba(166, 124, 0, 0.18)',
  emerald: '#2d8659',
  rose: '#c0392b',
  amber: '#b8860b',
};

const VERDICT_COLOR: Record<Verdict, keyof Palette> = {
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
  advice: '✦', warning: '⚠', timing: '⏳', theme: '✧',
};
const ACTION_LABEL: Record<ActionItem['kind'], string> = {
  advice: '此刻最该做', warning: '需要留意', timing: '时机提示', theme: '塔罗师叮嘱',
};
const ELEMENT_LABEL: Record<string, string> = {
  fire: '火', water: '水', air: '风', earth: '土', spirit: '灵',
};
// 问题主题 → 关心的牌义维度
const THEME_DIM: Record<string, 'love' | 'career' | 'wealth'> = {
  感情: 'love', 事业: 'career', 财运: 'wealth', 学业: 'career', 健康: 'wealth',
};

const SITE_DOMAIN = 'taluopai.tbit.xin';

// 固定画布尺寸
const PORTRAIT_W = 750;
const PORTRAIT_H = 1200;
const LANDSCAPE_W = 1200;
const LANDSCAPE_H = 750;

// ============================================================
// 数据接口
// ============================================================

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

// ============================================================
// 主组件
// ============================================================

export default function ShareCardModal({ open, onClose, ...data }: ShareCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  // Blob URL 用于 <img> 渲染；data URL 用于 <a download> —— 夸克可能拦截 blob: 下载
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const dataUrlRef = useRef<string | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const [posterStyle, setPosterStyle] = useState<PosterStyle>('dark');
  const [orientation, setOrientation] = useState<PosterOrientation>('portrait');
  const [downloadHint, setDownloadHint] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const palette = posterStyle === 'dark' ? DARK : LIGHT;
  const isPortrait = orientation === 'portrait';
  const canvasW = isPortrait ? PORTRAIT_W : LANDSCAPE_W;
  const canvasH = isPortrait ? PORTRAIT_H : LANDSCAPE_H;
  const previewW = isPortrait ? 280 : 380;
  const scale = previewW / canvasW;
  const previewH = canvasH * scale;

  // 释放上一个 Blob URL，避免内存泄漏
  const revokeImageUrl = useCallback(() => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl(null);
    }
    blobRef.current = null;
    dataUrlRef.current = null;
  }, [imageUrl]);

  useEffect(() => {
    if (open) {
      setStatus('idle');
      revokeImageUrl();
      setDownloadHint(null);
      setShowImageModal(false);
    }
  }, [open, revokeImageUrl]);

  // 组件卸载时释放 Blob URL
  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  useEffect(() => {
    revokeImageUrl();
    setStatus('idle');
    setDownloadHint(null);
  }, [posterStyle, orientation, revokeImageUrl]);

  const handleGenerate = useCallback(async () => {
    const node = cardRef.current;
    if (!node) return;
    setStatus('generating');
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise((r) => setTimeout(r, 120));
      // 用 toPng 得到 data URL，再手动 base64 解码为 Blob
      // 不能用 html-to-image 的 toBlob —— 它内部用 fetch(dataUrl) 转 Blob，
      // 夸克浏览器拦截 fetch('data:image/...') 返回空 body，导致 Blob 为 0B
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        width: canvasW,
        height: canvasH,
        backgroundColor: palette.bg,
        style: { transform: 'none', margin: '0' },
      });
      // 手动 base64 → ArrayBuffer → Blob，完全绕过 fetch(data:)
      const commaIdx = dataUrl.indexOf(',');
      const mime = dataUrl.slice(0, commaIdx).match(/:(.*?);/)![1];
      const base64 = dataUrl.slice(commaIdx + 1);
      const binaryStr = atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mime });
      // 释放旧的 Blob URL
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      blobRef.current = blob;
      dataUrlRef.current = dataUrl; // 保留 data URL 用于 <a download> —— 夸克可能拦截 blob: 下载
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      setStatus('done');
    } catch (err) {
      console.error('生成图片失败', err);
      setStatus('error');
    }
  }, [canvasW, canvasH, palette.bg, imageUrl]);

  const handleDownload = useCallback(async () => {
    const blob = blobRef.current;
    const dataUrl = dataUrlRef.current;
    if (!blob || !dataUrl || !imageUrl) return;
    const fileName = `塔罗占卜_${new Date().toISOString().slice(0, 10)}.png`;

    // 检测是否为移动端（触摸设备）
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
      // === 手机端：直接用 data URL + <a download> 触发浏览器自动下载 ===
      // 夸克浏览器不支持 Web Share（0B）、长按保存（看图模式禁用）、blob: 下载
      // data URL 是唯一可靠的方案
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadHint('已开始下载');
      setTimeout(() => setDownloadHint(null), 4000);
    } else {
      // === 电脑端：优先用 File System Access API 弹出「另存为」对话框 ===
      try {
        // Chrome/Edge 支持 showSaveFilePicker，弹出系统文件选择器
        if ('showSaveFilePicker' in window) {
          try {
            const handle = await (window as any).showSaveFilePicker({
              suggestedName: fileName,
              types: [{ description: 'PNG 图片', accept: { 'image/png': ['.png'] } }],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            setDownloadHint('已保存');
            setTimeout(() => setDownloadHint(null), 3000);
            return;
          } catch (pickerErr: any) {
            if (pickerErr?.name === 'AbortError') { setDownloadHint(null); return; }
            // showSaveFilePicker 失败则走兜底
          }
        }

        // 兜底：Blob download（Firefox/Safari 等不支持 showSaveFilePicker）
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadHint('已开始下载，请查看下载文件夹');
        setTimeout(() => setDownloadHint(null), 4000);
      } catch (err) {
        console.error('下载失败', err);
        setDownloadHint('下载失败');
        setTimeout(() => setDownloadHint(null), 4000);
      }
    }
  }, [imageUrl]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(5, 3, 20, 0.85)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center hover:bg-mystic-gold/15"
              style={{ backgroundColor: 'rgba(30, 18, 64, 0.6)', border: `1px solid ${DARK.border}`, color: DARK.textSoft }}
              aria-label="关闭"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto no-scrollbar rounded-2xl"
              style={{ backgroundColor: DARK.bg, border: `1px solid ${DARK.border}` }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 px-5 py-3.5 sticky top-0 z-10" style={{ borderBottom: `1px solid ${DARK.borderSoft}`, backgroundColor: DARK.bg }}>
                <ImageDown className="w-4 h-4" style={{ color: DARK.lightgold }} />
                <span className="font-title text-sm tracking-widest" style={{ color: DARK.lightgold }}>生成分享海报</span>
              </div>

              <div className="flex flex-col lg:flex-row gap-5 p-5">
                <div className="flex-shrink-0 mx-auto lg:mx-0">
                  <PosterPreview previewW={previewW} previewH={previewH} scale={scale}>
                    <ShareCard
                      ref={cardRef}
                      {...data}
                      palette={palette}
                      orientation={orientation}
                      width={canvasW}
                      height={canvasH}
                    />
                  </PosterPreview>
                </div>

                <div className="flex-1 flex flex-col gap-4 min-w-0">
                  <div>
                    <h3 className="font-display text-xl mb-1.5" style={{ color: DARK.lightgold }}>一键生成分享海报</h3>
                    <p className="text-sm leading-relaxed" style={{ color: DARK.textSoft }}>
                      选择样式与方向，将本次占卜凝练为精美图片。
                    </p>
                  </div>

                  <OptionGroup label="海报样式">
                    <OptionButton active={posterStyle === 'dark'} onClick={() => setPosterStyle('dark')} icon={<Moon className="w-3.5 h-3.5" />} label="黑夜" />
                    <OptionButton active={posterStyle === 'light'} onClick={() => setPosterStyle('light')} icon={<Sun className="w-3.5 h-3.5" />} label="白天" />
                  </OptionGroup>

                  <OptionGroup label="海报方向">
                    <OptionButton active={orientation === 'portrait'} onClick={() => setOrientation('portrait')} icon={<Smartphone className="w-3.5 h-3.5" />} label="竖屏" />
                    <OptionButton active={orientation === 'landscape'} onClick={() => setOrientation('landscape')} icon={<Monitor className="w-3.5 h-3.5" />} label="横屏" />
                  </OptionGroup>

                  {status === 'done' && imageUrl && (
                    <div className="rounded-xl p-3 flex items-center gap-2.5" style={{ backgroundColor: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.35)' }}>
                      <Check className="w-4 h-4 shrink-0" style={{ color: DARK.emerald }} />
                      <span className="text-sm" style={{ color: DARK.emerald }}>图片已生成，点击下方按钮保存</span>
                    </div>
                  )}
                  {status === 'error' && (
                    <div className="rounded-xl p-3 text-sm" style={{ backgroundColor: 'rgba(251, 113, 133, 0.1)', border: '1px solid rgba(251, 113, 133, 0.35)', color: DARK.rose }}>
                      生成失败，请重试。
                    </div>
                  )}

                  <div className="flex flex-col gap-2.5">
                    {status !== 'done' && (
                      <button
                        onClick={handleGenerate}
                        disabled={status === 'generating'}
                        className="w-full py-3 rounded-full font-title text-sm tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                        style={{
                          background: status === 'generating' ? DARK.panel : 'linear-gradient(135deg, #f4d03f 0%, #d4af37 100%)',
                          color: status === 'generating' ? DARK.textSoft : '#0a0824',
                          border: `1px solid ${DARK.border}`,
                          cursor: status === 'generating' ? 'wait' : 'pointer',
                        }}
                      >
                        {status === 'generating' ? <><Loader2 className="w-4 h-4 animate-spin" />正在生成…</> : <><ImageDown className="w-4 h-4" />生成海报</>}
                      </button>
                    )}
                    {status === 'done' && (
                      <>
                        <button
                          onClick={handleDownload}
                          className="w-full py-3 rounded-full font-title text-sm tracking-widest transition-all flex items-center justify-center gap-2 hover:brightness-110"
                          style={{ background: 'linear-gradient(135deg, #f4d03f 0%, #d4af37 100%)', color: '#0a0824', border: `1px solid ${DARK.border}`, cursor: 'pointer' }}
                        >
                          <Download className="w-4 h-4" />保存图片
                        </button>
                        {downloadHint && (
                          <div className="rounded-lg p-2.5 text-xs leading-relaxed text-center" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', border: `1px solid ${DARK.borderSoft}`, color: DARK.lightgold }}>
                            {downloadHint}
                          </div>
                        )}
                        <button
                          onClick={() => { revokeImageUrl(); setStatus('idle'); setDownloadHint(null); }}
                          className="w-full py-2.5 rounded-full font-title text-xs tracking-widest transition-all hover:bg-mystic-gold/10"
                          style={{ backgroundColor: 'transparent', color: DARK.textSoft, border: `1px solid ${DARK.borderSoft}`, cursor: 'pointer' }}
                        >
                          重新生成
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 手机端图片保存模态框：用 Blob URL 显示，提供下载按钮 + 长按两种保存方式 */}
      {showImageModal && imageUrl && (
        <div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(5, 3, 20, 0.95)' }}
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(30, 18, 64, 0.8)', border: `1px solid ${DARK.border}`, color: DARK.textSoft }}
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            className="flex flex-col items-center gap-4 max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageUrl}
              alt="塔罗占卜海报"
              className="max-w-full max-h-[68vh] object-contain rounded-lg"
              style={{ touchAction: 'manipulation' }}
            />
            {/* 显式下载按钮：用 data URL —— 夸克可能拦截 blob: 下载 */}
            <a
              href={dataUrlRef.current || imageUrl}
              download={`塔罗占卜_${new Date().toISOString().slice(0, 10)}.png`}
              className="py-3 px-8 rounded-full font-title text-sm tracking-widest transition-all flex items-center gap-2 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #f4d03f 0%, #d4af37 100%)',
                color: '#0a0824',
                border: `1px solid ${DARK.border}`,
                textDecoration: 'none',
              }}
            >
              <Download className="w-4 h-4" />下载到手机
            </a>
            <p className="text-xs text-center px-4 leading-relaxed" style={{ color: DARK.textSoft }}>
              点击按钮即可下载到手机
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// 预览容器
// ============================================================

function PosterPreview({ previewW, previewH, scale, children }: { previewW: number; previewH: number; scale: number; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg" style={{ width: previewW, height: previewH }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>
    </div>
  );
}

// ============================================================
// 选项小组件
// ============================================================

function OptionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-title tracking-widest mb-2" style={{ color: DARK.textMute }}>{label}</div>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

function OptionButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-2 px-3 rounded-lg text-xs font-title tracking-wider transition-all flex items-center justify-center gap-1.5"
      style={{
        backgroundColor: active ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
        border: `1px solid ${active ? DARK.border : DARK.borderSoft}`,
        color: active ? DARK.lightgold : DARK.textSoft,
        cursor: 'pointer',
      }}
    >
      {icon}{label}
    </button>
  );
}

// ============================================================
// 海报本体：固定画布 + 按牌数分发
// ============================================================

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
  const dateStr = formatDate(new Date());
  const verdictColor = palette[VERDICT_COLOR[directAnswer.verdict]];
  const energyPct = Math.round(((directAnswer.score + 100) / 200) * 100);
  const layout = detectLayout(drawnCards.length);
  const themeDim = THEME_DIM[theme.label] || 'general';

  const rootStyle: CSSProperties = {
    width, height,
    background: `linear-gradient(160deg, ${palette.bg} 0%, ${palette.bg} 60%, ${palette.bg} 100%)`,
    fontFamily: "'Cormorant Garamond', 'Noto Serif SC', serif",
    color: palette.textBase,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  const ctx: CardCtx = {
    question, drawnCards, positions, spreadName, theme, directAnswer, actionPlan, closingText,
    palette, verdictColor, energyPct, dateStr, themeDim,
  };

  return (
    <div ref={ref} style={rootStyle}>
      <BackgroundDecor palette={palette} />
      {orientation === 'portrait'
        ? renderPortrait(layout, ctx)
        : renderLandscape(layout, ctx)}
    </div>
  );
});

function detectLayout(cardCount: number): LayoutKind {
  if (cardCount === 1) return 'single';
  if (cardCount === 3) return 'three';
  return 'celtic';
}

interface CardCtx extends ShareCardData {
  palette: Palette;
  verdictColor: string;
  energyPct: number;
  dateStr: string;
  themeDim: 'love' | 'career' | 'wealth' | 'general';
}

// ============================================================
// 竖屏分发
// ============================================================

function renderPortrait(layout: LayoutKind, ctx: CardCtx) {
  if (layout === 'single') return <SinglePortrait ctx={ctx} />;
  if (layout === 'three') return <ThreePortrait ctx={ctx} />;
  return <CelticPortrait ctx={ctx} />;
}

// ============================================================
// 横屏分发
// ============================================================

function renderLandscape(layout: LayoutKind, ctx: CardCtx) {
  if (layout === 'single') return <SingleLandscape ctx={ctx} />;
  if (layout === 'three') return <ThreeLandscape ctx={ctx} />;
  return <CelticLandscape ctx={ctx} />;
}

// ============================================================
// 竖屏 · 单牌 Hero 布局
// ============================================================

function SinglePortrait({ ctx }: { ctx: CardCtx }) {
  const { question, drawnCards, positions, spreadName, theme, directAnswer, actionPlan, closingText, palette, verdictColor, energyPct, dateStr, themeDim } = ctx;
  const c = drawnCards[0];
  const pos = positions[c.position];
  const reading = c.reversed ? c.card.reversed : c.card.upright;
  const dimText = (themeDim !== 'general' ? (reading as any)[themeDim] : '') || reading.general;

  return (
    <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', padding: '36px 44px 28px' }}>
      <Header palette={palette} dateStr={dateStr} size={28} dateSize={15} />
      <Divider palette={palette} />

      <SectionTitle text="你所问" palette={palette} size={17} marginTop={16} />
      <p style={{ fontSize: 22, lineHeight: 1.5, color: palette.textStrong, fontStyle: 'italic', fontWeight: 500, margin: '10px 0 0' }}>
        {question ? `「${truncate(question, 50)}」` : '— 静心冥想此刻的疑问 —'}
      </p>
      <Tag palette={palette} marginTop={10}>{theme.label}主题 · {spreadName}</Tag>

      {/* Hero 牌 */}
      <div style={{ marginTop: 18, display: 'flex', gap: 18, alignItems: 'stretch' }}>
        <div style={{
          flex: '0 0 200px', padding: '18px 14px', borderRadius: 14,
          background: `linear-gradient(180deg, ${palette.panel}, ${palette.borderSoft})`,
          border: `1px solid ${palette.border}`, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 48, color: palette.gold, lineHeight: 1, marginBottom: 8 }}>{c.card.symbol || '✦'}</div>
          <div style={{ fontSize: 24, color: palette.lightgold, fontWeight: 600, lineHeight: 1.3 }}>{c.card.name.cn}</div>
          <div style={{ fontSize: 13, color: c.reversed ? palette.rose : palette.textMute, marginTop: 6 }}>
            {c.reversed ? '逆位' : '正位'} · {ELEMENT_LABEL[c.card.element || 'spirit'] || '灵'}
          </div>
          <div style={{ fontSize: 12, color: palette.textSoft, marginTop: 8, lineHeight: 1.5 }}>
            {c.card.keywords.slice(0, 3).join(' · ')}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 13, color: palette.textMute, fontFamily: "'Cinzel', serif", letterSpacing: '0.1em', marginBottom: 6 }}>
            {pos?.name || '此刻的牌'} · {pos?.meaning || ''}
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: palette.textBase, margin: 0 }}>
            {truncate(dimText, 70)}
          </p>
        </div>
      </div>

      <Spacer flex={1} minHeight={12} />

      <Divider palette={palette} />
      <SectionTitle text="塔罗师的回应" palette={palette} size={17} marginTop={14} />
      <VerdictBar verdict={directAnswer.verdict} verdictColor={verdictColor} energyPct={energyPct} palette={palette} size="md" marginTop={10} />
      <p style={{ fontSize: 19, lineHeight: 1.55, color: palette.textStrong, fontWeight: 500, margin: '12px 0 0' }}>
        {truncate(directAnswer.headline, 70)}
      </p>

      <Spacer flex={1} minHeight={12} />

      {actionPlan.length > 0 && (
        <>
          <Divider palette={palette} />
          <SectionTitle text="行动指引" palette={palette} size={17} marginTop={14} />
          <ActionList items={actionPlan} palette={palette} size="md" max={2} marginTop={10} />
        </>
      )}

      <Spacer flex={1} minHeight={12} />
      <Footer palette={palette} closingText={closingText} align="center" />
    </div>
  );
}

// ============================================================
// 竖屏 · 三牌 Flow 布局
// ============================================================

function ThreePortrait({ ctx }: { ctx: CardCtx }) {
  const { question, drawnCards, positions, spreadName, theme, directAnswer, actionPlan, closingText, palette, verdictColor, energyPct, dateStr, themeDim } = ctx;

  return (
    <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', padding: '36px 44px 28px' }}>
      <Header palette={palette} dateStr={dateStr} size={28} dateSize={15} />
      <Divider palette={palette} />

      <SectionTitle text="你所问" palette={palette} size={17} marginTop={14} />
      <p style={{ fontSize: 21, lineHeight: 1.5, color: palette.textStrong, fontStyle: 'italic', fontWeight: 500, margin: '10px 0 0' }}>
        {question ? `「${truncate(question, 44)}」` : '— 静心冥想此刻的疑问 —'}
      </p>
      <Tag palette={palette} marginTop={10}>{theme.label}主题 · {spreadName}</Tag>

      {/* 三牌横排 */}
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        {drawnCards.map((c, i) => {
          const pos = positions[c.position];
          const reading = c.reversed ? c.card.reversed : c.card.upright;
          const dimText = (themeDim !== 'general' ? (reading as any)[themeDim] : '') || reading.general;
          return (
            <div key={i} style={{
              flex: '1 1 0', padding: '14px 10px', borderRadius: 12,
              backgroundColor: palette.panel, border: `1px solid ${palette.borderSoft}`, textAlign: 'center',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ fontSize: 13, color: palette.gold, fontFamily: "'Cinzel', serif", letterSpacing: '0.1em', marginBottom: 4 }}>
                {pos?.name || `第${i + 1}张`}
              </div>
              <div style={{ fontSize: 32, color: palette.gold, lineHeight: 1, margin: '4px 0' }}>{c.card.symbol || '✦'}</div>
              <div style={{ fontSize: 19, color: palette.lightgold, fontWeight: 600, lineHeight: 1.3 }}>{c.card.name.cn}</div>
              <div style={{ fontSize: 12, color: c.reversed ? palette.rose : palette.textMute, marginTop: 4 }}>
                {c.reversed ? '逆位' : '正位'}
              </div>
              <div style={{ fontSize: 12, color: palette.textSoft, marginTop: 8, lineHeight: 1.5, textAlign: 'left' }}>
                {truncate(dimText, 28)}
              </div>
            </div>
          );
        })}
      </div>

      <Spacer flex={1} minHeight={12} />

      <Divider palette={palette} />
      <SectionTitle text="塔罗师的回应" palette={palette} size={17} marginTop={14} />
      <VerdictBar verdict={directAnswer.verdict} verdictColor={verdictColor} energyPct={energyPct} palette={palette} size="md" marginTop={10} />
      <p style={{ fontSize: 19, lineHeight: 1.55, color: palette.textStrong, fontWeight: 500, margin: '12px 0 0' }}>
        {truncate(directAnswer.headline, 64)}
      </p>
      {directAnswer.reasoning && (
        <p style={{ fontSize: 14, lineHeight: 1.7, color: palette.textSoft, margin: '10px 0 0', fontStyle: 'italic' }}>
          {truncate(directAnswer.reasoning, 80)}
        </p>
      )}

      <Spacer flex={1} minHeight={12} />

      {actionPlan.length > 0 && (
        <>
          <Divider palette={palette} />
          <SectionTitle text="行动指引" palette={palette} size={17} marginTop={14} />
          <ActionList items={actionPlan} palette={palette} size="md" max={2} marginTop={10} />
        </>
      )}

      <Spacer flex={1} minHeight={12} />
      <Footer palette={palette} closingText={closingText} align="center" />
    </div>
  );
}

// ============================================================
// 竖屏 · 十牌 Celtic 网格布局
// ============================================================

function CelticPortrait({ ctx }: { ctx: CardCtx }) {
  const { question, drawnCards, positions, spreadName, theme, directAnswer, actionPlan, closingText, palette, verdictColor, energyPct, dateStr } = ctx;
  // 2 列 × 5 行紧凑网格
  return (
    <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 40px 24px' }}>
      <Header palette={palette} dateStr={dateStr} size={26} dateSize={14} />
      <Divider palette={palette} />

      <SectionTitle text="你所问" palette={palette} size={16} marginTop={12} />
      <p style={{ fontSize: 19, lineHeight: 1.45, color: palette.textStrong, fontStyle: 'italic', fontWeight: 500, margin: '8px 0 0' }}>
        {question ? `「${truncate(question, 36)}」` : '— 静心冥想此刻的疑问 —'}
      </p>
      <Tag palette={palette} marginTop={8}>{theme.label}主题 · {spreadName}</Tag>

      {/* 10 牌 2×5 网格 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
        {drawnCards.map((c, i) => {
          const pos = positions[c.position];
          return (
            <div key={i} style={{
              padding: '8px 10px', borderRadius: 8,
              backgroundColor: palette.panel, border: `1px solid ${palette.borderSoft}`,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 20, color: palette.gold, flexShrink: 0 }}>{c.card.symbol || '✦'}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 11, color: palette.textMute, fontFamily: "'Cinzel', serif", letterSpacing: '0.06em' }}>
                  {pos?.name || `第${i + 1}张`}
                </div>
                <div style={{ fontSize: 14, color: palette.lightgold, fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.card.name.cn}{c.reversed ? '·逆' : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Spacer flex={1} minHeight={10} />

      <Divider palette={palette} />
      <SectionTitle text="塔罗师的回应" palette={palette} size={16} marginTop={12} />
      <VerdictBar verdict={directAnswer.verdict} verdictColor={verdictColor} energyPct={energyPct} palette={palette} size="sm" marginTop={8} />
      <p style={{ fontSize: 17, lineHeight: 1.5, color: palette.textStrong, fontWeight: 500, margin: '10px 0 0' }}>
        {truncate(directAnswer.headline, 60)}
      </p>
      {directAnswer.reasoning && (
        <p style={{ fontSize: 13, lineHeight: 1.7, color: palette.textSoft, margin: '8px 0 0', fontStyle: 'italic' }}>
          {truncate(directAnswer.reasoning, 90)}
        </p>
      )}

      <Spacer flex={1} minHeight={10} />

      {actionPlan.length > 0 && (
        <>
          <Divider palette={palette} />
          <SectionTitle text="行动指引" palette={palette} size={16} marginTop={12} />
          <ActionList items={actionPlan} palette={palette} size="sm" max={2} marginTop={8} />
        </>
      )}

      <Spacer flex={1} minHeight={10} />
      <Footer palette={palette} closingText={closingText} align="center" />
    </div>
  );
}

// ============================================================
// 横屏 · 单牌布局（左 Hero 右解读）
// ============================================================

function SingleLandscape({ ctx }: { ctx: CardCtx }) {
  const { question, drawnCards, positions, spreadName, theme, directAnswer, actionPlan, closingText, palette, verdictColor, energyPct, dateStr, themeDim } = ctx;
  const c = drawnCards[0];
  const pos = positions[c.position];
  const reading = c.reversed ? c.card.reversed : c.card.upright;
  const dimText = (themeDim !== 'general' ? (reading as any)[themeDim] : '') || reading.general;

  return (
    <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', padding: '28px 40px 22px' }}>
      <div style={{ flex: '0 0 38%', display: 'flex', flexDirection: 'column', paddingRight: 24, borderRight: `1px solid ${palette.borderSoft}` }}>
        <Header palette={palette} dateStr={dateStr} size={24} dateSize={13} />
        <SectionTitle text="你所问" palette={palette} size={15} marginTop={14} />
        <p style={{ fontSize: 18, lineHeight: 1.4, color: palette.textStrong, fontStyle: 'italic', fontWeight: 500, margin: '8px 0 0' }}>
          {question ? `「${truncate(question, 36)}」` : '— 静心冥想此刻的疑问 —'}
        </p>
        <Tag palette={palette} marginTop={8}>{theme.label}主题 · {spreadName}</Tag>

        {/* Hero 牌 */}
        <div style={{ marginTop: 16, padding: '16px 12px', borderRadius: 12, background: `linear-gradient(180deg, ${palette.panel}, ${palette.borderSoft})`, border: `1px solid ${palette.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: 40, color: palette.gold, lineHeight: 1, marginBottom: 6 }}>{c.card.symbol || '✦'}</div>
          <div style={{ fontSize: 22, color: palette.lightgold, fontWeight: 600, lineHeight: 1.3 }}>{c.card.name.cn}</div>
          <div style={{ fontSize: 12, color: c.reversed ? palette.rose : palette.textMute, marginTop: 5 }}>
            {c.reversed ? '逆位' : '正位'} · {ELEMENT_LABEL[c.card.element || 'spirit'] || '灵'} · {pos?.name || ''}
          </div>
          <div style={{ fontSize: 11, color: palette.textSoft, marginTop: 6 }}>{c.card.keywords.slice(0, 3).join(' · ')}</div>
        </div>

        <Spacer flex={1} minHeight={8} />
        <Footer palette={palette} closingText={closingText} align="left" />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingLeft: 24 }}>
        <SectionTitle text="牌义解读" palette={palette} size={15} marginTop={0} />
        <p style={{ fontSize: 15, lineHeight: 1.7, color: palette.textBase, margin: '10px 0 0' }}>
          {truncate(dimText, 100)}
        </p>

        <Divider palette={palette} />
        <SectionTitle text="塔罗师的回应" palette={palette} size={15} marginTop={12} />
        <VerdictBar verdict={directAnswer.verdict} verdictColor={verdictColor} energyPct={energyPct} palette={palette} size="sm" marginTop={8} />
        <p style={{ fontSize: 17, lineHeight: 1.5, color: palette.textStrong, fontWeight: 500, margin: '10px 0 0' }}>
          {truncate(directAnswer.headline, 60)}
        </p>

        <Spacer flex={1} minHeight={8} />

        {actionPlan.length > 0 && (
          <>
            <Divider palette={palette} />
            <SectionTitle text="行动指引" palette={palette} size={15} marginTop={12} />
            <ActionList items={actionPlan} palette={palette} size="sm" max={2} marginTop={8} />
          </>
        )}

        <Spacer flex={1} minHeight={8} />
        <Footer palette={palette} closingText="" align="right" domainOnly />
      </div>
    </div>
  );
}

// ============================================================
// 横屏 · 三牌布局（左牌阵 右解读）
// ============================================================

function ThreeLandscape({ ctx }: { ctx: CardCtx }) {
  const { question, drawnCards, positions, spreadName, theme, directAnswer, actionPlan, closingText, palette, verdictColor, energyPct, dateStr, themeDim } = ctx;

  return (
    <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', padding: '28px 40px 22px' }}>
      <div style={{ flex: '0 0 44%', display: 'flex', flexDirection: 'column', paddingRight: 24, borderRight: `1px solid ${palette.borderSoft}` }}>
        <Header palette={palette} dateStr={dateStr} size={24} dateSize={13} />
        <SectionTitle text="你所问" palette={palette} size={15} marginTop={12} />
        <p style={{ fontSize: 17, lineHeight: 1.4, color: palette.textStrong, fontStyle: 'italic', fontWeight: 500, margin: '8px 0 0' }}>
          {question ? `「${truncate(question, 32)}」` : '— 静心冥想此刻的疑问 —'}
        </p>
        <Tag palette={palette} marginTop={8}>{theme.label}主题 · {spreadName}</Tag>

        {/* 三牌纵向 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
          {drawnCards.map((c, i) => {
            const pos = positions[c.position];
            const reading = c.reversed ? c.card.reversed : c.card.upright;
            const dimText = (themeDim !== 'general' ? (reading as any)[themeDim] : '') || reading.general;
            return (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 10, backgroundColor: palette.panel, border: `1px solid ${palette.borderSoft}`, alignItems: 'center' }}>
                <span style={{ fontSize: 26, color: palette.gold, flexShrink: 0 }}>{c.card.symbol || '✦'}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, color: palette.gold, fontFamily: "'Cinzel', serif", letterSpacing: '0.08em' }}>{pos?.name || `第${i + 1}张`}</div>
                  <div style={{ fontSize: 16, color: palette.lightgold, fontWeight: 600, lineHeight: 1.2 }}>{c.card.name.cn}<span style={{ fontSize: 11, color: c.reversed ? palette.rose : palette.textMute, marginLeft: 6 }}>{c.reversed ? '逆位' : '正位'}</span></div>
                  <div style={{ fontSize: 11, color: palette.textSoft, marginTop: 2, lineHeight: 1.4 }}>{truncate(dimText, 22)}</div>
                </div>
              </div>
            );
          })}
        </div>

        <Spacer flex={1} minHeight={8} />
        <Footer palette={palette} closingText={closingText} align="left" />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingLeft: 24 }}>
        <SectionTitle text="塔罗师的回应" palette={palette} size={15} marginTop={0} />
        <VerdictBar verdict={directAnswer.verdict} verdictColor={verdictColor} energyPct={energyPct} palette={palette} size="sm" marginTop={8} />
        <p style={{ fontSize: 17, lineHeight: 1.5, color: palette.textStrong, fontWeight: 500, margin: '10px 0 0' }}>
          {truncate(directAnswer.headline, 60)}
        </p>
        {directAnswer.reasoning && (
          <p style={{ fontSize: 13, lineHeight: 1.7, color: palette.textSoft, margin: '10px 0 0', fontStyle: 'italic' }}>
            {truncate(directAnswer.reasoning, 90)}
          </p>
        )}

        <Spacer flex={1} minHeight={8} />

        {actionPlan.length > 0 && (
          <>
            <Divider palette={palette} />
            <SectionTitle text="行动指引" palette={palette} size={15} marginTop={12} />
            <ActionList items={actionPlan} palette={palette} size="sm" max={2} marginTop={8} />
          </>
        )}

        <Spacer flex={1} minHeight={8} />
        <Footer palette={palette} closingText="" align="right" domainOnly />
      </div>
    </div>
  );
}

// ============================================================
// 横屏 · 十牌布局（左网格 右综合）
// ============================================================

function CelticLandscape({ ctx }: { ctx: CardCtx }) {
  const { question, drawnCards, positions, spreadName, theme, directAnswer, actionPlan, closingText, palette, verdictColor, energyPct, dateStr } = ctx;

  return (
    <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', padding: '26px 36px 20px' }}>
      <div style={{ flex: '0 0 46%', display: 'flex', flexDirection: 'column', paddingRight: 22, borderRight: `1px solid ${palette.borderSoft}` }}>
        <Header palette={palette} dateStr={dateStr} size={22} dateSize={12} />
        <SectionTitle text="你所问" palette={palette} size={14} marginTop={10} />
        <p style={{ fontSize: 15, lineHeight: 1.35, color: palette.textStrong, fontStyle: 'italic', fontWeight: 500, margin: '6px 0 0' }}>
          {question ? `「${truncate(question, 28)}」` : '— 静心冥想此刻的疑问 —'}
        </p>
        <Tag palette={palette} marginTop={6}>{theme.label} · {spreadName}</Tag>

        {/* 10 牌 5×2 网格 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginTop: 12 }}>
          {drawnCards.map((c, i) => {
            const pos = positions[c.position];
            return (
              <div key={i} style={{ padding: '7px 5px', borderRadius: 7, backgroundColor: palette.panel, border: `1px solid ${palette.borderSoft}`, textAlign: 'center' }}>
                <div style={{ fontSize: 18, color: palette.gold, lineHeight: 1 }}>{c.card.symbol || '✦'}</div>
                <div style={{ fontSize: 10, color: palette.textMute, marginTop: 2, fontFamily: "'Cinzel', serif" }}>{pos?.name || `${i + 1}`}</div>
                <div style={{ fontSize: 12, color: palette.lightgold, fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.card.name.cn}</div>
                <div style={{ fontSize: 9, color: c.reversed ? palette.rose : palette.textMute }}>{c.reversed ? '逆' : '正'}</div>
              </div>
            );
          })}
        </div>

        <Spacer flex={1} minHeight={8} />
        <Footer palette={palette} closingText={closingText} align="left" />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingLeft: 22 }}>
        <SectionTitle text="塔罗师的回应" palette={palette} size={14} marginTop={0} />
        <VerdictBar verdict={directAnswer.verdict} verdictColor={verdictColor} energyPct={energyPct} palette={palette} size="sm" marginTop={6} />
        <p style={{ fontSize: 16, lineHeight: 1.5, color: palette.textStrong, fontWeight: 500, margin: '8px 0 0' }}>
          {truncate(directAnswer.headline, 56)}
        </p>
        {directAnswer.reasoning && (
          <p style={{ fontSize: 12, lineHeight: 1.65, color: palette.textSoft, margin: '8px 0 0', fontStyle: 'italic' }}>
            {truncate(directAnswer.reasoning, 110)}
          </p>
        )}

        <Spacer flex={1} minHeight={8} />

        {actionPlan.length > 0 && (
          <>
            <Divider palette={palette} />
            <SectionTitle text="行动指引" palette={palette} size={14} marginTop={10} />
            <ActionList items={actionPlan} palette={palette} size="sm" max={2} marginTop={6} />
          </>
        )}

        <Spacer flex={1} minHeight={8} />
        <Footer palette={palette} closingText="" align="right" domainOnly />
      </div>
    </div>
  );
}

// ============================================================
// 共享子组件
// ============================================================

function Header({ palette, dateStr, size, dateSize }: { palette: Palette; dateStr: string; size: number; dateSize: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: palette.gold, fontSize: size }}>✦</span>
        <span style={{ fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontSize: size, letterSpacing: '0.08em', color: palette.lightgold, fontWeight: 600 }}>塔罗秘境</span>
      </div>
      <span style={{ fontSize: dateSize, color: palette.textMute, fontFamily: "'Inter', sans-serif" }}>{dateStr}</span>
    </div>
  );
}

function SectionTitle({ text, palette, size, marginTop }: { text: string; palette: Palette; size: number; marginTop: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop }}>
      <span style={{ width: 18, height: 1.5, background: palette.gold, opacity: 0.7 }} />
      <span style={{ fontFamily: "'Cinzel', 'Noto Serif SC', serif", fontSize: size, color: palette.gold, letterSpacing: '0.15em', fontWeight: 500 }}>{text}</span>
    </div>
  );
}

function Tag({ children, palette, marginTop }: { children: React.ReactNode; palette: Palette; marginTop: number }) {
  return (
    <div style={{ display: 'inline-block', marginTop, fontSize: 13, padding: '4px 14px', borderRadius: 999, color: palette.lightgold, border: `1px solid ${palette.border}`, backgroundColor: 'rgba(212,175,55,0.08)' }}>
      {children}
    </div>
  );
}

function Divider({ palette }: { palette: Palette }) {
  return <div style={{ height: 1, marginTop: 12, background: `linear-gradient(90deg, transparent, ${palette.border}, transparent)` }} />;
}

function Spacer({ flex, minHeight }: { flex: number; minHeight: number }) {
  return <div style={{ flex, minHeight }} />;
}

function VerdictBar({ verdict, verdictColor, energyPct, palette, size, marginTop }: { verdict: Verdict; verdictColor: string; energyPct: number; palette: Palette; size: 'sm' | 'md'; marginTop: number }) {
  const pad = size === 'md' ? '7px 20px' : '5px 16px';
  const fs = size === 'md' ? 17 : 14;
  const lblFs = size === 'md' ? 13 : 12;
  const valFs = size === 'md' ? 16 : 14;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop }}>
      <div style={{ padding: pad, borderRadius: 999, fontSize: fs, fontWeight: 600, color: verdictColor, border: `1px solid ${verdictColor}66`, backgroundColor: `${verdictColor}14`, fontFamily: "'Cinzel', 'Noto Serif SC', serif", letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
        {VERDICT_LABEL[verdict]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: lblFs, color: palette.textMute, marginBottom: 4 }}>
          <span>能量值</span>
          <span style={{ color: palette.lightgold, fontWeight: 600, fontSize: valFs }}>{energyPct}</span>
        </div>
        <div style={{ height: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ width: `${energyPct}%`, height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${verdictColor}, ${palette.gold})` }} />
        </div>
      </div>
    </div>
  );
}

function ActionList({ items, palette, size, max, marginTop }: { items: ActionItem[]; palette: Palette; size: 'sm' | 'md'; max: number; marginTop: number }) {
  const iconFs = size === 'md' ? 17 : 14;
  const lblFs = size === 'md' ? 12 : 11;
  const detailFs = size === 'md' ? 15 : 13;
  const pad = size === 'md' ? '11px 14px' : '9px 12px';
  const gap = size === 'md' ? 7 : 6;
  const limit = size === 'md' ? 46 : 38;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, marginTop }}>
      {items.slice(0, max).map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, padding: pad, borderRadius: 9, backgroundColor: palette.panel, border: `1px solid ${palette.borderSoft}` }}>
          <span style={{ fontSize: iconFs, color: item.kind === 'warning' ? palette.rose : palette.lightgold, lineHeight: 1.5, flexShrink: 0 }}>{ACTION_ICON[item.kind]}</span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: lblFs, color: palette.textMute, fontFamily: "'Cinzel', serif", letterSpacing: '0.08em', marginBottom: 3 }}>{ACTION_LABEL[item.kind]}</div>
            <div style={{ fontSize: detailFs, lineHeight: 1.5, color: palette.textBase }}>{truncate(item.detail, limit)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Footer({ palette, closingText, align, domainOnly }: { palette: Palette; closingText: string; align: 'left' | 'center' | 'right'; domainOnly?: boolean }) {
  return (
    <div style={{ textAlign: align }}>
      {!domainOnly && closingText && (
        <p style={{ fontFamily: "'Cinzel', 'Noto Serif SC', serif", fontSize: 15, color: palette.gold, letterSpacing: '0.12em', marginBottom: 8, fontWeight: 500 }}>
          ✦ {truncate(closingText, 20)} ✦
        </p>
      )}
      {!domainOnly && (
        <p style={{ fontSize: 11, color: palette.textMute, lineHeight: 1.5, fontStyle: 'italic', marginBottom: 10 }}>塔罗不预测命运，而是照亮当下。</p>
      )}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '7px 18px', borderRadius: 999, border: `1px solid ${palette.border}`, backgroundColor: 'rgba(212,175,55,0.08)' }}>
        <span style={{ fontSize: 14, color: palette.gold, marginRight: 6 }}>✧</span>
        <span style={{ fontSize: 14, color: palette.lightgold, fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: '0.08em' }}>{SITE_DOMAIN}</span>
        <span style={{ fontSize: 14, color: palette.gold, marginLeft: 6 }}>✧</span>
      </div>
      {!domainOnly && (
        <p style={{ fontSize: 10, color: palette.textMute, marginTop: 8, fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>扫码或访问 · 开启你的专属占卜</p>
      )}
    </div>
  );
}

function BackgroundDecor({ palette }: { palette: Palette }) {
  return (
    <>
      <div style={{ position: 'absolute', top: -120, right: -100, width: 360, height: 360, borderRadius: '50%', background: `radial-gradient(circle, ${palette.border} 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${palette.borderSoft} 0%, transparent 70%)`, pointerEvents: 'none' }} />
    </>
  );
}

// ============================================================
// 工具函数
// ============================================================

function truncate(text: string, max: number): string {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
