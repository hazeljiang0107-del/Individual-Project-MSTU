import { prng } from '../lib/growth.js';

const LEAF = 'M0 0C5-4 11-3 13 0 11 3 5 4 0 0Z';

/**
 * The botany that accumulates around a seed as it grows: a stem, then leaves,
 * then a bud, then tendrils that reach outward. Drawn in a box 1.5x the seed,
 * where the blob itself spans y 17–83, so growth hugs its edge.
 */
export default function Flora({ id, stage }) {
  if (stage === 0) return null;

  const rand = prng(1 + Number(id ?? 0));
  const leafCount = stage === 1 ? 2 : stage === 2 ? 4 : 6;

  const leaves = Array.from({ length: leafCount }, (_, i) => {
    const side = i % 2 === 0 ? 1 : -1;
    const y = 84 + Math.floor(i / 2) * 5 + rand() * 1.5;
    const len = 0.7 + rand() * 0.38;
    const tilt = -12 - rand() * 24;
    return { key: i, side, y, len, tilt };
  });

  return (
    <svg className="flora" viewBox="0 0 100 100" aria-hidden="true">
      <path className="flora__stem" d="M50 78C50 85 49 91 50 97" />

      {leaves.map((l) => (
        <path
          key={l.key}
          className="flora__leaf"
          d={LEAF}
          transform={`translate(50 ${l.y}) scale(${l.side * l.len} ${l.len}) rotate(${l.tilt})`}
        />
      ))}

      {stage >= 2 && (
        <g className="flora__bud">
          <path className="flora__stem" d="M58 22C61 18 61 14 59 11" />
          <path className="flora__pod" d="M59 4C63 8 63 12 59 14.5 55 12 55 8 59 4Z" />
        </g>
      )}

      {/* Uneven curls reaching off the sides: neglect spreading outward. */}
      {stage === 3 && (
        <g className="flora__tangle">
          <path
            d="M32 74C22 76 14 72 12 65 11 60 15 57 18 59 21 61 19 66 15 65"
            transform={`rotate(${-6 - rand() * 16} 50 78)`}
          />
          <path
            d="M62 88C72 88 80 82 81 75"
            transform={`rotate(${4 + rand() * 18} 50 78)`}
          />
        </g>
      )}
    </svg>
  );
}
