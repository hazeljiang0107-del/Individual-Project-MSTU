import { useRef, useState } from 'react';
import './Composer.css';

const SUGGESTIONS = ['Reply to professor', 'Laundry', 'Finish presentation', 'Call someone', 'Buy groceries'];
const MAX = 80;

export default function Composer({ onPlant, centered }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) {
      inputRef.current?.focus();
      return;
    }
    onPlant(text);
    setText('');
    inputRef.current?.focus();
  };

  return (
    <div className={`composer ${centered ? 'is-centered' : ''}`}>
      <div className="composer__intro" aria-hidden={!centered}>
        <div>
          <h2 className="composer__title">What’s taking up space?</h2>
          <p className="composer__lede">
            Plant the small unfinished things, one at a time. Then decide where each one belongs.
          </p>
        </div>
      </div>

      <form className="composer__form" onSubmit={submit}>
        <label htmlFor="thought-input" className="sr-only">
          What’s taking up space?
        </label>
        <input
          id="thought-input"
          ref={inputRef}
          className="composer__input"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          placeholder={centered ? 'Reply to professor…' : 'What else is taking up space?'}
          autoComplete="off"
          enterKeyHint="done"
        />
        <button type="submit" className="composer__plant" disabled={!text.trim()} aria-label="Plant thought">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M12 19V6M6.5 11.5 12 6l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>

      <div className="composer__suggest" aria-hidden={!centered}>
        <div>
          <span>or try</span>
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" tabIndex={centered ? 0 : -1} onClick={() => onPlant(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
