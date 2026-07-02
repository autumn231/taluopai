import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  baseRadius: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface StarfieldProps {
  density?: number;
  showShootingStars?: boolean;
  showNebula?: boolean;
  interactive?: boolean;
  className?: string;
}

const STAR_COLORS = [
  '#ffffff',
  '#f4d03f',
  '#d4af37',
  '#c0c0d6',
  '#e8e4f3',
  '#9b59b6',
];

// 减少桌面端星星密度但仍保持密集团队感
const DESKTOP_COUNT = 130;
const MOBILE_COUNT = 55;
const DUST_DESKTOP = 18;
const DUST_MOBILE = 8;

export default function Starfield({
  density = 1,
  showShootingStars = true,
  showNebula = true,
  interactive = true,
  className = '',
}: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const animationRef = useRef<number>(0);
  // 主题感知：白天模式停止星空渲染以省电
  const isLightRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // 监听主题变化
    const html = document.documentElement;
    const checkTheme = () => {
      isLightRef.current = html.classList.contains('light');
    };
    checkTheme();
    const themeObserver = new MutationObserver(checkTheme);
    themeObserver.observe(html, { attributes: true, attributeFilter: ['class'] });

    let stars: Star[] = [];
    let particles: Particle[] = [];
    let shootingStars: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
    }> = [];
    let dpr = window.devicePixelRatio || 1;

    const isMobile = window.innerWidth < 768;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isLowPowerDevice = isMobile || (navigator.hardwareConcurrency || 4) <= 4;

    const baseCount = isMobile ? MOBILE_COUNT : DESKTOP_COUNT;
    const starCount = Math.floor(baseCount * density);
    const dustCount = isMobile ? DUST_MOBILE : DUST_DESKTOP;

    // 缓存的星云渐变 - 视口尺寸变化时重建
    let cachedNebulaWidth = 0;
    let cachedNebulaHeight = 0;
    let nebulaGradients: CanvasGradient[] = [];

    const buildNebulaGradients = (w: number, h: number) => {
      const points = [
        { x: w * 0.2, y: h * 0.3, r: 280, hue: 280, sat: 60, light: 15 },
        { x: w * 0.8, y: h * 0.6, r: 350, hue: 320, sat: 50, light: 12 },
        { x: w * 0.5, y: h * 0.9, r: 300, hue: 220, sat: 40, light: 10 },
      ];
      nebulaGradients = points.map((p) => {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, 0.18)`);
        g.addColorStop(0.5, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, 0.06)`);
        g.addColorStop(1, 'transparent');
        return g;
      });
      cachedNebulaWidth = w;
      cachedNebulaHeight = h;
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      // 限制最大画布尺寸 - 减少高 DPI 屏幕的填充成本
      const maxDim = 2560;
      const w = Math.min(rect.width, maxDim);
      const h = Math.min(rect.height, maxDim);
      dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars(w, h);
      buildNebulaGradients(w, h);
    };

    const initStars = (w: number, h: number) => {
      stars = new Array(starCount);
      for (let i = 0; i < starCount; i++) {
        const z = Math.random();
        stars[i] = {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          baseRadius: z * 1.4 + 0.3,
          twinkleSpeed: 0.5 + Math.random() * 2,
          twinkleOffset: Math.random() * Math.PI * 2,
          color: STAR_COLORS[(Math.random() * STAR_COLORS.length) | 0],
        };
      }
    };

    const spawnShootingStar = (w: number, h: number) => {
      if (isReducedMotion) return;
      const startX = Math.random() * w;
      const startY = Math.random() * h * 0.4;
      const angle = Math.PI * 0.15 + Math.random() * 0.2;
      const speed = 8 + Math.random() * 6;
      shootingStars.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 60 + Math.random() * 40,
      });
    };

    const drawNebula = (w: number, h: number) => {
      if (!showNebula || nebulaGradients.length === 0) return;
      // 一次 fillRect 覆盖全屏，比每个渐变各画一次更便宜
      for (let i = 0; i < nebulaGradients.length; i++) {
        ctx.fillStyle = nebulaGradients[i];
        ctx.fillRect(0, 0, w, h);
      }
    };

    const drawStars = (t: number, w: number, h: number) => {
      // 按颜色分组批量绘制 - 减少 fillStyle 切换
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const twinkle = 0.5 + 0.5 * Math.sin(t * 0.001 * star.twinkleSpeed + star.twinkleOffset);
        const alpha = isReducedMotion ? 0.7 : twinkle * 0.9 + 0.1;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = star.color;
        // 像素星 - 用 fillRect 替代 arc 节省调用成本
        const r = star.baseRadius;
        ctx.fillRect(star.x - r, star.y - r, r * 2, r * 2);

        // 鼠标引力牵引 - 仅对近距离星
        if (interactive && mouseRef.current.active && !isReducedMotion) {
          const dx = mouseRef.current.x - star.x;
          const dy = mouseRef.current.y - star.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 22500) {
            // 150^2
            const dist = Math.sqrt(distSq);
            const force = (150 - dist) / 150 * 0.4;
            const px = star.x + (dx / dist) * force * 30;
            const py = star.y + (dy / dist) * force * 30;
            ctx.globalAlpha = alpha * 0.6;
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(px, py);
            ctx.strokeStyle = star.color;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const updateShootingStars = () => {
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
        if (s.life > s.maxLife) {
          shootingStars.splice(i, 1);
        }
      }
    };

    const drawShootingStars = () => {
      for (let i = 0; i < shootingStars.length; i++) {
        const s = shootingStars[i];
        const lifeRatio = s.life / s.maxLife;
        const alpha = lifeRatio < 0.2 ? lifeRatio * 5 : (1 - lifeRatio) * 1.2;
        const tailLen = 80;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#f4d03f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        const signX = s.vx > 0 ? 1 : -1;
        const signY = s.vy > 0 ? 1 : -1;
        ctx.lineTo(s.x - signX * tailLen, s.y - signY * tailLen);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    // 缓存尘埃位置 - 每帧仅重算 sin/cos
    const dustSeeds: number[] = [];
    for (let i = 0; i < 30; i++) dustSeeds.push(i * 7.13);

    const drawParallaxDust = (w: number, h: number, t: number) => {
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#d4af37';
      for (let i = 0; i < dustCount; i++) {
        const seed = dustSeeds[i];
        const x = (Math.sin(t * 0.0001 + seed) * 0.5 + 0.5) * w;
        const y = (Math.cos(t * 0.00015 + seed * 1.7) * 0.5 + 0.5) * h;
        const r = 1 + (i % 3);
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;
    };

    let lastShootingStar = 0;
    let lastFrameTime = performance.now();
    let frameCount = 0;
    // 低功耗设备：跳帧（30fps 替代 60fps）
    const frameInterval = isLowPowerDevice ? 33 : 16;

    const animate = (t: number) => {
      // 白天模式不渲染（背景已隐藏）
      if (isLightRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // 跳帧逻辑
      if (t - lastFrameTime < frameInterval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      frameCount = t - lastFrameTime > frameInterval * 2 ? 0 : frameCount + 1;
      lastFrameTime = t;

      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const elapsed = t - (lastShootingStar || t);

      drawNebula(w, h);
      drawParallaxDust(w, h, t);
      drawStars(t, w, h);

      if (showShootingStars && !isReducedMotion && frameCount > 60) {
        // 稳定后 1s 才开始生成流星，避免初始化堆积
        if (t - lastShootingStar > 5000 + Math.random() * 4000) {
          spawnShootingStar(w, h);
          lastShootingStar = t;
        }
        updateShootingStars();
        drawShootingStars();
      } else if (!lastShootingStar) {
        lastShootingStar = t;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = e.touches[0].clientX - rect.left;
        mouseRef.current.y = e.touches[0].clientY - rect.top;
        mouseRef.current.active = true;
      }
    };

    const handleTouchEnd = () => {
      mouseRef.current.active = false;
    };

    // 页面隐藏时停止渲染 - 省电
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = 0;
      } else if (!animationRef.current) {
        lastFrameTime = performance.now();
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('visibilitychange', handleVisibility);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('visibilitychange', handleVisibility);
      themeObserver.disconnect();
    };
  }, [density, showShootingStars, showNebula, interactive]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-auto ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
