import { STAGES } from '../lib/growth.js';
import { timeAgo } from '../lib/seeds.js';
import './Journal.css';

export default function Journal({ open, clarity, staged, stats, level, onClose, onPassTime }) {
  const counts = STAGES.map((_, i) => staged.filter((t) => t.stage === i).length);
  const oldest = staged.reduce((a, t) => (!a || t.createdAt < a.createdAt ? t : a), null);
  const tab = open ? 0 : -1;

  return (
    <aside className={`panel journal ${open ? 'is-open' : ''}`} aria-hidden={!open} aria-label="Garden journal">
      <button type="button" className="panel__close" onClick={onClose} aria-label="Close" tabIndex={tab}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      <p className="eyebrow">Garden journal</p>

      <div className="journal__clarity">
        <span className="journal__score">{clarity}</span>
        <span className="journal__scoreNote">
          clarity
          <br />
          out of 100
        </span>
      </div>

      <ul className="journal__stages">
        {STAGES.map((s, i) => (
          <li key={s.id} className={counts[i] ? 'is-active' : ''}>
            <span className={`journal__dot journal__dot--${s.id}`} aria-hidden="true" />
            <span className="journal__stageName">{s.label}</span>
            <span className="journal__stageCount">{counts[i]}</span>
          </li>
        ))}
      </ul>

      <div className="journal__level">
        <div className="journal__levelRow">
          <span className="journal__levelName">{level.name}</span>
          <span className="journal__levelMeta">
            {level.next ? `${level.toNext} to ${level.next.name}` : 'fully grown'}
          </span>
        </div>
        <div className="journal__bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${Math.max(0.02, level.progress)})` }} />
        </div>
        <p className="journal__levelNote">{level.note}</p>
      </div>

      <dl className="journal__stats">
        <div>
          <dt>Bloomed</dt>
          <dd>{stats.grown}</dd>
        </div>
        <div>
          <dt>Let go</dt>
          <dd>{stats.released}</dd>
        </div>
        <div>
          <dt>Day streak</dt>
          <dd>
            {stats.streak}
            {stats.best > stats.streak && <span className="journal__best">best {stats.best}</span>}
          </dd>
        </div>
      </dl>

      {oldest && (
        <p className="journal__oldest">
          Waiting longest: <em>{oldest.text}</em> · {STAGES[oldest.stage].label.toLowerCase()},{' '}
          {timeAgo(oldest.createdAt)}
        </p>
      )}

      <button type="button" className="text-button journal__age" onClick={onPassTime} tabIndex={tab}>
        Let time pass →
      </button>
      <p className="journal__ageNote">
        Ages the garden three hours — about one stage of growth — so you can see what neglect does
        without waiting for it.
      </p>
    </aside>
  );
}
