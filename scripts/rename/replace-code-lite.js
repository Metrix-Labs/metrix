#!/usr/bin/env node
/*
 * Lightweight code content replacement for Strapi -> Metrix.
 * Targets: .js, .jsx, .ts, .tsx
 * Applies safe string-level replacements for import sources, paths, and env vars.
 *
 * Usage:
 *   node scripts/rename/replace-code-lite.js --dry
 *   node scripts/rename/replace-code-lite.js
 */

const path = require('node:path');
const fsp = require('node:fs/promises');

const args = new Set(process.argv.slice(2));
const isDry = args.has('--dry') || args.has('-n');
const cwd = process.cwd();

const IGNORED_DIRS = new Set(['node_modules', '.git', '.yarn', 'dist', 'build', 'coverage']);
const TARGET_EXTS = new Set(['.js', '.jsx', '.ts', '.tsx']);

const log = (...a) => console.log('[code]', ...a);

function replaceAll(content) {
  let next = content;
  // Scoped packages
  next = next.replaceAll('@metrix/metrix', '@metrix/metrix');
  next = next.replaceAll('@metrix/', '@metrix/');
  // Relative path segments
  next = next.replaceAll('/metrix/', '/metrix/');
  // Env vars
  next = next.replaceAll(/process\.env\.STRAPI_/g, 'process.env.METRIX_');
  // CLI names in scripts
  next = next.replaceAll(/\bcreate-metrix-app\b/g, 'create-metrix-app');
  next = next.replaceAll(/\bcreate-metrix\b/g, 'create-metrix');
  // In plain code strings referring to bin
  next = next.replaceAll(/\bstrapi\b/g, 'metrix');
  return next;
}

async function walk(dirRel, out) {
  const dirAbs = path.join(cwd, dirRel);
  const entries = await fsp.readdir(dirAbs, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.isDirectory()) {
      if (IGNORED_DIRS.has(ent.name)) continue;
      await walk(path.join(dirRel, ent.name), out);
    } else if (ent.isFile()) {
      const ext = path.extname(ent.name).toLowerCase();
      if (TARGET_EXTS.has(ext)) out.push(path.join(dirRel, ent.name));
    }
  }
}

async function processFile(rel) {
  const abs = path.join(cwd, rel);
  const before = await fsp.readFile(abs, 'utf8');
  const after = replaceAll(before);
  if (before !== after) {
    log(`${isDry ? 'Would update' : 'Updating'} ${rel}`);
    if (!isDry) await fsp.writeFile(abs, after, 'utf8');
  }
}

async function main() {
  const files = [];
  await walk('.', files);
  for (const rel of files) {
    await processFile(rel);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
