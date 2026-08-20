/**
 * CoworkDesk Brand Logo:
 * Renders the CD brand mark with "Cowork" in navy/white and "Desk" in brand teal-green
 * matching the exact color of the 'D' emblem.
 */
export default function Logo({ tone = 'dark', showWordmark = true, className = '' }) {
  const isLight = tone === 'light';

  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <img
        src={isLight ? '/logo-mark-white.png' : '/logo-mark.png'}
        alt="CoworkDesk"
        className="h-8 w-auto max-h-8 object-contain shrink-0"
      />
      {showWordmark && (
        <span className="text-xl font-extrabold tracking-tight">
          <span className={isLight ? 'text-white' : 'text-[#0f1d38]'}>Cowork</span>
          <span className={isLight ? 'text-teal-300' : 'text-[#16a090]'}>Desk</span>
        </span>
      )}
    </span>
  );
}
