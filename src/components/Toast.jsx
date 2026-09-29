import { useEffect } from 'react';
import './Toast.css';

const DURATION = 5000;

export default function Toast({ toast, onUndo, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(onDismiss, DURATION);
    return () => clearTimeout(id);
  }, [toast, onDismiss]);

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div key={toast.key} className="toast">
          <span>
            {toast.kind === 'bloom' ? 'Bloomed' : 'Let go of'} <em>{toast.thought.text}</em>
          </span>
          <button type="button" onClick={onUndo}>
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
