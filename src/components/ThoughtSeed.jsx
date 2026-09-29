import Flora from './Flora.jsx';
import { PALETTE } from '../lib/seeds.js';
import { STAGES } from '../lib/growth.js';

const SPORES = 8;

export default function ThoughtSeed({ thought, index, selected, leaving, onSelect }) {
  const { fill, ink } = PALETTE[thought.color % PALETTE.length];
  const m = thought.motion;
  const stage = thought.stage ?? 0;
  const grow = STAGES[stage];

  const style = {
    left: `${thought.x * 100}%`,
    top: `${thought.y * 100}%`,
    '--size': thought.size,
    '--stage-size': grow.size,
    '--fill': fill,
    '--ink': ink,
    '--r1': thought.shape[0],
    '--r2': thought.shape[1],
    '--drift-dur': `${m.duration}s`,
    '--morph-dur': `${m.morph}s`,
    '--drift-delay': `${m.delay}s`,
    '--dx': `${m.dx}px`,
    '--dy': `${m.dy}px`,
    '--depth': m.depth,
    '--enter-delay': `${Math.min(index, 20) * 45}ms`,
  };
  if (leaving) {
    style['--to-x'] = `${leaving.dx}px`;
    style['--to-y'] = `${leaving.dy}px`;
  }

  const state = leaving ? `is-leaving is-${leaving.outcome}` : selected ? 'is-selected' : '';

  return (
    <li className={`seed ${state}`} style={style} data-seed-id={thought.id} data-stage={grow.id}>
      <div className="seed__parallax">
        <div className="seed__drift">
          <div className="seed__sprout">
            <Flora id={thought.color * 97 + thought.size} stage={stage} />
            {/* Remounts on stage change, so growth announces itself with a ring. */}
            <span key={stage} className="seed__grew" aria-hidden="true" />
            <button
              type="button"
              className="seed__body"
              onClick={() => !leaving && onSelect(thought.id)}
              aria-pressed={selected}
              aria-label={`${thought.text} — ${grow.label}`}
              disabled={!!leaving}
            >
              <span className="seed__text">{thought.text}</span>
            </button>
          </div>
        </div>
      </div>
      {leaving?.outcome === 'release' && (
        <div className="seed__spores" aria-hidden="true">
          {Array.from({ length: SPORES }, (_, i) => (
            <span key={i} style={{ '--a': `${(360 / SPORES) * i + index * 17}deg`, '--d': `${i * 30}ms` }} />
          ))}
        </div>
      )}
    </li>
  );
}
