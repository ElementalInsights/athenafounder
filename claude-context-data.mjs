// Step: Extract context pulse data from full session JSON
// Reads claude-viz-data.json → outputs claude-context-data.json
// Fields needed: compact positions + turn durations (for featured chart annotations)

import { readFileSync, writeFileSync } from 'fs';

const raw = JSON.parse(readFileSync('./claude-viz-data.json', 'utf8'));

const out = raw.map(s => ({
  id:        s.id,
  sizeMB:    +((s.fileSizeBytes || 0) / 1024 / 1024).toFixed(2),
  compacts:  s.compactBoundaries || 0,
  positions: s.compactPositions  || [],   // normalized 0-1 positions of each reset
  msgs:      (s.userMessages || 0) + (s.assistantMessages || 0),
  maxTurnMin: s.turnDurations?.length
    ? +(Math.max(...s.turnDurations) / 60000).toFixed(1)
    : 0,
  avgTurnMin: s.turnDurations?.length
    ? +(s.turnDurations.reduce((a, b) => a + b, 0) / s.turnDurations.length / 60000).toFixed(2)
    : 0,
  // Keep top-5 longest turn positions (normalized) for featured chart annotations
  topTurns: s.turnDurations?.length
    ? s.turnDurations
        .map((d, i) => ({ pos: i / s.turnDurations.length, min: +(d / 60000).toFixed(1) }))
        .sort((a, b) => b.min - a.min)
        .slice(0, 5)
    : []
}));

writeFileSync('./claude-context-data.json', JSON.stringify(out));
console.log(`Extracted ${out.length} sessions — largest: ${Math.max(...out.map(s => s.compacts))} compacts`);
