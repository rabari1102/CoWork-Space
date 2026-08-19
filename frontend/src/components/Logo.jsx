/**
 * CoworkDesk mark: an open navy "C" interlocking with a teal "D", with a desk
 * glyph sitting in the join.
 *
 * Drawn as SVG rather than shipped as a raster so it stays sharp at every size,
 * needs no extra request, and can recolour itself on the dark header and footer
 * through the `tone` prop.
 */
export default function Logo({ tone = 'dark', showWordmark = true, className = '' }) {
  const shell = tone === 'light' ? '#ffffff' : '#16243f';
  const wordmark = tone === 'light' ? '#ffffff' : '#16243f';
  const accent = tone === 'light' ? '#3acdba' : '#23b5a6';

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 48 48"
        className="h-8 w-8 shrink-0"
        role="img"
        aria-label="CoworkDesk"
        fill="none"
      >
        {/* The C: an arc left open on the right so the D can nest into it. */}
        <path
          d="M30 9.5a16.5 16.5 0 1 0 0 29"
          stroke={shell}
          strokeWidth="4.2"
          strokeLinecap="round"
        />
        {/* The D: upright stem plus a bowl, in the logo's teal. */}
        <path
          d="M21 10.5h6.5a13.5 13.5 0 0 1 0 27H21z"
          stroke={accent}
          strokeWidth="4.2"
          strokeLinejoin="round"
        />
        {/* Desk and seat tucked into the counter of the letterforms. */}
        <path
          d="M16.5 22.5h11v6"
          stroke={shell}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M16.5 26.5h4.5" stroke={shell} strokeWidth="3" strokeLinecap="round" />
      </svg>

      {showWordmark && (
        <span
          className="text-[19px] font-bold tracking-[-0.02em]"
          style={{ color: wordmark }}
        >
          Cowork<span style={{ color: accent }}>Desk</span>
        </span>
      )}
    </span>
  );
}
