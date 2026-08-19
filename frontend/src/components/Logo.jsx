/**
 * CoworkDesk Brand Logo:
 * Renders the exact pixel-perfect brand logo asset provided by the user.
 * Supports light tone (for dark hero/footer backgrounds) and dark tone (for light backgrounds).
 */
export default function Logo({ tone = 'dark', showWordmark = true, className = '' }) {
  const isLight = tone === 'light';

  if (!showWordmark) {
    return (
      <span className={`inline-flex items-center select-none ${className}`}>
        <img
          src={isLight ? '/logo-mark-white.png' : '/logo-mark.png'}
          alt="CoworkDesk"
          className="h-8 w-auto max-h-8 object-contain shrink-0"
        />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center select-none ${className}`}>
      <img
        src={isLight ? '/logo-white.png' : '/logo.png'}
        alt="CoworkDesk"
        className="h-8 w-auto max-h-8 object-contain shrink-0"
      />
    </span>
  );
}
