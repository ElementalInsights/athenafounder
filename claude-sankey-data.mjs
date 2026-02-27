import { readFileSync, writeFileSync } from 'fs';
const sessions = JSON.parse(readFileSync('C:/Users/jebus/claude-viz-data.json', 'utf8'));

// Week buckets (Feb 3–27)
function getWeek(isoStr) {
  if (!isoStr) return null;
  const d = new Date(isoStr);
  const day = d.getDate(); // Feb
  if (day <= 7)  return 'Week 1\nFeb 3–7';
  if (day <= 12) return 'Week 2\nFeb 8–12';
  if (day <= 17) return 'Week 3\nFeb 13–17';
  if (day <= 22) return 'Week 4\nFeb 18–22';
  return            'Week 5\nFeb 23–27';
}

// Tool → category
function toolCategory(name) {
  if (['Read','Grep','Glob'].includes(name))               return 'Explore';
  if (['Edit','Write','NotebookEdit'].includes(name))      return 'Build';
  if (name === 'Bash')                                     return 'Execute';
  if (['Task','TaskCreate','TaskUpdate','TaskGet','TaskList','TaskOutput','TaskStop'].includes(name)) return 'Plan';
  if (name.startsWith('mcp__makerkit'))                    return 'Schema';
  if (['WebFetch','WebSearch'].includes(name))             return 'Research';
  if (['EnterPlanMode','ExitPlanMode','AskUserQuestion'].includes(name)) return 'Plan';
  return null; // skip
}

// File path → area
function fileArea(path) {
  if (!path) return null;
  const p = path.replace(/\\/g, '/');
  if (p.includes('apps/web/app'))                       return 'App Pages';
  if (p.includes('packages/features'))                  return 'Packages';
  if (p.includes('specs/') || p.includes('/specs'))     return 'Specs';
  if (p.includes('schemas/') || p.includes('migrations/')) return 'DB / Schema';
  if (p.includes('apps/web/public'))                    return 'i18n / Assets';
  if (p.includes('packages/ui') || p.includes('packages/supabase') || p.includes('packages/next')) return 'Core Packages';
  return null;
}

// Build flow: week → toolCat, and week → fileArea, toolCat → fileArea
const weekTool = {}; // "Week1|Explore" → count
const weekFile = {}; // "Week1|App Pages" → count
const toolFile = {}; // "Explore|App Pages" → count

for (const s of sessions) {
  const week = getWeek(s.startTime);
  if (!week) continue;

  // Tool calls
  for (const [tool, count] of Object.entries(s.toolCalls)) {
    const cat = toolCategory(tool);
    if (!cat) continue;
    const k = `${week}|||${cat}`;
    weekTool[k] = (weekTool[k] || 0) + count;
  }

  // File edits → week→area and tool→area
  // For tool→area linkage, use edit count as proxy for Build category
  for (const [filepath, count] of Object.entries(s.filesEdited)) {
    const area = fileArea(filepath);
    if (!area) continue;
    const kw = `${week}|||${area}`;
    weekFile[kw] = (weekFile[kw] || 0) + count;
    // Build→area (edits always from Build)
    const kt = `Build|||${area}`;
    toolFile[kt] = (toolFile[kt] || 0) + count;
  }
  // Read → area
  for (const [filepath, count] of Object.entries(s.filesRead)) {
    const area = fileArea(filepath);
    if (!area) continue;
    const kt = `Explore|||${area}`;
    toolFile[kt] = (toolFile[kt] || 0) + count;
  }
}

// Convert to Sankey nodes + links
const weeks = ['Week 1\nFeb 3–7','Week 2\nFeb 8–12','Week 3\nFeb 13–17','Week 4\nFeb 18–22','Week 5\nFeb 23–27'];
const toolCats = ['Explore','Build','Execute','Plan','Schema','Research'];
const fileAreas = ['App Pages','Packages','Specs','DB / Schema','i18n / Assets','Core Packages'];

const nodes = [
  ...weeks.map(w => ({ id: w, group: 0, label: w })),
  ...toolCats.map(t => ({ id: t, group: 1, label: t })),
  ...fileAreas.map(f => ({ id: f, group: 2, label: f })),
];
const nodeIndex = Object.fromEntries(nodes.map((n,i) => [n.id, i]));

const links = [];
for (const [k, v] of Object.entries(weekTool)) {
  const [src, tgt] = k.split('|||');
  if (nodeIndex[src] !== undefined && nodeIndex[tgt] !== undefined && v > 0)
    links.push({ source: nodeIndex[src], target: nodeIndex[tgt], value: v });
}
for (const [k, v] of Object.entries(toolFile)) {
  const [src, tgt] = k.split('|||');
  if (nodeIndex[src] !== undefined && nodeIndex[tgt] !== undefined && v > 0)
    links.push({ source: nodeIndex[src], target: nodeIndex[tgt], value: v });
}

const result = { nodes, links };
writeFileSync('C:/Users/jebus/claude-sankey.json', JSON.stringify(result, null, 2));
console.log('Nodes:', nodes.length, '| Links:', links.length);
console.log('Top week→tool flows:');
Object.entries(weekTool).sort((a,b)=>b[1]-a[1]).slice(0,8).forEach(([k,v]) => console.log(' ', v, k));
console.log('Top tool→file flows:');
Object.entries(toolFile).sort((a,b)=>b[1]-a[1]).slice(0,8).forEach(([k,v]) => console.log(' ', v, k));
