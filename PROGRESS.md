# Progress

This file tracks build status and what's planned next, section by section and feature by feature. For how the app is built, see [ARCHITECTURE.md](ARCHITECTURE.md); that file should only ever describe the current, shipped architecture. Status and plans belong here instead.

Status values used below: **Done**, **In progress**, **Not started**.

## Phase 1: MVP

| Section / feature | Status | Notes |
|---|---|---|
| New game setup | Done | Variant picker, 2-6 players, threshold (501/701/1001), team mode for 4 players |
| Scoreboard | Done | Per-round grid, running totals, leader highlight, elimination marker |
| Round entry | Done | Posed/winner toggle, card-total input with quick-tap values, flat 100-point penalty |
| Scoring engine (`lib/scoring.ts`) | Done | Winner = 0, non-poser = 100, team penalty = 200, lowest score wins at threshold |
| History | Done | List of completed/abandoned games with winners |
| Settings | Done | Language switcher (fr/en/ar), static card-value/penalty reference |
| Localization | Done | Darija, French, English across all screens |
| Persistence (SQLite) | Done | Versioned schema in `lib/db.ts` |
| Backup sync (Supabase) | Done | Push only. `lib/sync.ts` sends unsynced rows from all 5 local tables (players, games, game_players, rounds, round_scores) to Supabase under a silent anonymous identity, scoped by RLS. Runs after local writes and on app launch. No pull, no restore yet. Verified live against the production Supabase project on 2026-07-01 (migration applied, anonymous sign-ins enabled, sync confirmed with no errors on a clean app boot). |
| Stats tab | Not started | Placeholder screen only, no win rate or history charts |

## Known gaps

These were found during the codebase review and aren't yet scheduled:

- **71 Bla Joker joker-color** isn't wired up. The `joker_color` column exists on `rounds` and `addRound` accepts it, but round entry always passes `null`. The cut-card mechanic from RULES.md has no UI.
- **`PlayerCard.tsx`** is a finished component that no screen imports. The home screen draws its own player row instead. Needs a decision: wire it in, or delete it.
- **`CustomRules`** (`winnerBonus`, `aceAlwaysTen`) and the `custom_rules` column on `games` aren't exposed anywhere in the UI. Every game uses `DEFAULT_RULES`.
- **No round editing or undo.** A typo in a saved round can't be fixed without abandoning the game.
- **`GameSummaryCard`** (shareable result image) was never started.
- **`Player.avatar`** column is always `null`; no UI sets it.

## Now planned

1. **Tailwind / NativeWind integration**: replace the current per-file `StyleSheet.create` plus shared `constants/theme.ts` token approach with utility classes. Needs a compatibility check against the installed Expo/React Native/Reanimated versions before starting, since NativeWind ships its own babel and metro config.
2. **UI and design pass**: revisit DESIGN.md (zellige-inspired accents, typography, iPad/landscape layout) and apply it screen by screen. Update DESIGN.md itself as decisions get made, so it stays a record of what shipped rather than only what was proposed.
3. **Restore from backup**: pull/restore on fresh install, keyed off something like a recovery code since there's no email or Apple ID tying a device to its anonymous Supabase identity.
4. **Two-way sync**: once restore exists, handle the conflict resolution that comes with syncing in both directions instead of push only.
5. **Sync status in Settings**: show last synced time and pending row count so backup sync isn't invisible to the player.
6. Carry over from "known gaps" above as they get scheduled: round editing/undo, Stats tab, joker-color wiring, `CustomRules` UI.

## How to keep this file useful

Update it in the same change that ships the work, not in a later cleanup pass: move an item from "Now planned" to "Phase 1" (or a new phase section) as soon as it lands, and delete it from "Known gaps" if it closes a gap. When restore (item 3 above) ships, ARCHITECTURE.md's data-flow section needs a matching update, since SQLite will no longer be the only place game data can come from.
