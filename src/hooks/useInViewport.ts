import { useEffect, useRef, useState } from 'react';

interface Options {
  /** 进入视口多少比例算可见，默认 0.05 */
  threshold?: number;
  /** 离视口多远的边距算可见，默认 '0px' */
  rootMargin?: string;
  /** 默认认为可见 - 可用于 SSR */
  initialInView?: boolean;
}

/**
 * 监听元素是否进入视口 - 不可见时跳过重绘
 * 使用 IntersectionObserver 节省 CPU
 */
export function useInViewport<T extends Element = HTMLDivElement>(
  options: Options = {},
): [React.RefObject<T>, boolean] {
  const { threshold = 0.05, rootMargin = '0px', initialInView = true } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(initialInView);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // 旧浏览器降级：始终视为可见
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setInView(entry.isIntersecting);
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, inView];
}
