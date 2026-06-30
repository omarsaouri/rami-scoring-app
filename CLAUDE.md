# CLAUDE.md — Rami Score (Moroccan Rummy Score Tracker)

## Project Overview

A mobile-first iOS app for tracking scores in Moroccan Rummy (Rami Marocain). Built with React Native + Expo, deployed via TestFlight. This is NOT a generic rummy app — it implements the three Moroccan modes (Simple, 71, and 71 Bla Joker) with their specific rules, terminology, and scoring.

## Context Sources

Path: /Users/omarsaouri/Documents/Vault
When you need context not already in this project:

1. Read /Users/omarsaouri/Documents/Vault first (recent context cache)
2. If not enough, read /Users/omarsaouri/Documents/Vault
3. If you need domain details, read the relevant wiki pages
4. Only then drill into specific wiki pages
Do NOT read the wiki for general coding questions.

## Tech Stack

- **Framework:** React Native + Expo (SDK 52+)
- **Language:** TypeScript (strict mode)
- **Navigation:** expo-router (file-based, tab + stack)
- **Local DB:** expo-sqlite (offline-first, all game state persisted)
- **State:** Zustand (in-memory UI state)
- **Animations:** react-native-reanimated
- **Localization:** i18next + react-i18next (Darija, French, English)
- **Build/Deploy:** EAS Build → TestFlight via `npx testflight`

## Project Structure

```
rami-score/
├── app/                        # Expo Router screens
│   ├── (tabs)/                 # Tab navigation
│   │   ├── index.tsx           # Home — active game or start new
│   │   ├── history.tsx         # Past games list
│   │   ├── stats.tsx           # Analytics dashboard
│   │   └── settings.tsx        # Language, rules, about
│   ├── game/
│   │   ├── [id].tsx            # Active game scoreboard
│   │   ├── new.tsx             # New game setup (variant + players + teams)
│   │   └── round.tsx           # Score entry for a round
│   └── _layout.tsx             # Root layout
├── components/
│   ├── Scoreboard.tsx          # Main score table
│   ├── ScoreInput.tsx          # Round score entry UI
│   ├── PlayerCard.tsx          # Player avatar + stats
│   ├── GameSummaryCard.tsx     # Shareable result image
│   └── VariantPicker.tsx       # Simple vs 71 vs 71 Bla Joker
├── lib/
│   ├── scoring.ts              # Moroccan rummy scoring engine (all three modes)
│   ├── rules.ts                # Variant definitions + table-level overrides
│   ├── db.ts                   # SQLite operations
│   └── i18n.ts                 # Localization setup
├── assets/
├── app.json
├── eas.json
└── package.json
```

## Moroccan Rummy Rules — Source of Truth

The game uses standard terminology: **Tirsi** (set of 3-4 same-rank cards, different suits), **Suivi** (run of 3+ consecutive same-suit cards), **Vierge** (clean — no joker in the combination).

### Card Values (end-of-round counting)

| Card | Value |
|------|-------|
| 2–10 | Face value |
| Valet, Dame, Roi | 10 points each |
| As | **Always 10 points** |

Circular suites allowed (Dame-Roi-As-2-3 is valid).

### Scoring Constants

| Rule | Value |
|------|-------|
| Flat penalty (never posed) | 100 points |
| Team penalty (both didn't pose) | 200 points |
| Winner | 0 points |
| Winner bonus (posed without taking opponent's card) | −20 (optional, off by default — rarely used) |
| Rami sec | Does NOT exist in Moroccan play |
| Score thresholds | 501, 701, or 1001 |

Joker in a combination = 0 points toward the 71 threshold. Joker penalty in hand at end of round: see "Rules Still to Confirm" below.

### Variant 1: Simple

- **13 cards** dealt per player
- Draw from pioche OR pick up previous player's single discard
- Lay down **ALL AT ONCE** only — no progressive laying
- Must have at least 1 Tirsi vierge + 1 Suivi vierge
- First to lay all cards wins the round
- Losers count all cards in hand. Never posed = flat 100.

### Variant 2: 71 (Tallage)

- **14 cards** dealt per player
- Draw from pioche OR top discard. Can also take a specific card from previous opponent IF laying down that turn AND the card is NOT in your vierge combinations.
- First lay requires **71+ points**. Joker combinations = 0 toward this.
- **Raise mechanic:** if someone lays >71, others must match or exceed to lay.
- After first lay, can add cards to table on future turns, including into opponents' combinations.
- Can win by laying all 14 cards at once with clean Tirsi + Suivi even without 71.
- Losers: didn't lay = count all cards (or flat 100). Partially laid = count only un-laid cards.

### Variant 2b: 71 Bla Joker (no physical jokers)

- Physical jokers **removed from deck**
- The **2 cards** of the opposite color to the last card of the deck cut become the jokers
- Red cut card → black 2s (♠♣) are jokers. Black cut card → red 2s (♥♦) are jokers.
- All other 71 rules apply

### Team Play

- Games can be played in teams (pairs)
- If both teammates fail to pose in a round = 200 flat penalty (not 100 each)

### Rules Still to Confirm

- Joker penalty value at end of round when left in hand (20? replaced-card value? flat?)
- In Bla Joker mode: do joker-2s count as 0 in combinations same as physical jokers? Can they also be used as a normal 2?
- In Bla Joker mode: with 4 copies of each 2 in a double deck, are all 4 of the designated color jokers?
- In 71 all-at-once win — is a final discard required?
- Does the −20 winner bonus apply in Simple too, or only 71?
- How are teams formed — fixed pairs, or seated position?
- If pioche runs out — reshuffle discard or null round?
- Can you lay a Tirsi with duplicate cards from both decks (e.g., two 7♠)?
- Can you swap a natural card for an opponent's joker in their laid combination?
- As = 10 always confirmed, but some tables say As = 1 before the 2. Support as toggle?

## Git Commit Conventions

- Never add a `Co-Authored-By: Claude` (or any AI/assistant) trailer to a commit message, and never list Claude as a commit author or contributor. Commits are authored by the human user only.

## Coding Conventions

- Components: PascalCase (`Scoreboard.tsx`)
- Utilities/lib: camelCase (`scoring.ts`)
- Types: descriptive names (`GameVariant`, `RoundScore`, `JokerColor`)
- Use Moroccan terminology in code: `tirsi`, `suivi`, `vierge`, `tallage`, `blaJoker` — not "set", "run", "clean"
- All text visible to users goes through i18n — no hardcoded strings in components
- SQLite is the source of truth for game state; Zustand mirrors the active game only
- Offline-first: the app must work fully without network from first launch
- No sign-up, no auth in MVP

## Key Commands

```bash
# Dev
npx expo start                    # Start dev server
npx expo start --ios              # Start with iOS simulator

# Build & Deploy
eas build --platform ios          # Production build
npx testflight                    # Build + sign + upload to TestFlight (one command)
eas update                        # OTA update (no new build needed)

# DB
# SQLite schema lives in lib/db.ts — migrations are versioned there
```

## Design Principles

- The scoreboard is the app. It loads first, loads fast.
- Score entry for a round must be faster than writing on paper.
- Use Darija terminology (Tirsi, Suivi, Vierge, Tallage) — this is a Moroccan product.
- Dark theme default (night game sessions), warm cream light alternative.
- Emerald green primary action color.
- Score numbers are the biggest element on screen — use tabular/monospaced figures.
- In 71 Bla Joker mode, clearly display which 2s are jokers this round with a visual indicator.

## Current Phase

**Phase 1 — MVP for TestFlight.** Focus: scoring engine (all three modes), new game flow, scoreboard, round score entry, game persistence, team mode. No analytics, no sharing, no cloud — those come later.
