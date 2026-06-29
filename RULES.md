# RULES.md — Moroccan Rummy (Rami Marocain) Scoring Rules

Source of truth for the scoring engine. Three game modes: **Simple**, **71 (Tallage)**, **71 Bla Joker**.

## Terminology

- **Tirsi** — set of 3–4 cards of the same rank, different suits (e.g., 7♠ 7♥ 7♦)
- **Suivi** — run of 3+ consecutive cards of the same suit (e.g., 5♣ 6♣ 7♣)
- **Vierge** — a combination containing **no joker** (clean)
- **Tallage** — the 71 variant
- **Bla Joker** — the 71 sub-variant with no physical jokers (2s act as wild)
- **Pioche** — the face-down draw deck

## Deck

- 2 standard 52-card decks + jokers = **108 cards**
- Suits: cœurs ♥, trèfles ♣, piques ♠, carreaux ♦
- Colors: red (♥♦), black (♠♣)

## Combination Fundamentals (all modes)

- A Tirsi has 3 or 4 same-rank, different-suit cards.
- A Suivi has 3+ consecutive same-suit cards.
- **Circular suites allowed** — a Suivi may wrap around (Dame-Roi-As-2-3 is valid).
- A **joker** may replace any card in either combination type.
- Any combination containing a joker counts as **0 points** toward the 71 threshold.
- **Vierge requirement (all modes):** to lay down, a player must have at least **one Tirsi vierge AND one Suivi vierge** (each containing zero jokers).

## Card Values (end-of-round counting)

| Card | Value |
|------|-------|
| 2–10 | Face value |
| Valet, Dame, Roi | 10 each |
| As | **Always 10** (in Tirsi, after Roi, or before 2) |

## Scoring Constants (all modes)

| Rule | Value |
|------|-------|
| Flat penalty — player never posed | **100** |
| Team penalty — both teammates never posed | **200** |
| Winner (normal) | **0** |
| Winner bonus — posed without taking an opponent's card | **−20** (optional toggle, off by default) |
| Rami sec | **Does not exist in Moroccan play** |

## Score Thresholds (game-end)

- Options: **501 / 701 / 1001**
- When a player's cumulative score crosses the threshold, the game ends.
- **Lowest cumulative score wins.**

## Team Play

- Games may be played in teams (pairs).
- Team score is the sum of both members' points.
- If **both** teammates fail to pose in a round → **200** penalty (not 100 each).

---

## Variant 1: Simple

- **13 cards** dealt per player.
- Random first player; play clockwise.
- **Drawing:** one card from the pioche OR the single card just discarded by the previous player.
- **Lay down ALL AT ONCE** — no progressive laying. Hold the whole hand until all combinations can be laid at once (12 in combinations + 1 discard), with at least one Tirsi vierge and one Suivi vierge.
- **Winning the round:** first player to lay all cards wins.
- **Scoring:** non-winners count the point value of all cards left in hand. A player who never posed takes the flat 100 penalty instead.

## Variant 2: 71 (Tallage)

- **14 cards** dealt per player.
- Random first player; play clockwise.
- **Drawing:** one card from the pioche OR the top discard. May also take a specific card discarded by the previous opponent **only if** laying down that turn AND the taken card is NOT part of a vierge combination.
- **First lay-down threshold:** combinations on the table must total **≥ 71 points**. Joker combinations count as 0 toward this. Must still have one Tirsi vierge and one Suivi vierge.
- **Raise mechanic:** if a player lays with MORE than 71, all others must match or exceed that total to lay down; otherwise they wait.
- **Progressive play:** after the first lay, a player may add cards to the table on later turns, including into opponents' already-laid combinations.
- **Win without 71:** may also win by laying all 14 cards at once (clean Tirsi + Suivi required), even without reaching 71.
- **Scoring:** non-layers count all cards in hand (or flat 100 if never posed). Partial layers count only the un-laid cards remaining in hand.

## Variant 2b: 71 Bla Joker (no physical jokers)

- **14 cards** dealt per player. All other 71/Tallage rules apply.
- Physical jokers are **removed from the deck**. The **2 cards** act as wild.
- **Which 2s are jokers** is set at the start of each game by the deck cut — look at the last card of the cut pile:

| Last card of cut | Joker 2s |
|------------------|----------|
| Red (♥ or ♦) | 2♠ and 2♣ (black) |
| Black (♠ or ♣) | 2♥ and 2♦ (red) |

- Store the joker color per round (`joker_color`: `red` or `black`).

---

## Rules Still to Confirm

Defaults below are provisional; expose as toggles where noted. Resolve during playtesting.

**Joker mechanics**
- End-of-round penalty value for a joker left in hand (20? value of the card it would replace? flat?).
- Bla Joker: do joker-2s count as 0 in combinations like physical jokers, or keep 2-point value?
- Bla Joker: with 4 copies of each 2 in a double deck, are all 4 of the designated color jokers, or only 2?
- Bla Joker: can a joker-2 also be played as a normal 2 (e.g., As-2-3), or only as wild?

**Winning conditions**
- 71 all-at-once win — is a final discard required, or may all 14 be posed?
- Does the −20 winner bonus apply in Simple, or only 71?

**Team play**
- Team formation — fixed pairs or seated-across.
- Team scoring purely additive, or other team-specific rules.
- Does the 200 penalty apply only when both didn't pose, or also when the team crosses a threshold?

**Edge cases**
- Pioche runs out before a win — reshuffle discard, or null round?
- May a Tirsi of 4 include duplicate cards from both decks (two 7♠)?
- May a natural card replace an opponent's joker in their laid combination (taking the joker)?

**Scoring nuances**
- As = 10 confirmed, but some tables use As = 1 before the 2 in a Suivi — support as toggle?
- Other penalty multipliers in common play (first-round / dealing penalties)?
