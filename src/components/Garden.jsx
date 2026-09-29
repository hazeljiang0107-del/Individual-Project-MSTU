import ThoughtSeed from './ThoughtSeed.jsx';
import Tendrils from './Tendrils.jsx';
import Meadow from './Meadow.jsx';
import './Garden.css';

export default function Garden({
  ref,
  thoughts,
  blooms,
  leaving,
  selectedId,
  density,
  onSelect,
  onClear,
}) {
  // Seeds hold their size so crowding reads as crowding; only shrink once the garden is truly full.
  const crowdScale = Math.max(0.7, 1 - Math.max(0, thoughts.length - 14) * 0.02);

  const handlePointerMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    el.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };

  return (
    <main
      ref={ref}
      className={`garden ${selectedId ? 'has-selection' : ''}`}
      style={{ '--density': density.toFixed(3), '--crowd-scale': crowdScale }}
      onPointerMove={handlePointerMove}
      onClick={(e) => {
        if (!e.target.closest('.seed')) onClear();
      }}
      aria-label="Your garden of thoughts"
    >
      <div className="garden__light" aria-hidden="true" />
      <svg className="garden__rings" viewBox="-500 -300 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse key={i} cx="0" cy="0" rx={70 + i * 52} ry={38 + i * 30} />
        ))}
      </svg>
      <div className="garden__grain" aria-hidden="true" />

      <Meadow blooms={blooms} />
      <Tendrils thoughts={thoughts} />

      <ul className="garden__field" role="list">
        {thoughts.map((t, i) => (
          <ThoughtSeed
            key={t.id}
            thought={t}
            index={i}
            selected={t.id === selectedId}
            leaving={leaving[t.id]}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </main>
  );
}
