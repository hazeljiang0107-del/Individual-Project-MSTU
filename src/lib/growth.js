/**
 * Growth engine.
 *
 * A thought left alone doesn't stay small. Its "neglect" rises with time and
 * with every newer thought still sitting in the garden, so piling things on
 * visibly overgrows the ones you planted first.
 */

const NEGLECT_PER_HOUR = 1.2; // sprouts at ~50min, buds at ~2.5h, overgrown at ~6h
const CROWD_FREE = 4; // a handful of thoughts sit quietly; past that they press on each other
const CROWD_PRESSURE = 0.5;
const NEGLECT_CAP = 12;

export const STAGES = [
  { id: 'seed', label: 'Seed', note: 'Just planted. Nothing has grown around it yet.', size: 1, weight: 1 },
  { id: 'sprout', label: 'Sprouting', note: 'It has started to take root.', size: 1.08, weight: 1.7 },
  { id: 'bud', label: 'Budding', note: 'Growing into the space around it.', size: 1.18, weight: 2.7 },
  { id: 'overgrown', label: 'Overgrown', note: 'Left long enough to tangle with everything near it.', size: 1.32, weight: 4.2 },
];

const THRESHOLDS = [1, 3, 7];

export function neglectScore(thought, newerInGarden, now) {
  const hours = Math.max(0, now - thought.createdAt) / 3_600_000;
  const crowd = Math.max(0, newerInGarden - CROWD_FREE) * CROWD_PRESSURE;
  return Math.min(NEGLECT_CAP, hours * NEGLECT_PER_HOUR + crowd);
}

export function stageIndex(score) {
  let i = 0;
  while (i < THRESHOLDS.length && score >= THRESHOLDS[i]) i++;
  return i;
}

/** Adds a live `stage` and `neglect` to each thought currently in the garden. */
export function withGrowth(inGarden, now) {
  const order = [...inGarden].sort((a, b) => a.createdAt - b.createdAt);
  const newerCount = new Map();
  order.forEach((t, i) => newerCount.set(t.id, order.length - 1 - i));

  return inGarden.map((t) => {
    const neglect = neglectScore(t, newerCount.get(t.id) ?? 0, now);
    return { ...t, neglect, stage: stageIndex(neglect) };
  });
}

/**
 * Clarity weights overgrown thoughts far more heavily than fresh ones, so the
 * score reflects how heavy the garden feels rather than just how full it is.
 */
export function clarityOf(staged) {
  const load = staged.reduce((sum, t) => sum + STAGES[t.stage].weight, 0);
  // Decays smoothly, so clarity keeps saying something even in a very full garden.
  return { clarity: Math.round(100 * Math.exp(-load / 22)), load };
}

export function loadLabel(clarity, count) {
  if (count === 0) return 'Clear';
  if (clarity >= 78) return 'Light';
  if (clarity >= 55) return 'Filling up';
  if (clarity >= 30) return 'Busy';
  if (clarity >= 12) return 'Heavy';
  return 'Overwhelmed';
}

export const LEVELS = [
  { at: 0, name: 'Bare soil', note: 'Nothing has grown here yet.' },
  { at: 1, name: 'First sprout', note: 'Something has taken.' },
  { at: 4, name: 'Taking root', note: 'The ground is waking up.' },
  { at: 10, name: 'Tended', note: 'A garden someone looks after.' },
  { at: 20, name: 'Flourishing', note: 'It grows faster than it crowds.' },
  { at: 35, name: 'Abundant', note: 'Full, and still calm.' },
  { at: 60, name: 'Wild garden', note: 'Years of small clearings.' },
];

export function levelFor(grown) {
  let i = 0;
  while (i + 1 < LEVELS.length && grown >= LEVELS[i + 1].at) i++;
  const next = LEVELS[i + 1] ?? null;
  const from = LEVELS[i].at;
  return {
    index: i,
    ...LEVELS[i],
    next,
    toNext: next ? next.at - grown : 0,
    progress: next ? (grown - from) / (next.at - from) : 1,
  };
}

/**
 * A resolved thought leaves a permanent mark in the meadow: a bloom for
 * something tended, a wisp for something released. The stage it was caught at
 * is kept, so early tending reads as brighter growth.
 */
export function createBloom(thought, kind, stage) {
  return {
    id: `b-${thought.id}`,
    kind, // 'bloom' | 'wisp'
    stage,
    color: thought.color,
    text: thought.text,
    x: 0.04 + Math.random() * 0.92,
    at: Date.now(),
  };
}

export function dayKey(ts = Date.now()) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** Advances a streak: same day keeps it, yesterday extends it, a gap restarts it. */
export function bumpStreak(stats) {
  const today = dayKey();
  if (stats.lastDay === today) return stats;
  const yesterday = dayKey(Date.now() - 86_400_000);
  const streak = stats.lastDay === yesterday ? stats.streak + 1 : 1;
  return { ...stats, streak, best: Math.max(stats.best ?? 0, streak), lastDay: today };
}

export function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Small deterministic PRNG so a thought's flora looks the same every render. */
export function prng(seed) {
  let s = seed || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
