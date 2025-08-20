#!/usr/bin/env node
/*
 * Rename all files and directories containing "metrix" to "metrix".
 *
 * Usage:
 *   node scripts/rename/rename-metrix-to-metrix.js --dry   # preview
 *   node scripts/rename/rename-metrix-to-metrix.js         # apply
 */

const path = require('node:path');
const fsp = require('node:fs/promises');

const args = new Set(process.argv.slice(2));
const isDry = args.has('--dry') || args.has('-n');

const cwd = process.cwd();

const IGNORED_DIRS = new Set(['node_modules', '.git', '.yarn', 'dist', 'build', 'coverage']);
const IGNORED_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.zip', '.tgz', '.ico', '.lock']);

const log = (...a) => console.log('[rename]', ...a);
const warn = (...a) => console.warn('[rename][warn]', ...a);

/** Compute next path by replacing all occurrences of "metrix" with "metrix" */
function computeNextPath(relPath) {
  return relPath.replace(/metrix/g, 'metrix');
}

async function movePath(relPath) {
  const nextRelPath = computeNextPath(relPath);
  if (nextRelPath === relPath) return false;

  const src = path.join(cwd, relPath);
  const dest = path.join(cwd, nextRelPath);

  // If source no longer exists (likely moved with a parent directory), skip
  try {
    await fsp.access(src);
  } catch {
    return false;
  }

  try {
    await fsp.access(dest);
    warn('destination already exists, skipping:', nextRelPath);
    return false;
  } catch {}

  log(isDry ? 'would move' : 'moving', relPath, '->', nextRelPath);
  if (!isDry) {
    await fsp.mkdir(path.dirname(dest), { recursive: true });
    await fsp.rename(src, dest);
  }
  return true;
}

async function walk(relDir, paths) {
  const absDir = path.join(cwd, relDir);
  const entries = await fsp.readdir(absDir, { withFileTypes: true });
  for (const ent of entries) {
    const name = ent.name;
    if (ent.isDirectory()) {
      if (IGNORED_DIRS.has(name)) continue;
      const childRel = path.join(relDir, name);
      paths.push({ rel: childRel, isDir: true });
      await walk(childRel, paths);
    } else if (ent.isFile()) {
      const ext = path.extname(name).toLowerCase();
      if (IGNORED_EXTS.has(ext)) continue;
      const childRel = path.join(relDir, name);
      paths.push({ rel: childRel, isDir: false });
    }
  }
}

async function main() {
  const discovered = [];
  await walk('.', discovered);

  // Directories deepest-first
  const dirs = discovered.filter((e) => e.isDir && e.rel.includes('metrix'));
  dirs.sort((a, b) => b.rel.split(/[\\/]/).length - a.rel.split(/[\\/]/).length);

  let movedCount = 0;
  for (const d of dirs) {
    const changed = await movePath(d.rel);
    if (changed) movedCount += 1;
  }

  // Files next
  const files = discovered.filter((e) => !e.isDir && e.rel.includes('metrix'));
  for (const f of files) {
    const changed = await movePath(f.rel);
    if (changed) movedCount += 1;
  }

  log(`${isDry ? 'Would move' : 'Moved'} ${movedCount} path(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});


