# CalCup 2027 — live update guide

The entire site is driven by one file: **`site/data/data.js`**. You never edit HTML.
Schedule, standings, and top scorers all recompute themselves from it.

## During the tournament — recording a result

You don't touch code. In a Claude session pointed at this project, just say it in plain English:

> "Game 12 final — LATHC 29, CalHeat Orange 26. Scorers: Grifol 9 for LATHC, Paulus 8 for Orange."

Claude finds game 12 in `data.js`, sets the score, flips status to `final`, adds the scorers, saves, and (once hosting is connected in Phase 5) publishes. Live in under a minute. Standings and the Top-scorers page update automatically — nothing else to edit.

Other things you can just say:
- "Mark game 13 as live, CalHeat 14–12." → sets `status:"live"` with a running score.
- "Game 23 is Boston vs Denver." → fills a placement/final matchup once teams are known.
- "Fix game 8 — Boston 27 not 26." → corrects a typo.

## What each game field means

| Field | Meaning |
|---|---|
| `status` | `upcoming` → `live` → `final` |
| `scoreA` / `scoreB` | team A / team B score (use `null` before the game) |
| `goals` | `[{team, player, goals}]` — feeds Top scorers. Enter from the game sheet. |
| `refs` | referee pair id (`r1`–`r3`) |
| `table` | table-crew volunteer ids (`v1`–`v4`) |

## Before the event — locking 2027 data

The current data is **2026 as a sample**. Before go-live, replace: `teams` (once the 2027 format/entries lock), `referees`, `volunteers`, and the `games` list (matchups, days, times). Just tell Claude the final schedule and it updates the file.

## Golden rules

1. **One source of truth.** Only `data.js` changes during the event. Never hand-edit standings or scorer numbers — they're computed.
2. **One scorekeeper at a time** to avoid conflicting edits. A backup person should know the workflow.
3. **Goals are optional but additive** — if you skip scorers for a game, standings still work; the Top-scorer race just won't reflect that game.
