# HANDOVER — Instinct → Antigravity (2026-11-20)

**Main is at `12c0685`. Run the task-start sync (git pull --ff-only) before any edit. Do not edit from a stale tree.**

## What changed (three merged PRs, each a single squash merge)

- **PR #21 `604adbd` — Typography display fixes.** Restored white-on-blue finding-callout titles (generic h3/h4 rule had repainted them dark-on-blue); inline formulae inside headings now inherit the display font (body formulae stay Georgia serif); mobile anchor scroll-offset 116px → 72px; site-wide rag control via `text-wrap: pretty` (body) and `balance` (masthead/section/analysis headings) plus `.nb-c` no-break spans around short numeric compounds (2nd-placed, 38-game, 40-in-38, 1981-82) in static HTML and the dynamic text pipeline. DOM text byte-identical.
- **PR #22 `d5fbf84` — Masthead leading.** Sicko masthead `line-height` 1.06 → 1.22; CF Condensed glyph boxes (39px font / 41.5px line box) plus the 8px stepped shadow were colliding between headline rows at tablet widths.
- **PR #23 `12c0685` — Division leaders data batch 1.** 27 corroborated historical top-scorer records (25 not_verified + 2 disputed) added to `data/division-leaders.json` and the regenerated `data/division-leaders-bundle.js`. Coverage: verified_league 156 / disputed 5 / not_verified 19 (of 180 slots; 154 of 178 non-curtailed). 4 provisional records and all unresolved disputes deliberately held back. `tests/ui-and-browser.test.mjs` data-derived expectations updated to match (missing rows 51→24, marks 127→154, title 127→154 of 178; clubMissing 9 unchanged).

Earlier direct-to-main commits `bd9cb54` and `3a7f1ef` (reading-mode switch label/icon/hint cleanup) are also included in this tree.

## What's tested

- Full suite at HEAD `12c0685`: **33/33 pass** (22 data/analysis + 11 UI/browser, Chrome via CHROME_PATH). The compound break-guard test (test 11) covers idempotence across voice toggles.
- Live rendered verification after each deploy at 375/768/1440/1920 in both modes: callout contrast, heading font consistency, no horizontal overflow, no broken `.nb-c` compounds, masthead row separation, real anchor-jump targets land below the sticky nav.

## What's unresolved

- `text-wrap: pretty/balance` is Chromium/Safari-only; Firefox ignores it and falls back to normal wrapping (graceful, no breakage).
- Word-word hyphenated compounds (e.g. survival-boundary) may still break at the hyphen; the no-break spans cover only short numeric/ordinal compounds. text-wrap cannot guarantee zero orphans in future copy edits.
- Data: 19 slots remain not_verified, 5 disputed, 4 provisional records held pending corroboration. The historical-verification agent has the evidence state.
- GitHub web editor hazard: bulk paste into the CodeMirror editor can stack content. Verify blob length/hash after any web-editor commit, or use the deterministic replace (document.querySelector('.cm-content').cmTile.view.dispatch).
