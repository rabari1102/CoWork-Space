import { SPACE_TYPE_ICONS, SPACE_TYPE_LABELS } from '../utils/format.js';

// Palettes stay inside the navy/teal/cyan/violet system so a wall of cards
// still reads as one product rather than a colour swatch.
const PALETTES = [
  { from: '#0b1220', to: '#12766d' },
  { from: '#16243f', to: '#0e7490' },
  { from: '#134e4a', to: '#23b5a6' },
  { from: '#1e3157', to: '#6d28d9' },
  { from: '#101b30', to: '#155e75' },
  { from: '#12766d', to: '#06b6d4' },
];

/** Same space always gets the same artwork, so the listing is stable across loads. */
function paletteFor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  return PALETTES[hash % PALETTES.length];
}

/**
 * Stands in for a photograph. The product has no image storage and inventing
 * stock photos would misrepresent real rooms, so each space gets deterministic
 * generated artwork keyed to its name, badged with its real type.
 */
export default function SpaceArtwork({ space, className = '', showLabel = true }) {
  const { from, to } = paletteFor(`${space.id}-${space.name}`);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundImage: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-grid-navy bg-grid opacity-40" />
      <div
        className="absolute -right-10 -top-14 h-44 w-44 rounded-full opacity-30 blur-2xl"
        style={{ backgroundColor: to }}
      />
      <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

      <div className="absolute inset-0 flex items-center justify-center">
        <i
          className={`ph ${SPACE_TYPE_ICONS[space.type]} text-5xl text-white/85 drop-shadow-sm`}
        />
      </div>

      {showLabel && (
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-navy-950/45 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
          {SPACE_TYPE_LABELS[space.type]}
        </span>
      )}
    </div>
  );
}
