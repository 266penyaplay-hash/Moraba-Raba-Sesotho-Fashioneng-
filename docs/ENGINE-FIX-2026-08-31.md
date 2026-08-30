# Engine fix — 2026-08-31

## Bugs

1. `App.tsx` called `checkGrandMeridianLine(formedMills, pointId, player, points)`.
   The engine expected `(pointId, player, points, formedMills)`.
   That threw at runtime on double mills and left `grandMeridianPoints` empty.

2. Place/move used `checkMillsForPoint` (any mill touching the destination),
   so an old mill could award a capture. Canonical helper is `detectNewlyFormedMills`.

## What landed

- `src/engine/morabaraba.ts` `checkGrandMeridianLine` accepts **both** argument orders.
- Result includes `points` and alias `meridianPoints` for older UI reads.
- Local `App.tsx` is patched to the canonical order + newly-formed mills.
  Push that file next if this commit does not include it.

Sotho 25 still has no flying.
