# athenafounder

Reproducibility guide for the AthenaForms build visualization and blog post.

## What's in this folder

| File | Purpose |
|------|---------|
| `athenaforms-life.html` | The final visualization (hero stats + Sankey diagram). Open directly in browser. |
| `build-viz.mjs` | Source script that generates `athenaforms-life.html` from the two JSON data files. Run this to regenerate or tweak the viz. |
| `claude-viz-extract.mjs` | Step 1: Parses all JSONL session files and outputs `claude-viz-data.json` |
| `claude-viz-slim.mjs` | Step 2: Slims down `claude-viz-data.json` into `claude-viz-slim.json` for embedding |
| `claude-sankey-data.mjs` | Step 3: Computes Sankey flow data (week → tool type → codebase area) → `claude-sankey.json` |
| `claude-viz-data.json` | Full extracted session data (693KB) |
| `claude-viz-slim.json` | Slim session data embedded in the HTML (44KB) |
| `claude-sankey.json` | Sankey nodes + links (17 nodes, 41 links) |
| `athenaforms-build-story.md` | The blog post / founder story |

---

## To Reproduce From Scratch

All scripts require Node.js 18+. No npm installs needed (all built-ins).

### Step 1: Extract session data

Reads all `.jsonl` files from the Claude Code projects folder and extracts key metrics per session.

```bash
node claude-viz-extract.mjs > claude-viz-data.json
```

Source folder is hardcoded to:
```
C:/Users/jebus/.claude/projects/C--Projects-athenaforms-master-plan
```

Change the `DIR` constant at the top of `claude-viz-extract.mjs` if running on a different machine.

**Output per session:** id, slug, git branch, start/end time, file size, message counts, compact boundary positions, turn durations, tool call counts, files read/edited, API errors.

### Step 2: Slim the data

Reduces full session data to just what the viz needs for embedding.

```bash
node claude-viz-slim.mjs
```

Outputs `claude-viz-slim.json` (sessions array + topTools + topFiles aggregates).

### Step 3: Compute Sankey flows

Groups tool calls and file edits by week, categorizes tools into Explore/Build/Execute/Plan/Schema, and categorizes files into App Pages/Packages/Specs/DB Schema/etc.

```bash
node claude-sankey-data.mjs
```

Outputs `claude-sankey.json` with nodes and links for d3-sankey.

### Step 4: Build the HTML

Reads `claude-viz-slim.json` and `claude-sankey.json`, embeds them as inline JS, and writes the complete self-contained HTML file.

```bash
node build-viz.mjs
```

Output: `athenaforms-life.html` — open in any browser, no server needed.

---

## To Update the Viz

All visual changes go in `build-viz.mjs`. The HTML is fully regenerated each time. Key sections:

- **Colors:** Look for `:root` CSS vars and `pal` array in the Sankey draw function
- **Hero stats:** `countUp()` calls near the top of the `<script>` block
- **Average Day cards:** The `.day-grid` HTML block in the body
- **Sankey layout:** `d3.sankey()` config — `nodeWidth`, `nodePadding`, `nodeSort`
- **Sankey column order:** Controlled by `nodeSort(null)` which preserves input order from `claude-sankey.json`

After changes:
```bash
node build-viz.mjs && open athenaforms-life.html
```

---

## Sankey Category Mappings

**Tool categories** (defined in `claude-sankey-data.mjs`):

| Category | Tools |
|----------|-------|
| Explore | Read, Grep, Glob |
| Build | Edit, Write, NotebookEdit |
| Execute | Bash |
| Plan | Task, TaskCreate, TaskUpdate, TaskGet, TaskList, TaskOutput, EnterPlanMode, ExitPlanMode, AskUserQuestion |
| Schema | mcp__makerkit__* |
| Research | WebFetch, WebSearch |

**File areas** (inferred from path):

| Area | Path pattern |
|------|-------------|
| App Pages | apps/web/app |
| Packages | packages/features |
| Specs | specs/ |
| DB / Schema | schemas/ or migrations/ |
| i18n / Assets | apps/web/public |
| Core Packages | packages/ui, packages/supabase, packages/next |

---

## Key Numbers (Feb 3 - Feb 27, 2026)

- 45 sessions, 18 active days
- 115,320 total messages
- 196,497 total records
- 391 context resets
- 0.87 GB conversation data
- 10,928 Edit calls (most used tool)
- 262 edits to document-editor-page.tsx (most edited file)
- 48.5 min longest single turn
- 3.0 min average turn duration
- 6.7 hrs active Claude compute per day
- ~$2,000 total API spend
