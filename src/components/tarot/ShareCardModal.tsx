import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
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
const ELEMENT_LABEL: Record<string, string> = {
  fire: '火', water: '水', air: '风', earth: '土', spirit: '灵',
};

const SITE_DOMAIN = 'taluopai.tbit.xin';

// 画布尺寸（设计稿）
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
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [posterStyle, setPosterStyle] = useState<PosterStyle>('dark');
  const [orientation, setOrientation] = useState<PosterOrientation>('portrait');

  const palette = posterStyle === 'dark' ? DARK : LIGHT;
  const isPortrait = orientation === 'portrait';
  const canvasW = isPortrait ? PORTRAIT_W : LANDSCAPE_W;
  const canvasH = isPortrait ? PORTRAIT_H : LANDSCAPE_H;
  const previewW = isPortrait ? 280 : 380;
  const scale = previewW / canvasW;

  useEffect(() => {
    if (open) {
      setStatus('idle');
      setDataUrl(null);
    }
  }, [open]);

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

  // 切换选项时重置已生成图片
  useEffect(() => {
    setDataUrl(null);
    setStatus('idle');
  }, [posterStyle, orientation]);

  const handleGenerate = useCallback(async () => {
    const node = cardRef.current;
    if (!node) return;
    setStatus('generating');
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise((r) => setTimeout(r, 120));
      const rect = node.getBoundingClientRect();
      const url = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        backgroundColor: palette.bg,
        style: { transform: 'none', margin: '0' },
      });
      setDataUrl(url);
      setStatus('done');
    } catch (err) {
      console.error('生成图片失败', err);
      setStatus('error');
    }
  }, [palette.bg]);

  const [downloadHint, setDownloadHint] = useState<string | null>(null);

  const handleDownload = useCallback(async () => {
    if (!dataUrl) return;
    const fileName = `塔罗占卜_${new Date().toISOString().slice(0, 10)}.png`;

    // 方案 1：Blob URL download（Chrome/Edge 支持好）
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch (err) {
      console.error('Blob 下载失败', err);
    }

    // 方案 2：新标签页打开图片（夸克/UC/Safari 长按保存）
    // 延迟 300ms 避免被浏览器当作弹窗拦截
    setTimeout(() => {
      window.open(dataUrl, '_blank');
    }, 300);

    setDownloadHint('已打开图片，长按图片即可保存到相册');
    setTimeout(() => setDownloadHint(null), 8000);
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
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center hover:bg-mystic-gold/15"
            style={{ backgroundColor: 'rgba(30, 18, 64, 0.6)', border: `1px solid ${DARK.border}`, color: DARK.textSoft }}
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
            style={{ backgroundColor: DARK.bg, border: `1px solid ${DARK.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题栏 */}
            <div
              className="flex items-center gap-2 px-5 py-3.5 sticky top-0 z-10"
              style={{ borderBottom: `1px solid ${DARK.borderSoft}`, backgroundColor: DARK.bg }}
            >
              <ImageDown className="w-4 h-4" style={{ color: DARK.lightgold }} />
              <span className="font-title text-sm tracking-widest" style={{ color: DARK.lightgold }}>
                生成分享海报
              </span>
            </div>

            <div className="flex flex-col lg:flex-row gap-5 p-5">
              {/* 左侧：预览 */}
              <div className="flex-shrink-0 mx-auto lg:mx-0">
                <PosterPreview previewW={previewW} scale={scale}>
                  <ShareCard
                    ref={cardRef}
                    {...data}
                    palette={palette}
                    orientation={orientation}
                    width={canvasW}
                    minHeight={canvasH}
                  />
                </PosterPreview>
              </div>

              {/* 右侧：操作区 */}
              <div className="flex-1 flex flex-col gap-4 min-w-0">
                <div>
                  <h3 className="font-display text-xl mb-1.5" style={{ color: DARK.lightgold }}>
                    一键生成分享海报
                  </h3>
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

                {status === 'done' && dataUrl && (
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
                      {status === 'generating' ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />正在生成…</>
                      ) : (
                        <><ImageDown className="w-4 h-4" />生成海报</>
                      )}
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
                        onClick={() => { setDataUrl(null); setStatus('idle'); }}
                        className="w-full py-2.5 rounded-full font-title text-xs tracking-widest transition-all hover:bg-mystic-gold/10"
                        style={{ backgroundColor: 'transparent', color: DARK.textSoft, border: `1px solid ${DARK.borderSoft}`, cursor: 'pointer' }}
                      >
                        重新生成
                      </button>
                    </>
                  )}
                </div>

                {dataUrl && (
                  <div className="mt-1">
                    <div className="text-[10px] font-title tracking-widest mb-1.5" style={{ color: DARK.textMute }}>生成结果预览</div>
                    <img src={dataUrl} alt="占卜海报预览" className="w-full rounded-lg" style={{ border: `1px solid ${DARK.borderSoft}` }} />
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

// ============================================================
// 预览容器：动态测量内层实际高度
// ============================================================

function PosterPreview({
  previewW,
  scale,
  children,
}: {
  previewW: number;
  scale: number;
  children: React.ReactNode;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [renderedH, setRenderedH] = useState(0);

  useLayoutEffect(() => {
    const node = innerRef.current;
    if (!node) return;
    const measure = () => {
      const h = node.getBoundingClientRect().height;
      if (h > 0) setRenderedH(h);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="overflow-hidden rounded-lg"
      style={{ width: previewW, height: renderedH * scale }}
    >
      <div ref={innerRef} style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {children}
      </div>
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

function OptionButton({
  active, onClick, icon, label,
}: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}) {
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
// 海报本体
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
  const isPortrait = orientation === 'portrait';
  const dateStr = formatDate(new Date());
  const verdictColor = palette[VERDICT_COLOR[directAnswer.verdict]];
  const energyPct = Math.round(((directAnswer.score + 100) / 200) * 100);

  const rootStyle: CSSProperties = {
    width,
    minHeight,
    background: `linear-gradient(160deg, ${palette.bg} 0%, ${palette.bg} 60%, ${palette.bg} 100%)`,
    fontFamily: "'Cormorant Garamond', 'Noto Serif SC', serif",
    color: palette.textBase,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div ref={ref} style={rootStyle}>
      <BackgroundDecor palette={palette} />
      {isPortrait ? (
        <PortraitBody
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
          energyPct={energyPct}
          dateStr={dateStr}
        />
      ) : (
        <LandscapeBody
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
          energyPct={energyPct}
          dateStr={dateStr}
        />
      )}
    </div>
  );
});

// ============================================================
// 竖屏布局（单栏纵向流）
// ============================================================

function PortraitBody({
  question, drawnCards, positions, spreadName, theme, directAnswer, actionPlan, closingText,
  palette, verdictColor, energyPct, dateStr,
}: BodyProps) {
  return (
    <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 44px 32px' }}>
      {/* 顶部品牌行 */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <BrandMark palette={palette} size={28} />
        <span style={{ fontSize: 15, color: palette.textMute, fontFamily: "'Inter', sans-serif" }}>{dateStr}</span>
      </header>

      <Divider palette={palette} />

      {/* 问题 */}
      <Section title="你所问" palette={palette} titleSize={17}>
        <p style={{ fontSize: 24, lineHeight: 1.5, color: palette.textStrong, fontStyle: 'italic', fontWeight: 500, margin: '12px 0 0' }}>
          {question ? `「${truncate(question, 60)}」` : '— 静心冥想此刻的疑问 —'}
        </p>
        <Tag palette={palette} marginTop={12}>{theme.label}主题 · {spreadName}</Tag>
      </Section>

      <Divider palette={palette} />

      {/* 牌阵 */}
      <Section title="你的牌阵" palette={palette} titleSize={17}>
        <CardGrid cards={drawnCards} positions={positions} palette={palette} landscape={false} />
      </Section>

      <Divider palette={palette} />

      {/* 塔罗师回应 */}
      <Section title="塔罗师的回应" palette={palette} titleSize={17}>
        <VerdictBar verdict={directAnswer.verdict} verdictColor={verdictColor} energyPct={energyPct} palette={palette} landscape={false} />
        <p style={{ fontSize: 20, lineHeight: 1.6, color: palette.textStrong, fontWeight: 500, margin: '14px 0 0' }}>
          {truncate(directAnswer.headline, 80)}
        </p>
      </Section>

      {directAnswer.reasoning && (
        <>
          <Divider palette={palette} />
          <Section title="牌面背后的脉络" palette={palette} titleSize={17}>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: palette.textSoft, margin: '12px 0 0', fontStyle: 'italic' }}>
              {truncate(directAnswer.reasoning, 120)}
            </p>
          </Section>
        </>
      )}

      {actionPlan.length > 0 && (
        <>
          <Divider palette={palette} />
          <Section title="行动指引" palette={palette} titleSize={17}>
            <ActionList items={actionPlan} palette={palette} landscape={false} />
          </Section>
        </>
      )}

      <Divider palette={palette} />

      {/* 底部收束 */}
      <Footer palette={palette} closingText={closingText} landscape={false} />
    </div>
  );
}

// ============================================================
// 横屏布局（左右双栏）
// ============================================================

function LandscapeBody({
  question, drawnCards, positions, spreadName, theme, directAnswer, actionPlan, closingText,
  palette, verdictColor, energyPct, dateStr,
}: BodyProps) {
  return (
    <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', padding: '32px 40px 24px' }}>
      {/* 左栏 */}
      <div style={{ flex: '1 1 48%', display: 'flex', flexDirection: 'column', paddingRight: 28, borderRight: `1px solid ${palette.borderSoft}` }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <BrandMark palette={palette} size={24} />
          <span style={{ fontSize: 13, color: palette.textMute, fontFamily: "'Inter', sans-serif" }}>{dateStr}</span>
        </header>

        <SectionTitle text="你所问" palette={palette} size={15} />
        <p style={{ fontSize: 20, lineHeight: 1.45, color: palette.textStrong, fontStyle: 'italic', fontWeight: 500, margin: '10px 0 0' }}>
          {question ? `「${truncate(question, 40)}」` : '— 静心冥想此刻的疑问 —'}
        </p>
        <Tag palette={palette} marginTop={10}>{theme.label}主题 · {spreadName}</Tag>

        <div style={{ marginTop: 22 }}>
          <SectionTitle text="你的牌阵" palette={palette} size={15} />
          <CardGrid cards={drawnCards} positions={positions} palette={palette} landscape />
        </div>

        <div style={{ flex: 1 }} />
        <FooterLeft palette={palette} closingText={closingText} />
      </div>

      {/* 右栏 */}
      <div style={{ flex: '1 1 52%', display: 'flex', flexDirection: 'column', paddingLeft: 28 }}>
        <SectionTitle text="塔罗师的回应" palette={palette} size={15} />
        <VerdictBar verdict={directAnswer.verdict} verdictColor={verdictColor} energyPct={energyPct} palette={palette} landscape />
        <p style={{ fontSize: 18, lineHeight: 1.5, color: palette.textStrong, fontWeight: 500, margin: '12px 0 0' }}>
          {truncate(directAnswer.headline, 70)}
        </p>

        {directAnswer.reasoning && (
          <div style={{ marginTop: 20 }}>
            <SectionTitle text="牌面背后的脉络" palette={palette} size={15} />
            <p style={{ fontSize: 14, lineHeight: 1.7, color: palette.textSoft, margin: '10px 0 0', fontStyle: 'italic' }}>
              {truncate(directAnswer.reasoning, 100)}
            </p>
          </div>
        )}

        {actionPlan.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <SectionTitle text="行动指引" palette={palette} size={15} />
            <ActionList items={actionPlan} palette={palette} landscape />
          </div>
        )}

        <div style={{ flex: 1 }} />
        <FooterRight palette={palette} />
      </div>
    </div>
  );
}

// ============================================================
// 共享子组件
// ============================================================

interface BodyProps {
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
  energyPct: number;
  dateStr: string;
}

function BrandMark({ palette, size }: { palette: Palette; size: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ color: palette.gold, fontSize: size }}>✦</span>
      <span style={{ fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontSize: size, letterSpacing: '0.08em', color: palette.lightgold, fontWeight: 600 }}>
        塔罗秘境
      </span>
    </div>
  );
}

function Section({
  title, children, palette, titleSize,
}: {
  title: string; children: React.ReactNode; palette: Palette; titleSize: number;
}) {
  return (
    <section style={{ margin: '18px 0' }}>
      <SectionTitle text={title} palette={palette} size={titleSize} />
      {children}
    </section>
  );
}

function SectionTitle({ text, palette, size }: { text: string; palette: Palette; size: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 18, height: 1.5, background: palette.gold, opacity: 0.7 }} />
      <span style={{ fontFamily: "'Cinzel', 'Noto Serif SC', serif", fontSize: size, color: palette.gold, letterSpacing: '0.15em', fontWeight: 500 }}>
        {text}
      </span>
    </div>
  );
}

function Tag({ children, palette, marginTop }: { children: React.ReactNode; palette: Palette; marginTop: number }) {
  return (
    <div style={{
      display: 'inline-block', marginTop, fontSize: 14, padding: '5px 16px', borderRadius: 999,
      color: palette.lightgold, border: `1px solid ${palette.border}`, backgroundColor: 'rgba(212,175,55,0.08)',
    }}>
      {children}
    </div>
  );
}

function Divider({ palette }: { palette: Palette }) {
  return <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${palette.border}, transparent)` }} />;
}

function CardGrid({
  cards, positions, palette, landscape,
}: {
  cards: DrawnCard[]; positions: SpreadPosition[]; palette: Palette; landscape: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: landscape ? 9 : 12, marginTop: 14, flexWrap: 'wrap' }}>
      {cards.map((c, i) => {
        const pos = positions[c.position];
        const elemLabel = ELEMENT_LABEL[c.card.element || 'spirit'] || '灵';
        return (
          <div key={i} style={{
            flex: landscape ? '1 1 28%' : '1 1 30%',
            minWidth: landscape ? 70 : 80,
            maxWidth: landscape ? 120 : 150,
            padding: landscape ? '10px 8px' : '12px 10px',
            borderRadius: 10,
            backgroundColor: palette.panel,
            border: `1px solid ${palette.borderSoft}`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: landscape ? 12 : 14, color: palette.textMute, fontFamily: "'Cinzel', serif", letterSpacing: '0.1em', marginBottom: 5 }}>
              {pos?.name || `第${i + 1}张`}
            </div>
            <div style={{ fontSize: landscape ? 18 : 22, color: palette.lightgold, fontWeight: 600, lineHeight: 1.3 }}>
              {c.card.name.cn}
            </div>
            <div style={{ fontSize: landscape ? 12 : 14, color: c.reversed ? palette.rose : palette.textMute, marginTop: 5, marginBottom: 6 }}>
              {c.reversed ? '逆位' : '正位'} · {elemLabel}
            </div>
            <div style={{ fontSize: landscape ? 11 : 13, color: palette.textSoft, lineHeight: 1.4 }}>
              {c.card.keywords.slice(0, 2).join(' · ')}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VerdictBar({
  verdict, verdictColor, energyPct, palette, landscape,
}: {
  verdict: Verdict; verdictColor: string; energyPct: number; palette: Palette; landscape: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14 }}>
      <div style={{
        padding: landscape ? '6px 18px' : '8px 22px',
        borderRadius: 999,
        fontSize: landscape ? 15 : 18,
        fontWeight: 600,
        color: verdictColor,
        border: `1px solid ${verdictColor}66`,
        backgroundColor: `${verdictColor}14`,
        fontFamily: "'Cinzel', 'Noto Serif SC', serif",
        letterSpacing: '0.1em',
        whiteSpace: 'nowrap',
      }}>
        {VERDICT_LABEL[verdict]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: landscape ? 12 : 14, color: palette.textMute, marginBottom: 5 }}>
          <span>能量值</span>
          <span style={{ color: palette.lightgold, fontWeight: 600, fontSize: landscape ? 15 : 17 }}>{energyPct}</span>
        </div>
        <div style={{ height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ width: `${energyPct}%`, height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${verdictColor}, ${palette.gold})` }} />
        </div>
      </div>
    </div>
  );
}

function ActionList({
  items, palette, landscape,
}: {
  items: ActionItem[]; palette: Palette; landscape: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: landscape ? 8 : 10, marginTop: 14 }}>
      {items.slice(0, 3).map((item, i) => (
        <div key={i} style={{
          display: 'flex', gap: 11,
          padding: landscape ? '10px 14px' : '12px 16px',
          borderRadius: 10,
          backgroundColor: palette.panel,
          border: `1px solid ${palette.borderSoft}`,
        }}>
          <span style={{ fontSize: landscape ? 16 : 18, color: item.kind === 'warning' ? palette.rose : palette.lightgold, lineHeight: 1.5, flexShrink: 0 }}>
            {ACTION_ICON[item.kind]}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: landscape ? 11 : 13, color: palette.textMute, fontFamily: "'Cinzel', serif", letterSpacing: '0.08em', marginBottom: 4 }}>
              {ACTION_LABEL[item.kind]}
            </div>
            <div style={{ fontSize: landscape ? 14 : 16, lineHeight: 1.5, color: palette.textBase }}>
              {truncate(item.detail, landscape ? 40 : 50)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 竖屏底部：居中收束语 + 箴言 + 域名 CTA + 提示
function Footer({ palette, closingText, landscape }: { palette: Palette; closingText: string; landscape: boolean }) {
  return (
    <div style={{ marginTop: 24, textAlign: 'center' }}>
      <p style={{ fontFamily: "'Cinzel', 'Noto Serif SC', serif", fontSize: landscape ? 16 : 18, color: palette.gold, letterSpacing: '0.12em', marginBottom: 10, fontWeight: 500 }}>
        ✦ {truncate(closingText, 24)} ✦
      </p>
      <p style={{ fontSize: 13, color: palette.textMute, lineHeight: 1.6, fontStyle: 'italic', marginBottom: 16 }}>
        塔罗不预测命运，而是照亮当下。
      </p>
      <DomainPill palette={palette} size={landscape ? 'sm' : 'md'} />
      <p style={{ fontSize: 12, color: palette.textMute, marginTop: 12, fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>
        扫码或访问 · 开启你的专属占卜
      </p>
    </div>
  );
}

// 横屏左栏底部：收束语 + 域名
function FooterLeft({ palette, closingText }: { palette: Palette; closingText: string }) {
  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ fontFamily: "'Cinzel', 'Noto Serif SC', serif", fontSize: 15, color: palette.gold, letterSpacing: '0.12em', marginBottom: 10, fontWeight: 500 }}>
        ✦ {truncate(closingText, 18)} ✦
      </p>
      <DomainPill palette={palette} size="sm" />
    </div>
  );
}

// 横屏右栏底部：箴言 + 域名
function FooterRight({ palette }: { palette: Palette }) {
  return (
    <div style={{ marginTop: 16, textAlign: 'right' }}>
      <p style={{ fontSize: 12, color: palette.textMute, lineHeight: 1.55, fontStyle: 'italic', marginBottom: 8 }}>
        塔罗不预测命运，而是照亮当下。
      </p>
      <p style={{ fontSize: 11, color: palette.textMute, fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em', marginBottom: 10 }}>
        扫码或访问 · 开启你的专属占卜
      </p>
      <DomainPill palette={palette} size="sm" />
    </div>
  );
}

function DomainPill({ palette, size }: { palette: Palette; size: 'sm' | 'md' }) {
  const fontSize = size === 'md' ? 20 : 16;
  const padding = size === 'md' ? '11px 24px' : '8px 18px';
  const gap = size === 'md' ? 11 : 9;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap, padding, borderRadius: 999,
      border: `1px solid ${palette.border}`, backgroundColor: 'rgba(212,175,55,0.08)',
    }}>
      <span style={{ fontSize, color: palette.gold, marginRight: gap }}>✧</span>
      <span style={{ fontSize, color: palette.lightgold, fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: '0.08em' }}>
        {SITE_DOMAIN}
      </span>
      <span style={{ fontSize, color: palette.gold, marginLeft: gap }}>✧</span>
    </div>
  );
}

function BackgroundDecor({ palette }: { palette: Palette }) {
  return (
    <>
      <div style={{
        position: 'absolute', top: -120, right: -100, width: 360, height: 360, borderRadius: '50%',
        background: `radial-gradient(circle, ${palette.border} 0%, transparent 70%)`, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%',
        background: `radial-gradient(circle, ${palette.borderSoft} 0%, transparent 70%)`, pointerEvents: 'none',
      }} />
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
