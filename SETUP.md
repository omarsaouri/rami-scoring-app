# SETUP.md — Project Setup & Architecture

Mobile-first iOS app for tracking Moroccan Rummy scores. React Native + Expo, deployed via TestFlight. Phase 1 = MVP: scoring engine (all three modes), new game flow, scoreboard, round entry, game persistence, team mode. No analytics, sharing, or cloud yet.

## Tech Stack

- **Framework:** React Native + Expo (SDK 52+)
- **Language:** TypeScript (strict mode)
- **Navigation:** expo-router (file-based, tab + stack)
- **Local DB:** expo-sqlite (offline-first, source of truth for all game state)
- **State:** Zustand (in-memory UI state; mirrors the active game only)
- **Animations:** react-native-reanimated
- **Localization:** i18next + react-i18next (Darija, French, English)
- **Build/Deploy:** EAS Build → TestFlight via `npx testflight`

Later phases: charts (react-native-gifted-charts / Victory Native), expo-haptics, react-native-view-shot + expo-sharing, Supabase for cloud sync.

## Prerequisites

1. macOS (required for iOS builds)
2. Node.js 20+ (`brew install node`)
3. Xcode 16+ (Mac App Store) then `xcode-select --install`
4. Apple Developer Account ($99/yr)
5. Expo account (expo.dev)
6. EAS CLI (`npm install -g eas-cli`)

## Project Structure

```
rami-score/
├── app/                        # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx           # Home — active game or start new
│   │   ├── history.tsx         # Past games list
│   │   ├── stats.tsx           # Analytics dashboard (later phase)
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
│   ├── GameSummaryCard.tsx     # Shareable result image (later phase)
│   └── VariantPicker.tsx       # Simple vs 71 vs 71 Bla Joker
├── lib/
│   ├── scoring.ts              # Moroccan rummy scoring engine (all three modes)
│   ├── rules.ts                # Variant definitions + table-level overrides
│   ├── db.ts                   # SQLite operations + versioned migrations
│   └── i18n.ts                 # Localization setup
├── assets/{fonts,images}/
├── app.json
├── eas.json
└── package.json
```

## Coding Conventions

- Components: PascalCase (`Scoreboard.tsx`). Lib/utilities: camelCase (`scoring.ts`).
- Types: descriptive (`GameVariant`, `RoundScore`, `JokerColor`).
- Use Moroccan terminology in code: `tirsi`, `suivi`, `vierge`, `tallage`, `blaJoker` — not "set", "run", "clean".
- All user-visible text goes through i18n — no hardcoded strings in components.
- SQLite is the source of truth; Zustand mirrors the active game only.
- Offline-first: works fully without network from first launch. No sign-up, no auth in MVP.

## Database Schema (SQLite)

```sql
CREATE TABLE players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE games (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'active',           -- active | completed | abandoned
  variant TEXT NOT NULL,                           -- simple | 71 | 71_bla_joker
  score_threshold INTEGER NOT NULL DEFAULT 1001,   -- 501 | 701 | 1001
  is_team_mode INTEGER NOT NULL DEFAULT 0,
  custom_rules TEXT,                               -- JSON blob for table-level overrides
  created_at INTEGER NOT NULL,
  completed_at INTEGER,
  winner_id TEXT REFERENCES players(id)
);

CREATE TABLE game_players (
  game_id TEXT REFERENCES games(id),
  player_id TEXT REFERENCES players(id),
  seat_order INTEGER NOT NULL,
  team INTEGER,                                    -- NULL if solo, 1 or 2 if team mode
  is_eliminated INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (game_id, player_id)
);

CREATE TABLE rounds (
  id TEXT PRIMARY KEY,
  game_id TEXT REFERENCES games(id),
  round_number INTEGER NOT NULL,
  winner_id TEXT REFERENCES players(id),
  joker_color TEXT,                                -- 71_bla_joker only: 'red' | 'black'
  created_at INTEGER NOT NULL
);

CREATE TABLE round_scores (
  round_id TEXT REFERENCES rounds(id),
  player_id TEXT REFERENCES players(id),
  score INTEGER NOT NULL,                          -- card-value total or 100 flat penalty
  has_posed INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (round_id, player_id)
);
```

## Build Steps

### 1. Scaffold

```bash
npx create-expo-app rami-score --template tabs
cd rami-score
npx expo install expo-sqlite expo-haptics expo-sharing
npx expo install react-native-reanimated react-native-gesture-handler
npm install zustand i18next react-i18next
```

Set up 4 tabs (Home, History, Stats, Settings) and initialize the SQLite schema above.

### 2. Scoring engine (`lib/scoring.ts`)

Implement all three modes per RULES.md. Key points: card values (As always 10), circular suites, 71 threshold with joker combos = 0, raise mechanic, vierge requirement, flat 100 / team 200 penalties, no rami sec, optional −20 winner bonus, lowest cumulative score wins at threshold.

### 3. Core screens

New Game (variant picker, 2–6 player names, threshold, optional teams) → Active Game (scoreboard + Add Round + history) → Score Entry (per-player input with quick card-value buttons) → Game Summary (winner + stats).

### 4. EAS configure

```bash
eas login
eas build:configure
```

Production profile in `eas.json`:

```json
{
  "build": {
    "production": {
      "ios": { "buildConfiguration": "Release", "distribution": "store" }
    }
  }
}
```

### 5. Deploy to TestFlight

```bash
npx testflight
```

Then in App Store Connect: create an internal testing group and invite testers by email.

## Key Commands

```bash
npx expo start                 # Dev server
npx expo start --ios           # iOS simulator
eas build --platform ios       # Production build
npx testflight                 # Build + sign + upload to TestFlight
eas update                     # OTA update (no new build)
```
