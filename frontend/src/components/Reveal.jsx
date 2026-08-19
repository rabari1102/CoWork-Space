import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Reveals its children the first time they scroll into view.
 *
 * Uses IntersectionObserver rather than scroll listeners so it costs nothing
 * while off screen, animates only opacity and transform to stay on the
 * compositor, and renders straight to the final state for anyone who has asked
 * their OS to reduce motion.
 */
export default function Reveal({ children, delay = 0, as: Tag = 'div', className = '' }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(prefersReducedMotion);

  useEffect(() => {
    if (shown || !ref.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [shown]);

  return (
    <Tag
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${className}`}
      style={{ transitionDelay: shown ? `${delay}ms` : '0ms' }}
    >
      {children}
    </Tag>
  );
}
