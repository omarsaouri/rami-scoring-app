# Hot notes: 2026-07-01 session

Quick context for picking this project back up. Read this first, then [ARCHITECTURE.md](ARCHITECTURE.md) for how it's built and [PROGRESS.md](PROGRESS.md) for full status. Delete or replace this file once its content is stale.

## What happened today

1. **Folder/code cleanup.** Removed dead Expo template files (`constants/Colors.ts`, the `useColorScheme`/`useClientOnlyValue` hooks) and consolidated a color palette and a variant-label map that were copy-pasted across ten-plus files into `constants/theme.ts` and `lib/rules.ts`. Split the old project doc into [ARCHITECTURE.md](ARCHITECTURE.md) (how it works) and [PROGRESS.md](PROGRESS.md) (status and plans).
2. **Supabase backup sync, built end to end.** Spec at `docs/superpowers/specs/2026-06-30-supabase-backup-sync-design.md`, plan at `docs/superpowers/plans/2026-06-30-supabase-backup-sync.md`. Built task by task in an isolated worktree (subagent-driven-development: fresh implementer + reviewer per task), then a whole-branch review that caught two real bugs before merge:
   - A missing/misconfigured `.env` would have crashed the *entire app* at boot (not just sync), because the root layout statically imports the sync module. Fixed: `lib/supabase.ts` now returns `null` instead of throwing when env vars are absent.
   - A first-launch race could mint multiple anonymous Supabase identities and fragment the backup. Fixed: `ensureSession()` in `lib/sync.ts` now memoizes the in-flight promise, not just the resolved id.
   Merged to `main` and pushed.
3. **Live-debugged the real Supabase connection**, four separate blockers found and fixed in order:
   - `.env`'s `EXPO_PUBLIC_SUPABASE_URL` had `/rest/v1/` appended (should be the bare project URL).
   - Anonymous sign-ins were disabled in the Supabase dashboard (Authentication → Providers). Enabled now.
   - The migration (`supabase/migrations/20260630230756_backup_sync.sql`) had never actually been applied to the live project despite the code being merged. Applied via `npx supabase db push`.
   - PostgREST's schema cache was stale after that push. Reloaded via the dashboard's "Reload schema" button.
   Confirmed working: a clean app boot now pushes pending local rows to Supabase with no errors.

## Current state

- Backup sync is live and confirmed working against production. It's push-only: local writes flow to Supabase, nothing flows back. See PROGRESS.md's "Now planned" for what's deliberately deferred (restore on fresh install, two-way sync, a sync-status indicator in Settings).
- `.env` exists locally in the main checkout with real Supabase credentials (gitignored, not committed, as expected).
- The feature branch's worktree (`.claude/worktrees/supabase-backup-sync`) has been removed as part of today's cleanup.

## Loose thread

There's a git stash in the main checkout: `stash@{0}: "stray uncommitted app/_layout.tsx edit, pre-merge safety stash"`. It's a duplicate of a change that's already properly committed (confirmed empty diff against current `app/_layout.tsx`), so it's safe to `git stash drop`, but dropping it got blocked by a permission classifier mid-session and was never explicitly re-requested. Harmless to leave, fine to drop next time someone's doing housekeeping.

## Where to pick up next

PROGRESS.md's "Now planned" list is the backlog, in no particular priority: NativeWind/Tailwind integration, a DESIGN.md-driven UI pass, restore-from-backup, two-way sync, sync status in Settings, plus the older "Known gaps" (joker-color UI, unused `PlayerCard.tsx`, `CustomRules` UI, round editing/undo, `GameSummaryCard`, unused `Player.avatar`). Ask the user which one before starting.
