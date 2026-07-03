# CalCup auto-deploy pipeline

Excel (SharePoint) → Microsoft Graph → `data.js` → Netlify. Runs on a 5-minute GitHub Actions
poll plus a one-click manual trigger. The generator reads **computed values** from the master —
your formulas and tiebreakers are never re-implemented.

## Repo layout
```
site/                     the website (published to Netlify)
automation/               generator (this folder)
.github/workflows/deploy.yml   the Action
```

## What it reads (by header name, resilient to inserted rows / reordered columns)
| Tab | → site |
|-----|--------|
| Teams Master | teams (name, division, group, jersey home/away) |
| Games Schedule | games (schedule, scores, jersey Q/R, refs, table crew) |
| Standings Engine | standings (Pts/GF/GA/GD, rank) — displayed verbatim |
| Individuals Stats Men / Women | top scorers |
| Referees Master | referee pairs |

Static sections (concession, lottery, sponsors, physio, press, quiz, history) are preserved
from the existing `site/data/data.js` and only the dynamic parts are refreshed.
A **validation gate** aborts the deploy if the data looks wrong (teams ≠ 13, empty games, etc.),
so a mid-edit save never pushes a broken site.

## GitHub secrets to set (repo → Settings → Secrets and variables → Actions)
| Secret | Value |
|--------|-------|
| `TENANT_ID` | `09435b3b-3e21-4df3-9c74-64853b2c8ed8` |
| `CLIENT_ID` | `276af679-50db-4290-a43b-2b2000d92366` |
| `CLIENT_SECRET` | the secret Value you saved from Entra |
| `NETLIFY_AUTH_TOKEN` | Netlify → User settings → Applications → New access token |
| `NETLIFY_SITE_ID` | `b8a529be-6ac1-4bfb-8404-1f55494754b2` (calcup-2027) |

SharePoint file location is set in `deploy.yml` (host / site / library / file) and can be edited there.

## Run locally (dev/test, no cloud)
```
cd automation
npm install
node generate.mjs --local "../2027_Calcup Master File.xlsx"
```

## Triggering a deploy during the tournament
- **Automatic:** every ~5 min (GitHub cron; can lag a few minutes under load).
- **Instant:** GitHub → Actions → "Deploy CalCup site" → **Run workflow**. Use this right after
  entering scores for a same-minute deploy.
- Deploys only happen when the data actually changed (SHA-1 compare).

## Later upgrade (near-instant)
Power Automate flow on "file modified" in the SharePoint library → GitHub `repository_dispatch`
→ this same workflow. Swap polling for the webhook without changing the generator.
