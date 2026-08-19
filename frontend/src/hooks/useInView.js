import { useEffect, useRef, useState } from 'react';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Reports the first time an element enters the viewport.
 *
 * IntersectionObserver does the work, but it is backed by two safety nets,
 * because the failure mode of a scroll-reveal is content that never appears at
 * all: an immediate geometry check for anything already on screen at mount, and
 * a passive scroll listener in case the observer never fires. Both are torn
 * down the moment the element is shown, so the steady state costs nothing.
 */
export function useInView({ threshold = 0.15, once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || inView) return undefined;

    let done = false;
    const show = () => {
      if (done) return;
      done = true;
      setInView(true);
      cleanup();
    };

    const isOnScreen = () => {
      const rect = element.getBoundingClientRect();
      const viewport = window.innerHeight || document.documentElement.clientHeight;
      return rect.top < viewport * (1 - threshold * 0.5) && rect.bottom > 0;
    };

    const onScroll = () => {
      element.dataset.ivChecks = String(Number(element.dataset.ivChecks || 0) + 1);
      element.dataset.ivOnScreen = String(isOnScreen());
      if (isOnScreen()) show();
    };
    element.dataset.ivMounted = 'yes';

    let observer;
    function cleanup() {
      observer?.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }

    if (isOnScreen()) {
      show();
      return cleanup;
    }

    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) show();
          else if (!once) setInView(false);
        },
        { threshold, rootMargin: '0px 0px -5% 0px' },
      );
      observer.observe(element);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return cleanup;
  }, [inView, threshold, once]);

  return [ref, inView];
}
