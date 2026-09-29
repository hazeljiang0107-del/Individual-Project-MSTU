import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import Garden from './components/Garden.jsx';
import Composer from './components/Composer.jsx';
import Basket from './components/Basket.jsx';
import Inspector from './components/Inspector.jsx';
import BasketSheet from './components/BasketSheet.jsx';
import Journal from './components/Journal.jsx';
import Clearing from './components/Clearing.jsx';
import Toast from './components/Toast.jsx';
import { usePersistentState } from './hooks/usePersistentState.js';
import { createThought, findOpenSpot, seedSize } from './lib/seeds.js';
import { bumpStreak, clarityOf, createBloom, levelFor, loadLabel, withGrowth } from './lib/growth.js';
import './App.css';

const SEND_MS = 760;
const RELEASE_MS = 1000;
const GROWTH_TICK_MS = 10_000;
const COMBO_WINDOW_MS = 40_000;
const COMBO_AT = 3;
const TIME_STEP_MS = 3 * 3_600_000; // roughly one growth stage per press

const EMPTY_STATS = { grown: 0, released: 0, streak: 0, best: 0, lastDay: null };

/** Reserved bands for the header and the dock/meadow, plus the seed render scale. */
function gardenBounds(el) {
  const { width, height } = el.getBoundingClientRect();
  const mobile = width < 720;
  return {
    width,
    height,
    top: mobile ? 104 : 92,
    bottom: mobile ? 250 : 200,
    side: 22,
    scale: mobile ? 0.7 : 1.12,
  };
}

export default function App() {
  const [thoughts, setThoughts] = usePersistentState('headspace-garden:thoughts', []);
  const [blooms, setBlooms] = usePersistentState('headspace-garden:blooms', []);
  const [stats, setStats] = usePersistentState('headspace-garden:stats', EMPTY_STATS);

  const [selectedId, setSelectedId] = useState(null);
  const [leaving, setLeaving] = useState({});
  const [openBasket, setOpenBasket] = useState(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const [landed, setLanded] = useState({ today: 0, later: 0 });
  const [toast, setToast] = useState(null);
  const [clearing, setClearing] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  const thoughtsRef = useRef(thoughts);
  thoughtsRef.current = thoughts;
  const gardenRef = useRef(null);
  const comboRef = useRef([]);
  const basketRefs = { today: useRef(null), later: useRef(null) };

  // Growth is time-based, so the garden needs a heartbeat even when idle.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), GROWTH_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const inGarden = useMemo(() => thoughts.filter((t) => t.status === 'garden'), [thoughts]);
  const today = useMemo(() => thoughts.filter((t) => t.status === 'today'), [thoughts]);
  const later = useMemo(() => thoughts.filter((t) => t.status === 'later'), [thoughts]);

  const staged = useMemo(() => withGrowth(inGarden, now), [inGarden, now]);
  const stagedRef = useRef(staged);
  stagedRef.current = staged;

  const visible = staged.filter((t) => !leaving[t.id]);
  const { clarity } = useMemo(() => clarityOf(visible), [visible]);
  const label = loadLabel(clarity, visible.length);
  const overgrown = visible.filter((t) => t.stage === 3).length;
  const level = levelFor(stats.grown + stats.released);
  const selected = staged.find((t) => t.id === selectedId) ?? null;

  const plant = useCallback(
    (text) => {
      const clean = text.trim();
      if (!clean || !gardenRef.current) return;
      const bounds = gardenBounds(gardenRef.current);
      setThoughts((prev) => {
        const occupied = prev.filter((t) => t.status === 'garden');
        const spot = findOpenSpot(occupied, bounds, seedSize(clean));
        return [...prev, createThought(clean, spot)];
      });
      setNow(Date.now());
    },
    [setThoughts],
  );

  /** Counts a tending action toward the streak, and fires "a clearing" on a run. */
  const countTending = useCallback(() => {
    setStats((s) => bumpStreak(s));
    const t = Date.now();
    comboRef.current = [...comboRef.current.filter((x) => t - x < COMBO_WINDOW_MS), t];
    if (comboRef.current.length >= COMBO_AT) {
      setClearing({ key: t, count: comboRef.current.length });
      comboRef.current = [];
    }
  }, [setStats]);

  const resolve = useCallback(
    (id, outcome) => {
      const seedEl = document.querySelector(`[data-seed-id="${id}"]`);
      let dx = 0;
      let dy = 0;
      const target = basketRefs[outcome]?.current;
      if (seedEl && target) {
        const a = seedEl.getBoundingClientRect();
        const b = target.getBoundingClientRect();
        dx = b.left + b.width / 2 - (a.left + a.width / 2);
        dy = b.top + b.height / 2 - (a.top + a.height / 2);
      }

      const stage = stagedRef.current.find((t) => t.id === id)?.stage ?? 0;
      setSelectedId(null);
      setLeaving((l) => ({ ...l, [id]: { outcome, dx, dy } }));

      setTimeout(
        () => {
          setLeaving(({ [id]: _, ...rest }) => rest);
          if (outcome === 'release') {
            const removed = thoughtsRef.current.find((t) => t.id === id);
            if (!removed) return;
            const wisp = createBloom(removed, 'wisp', stage);
            setThoughts((prev) => prev.filter((t) => t.id !== id));
            setBlooms((prev) => [...prev, wisp]);
            setStats((s) => ({ ...s, released: s.released + 1 }));
            countTending();
            setToast({ key: Date.now(), kind: 'release', thought: removed, bloomId: wisp.id });
          } else {
            // Stage is kept so the eventual bloom reflects when it was caught.
            setThoughts((prev) =>
              prev.map((t) => (t.id === id ? { ...t, status: outcome, caughtAt: stage } : t)),
            );
            setLanded((n) => ({ ...n, [outcome]: n[outcome] + 1 }));
          }
        },
        outcome === 'release' ? RELEASE_MS : SEND_MS,
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setThoughts, setBlooms, setStats, countTending],
  );

  /** Marking a basket item done is what turns it into a permanent bloom. */
  const complete = useCallback(
    (id) => {
      const done = thoughtsRef.current.find((t) => t.id === id);
      if (!done) return;
      const bloom = createBloom(done, 'bloom', done.caughtAt ?? 0);
      setThoughts((prev) => prev.filter((t) => t.id !== id));
      setBlooms((prev) => [...prev, bloom]);
      setStats((s) => ({ ...s, grown: s.grown + 1 }));
      countTending();
      setToast({ key: Date.now(), kind: 'bloom', thought: done, bloomId: bloom.id });
    },
    [setThoughts, setBlooms, setStats, countTending],
  );

  const undo = useCallback(() => {
    if (!toast) return;
    const { thought, bloomId, kind } = toast;
    setBlooms((prev) => prev.filter((b) => b.id !== bloomId));
    setThoughts((prev) => [
      ...prev,
      { ...thought, status: kind === 'bloom' ? (thought.status ?? 'today') : 'garden' },
    ]);
    setStats((s) =>
      kind === 'bloom'
        ? { ...s, grown: Math.max(0, s.grown - 1) }
        : { ...s, released: Math.max(0, s.released - 1) },
    );
    setToast(null);
  }, [toast, setThoughts, setBlooms, setStats]);

  const dismissToast = useCallback(() => setToast(null), []);

  const replant = useCallback(
    (id) => setThoughts((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'garden' } : t))),
    [setThoughts],
  );

  /** Demo aid: shifts planting times back so growth is visible without waiting. */
  const passTime = useCallback(() => {
    setThoughts((prev) =>
      prev.map((t) => (t.status === 'garden' ? { ...t, createdAt: t.createdAt - TIME_STEP_MS } : t)),
    );
    setNow(Date.now());
  }, [setThoughts]);

  const closeAll = useCallback(() => {
    setSelectedId(null);
    setOpenBasket(null);
    setJournalOpen(false);
  }, []);

  useEffect(() => {
    if (openBasket === 'today' && today.length === 0) setOpenBasket(null);
    if (openBasket === 'later' && later.length === 0) setOpenBasket(null);
  }, [openBasket, today.length, later.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeAll();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeAll]);

  return (
    <div className="app">
      <Garden
        ref={gardenRef}
        thoughts={staged}
        blooms={blooms}
        leaving={leaving}
        selectedId={selectedId}
        density={Math.min(1, (100 - clarity) / 100)}
        onSelect={(id) => {
          setOpenBasket(null);
          setJournalOpen(false);
          setSelectedId((cur) => (cur === id ? null : id));
        }}
        onClear={() => setSelectedId(null)}
      />

      <Header
        clarity={clarity}
        label={label}
        count={visible.length}
        overgrown={overgrown}
        level={level}
        onOpenJournal={() => {
          setSelectedId(null);
          setOpenBasket(null);
          setJournalOpen((o) => !o);
        }}
      />

      <footer className={`dock ${thoughts.length === 0 && blooms.length === 0 ? 'is-quiet' : ''}`}>
        <Basket
          ref={basketRefs.today}
          kind="today"
          items={today}
          pulse={landed.today}
          onOpen={() => {
            setSelectedId(null);
            setJournalOpen(false);
            setOpenBasket((b) => (b === 'today' ? null : 'today'));
          }}
        />
        <Composer onPlant={plant} centered={inGarden.length === 0 && blooms.length === 0} />
        <Basket
          ref={basketRefs.later}
          kind="later"
          items={later}
          pulse={landed.later}
          onOpen={() => {
            setSelectedId(null);
            setJournalOpen(false);
            setOpenBasket((b) => (b === 'later' ? null : 'later'));
          }}
        />
      </footer>

      <Inspector thought={selected} onResolve={resolve} onClose={() => setSelectedId(null)} />

      <BasketSheet
        kind={openBasket}
        items={openBasket === 'today' ? today : openBasket === 'later' ? later : []}
        onClose={() => setOpenBasket(null)}
        onReplant={replant}
        onComplete={complete}
      />

      <Journal
        open={journalOpen}
        clarity={clarity}
        staged={visible}
        stats={stats}
        level={level}
        onClose={() => setJournalOpen(false)}
        onPassTime={passTime}
      />

      <Clearing moment={clearing} onDone={() => setClearing(null)} />

      <Toast toast={toast} onUndo={undo} onDismiss={dismissToast} />
    </div>
  );
}
