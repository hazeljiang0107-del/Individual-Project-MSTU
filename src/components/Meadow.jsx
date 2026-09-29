import { PALETTE } from '../lib/seeds.js';
import { hashSeed, prng } from '../lib/growth.js';
import './Meadow.css';

const MAX_RENDERED = 64;

/**
 * Everything resolved leaves a permanent mark here: a bloom for a thought you
 * tended, a wisp for one you let go. Caught early, a bloom is bright and full;
 * caught overgrown, it comes up smaller and muted.
 */
export default function Meadow({ blooms }) {
  const shown = blooms.slice(-MAX_RENDERED);

  return (
    <div className="meadow" aria-hidden="true">
      <span className="meadow__soil" />
      {shown.map((b, i) => (
        <Mark key={b.id} bloom={b} order={i} />
      ))}
    </div>
  );
}

function Mark({ bloom, order }) {
  const rand = prng(hashSeed(bloom.id));
  const stage = bloom.stage ?? 0;
  const { fill, ink } = PALETTE[bloom.color % PALETTE.length];

  const vivid = 1 - stage * 0.17;
  const scale = (0.88 + rand() * 0.24) * (1 - stage * 0.06);
  const height = 96 + rand() * 34 - stage * 8;
  const lean = (rand() - 0.5) * 14;

  const style = {
    left: `${bloom.x * 100}%`,
    '--h': `${height}px`,
    '--scale': scale.toFixed(3),
    '--lean': `${lean.toFixed(1)}deg`,
    '--vivid': vivid.toFixed(2),
    '--fill': fill,
    '--ink': ink,
    '--sway': `${(7 + rand() * 5).toFixed(1)}s`,
    '--sway-delay': `${(-rand() * 8).toFixed(1)}s`,
    zIndex: order,
  };

  const petals = stage >= 3 ? 5 : 6;

  return (
    <span className={`mark mark--${bloom.kind}`} style={style}>
      <span className="mark__sway">
        <svg className="mark__art" viewBox="0 0 40 100" preserveAspectRatio="xMidYMax meet">
          <path className="mark__stem" d={`M20 100C20 74 ${20 + lean * 0.4} 56 20 34`} />
          {bloom.kind === 'bloom' ? (
            <g className="mark__head">
              {Array.from({ length: petals }, (_, i) => (
                <ellipse
                  key={i}
                  cx="20"
                  cy="21"
                  rx="5"
                  ry="10"
                  transform={`rotate(${(360 / petals) * i} 20 30)`}
                />
              ))}
              <circle className="mark__eye" cx="20" cy="30" r="4" />
            </g>
          ) : (
            <g className="mark__wisp">
              {Array.from({ length: 5 }, (_, i) => {
                const a = -46 + i * 23;
                return <path key={i} d="M20 34C20 26 20 20 20 14" transform={`rotate(${a} 20 34)`} />;
              })}
              <circle className="mark__eye" cx="20" cy="34" r="2.2" />
            </g>
          )}
        </svg>
      </span>
    </span>
  );
}
