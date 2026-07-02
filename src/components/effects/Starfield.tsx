import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number; // 深度 (0-1)，影响大小和速度
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
  density?: number; // 星星密度系数
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

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

    // 检测是否为移动端，降低密度
    const isMobile = window.innerWidth < 768;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const baseCount = isMobile ? 80 : 200;
    const starCount = Math.floor(baseCount * density);

    const resize = () => {
      const rect = container.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
      initStars(rect.width, rect.height);
    };

    const initStars = (w: number, h: number) => {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        const z = Math.random();
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          baseRadius: z * 1.4 + 0.3,
          twinkleSpeed: 0.5 + Math.random() * 2,
          twinkleOffset: Math.random() * Math.PI * 2,
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        });
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

    const drawNebula = (w: number, h: number, t: number) => {
      if (!showNebula) return;
      // 三个柔和的星云光斑
      const nebulaPoints = [
        { x: w * 0.2, y: h * 0.3, r: 280, hue: 280, sat: 60, light: 15 },
        { x: w * 0.8, y: h * 0.6, r: 350, hue: 320, sat: 50, light: 12 },
        { x: w * 0.5, y: h * 0.9, r: 300, hue: 220, sat: 40, light: 10 },
      ];

      nebulaPoints.forEach((p, i) => {
        const ox = Math.cos(t * 0.0002 + i) * 50;
        const oy = Math.sin(t * 0.0003 + i * 1.3) * 30;
        const gradient = ctx.createRadialGradient(
          p.x + ox,
          p.y + oy,
          0,
          p.x + ox,
          p.y + oy,
          p.r,
        );
        gradient.addColorStop(0, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, 0.2)`);
        gradient.addColorStop(0.5, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, 0.07)`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      });
    };

    const drawStars = (t: number) => {
      stars.forEach((star) => {
        const twinkle = 0.5 + 0.5 * Math.sin(t * 0.001 * star.twinkleSpeed + star.twinkleOffset);
        const alpha = isReducedMotion ? 0.7 : twinkle * 0.9 + 0.1;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.baseRadius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        // 鼠标引力牵引
        if (interactive && mouseRef.current.active && !isReducedMotion) {
          const dx = mouseRef.current.x - star.x;
          const dy = mouseRef.current.y - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150 * 0.4;
            const px = star.x + (dx / dist) * force * 30;
            const py = star.y + (dy / dist) * force * 30;
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(px, py);
            ctx.strokeStyle = star.color;
            ctx.globalAlpha = alpha * 0.6;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      });
    };

    const updateShootingStars = () => {
      shootingStars = shootingStars.filter((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
        if (s.life > s.maxLife) return false;
        return true;
      });
    };

    const drawShootingStars = () => {
      shootingStars.forEach((s) => {
        const lifeRatio = s.life / s.maxLife;
        const alpha = lifeRatio < 0.2 ? lifeRatio * 5 : (1 - lifeRatio) * 1.2;
        const tailLen = 80;
        const gradient = ctx.createLinearGradient(
          s.x,
          s.y,
          s.x - s.vx * 5,
          s.y - s.vy * 5,
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(244, 208, 63, ${alpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(244, 208, 63, 0)');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - (s.vx / Math.abs(s.vx)) * tailLen, s.y - (s.vy / Math.abs(s.vy)) * tailLen);
        ctx.stroke();
      });
    };

    const drawParallaxDust = (w: number, h: number, t: number) => {
      // 缓慢漂浮的金色尘埃
      const dustCount = isMobile ? 15 : 30;
      ctx.globalAlpha = 0.3;
      for (let i = 0; i < dustCount; i++) {
        const seed = i * 7.13;
        const x = (Math.sin(t * 0.0001 + seed) * 0.5 + 0.5) * w;
        const y = (Math.cos(t * 0.00015 + seed * 1.7) * 0.5 + 0.5) * h;
        const r = 1 + (i % 3);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = '#d4af37';
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    let lastShootingStar = 0;
    let startTime = performance.now();

    const animate = (t: number) => {
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      drawNebula(w, h, t - startTime);
      drawParallaxDust(w, h, t - startTime);
      drawStars(t - startTime);

      if (showShootingStars && !isReducedMotion) {
        if (t - lastShootingStar > 4000 + Math.random() * 5000) {
          spawnShootingStar(w, h);
          lastShootingStar = t;
        }
        updateShootingStars();
        drawShootingStars();
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

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
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
