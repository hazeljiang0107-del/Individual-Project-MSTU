import { useEffect } from 'react';
import './Clearing.css';

/** The reward for tending several things in one sitting: light across the garden. */
export default function Clearing({ moment, onDone }) {
  useEffect(() => {
    if (!moment) return;
    const id = setTimeout(onDone, 2600);
    return () => clearTimeout(id);
  }, [moment, onDone]);

  if (!moment) return null;

  return (
    <div key={moment.key} className="clearing" role="status">
      <span className="clearing__sweep" aria-hidden="true" />
      <span className="clearing__words">
        <span className="eyebrow">{moment.count} in a row</span>
        <em>A clearing</em>
      </span>
    </div>
  );
}
