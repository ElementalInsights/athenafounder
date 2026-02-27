# athenafounder — Build Story Site

Public GitHub Pages site at https://elementalinsights.github.io/athenafounder/
Tells the story of building AthenaForms with Claude Code, with real session data and interactive visualizations.

## Stack

Single self-contained `dist/index.html` — no framework, no bundler, no npm.
- **D3** (Sankey chart) + **GSAP 3.12.5 + ScrollTrigger** (animations) via CDN
- All data embedded as `const DATA=...` JSON at build time
- **Node.js** scripts only — run with `node script.mjs`

## Key Files

| File | Purpose |
|------|---------|
| `build-site.mjs` | Main build — reads all JSON data, outputs `dist/index.html` |
| `deploy.mjs` | Build + push to `gh-pages` branch in one command |
| `claude-viz-extract.mjs` | Parses raw `.jsonl` session files → `claude-viz-data.json` |
| `claude-viz-slim.mjs` | Slims session data → `claude-viz-slim.json` (embedded in site) |
| `claude-context-data.mjs` | Extracts context pulse data → `claude-context-data.json` |
| `claude-sankey-data.mjs` | Builds Sankey graph JSON → `claude-sankey.json` |
| `dist/index.html` | Built output — what gets deployed |
| `dist/athena-logo.png` | Logo asset |

## Gitignored (local only — contain internal file paths)

```
claude-viz-data.json     # raw session extract — ~large, has local paths
claude-viz-slim.json     # slimmed session data
claude-context-data.json # context pulse data
```

## Data Pipeline

Run in order when sessions change:

```bash
# 1. Extract from raw Claude session files
node claude-viz-extract.mjs 2>/dev/null > claude-viz-data.json

# 2. Slim + aggregate for site embedding
node claude-viz-slim.mjs

# 3. Context pulse data (bar chart player)
node claude-context-data.mjs

# 4. Sankey graph data
node claude-sankey-data.mjs

# 5. Build + deploy
node deploy.mjs
```

Raw `.jsonl` session files live at:
`C:/Users/jebus/.claude/projects/C--Projects-athenaforms-master-plan/`

## Build + Deploy

```bash
node deploy.mjs   # builds site + pushes to gh-pages branch
```

`deploy.mjs` handles everything: runs `build-site.mjs`, copies `dist/` into a
worktree on `gh-pages`, commits if anything changed, pushes.

## Deployment Setup

- **Branch:** `gh-pages` (root `/`) — NOT GitHub Actions (Actions disabled on account)
- **GitHub Pages source:** `gh-pages` branch → `/`
- `.nojekyll` in `gh-pages` root prevents Jekyll processing
- If Actions gets re-enabled: `.github/workflows/deploy.yml` is ready to go

## Site Structure

```
Hero (stats count-up + War & Peace pill)
  ↓
Story prose (what got built, the system, 393 resets, data)
  ↓
Sankey chart (effort flow: weeks → tool type → codebase area)
  ↓
Your Average Day (3×2 card grid)
  ↓
Context Pulse (concepts + interactive bar chart player)
  ↓
Hard Lessons + Real Takeaway (prose)
  ↓
Founders (Jake + Tim, LinkedIn cards)
  ↓
CTA + Footer
```

## GSAP Animation Conventions

- Cards: `gsap.fromTo(..., {opacity:0, y:N, scale:.95}, {..., ease:'back.out(1.5)'})` with ScrollTrigger
- Section headers: stagger eyebrow → title → desc with `power3.out`
- **No x-offset animations on prose text** — causes layout jitter
- Hover lifts: `{y:-6, scale:1.02, duration:.3, ease:'power2.out'}`

## Stats (as of last extract)

- 45 sessions · ~12,000 messages/day · 393 context resets · 0.82 GB · 588,119 lines written
- Security audit day: Session 38, 63 resets, 123 MB
- Most-edited file: `document-editor-page.tsx` (262 edits)
