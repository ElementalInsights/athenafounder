#!/usr/bin/env node
// deploy.mjs — build + push to gh-pages branch
import { execSync } from 'child_process';
import { copyFileSync } from 'fs';

const run = cmd => execSync(cmd, { stdio: 'inherit' });

// 1. Build
run('node build-site.mjs');

// 2. Sync dist/ into a worktree on gh-pages
run('git worktree add ../athenafounder-deploy gh-pages');

try {
  copyFileSync('dist/index.html',     '../athenafounder-deploy/index.html');
  copyFileSync('dist/athena-logo.png','../athenafounder-deploy/athena-logo.png');

  run('git -C ../athenafounder-deploy add index.html athena-logo.png');
  const status = execSync('git -C ../athenafounder-deploy status --porcelain').toString().trim();
  if (!status) {
    console.log('\n✓ gh-pages already up to date — nothing to deploy');
  } else {
    run('git -C ../athenafounder-deploy commit -m "deploy: update site"');
    run('git -C ../athenafounder-deploy push origin gh-pages');
    console.log('\n✓ Deployed to gh-pages');
  }
} finally {
  run('git worktree remove ../athenafounder-deploy --force');
}
