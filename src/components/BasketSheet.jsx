import { useRef } from 'react';
import { PALETTE, timeAgo } from '../lib/seeds.js';
import './BasketSheet.css';

const COPY = {
  today: { title: 'Today', lede: 'Mark one done and it blooms in the meadow below, for good.' },
  later: { title: 'Later', lede: 'Parked safely. Finish one and it blooms; replant it to face it again.' },
};

export default function BasketSheet({ kind, items, onClose, onReplant, onComplete }) {
  const lastKind = useRef(kind);
  if (kind) lastKind.current = kind;
  const shownKind = lastKind.current;
  const open = Boolean(kind);
  const tab = open ? 0 : -1;

  return (
    <aside className={`panel sheet ${open ? 'is-open' : ''}`} aria-hidden={!open} aria-label={shownKind ?? 'Basket'}>
      {shownKind && (
        <>
          <button type="button" className="panel__close" onClick={onClose} aria-label="Close" tabIndex={tab}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>

          <p className="eyebrow">
            {items.length} {items.length === 1 ? 'thought' : 'thoughts'}
          </p>
          <h2 className="sheet__title">{COPY[shownKind].title}</h2>
          <p className="sheet__lede">{COPY[shownKind].lede}</p>

          <ul className="sheet__list">
            {items.map((t) => (
              <li key={t.id} className="sheet__item">
                <span
                  className="sheet__dot"
                  style={{ background: PALETTE[t.color % PALETTE.length].fill, borderRadius: t.shape[0] }}
                  aria-hidden="true"
                />
                <span className="sheet__words">
                  <span className="sheet__text">{t.text}</span>
                  <span className="sheet__meta">Planted {timeAgo(t.createdAt)}</span>
                </span>
                <span className="sheet__actions">
                  <button type="button" className="text-button" onClick={() => onReplant(t.id)} tabIndex={tab}>
                    Replant
                  </button>
                  <button
                    type="button"
                    className="sheet__done"
                    onClick={() => onComplete(t.id)}
                    tabIndex={tab}
                    aria-label={`Mark “${t.text}” done — it will bloom`}
                  >
                    Bloom
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </aside>
  );
}
