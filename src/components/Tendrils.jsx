/**
 * Overgrown thoughts reach for each other. Each one is linked to its nearest
 * overgrown neighbour, so neglect reads as entanglement rather than just size.
 */
export default function Tendrils({ thoughts }) {
  const tangled = thoughts.filter((t) => t.stage === 3);
  if (tangled.length < 2) return null;

  const seen = new Set();
  const links = [];

  for (const a of tangled) {
    let near = null;
    let best = Infinity;
    for (const b of tangled) {
      if (b.id === a.id) continue;
      const d = Math.hypot((b.x - a.x) * 1.6, b.y - a.y);
      if (d < best) {
        best = d;
        near = b;
      }
    }
    if (!near || best > 0.55) continue;
    const key = [a.id, near.id].sort().join('|');
    if (seen.has(key)) continue;
    seen.add(key);

    const mx = (a.x + near.x) / 2;
    const my = (a.y + near.y) / 2;
    const bow = (a.y < near.y ? 1 : -1) * 0.05;
    links.push({
      key,
      d: `M${a.x * 100} ${a.y * 100}Q${(mx + bow) * 100} ${(my + bow) * 100} ${near.x * 100} ${near.y * 100}`,
    });
  }

  return (
    <svg className="garden__tendrils" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {links.map((l) => (
        <path key={l.key} d={l.d} />
      ))}
    </svg>
  );
}
