# Mobile Migration Playbook (PWA + Capacitor)

This playbook captures the migration pattern validated on `chess` so the same workflow can be applied to the remaining games.

## 1) Per-game PWA checklist

For each game folder (example: `snake`, `minesweeper`):

1. Add `manifest.webmanifest` in the game folder.
2. Add service worker `sw.js` with:
   - local game assets (`./style.css`, `./script/*.js`, `./index.html`)
   - shared assets (`../shared/styles/*.css`, `../shared/scripts/*.js`)
3. Add icon files under `icons/` (192 and 512 recommended).
4. Update game `index.html`:
   - `viewport-fit=cover`
   - `theme-color`
   - manifest/icon links
   - service worker registration snippet
5. Verify installability and offline open.

## 2) Mobile UX checklist

1. Add safe-area aware padding using `env(safe-area-inset-*)`.
2. Audit touch targets (minimum 40-44 px equivalent).
3. Ensure no hover-only interactions.
4. Add touch-friendly interaction:
   - drag fallback to tap
   - avoid accidental scroll during board interactions
5. Re-test status updates and controls on small screens.

## 3) State persistence checklist

1. Use `GameKit.saveScore` and `GameKit.loadScore`.
2. Persist all needed state (board, turn, difficulty/mode, status, capture info).
3. Validate hydration with defensive checks.
4. Confirm state is restored after app restart.

## 4) Capacitor workflow

At `Classic Casual Games` root:

1. `npm install`
2. `npm run sync`
3. `npm run open:android` (for Android Studio workflow)
4. `npm run open:ios` (macOS + Xcode only)

If onboarding a new game as the primary app target:

1. Update `capacitor.config.json` `webDir` to the target game directory.
2. Run `npm run sync` again.

## 5) QA acceptance matrix per game

1. Gameplay parity with web version.
2. Portrait layout usable and readable.
3. Offline launch works after first load.
4. State survives app restart.
5. Android debug build launches and runs.
6. iOS build validates on macOS/Xcode environment.
