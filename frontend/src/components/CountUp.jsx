import { useEffect, useRef, useState } from 'react';

const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Counts from zero to `value` the first time it scrolls into view. */
export default function CountUp({ value, duration = 1100, suffix = '' }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!ref.current) return undefined;
    if (reduceMotion()) {
      setShown(value);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          // Ease-out cubic, so the number decelerates into its final value.
          setShown(Math.round(value * (1 - (1 - progress) ** 3)));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref}>
      {shown}
      {suffix}
    </span>
  );
}
