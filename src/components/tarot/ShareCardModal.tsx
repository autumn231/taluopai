import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng, getFontEmbedCSS } from 'html-to-image';
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
  track: string;
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
  track: 'rgba(255,255,255,0.08)',
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
  track: 'rgba(60,45,10,0.14)',
  emerald: '#2d8659',
  rose: '#c0392b',
  amber: '#b8860b',
};

const VERDICT_COLOR: Record<Verdict, keyof Palette> = {
  positive: 'lightgold',
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

// 画布尺寸：宽度固定；高度只作下限，内容更高时画布随之长高（根治底部截断）
const PORTRAIT_W = 750;
const PORTRAIT_MIN_H = 1200;
const LANDSCAPE_W = 1200;
const LANDSCAPE_MIN_H = 750;

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

// 字体嵌入 CSS 只取决于页面字体、与海报内容无关：模块级懒加载，跨次生成只算一次
// （toPng 默认每次都会重新解析样式并内嵌字体，是生成耗时的大头）
let fontEmbedCSSPromise: Promise<string> | null = null;
function loadFontEmbedCSS(node: HTMLElement): Promise<string> {
  if (!fontEmbedCSSPromise) {
    fontEmbedCSSPromise = getFontEmbedCSS(node).catch((err) => {
      fontEmbedCSSPromise = null; // 失败不缓存，允许下次重试
      throw err;
    });
  }
  return fontEmbedCSSPromise;
}

// ============================================================
// 主组件
// ============================================================

export default function ShareCardModal({ open, onClose, ...data }: ShareCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  // Blob URL 用于 <img> 渲染；data URL 用于下载 —— 夸克可能拦截 blob: 和程序化 <a download>
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const imageUrlRef = useRef<string | null>(null); // 追踪当前 URL，避免依赖链循环
  const dataUrlRef = useRef<string | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const [posterStyle, setPosterStyle] = useState<PosterStyle>('dark');
  const [orientation, setOrientation] = useState<PosterOrientation>('portrait');
  const [downloadHint, setDownloadHint] = useState<string | null>(null);

  const palette = posterStyle === 'dark' ? DARK : LIGHT;
  const isPortrait = orientation === 'portrait';
  const canvasW = isPortrait ? PORTRAIT_W : LANDSCAPE_W;
  const canvasMinH = isPortrait ? PORTRAIT_MIN_H : LANDSCAPE_MIN_H;
  const previewW = isPortrait ? 280 : 380;
  const scale = previewW / canvasW;
  // 海报实际高度由内容决定（不低于 canvasMinH）：实测节点 offsetHeight 后驱动预览高度
  const [naturalH, setNaturalH] = useState(canvasMinH);
  const previewH = naturalH * scale;

  // 释放上一个 Blob URL，避免内存泄漏
  const revokeImageUrl = useCallback(() => {
    const url = imageUrlRef.current;
    if (url) {
      URL.revokeObjectURL(url);
      imageUrlRef.current = null;
      setImageUrl(null);
    }
    blobRef.current = null;
    dataUrlRef.current = null;
  }, []); // 无依赖，引用稳定

  useEffect(() => {
    if (open) {
      setStatus('idle');
      revokeImageUrl();
      setDownloadHint(null);
    }
  }, [open, revokeImageUrl]);

  // 组件卸载时释放 Blob URL
  useEffect(() => {
    return () => {
      const url = imageUrlRef.current;
      if (url) URL.revokeObjectURL(url);
    };
  }, []);

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

  // 实测海报节点自然高度（offsetHeight 是布局高度，不受预览缩放 transform 影响），供预览容器定高
  useEffect(() => {
    if (!open) return;
    const node = cardRef.current;
    if (!node) return;
    const measure = () => setNaturalH(node.offsetHeight);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, [open, orientation, posterStyle]);

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
      const fontEmbedCSS = await loadFontEmbedCSS(node);
      // 导出高度用点击时的实测自然高度：内容多高就出多高，不再按固定画布截断
      const exportH = node.offsetHeight;
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        fontEmbedCSS,
        width: canvasW,
        height: exportH,
        backgroundColor: palette.bg,
        style: { transform: 'none', margin: '0' },
      });
      // 手动 base64 → Blob，完全绕过 fetch(data:)（理由见上）
      // 按 32,768 字符分块解码，再由 parts 数组一次构造 Blob
      const commaIdx = dataUrl.indexOf(',');
      const mime = dataUrl.slice(0, commaIdx).match(/:(.*?);/)![1];
      const base64 = dataUrl.slice(commaIdx + 1);
      const parts: BlobPart[] = [];
      for (let offset = 0; offset < base64.length; offset += 32768) {
        const binaryStr = atob(base64.slice(offset, offset + 32768));
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        parts.push(bytes);
      }
      const blob = new Blob(parts, { type: mime });
      // 释放旧的 Blob URL（用 ref 读取，避免依赖 imageUrl 导致循环触发）
      const oldUrl = imageUrlRef.current;
      if (oldUrl) URL.revokeObjectURL(oldUrl);
      blobRef.current = blob;
      dataUrlRef.current = dataUrl;
      const url = URL.createObjectURL(blob);
      imageUrlRef.current = url;
      setImageUrl(url);
      setStatus('done');
    } catch (err) {
      console.error('生成图片失败', err);
      setStatus('error');
    }
  }, [canvasW, palette.bg]);

  /**
   * 手机端保存图片 - 新窗口手动下载（最兼容模式）
   *
   * 统一策略：在用户点击「保存图片」的同步上下文里 window.open 一个新窗口，
   * 写入自包含 HTML（内嵌 data URL 图片 + 下载按钮 + 提示语）。
   * 用户在新窗口点击按钮才触发下载，不自动下载。
   *
   * 兼容性要点：
   * - 同步用户手势内调用 window.open，不会被弹窗拦截
   * - 用 data URL（而非 blob:）—— 夸克/QQ/UC 等浏览器对 blob: 下载拦截更严
   * - 用户手动点击下载按钮，触发最自然的下载流程
   * - 新窗口里同时显示图片，长按「保存到相册」是兜底
   */
  const openMobileDownloadWindow = useCallback((dataUrl: string, fileName: string) => {
    const win = window.open('', '_blank');
    if (!win) {
      // 弹窗被拦截 → 降级到当前页直接触发下载
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadHint('已开始下载，请查看下载文件夹；若未下载可长按图片保存');
      setTimeout(() => setDownloadHint(null), 5000);
      return;
    }

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<title>保存塔罗海报</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  html, body { min-height: 100%; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
    background: #0e0828;
    color: #f5f3ff;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
    gap: 14px;
  }
  h1 { font-size: 17px; color: #f4d03f; font-weight: 600; letter-spacing: 0.08em; }
  .img-wrap { max-width: 100%; display: flex; justify-content: center; }
  .img-wrap img {
    max-width: 100%; max-height: 65vh; object-fit: contain; border-radius: 8px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.45);
  }
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 36px; border-radius: 999px;
    background: linear-gradient(135deg, #f4d03f 0%, #d4af37 100%);
    color: #0a0824; text-decoration: none; font-weight: 600;
    font-size: 15px; letter-spacing: 0.1em; border: 1px solid #d4af37; cursor: pointer;
  }
  .hint { font-size: 12px; color: #c4b8d8; text-align: center; line-height: 1.6; }
</style>
</head>
<body>
  <h1>✦ 塔罗占卜海报</h1>
  <div class="img-wrap"><img src="${dataUrl}" alt="塔罗占卜海报" /></div>
  <a class="btn" href="${dataUrl}" download="${fileName}">⬇ 点击下载到手机</a>
  <p class="hint">请点击上方按钮下载<br/>也可长按图片「保存到相册」<br/>如果无法下载，请更换浏览器</p>
</body>
</html>`;

    win.document.open();
    win.document.write(html);
    win.document.close();
    setDownloadHint('已在新窗口打开，请点击按钮下载');
    setTimeout(() => setDownloadHint(null), 5000);
  }, []);

  const handleDownload = useCallback(async () => {
    const blob = blobRef.current;
    const dataUrl = dataUrlRef.current;
    if (!blob || !dataUrl || !imageUrl) return;
    const fileName = `塔罗占卜_${new Date().toISOString().slice(0, 10)}.png`;

    // 检测是否为移动端（触摸设备）
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
      // 手机端：新窗口打开 + 自动下载（最兼容模式，所有浏览器统一）
      openMobileDownloadWindow(dataUrl, fileName);
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
  }, [imageUrl, openMobileDownloadWindow]);

  return (
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
                    minHeight={canvasMinH}
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
// 海报本体：宽度固定、高度随内容自适应（minHeight 为下限）+ 按牌数分发
// ============================================================

interface ShareCardProps extends ShareCardData {
  palette: Palette;
  orientation: PosterOrientation;
  width: number;
  minHeight: number;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { question, drawnCards, positions, spreadName, theme, directAnswer, actionPlan, closingText, palette, orientation, width, minHeight },
  ref,
) {
  const dateStr = formatDate(new Date());
  const verdictColor = palette[VERDICT_COLOR[directAnswer.verdict]];
  const energyPct = Math.round(((directAnswer.score + 100) / 200) * 100);
  const layout = detectLayout(drawnCards.length);
  const themeDim = THEME_DIM[theme.label] || 'general';

  const rootStyle: CSSProperties = {
    width, minHeight,
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
  const dimText = dimTextFor(themeDim, c);

  return (
    <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', padding: '36px 44px 28px' }}>
      <Header palette={palette} dateStr={dateStr} size={28} dateSize={15} />
      <Divider palette={palette} />

      <QuestionBlock palette={palette} question={question} tagText={`${theme.label}主题 · ${spreadName}`}
        titleSize={17} titleMt={16} questionSize={22} questionMax={50} questionLh={1.5} questionMt={10} tagMt={10} />

      {/* Hero 牌 */}
      <div style={{ marginTop: 18, display: 'flex', gap: 18, alignItems: 'stretch' }}>
        <div style={{
          flex: '0 0 200px', padding: '18px 14px', borderRadius: 14,
          background: `linear-gradient(180deg, ${palette.panel}, ${palette.borderSoft})`,
          border: `1px solid ${palette.border}`, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 36, color: palette.lightgold, fontWeight: 600, lineHeight: 1.3 }}>{c.card.name.cn}</div>
          {c.card.symbol && (
            <div style={{ fontSize: 14, color: palette.textSoft, marginTop: 6, lineHeight: 1.5 }}>{c.card.symbol}</div>
          )}
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

      <div style={{ height: 24 }} />

      <ResponseBlock palette={palette} directAnswer={directAnswer} verdictColor={verdictColor} energyPct={energyPct}
        withDivider titleSize={17} titleMt={14} verdictSize="md" verdictMt={10}
        headlineSize={19} headlineMax={70} headlineLh={1.55} headlineMt={12} />

      <div style={{ height: 24 }} />

      <ActionsBlock palette={palette} actionPlan={actionPlan} titleSize={17} titleMt={14} listSize="md" listMt={10} />

      <div style={{ marginTop: 'auto', paddingTop: 24 }}>
        <Footer palette={palette} closingText={closingText} align="center" />
      </div>
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

      <QuestionBlock palette={palette} question={question} tagText={`${theme.label}主题 · ${spreadName}`}
        titleSize={17} titleMt={14} questionSize={21} questionMax={44} questionLh={1.5} questionMt={10} tagMt={10} />

      {/* 三牌横排 */}
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        {drawnCards.map((c, i) => {
          const pos = positions[c.position];
          const dimText = dimTextFor(themeDim, c);
          return (
            <div key={i} style={{
              flex: '1 1 0', padding: '14px 10px', borderRadius: 12,
              backgroundColor: palette.panel, border: `1px solid ${palette.borderSoft}`, textAlign: 'center',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ fontSize: 13, color: palette.gold, fontFamily: "'Cinzel', serif", letterSpacing: '0.1em', marginBottom: 4 }}>
                {pos?.name || `第${i + 1}张`}
              </div>
              <div style={{ fontSize: 21, color: palette.lightgold, fontWeight: 600, lineHeight: 1.3 }}>{c.card.name.cn}</div>
              {c.card.symbol && (
                <div style={{ fontSize: 12, color: palette.textSoft, marginTop: 4, lineHeight: 1.4 }}>{c.card.symbol}</div>
              )}
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

      <div style={{ height: 24 }} />

      <ResponseBlock palette={palette} directAnswer={directAnswer} verdictColor={verdictColor} energyPct={energyPct}
        withDivider titleSize={17} titleMt={14} verdictSize="md" verdictMt={10}
        headlineSize={19} headlineMax={64} headlineLh={1.55} headlineMt={12}
        reasoning={{ size: 14, max: 80, lh: 1.7, mt: 10 }} />

      <div style={{ height: 24 }} />

      <ActionsBlock palette={palette} actionPlan={actionPlan} titleSize={17} titleMt={14} listSize="md" listMt={10} />

      <div style={{ marginTop: 'auto', paddingTop: 24 }}>
        <Footer palette={palette} closingText={closingText} align="center" />
      </div>
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

      <QuestionBlock palette={palette} question={question} tagText={`${theme.label}主题 · ${spreadName}`}
        titleSize={16} titleMt={12} questionSize={19} questionMax={36} questionLh={1.45} questionMt={8} tagMt={8} />

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
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 11, color: palette.textMute, fontFamily: "'Cinzel', serif", letterSpacing: '0.06em' }}>
                  {pos?.name || `第${i + 1}张`}
                </div>
                <div style={{ fontSize: 15, color: palette.lightgold, fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.card.name.cn}{c.reversed ? '·逆' : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ height: 24 }} />

      <ResponseBlock palette={palette} directAnswer={directAnswer} verdictColor={verdictColor} energyPct={energyPct}
        withDivider titleSize={16} titleMt={12} verdictSize="sm" verdictMt={8}
        headlineSize={17} headlineMax={60} headlineLh={1.5} headlineMt={10}
        reasoning={{ size: 13, max: 90, lh: 1.7, mt: 8 }} />

      <div style={{ height: 24 }} />

      <ActionsBlock palette={palette} actionPlan={actionPlan} titleSize={16} titleMt={12} listSize="sm" listMt={8} />

      <div style={{ marginTop: 'auto', paddingTop: 24 }}>
        <Footer palette={palette} closingText={closingText} align="center" />
      </div>
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
  const dimText = dimTextFor(themeDim, c);

  return (
    <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', padding: '28px 40px 22px' }}>
      <div style={{ flex: '0 0 38%', display: 'flex', flexDirection: 'column', paddingRight: 24, borderRight: `1px solid ${palette.borderSoft}` }}>
        <Header palette={palette} dateStr={dateStr} size={24} dateSize={13} />
        <QuestionBlock palette={palette} question={question} tagText={`${theme.label}主题 · ${spreadName}`}
          titleSize={15} titleMt={14} questionSize={18} questionMax={36} questionLh={1.4} questionMt={8} tagMt={8} />

        {/* Hero 牌 */}
        <div style={{ marginTop: 16, padding: '16px 12px', borderRadius: 12, background: `linear-gradient(180deg, ${palette.panel}, ${palette.borderSoft})`, border: `1px solid ${palette.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: 34, color: palette.lightgold, fontWeight: 600, lineHeight: 1.3 }}>{c.card.name.cn}</div>
          {c.card.symbol && (
            <div style={{ fontSize: 14, color: palette.textSoft, marginTop: 5, lineHeight: 1.5 }}>{c.card.symbol}</div>
          )}
          <div style={{ fontSize: 12, color: c.reversed ? palette.rose : palette.textMute, marginTop: 5 }}>
            {c.reversed ? '逆位' : '正位'} · {ELEMENT_LABEL[c.card.element || 'spirit'] || '灵'} · {pos?.name || ''}
          </div>
          <div style={{ fontSize: 11, color: palette.textSoft, marginTop: 6 }}>{c.card.keywords.slice(0, 3).join(' · ')}</div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 18 }}>
          <Footer palette={palette} closingText={closingText} align="left" />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingLeft: 24 }}>
        <SectionTitle text="牌义解读" palette={palette} size={15} marginTop={0} />
        <p style={{ fontSize: 15, lineHeight: 1.7, color: palette.textBase, margin: '10px 0 0' }}>
          {truncate(dimText, 100)}
        </p>

        <ResponseBlock palette={palette} directAnswer={directAnswer} verdictColor={verdictColor} energyPct={energyPct}
          withDivider titleSize={15} titleMt={12} verdictSize="sm" verdictMt={8}
          headlineSize={17} headlineMax={60} headlineLh={1.5} headlineMt={10} />

        <div style={{ height: 18 }} />

        <ActionsBlock palette={palette} actionPlan={actionPlan} titleSize={15} titleMt={12} listSize="sm" listMt={8} />
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
        <QuestionBlock palette={palette} question={question} tagText={`${theme.label}主题 · ${spreadName}`}
          titleSize={15} titleMt={12} questionSize={17} questionMax={32} questionLh={1.4} questionMt={8} tagMt={8} />

        {/* 三牌纵向 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
          {drawnCards.map((c, i) => {
            const pos = positions[c.position];
            const dimText = dimTextFor(themeDim, c);
            return (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 10, backgroundColor: palette.panel, border: `1px solid ${palette.borderSoft}`, alignItems: 'center' }}>
                <div style={{ flexShrink: 0, fontSize: 24, color: palette.lightgold, fontWeight: 600, lineHeight: 1.2 }}>
                  {c.card.name.cn}
                  <span style={{ fontSize: 11, fontWeight: 400, color: c.reversed ? palette.rose : palette.textMute, marginLeft: 6 }}>{c.reversed ? '逆位' : '正位'}</span>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, color: palette.gold, fontFamily: "'Cinzel', serif", letterSpacing: '0.08em' }}>{pos?.name || `第${i + 1}张`}</div>
                  {c.card.symbol && (
                    <div style={{ fontSize: 12, color: palette.textSoft, marginTop: 2, lineHeight: 1.4 }}>{c.card.symbol}</div>
                  )}
                  <div style={{ fontSize: 11, color: palette.textSoft, marginTop: 2, lineHeight: 1.4 }}>{truncate(dimText, 22)}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 18 }}>
          <Footer palette={palette} closingText={closingText} align="left" />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingLeft: 24 }}>
        <ResponseBlock palette={palette} directAnswer={directAnswer} verdictColor={verdictColor} energyPct={energyPct}
          titleSize={15} titleMt={0} verdictSize="sm" verdictMt={8}
          headlineSize={17} headlineMax={60} headlineLh={1.5} headlineMt={10}
          reasoning={{ size: 13, max: 90, lh: 1.7, mt: 10 }} />

        <div style={{ height: 18 }} />

        <ActionsBlock palette={palette} actionPlan={actionPlan} titleSize={15} titleMt={12} listSize="sm" listMt={8} />
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
        <QuestionBlock palette={palette} question={question} tagText={`${theme.label} · ${spreadName}`}
          titleSize={14} titleMt={10} questionSize={15} questionMax={28} questionLh={1.35} questionMt={6} tagMt={6} />

        {/* 10 牌 5×2 网格 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginTop: 12 }}>
          {drawnCards.map((c, i) => {
            const pos = positions[c.position];
            return (
              <div key={i} style={{ padding: '7px 5px', borderRadius: 7, backgroundColor: palette.panel, border: `1px solid ${palette.borderSoft}`, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: palette.textMute, marginTop: 2, fontFamily: "'Cinzel', serif" }}>{pos?.name || `${i + 1}`}</div>
                <div style={{ fontSize: 13, color: palette.lightgold, fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.card.name.cn}</div>
                <div style={{ fontSize: 9, color: c.reversed ? palette.rose : palette.textMute }}>{c.reversed ? '逆' : '正'}</div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 18 }}>
          <Footer palette={palette} closingText={closingText} align="left" />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingLeft: 22 }}>
        <ResponseBlock palette={palette} directAnswer={directAnswer} verdictColor={verdictColor} energyPct={energyPct}
          titleSize={14} titleMt={0} verdictSize="sm" verdictMt={6}
          headlineSize={16} headlineMax={56} headlineLh={1.5} headlineMt={8}
          reasoning={{ size: 12, max: 110, lh: 1.65, mt: 8 }} />

        <div style={{ height: 18 }} />

        <ActionsBlock palette={palette} actionPlan={actionPlan} titleSize={14} titleMt={10} listSize="sm" listMt={6} />
      </div>
    </div>
  );
}

// ============================================================
// 共享子组件
// ============================================================

function QuestionBlock({ palette, question, tagText, titleSize, titleMt, questionSize, questionMax, questionLh, questionMt, tagMt }: {
  palette: Palette;
  question: string;
  tagText: string;
  titleSize: number;
  titleMt: number;
  questionSize: number;
  questionMax: number;
  questionLh: number;
  questionMt: number;
  tagMt: number;
}) {
  return (
    <>
      <SectionTitle text="你所问" palette={palette} size={titleSize} marginTop={titleMt} />
      <p style={{ fontSize: questionSize, lineHeight: questionLh, color: palette.textStrong, fontStyle: 'italic', fontWeight: 500, margin: `${questionMt}px 0 0` }}>
        {question ? `「${truncate(question, questionMax)}」` : '— 静心冥想此刻的疑问 —'}
      </p>
      <Tag palette={palette} marginTop={tagMt}>{tagText}</Tag>
    </>
  );
}

function ResponseBlock({ palette, directAnswer, verdictColor, energyPct, withDivider, titleSize, titleMt, verdictSize, verdictMt, headlineSize, headlineMax, headlineLh, headlineMt, reasoning }: {
  palette: Palette;
  directAnswer: DirectAnswerType;
  verdictColor: string;
  energyPct: number;
  withDivider?: boolean;
  titleSize: number;
  titleMt: number;
  verdictSize: 'sm' | 'md';
  verdictMt: number;
  headlineSize: number;
  headlineMax: number;
  headlineLh: number;
  headlineMt: number;
  reasoning?: { size: number; max: number; lh: number; mt: number };
}) {
  return (
    <>
      {withDivider && <Divider palette={palette} />}
      <SectionTitle text="塔罗师的回应" palette={palette} size={titleSize} marginTop={titleMt} />
      <VerdictBar verdict={directAnswer.verdict} verdictColor={verdictColor} energyPct={energyPct} palette={palette} size={verdictSize} marginTop={verdictMt} />
      <p style={{ fontSize: headlineSize, lineHeight: headlineLh, color: palette.textStrong, fontWeight: 500, margin: `${headlineMt}px 0 0` }}>
        {truncate(directAnswer.headline, headlineMax)}
      </p>
      {reasoning && directAnswer.reasoning && (
        <p style={{ fontSize: reasoning.size, lineHeight: reasoning.lh, color: palette.textSoft, margin: `${reasoning.mt}px 0 0`, fontStyle: 'italic' }}>
          {truncate(directAnswer.reasoning, reasoning.max)}
        </p>
      )}
    </>
  );
}

function ActionsBlock({ palette, actionPlan, titleSize, titleMt, listSize, listMt }: {
  palette: Palette;
  actionPlan: ActionItem[];
  titleSize: number;
  titleMt: number;
  listSize: 'sm' | 'md';
  listMt: number;
}) {
  if (actionPlan.length === 0) return null;
  return (
    <>
      <Divider palette={palette} />
      <SectionTitle text="行动指引" palette={palette} size={titleSize} marginTop={titleMt} />
      <ActionList items={actionPlan} palette={palette} size={listSize} max={2} marginTop={listMt} />
    </>
  );
}

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
        <div style={{ height: 5, borderRadius: 999, backgroundColor: palette.track, overflow: 'hidden' }}>
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

function Footer({ palette, closingText, align }: { palette: Palette; closingText: string; align: 'left' | 'center' | 'right' }) {
  return (
    <div style={{ textAlign: align }}>
      {closingText && (
        <p style={{ fontFamily: "'Cinzel', 'Noto Serif SC', serif", fontSize: 15, color: palette.gold, letterSpacing: '0.12em', lineHeight: 1.6, marginBottom: 8, fontWeight: 500 }}>
          ✦ {closingText} ✦
        </p>
      )}
      <p style={{ fontSize: 11, color: palette.textMute, lineHeight: 1.5, fontStyle: 'italic', marginBottom: 10 }}>塔罗不预测命运，而是照亮当下。</p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '7px 18px', borderRadius: 999, border: `1px solid ${palette.border}`, backgroundColor: 'rgba(212,175,55,0.08)' }}>
        <span style={{ fontSize: 14, color: palette.gold, marginRight: 6 }}>✧</span>
        <span style={{ fontSize: 14, color: palette.lightgold, fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: '0.08em' }}>{SITE_DOMAIN}</span>
        <span style={{ fontSize: 14, color: palette.gold, marginLeft: 6 }}>✧</span>
      </div>
      <p style={{ fontSize: 10, color: palette.textMute, marginTop: 8, fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>扫码或访问 · 开启你的专属占卜</p>
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

function dimTextFor(themeDim: 'love' | 'career' | 'wealth' | 'general', drawnCard: DrawnCard): string {
  const reading = drawnCard.reversed ? drawnCard.card.reversed : drawnCard.card.upright;
  return (themeDim !== 'general' ? (reading as any)[themeDim] : '') || reading.general;
}

function truncate(text: string, max: number): string {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
