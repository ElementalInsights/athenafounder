import { readFileSync, writeFileSync } from 'fs';
const sessions = JSON.parse(readFileSync('C:/Users/jebus/claude-viz-data.json', 'utf8'));

const allTools = {}, allFiles = {};
for (const s of sessions) {
  for (const [k,v] of Object.entries(s.toolCalls)) allTools[k] = (allTools[k]||0)+v;
  for (const [k,v] of Object.entries(s.filesEdited)) allFiles[k] = (allFiles[k]||0)+v;
}

const sep = '\\';

const slim = sessions.map(s => ({
  id: s.id.substring(0,8),
  slug: s.slug,
  branch: s.gitBranch,
  start: s.startTime,
  end: s.endTime,
  sizeMB: Math.round(s.fileSizeBytes / 1024 / 1024 * 10) / 10,
  userMsgs: s.userMessages,
  assistantMsgs: s.assistantMessages,
  records: s.totalRecords,
  compacts: s.compactBoundaries,
  compactPos: s.compactPositions,
  turns: s.turnDurations,
  apiErrors: s.apiErrors,
  topTools: Object.entries(s.toolCalls).sort((a,b)=>b[1]-a[1]).slice(0,5),
  topEdits: Object.entries(s.filesEdited).sort((a,b)=>b[1]-a[1]).slice(0,3)
    .map(([f,v]) => [f.split(sep).pop(), v]),
}));

const topTools = Object.entries(allTools).sort((a,b)=>b[1]-a[1]).slice(0,12);
const topFiles = Object.entries(allFiles).sort((a,b)=>b[1]-a[1]).slice(0,12)
  .map(([f,v]) => {
    const parts = f.split(sep);
    const name = parts.pop();
    const parent = parts.pop() || '';
    return [name + ' (' + parent + ')', v];
  });

writeFileSync('C:/Users/jebus/claude-viz-slim.json', JSON.stringify({ sessions: slim, topTools, topFiles }));
console.log('Done:', JSON.stringify({ sessions: slim, topTools, topFiles }).length, 'bytes');
