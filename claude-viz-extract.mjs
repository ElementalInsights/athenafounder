import { createReadStream } from 'fs';
import { readdir, stat } from 'fs/promises';
import { createInterface } from 'readline';
import { join } from 'path';

const DIR = 'C:/Users/jebus/.claude/projects/C--Projects-athenaforms-master-plan';

async function parseSession(filePath) {
  const fileStats = await stat(filePath);
  const session = {
    id: filePath.split('/').pop().replace('.jsonl', ''),
    slug: null,
    gitBranch: null,
    startTime: null,
    endTime: null,
    fileSizeBytes: fileStats.size,
    userMessages: 0,
    assistantMessages: 0,
    compactBoundaries: 0,
    compactPositions: [],   // 0-1 normalized position in session
    turnDurations: [],      // ms
    toolCalls: {},
    filesRead: {},
    filesEdited: {},
    apiErrors: 0,
    totalRecords: 0,
    linesWritten: 0,   // lines in new_string (Edit) + content (Write)
  };

  return new Promise((resolve) => {
    const rl = createInterface({ input: createReadStream(filePath), crlfDelay: Infinity });
    let recordCount = 0;

    rl.on('line', (line) => {
      if (!line.trim()) return;
      recordCount++;
      try {
        const obj = JSON.parse(line);
        session.totalRecords = recordCount;

        // Timestamps
        if (obj.timestamp) {
          if (!session.startTime || obj.timestamp < session.startTime) session.startTime = obj.timestamp;
          if (!session.endTime || obj.timestamp > session.endTime) session.endTime = obj.timestamp;
        }

        // Slug + branch
        if (obj.slug && !session.slug) session.slug = obj.slug;
        if (obj.gitBranch && !session.gitBranch) session.gitBranch = obj.gitBranch;

        // Message counts
        if (obj.type === 'user' && obj.message?.role === 'user') session.userMessages++;
        if (obj.type === 'assistant' && obj.message?.role === 'assistant') session.assistantMessages++;

        // System events
        if (obj.type === 'system') {
          if (obj.subtype === 'compact_boundary') {
            session.compactBoundaries++;
            session.compactPositions.push(recordCount);
          }
          if (obj.subtype === 'turn_duration' && obj.durationMs) {
            session.turnDurations.push(obj.durationMs);
          }
          if (obj.subtype === 'api_error') session.apiErrors++;
        }

        // Tool calls
        if (obj.type === 'assistant' && Array.isArray(obj.message?.content)) {
          for (const block of obj.message.content) {
            if (block.type === 'tool_use') {
              const name = block.name;
              session.toolCalls[name] = (session.toolCalls[name] || 0) + 1;

              // Track files read/edited
              if (name === 'Read' && block.input?.file_path) {
                const f = block.input.file_path.replace('C:\\Projects\\athenaforms-master-plan\\', '');
                session.filesRead[f] = (session.filesRead[f] || 0) + 1;
              }
              if ((name === 'Edit' || name === 'Write') && block.input?.file_path) {
                const f = block.input.file_path.replace('C:\\Projects\\athenaforms-master-plan\\', '');
                session.filesEdited[f] = (session.filesEdited[f] || 0) + 1;
                // Count lines written
                const text = name === 'Edit' ? (block.input.new_string || '') : (block.input.content || '');
                session.linesWritten += (text.match(/\n/g) || []).length + (text.length > 0 ? 1 : 0);
              }
            }
          }
        }
      } catch (e) {}
    });

    rl.on('close', () => {
      session.totalRecords = recordCount;
      // Normalize compact positions to 0-1
      session.compactPositions = session.compactPositions.map(p => 
        recordCount > 0 ? p / recordCount : 0
      );
      resolve(session);
    });
  });
}

async function main() {
  const files = (await readdir(DIR))
    .filter(f => f.endsWith('.jsonl'))
    .map(f => join(DIR, f));

  console.error(`Processing ${files.length} sessions...`);
  
  const sessions = [];
  for (let i = 0; i < files.length; i++) {
    process.stderr.write(`  [${i+1}/${files.length}] ${files[i].split('/').pop().substring(0,8)}... `);
    const s = await parseSession(files[i]);
    sessions.push(s);
    process.stderr.write(`✓ (${Math.round(s.fileSizeBytes/1024)}KB, ${s.totalRecords} records, ${s.compactBoundaries} compacts)\n`);
  }

  // Sort by start time
  sessions.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  console.log(JSON.stringify(sessions, null, 2));
}

main().catch(console.error);
