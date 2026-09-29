import { PALETTE } from '../lib/seeds.js';
import './Basket.css';

const COPY = {
  today: { label: 'Today', empty: 'Nothing yet' },
  later: { label: 'Later', empty: 'Nothing parked' },
};
const MAX_DOTS = 12;

export default function Basket({ ref, kind, items, pulse, onOpen }) {
  const { label, empty } = COPY[kind];
  const count = items.length;

  return (
    <button
      type="button"
      className={`basket basket--${kind} ${count ? '' : 'is-empty'}`}
      onClick={count ? onOpen : undefined}
      aria-disabled={!count}
      aria-label={`${label}: ${count} ${count === 1 ? 'thought' : 'thoughts'}`}
    >
      <span ref={ref} key={pulse} className={`basket__vessel ${pulse ? 'is-pulsing' : ''}`} aria-hidden="true">
        <span className="basket__dots">
          {items.slice(-MAX_DOTS).map((t) => (
            <span key={t.id} style={{ background: PALETTE[t.color % PALETTE.length].fill }} />
          ))}
        </span>
      </span>
      <span className="basket__text">
        <span className="basket__label">{label}</span>
        <span className="basket__count">{count ? count : empty}</span>
      </span>
    </button>
  );
}
