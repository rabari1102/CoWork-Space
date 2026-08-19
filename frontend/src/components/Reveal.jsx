import { prefersReducedMotion, useInView } from '../hooks/useInView.js';

/**
 * Fades and lifts its children the first time they reach the viewport.
 * Only opacity and transform animate, so the work stays on the compositor.
 */
export default function Reveal({ children, delay = 0, as: Tag = 'div', className = '' }) {
  const [ref, inView] = useInView();
  const shown = inView || prefersReducedMotion();

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
