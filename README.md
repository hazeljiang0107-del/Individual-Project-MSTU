# Headspace Garden

Headspace Garden makes invisible cognitive load visible.

Every small unfinished thing — *reply to professor*, *laundry*, *call someone* — takes up a little mental space. On its own, each one is nothing. Together, they crowd the room. In Headspace Garden you plant each of those thoughts as a small living object in a calm garden. As you add more, the garden visibly fills: the pool of light at its centre shrinks, the raked rings in the ground disappear, and the headspace meter climbs from *Clear* to *Crowded*.

Then you tend it. Tap a thought and decide where it belongs:

- **Today** — give it a place in today. It's tossed into the Today basket.
- **Later** — park it somewhere safe. It's tossed into the Later basket.
- **Release** — let it go. It dissolves into spores and is gone.

As thoughts leave the garden, the space opens back up.

It's meant to feel like an interactive object, not a to-do list.

## The loop

Two forces pull against each other.

**Neglect makes things grow.** A thought doesn't sit still. It moves through four
stages — seed, sprouting, budding, overgrown — driven both by time and by
crowding: every newer thought still in the garden presses on the older ones. Each
stage adds visible botany (a stem, leaves, a bud, then tendrils) and makes the
thought physically larger, so neglect literally takes up more room. Overgrown
neighbours grow tendrils toward each other.

**Tending makes something permanent.** Resolving is a promise in two steps. Today
and Later drop a thought into a basket; marking it done makes it **bloom** into a
flower planted for good in the meadow along the bottom of the garden. Releasing
plants a pale **wisp** instead — letting go still counts.

The bloom remembers the stage you caught it at. Tend something early and it comes
up bright and full; let it overgrow first and the flower is smaller and muted. So
the meadow becomes an honest record of how you tended, and the reward points
toward catching things early.

Progress shows up in four places: the **Clarity** score (0–100, which weights an
overgrown thought about four times as heavily as a fresh one), the **garden
level** that climbs from Bare soil to Wild garden as the meadow fills, a **daily
tending streak**, and the **meadow** itself.

## Running it

Requires Node 18+.

```bash
npm install
npm run dev       # http://localhost:5174
```

Production build:

```bash
npm run build     # outputs static files to dist/
npm run preview   # serve the build locally
```

`dist/` is a plain static site and can be deployed as-is to Netlify, Vercel, GitHub Pages, Cloudflare Pages, etc.

## Current features

- **Plant a thought** from the composer ("What's taking up space?"). On first visit the composer sits centred with suggestions; afterwards it docks at the bottom so you can keep planting quickly.
- **Organic thought seeds.** Each thought is a morphing blob with its own shape, colour, drift path, speed and depth. Colour and shape are random and carry no meaning yet; size loosely follows text length for legibility.
- **Four growth stages.** Time and crowding push a thought from seed to overgrown, adding a stem, leaves, a bud and then tendrils, and growing its footprint. A ring pulses each time one reaches a new stage.
- **Entanglement.** Overgrown thoughts are linked to their nearest overgrown neighbour by a faint tendril.
- **Even placement.** New seeds go in the most open spot, kept a full grown radius clear of the header and dock.
- **A garden that responds to load.** Background, light pool, raked rings and grain all track the Clarity score rather than a raw count.
- **Clarity, levels and streaks.** A 0–100 score that weights overgrown thoughts far more heavily, a lifetime level from Bare soil to Wild garden, and a daily tending streak.
- **The meadow.** Every resolved thought leaves a permanent mark along the bottom: a bloom for one you tended, a wisp for one you let go, brightness set by the stage you caught it at.
- **Garden journal.** Tap the Clarity meter for the score, a breakdown by growth stage, level progress, lifetime totals, your streak and which thought has waited longest.
- **"A clearing."** Resolving three things within about forty seconds sweeps light across the garden.
- **Inspect and resolve.** Tap a seed to focus it (the rest dims) and open the inspector, which names its growth stage. Choose Today, Later or Release — keyboard `1` / `2` / `3`, `Esc` to close.
- **Distinct exit animations.** Today and Later toss the seed in an arc into its basket, which catches it with a squash. Release swells, blurs and scatters spores.
- **Baskets.** Today and Later collect a coloured pebble per thought. Tap one to see its list, then *Bloom* an item or *replant* it into the garden.
- **Undo** for both releasing and blooming, via a short-lived toast.
- **Let time pass.** A button in the journal ages the garden three hours — about one stage — so you can see what neglect does without waiting for it.
- **Persistence.** State is saved to `localStorage`, so the garden and the meadow survive a reload.
- **Responsive.** Side panel on desktop, bottom sheet on mobile; all interactions work by tap.
- **Reduced motion.** Drift, morphing, parallax and swaying are disabled when the OS requests reduced motion.

## Structure

```
src/
  App.jsx                 state, planting, resolve/bloom/undo flow, streaks
  lib/
    seeds.js              thought factory, palette, placement
    growth.js             growth stages, clarity, levels, blooms, streaks
  hooks/usePersistentState.js
  components/
    Header.jsx            wordmark, level, clarity meter (opens the journal)
    Garden.jsx            the field: light pool, rings, grain, meadow, seeds
    ThoughtSeed.jsx       a single drifting, morphing seed
    Flora.jsx             the stem/leaves/bud/tendrils a seed grows
    Tendrils.jsx          links between entangled overgrown thoughts
    Meadow.jsx            permanent blooms and wisps along the ground
    Composer.jsx          "What's taking up space?" input
    Basket.jsx            Today / Later vessels in the dock
    Inspector.jsx         focus panel with Today / Later / Release
    BasketSheet.jsx       list view for a basket (bloom / replant)
    Journal.jsx           clarity, stage breakdown, level, totals, streak
    Clearing.jsx          the "a clearing" moment
    Toast.jsx             undo for releasing and blooming
  styles/global.css       design tokens, shared panel styles
```

Plain CSS, one stylesheet per component. No UI or animation libraries.

## Known limitations

- **Single device only.** State lives in `localStorage`, so there's no sync, account or backup, and clearing site data erases the garden and the meadow.
- **No editing.** A thought's text can't be edited after planting; release it and plant it again.
- **Overlap when very full.** Placement is best-effort; with many thoughts (roughly a dozen on a phone) grown seeds will overlap. This is partly intentional, but there's no physics or collision avoidance.
- **Positions don't reflow on resize.** Seeds keep their relative positions, so dramatic window-size changes can bunch them up.
- **Growth pauses nothing.** Neglect accrues in real time whether or not the app is open, and there's no way to snooze a thought or mark it as genuinely long-term.
- **Time is compressed.** A thought overgrows in about six hours, which suits a single day of obligations but isn't how a real backlog behaves. "Let time pass" is a demo aid, and it shifts stored timestamps rather than simulating a clock.
- **The meadow only accumulates.** It renders the most recent 64 marks, never thins out, and has no notion of seasons or history you can browse.
- **The streak is generous.** Any single tending action counts for the day, and it isn't shown anywhere except the journal.
- **No meaning in colour yet.** Colour and shape are still random; only size and flora encode anything.
- **Fonts load from Google Fonts** (Fraunces, Instrument Sans). Offline, the app falls back to system serif/sans.
- **No AI features** in this version by design.
