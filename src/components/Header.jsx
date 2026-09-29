import './Header.css';

const TICKS = 14;

export default function Header({ clarity, label, count, overgrown, level, onOpenJournal }) {
  const filled = Math.min(Math.round((1 - clarity / 100) * TICKS), TICKS);

  return (
    <header className="header">
      <div className="brand">
        <h1 className="wordmark">
          Headspace <em>Garden</em>
        </h1>
        <p className="brand__level">{level.name}</p>
      </div>

      <button type="button" className="meter" onClick={onOpenJournal} aria-label="Open garden journal">
        <span className="meter__row">
          <span className="eyebrow">Clarity</span>
          <span className="meter__value" aria-live="polite">
            {clarity}
          </span>
        </span>
        <span className="meter__ticks" aria-hidden="true">
          {Array.from({ length: TICKS }, (_, i) => (
            <span key={i} className={i < filled ? 'is-on' : ''} style={{ '--i': i }} />
          ))}
        </span>
        <span className="meter__meta">
          {label}
          {count > 0 && <> · {count} growing</>}
          {overgrown > 0 && <span className="meter__warn"> · {overgrown} overgrown</span>}
        </span>
      </button>
    </header>
  );
}
