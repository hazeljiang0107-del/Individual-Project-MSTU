import { useEffect, useRef } from 'react';
import { PALETTE, timeAgo } from '../lib/seeds.js';
import { STAGES } from '../lib/growth.js';
import './Inspector.css';

const CHOICES = [
  { id: 'today', key: '1', title: 'Today', sub: 'Give it a place in today.' },
  { id: 'later', key: '2', title: 'Later', sub: 'Park it somewhere safe.' },
  { id: 'release', key: '3', title: 'Release', sub: 'Let it go. It doesn’t need you.' },
];

export default function Inspector({ thought, onResolve, onClose }) {
  const lastRef = useRef(thought);
  if (thought) lastRef.current = thought;
  const shown = lastRef.current;
  const open = Boolean(thought);
  const firstChoiceRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return;
      const choice = CHOICES.find((c) => c.key === e.key);
      if (choice) onResolve(thought.id, choice.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, thought, onResolve]);

  useEffect(() => {
    if (open && window.matchMedia('(hover: hover)').matches) {
      firstChoiceRef.current?.focus({ preventScroll: true });
    }
  }, [open, thought?.id]);

  const swatch = shown ? PALETTE[shown.color % PALETTE.length].fill : 'transparent';
  const stage = STAGES[shown?.stage ?? 0];

  return (
    <aside className={`panel inspector ${open ? 'is-open' : ''}`} aria-hidden={!open} aria-label="Thought">
      {shown && (
        <>
          <button type="button" className="panel__close" onClick={onClose} aria-label="Close" tabIndex={open ? 0 : -1}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>

          <div className="inspector__head">
            <span className="inspector__swatch" style={{ background: swatch, borderRadius: shown.shape[0] }} />
            <p className="eyebrow">
              {stage.label} · {timeAgo(shown.createdAt)}
            </p>
          </div>

          <h2 className="inspector__text">{shown.text}</h2>

          <p className="inspector__note">{stage.note}</p>

          <p className="inspector__ask">Where does it belong?</p>

          <div className="inspector__choices">
            {CHOICES.map((c, i) => (
              <button
                key={c.id}
                ref={i === 0 ? firstChoiceRef : undefined}
                type="button"
                className={`choice choice--${c.id}`}
                onClick={() => onResolve(shown.id, c.id)}
                tabIndex={open ? 0 : -1}
              >
                <span className="choice__glyph" aria-hidden="true" />
                <span className="choice__words">
                  <span className="choice__title">{c.title}</span>
                  <span className="choice__sub">{c.sub}</span>
                </span>
                <kbd className="choice__key">{c.key}</kbd>
              </button>
            ))}
          </div>

          <button type="button" className="text-button inspector__stay" onClick={onClose} tabIndex={open ? 0 : -1}>
            Leave it in the garden for now
          </button>
        </>
      )}
    </aside>
  );
}
