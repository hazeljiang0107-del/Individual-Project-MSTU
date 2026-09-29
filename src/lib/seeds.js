// Colours are assigned at random and carry no meaning (yet).
export const PALETTE = [
  { fill: '#b9c9a4', ink: '#27331f' }, // sage
  { fill: '#9db38a', ink: '#1f2c19' }, // moss
  { fill: '#e7b08f', ink: '#3b2216' }, // clay
  { fill: '#ecd08a', ink: '#3a2e10' }, // pollen
  { fill: '#e9c0b6', ink: '#3d2320' }, // petal
  { fill: '#b4cad3', ink: '#1d2d33' }, // rain
  { fill: '#d4c6a8', ink: '#332b1b' }, // husk
  { fill: '#c5d6c6', ink: '#1f2f23' }, // lichen
];

const rand = (min, max) => min + Math.random() * (max - min);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function blobRadius() {
  const a = () => Math.round(rand(36, 64));
  const h = [a(), a(), a(), a()];
  const v = [a(), a(), a(), a()];
  return `${h[0]}% ${100 - h[0]}% ${h[2]}% ${100 - h[2]}% / ${v[0]}% ${v[1]}% ${100 - v[1]}% ${100 - v[0]}%`;
}

export function createThought(text, position) {
  const clean = text.trim().replace(/\s+/g, ' ');
  return {
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: clean,
    status: 'garden',
    createdAt: Date.now(),
    x: position.x,
    y: position.y,
    size: seedSize(clean),
    color: Math.floor(Math.random() * PALETTE.length),
    shape: [blobRadius(), blobRadius()],
    motion: {
      duration: rand(14, 24).toFixed(1),
      morph: rand(9, 15).toFixed(1),
      dx: rand(6, 16).toFixed(1) * pick([1, -1]),
      dy: rand(6, 14).toFixed(1) * pick([1, -1]),
      delay: -rand(0, 20).toFixed(1),
      depth: rand(0.4, 1.4).toFixed(2),
    },
  };
}

// Size tracks text length (for legibility) with a little organic variation.
export function seedSize(text) {
  const base = 108 + Math.min(text.length, 48) * 1.8;
  return Math.round(base * rand(0.9, 1.12));
}

// A seed can grow to this multiple of its planted size, so placement leaves room.
const MAX_GROWTH = 1.32;

/**
 * Best-candidate sampling: try a spread of spots and keep the one furthest from
 * existing seeds, so the garden fills evenly before it crowds. Centres are kept
 * a full grown radius clear of the header and dock. Positions are stored as
 * fractions of the garden so they survive resizes.
 */
export function findOpenSpot(existing, bounds, newSize) {
  const { width, height, top, bottom, side, scale } = bounds;
  const radius = (newSize * MAX_GROWTH * scale) / 2;

  const clampRange = (lo, hi, mid) => (lo < hi ? [lo, hi] : [mid, mid]);
  const [minX, maxX] = clampRange(side + radius, width - side - radius, width / 2);
  const [minY, maxY] = clampRange(top + radius, height - bottom - radius, height / 2);

  const others = existing.map((t) => ({
    x: t.x * width,
    y: t.y * height,
    r: (t.size * MAX_GROWTH * scale) / 2,
  }));

  let best = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
  let bestScore = -Infinity;
  for (let i = 0; i < 60; i++) {
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    let score = Infinity;
    for (const o of others) {
      score = Math.min(score, Math.hypot(o.x - x, o.y - y) - (o.r + radius));
    }
    // Slight pull toward the centre so early seeds don't hug the edges.
    const centrePull = Math.hypot(x - width / 2, (y - height / 2) * 1.4) * 0.08;
    score = (score === Infinity ? 1000 : score) - centrePull;
    if (score > bestScore) {
      bestScore = score;
      best = { x, y };
    }
  }
  return { x: best.x / width, y: best.y / height };
}

export function timeAgo(ts) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 45) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}
