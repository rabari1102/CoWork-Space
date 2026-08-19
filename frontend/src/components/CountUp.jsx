import { useEffect, useState } from 'react';
import { prefersReducedMotion, useInView } from '../hooks/useInView.js';

/**
 * Counts up to `value` once it is on screen. Re-runs if the number arrives
 * after the element was already visible, which is the normal case here: the
 * markup renders before the API call that supplies the total resolves.
 */
export default function CountUp({ value, duration = 1100, suffix = '' }) {
  const [ref, inView] = useInView({ threshold: 0.3 });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    if (prefersReducedMotion() || value === 0) {
      setShown(value);
      return undefined;
    }

    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubic, so the number decelerates into its final value.
      setShown(Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration]);

  return (
    <span ref={ref}>
      {shown}
      {suffix}
    </span>
  );
}
